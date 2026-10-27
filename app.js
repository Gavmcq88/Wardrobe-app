/* Colour Wardrobe app. Reads data/wardrobe-data.json (or window.WARDROBE_DATA when bundled into one file).
   Everything the user changes (shopping ticks, wear log, filters) lives in localStorage on this device. */
(async function(){
"use strict";

const store={
  get(k,d){try{const v=localStorage.getItem("cw-"+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem("cw-"+k,JSON.stringify(v));}catch(e){}}
};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=(n,l)=>String(n).padStart(l,"0");
const dayKey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1,2)}-${pad(d.getDate(),2)}`;
const txtOn=hex=>lum(hex)>.32?"#26282C":"#F4F3EF";

let D=window.WARDROBE_DATA;
if(!D){
  try{D=await (await fetch("data/wardrobe-data.json")).json();}
  catch(e){document.getElementById("main").innerHTML='<p class="empty">Couldn\'t load your wardrobe data. Open the app once while online.</p>';return;}
}

/* ---------- model ---------- */
const VERDICT={"keep":"keep","wear differently":"diff","retire":"retire","to buy":"new"};
const VLABEL={keep:"Keep",diff:"Wear differently",retire:"Retire",new:"To buy"};
const items=D.wardrobe.map(w=>({id:w.id,n:w.name,c:w.category,h:w.hex,s:VERDICT[w.verdict]||"keep",note:w.note,uses:[]}));
const W=Object.fromEntries(items.map(w=>[w.id,w]));
const colours=D.palette.flatMap(g=>g.colours.map(c=>({...c,group:g.group})));
const byName=Object.fromEntries(colours.map(c=>[c.name,c]));
colours.forEach((c,i)=>c.no=pad(i+1,3));
const withItems=o=>({...o,all:[...o.itemIds,o.watchId].filter(Boolean).map(id=>W[id]).filter(Boolean)});
let saved=store.get("saved",[]);    // outfits made by the generator and kept: {no:"S1",occasion,title,itemIds,watchId,reasons}
let outfits=[];
function rebuildOutfits(){
  outfits=[...D.outfits,...saved].map(withItems);
  items.forEach(w=>w.uses=[]);
  outfits.forEach(o=>o.all.forEach(w=>w.uses.push(o)));
}
rebuildOutfits();

/* nearest palette colour: Lab distance with lightness at half weight, so a pale sage still reads as sage rather than aqua */
function lab(hex){
  let [r,g,b]=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));
  let x=(r*.4124+g*.3576+b*.1805)/.95047,y=r*.2126+g*.7152+b*.0722,z=(r*.0193+g*.1192+b*.9505)/1.08883;
  const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;[x,y,z]=[f(x),f(y),f(z)];
  return [116*y-16,500*(x-y),200*(y-z)];
}
const dE=(a,b)=>Math.hypot((a[0]-b[0])/2,a[1]-b[1],a[2]-b[2]);
const refs=[...colours.map(c=>({kind:"palette",c,name:c.name,hex:c.hex})),...D.caution.map(c=>({kind:"caution",c,name:c.name,hex:c.hex}))]
  .map(r=>({...r,lab:lab(r.hex)}));
function nearest(hex){
  const l=lab(hex);
  return refs.map(r=>({...r,d:dE(l,r.lab)})).sort((a,b)=>a.d-b.d);
}
items.forEach(w=>{w.matches=nearest(w.h);w.near=w.matches[0];});
const generate=makeGenerator({items,colours,kindOf,lum});
window.cwGenerate=generate;   // handy from the console
const outfitKey=o=>[...o.itemIds].sort().join(" ");

/* ---------- wear log ---------- */
let worn=store.get("worn",{});      // {outfitNo:["2026-10-27",...]}
const lastWorn=o=>(worn[o.no]||[]).slice().sort().pop();
function wornLabel(o){
  const l=lastWorn(o);if(!l)return"";
  const days=Math.round((new Date(dayKey())-new Date(l))/864e5);
  return days===0?"Worn today":days===1?"Worn yesterday":`Worn ${days} days ago`;
}

/* ---------- shared renderers ---------- */
function outfitCard(o,{compact=false,idea=false}={}){
  const its=o.all.filter(w=>w.c!=="Watches"),wt=o.all.find(w=>w.c==="Watches");
  const wl=wornLabel(o),mine=String(o.no).startsWith("S");
  return `<article class="combo${idea?" idea":""}">
    <div class="combo-top"><span class="eyebrow">${esc(o.occasion)}${idea?" · new idea":mine?" · saved by you":""}</span>${idea?"":`<span class="mono">No. ${pad(o.no,2)}</span>`}</div>
    <h3>${esc(o.title)}</h3>
    <div class="boardwrap">${board(o.all)}</div>
    <ul class="legend">${its.map(w=>`<li><i style="background:${w.h}"></i><span><button type="button" data-item="${w.id}">${esc(w.n)}</button>${w.s==="new"?'<span class="new">to buy</span>':""}</span></li>`).join("")}</ul>
    ${wt?`<div class="watch"><i style="background:${wt.h}"></i><span><span class="eyebrow">Watch</span> ${esc(wt.n)}</span></div>`:""}
    ${o.note?`<p>${esc(o.note)}</p>`:""}
    ${o.reasons?`<ul class="why">${o.reasons.map(r=>`<li>${esc(r)}</li>`).join("")}</ul>`:""}
    ${wl&&!compact?`<span class="worn">${wl}</span>`:""}
    ${mine&&!idea&&!compact?`<button type="button" class="btn ghost small" data-remove="${esc(o.no)}">Remove from saved</button>`:""}
  </article>`;
}
function chipRow(el,options,current,onPick,{role="pressed"}={}){
  el.innerHTML=options.map(([k,l])=>`<button type="button" data-k="${esc(k)}" ${role==="tab"?`role="tab" aria-selected="${k===current}"`:`aria-pressed="${k===current}"`}>${esc(l)}</button>`).join("");
  el.onclick=e=>{const b=e.target.closest("button");if(!b)return;
    el.querySelectorAll("button").forEach(x=>x.setAttribute(role==="tab"?"aria-selected":"aria-pressed",x===b));onPick(b.dataset.k);};
}
let toastT;
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),1800);}

/* ---------- sheet (details) ---------- */
const sheet=$("sheet");
function openSheet(html){
  $("sheetBody").innerHTML=html;
  if(typeof sheet.showModal==="function"){if(!sheet.open)sheet.showModal();}else sheet.setAttribute("open","");
  sheet.scrollTop=0;
}
$("sheetClose").onclick=()=>sheet.close?sheet.close():sheet.removeAttribute("open");
sheet.addEventListener("click",e=>{
  if(e.target===sheet)sheet.close();
  const it=e.target.closest("[data-item]");if(it)itemSheet(W[it.dataset.item]);
  const co=e.target.closest("[data-colour]");if(co)colourSheet(colours.find(c=>c.id===co.dataset.colour));
  const cp=e.target.closest("[data-copy]");if(cp)copyHex(cp.dataset.copy);
});
document.addEventListener("click",e=>{
  if(sheet.contains(e.target))return;
  const it=e.target.closest("[data-item]");if(it){itemSheet(W[it.dataset.item]);return;}
  const co=e.target.closest("[data-colour]");if(co)colourSheet(colours.find(c=>c.id===co.dataset.colour));
});
function copyHex(hex){
  const done=()=>toast(`Copied ${hex}`);
  try{navigator.clipboard.writeText(hex).then(done,()=>toast(hex));}catch(e){toast(hex);}
}
function colourSheet(c){
  const [kanji,romaji]=(c.japanese||"").split(" / ");
  const owned=items.filter(w=>w.near.kind==="palette"&&w.near.c.id===c.id&&w.near.d<10&&w.s!=="retire");
  openSheet(`<div class="sheet-swatch" style="background:${c.hex};color:${txtOn(c.hex)}"><span class="mono">No. ${c.no} · ${c.hex}</span></div>
    <span class="eyebrow">${esc(c.group)}</span>
    <h2 id="sheetTitle">${esc(c.name)}</h2>
    <p><span style="font-family:var(--display)">${esc(kanji)}</span> ${esc(romaji)} · nearest traditional colour</p>
    <p>${esc(c.reference)}</p>
    <h4>Wear it as</h4><p>${esc(c.use)}</p>
    <h4>Pairs with</h4>
    <ul class="sheet-list">${c.pairsWith.map(n=>byName[n]).filter(Boolean).map(p=>`<li><i style="background:${p.hex}"></i><button type="button" data-colour="${p.id}">${esc(p.name)}</button></li>`).join("")}</ul>
    ${owned.length?`<h4>You own ${owned.length} in this colour</h4><ul class="sheet-list">${owned.map(w=>`<li><i style="background:${w.h}"></i><button type="button" data-item="${w.id}">${esc(w.n)}</button></li>`).join("")}</ul>`:""}
    <p style="margin-top:16px"><button type="button" class="btn ghost" data-copy="${c.hex}">Copy hex code</button></p>`);
}
function itemSheet(w){
  const n=w.near,close=n.d<10,link=r=>`<button type="button" data-colour="${r.c.id}" class="inline-link">${esc(r.name)}</button>`;
  // colours that are almost equally close are both named, since the hex is only an estimate of the fabric
  const near2=w.matches.filter(r=>r.kind==="palette"&&r.d<n.d+3).slice(0,2);
  let colourLine;
  if(n.kind==="palette")colourLine=close?`Closest palette colour${near2.length>1?"s":""}: ${near2.map(link).join(" and ")}.`:`Nearest palette colour is ${link(n)}, but it's some way off.`;
  else colourLine=close?`Close to <b>${esc(n.name)}</b> (${esc(n.c.level.toLowerCase())}). ${esc(n.c.fix)}`:`Nearest reference is ${esc(n.name)} (${esc(n.c.level.toLowerCase())}).`;
  openSheet(`<div class="sheet-thumb">${thumb(w)}</div>
    <span class="eyebrow">${esc(w.c)}</span>
    <h2 id="sheetTitle">${esc(w.n)}</h2>
    <span class="pill ${w.s}">${VLABEL[w.s]}</span>
    ${w.note?`<p>${esc(w.note)}</p>`:""}
    <h4>Colour check</h4><p>${colourLine}</p>
    <h4>${w.uses.length?`In ${w.uses.length} outfit${w.uses.length>1?"s":""}`:"Outfits"}</h4>
    ${w.uses.length?`<ul class="sheet-list">${w.uses.map(o=>`<li><i style="background:${o.all[0].h}"></i><span>No. ${pad(o.no,2)} · ${esc(o.title)} <span class="eyebrow">${esc(o.occasion)}</span></span></li>`).join("")}</ul>`:`<p class="summary">Not in any saved outfit yet.</p>`}`);
}

/* ---------- Today ---------- */
const occasions=[...new Set(outfits.map(o=>o.occasion))];
function defaultOccasion(d=new Date()){
  const dow=d.getDay(),m=d.getMonth(),h=d.getHours(),weekend=dow===0||dow===6,summer=m>=5&&m<=7;
  if(h>=17&&(dow===5||dow===6))return"Evening";
  if(weekend)return summer?"Summer":"Weekend";
  return"Office";
}
let today=store.get("today",{});
if(today.day!==dayKey())today={day:dayKey(),occ:defaultOccasion(),offset:0};
// ignores today's log, so ticking "I wore this" doesn't swap the outfit on screen
const wornBefore=o=>(worn[o.no]||[]).filter(d=>d<dayKey()).sort().pop()||"";
function todaysPick(){
  if(today.idea&&today.idea.occasion===today.occ)return withItems(today.idea);
  const pool=outfits.filter(o=>o.occasion===today.occ)
    .sort((a,b)=>wornBefore(a).localeCompare(wornBefore(b))||String(a.no).localeCompare(String(b.no),undefined,{numeric:true}));   // least recently worn first
  return pool[today.offset%pool.length];
}
function newIdea(){
  const seen=new Set([...outfits.map(outfitKey),...(today.seen||[])]);
  const g=generate(today.occ,{exclude:seen});
  if(!g){toast("No new combinations left for this occasion");return;}
  today.seen=[...(today.seen||[]),g.key].slice(-60);
  delete g.key;today.idea={...g,no:"idea"};
  renderToday();
}
function saveIdea(){
  const n=1+saved.reduce((m,o)=>Math.max(m,+String(o.no).slice(1)),0);
  const o={...today.idea,no:"S"+n};
  saved.push(o);store.set("saved",saved);rebuildOutfits();renderOutfits();renderWardrobe();
  today.idea=null;today.offset=0;
  return o;
}
function renderToday(){
  const now=new Date(),h=now.getHours();
  $("todayDate").textContent=now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  $("greeting").textContent=`${h<12?"Good morning":h<18?"Good afternoon":"Good evening"}, Gavin`;
  const o=todaysPick(),idea=o.no==="idea";
  $("todayOutfit").innerHTML=outfitCard(o,{idea});
  const isWorn=(worn[o.no]||[]).includes(dayKey());
  $("woreBtn").textContent=isWorn?"Logged for today ✓":"I wore this today";
  $("woreBtn").setAttribute("aria-pressed",isWorn);
  $("shuffleBtn").textContent=idea?"Back to my outfits":"Show another";
  $("ideaBtn").textContent=idea?"Another idea":"New idea";
  $("saveBtn").hidden=!idea;
  store.set("today",today);
}
chipRow($("todayOcc"),occasions.map(o=>[o,o]),today.occ,k=>{today.occ=k;today.offset=0;today.idea=null;renderToday();});
$("shuffleBtn").onclick=()=>{if(today.idea)today.idea=null;else today.offset++;renderToday();};
$("ideaBtn").onclick=newIdea;
$("saveBtn").onclick=()=>{const o=saveIdea();toast(`Saved “${o.title}” to your outfits`);showSaved(o);};
// after saving, keep the saved outfit on screen
function showSaved(o){
  const pool=outfits.filter(x=>x.occasion===today.occ).sort((a,b)=>wornBefore(a).localeCompare(wornBefore(b))||String(a.no).localeCompare(String(b.no),undefined,{numeric:true}));
  today.offset=Math.max(0,pool.findIndex(x=>x.no===o.no));renderToday();
}
$("woreBtn").onclick=()=>{
  let o=todaysPick();
  if(o.no==="idea"){o=saveIdea();showSaved(o);o=outfits.find(x=>x.no===o.no);}
  const k=dayKey(),log=worn[o.no]||[];
  worn[o.no]=log.includes(k)?log.filter(x=>x!==k):[...log,k];
  store.set("worn",worn);
  toast(log.includes(k)?"Removed from today's log":`Logged “${o.title}” for today`);
  renderToday();renderOutfits();
};
const dayNo=Math.floor(Date.now()/864e5);
const rule=D.rules[dayNo%D.rules.length];
$("ruleOfDay").innerHTML=`<span class="eyebrow">Rule of thumb</span><h3>${esc(rule[0])}</h3><p>${esc(rule[1])}</p>`;
const P=D.profile;
$("profileGrid").innerHTML=[["Season","Soft Summer"],["Undertone",P.undertone],["Value",P.value],["Chroma",P.chroma],["Contrast",P.contrast],["Metals","Silver, steel, gunmetal"]]
  .map(([k,v])=>`<div><span class="eyebrow">${esc(k)}</span><b>${esc(v)}</b></div>`).join("");

/* ---------- Colours ---------- */
function renderPalette(){
  $("palettePane").innerHTML=D.palette.map(g=>`<h3 class="group-label">${esc(g.group)}</h3><div class="plates">${g.colours.map(c0=>{
    const c=colours.find(x=>x.id===c0.id),[kanji,romaji]=(c.japanese||"").split(" / ");
    return `<button type="button" class="plate" data-colour="${c.id}" aria-label="${esc(c.name)}, ${c.hex}">
      <div class="chip" style="background:${c.hex};color:${txtOn(c.hex)}"><span class="no">No. ${c.no}</span></div>
      <div class="plate-body"><h3>${esc(c.name)}</h3><span class="hex mono">${c.hex}</span><span class="jpname"><span>${esc(kanji)}</span>${esc(romaji)}</span></div>
    </button>`;}).join("")}</div>`).join("")+
    `<p class="foot">Hex values are approximate targets. Fabric, weave and shop lighting all shift colour, so match by eye in daylight. Tap a plate for pairings and the clothes you own in it.</p>`;
  $("avoidPane").innerHTML=`<div class="caution">${D.caution.map(c=>`<div class="cv ${c.level==="Caution"?"":"avoid"}">
    <div class="sw" style="background:${c.hex}"></div>
    <div><span class="eyebrow">${esc(c.level)}</span><h3>${esc(c.name)}</h3><p>${esc(c.why)}</p><p class="fix">${esc(c.fix)}</p></div></div>`).join("")}</div>`;
  $("rulesPane").innerHTML=`<div class="rules">${D.rules.map(([h,p])=>`<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}</div>
    <p class="foot">Based on photo analysis and home draping, October 2026. Confidence about 70%; an in-person draping session would confirm it.</p>`;
}
const panes={palette:"palettePane",avoid:"avoidPane",rules:"rulesPane"};
let cTab=store.get("ctab","palette");if(!panes[cTab])cTab="palette";
function showCTab(k){cTab=k;store.set("ctab",k);Object.entries(panes).forEach(([p,id])=>$(id).hidden=p!==k);}
chipRow($("colourSeg"),[["palette","Palette"],["avoid","Caution"],["rules","Rules"]],cTab,showCTab,{role:"tab"});
renderPalette();showCTab(cTab);

/* ---------- Outfits ---------- */
let oCur=store.get("ofilter","All");if(oCur!=="All"&&oCur!=="Saved"&&!occasions.includes(oCur))oCur="All";
function renderOutfits(){
  const list=outfits.filter(o=>oCur==="All"||o.occasion===oCur||(oCur==="Saved"&&String(o.no).startsWith("S")));
  $("outfitList").innerHTML=list.length?list.map(o=>outfitCard(o)).join(""):`<p class="empty">No saved outfits yet. Tap “New idea” on the Today tab and save the ones you like.</p>`;
  renderOutfitFilters();
}
function renderOutfitFilters(){
  chipRow($("outfitFilters"),[["All",`All ${outfits.length}`],...occasions.map(o=>[o,o]),["Saved",`Saved ${saved.length}`]],oCur,k=>{oCur=k;store.set("ofilter",k);renderOutfits();});
}
$("outfitList").addEventListener("click",e=>{
  const b=e.target.closest("[data-remove]");if(!b)return;
  const o=saved.find(x=>x.no===b.dataset.remove);
  saved=saved.filter(x=>x!==o);store.set("saved",saved);rebuildOutfits();renderOutfits();renderWardrobe();
  toast(`Removed “${o.title}”`);
});
renderOutfits();

/* ---------- Wardrobe ---------- */
let wCur=store.get("wfilter","all");if(wCur!=="all"&&!VLABEL[wCur])wCur="all";
let q="";
const cnt=k=>items.filter(w=>w.s===k).length;
$("wSearch").placeholder=`Search ${items.length} items`;
function renderWardrobe(){
  const words=q.toLowerCase().split(/\s+/).filter(Boolean);
  const match=w=>(wCur==="all"||w.s===wCur)&&words.every(x=>(w.n+" "+w.c+" "+w.near.name).toLowerCase().includes(x));
  const cats=[...new Set(items.map(w=>w.c))];
  let shown=0;
  const html=cats.map(c=>{
    const its=items.filter(w=>w.c===c&&match(w));shown+=its.length;
    if(!its.length)return"";
    return `<div class="wgroup"><h3>${esc(c)}<span>${its.length}</span></h3><div class="witems">${its.map(w=>`<button type="button" class="witem ${w.s}" data-item="${w.id}">
      <span class="wthumb">${thumb(w)}</span><span><b>${esc(w.n)}</b><span class="pill ${w.s}">${VLABEL[w.s]}</span>${w.uses.length?`<span class="pill">${w.uses.length} outfit${w.uses.length>1?"s":""}</span>`:""}${w.note?`<small>${esc(w.note)}</small>`:""}</span></button>`).join("")}</div></div>`;}).join("");
  $("wardrobeList").innerHTML=html||`<p class="empty">Nothing matches “${esc(q)}”.</p>`;
  $("wSummary").textContent=(q||wCur!=="all")?`${shown} of ${items.length} items`:`${items.length} items: ${cnt("keep")} keep, ${cnt("diff")} wear differently, ${cnt("retire")} retire, ${cnt("new")} to buy.`;
}
chipRow($("wFilters"),[["all","All"],["keep","Keep"],["diff","Wear differently"],["retire","Retire"],["new","To buy"]],wCur,k=>{wCur=k;store.set("wfilter",k);renderWardrobe();});
$("wSearch").addEventListener("input",e=>{q=e.target.value.trim();renderWardrobe();});
renderWardrobe();

/* ---------- Shop ---------- */
let ticked=store.get("shop",{});    // keyed by item name so edits to the list don't shift ticks
const shopItems=D.shopping.flatMap(g=>g.items);
const total=shopItems.reduce((a,i)=>a+i.priceCHF,0);
const chf=n=>"CHF "+n.toLocaleString("de-CH");
function updateSpent(){
  const spent=shopItems.filter(i=>ticked[i.name]).reduce((a,i)=>a+i.priceCHF,0);
  $("spentBar").style.width=Math.min(100,spent/D.budgetCHF*100)+"%";
  $("spentTxt").textContent=`${chf(spent)} of ${chf(D.budgetCHF)}`;
  $("listTxt").textContent=`${shopItems.filter(i=>ticked[i.name]).length} of ${shopItems.length} bought · full list ${chf(total)}`;
}
$("sizes").innerHTML=D.sizes.map(([k,v])=>`<div><span class="eyebrow">${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
$("shopList").innerHTML=D.shopping.map(g=>`<div class="shop-group"><h3>${esc(g.group)}</h3>${g.intro?`<p>${esc(g.intro)}</p>`:""}
  ${g.items.map(i=>{const c=colours.find(x=>x.id===i.colour),id="buy-"+i.name.replace(/\W+/g,"-");return `<div class="item${ticked[i.name]?" done":""}">
    <input type="checkbox" id="${id}" data-name="${esc(i.name)}" ${ticked[i.name]?"checked":""}>
    <div class="sw2" style="background:${c?c.hex:"#999"}" title="${esc(c?c.name:"")}"></div>
    <div><h4><label for="${id}">${esc(i.name)}</label></h4><p>${esc(i.where)}</p><p>${esc(i.note)}${i.url?` <a href="${esc(i.url)}" target="_blank" rel="noopener">View</a>`:""}</p>
    <div class="price">${i.approx?"~":""}${chf(i.priceCHF)}</div></div></div>`;}).join("")}</div>`).join("")+
  `<div class="trip"><h3>${esc(D.trip.title)}</h3><p>${esc(D.trip.text)}</p></div>
   <div class="shop-group" style="margin-top:12px"><h3>Can wait</h3><p>Next round, or when something wears out.</p><div class="later">${D.canWait.map(c=>`<div><b>${esc(c.item)}</b>${esc(c.note)}</div>`).join("")}</div></div>`;
$("shopList").addEventListener("change",e=>{
  const cb=e.target;if(!cb.dataset.name)return;
  ticked[cb.dataset.name]=cb.checked;cb.closest(".item").classList.toggle("done",cb.checked);
  store.set("shop",ticked);updateSpent();
});
updateSpent();

/* ---------- routing ---------- */
const views=["today","colours","outfits","wardrobe","shop"];
function route(){
  const v=views.includes(location.hash.slice(1))?location.hash.slice(1):"today";
  views.forEach(x=>$("v-"+x).hidden=x!==v);
  document.querySelectorAll(".tabbar a").forEach(a=>a.dataset.v===v?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
  $("viewTitle").textContent=$("v-"+v).dataset.title;
  $("viewSub").textContent=v==="today"?"Soft Summer · cool-leaning":v==="wardrobe"?`${items.length} items`:v==="outfits"?`${outfits.length} outfits`:v==="colours"?`${colours.length} colours`:"Round one";
  if(sheet.open)sheet.close();
  window.scrollTo(0,0);
  if(v==="today")renderToday();
}
window.addEventListener("hashchange",route);
route();

/* ---------- install + offline ---------- */
const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
if(!standalone&&!window.WARDROBE_DATA&&!store.get("hintDismissed",false)&&location.protocol==="https:"){
  const ios=/iP(hone|ad|od)/.test(navigator.userAgent);
  const h=$("installHint");h.hidden=false;
  h.innerHTML=(ios?`<b>Add to your Home Screen:</b> tap Share, then “Add to Home Screen”. It then opens full screen and works offline.`
    :`<b>Install the app:</b> open your browser menu and choose “Install app” or “Add to Home screen”. It then works offline.`)+
    ` <button type="button" class="btn ghost" style="min-height:0;padding:2px 8px;margin-left:4px;font-size:12px" id="hintX">Dismiss</button>`;
  $("hintX").onclick=()=>{h.hidden=true;store.set("hintDismissed",true);};
}
if("serviceWorker" in navigator&&!window.WARDROBE_DATA&&location.protocol!=="file:"){
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}
})();
