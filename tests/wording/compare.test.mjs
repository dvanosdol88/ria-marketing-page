import test from 'node:test';
import assert from 'node:assert/strict';
import {compare,authorize,digestProposal} from '../../scripts/wording/compare.mjs';
const snapshot=records=>({version:1,records,errors:[]});
const repository='dvanosdol88/ria-marketing-page';
test('identical rendered wording passes without calling an approval service',async()=>{
 const diff=compare(snapshot(['home text Hello','home alt Logo']),snapshot(['home alt Logo','home text Hello']),repository,1);
 assert.equal(diff.changed,false);
 assert.equal((await authorize(diff,null,()=>{throw Error('must not call')})).approved,true);
});
test('one visible word, metadata or alt change blocks without David',async()=>{
 for(const changed of ['home text Goodbye','home meta title New','home alt New logo']){
  const diff=compare(snapshot(['home text Hello']),snapshot([changed]),repository,1);
  assert.equal(diff.changed,true);assert.equal((await authorize(diff,null)).approved,false);
 }
});
test('only exact runtime evidence can approve a changed proposal',async()=>{
 const diff=compare(snapshot(['old']),snapshot(['new']),repository,4),card='11111111-1111-1111-1111-111111111111';
 assert.equal(diff.digest,digestProposal(diff));
 const response=proof=>async()=>({ok:true,json:async()=>proof});
 assert.equal((await authorize(diff,card,response({approved:true,repository,pull:4,digest:diff.digest}))).approved,true);
 for(const proof of [{approved:true},{approved:'true',repository,pull:4,digest:diff.digest},{approved:true,repository,pull:5,digest:diff.digest},{approved:true,repository,pull:4,digest:'bad'}])assert.equal((await authorize(diff,card,response(proof))).approved,false);
 await assert.rejects(authorize(diff,card,response(null)));
 await assert.rejects(authorize(diff,card,async()=>({ok:false})));
});
test('missing or partial snapshots and large unreviewable proposals fail closed',async()=>{
 for(const bad of [snapshot([]),{version:1,records:['word'],errors:['failed page']},{}])assert.throws(()=>compare(bad,snapshot(['new']),repository,1));
 const diff=compare(snapshot(['x'.repeat(6100)]),snapshot(['new']),repository,1);
 assert.equal((await authorize(diff,'11111111-1111-1111-1111-111111111111')).approved,false);
});
test('repeated states form one complete wording proposal, without hiding state-only changes',()=>{
 const old=snapshot(['home | phone | initial | text Old (1)','home | desktop | initial | text Old (1)']);
 const next=snapshot(['home | phone | initial | text New (1)','home | desktop | initial | text New (1)']);
 const diff=compare(old,next,repository,1);assert.equal(diff.before,'On https://home: Words: Old (shown 1 times)');assert.equal(diff.after,'On https://home: Words: New (shown 1 times)');
 const moved=compare(snapshot(['home | phone | initial | text Old (1)']),snapshot(['home | phone | after choice | text Old (1)']),repository,1);assert.equal(moved.changed,true);assert.notEqual(moved.before,moved.after);
 const removed=compare(snapshot(['home | phone | initial | text Old (2)']),snapshot(['home | phone | initial | text Old (1)']),repository,1);assert.notEqual(removed.before,removed.after);
});
