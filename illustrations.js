/* Flat-lay illustrations, ported unchanged from the original colour dictionary page.
   Items are {id, n: name, c: category, h: hex}. */
function lum(hex){const v=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*v[0]+.7152*v[1]+.0722*v[2];}
const KIND={coatChar:"coat",coatCamel:"coat",coatGreen:"coat",peacoat:"coat",barbour:"quilted",puffer:"puffer",giletNavy:"gilet",parka:"puffer",giletBlack:"gilet",sherpa:"fleece",hhFleece:"fleece",
blzBlue:"blazer",blzPink:"blazer",blzNavyJ:"blazer",nBlazer:"blazer",denimJkt:"jacket",ovStone:"overshirt",ovSalmon:"overshirt",ovCheck:"overshirt",nShirtJkt:"overshirt",
knPSGreen:"halfzip",knPSNavy:"halfzip",knFarah:"halfzip",knBlackHZ:"halfzip",hoodAqua:"hoodie",nRoll:"rollneck",
poCTNavyB:"knitbutton",poTaupe:"knitbutton",poZaraBlack:"lspolo",
fLoafNavy:"loafer",nLoafer:"loafer",fChelsea:"boot",fBoots:"boot",fDerby:"derby",fOxford:"derby",fRoger:"sneaker",fCampus:"sneaker",fNike:"sneaker",fVans:"sneaker",fNikin:"sneaker",
jZara:"jeans",jLevisLight:"jeans",jMustang:"jeans",jLevisBlack:"jeans",jSkinny:"jeans",shoMid:"jshorts",shoLight:"jshorts",shoHM:"jshorts",shoRI:"jshorts"};
const CATK={"Knitwear":"crew","Knitted polos":"polo","Long-sleeve shirts":"shirt","Short-sleeve shirts":"ssshirt","T-shirts":"tee","Trousers & jeans":"trousers","Shorts":"shorts","Watches":"watch","Belts":"belt"};
const NEWK={nWhite:"tee",nHeather:"tee",nNextPack:"tee",nFlannel:"trousers",nScarf:"scarf"};
const PAT={ssBlueStripe:["v","#F4F4F2"],ssNextGrey:["v","#2E3A55"],ssNextGreen:["v","#D8CDB4"],ssJJ:["v","#CDBF9E"],ssOlive:["v","#B6B79A"],shSkyStripe:["v","#F4F6F8"],shGreenStripe:["v","#F2F3EF"],
tBreton:["h","#2A3550"],ssCreamStripe:["v","#2E3A55"],trCheck:["c","#2A3350"],shCheck:["c","#F1F1F1"],ovCheck:["c","#EDEDED"],tMarl:["dot","#8E9093"],knWaffle:["c","#2E2E31"],poPointelle:["dot","#E4E5E6"]};
const kindOf=w=>KIND[w.id]||NEWK[w.id]||CATK[w.c]||"tee";
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v+amt*255)));return `rgb(${f(r)},${f(g)},${f(b)})`;}
const ln=(h)=>lum(h)>.32;
let PID=0;
const SH={
 tee:"M30 14 L42 9 Q50 16 58 9 L70 14 L88 30 L79 40 L70 33 L70 94 L30 94 L30 33 L21 40 L12 30 Z",
 ls:"M31 12 L42 8 Q50 14 58 8 L69 12 L80 22 L92 82 L82 84 L70 40 L70 96 L30 96 L30 40 L18 84 L8 82 L20 22 Z",
 coat:"M30 10 L42 6 Q50 10 58 6 L70 10 L82 20 L92 88 L82 90 L72 40 L74 99 L26 99 L28 40 L18 90 L8 88 L18 20 Z",
 jacket:"M30 10 L42 6 Q50 10 58 6 L70 10 L82 20 L92 80 L82 82 L71 40 L72 90 L28 90 L29 40 L18 82 L8 80 L18 20 Z",
 gilet:"M31 10 L42 6 Q50 10 58 6 L69 10 L73 30 L73 92 L27 92 L27 30 Z",
 trousers:"M26 3 L74 3 L78 98 L57 98 L50 30 L43 98 L22 98 Z",
 shorts:"M24 20 L76 20 L80 66 L56 68 L50 44 L44 68 L20 66 Z"
};
function bodyPath(k){return ({tee:SH.tee,polo:SH.tee,ssshirt:SH.tee,knitbutton:SH.tee,coat:SH.coat,quilted:SH.jacket,puffer:SH.jacket,jacket:SH.jacket,fleece:SH.jacket,gilet:SH.gilet,trousers:SH.trousers,jeans:SH.trousers,shorts:SH.shorts,jshorts:SH.shorts})[k]||SH.ls;}
function patDef(w,id){const p=PAT[w.id];if(!p)return"";const c=p[1];
 if(p[0]==="v")return `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="1.4" height="5" fill="${c}"/></pattern>`;
 if(p[0]==="h")return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="1.6" fill="${c}"/></pattern>`;
 if(p[0]==="dot")return `<pattern id="${id}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".6" fill="${c}"/></pattern>`;
 return `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="1" fill="${c}" opacity=".7"/><rect width="1" height="8" fill="${c}" opacity=".7"/></pattern>`;}
function garment(w){
 const k=kindOf(w),f=w.h,st="rgba(110,110,110,.75)",d=ln(f)?shade(f,-.22):shade(f,.2),sw='stroke-width="1"';
 if(k==="watch")return watchSvg(w);
 if(["sneaker","loafer","boot","derby"].includes(k))return shoeSvg(w,k);
 if(k==="scarf")return `<path d="M38 4 L62 4 L60 70 L66 96 L52 96 L50 72 L46 96 L34 96 L40 70 Z" fill="${f}" stroke="${st}" ${sw}/><path d="M36 92 h32" stroke="${d}" stroke-dasharray="1.5 1.5"/>`;
 if(k==="belt")return `<rect x="6" y="44" width="88" height="12" rx="2" fill="${f}" stroke="${st}"/><rect x="18" y="41" width="12" height="18" rx="2" fill="none" stroke="#B9BDC1" stroke-width="2"/>`;
 const b=bodyPath(k);let id="";let defs="";if(PAT[w.id]){id="gp"+(++PID);defs=`<defs>${patDef(w,id)}</defs>`;}
 let s=defs+`<path d="${b}" fill="${f}" stroke="${st}" ${sw} stroke-linejoin="round"/>`+(id?`<path d="${b}" fill="url(#${id})"/>`:"");
 const L=(p,o="")=>`<path d="${p}" fill="none" stroke="${d}" stroke-width="1.2" ${o}/>`;
 const collar=`<path d="M42 8 L50 20 L45 24 L37 11 Z M58 8 L50 20 L55 24 L63 11 Z" fill="${f}" stroke="${st}" stroke-width=".8"/>`;
 const btn=(ys)=>ys.map(y=>`<circle cx="50" cy="${y}" r="1.2" fill="${d}"/>`).join("");
 switch(k){
  case"shirt":s+=collar+L("M50 20 L50 96")+btn([32,46,60,74,88])+L("M8 82 L18 84 M92 82 L82 84");break;
  case"ssshirt":s+=collar+L("M50 20 L50 94")+btn([32,48,64,80]);break;
  case"polo":s+=`<path d="M43 9 L50 17 L45 20 L39 12 Z M57 9 L50 17 L55 20 L61 12 Z" fill="${f}" stroke="${st}" stroke-width=".8"/>`+L("M50 17 L50 34")+btn([24,31])+L("M30 90 L70 90");break;
  case"lspolo":s+=`<path d="M43 9 L50 17 L45 20 L39 12 Z M57 9 L50 17 L55 20 L61 12 Z" fill="${f}" stroke="${st}" stroke-width=".8"/>`+L("M50 17 L50 34")+btn([24,31])+L("M30 92 L70 92 M8 78 L19 80 M92 78 L81 80");break;
  case"knitbutton":s+=`<path d="M43 9 L50 17 L45 20 L39 12 Z M57 9 L50 17 L55 20 L61 12 Z" fill="${f}" stroke="${st}" stroke-width=".8"/>`+L("M50 17 L50 94")+btn([28,42,56,70,84])+L("M30 90 L70 90");break;
  case"tee":s+=L("M42 9 Q50 16 58 9","stroke-width='2'");break;
  case"crew":s+=L("M42 8 Q50 15 58 8","stroke-width='2.4'")+L("M30 91 L70 91 M8 77 L19 79 M92 77 L81 79")+L("M34 92 L34 96 M40 92 L40 96 M46 92 L46 96 M52 92 L52 96 M58 92 L58 96 M64 92 L64 96");break;
  case"halfzip":s+=`<path d="M42 8 L42 2 L58 2 L58 8" fill="${f}" stroke="${st}" stroke-width=".8"/>`+L("M50 2 L50 38","stroke-width='1.6'")+L("M30 91 L70 91 M8 77 L19 79 M92 77 L81 79");break;
  case"rollneck":s=`<rect x="41" y="-2" width="18" height="14" rx="3" fill="${f}" stroke="${st}"/>`+s+L("M42 2 h16 M42 6 h16")+L("M30 91 L70 91 M8 77 L19 79 M92 77 L81 79");break;
  case"hoodie":s=`<path d="M38 12 Q36 -2 50 -2 Q64 -2 62 12" fill="${f}" stroke="${st}"/>`+s+L("M46 14 L46 26 M54 14 L54 26")+`<path d="M36 62 h28 v18 h-28 z" fill="none" stroke="${d}" stroke-width="1.2"/>`;break;
  case"blazer":s+=`<path d="M42 6 L50 52 L45 54 L33 14 Z M58 6 L50 52 L55 54 L67 14 Z" fill="${shade(f,ln(f)?-.06:.06)}" stroke="${st}" stroke-width=".8"/>`+btn([62,74])+L("M34 72 h10 M56 72 h10 M58 30 h8");break;
  case"coat":s+=`<path d="M42 6 L50 44 L45 46 L32 14 Z M58 6 L50 44 L55 46 L68 14 Z" fill="${shade(f,ln(f)?-.06:.06)}" stroke="${st}" stroke-width=".8"/>`+L("M50 44 L50 99")+btn([56,70,84])+L("M33 66 l8 2 M59 68 l8 -2");break;
  case"quilted":case"puffer":s+=`<path d="M40 6 L40 0 L60 0 L60 6" fill="${k==="quilted"?"#6B4E3D":f}" stroke="${st}" stroke-width=".8"/>`+L("M50 0 L50 90","stroke-width='1.6'")+(k==="puffer"?L("M29 24 h42 M29 40 h42 M29 56 h42 M29 72 h42 M20 40 l-6 20 M80 40 l6 20"):L("M30 30 L50 50 L70 30 M30 50 L50 70 L70 50 M30 70 L48 88 M70 70 L52 88 M30 30 L50 10 L70 30"));break;
  case"gilet":s+=L("M50 6 L50 92","stroke-width='1.6'")+L("M28 26 h44 M28 42 h44 M28 58 h44 M28 74 h44");break;
  case"jacket":s+=`<path d="M42 6 L50 18 L44 22 L36 10 Z M58 6 L50 18 L56 22 L64 10 Z" fill="${f}" stroke="${st}" stroke-width=".8"/>`+L("M50 18 L50 90")+btn([30,44,58,72])+`<path d="M34 30 h12 v10 h-12 z M54 30 h12 v10 h-12 z" fill="none" stroke="${d}"/>`+L("M28 82 h44");break;
  case"overshirt":s+=collar+L("M50 20 L50 96")+btn([32,46,60,74,88])+`<path d="M33 30 h11 v12 h-11 z M56 30 h11 v12 h-11 z" fill="none" stroke="${d}" stroke-width="1.1"/>`;break;
  case"fleece":s+=`<path d="M41 6 L41 0 L59 0 L59 6" fill="${f}" stroke="${st}"/>`+L("M50 0 L50 90","stroke-width='1.6'")+`<path d="M29 54 h42 v10 h-42 z" fill="none" stroke="${d}"/>`;break;
  case"trousers":case"jeans":s+=L("M26 10 L74 10")+L("M50 10 L50 28")+(k==="jeans"?L("M28 12 Q34 22 42 14 M72 12 Q66 22 58 14","stroke='#C89A55'"):L("M37 12 L38 96 M63 12 L62 96","stroke-dasharray='2 2'"));break;
  case"shorts":case"jshorts":s+=L("M24 26 L76 26")+L("M50 26 L50 40")+(k==="jshorts"?L("M27 28 Q33 36 40 29 M73 28 Q67 36 60 29","stroke='#C89A55'"):"");break;
 }
 return s;
}
function shoeSvg(w,k){const f=w.h,st="rgba(110,110,110,.8)",d=ln(f)?shade(f,-.25):shade(f,.22);
 const sole=k==="sneaker"?(w.id==="fCampus"?"#C9A06B":(w.id==="fVans"?"#1B1B1B":"#F3F3F1")):"#2A2522";
 const one=(x,y)=>{let p;
  if(k==="sneaker")p=`<path d="M4 34 Q5 18 20 16 L40 14 Q56 10 66 20 L90 28 Q97 32 96 38 L4 38 Z" fill="${f}" stroke="${st}"/><rect x="3" y="37" width="94" height="7" rx="3" fill="${sole}" stroke="${st}" stroke-width=".6"/>`+(w.id==="fNike"?`<path d="M30 30 Q55 34 80 22 Q60 30 34 26 Z" fill="#2E7D4F"/>`:"")+(w.id==="fCampus"?`<path d="M44 20 L52 36 M50 18 L58 34 M56 18 L64 34" stroke="#FFFFFF" stroke-width="2.4"/>`:"")+`<path d="M42 16 L58 22" stroke="${d}" stroke-width="1.2" stroke-dasharray="2 2"/>`;
  else if(k==="boot")p=`<path d="M12 40 L12 4 L36 4 L40 20 Q70 18 92 28 Q98 34 95 40 Z" fill="${f}" stroke="${st}"/><rect x="10" y="39" width="88" height="5" rx="2" fill="${sole}"/>`+(w.id==="fChelsea"?`<path d="M22 6 L28 22 L34 6" fill="${shade(f,.12)}"/>`:`<path d="M30 8 L30 24 M34 10 h-8 M34 15 h-8 M34 20 h-8" stroke="${d}" stroke-width="1.2"/>`);
  else p=`<path d="M6 34 Q8 22 22 22 L40 20 Q60 16 76 22 Q94 28 95 36 L95 40 L6 40 Z" fill="${f}" stroke="${st}"/><rect x="5" y="39" width="91" height="5" rx="2" fill="${sole}"/>`+(k==="derby"?`<path d="M40 22 L56 20 M42 26 L56 24 M44 30 L56 28" stroke="${d}" stroke-width="1.2"/>`+(w.id==="fOxford"?`<path d="M66 20 Q70 30 70 40" stroke="${d}" fill="none"/>`:""):`<path d="M36 24 Q50 20 62 22" stroke="${d}" fill="none" stroke-width="1.4"/>`+(w.id==="fLoafNavy"?`<circle cx="50" cy="28" r="2.2" fill="#5A3E2E"/><path d="M49 30 l-2 7 M51 30 l2 7" stroke="#5A3E2E" stroke-width="1.3"/>`:""));
  return `<g transform="translate(${x} ${y})">${p}</g>`;};
 return one(0,6)+one(6,46);}
function watchSvg(w){const dial=w.h,moon=w.id==="wMoon",strap=moon?"#1B1B1D":"#BFC3C7",cas=moon?"#232326":"#D3D6D9";
 const mesh=w.id==="wUnderdog";
 let s=`<rect x="38" y="0" width="24" height="100" rx="4" fill="${strap}" stroke="rgba(110,110,110,.7)"/>`;
 if(mesh)s+=`<pattern id="mesh${++PID}" width="2.5" height="2.5" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".5" fill="#8E9296"/></pattern><rect x="38" y="0" width="24" height="100" rx="4" fill="url(#mesh${PID})"/>`;
 else if(!moon)s+=`<path d="M38 12 h24 M38 24 h24 M38 76 h24 M38 88 h24" stroke="#9DA1A5"/>`;
 s+=`<circle cx="50" cy="50" r="30" fill="${cas}" stroke="rgba(110,110,110,.8)"/>`+(w.id==="wLongines"?`<circle cx="50" cy="50" r="27" fill="#3F4447"/>`:"")+`<circle cx="50" cy="50" r="23" fill="${dial}"/>`;
 const hc=ln(dial)?"#2A2D33":"#F2F2F0";
 s+=`<path d="M50 50 L50 34 M50 50 L61 56" stroke="${hc}" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="50" r="1.6" fill="${hc}"/>`;
 if(w.id==="wUnderdog"||w.id==="wMoon")s+=`<circle cx="41" cy="50" r="5" fill="none" stroke="${hc}" stroke-width=".8"/><circle cx="59" cy="50" r="5" fill="${moon?"#111":"#2A2D33"}" stroke="${hc}" stroke-width=".8"/>`;
 return s+`<rect x="80" y="46" width="5" height="8" rx="1" fill="${cas}"/>`;}
function thumb(w){const k=kindOf(w);const shoe=["sneaker","loafer","boot","derby"].includes(k);
 return `<svg viewBox="${shoe?"0 -5 100 100":"-4 -4 108 108"}" aria-hidden="true">${garment(w)}</svg>`;}
function board(all){
 const watch=all.find(w=>w.c==="Watches");
 const shoes=all.filter(w=>["sneaker","loafer","boot","derby"].includes(kindOf(w)));
 const bottoms=all.filter(w=>["trousers","jeans","shorts","jshorts"].includes(kindOf(w)));
 const tops=all.filter(w=>!shoes.includes(w)&&!bottoms.includes(w)&&w!==watch);
 const n=tops.length,span=n>1?Math.min(42,70/(n-1)):0,x0=n===1?30:4;
 let g=tops.map((w,i)=>`<g transform="translate(${x0+i*span} 2)">${garment(w)}</g>`).join("");
 g+=bottoms.map(w=>`<g transform="translate(172 ${["shorts","jshorts"].includes(kindOf(w))?-6:2}) scale(.98)">${garment(w)}</g>`).join("");
 g+=shoes.map(w=>`<g transform="translate(14 112) scale(.86)">${garment(w)}</g>`).join("");
 if(watch)g+=`<g transform="translate(120 108) scale(.78)">${garment(watch)}</g>`;
 return `<svg class="board" viewBox="0 0 272 192" role="img" aria-label="Flat-lay of ${all.map(w=>w.n).join(", ")}">${g}</svg>`;}

