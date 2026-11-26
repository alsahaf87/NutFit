/* NutFit — food data + "my plate" shared by index.html and foods.html */
{
const $=id=>document.getElementById(id);
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>Math.round(n).toLocaleString('ar-EG');

// [name, category, kcal, protein, carbs, fat] per 100 g — approximate values
const FOODS=[
['أرز أبيض مطبوخ','نشويات',130,2.7,28,0.3],['مكرونة مسلوقة','نشويات',158,5.8,31,0.9],['خبز بلدي / عربي','نشويات',275,9,55,1.2],
['شوفان','نشويات',389,16.9,66,6.9],['بطاطس مسلوقة','نشويات',87,1.9,20,0.1],['بطاطا مشوية','نشويات',90,2,21,0.2],
['فول مدمس','بقوليات',110,7.6,19.6,0.4],['عدس مطبوخ','بقوليات',116,9,20,0.4],['حمص مطبوخ','بقوليات',164,8.9,27,2.6],['طعمية (فلافل)','بقوليات',333,13.3,31.8,17.8],
['صدر دجاج مشوي','بروتين',165,31,0,3.6],['بيض مسلوق','بروتين',155,13,1.1,11],['لحم بقري مشوي','بروتين',250,26,0,15],
['سمك بلطي مشوي','بروتين',128,26,0,2.7],['تونة معلبة بالماء','بروتين',116,26,0,1],['كبدة مشوية','بروتين',175,27,5,5],
['زبادي','ألبان',61,3.5,4.7,3.3],['جبنة قريش','ألبان',98,11,3.4,4.3],['لبن كامل الدسم','ألبان',61,3.2,4.8,3.3],['جبنة رومي','ألبان',390,25,1,32],
['موز','فواكه',89,1.1,23,0.3],['تفاح','فواكه',52,0.3,14,0.2],['برتقال','فواكه',47,0.9,12,0.1],['تمر','فواكه',282,2.5,75,0.4],['بطيخ','فواكه',30,0.6,7.6,0.2],
['خيار','خضار',15,0.7,3.6,0.1],['طماطم','خضار',18,0.9,3.9,0.2],['خس','خضار',15,1.4,2.9,0.2],['بروكلي مسلوق','خضار',35,2.4,7,0.4],['جزر','خضار',41,0.9,10,0.2],
['زيت زيتون','دهون ومكسرات',884,0,0,100],['لوز','دهون ومكسرات',579,21,22,50],['زبدة فول سوداني','دهون ومكسرات',588,25,20,50],['طحينة','دهون ومكسرات',595,17,21,54]
];
const CATS=['الكل',...new Set(FOODS.map(f=>f[1]))];
let cat='الكل';
const match=f=>{const q=($('q')?.value||'').trim();return (cat==='الكل'||f[1]===cat)&&(!q||f[0].includes(q))};

/* ----- category chips ----- */
const chips=$('chips');
if(chips){
  chips.innerHTML=CATS.map(c=>`<button type="button" data-c="${c}" aria-pressed="${c===cat}">${c}</button>`).join('');
  chips.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.c;chips.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
}

/* ----- compact strip (home) ----- */
function renderStrip(){
  const el=$('strip');if(!el)return;
  const rows=FOODS.map((f,i)=>[f,i]).filter(([f])=>match(f));
  el.innerHTML=rows.length?rows.map(([f,i])=>`<div class="fc"><div class="fn">${f[0]}</div><div class="fk">${f[2]}<small>سعر</small></div><div class="fm"><span>ب ${f[3]}</span><span>ك ${f[4]}</span><span>د ${f[5]}</span></div><button class="add" type="button" data-i="${i}" aria-label="أضف ${f[0]} لطبقي">+</button></div>`).join('')
    :'<div class="empty">مفيش أكلة بالاسم ده. جرّب كلمة تانية.</div>';
  el.scrollTo({left:0});
  const c=$('count');if(c)c.textContent=fmt(rows.length);
}
/* ----- full table (foods page) ----- */
function renderTable(){
  const tb=$('tb');if(!tb)return;
  const rows=FOODS.map((f,i)=>[f,i]).filter(([f])=>match(f));
  tb.innerHTML=rows.length?rows.map(([f,i])=>`<tr><td>${f[0]}</td><td>${f[1]}</td><td class="num" data-l="سعرات">${f[2]}</td><td class="num" data-l="بروتين">${f[3]}</td><td class="num" data-l="كارب">${f[4]}</td><td class="num" data-l="دهون">${f[5]}</td><td><button class="add" data-i="${i}" aria-label="أضف ${f[0]} لطبقي">+</button></td></tr>`).join('')
    :`<tr><td colspan="7" class="empty">مفيش أكلة بالاسم ده. جرّب كلمة تانية.</td></tr>`;
  const c=$('count');if(c)c.textContent=fmt(rows.length);
}
function render(){renderStrip();renderTable()}
$('q')?.addEventListener('input',render);
const sp=$('sprev'),sn=$('snext');
const slide=d=>{const s=$('strip');s.scrollBy({left:d*s.clientWidth*.8,behavior:'smooth'})};
sp?.addEventListener('click',()=>slide(1));sn?.addEventListener('click',()=>slide(-1));

/* ----- my plate ----- */
let plate=store.get('nut-plate',[]).filter(p=>FOODS[p.i]);
document.addEventListener('click',e=>{const b=e.target.closest('.add');if(!b)return;const i=+b.dataset.i;const ex=plate.find(p=>p.i===i);if(ex)ex.g+=100;else plate.push({i,g:100});
  b.classList.add('done');setTimeout(()=>b.classList.remove('done'),600);plateRender()});
$('plist')?.addEventListener('input',e=>{const x=e.target.closest('input');if(!x)return;plate[+x.dataset.k].g=Math.max(0,+x.value||0);plateTotals()});
$('plist')?.addEventListener('click',e=>{const b=e.target.closest('.rm');if(!b)return;plate.splice(+b.dataset.k,1);plateRender()});
$('clr')?.addEventListener('click',()=>{plate=[];plateRender()});
function plateRender(){
  const pl=$('plist');
  if(pl)pl.innerHTML=plate.length?plate.map((p,k)=>`<div class="pi"><span>${FOODS[p.i][0]}</span><input type="number" inputmode="numeric" min="0" step="10" value="${p.g}" data-k="${k}" aria-label="الكمية بالجرام"><button class="rm" type="button" data-k="${k}" aria-label="شيل">×</button></div>`).join('')
    :'<div class="empty">طبقك فاضي. دوس + على أي أكلة.</div>';
  plateTotals();
}
function plateTotals(){
  const t=[0,0,0,0];plate.forEach(p=>{const f=FOODS[p.i];for(let j=0;j<4;j++)t[j]+=f[j+2]*p.g/100});
  [['tk',0],['tp',1],['tc',2],['tf',3]].forEach(([id,j])=>{if($(id))$(id).textContent=fmt(t[j])});
  const kcal=(store.get('nut-calc',{})||{}).kcal;
  if($('share'))$('share').textContent=kcal&&t[0]?`الطبق ده حوالي ${fmt(t[0]/kcal*100)}٪ من سعراتك اليومية.`:'';
  if($('pcount'))$('pcount').textContent=plate.length?`${fmt(plate.length)} أصناف · ${fmt(t[0])} سعر`:'فاضي';
  store.set('nut-plate',plate);
}
window.NFplate={render:plateRender};
render();plateRender();
}
