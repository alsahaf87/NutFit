/* NutFit — science-based weekly training plan with exercise photos */
{
const $=id=>document.getElementById(id);
const A=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const EX=Object.fromEntries((window.EXERCISES||[]).map(e=>[e.k,e]));
const POOL={
 g:{squat:['squat','legpress'],hinge:['rdl'],lunge:['dblunge'],glute:['hipthrust'],ham:['legcurl'],quad:['legext'],calf:['calf'],hpush:['bench','dbbench'],incline:['incline'],vpush:['dbpress'],hpull:['cablerow','dbrow'],vpull:['latpull','pullup'],rear:['facepull'],lat:['lateral'],bi:['curl','hammer'],tri:['pushdown'],core:['plank','crunch','deadbug']},
 d:{squat:['goblet'],hinge:['rdl'],lunge:['dblunge'],glute:['bridge'],ham:['rdl'],quad:['goblet'],calf:['bwsquat'],hpush:['dbbench','pushup'],incline:['incline'],vpush:['dbpress'],hpull:['dbrow'],vpull:['dbrow','invrow'],rear:['lateral'],lat:['lateral'],bi:['curl','hammer'],tri:['dips'],core:['plank','deadbug','crunch']},
 b:{squat:['bwsquat'],hinge:['superman'],lunge:['bwlunge'],glute:['bridge'],ham:['bridge'],quad:['bwlunge'],calf:['bwsquat'],hpush:['pushup'],incline:['pushup'],vpush:['pushup'],hpull:['invrow'],vpull:['pullup','invrow'],rear:['superman'],lat:['superman'],bi:['invrow'],tri:['dips'],core:['plank','mclimb','deadbug','crunch']}
};
const T={
 fa:['جسم كامل (أ)',['squat','hpush','hpull','hinge','vpush','core','bi']],
 fb:['جسم كامل (ب)',['lunge','incline','vpull','glute','lat','core','tri']],
 up:['الجزء العلوي',['hpush','vpull','vpush','hpull','lat','bi','tri']],
 lo:['الجزء السفلي',['squat','hinge','lunge','ham','calf','core','glute']],
 pu:['دفع (صدر وأكتاف وترايسبس)',['hpush','incline','vpush','lat','tri','core']],
 pl:['سحب (ظهر وبايسبس)',['vpull','hpull','rear','bi','core','hinge']],
 lg:['أرجل ومؤخرة',['squat','hinge','lunge','quad','ham','calf']]
};
const SPLIT={2:['fa','fb'],3:['fa','fb','fa'],4:['up','lo','up','lo'],5:['up','lo','pu','pl','lg'],6:['pu','pl','lg','pu','pl','lg']};
const WEEK={2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,4,5],6:[0,1,2,3,4,5]};
const DAYS=['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
const ISO=new Set(['lat','bi','tri','rear','calf','core','quad','ham']);
function rx(goal,level,slot){
  const sets=level==='beg'?(ISO.has(slot)?2:3):level==='adv'?(ISO.has(slot)?3:4):3;
  let reps={muscle:ISO.has(slot)?'١٠–١٥':'٦–١٠',recomp:ISO.has(slot)?'١٠–١٥':'٨–١٢',lose:'١٠–١٥',health:'١٠–١٥'}[goal];
  if(slot==='core')reps='٣٠–٤٥ ث أو ١٢–١٥';
  const rest=ISO.has(slot)?'٦٠ ث':(goal==='muscle'?'٢ د':'٩٠ ث');
  return {sets,reps,rest};
}
function plan(o){
  const n=Math.max(2,Math.min(6,+o.days||3));const per=o.min<=30?4:o.min<=45?5:o.min<=60?6:7;
  const pool=POOL[o.place]||POOL.g;const keys=SPLIT[n];const used={};
  return keys.map((t,i)=>{const [title,slots]=T[t];const v=(used[t]=(used[t]||0)+1)-1;
    const ex=[];const seen=new Set();
    for(const s of slots){if(ex.length>=per)break;const opts=pool[s];const k=opts[v%opts.length];if(seen.has(k)||!EX[k])continue;seen.add(k);ex.push({...EX[k],slot:s,...rx(o.goal,o.level,s)})}
    return {day:DAYS[WEEK[n][i]],title,ex}});
}
const GOAL={lose:'خسارة دهون',muscle:'بناء عضل',recomp:'خسارة دهون وبناء عضل',health:'لياقة وصحة'};
const PLACE={g:'الجيم',d:'البيت بدمبلز',b:'البيت من غير أدوات'};
function render(o){
  const P=plan(o);const n=P.length;
  const card=e=>`<li class="exr"><div class="exi"><img src="assets/ex/${e.k}-0.webp" alt="${e.n} — البداية" loading="lazy" width="360" height="240"><img src="assets/ex/${e.k}-1.webp" alt="${e.n} — النهاية" loading="lazy" width="360" height="240"></div>
    <div class="ext"><b>${e.n}</b><small dir="ltr">${e.en}</small><span class="exm">${e.m}</span>
    <div class="exrx"><span><b>${A(e.sets)}</b> مجموعات</span><span><b>${e.reps}</b> عدة</span><span>راحة <b>${e.rest}</b></span></div></div></li>`;
  const days=P.map((d,i)=>`<details class="trday"${i===0?' open':''}><summary><span class="dn">${d.day}</span><b>${d.title}</b><small>${A(d.ex.length)} تمارين</small></summary><ol class="exl">${d.ex.map(card).join('')}</ol></details>`).join('');
  const cardio=o.goal==='lose'||o.goal==='recomp'?`<li>كارديو: مشي سريع ٢٠–٣٠ دقيقة بعد التمرين أو في أيام الراحة، و٨–١٠ آلاف خطوة في اليوم.</li>`:`<li>كارديو خفيف ١٠–٢٠ دقيقة يومين في الأسبوع لصحة القلب.</li>`;
  const msg=`أهلًا د. محمد، عملت نظام تمرين على NutFit وعايز تكمل معايا.\nالهدف: ${GOAL[o.goal]} · المكان: ${PLACE[o.place]} · ${n} أيام في الأسبوع.`;
  const WL=window.NF&&NF.waLink?NF.waLink(msg):'book.html';
  $('trout').innerHTML=`<div class="trhead"><span class="eyebrow">برنامجك جاهز</span><h2>${A(n)} أيام · ${GOAL[o.goal]} · ${PLACE[o.place]}</h2>
  <div class="trweek">${DAYS.map(d=>{const x=P.find(p=>p.day===d);return `<span class="${x?'on':''}"><b>${d}</b>${x?x.title.split(' (')[0]:'راحة'}</span>`}).join('')}</div></div>
  <div class="trdays">${days}</div>
  <div class="iban"><h3>قواعد البرنامج</h3><ul>
   <li>إحماء ٥–١٠ دقايق قبل كل تمرين، وأول مجموعة في كل تمرينة تبقى خفيفة.</li>
   <li>اختار وزن تقدر تعمل بيه العدات المطلوبة وفاضلك تقريبًا ٢–٣ عدات قبل ما تتعب خالص.</li>
   <li>زوّد الوزن أو العدات شوية كل أسبوع أو اتنين (Progressive Overload).</li>${cardio}
   <li>لو حسيت بألم في المفاصل (مش تعب العضلة) وقّف التمرينة.</li></ul></div>
  <div class="ibcta"><div><h3>عايز برنامج متابَع ومعدّل على حالتك؟</h3><p>د. محمد يظبط البرنامج مع نظامك الغذائي ويتابع تقدمك كل أسبوع.</p></div><a class="btn" href="${WL}">كمّل مع د. محمد على الواتساب</a></div>
  <div class="ibact"><button class="btn ghost" type="button" id="trprint">احفظ البرنامج PDF</button><a class="btn ghost" href="inbody.html">اعمل نظام أكل كمان</a></div>
  <p class="note">البرنامج استرشادي للأشخاص الأصحاء، ومبني على توصيات ACSM ومنظمة الصحة العالمية ودراسات حجم التمرين. لو عندك إصابة أو مرض في القلب أو ضغط غير منتظم، استشر طبيبك الأول. <a href="references.html#training">المصادر العلمية</a>. صور التمارين من <bdi>free-exercise-db</bdi> (ملكية عامة).</p>`;
  $('trout').hidden=false;$('trout').scrollIntoView({behavior:'smooth',block:'start'});
  $('trprint').addEventListener('click',()=>{document.querySelectorAll('.trday').forEach(x=>x.open=true);window.print()});
}
const st={goal:'lose',place:'g',level:'beg',days:'3'};
document.querySelectorAll('#trf .seg').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;st[s.dataset.k]=b.dataset.v;s.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
$('trf').addEventListener('submit',e=>{e.preventDefault();render({...st,min:+$('trmin').value})});
let pre=null;try{pre=JSON.parse(localStorage.getItem('nut-train-prefill')||'null');localStorage.removeItem('nut-train-prefill')}catch(e){}
if(pre){Object.assign(st,pre);document.querySelectorAll('#trf .seg').forEach(s=>s.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===String(st[s.dataset.k]))));render({...st,min:+(pre.min||$('trmin').value)})}
window.NFTrain={plan};
}
