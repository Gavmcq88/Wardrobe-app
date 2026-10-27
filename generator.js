/* Outfit generator: builds new outfits from the clothes you're keeping and checks each against the colour rules.
   makeGenerator(ctx) -> generate(occasion, {exclude, month}) returns {itemIds, watchId, title, reasons} or null.
   ctx: {items (with .matches from the app's colour matcher), colours, kindOf, lum} */
function makeGenerator({items,colours,kindOf,lum}){
const NEUTRAL=new Set(["charcoal","heather","navy","slate","taupe","white","stone","cocoa","oxblood"]);
const NECK_OK_UNDER_CAMEL=new Set(["navy","charcoal","heather","slate"]);
const byName=Object.fromEntries(colours.map(c=>[c.name,c]));
const byId=Object.fromEntries(colours.map(c=>[c.id,c]));
const pairs=(a,b)=>a&&b&&(a.pairsWith.some(n=>byName[n]&&byName[n].id===b.id)||b.pairsWith.some(n=>byName[n]&&byName[n].id===a.id));
const NOT_FOR_OUTFITS=/lounging|gym|home only|hiking|beach|mountain|garden|probation/i;

/* describe every wearable item once */
const pool=items.filter(w=>w.s==="keep"||w.s==="diff").filter(w=>!NOT_FOR_OUTFITS.test(w.note||"")).map(w=>{
  const top=w.matches[0],pal=w.matches.find(m=>m.kind==="palette");
  let role="palette";
  if(top.kind==="caution"&&top.d<10){
    if(top.name==="Black")role="black";
    else if(top.name==="Camel")role="camel";
    else if(top.c.level==="Caution")role="palette";       // cobalt: wearable, falls back to its nearest palette colour
    else role=top.c.level==="Avoid near face"?"avoidFace":"avoid";
  }
  const col=role==="palette"?pal.c:null;
  return {w,id:w.id,kind:kindOf(w),role,col,accent:!!col&&!NEUTRAL.has(col.id),L:lum(w.h),
    brown:/brown|cocoa|tan/i.test(w.n)||(col&&(col.id==="cocoa"||col.id==="oxblood"))};
}).filter(x=>x.role!=="avoid");
const colourName=x=>x.role==="black"?"black":x.role==="camel"?"camel":x.col?x.col.name.toLowerCase():"";

const K={
  shirt:["shirt"],ss:["ssshirt"],tee:["tee"],polo:["polo","lspolo"],
  knit:["crew","halfzip","rollneck"],casualKnit:["crew","halfzip","hoodie","knitbutton"],
  coat:["coat"],casualOuter:["coat","quilted","puffer","jacket","overshirt","gilet","fleece"],blazer:["blazer"],
  trousers:["trousers"],jeans:["jeans"],shorts:["shorts","jshorts"],
  smartShoes:["derby","loafer","boot"],casualShoes:["sneaker","boot","loafer"]
};
const LAYER_ONLY=/^open over|^under/i;   // shirts the audit says to wear open over a tee
const of=(kinds,filter=()=>true)=>pool.filter(x=>kinds.includes(x.kind)&&filter(x));
const asBase=kinds=>of(kinds,x=>!LAYER_ONLY.test(x.w.note||""));
const pick=a=>a.length?a[Math.floor(Math.random()*a.length)]:null;
const chance=p=>Math.random()<p;

function season(month){return month>=10||month<=2?"cold":month>=4&&month<=8?"warm":"mild";}

/* one random candidate for an occasion; rules are checked afterwards */
function draft(occ,month){
  const s=season(month),cold=s==="cold",warm=s==="warm";
  const notShorts=x=>!x.w.c.startsWith("Shorts");
  let base,mid=null,outer=null,bottom,shoes;
  switch(occ){
  case"Office":
    base=pick(warm&&chance(.3)?asBase(K.polo):asBase(K.shirt).filter(x=>!/western|check|flannel/i.test(x.w.n)));
    if(chance(cold?.75:warm?.15:.5))mid=pick(of(K.knit));
    if(cold)outer=pick(of(K.coat));else if(chance(.5))outer=pick(of(K.blazer,x=>x.id!=="blzPink"));
    bottom=pick(of(K.trousers,notShorts));shoes=pick(of(K.smartShoes));break;
  case"Evening":
    base=pick(asBase([...K.tee,...K.shirt,...K.polo,...(warm?K.ss:[])]));
    if(!warm&&chance(.5))mid=pick(of(["crew","rollneck"]));
    if(cold)outer=pick(of([...K.coat,...K.blazer]));else if(chance(.45))outer=pick(of(K.blazer));
    bottom=pick(of([...K.trousers,...K.jeans],notShorts));shoes=pick(of(["boot","loafer","derby"]));break;
  case"Weekend":
    base=pick(asBase([...K.tee,...K.ss,...K.polo,...K.shirt]));
    if(!warm&&chance(.5))mid=pick(of(K.casualKnit));
    if(cold)outer=pick(of(K.casualOuter));else if(chance(warm?.15:.5))outer=pick(of(["jacket","overshirt","quilted"]));
    bottom=pick(of([...K.jeans,...K.trousers],notShorts));shoes=pick(of(K.casualShoes));break;
  case"Summer":
    base=pick(asBase([...K.tee,...K.ss,...K.polo]));
    bottom=pick(chance(.65)?of(K.shorts):of(K.trousers,x=>notShorts(x)&&x.L>.3));shoes=pick(of(["sneaker","loafer"]));break;
  case"Japanese":
    base=pick(asBase([...K.tee,...K.shirt]).filter(x=>x.kind==="tee"||x.id==="shBand"||!x.accent));
    if(chance(cold?.7:.4))mid=pick(of(["crew","rollneck"]));
    if(cold||chance(.3))outer=pick(of(K.coat,x=>x.role!=="camel"));
    bottom=pick(of(K.trousers,x=>/pleated|wide/i.test(x.w.n)));shoes=pick(of(["sneaker","boot"]));break;
  }
  return {occ,base,mid,outer,bottom,shoes};
}

/* hard rules from the colour analysis; returns reasons when the outfit passes, null when it breaks a rule */
function check(o){
  const {base,mid,outer,bottom,shoes}=o;
  if(!base||!bottom||!shoes)return null;
  const tops=[base,mid,outer].filter(Boolean),neck=mid||base,why=[];
  if(tops.some(x=>x.role==="avoidFace"))return null;                                   // warm pinks, olive: not near the face
  if(base.role==="black")return null;                                                  // black is heavy near the face
  if(mid&&mid.role==="black"){if(!(base.kind==="tee"&&base.L>.3))return null;why.push("A light tee at the neck breaks up the black knit.");}
  if(outer&&outer.role==="black"&&neck.L<.08)return null;
  if(outer&&outer.role==="camel"){
    if(!(neck.col&&NECK_OK_UNDER_CAMEL.has(neck.col.id)))return null;
    why.push(`${neck.col.name} at the neck buffers the camel coat.`);
  }
  // moderate contrast: no black-with-white extremes between what's at the neck and the trousers
  const hi=Math.max(neck.L,bottom.L),lo=Math.min(neck.L,bottom.L);
  if((hi+.05)/(lo+.05)>12)return null;
  // one accent, or two that are listed as pairing with each other
  const acc=[...tops,bottom].filter(x=>x.accent);
  const accIds=[...new Set(acc.map(x=>x.col.id))];
  if(accIds.length>2)return null;
  if(accIds.length===2&&!pairs(byId[accIds[0]],byId[accIds[1]]))return null;
  if(accIds.length===2)why.push(`Two accents, but ${byId[accIds[0]].name.toLowerCase()} and ${byId[accIds[1]].name.toLowerCase()} are a listed pairing.`);
  else if(accIds.length===1)why.push(`One accent colour: ${byId[accIds[0]].name.toLowerCase()}. Everything else stays neutral.`);
  else why.push("Tonal neutrals, so add colour with a scarf or socks if you like.");
  if(shoes.brown&&bottom.role==="black")return null;                                   // brown shoes under black trousers
  if(shoes.role==="black"&&bottom.w.c==="Shorts")return null;
  if(o.occ==="Japanese"&&acc.length>1)return null;
  // colours that show next to each other should get on
  const adj=[[base,mid],[mid,outer],[neck,bottom]].filter(([a,b])=>a&&b&&a.col&&b.col);
  let score=Math.random()*1.5;
  adj.forEach(([a,b])=>{
    if(a.col.id===b.col.id)score+=.5;
    else if(pairs(a.col,b.col)){score+=2;}
    else if(a.accent&&b.accent)score-=1.5;
    else if(!a.accent&&!b.accent)score+=.5;
  });
  const best=adj.find(([a,b])=>a.col.id!==b.col.id&&pairs(a.col,b.col));
  if(best&&!(accIds.length===2&&best[0].accent&&best[1].accent))why.unshift(`${best[0].col.name} pairs with ${best[1].col.name.toLowerCase()} in your palette.`);
  if(neck.accent&&["sage","teal","spruce","aqua","sky","cornflower","lilac"].includes(neck.col.id))
    why.push(`Cool ${neck.col.name.toLowerCase()} near your face calms the redness.`);
  score-=tops.concat(bottom,shoes).filter(x=>x.w.s==="diff").length*.6;
  return {score,why};
}

const watches=items.filter(w=>w.c==="Watches");
function chooseWatch(o){
  const ids=[o.base,o.mid,o.outer,o.bottom].filter(Boolean).map(x=>x.col?x.col.id:x.role);
  const has=(...a)=>a.some(x=>ids.includes(x));
  const score={
    wTissot:(o.occ==="Summer"?2:0)+(has("sky","aqua","cornflower","white")?2:0),
    wUnderdog:has("heather","charcoal","lilac","shell","mauve","plum")?2:0,
    wLongines:(has("sage","teal","spruce")?2:0)+(o.occ==="Weekend"||o.outer?1:0),
    wTag:(o.occ==="Office"?2:0)+(has("navy")?1:0),
    wMoon:(has("black")?3:0)+(o.occ==="Weekend"?.5:0)
  };
  return watches.map(w=>({w,s:(score[w.id]||0)+Math.random()})).sort((a,b)=>b.s-a.s)[0]?.w.id||null;
}

function titleFor(o){
  const tops=[o.outer,o.mid,o.base].filter(Boolean);
  const accent=tops.concat(o.bottom).find(x=>x.accent);
  const lead=accent||o.mid||o.base;
  const other=[o.bottom,o.outer,o.mid,o.base].find(x=>x&&x!==lead&&colourName(x)!==colourName(lead));
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  return other?`${cap(colourName(lead))} and ${colourName(other)}`:`Tonal ${colourName(lead)}`;
}

return function generate(occ,{exclude=new Set(),month=new Date().getMonth()}={}){
  const found=[];
  for(let i=0;i<600&&found.length<40;i++){
    const o=draft(occ,month),r=check(o);if(!r)continue;
    const itemIds=[o.outer,o.mid,o.base,o.bottom,o.shoes].filter(Boolean).map(x=>x.id);
    const key=[...itemIds].sort().join(" ");
    if(exclude.has(key)||found.some(f=>f.key===key))continue;
    found.push({o,r,itemIds,key});
  }
  if(!found.length)return null;
  found.sort((a,b)=>b.r.score-a.r.score);
  const f=found[Math.floor(Math.random()*Math.min(5,found.length))];
  return {itemIds:f.itemIds,watchId:chooseWatch(f.o),title:titleFor(f.o),reasons:f.r.why.slice(0,3),key:f.key,occasion:occ};
};
}
