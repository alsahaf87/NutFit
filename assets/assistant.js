/* NutFit — «د. محمد الصحاف» guided assistant (rule-based, runs in the browser; nothing is sent to a server) */
(function(){
if(window.__nfA)return;window.__nfA=1;
const AV='assets/brand/dr-avatar.webp';
const A=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const N=s=>+String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d.]/g,'');
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const wa=t=>window.NF&&NF.waLink?NF.waLink(t):'book.html';
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};

const box=el('div','asst');box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label','المساعد الذكي د. محمد الصحاف');
box.innerHTML=`<div class="ah"><img src="${AV}" alt="" width="44" height="44"><div><b>د. محمد الصحاف</b><small><i class="dot"></i>مساعد ذكي آلي، بيرد فورًا</small></div><button type="button" class="ax" aria-label="إغلاق">×</button></div>
<div class="ab" aria-live="polite"></div><div class="aq"></div>
<form class="af"><input type="text" placeholder="اكتب سؤالك…" aria-label="اكتب سؤالك"><button type="submit" aria-label="إرسال">‹</button></form>`;
const launch=el('button','alaunch',`<img src="${AV}" alt="" width="52" height="52"><span><b>اسأل د. محمد</b><small>المساعد الذكي</small></span>`);launch.type='button';
document.body.append(box,launch);
const B=box.querySelector('.ab'),Q=box.querySelector('.aq'),F=box.querySelector('.af'),I=F.querySelector('input');
let wait=null;

function say(h,who='b'){const m=el('div','am '+who,h);if(who==='b'){m.prepend(el('img','mav'))};const im=m.querySelector('.mav');if(im){im.src=AV;im.alt=''}B.append(m);B.scrollTop=B.scrollHeight;return m}
function bot(h,opts,delay=380){Q.innerHTML='';const t=say('<span class="typing"><i></i><i></i><i></i></span>');return new Promise(r=>setTimeout(()=>{t.lastChild.remove();t.insertAdjacentHTML('beforeend',`<div>${h}</div>`);B.scrollTop=B.scrollHeight;if(opts)chips(opts);r()},delay))}
function chips(opts){Q.innerHTML='';opts.forEach(([t,f])=>{const b=el('button','chip2',t);b.type='button';b.onclick=()=>{say(t,'u');Q.innerHTML='';typeof f==='string'?location.href=f:f()};Q.append(b)})}
const MENU=()=>[['🔥 احسب سعراتي',calc],['🥗 اعمل نظام أكل',meal],['💪 تمارين جيم وبيت','exercises.html'],['🏋️ صمّم برنامج تمرين',train],['📄 نظام من ورقة InBody',inbody],['🍳 وصفات بالسعرات',recipes],['💬 كلّم د. محمد',human]];
function home(msg){bot(msg||'تحب أساعدك في إيه؟',MENU())}

/* ---- calories ---- */
const c={};
function ask(q,key,{min,max,unit,opts}={}){return new Promise(res=>{bot(q,opts&&opts.map(([t,v])=>[t,()=>{c[key]=v;res()}]));if(!opts){wait=v=>{const n=N(v);if(!(n>=min&&n<=max)){bot(`اكتب رقم بين ${A(min)} و${A(max)} ${unit||''}`);return}c[key]=n;wait=null;res()};setTimeout(()=>I.focus(),400)}})}
async function calc(){
  await bot('هحسبلك احتياجك بمعادلة <b>Mifflin-St Jeor</b> — هسألك ٦ أسئلة سريعة.',null,300);
  await ask('النوع؟','sex',{opts:[['ذكر','m'],['أنثى','f']]});
  await ask('عمرك كام سنة؟ (اكتب الرقم تحت)','age',{min:12,max:90,unit:'سنة'});
  if(c.age<18){bot('الحسابات دي للبالغين. لو أقل من ١٨ سنة الأفضل تتابع مع د. محمد مباشرة عشان احتياجات النمو مختلفة.',[['💬 كلّم د. محمد',human],['القائمة',()=>home()]]);return}
  await ask('طولك كام سم؟','h',{min:120,max:230,unit:'سم'});
  await ask('وزنك كام كجم؟','w',{min:30,max:300,unit:'كجم'});
  await ask('نشاطك اليومي؟','act',{opts:[['قليل الحركة',1.2],['تمرين ١–٣ أيام',1.375],['تمرين ٣–٥ أيام',1.55],['تمرين ٦–٧ أيام',1.725]]});
  await ask('هدفك؟','goal',{opts:[['خسارة دهون','lose'],['تثبيت الوزن','keep'],['بناء عضل / زيادة','gain']]});
  const bmr=10*c.w+6.25*c.h-5*c.age+(c.sex==='m'?5:-161),tdee=bmr*c.act;
  let k=c.goal==='lose'?tdee-500:c.goal==='gain'?tdee+300:tdee;k=Math.round(Math.max(k,c.sex==='m'?1500:1200)/10)*10;
  const p=Math.round(c.w*(c.goal==='keep'?1.4:c.goal==='lose'?1.8:1.8)),f=Math.round(k*.28/9),cb=Math.max(0,Math.round((k-p*4-f*9)/4));
  const bmi=c.w/((c.h/100)**2);
  set('nut-calc',Object.assign(get('nut-calc',{}),{sex:c.sex,age:c.age,h:c.h,w:c.w,act:String(c.act),goal:c.goal==='gain'?'gain':'lose',kcal:k}));
  await bot(`<div class="ares"><span>احتياجك اليومي</span><b>${A(k)}</b><small>سعر حراري</small></div>
  <div class="amac"><span>بروتين<b>${A(p)} جم</b></span><span>كارب<b>${A(cb)} جم</b></span><span>دهون<b>${A(f)} جم</b></span></div>
  <small class="anote">الحرق وقت الراحة ≈ ${A(Math.round(bmr))}، مؤشر كتلة الجسم ${A(bmi.toFixed(1))}${c.goal==='lose'?'، عجز ٥٠٠ سعر ≈ نص كيلو في الأسبوع':''}. الأرقام تقديرية للأصحاء.</small>`,null,700);
  bot('تحب أعملك إيه بعد كده؟',[['🥗 نظام أكل بالأرقام دي','inbody.html#manual'],['🏋️ برنامج تمرين',train],['📋 أرسل النتيجة لد. محمد',()=>{location.href=wa(`أهلًا د. محمد، حسبت احتياجي على NutFit: ${k} سعر، بروتين ${p} جم. عايز أبدأ معاك.`)}],['القائمة',()=>home()]]);
}
/* ---- meal plan ---- */
function meal(){bot('عندي طريقتين:<br>١) <b>صوّر ورقة InBody</b> وأنا أقرأ أرقامها وأعملك نظام أسبوع كامل بوصفات مصوّرة.<br>٢) <b>من غير InBody</b>: تدخل طولك ووزنك وأعملك النظام برضه.',[['📷 عندي ورقة InBody','inbody.html'],['✍️ من غير InBody','inbody.html#manual'],['🔥 احسب سعراتي الأول',calc],['القائمة',()=>home()]])}
function inbody(){bot('صفحة <b>نظامك من InBody</b> مجانية بالكامل: صوّر الورقة أو ارفعها، راجع الأرقام، اختار هدفك — وتستلم نظام ٧ أيام محسوب على كتلة عضلاتك، وتقدر تحفظه PDF.',[['افتح الصفحة','inbody.html'],['القائمة',()=>home()]])}
function recipes(){bot('عندنا وصفات بالصور وكل وصفة مكتوب سعراتها وبروتينها وكاربها ودهونها. وفيه كمان جدول أكلات بالسعرات.',[['الوصفات','recipes.html'],['جدول الأكلات','foods.html'],['المقالات','articles.html']])}
function human(){bot('تقدر تكلم د. محمد مباشرة على الواتساب للمتابعة والاشتراك.',[['💬 افتح الواتساب',()=>{location.href=wa('أهلًا د. محمد، جاي من المساعد على موقع NutFit وعايز أستفسر.')}],['الباقات','pricing.html'],['القائمة',()=>home()]])}
/* ---- training ---- */
const t={};
async function train(){
  const q=(m,k,o)=>new Promise(r=>bot(m,o.map(([a,v])=>[a,()=>{t[k]=v;r()}])));
  await q('هدفك من التمرين؟','goal',[['خسارة دهون','lose'],['بناء عضل','muscle'],['الاتنين','recomp'],['لياقة وصحة','health']]);
  await q('هتتمرن فين؟','place',[['الجيم','g'],['البيت بدمبلز','d'],['البيت من غير أدوات','b']]);
  await q('مستواك؟','level',[['مبتدئ','beg'],['متوسط','int'],['متقدم','adv']]);
  await q('كام يوم في الأسبوع؟','days',[['٢','2'],['٣','3'],['٤','4'],['٥','5'],['٦','6']]);
  set('nut-train-prefill',t);
  bot('تمام ✅ جهزت برنامجك بالصور: كل تمرينة بصورتين (البداية والنهاية) وعدد المجموعات والعدات والراحة.',[['افتح البرنامج','training.html'],['القائمة',()=>home()]]);
}
/* ---- free text ---- */
const RED=/حامل|حمل|رضاع|مرضع|انسولين|إنسولين|كلى|كلي|غسيل|سرطان|كيماوي|اكل وارجع|ترجيع|قيء متعمد/;
const KW=[[/سعر|سعرات|كالوري|احتياج|حرق/,calc],[/نظام|دايت|رجيم|اكل|أكل|وجب/,meal],[/تمرين|جيم|برنامج|عضل|تمارين|بوش|بول|ليج|اكسرسايز/,()=>bot('عندنا صفحة تمارين فيها برامج جاهزة للجيم (بوش بول ليج، علوي سفلي، جسم كامل) وللبيت، ومكتبة تمارين بالصور وPDF للتحميل. أو أعملك برنامج على مقاسك.',[['💪 افتح صفحة التمارين','exercises.html'],['🏋️ صمّم برنامجي',train],['القائمة',()=>home()]])],[/انبادي|إنبادي|inbody|ان بادي/i,inbody],[/وصف|طبخ|فطار|غدا|عشا/,recipes],[/سعر الباق|اشتراك|باق|بكام|تكلف|حجز|احجز|متابع|واتس|كلم|تواصل|دكتور/,human]];
function localAnswer(txt){
  if(RED.test(txt)){bot('الحالة دي محتاجة تقييم شخصي من د. محمد، مش نظام تلقائي — عشان سلامتك. ابعتله على الواتساب وهو يراجع حالتك وأدويتك.',[['💬 كلّم د. محمد',human],['القائمة',()=>home()]]);return}
  const f=(window.NF_FAQ||[]).map(([q,a])=>{const w=q.replace(/[؟?،.]/g,'').split(/\s+/).filter(x=>x.length>2);return[w.filter(x=>txt.includes(x)).length/(w.length||1),q,a]}).sort((a,b)=>b[0]-a[0])[0];
  if(f&&f[0]>=.34){bot(`<b>${f[1]}</b><br>${f[2]}`,MENU());return}
  for(const[r,fn]of KW)if(r.test(txt)){fn();return}
  bot('أنا مساعد آلي ومش هقدر أجاوب على كل الأسئلة. ممكن تختار من دول، أو تبعت سؤالك لد. محمد نفسه.',MENU());
}

/* ---- AI (Cloudflare function → Claude). Falls back to local answers if not configured ---- */
let AI=null;const hist=[];
fetch('/api/chat',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{AI=!!(j&&j.ai);if(AI){const s=box.querySelector('.ah small');if(s)s.innerHTML='<i class="dot"></i>مساعد ذكي (AI) · مرتبط بمصادر علمية'}}).catch(()=>{AI=false});
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function md(t){
  const acts=[];
  t=t.replace(/\[\[go:([^\]|]+)\|([^\]]+)\]\]/g,(_,u,l)=>{if(/^(https?:|javascript:)/i.test(u.trim()))return '';acts.push(['go',u.trim(),l]);return ''})
     .replace(/\[\[wa\|([^\]]+)\]\]/g,(_,l)=>{acts.push(['wa','',l]);return ''});
  let h=esc(t.trim()).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  h=h.split(/\n{2,}/).map(p=>{const ls=p.split('\n');if(ls.every(l=>/^\s*([-•*]|\d+[.)])\s+/.test(l)))return '<ul>'+ls.map(l=>'<li>'+l.replace(/^\s*([-•*]|\d+[.)])\s+/,'')+'</li>').join('')+'</ul>';return '<p>'+ls.join('<br>')+'</p>'}).join('');
  return {h,acts};
}
async function aiAnswer(txt){
  hist.push({role:'user',content:txt});
  Q.innerHTML='';const t=say('<span class="typing"><i></i><i></i><i></i></span>');
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:hist.slice(-12)})});
    if(!r.ok)throw new Error(r.status);
    const j=await r.json();if(!j.text)throw new Error('empty');
    hist.push({role:'assistant',content:j.text});
    const {h,acts}=md(j.text);t.lastChild.remove();
    let src='';if(j.sources&&j.sources.length)src='<div class="asrc"><small>المصادر:</small>'+j.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title).slice(0,60)}</a>`).join('')+'</div>';
    t.insertAdjacentHTML('beforeend',`<div class="aimd">${h}${src}</div>`);B.scrollTop=B.scrollHeight;
    const opts=acts.slice(0,3).map(([k,u,l])=>[l,k==='go'?u:()=>{location.href=wa('أهلًا د. محمد، جاي من المساعد على NutFit.\nسؤالي: '+hist.filter(m=>m.role==='user').slice(-2).map(m=>m.content).join(' / '))}]);
    chips(opts.concat([['القائمة',()=>home()]]));
  }catch(e){hist.pop();t.remove();localAnswer(txt)}
}
function answer(txt){if(AI)aiAnswer(txt);else localAnswer(txt)}
F.addEventListener('submit',e=>{e.preventDefault();const v=I.value.trim();if(!v)return;I.value='';say(v.replace(/</g,'&lt;'),'u');if(wait)wait(v);else answer(v)});
let started=false;
function open(){if(!window.NF_FAQ&&!document.getElementById('nffaq')){const s=document.createElement('script');s.id='nffaq';s.src='assets/faq-data.js';document.head.append(s)}box.hidden=false;launch.hidden=true;if(!started){started=true;bot(`أهلًا بيك 👋 أنا المساعد الذكي لـ<b>د. محمد الصحاف</b>.<br>أقدر أحسبلك سعراتك، وأعملك نظام أكل وبرنامج تمرين بالصور — مجانًا. واسألني أي سؤال في التغذية أو التمرين.<br><small class="anote">مساعد آلي ومش بديل عن الطبيب.</small>`,null,500).then(()=>home())}setTimeout(()=>I.focus(),300)}
function close(){box.hidden=true;launch.hidden=false;launch.focus()}
launch.onclick=open;box.querySelector('.ax').onclick=close;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close()});
document.querySelectorAll('[data-asst]').forEach(b=>b.addEventListener('click',open));
window.NFAssistant={open};
})();
