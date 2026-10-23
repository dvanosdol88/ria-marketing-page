import {extractPhrases} from './extract.mjs';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {request} from 'node:http';

const [siteArg,output,externalPort,toolingArg]=process.argv.slice(2), site=resolve(siteArg);
const require=createRequire(join(resolve(toolingArg||site),'package.json'));
const {chromium}=require('playwright');
const records=new Set(), errors=[];
async function files(dir) {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir,entry.name);
    if(entry.isDirectory()) result.push(...await files(path)); else result.push(path);
  }
  return result;
}
const paths=new Set(['/','/__wording_check_missing_page__','/become-a-client/confirmation?agreement=sent']);
for(const file of await files(join(site,'src/app'))) {
  if(!/\/page\.[jt]sx?$/.test(file))continue;
  let route=file.slice(join(site,'src/app').length).replace(/\/page\.[jt]sx?$/,'').replace(/\/\([^/]+\)/g,'')||'/';
  if(route.includes('[')) throw new Error(`A dynamic page requires explicit coverage: ${route}`);
  paths.add(route);
}
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=externalPort?Number(externalPort):server.address().port;await new Promise(r=>server.close(r));
const child=externalPort?null:spawn(process.execPath,[join(site,'node_modules/next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(port)],{cwd:site,stdio:['ignore','pipe','pipe'],env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
let log='';for(const stream of [child?.stdout,child?.stderr].filter(Boolean))stream.on('data',x=>{log=(log+x).slice(-10000);});
function get(path,host){return new Promise((yes,no)=>{const req=request({hostname:'127.0.0.1',port,path,headers:{host},timeout:15000},res=>{let text='';res.on('data',x=>text+=x);res.on('end',()=>yes({status:res.statusCode,location:res.headers.location,text}));});req.on('error',no);req.on('timeout',()=>req.destroy(new Error('Page timed out')));req.end();});}
let browser;
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{browser?.close().catch(()=>{});child?.kill('SIGTERM');process.exit(143);});
try{
  let ready=false;
  for(let i=0;i<90;i++){
    if(child && child.exitCode!==null)throw new Error(`Built site stopped: ${log}`);
    try{await get('/','youarepayingtoomuch.com');ready=true;break;}catch{}
    await new Promise(r=>setTimeout(r,500));
  }
  if(!ready)throw new Error('Built site did not start.');
  browser=await chromium.launch({headless:true});
  // Every canonical and alias host is checked. Only local GETs are permitted;
  // analytics, live APIs, form writes and external redirects never reach the net.
  const hosts=['youarepayingtoomuch.com','www.youarepayingtoomuch.com','onepercentblues.com','www.onepercentblues.com','1percentblues.com','www.1percentblues.com'];
  for(const host of hosts){
    for(const path of [...paths].sort()){
      const response=await get(path,host), target=`${host}${path}`;console.log(`Reading ${target}`);
      if(response.status>=500)throw new Error(`Built page failed: ${target}`);
      if(response.status>=300&&response.status<400){records.add(`${target} redirect ${response.status} ${response.location}`);continue;}
      for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
        const context=await browser.newContext({viewport,reducedMotion:'reduce',locale:'en-US',timezoneId:'America/New_York',serviceWorkers:'block'});
        const page=await context.newPage();
        // Freeze clock and randomness so dependency-only changes do not change
        // dates, animation IDs or the calculator's initial example.
        await page.addInitScript(()=>{const OriginalDate=Date;window.Date=class extends OriginalDate{constructor(...args){super(...(args.length?args:['2026-10-01T12:00:00Z']));}static now(){return OriginalDate.now();}};Math.random=()=>0.5;});
        await context.route('**/*',async route=>{
          const req=route.request(), url=new URL(req.url());
          if(url.hostname!=='127.0.0.1'||url.port!==String(port))return route.abort();
          if(req.method()!=='GET')return route.fulfill({status:503,contentType:'application/json',body:'{"error":"Wording check: submission disabled"}'});
          if(url.pathname.startsWith('/api/'))return route.fulfill({status:503,contentType:'application/json',body:'{"error":"Wording check: network disabled"}'});
          const res=await get(url.pathname+url.search,host);
          if(res.status>=300&&res.status<400)return route.fulfill({status:200,contentType:'text/html',body:'<html><body></body></html>'});
          // Use the browser's normal fetch for assets, preserving content type.
          if(req.resourceType()!=='document')return route.continue({headers:{...req.headers(),host,'x-forwarded-host':host}});
          return route.fulfill({status:res.status,contentType:'text/html',body:res.text});
        });
        await page.goto(`http://127.0.0.1:${port}${path}`,{waitUntil:'networkidle',timeout:30000});
        await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}'});
        await page.waitForTimeout(1600);
        const prefix=target;
        async function collect(state='initial'){
          const phrases=await page.evaluate(extractPhrases);
          const counts=new Map();for(const phrase of phrases)counts.set(phrase,(counts.get(phrase)||0)+1);
          for(const [phrase,count] of counts)records.add(`${prefix} | ${viewport.width===390?'phone':'desktop'} | ${state} | ${phrase} (${count})`);
        }
        await collect();
        // Explore text-bearing controls without sending forms or navigating.
        // Discover new buttons after each pass so dialogs, tabs and disclosures
        // introduced by a prior click are captured too. A hard cap fails closed.
        const seen=new Set();
        for(let pass=0;pass<5;pass++){
          const buttons=await page.locator('button:not([type=submit]),summary,[role=tab]').all();
          let clicked=0;
          for(const button of buttons){
            const label=((await button.getAttribute('aria-label'))||await button.innerText()).trim();
            const key=await button.evaluate(el=>{window.__wordingControlCount ||=0;return el.dataset.wordingControl ||= String(++window.__wordingControlCount);});
            if(!label||seen.has(key)||/^(\+|−|-)$/.test(label)||/^(Increase|Decrease)\b/.test(label))continue;
            if(seen.size>150)throw new Error(`Too many states to check: ${target}`);
            if(!await button.isVisible()||!await button.isEnabled())continue;
            try{await button.click({timeout:1500,noWaitAfter:true});}catch(error){if(!/not attached|not visible/.test(error.message))throw error;continue;}
            seen.add(key);await page.waitForTimeout(1600);await collect(`after choosing ${label} (${key})`);clicked++;
            if(await page.locator('[role=dialog]').count())await page.keyboard.press('Escape');
          }
          if(!clicked)break;
          if(pass===4)throw new Error(`Control exploration did not finish: ${target}`);
        }
        // Trigger native validation and local error wording without writing data.
        for(const select of await page.locator('select').all()){
          const name=await select.getAttribute('name')||'choice';
          for(const value of await select.locator('option').evaluateAll(options=>options.map(x=>x.value))){
            await select.selectOption(value);await collect(`after selecting ${name} ${value}`);
          }
        }
        await page.locator('form').evaluateAll(forms=>forms.forEach(f=>{f.reportValidity();f.noValidate=true;f.requestSubmit();}));await collect('while submitting');await page.waitForTimeout(100);await collect('after failed submission');
        await context.close();
      }
    }
    if(externalPort && host==='youarepayingtoomuch.com'){
      for(const body of ['{', '{}', JSON.stringify({fullName:'Wording check',email:'invalid'}),JSON.stringify({fullName:'Wording check',email:'check@example.invalid',state:'invalid'})]){
        const response=await new Promise((yes,no)=>{const req=request({hostname:'127.0.0.1',port,path:'/api/become-a-client',method:'POST',headers:{host,'content-type':'application/json'}},res=>{let text='';res.on('data',x=>text+=x);res.on('end',()=>yes({status:res.statusCode,text}));});req.on('error',no);req.end(body);});
        if(response.status!==400)throw new Error('Invalid form input must be refused before any write.');
        records.add(`Form validation | ${JSON.parse(response.text).error}`);
      }
    }
    for(const path of ['/llms.txt','/robots.txt','/site.webmanifest']){
      const res=await get(path,host);if(res.status>=500)throw new Error(`Text resource failed: ${host}${path}`);
      if(res.status===200)records.add(`${host}${path} ${res.text.replace(/\s+/g,' ').trim()}`);
    }
  }
  await writeFile(output,JSON.stringify({version:1,records:[...records].sort(),errors},null,2));
  console.log(`Captured ${records.size} wording records across ${paths.size} routes and all six hosts.`);
}finally{
  await browser?.close();if(child)child.kill('SIGTERM');
  await new Promise(resolve=>{if(!child||child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(()=>child.kill('SIGKILL'),5000).unref();});
}
