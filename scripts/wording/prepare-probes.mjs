// Build-only routes in the isolated comparison copy. Never run by the site's
// production build. They render the real loading/error components so wording
// hidden behind an otherwise rare crash is still compared before publication.
import {readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
export async function prepareProbes(site) {
 const app=join(resolve(site),'src/app'),found=[];
 async function visit(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  const full=join(dir,entry.name);if(entry.isDirectory()){if(entry.name!=='wording-proof')await visit(full);}
  else if(/^(error|global-error|loading)\.[jt]sx?$/.test(entry.name))found.push(full);
 }}await visit(app);
 const routes=[];
 for(const file of found.sort()){
  const name=relative(app,file).replaceAll('\\','/'),slug=name.replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase();
  const dir=join(app,'wording-proof',slug);await mkdir(dir,{recursive:true});
  const imported='@/app/'+name.replace(/\.[jt]sx?$/,'');
  const props=/loading\.[jt]sx?$/.test(file)?'':' error={new Error("Website wording comparison")} reset={() => {}}';
  await writeFile(join(dir,'page.tsx'),`"use client";\nimport Panel from ${JSON.stringify(imported)};\nexport default function WordingProof(){return <Panel${props}/>;}\n`);
  routes.push('/wording-proof/'+slug);
 }return routes;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await prepareProbes(process.argv[2])));
