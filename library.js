'use strict';
(()=>{
const {sections,books}=window.LIBRARY_CATALOG;
const $=id=>document.getElementById(id),size=12;
let shelf='',page=1,selected=null,opener=null;
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const sectionFor=b=>sections.find(s=>s.code===b.section);
function routeTo(hash){history.pushState(null,'','#'+hash);route();}
function renderShelves(){
 $('shelves').replaceChildren();
 for(const s of [{code:'',name:'All shelves'},...sections]){
  const button=el('button',undefined,'shelf');button.type='button';button.setAttribute('aria-current',String(shelf===s.code));
  button.append(el('span',s.name),el('span',String(s.code?books.filter(b=>b.section===s.code).length:books.length),'shelf-count'));
  button.onclick=()=>{$('search').value='';page=1;routeTo(s.slug||'all');};$('shelves').append(button);
 }
}
function filtered(){
 const q=norm($('search').value.trim());
 const visible=books.filter(b=>(!shelf||b.section===shelf)&&(!q||norm([b.id,b.title,b.credit,b.blurb,sectionFor(b).name].join(' ')).includes(q)));
 if($('sort').value==='title')visible.sort((a,b)=>a.title.localeCompare(b.title));
 if($('sort').value==='author')visible.sort((a,b)=>a.credit.localeCompare(b.credit)||a.title.localeCompare(b.title));
 return visible;
}
function render(){
 const s=sections.find(s=>s.code===shelf),visible=filtered(),pages=Math.max(1,Math.ceil(visible.length/size));page=Math.min(page,pages);
 $('shelf-title').textContent=s?.name||'All shelves';$('shelf-description').textContent=s?.description||'Follow a subject, search a title, or find the volume you came for.';
 $('shelf-note').hidden=!s?.note;$('shelf-note').textContent=s?.note||'';
 $('section-number').textContent=s?String(sections.indexOf(s)+1).padStart(2,'0')+' / THE '+s.name.toUpperCase()+' SHELF':'02 / THE GENERAL COLLECTION';
 $('count').textContent=visible.length+' of '+books.length+' records'+(visible.length?' · '+((page-1)*size+1)+'–'+Math.min(page*size,visible.length):'');
 $('grid').replaceChildren();renderShelves();
 for(const b of visible.slice((page-1)*size,page*size)){
  const card=el('article',undefined,'book-card');card.dataset.section=b.section;
  const cover=el('button',undefined,'cover-button');cover.type='button';cover.setAttribute('aria-label',b.id+': '+b.title+' — view details');
  cover.append(el('span',b.id,'spine-code'),el('span',b.title,'cover-title'),el('span',b.credit,'cover-credit'));
  const foot=el('div',undefined,'card-foot');foot.append(el('span',sectionFor(b).name.toUpperCase()));
  const details=el('button','Explore ↗','details-link');details.type='button';details.setAttribute('aria-label','Explore '+b.title);
  function openBook(event){opener=event.currentTarget;routeTo(b.id);}
  cover.onclick=openBook;details.onclick=openBook;foot.append(details);card.append(cover,foot);$('grid').append(card);
 }
 if(!visible.length){const empty=el('div',undefined,'empty');empty.append(el('h3','No volumes found'),el('p','Try another title, author, subject, or catalog number. Reset to search all shelves.'));$('grid').append(empty);}
 $('pagination').replaceChildren();if(pages>1){
  const prev=el('button','← Previous'),next=el('button','Next →');prev.disabled=page===1;next.disabled=page===pages;
  const change=delta=>{page+=delta;render();$('shelf-title').scrollIntoView({block:'start'});(delta>0?$('pagination').lastElementChild:$('pagination').firstElementChild)?.focus();};
  prev.onclick=()=>change(-1);next.onclick=()=>change(1);$('pagination').append(prev,el('span',page+' / '+pages),next);
 }
}
function showBook(b){
 selected=b;$('detail-id').textContent=b.id+' / '+(b.kind||'CATALOG RECORD').toUpperCase();$('detail-shelf').textContent=sectionFor(b).name.toUpperCase();
 $('detail-title').textContent=b.title;$('detail-credit').textContent=b.credit;$('detail-blurb').textContent=b.blurb;
 $('detail-source').href=b.url;$('detail-source').textContent=b.id==='E-020'?'Watch NCP service film ↗':'Open reading source ↗';$('copy-status').textContent='';
 if(!$('book-dialog').open)$('book-dialog').showModal();document.title=b.title+' | Repository of the Mind';
}
function route(){
 const hash=location.hash.slice(1),book=books.find(b=>b.id===hash);
 if(book){if(shelf!==book.section){shelf=book.section;page=1;render();}showBook(book);return;}
 selected=null;if($('book-dialog').open)$('book-dialog').close();
 const s=sections.find(s=>s.slug===hash);shelf=s?.code||'';page=1;render();document.title=(s?s.name+' | ':'')+'The Repository of the Mind';
}
function closeBook(){if(!$('book-dialog').open)return;$('book-dialog').close();}
$('book-dialog').addEventListener('close',()=>{
 if(!selected)return;selected=null;const s=sections.find(s=>s.code===shelf);history.replaceState(null,'','#'+(s?.slug||'all'));document.title=(s?s.name+' | ':'')+'The Repository of the Mind';
 if(opener?.isConnected)opener.focus();else $('search').focus();opener=null;
});
$('close-dialog').onclick=closeBook;
$('book-dialog').addEventListener('click',e=>{if(e.target===$('book-dialog')){const r=$('book-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeBook();}});
$('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('copy-status').textContent='Catalog link copied.';}catch{$('copy-status').textContent=location.href;}};
document.querySelector('.skip').onclick=e=>{e.preventDefault();$('search').focus();};
$('filters').onsubmit=e=>e.preventDefault();$('search').addEventListener('input',()=>{page=1;render();});$('sort').onchange=()=>{page=1;render();};
$('reset').onclick=()=>{$('search').value='';$('sort').value='catalog';routeTo('all');};
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);route();
})();
