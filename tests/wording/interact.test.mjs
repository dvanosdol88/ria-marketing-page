import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {clickWordingControl} from '../../scripts/wording/interact.mjs';
test('off-screen active controls still expose their wording without enforcing a layout change',async()=>{
 const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage();await page.setContent('<button style="position:fixed;left:-5000px" onclick="document.querySelector(\'p\').hidden=false">Close menu</button><p hidden>Additional disclosure</p>');assert.equal(await clickWordingControl(page.locator('button'),100),true);assert.equal(await page.locator('p').isVisible(),true);}
 finally{await browser.close();}
});
