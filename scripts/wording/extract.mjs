// Runs in the browser. Inline markup is grouped into its containing phrase so
// wrapping an unchanged word in a span does not look like an editorial change.
export function extractPhrases() {
  const normalize=s=>String(s||'').replace(/\s+/g,' ').trim(), out=[], visited=new Set();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.parentElement.closest('script,style,noscript,nextjs-portal'))continue;
    const group=node.parentElement.closest('p,h1,h2,h3,h4,h5,h6,button,label,li,summary,option,td,th,figcaption,legend,div,section,main')||node.parentElement;
    if(visited.has(group))continue;visited.add(group);
    const text=normalize(group.textContent);if(text)out.push(`text ${text}`);
  }
  for(const el of document.querySelectorAll('[alt],[aria-label],[title],[placeholder],input[type=submit],input[type=button],meta[name],meta[property],title')){
    if(el.tagName==='META') {const name=el.getAttribute('name')||el.getAttribute('property');if(!['viewport','sentry-trace','baggage'].includes(name))out.push(`meta ${name} ${normalize(el.getAttribute('content'))}`);}
    else if(el.tagName==='TITLE')out.push(`title ${normalize(el.textContent)}`);
    else for(const attr of ['alt','aria-label','title','placeholder',...(['submit','button'].includes(el.type)?['value']:[])])if(el.hasAttribute(attr))out.push(`${attr} ${normalize(el.getAttribute(attr))}`);
  }
  for(const script of document.querySelectorAll('script[type="application/ld+json"]'))out.push(`search data ${normalize(script.textContent)}`);
  return out;
}
