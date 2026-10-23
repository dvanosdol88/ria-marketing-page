import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareProbes} from '../../scripts/wording/prepare-probes.mjs';
test('isolated built probes cover actual error/loading components and are repeatable',async()=>{
 const root=await mkdtemp(join(tmpdir(),'wording-probes-'));
 try{
  await mkdir(join(root,'src/app/(site)'),{recursive:true});
  await writeFile(join(root,'src/app/(site)/error.tsx'),'export default function Error(){return <p>A real error message</p>}');
  await writeFile(join(root,'src/app/global-error.tsx'),'export default function Error(){return <p>A global error message</p>}');
  await writeFile(join(root,'src/app/(site)/loading.tsx'),'export default function Loading(){return <p>Loading words</p>}');
  const first=await prepareProbes(root);assert.equal(first.length,3);assert.deepEqual(await prepareProbes(root),first);
  const page=await readFile(join(root,'src/app',first.find(x=>x.includes('global-error')),'page.tsx'),'utf8');
  assert.match(page,/@\/app\/global-error/);assert.match(page,/reset=/);
  const loading=await readFile(join(root,'src/app',first.find(x=>x.includes('loading')),'page.tsx'),'utf8');assert(!loading.includes('reset='));
 }finally{await rm(root,{recursive:true,force:true});}
});
