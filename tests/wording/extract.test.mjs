import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {extractPhrases} from '../../scripts/wording/extract.mjs';
test('browser wording preserves duplicate phrases and ignores unchanged inline markup',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const read=async html=>{await page.setContent(html);return page.evaluate(extractPhrases);};
  const original=await read('<h1>Hello world</h1><p>Same words</p><p>Same words</p>');
  const wrapped=await read('<h1>Hello <span>world</span></h1><p>Same <b>words</b></p><p>Same words</p>');
  assert.deepEqual(wrapped,original);assert.equal(original.filter(x=>x==='text Same words').length,2);
  const metadata=await read('<title>Old title</title><meta name="description" content="Old description"><meta name="sentry-trace" content="random"><img alt="A useful image"><p>Wording</p>');
  assert(metadata.includes('title Old title'));assert(metadata.includes('meta description Old description'));assert(metadata.includes('alt A useful image'));assert(!metadata.some(x=>x.includes('random')));
 }finally{await browser.close();}
});
