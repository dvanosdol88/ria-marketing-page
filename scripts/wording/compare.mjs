import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function digestProposal({repository, pull, before, after}) {
  return createHash('sha256').update(JSON.stringify({repository,pull,before,after})).digest('hex');
}
// Snapshots contain phrases with their page/state/attribute. Compare the built
// result, never a filename allowlist. Sorting ignores layout and DOM ordering.
export function compare(before, after, repository, pull) {
  for (const snapshot of [before,after]) {
    if (snapshot.version !== 1 || !Array.isArray(snapshot.records) || !snapshot.records.length
      || snapshot.records.some(x => typeof x !== 'string') || snapshot.errors?.length)
      throw new Error('Incomplete wording snapshot; publication stays blocked.');
  }
  const old = new Set(before.records), current = new Set(after.records);
  const removed = [...old].filter(x=>!current.has(x)).sort();
  const added = [...current].filter(x=>!old.has(x)).sort();
  // Repeated identical words across phone/desktop/control states are one
  // editorial proposal per page, while occurrence counts stay in each phrase.
  // If grouping would conceal a state-only change, retain the full detail.
  const group=items=>[...new Set(items.map(x=>{const parts=x.split(' | ');return parts.length===4?`${parts[0]} | ${parts[3]}`:x;}))].sort();
  let previous=group(removed), proposed=group(added);
  if(JSON.stringify(previous)===JSON.stringify(proposed)){previous=removed;proposed=added;}
  const describe=items=>items.length?items.map(value=>value.replace(/^([^ |]+) \| /,'On https://$1: ').replace(/\btext /,'Words: ').replace(/\bmeta description /,'Search description: ').replace(/\bmeta og:title /,'Social preview title: ').replace(/\btitle /,'Page title: ').replace(/\balt /,'Image description: ').replace(/\baria-label /,'Screen reader label: ').replace(/ \((\d+)\)$/,' (shown $1 times)')).join('\n'):'No wording.';
  const proposal = {repository,pull,before:describe(previous),after:describe(proposed)};
  return {changed:!!(removed.length||added.length),...proposal,digest:digestProposal(proposal),removed,added};
}
export async function authorize(diff, cardId, fetcher=fetch) {
  if (!diff.changed) return {approved:true,reason:'All captured website wording is unchanged.'};
  if (!cardId || !/^[a-f0-9-]{36}$/.test(cardId)) return {approved:false,reason:'David has not approved these words on a named Rack card.'};
  if (diff.before.length>6000 || diff.after.length>6000) return {approved:false,reason:'The complete wording proposal is too large for the current approval form. Keep this change unpublished.'};
  const url=new URL('https://www.dvo88.com/api/rack/wording-approval');
  for (const key of ['repository','pull','digest']) url.searchParams.set(key,String(diff[key]));
  url.searchParams.set('cardId',cardId);
  const response=await fetcher(url,{signal:AbortSignal.timeout(20000),redirect:'error',cache:'no-store'});
  if (!response.ok) throw new Error('The approval record could not be checked; publication stays blocked.');
  const proof=await response.json();
  return {approved:proof.approved===true && proof.repository===diff.repository && proof.pull===diff.pull && proof.digest===diff.digest,
    reason:proof.approved===true?'David approved this exact wording.':'David has not approved this exact wording.',proofUrl:proof.proofUrl};
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const [oldPath,newPath,output,repository,pullString,cardId]=process.argv.slice(2);
  const pull=Number(pullString);
  if (!/^[\w-]+\/[\w.-]+$/.test(repository||'') || !Number.isSafeInteger(pull)||pull<1) throw new Error('An exact website pull request is required.');
  const diff=compare(JSON.parse(await readFile(oldPath)),JSON.parse(await readFile(newPath)),repository,pull);
  await writeFile(output,JSON.stringify(diff,null,2));
  const result=await authorize(diff,cardId);
  console.log(JSON.stringify({...result,digest:diff.digest,changed:diff.changed}));
  if (!result.approved) process.exitCode=1;
}
