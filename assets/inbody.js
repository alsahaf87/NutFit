/* NutFit — InBody photo → 7-day meal plan. All processing happens on the visitor's device. */
{
const $=id=>document.getElementById(id);
const A=n=>Math.round(n).toLocaleString('ar-EG');
const A1=n=>(Math.round(n*10)/10).toLocaleString('ar-EG');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=window.RECIPES||[];

/* ---------- 1. read the photo ---------- */
const F={sex:'m',age:'',h:'',w:'',pbf:'',bfm:'',smm:'',bmr:'',vfl:'',score:''};
const toNum=s=>s==null?'':String(s).replace(',','.');
function parse(raw){
  const t=raw.replace(/[‐-―~]/g,'-').replace(/\s+/g,' ');
  const g=(re)=>{const m=t.match(re);return m?toNum(m[m.length-1]):''};
  const o={};
  o.w=g(/(?:weight|الوزن)[^0-9]{0,25}(\d{2,3}[.,]\d)/i);
  o.smm=g(/(?:skeletal\s*muscle\s*mass|\bSMM\b|كتلة\s*العضلات(?:\s*الهيكلية)?)[^0-9]{0,30}(\d{1,2}[.,]\d)/i);
  o.bfm=g(/(?:body\s*fat\s*mass|كتلة\s*الدهون)[^0-9]{0,30}(\d{1,3}[.,]\d)/i);
  o.pbf=g(/(?:percent\s*body\s*fat|\bPBF\b|نسبة\s*الدهون)[^0-9]{0,30}(\d{1,2}[.,]\d)/i);
  o.bmr=g(/(?:basal\s*metabolic\s*rate|\bBMR\b|معدل\s*الأيض)[^0-9]{0,20}(\d{3,4})/i);
  o.h=g(/(?:height|الطول)[^0-9]{0,10}(\d{3}(?:[.,]\d)?)/i);
  o.age=g(/(?:\bage\b|العمر)[^0-9]{0,10}(\d{2})/i);
  o.vfl=g(/(?:visceral\s*fat\s*level|دهون\s*الأحشاء)[^0-9]{0,20}(\d{1,2})/i);
  o.score=g(/(?:inbody\s*score)[^0-9]{0,20}(\d{2,3})/i);
  if(/\bfemale\b|أنثى/i.test(t))o.sex='f';else if(/\bmale\b|ذكر/i.test(t))o.sex='m';
  // sanity checks
  if(o.w&&(+o.w<30||+o.w>300))o.w='';if(o.h&&(+o.h<120||+o.h>230))o.h='';
  if(o.pbf&&(+o.pbf<3||+o.pbf>70))o.pbf='';if(o.age&&(+o.age<10||+o.age>95))o.age='';
  if(!o.pbf&&o.bfm&&o.w)o.pbf=(o.bfm/o.w*100).toFixed(1);
  return o;
}
let worker=null;
async function ocr(file){
  $('ibprog').hidden=false;setProg(5,'بنجهز قارئ الصور…');
  try{
    if(!worker){
      worker=await Tesseract.createWorker('eng',1,{workerPath:'assets/ocr/worker.min.js',corePath:'assets/ocr/',langPath:'assets/ocr/',gzip:false,
        logger:m=>{if(m.status==='recognizing text')setProg(30+m.progress*65,'بنقرا الأرقام من الورقة…');else if(m.progress)setProg(5+m.progress*25,'بنجهز قارئ الصور…')}});
    }
    const img=await prep(file);
    const {data}=await worker.recognize(img);
    const o=parse(data.text);
    const found=Object.entries(o).filter(([k,v])=>v&&k!=='sex').length;
    Object.assign(F,Object.fromEntries(Object.entries(o).filter(([,v])=>v)));
    fill();setProg(100,found>=3?`قرينا ${A(found)} قيم من الورقة. راجعها وصحّح أي رقم غلط.`:'ما قدرناش نقرا الورقة كويس. اكتب الأرقام بنفسك، أو صوّر تاني في إضاءة أحسن والورقة مفرودة.');
    $('ibprog').classList.toggle('warn',found<3);
  }catch(e){setProg(100,'حصلت مشكلة في قراءة الصورة. اكتب الأرقام بنفسك تحت.');$('ibprog').classList.add('warn')}
  show('ibform');
}
function prep(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{
  const s=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;
  const x=c.getContext('2d');x.filter='grayscale(1) contrast(1.4)';x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c)};im.onerror=rej;im.src=u})}
function setProg(p,t){$('ibbar').style.width=p+'%';$('ibmsg').textContent=t}
function onFile(e){const f=e.target.files&&e.target.files[0];if(!f)return;
  $('ibprev').src=URL.createObjectURL(f);$('ibprev').hidden=false;$('ibprog').classList.remove('warn');ocr(f);e.target.value=''}
$('ibcam').addEventListener('change',onFile);$('ibgal').addEventListener('change',onFile);
$('ibmanual').addEventListener('click',()=>{$('ibprog').hidden=true;fill();show('ibform')});

/* ---------- 2. form ---------- */
const keys=['age','h','w','pbf','smm','bfm','bmr','vfl'];
function fill(){keys.forEach(k=>{$('i_'+k).value=F[k]||''});setSeg('ibsex',F.sex)}
function setSeg(id,v){$(id).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v))}
$('ibsex').addEventListener('click',e=>{const b=e.target.closest('button');if(b){F.sex=b.dataset.v;setSeg('ibsex',F.sex)}});
let goal='lose';
$('ibgoal').addEventListener('click',e=>{const b=e.target.closest('button');if(b){goal=b.dataset.v;setSeg('ibgoal',goal)}});
function show(id){['ibstart','ibform','ibplan'].forEach(s=>{if(s!=='ibstart')$(s).hidden=s!==id});if(id!=='ibstart')$(id).scrollIntoView({behavior:'smooth',block:'start'})}

/* ---------- 3. plan ---------- */
const GOALS={lose:'خسارة دهون',muscle:'بناء عضل',recomp:'خسارة دهون وبناء عضل مع بعض',health:'تحسين الصحة وثبات الوزن'};
const PORT=[[0.5,'نص حصة'],[0.75,'تلت أرباع حصة'],[1,'حصة واحدة'],[1.25,'حصة وربع'],[1.5,'حصة ونص'],[1.75,'حصة وتلت أرباع'],[2,'حصتين'],[2.25,'حصتين وربع'],[2.5,'حصتين ونص']];
const port=x=>PORT.reduce((a,b)=>Math.abs(b[0]-x)<Math.abs(a[0]-x)?b:a);
const DAYS=['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
$('ibform').addEventListener('submit',e=>{e.preventDefault();
  keys.forEach(k=>F[k]=$('i_'+k).value.trim());
  const w=+F.w,h=+F.h,a=+F.age;
  if(!(w>=30&&w<=300&&h>=120&&h<=230&&a>=10)){$('iberr').textContent='محتاجين على الأقل: العمر والطول والوزن.';$('iberr').hidden=false;return}
  $('iberr').hidden=true;
  const cond=$('i_cond').value;
  if(cond!=='none'||a<18){$('ibplan').hidden=false;$('ibplanbody').innerHTML=refer(cond,a);show('ibplan');return}
  build();
});
function refer(cond,a){
  const why=a<18?'لأن العمر أقل من ١٨ سنة':({preg:'لأنك حامل أو مرضعة',insulin:'لأنك بتاخد إنسولين أو أدوية سكر',kidney:'لأن عندك مشكلة في الكلى',other:'لأن عندك حالة صحية'})[cond];
  const msg=`أهلًا د. محمد، عملت تحليل InBody وعايز نظام مخصوص.\n${summary()}\nملاحظة: ${why}.`;
  const L=window.NF&&NF.waLink?NF.waLink(msg):'book.html';
  return `<div class="ibref"><h2>حالتك محتاجة نظام مخصوص</h2><p>${why}، النظام الآلي مش مناسب ليك، لأن السعرات والبروتين بيتحددوا حسب حالتك وأدويتك وتحاليلك. د. محمد هيعملك نظام آمن بنفسه.</p><a class="btn" href="${L}">ابعت بياناتك لد. محمد على الواتساب</a></div>`;
}
function summary(){
  const s=[`النوع: ${F.sex==='m'?'ذكر':'أنثى'}، العمر: ${F.age}، الطول: ${F.h} سم، الوزن: ${F.w} كجم`];
  if(F.pbf)s.push(`نسبة الدهون: ${F.pbf}٪`);if(F.smm)s.push(`كتلة العضلات: ${F.smm} كجم`);if(F.bfm)s.push(`كتلة الدهون: ${F.bfm} كجم`);
  if(F.bmr)s.push(`الحرق وقت الراحة: ${F.bmr} سعر`);if(F.vfl)s.push(`دهون الأحشاء: ${F.vfl}`);
  s.push(`الهدف: ${GOALS[goal]}`);return s.join('\n');
}
function build(){
  const w=+F.w,h=+F.h,a=+F.age,pbf=+F.pbf||0,act=+$('i_act').value;
  const ffm=pbf?w*(1-pbf/100):null;
  let bmr=+F.bmr||0,src='من ورقة InBody';
  if(!(bmr>800&&bmr<4000)){bmr=ffm?370+21.6*ffm:10*w+6.25*h-5*a+(F.sex==='m'?5:-161);src=ffm?'محسوب من كتلة الجسم بدون دهون (Katch-McArdle)':'محسوب بمعادلة Mifflin-St Jeor'}
  const tdee=bmr*act;
  let k=tdee*({lose:0.8,muscle:1.1,recomp:0.9,health:1})[goal];
  k=Math.max(k,F.sex==='m'?1500:1200,bmr*0.95);k=Math.round(k/10)*10;
  const lean=ffm||w*(F.sex==='m'?0.78:0.7);
  let p=lean*({lose:2.2,muscle:2.0,recomp:2.2,health:1.6})[goal];p=Math.min(p,w*2.2);
  const f=k*0.28/9,c=Math.max(0,(k-p*4-f*9)/4);
  // analysis
  const lim=F.sex==='m'?[10,20,25]:[18,28,33];
  const cat=!pbf?'':pbf<lim[0]?'أقل من الطبيعي':pbf<=lim[1]?'في المدى الطبيعي':pbf<=lim[2]?'أعلى من الطبيعي':'عالية';
  const ana=[];
  if(pbf)ana.push(`<li>نسبة الدهون <b>${A1(pbf)}٪</b>: ${cat} (المدى الطبيعي ${A(lim[0])}–${A(lim[1])}٪ ${F.sex==='m'?'للرجال':'للستات'}).</li>`);
  if(ffm)ana.push(`<li>كتلة الجسم بدون دهون حوالي <b>${A1(ffm)} كجم</b>، ودي اللي بنحسب عليها البروتين.</li>`);
  if(+F.smm)ana.push(`<li>كتلة العضلات الهيكلية <b>${A1(+F.smm)} كجم</b>. النظام هدفه يحافظ عليها${goal==='muscle'||goal==='recomp'?' ويزوّدها مع التمرين':''}.</li>`);
  if(+F.vfl)ana.push(`<li>دهون الأحشاء مستوى <b>${A(+F.vfl)}</b>${+F.vfl>=10?': أعلى من ١٠، ودي أولوية نقللها بالأكل والحركة.':': في المدى الكويس (أقل من ١٠).'}</li>`);
  if(pbf&&goal==='lose'){const tw=ffm/(1-(lim[1]-2)/100);if(tw<w)ana.push(`<li>لو نزلت دهون بس وحافظت على عضلك، وزن تقريبي صحي ليك حوالي <b>${A1(tw)} كجم</b>.</li>`)}
  // menu
  const by=m=>R.filter(r=>r.m===m);
  const B=by('فطار'),L=by('غدا'),D=by('عشا'),S=by('سناك');
  const hiP=goal==='muscle'||goal==='recomp';
  const sortP=arr=>arr;
  const [Bs,Ls,Ds,Ss]=[B,L,D,S].map(sortP);
  const split=k>=2400?[['فطار',.22],['غدا',.33],['سناك',.12],['عشا',.21],['سناك',.12]]:[['فطار',.25],['غدا',.35],['سناك',.15],['عشا',.25]];
  const pick=(m,d,i)=>{const L_={فطار:Bs,غدا:Ls,عشا:Ds,سناك:Ss}[m];const step={فطار:1,غدا:3,عشا:2,سناك:1}[m];return L_[(d*step+i*2)%L_.length]};
  let days='';const totW=[0,0,0,0];
  for(let d=0;d<7;d++){
    let rows='',t=[0,0,0,0],si=0;
    split.forEach(([m,share])=>{const cand=[0,1,2].map(j=>pick(m,d+j*7,m==='سناك'?si:0)).filter((v,i,a)=>a.indexOf(v)===i);if(m==='سناك')si++;
      const used=rows;const score=r=>{const q=port(k*share/r.k)[0];return Math.abs(r.p*q-p*share)+(used.includes(r.id)?99:0)};
      const r=cand.sort((a,b)=>score(a)-score(b))[0];const [x,lbl]=port(k*share/r.k);
      t[0]+=r.k*x;t[1]+=r.p*x;t[2]+=r.c*x;t[3]+=r.f*x;
      rows+=`<li><img src="assets/food/${r.id}.webp" alt="" loading="lazy" width="64" height="64"><span><small>${m}</small><a href="recipes.html#${r.id}">${esc(r.n)}</a><em>${lbl}، ${A(r.k*x)} سعر، ${A(r.p*x)} جم بروتين</em></span></li>`});
    if(t[1]>p*1.35){rows+=`<li class="boost"><span class="bi">i</span><span><small>ملاحظة</small><b>بروتين اليوم أعلى من احتياجك</b><em>ممكن تقلل حصة البروتين في العشا للنص.</em></span></li>`}
    const gap=p-t[1];
    if(gap>8){const big=gap>22;const g=big?Math.round(gap/0.31/25)*25:Math.min(400,Math.round(gap/0.10/50)*50);
      const it=big?['صدر فراخ مشوي',1.65,0.31,0,0.036]:['زبادي يوناني لايت',0.59,0.10,0.036,0.004];
      t[0]+=it[1]*g;t[1]+=it[2]*g;t[2]+=it[3]*g;t[3]+=it[4]*g;
      rows+=`<li class="boost"><span class="bi">+</span><span><small>إضافة بروتين</small><b>${it[0]} ${A(g)} جم</b><em>${A(it[1]*g)} سعر، ${A(it[2]*g)} جم بروتين، مع أي وجبة</em></span></li>`}
    t.forEach((v,i)=>totW[i]+=v);
    days+=`<details class="ibday"${d===0?' open':''}><summary><b>${DAYS[d]}</b><span>${A(t[0])} سعر، ${A(t[1])} جم بروتين</span></summary><ul>${rows}</ul></details>`;
  }
  const waMsg=`أهلًا د. محمد، عملت نظام أسبوع من تحليل InBody على NutFit وعايز أكمل رحلة التغيير معاك.\n${summary()}\nالسعرات المقترحة: ${k} سعر، بروتين ${Math.round(p)} جم`;
  const WL=window.NF&&NF.waLink?NF.waLink(waMsg):'book.html';
  $('ibplanbody').innerHTML=`
  <div class="ibhead"><span class="eyebrow">نظامك جاهز</span><h2>نظام أكل أسبوع لهدف: ${GOALS[goal]}</h2></div>
  <div class="big ibk"><small>سعراتك اليومية</small><div class="n">${A(k)}<span>سعر حراري</span></div>
    <div class="qmac"><div><b>${A(p)}</b>جم بروتين</div><div><b>${A(c)}</b>جم كارب</div><div><b>${A(f)}</b>جم دهون</div></div>
    <small class="ibsrc">الحرق وقت الراحة ${A(bmr)} سعر (${src}).</small></div>
  ${ana.length?`<div class="iban"><h3>قراءة تحليلك</h3><ul>${ana.join('')}</ul></div>`:''}
  <h3 class="ibt">وجباتك لمدة ٧ أيام</h3>
  <p class="note">دوس على اسم أي وجبة عشان تشوف مكوناتها وطريقة عملها. «الحصة» هي الكمية المكتوبة في الوصفة.</p>
  <div class="ibdays">${days}</div>
  <div class="ibtips"><h3>عشان النظام يجيب نتيجة</h3><ul><li>اشرب حوالي ${A1(w*0.033)} لتر مية في اليوم.</li><li>${goal==='muscle'||goal==='recomp'?'تمارين مقاومة ٣–٤ أيام في الأسبوع، وزوّد الأوزان تدريجيًا.':'امشي ٨–١٠ آلاف خطوة في اليوم، وتمارين مقاومة يومين أو تلاتة في الأسبوع عشان تحافظ على عضلك.'}</li><li>نام ٧ ساعات أو أكتر.</li><li>اعمل InBody تاني بعد ٤ أسابيع، بنفس الظروف (الصبح، على معدة فاضية).</li></ul></div>
  <div class="ibcta"><div><h3>عايز تكمل رحلة التغيير؟</h3><p>د. محمد هيراجع تحليلك ويظبط النظام على ذوقك وحالتك، ويتابعك كل أسبوع.</p></div>
    <a class="btn" href="${WL}">كمّل مع د. محمد على الواتساب</a></div>
  <div class="ibact"><button class="btn ghost" type="button" id="ibprint">احفظ النظام PDF</button><button class="btn ghost" type="button" id="ibredo">عدّل البيانات</button></div>
  <p class="note">النظام ده استرشادي ومحسوب تلقائيًا من أرقامك، ومش بديل عن الاستشارة الفردية. <a href="references.html#calc">المصادر العلمية</a>.</p>`;
  $('ibplan').hidden=false;show('ibplan');
  $('ibprint').addEventListener('click',()=>{document.querySelectorAll('.ibday').forEach(x=>x.open=true);window.print()});
  $('ibredo').addEventListener('click',()=>show('ibform'));
}

/* prefill from calculator / assistant */
try{const c=JSON.parse(localStorage.getItem('nut-calc')||'{}');if(c.age)F.age=c.age;if(c.h)F.h=c.h;if(c.w)F.w=c.w;if(c.sex==='m'||c.sex==='f')F.sex=c.sex;
if(location.hash==='#manual')setTimeout(()=>$('ibmanual').click(),50)}catch(e){}
}
