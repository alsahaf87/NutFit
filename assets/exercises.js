/* NutFit — exercises hub: programs routing, library filters, exercise dialog */
{
const $=id=>document.getElementById(id);
const E=window.EXD||{},M=window.MUS||{};
const PL={g:'🏋️ جيم',d:'دمبلز',b:'🏠 وزن الجسم'};
/* ---- routing ---- */
const views=[...document.querySelectorAll('.pview')];
function route(){
  const h=location.hash.slice(1),v=views.find(x=>x.id===h);
  $('pwrap').hidden=!v;['exhead','programs','trend'].forEach(i=>$(i).hidden=!!v);
  views.forEach(x=>x.hidden=x!==v);
  if(v){window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));setTimeout(()=>window.scrollTo(0,0),60)}
  document.querySelectorAll('.extabs a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+(h==='library'||h==='trend'?h:'programs')));
}
addEventListener('hashchange',route);route();
/* ---- program filter ---- */
document.querySelectorAll('.pfil button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.pfil button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  document.querySelectorAll('.pcard').forEach(c=>c.hidden=!!b.dataset.f&&c.dataset.place!==b.dataset.f);
}));
/* ---- library filter ---- */
const st={m:'',p:'',q:''};
function filt(){let n=0;const q=st.q.trim().toLowerCase();
  document.querySelectorAll('.xcard').forEach(c=>{const ok=(!st.m||c.dataset.m===st.m)&&(!st.p||c.dataset.p.includes(st.p))&&(!q||c.dataset.s.toLowerCase().includes(q));c.hidden=!ok;if(ok)n++});
  $('xe').hidden=n>0}
[['xm','m'],['xpl','p']].forEach(([id,k])=>$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;st[k]=b.dataset[k];$(id).querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));filt()}));
$('xq').addEventListener('input',e=>{st.q=e.target.value;filt()});
/* ---- trend filter ---- */
$('tch').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('tch').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('.tcard').forEach(c=>c.hidden=!!b.dataset.t&&c.dataset.t!==b.dataset.t);$('tsh').scrollTo({left:0,behavior:'smooth'})});
/* ---- exercise dialog ---- */
const d=$('xd');
function open(k){const e=E[k];if(!e)return;
  const yt='https://www.youtube.com/results?search_query='+encodeURIComponent(e.en+' exercise proper form');
  const TG={sci:'🔬 مدعوم بالدراسات',viral:'🔥 ترند على الريلز',new:'✨ جديد وغريب',hyrox:'🏁 ترند Hyrox',home:'⚡ سريع وفي أي مكان'};
  const pics=e.ni?`<a class="tph big" href="${yt}" target="_blank" rel="noopener"><b>${e.ic}</b><small>▶ اضغط وشوف الحركة فيديو</small></a>`:`<div class="xdimg"><span class="ani big"><img src="assets/ex/${k}-0.webp" alt="${e.n} — البداية"><img src="assets/ex/${k}-1.webp" alt="${e.n} — النهاية"></span></div>
  <div class="xdframes"><figure><img src="assets/ex/${k}-0.webp" alt=""><figcaption>البداية</figcaption></figure><figure><img src="assets/ex/${k}-1.webp" alt=""><figcaption>النهاية</figcaption></figure></div>`;
  $('xdb').innerHTML=pics+(e.w?`<div class="xwhy"><em class="ttag ${e.t}">${TG[e.t]}</em><p>${e.w}</p></div>`:'')+`
  <h2 id="xdt">${e.n}</h2><p class="xden" dir="ltr">${e.en}</p>
  <div class="pchips"><span>💪 ${M[e.m]}</span>${[...e.p].map(c=>`<span>${PL[c]}</span>`).join('')}</div>
  <h3>طريقة الأداء</h3><ol class="cues">${e.c.map(c=>`<li>${c}</li>`).join('')}</ol>
  <div class="mist"><b>⚠️ الغلط الشائع:</b> ${e.x}</div>
  <a class="btn ghost yt" href="${yt}" target="_blank" rel="noopener">▶ شوف فيديوهات للحركة على يوتيوب</a>`;
  try{d.showModal()}catch(_){d.setAttribute('open','')}
}
document.addEventListener('click',e=>{const t=e.target.closest('.xcard,.how,.pimg,.tcard');if(!t)return;const k=t.dataset.k||t.closest('[data-k]').dataset.k;open(k)});
const close=()=>{try{d.close()}catch(_){d.removeAttribute('open')}};
d.querySelector('.xdx').addEventListener('click',close);d.addEventListener('click',e=>{if(e.target===d)close()});
}
