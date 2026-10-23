// Wording exploration is independent of layout. A transformed off-screen or covered menu
// control may be logically active while a pointer cannot reach its hit box.
// Invoke its actual click handler in that one case; never ignore a failed read.
export async function clickWordingControl(control, timeout=1500) {
 try{await control.click({timeout,noWaitAfter:true});}
 catch(error){
  if(/not attached|not visible/.test(error.message))return false;
  if(!/outside of the viewport|intercepts pointer events/.test(error.message))throw error;
  await control.evaluate(element=>element.click());
 }
 return true;
}
