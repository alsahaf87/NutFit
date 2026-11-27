/* NutFit — "ابدأ رحلتك" quiz */
{
const $=id=>document.getElementById(id);
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>Math.round(n).toLocaleString('ar-EG');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const TIPS=[
 ['برنامج مصمم على هدفك','كل إجابة بتساعدنا نظبط لك التمارين والسعرات بدقة.'],
 ['تمرّن من أي مكان','في البيت أو الجيم، بأدوات أو من غير، هنعمل لك البرنامج المناسب.'],
 ['سعرات محسوبة علميًا','بنحسب احتياجك بمعادلات معتمدة حسب وزنك وطولك وعمرك ونسبة دهونك.'],
 ['على قد مستواك','البرنامج بيبدأ معاك من مستواك الحالي ويتطور مع تقدمك.'],
 ['على مزاجك','اختار الأيام والوقت اللي يناسبوك، والبرنامج يمشي معاك.']
];
const ICO={
 lose:'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8.5 9a4.5 4.5 0 0 1 7 0M12 9l1.5-2',
 gain:'M7 20c-2-3-2-7 1-9l2-5c1-2 4-1 4 1l-1 3c3 0 6 2 6 6 0 3-3 5-6 4M6 13l-2 1',
 home:'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
 gym:'M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12'
};
const STEPS=[
 {k:'goal',s:0,t:'اختار هدفك الحالي',d:'ما هو هدفك الذي تريد تحقيقه؟',type:'one',o:[['lose','خسارة الوزن والدهون','وزني زائد وأريد التركيز على حرق الدهون'],['gain','اكتساب كتلة عضلية','هدفي الوصول لجسم رياضي وزيادة الكتلة العضلية']]},
 {k:'place',s:1,t:'أين مكان تمرينك؟',d:'كي نساعدك على تصميم برنامجك المثالي، حدد مكان التمرين',type:'one',o:[['home','أتمرن من المنزل','وزن الجسم بأدوات بسيطة أو بدون أدوات'],['gym','أتمرن في الجيم','استخدام الأوزان الحرة والأجهزة المختلفة']]},
 {k:'info',s:2,t:'ادخل معلوماتك الشخصية',d:'كي نساعدك على تصميم البرنامج المثالي، أخبرنا المزيد عنك',type:'info'},
 {k:'fat',s:2,t:'ما هي نسبة الدهون بجسمك؟',d:'كي نساعدك على تصميم برنامجك المثالي، أخبرنا المزيد عنك',type:'grid',o:[['7','9% - 5%'],['12','14% - 10%'],['17','19% - 15%'],['22','24% - 20%'],['27','29% - 25%'],['32','34% - 30%'],['37','39% - 35%'],['42','45% - 40%'],['0','مش عارف']]},
 {k:'level',s:3,t:'ما هو مستواك الرياضي؟',d:'كيف تقيّم مستواك الرياضي حاليًا',type:'one',o:[['beg','مبتدئ','لدي خبرة قليلة وأجهد بسرعة'],['act','نشيط','أتمرن بشكل متقطع ولدي لياقة متوسطة'],['mid','متوسط','أتمرن بشكل منتظم ولياقتي مرتفعة'],['pro','محترف','أنا شخص رياضي وأستطيع أداء تمارين متقدمة']]},
 {k:'tools',s:4,t:'ما هي تفضيلاتك في التمرين؟',d:'',type:'multi',g:[['أدوات أساسية','يجب اختيار أداة أو أكثر لتصميم برنامجك المثالي',['حبل مقاومة','كاتل بيل','بار','دامبل','لا يوجد عندي أدوات للتمرين']],['أدوات أخرى','أدوات أخرى لتنويع نظام تدريبك',['اليبتيكال','دراجة ثابتة','عقلة','سير']]],need:0},
 {k:'time',s:4,t:'ما هي تفضيلاتك في التمرين؟',d:'وقت التمرين',type:'one',o:[['short','من 10-25 دقيقة',''],['med','من 30-60 دقيقة',''],['long','من 60-90 دقيقة','']]},
 {k:'days',s:4,t:'ما هي تفضيلاتك في التمرين؟',d:'عدد أيام التمرين — اختار أيام التمرين',type:'days',o:['سبت','أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة']},
 {k:'done',s:5,type:'done'}
];
const A=Object.assign({sex:'m',age:'',h:'',w:'',tools:[],days:[]},store.get('nut-quiz',{}));
let i=0;
const save=()=>store.set('nut-quiz',A);

function valid(st){
  if(st.type==='one'||st.type==='grid')return A[st.k]!=null&&A[st.k]!=='';
  if(st.type==='info'){const a=+A.age,h=+A.h,w=+A.w;return a>=13&&a<=90&&h>=120&&h<=230&&w>=35&&w<=250}
  if(st.type==='multi')return A.tools.some(t=>STEPS[5].g[0][2].includes(t));
  if(st.type==='days')return A.days.length>0;
  return true;
}
function opt(v,title,sub,on,ico){return `<button type="button" class="qo${on?' on':''}" data-v="${esc(v)}" aria-pressed="${on}">${ico?`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ico}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`:''}<span><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:''}</span></button>`}
function render(){
  const st=STEPS[i];
  document.querySelectorAll('#qsteps li').forEach((li,n)=>{li.className=n<st.s?'done':n===st.s?'cur':''});
  $('qbar').style.width=(i/(STEPS.length-1)*100)+'%';
  $('qback').style.visibility=i?'visible':'hidden';
  const r=TIPS[i%TIPS.length];
  $('qrev').innerHTML=`<img src="assets/brand/logo-icon.webp" alt="" width="64" height="64"><b>${esc(r[0])}</b><p>${esc(r[1])}</p>`;
  const B=$('qbody');let h='';
  if(st.type==='done'){h=result();$('qnext').hidden=true}
  else{
    $('qnext').hidden=false;
    h=`<h1>${esc(st.t)}</h1>${st.d?`<p class="qd">${esc(st.d)}</p>`:''}`;
    if(st.type==='one')h+=`<div class="qopts">${st.o.map(o=>opt(o[0],o[1],o[2],A[st.k]===o[0],ICO[o[0]])).join('')}</div>`;
    if(st.type==='grid')h+=`<div class="qopts g3">${st.o.map(o=>opt(o[0],o[1],'',A[st.k]===o[0])).join('')}</div>`;
    if(st.type==='info')h+=`<div class="seg qsex" id="qsex"><button type="button" data-v="m" aria-pressed="${A.sex==='m'}">ذكر</button><button type="button" data-v="f" aria-pressed="${A.sex==='f'}">أنثى</button></div>
      <div class="qin"><label>العمر (سنة)<input id="qa" type="number" inputmode="numeric" min="13" max="90" value="${esc(A.age)}" placeholder="مثلًا 28"></label><label>الطول (سم)<input id="qh" type="number" inputmode="numeric" min="120" max="230" value="${esc(A.h)}" placeholder="مثلًا 170"></label><label>الوزن (كجم)<input id="qw" type="number" inputmode="decimal" min="35" max="250" value="${esc(A.w)}" placeholder="مثلًا 75"></label><label class="qtw">الوزن اللي نفسك توصله (اختياري)<input id="qt" type="number" inputmode="decimal" min="35" max="250" value="${esc(A.tw||'')}" placeholder="مثلًا 68"></label></div>`;
    if(st.type==='multi')h+=st.g.map(g=>`<h3 class="qg">${esc(g[0])}</h3><p class="note">${esc(g[1])}</p><div class="qchips">${g[2].map(t=>`<button type="button" class="qc" data-t="${esc(t)}" aria-pressed="${A.tools.includes(t)}">${esc(t)}</button>`).join('')}</div>`).join('');
    if(st.type==='days')h+=`<div class="qchips days">${st.o.map(d=>`<button type="button" class="qc" data-d="${esc(d)}" aria-pressed="${A.days.includes(d)}">${esc(d)}</button>`).join('')}</div><p class="note" id="dn"></p>`;
  }
  B.innerHTML=h;update();
  B.querySelector('h1')?.focus?.();
}
function update(){
  const st=STEPS[i];$('qnext').disabled=!valid(st);
  if(st.type==='days'&&$('dn'))$('dn').textContent=A.days.length?`${fmt(A.days.length)} أيام في الأسبوع`:'';
}
$('qbody').addEventListener('click',e=>{
  const st=STEPS[i];const o=e.target.closest('.qo'),c=e.target.closest('.qc'),sx=e.target.closest('#qsex button');
  if(o){A[st.k]=o.dataset.v;save();render();if(st.type!=='info')setTimeout(next,220);return}
  if(sx){A.sex=sx.dataset.v;save();render();return}
  if(c&&c.dataset.t){const t=c.dataset.t,none='لا يوجد عندي أدوات للتمرين';
    if(A.tools.includes(t))A.tools=A.tools.filter(x=>x!==t);else{A.tools.push(t);if(t===none)A.tools=A.tools.filter(x=>x===none||!STEPS[5].g[0][2].includes(x));else A.tools=A.tools.filter(x=>x!==none)}
    save();render();return}
  if(c&&c.dataset.d){const d=c.dataset.d;A.days=A.days.includes(d)?A.days.filter(x=>x!==d):[...A.days,d];save();render();return}
  if(e.target.closest('#qagain')){i=0;render();return}
});
$('qbody').addEventListener('input',e=>{const m={qa:'age',qh:'h',qw:'w',qt:'tw'}[e.target.id];if(m){A[m]=e.target.value;save();update()}});
function next(){if(!valid(STEPS[i]))return;if(i<STEPS.length-1){i++;render();window.scrollTo({top:0,behavior:'smooth'})}}
$('qnext').addEventListener('click',next);
$('qback').addEventListener('click',()=>{if(i>0){i--;render()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('qnext').disabled&&!$('qnext').hidden&&e.target.tagName!=='BUTTON')next()});

function result(){
  const w=+A.w,h=+A.h,a=+A.age,fat=+A.fat||0,n=A.days.length;
  const act=n<=1?1.2:n<=3?1.375:n<=5?1.55:1.725;
  const bmr=fat>0?370+21.6*w*(1-fat/100):10*w+6.25*h-5*a+(A.sex==='m'?5:-161);
  let k=bmr*act+(A.goal==='lose'?-500:300);
  const floor=A.sex==='m'?1500:1200;if(k<floor)k=floor;
  let p,f,c;
  if(A.goal==='gain'){p=k*.4/4;f=k*.3/9;c=k*.3/4}else{p=w*2;f=k*.25/9;c=Math.max(0,(k-p*4-f*9)/4)}
  store.set('nut-calc',Object.assign(store.get('nut-calc',{}),{sex:A.sex,age:A.age,h:A.h,w:A.w,act:String(act),goal:A.goal==='gain'?'gain':'lose',kcal:k}));
  const lab=(k,v)=>{const s=STEPS.find(x=>x.k===k);return (s.o.find(o=>o[0]===v)||[])[1]||''};
  const chips=[lab('goal',A.goal),lab('place',A.place),lab('level',A.level),lab('time',A.time),`${fmt(n)} أيام تمرين`,...A.tools].filter(Boolean);
  const hm=h/100;let tw=+A.tw;
  if(!(tw>=35&&tw<=250)||(A.goal!=='gain'&&tw>=w)||(A.goal==='gain'&&tw<=w))tw=A.goal==='gain'?w+4:Math.round(Math.max(24.9*hm*hm,w*0.9));
  const rate=A.goal==='gain'?0.25:Math.min(1,Math.max(0.5,w*0.0075));
  const wk=Math.max(1,Math.ceil(Math.abs(w-tw)/rate));
  const dt=new Date(Date.now()+wk*7*864e5);
  const ds=dt.toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'});
  const W=320,H=150,P=24,y=v=>P+(Math.max(w,tw)-v)/(Math.abs(w-tw)||1)*(H-2*P),pts=[];
  for(let i=0;i<=8;i++){const t=i/8,v=w+(tw-w)*(1-Math.pow(1-t,1.4));pts.push(`${(W-P)-(t*(W-2*P))},${y(v).toFixed(1)}`)}
  const chart=`<svg class="qchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="مسار الوزن المتوقع"><line x1="${P}" y1="${y(tw)}" x2="${W-P}" y2="${y(tw)}" stroke="#259D4E" stroke-dasharray="5 5"/><polyline points="${pts.join(' ')}" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${W-P}" cy="${y(w)}" r="7" fill="#111"/><circle cx="${P}" cy="${y(tw)}" r="9" fill="#259D4E"/><text x="${W-P}" y="${y(w)-14}" text-anchor="middle" class="ql">${fmt(w)} كجم</text><text x="${P+4}" y="${y(tw)+(A.goal==='gain'?-16:28)}" text-anchor="middle" class="ql g">${fmt(tw)} كجم</text></svg>`;
  const sum=`أهلًا د. محمد، دي نتيجة اختبار NutFit بتاعتي:\nالهدف: ${lab('goal',A.goal)}\nالنوع: ${A.sex==='m'?'ذكر':'أنثى'} · العمر: ${A.age}\nالطول: ${A.h} سم · الوزن: ${A.w} كجم · المستهدف: ${tw} كجم\nنسبة الدهون: ${fat?fat+'٪ تقريبًا':'مش عارف'}\nالمستوى: ${lab('level',A.level)} · المكان: ${lab('place',A.place)}\nأيام التمرين: ${A.days.join('، ')} · الوقت: ${lab('time',A.time)}\nالأدوات: ${A.tools.join('، ')}\nالسعرات المقترحة: ${Math.round(k)} سعر\nعايز أبدأ المتابعة.`;
  const wl=window.NF&&NF.waLink?NF.waLink(sum):'';
  return `<span class="eyebrow">برنامجك جاهز</span><h1>${A.goal==='gain'?'هتوصل':'هتوصل'} لـ ${fmt(tw)} كجم تقريبًا في ${ds}</h1>
  <p class="qd">حوالي ${fmt(wk)} أسبوع بمعدل صحي ${A.goal==='gain'?'ربع كيلو':(Math.round(rate*10)/10).toLocaleString('ar-EG')+' كجم'} في الأسبوع، لو التزمت بالنظام والتمرين.</p>
  ${chart}
  <div class="big qres"><small>${A.goal==='gain'?'سعراتك اليومية لاكتساب كتلة عضلية':'سعراتك اليومية لخسارة الوزن والدهون'}</small><div class="n">${fmt(k)}<span>سعر حراري</span></div>
   <div class="qmac"><div><b>${fmt(p)}</b>جم بروتين</div><div><b>${fmt(c)}</b>جم كارب</div><div><b>${fmt(f)}</b>جم دهون</div></div></div>
  <div class="qsum">${chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
  <div class="qend">${wl?`<a class="btn" href="${wl}">ابعت نتيجتك لد. محمد على الواتساب</a>`:`<a class="btn" href="book.html">احجز متابعتك مع د. محمد</a>`}<a class="btn ghost" href="pricing.html">شوف باقات المتابعة</a></div>
  <p class="note">التاريخ والأرقام تقديرية${fat?' ومحسوبة بنسبة الدهون (معادلة Katch-McArdle)':' (معادلة Mifflin-St Jeor)'}، والنتيجة بتختلف من شخص للتاني. <button class="linkb" id="qagain" type="button">عدّل إجاباتك</button></p>`;
}
render();
}
