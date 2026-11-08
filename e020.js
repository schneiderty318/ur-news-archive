'use strict';
(()=>{
 const $=id=>document.getElementById(id);let level=0;
 const bytes=text=>Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-text.length%4)%4)),c=>c.charCodeAt(0));
 async function unlock(code,remember=true){
  const status=$('study-status');
  if(!window.crypto?.subtle){status.textContent='Secure reading is unavailable here. Open this manual from the HTTPS library website.';return;}
  try{
   const key=await crypto.subtle.importKey('raw',bytes(code),{name:'AES-GCM'},false,['decrypt']);
   for(const tier of [60,30,10]){
    const record=window.E020_STUDY[String(tier)];let text;
    try{const result=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(record.iv),additionalData:new TextEncoder().encode(String(tier))},key,bytes(record.data));text=new TextDecoder().decode(result);}catch{continue;}
    if(tier<level){status.textContent='Your '+level+'-minute material is already unlocked. This code opens an earlier milestone.';return;}
    level=tier;$('manual-content').innerHTML=text;$('manual-content').hidden=false;$('lock-manual').hidden=false;$('study-code').value='';
    status.textContent=tier+'-minute study material unlocked, including earlier milestones.';
    if(remember)try{localStorage.setItem('e020-study-access-v1',code);}catch{}
    return;
   }
  }catch{}
  status.textContent='That code did not unlock this edition. Check the code with your DM and try again.';
 }
 $('unlock-form').onsubmit=async e=>{e.preventDefault();await unlock($('study-code').value.trim());};
 $('lock-manual').onclick=()=>{level=0;$('manual-content').replaceChildren();$('manual-content').hidden=true;$('lock-manual').hidden=true;$('study-code').value='';$('study-status').textContent='Study material is locked.';try{localStorage.removeItem('e020-study-access-v1');}catch{}};
 try{const saved=localStorage.getItem('e020-study-access-v1');if(saved)unlock(saved,false);}catch{}
})();
