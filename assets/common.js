/* NutFit shared UI: floating contact button + social links */
{
const NF=window.NF||{};
NF.waLink=t=>NF.wa?`https://wa.me/${NF.wa}?text=${encodeURIComponent(t)}`:'';
window.NF=NF;
const ic='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></svg>';
if(!document.body.classList.contains('no-fab')){
  const a=document.createElement('a');a.className='fab';
  a.href=NF.wa?NF.waLink('أهلًا د. محمد، عايز أستفسر عن المتابعة مع NutFit'):'book.html';
  a.innerHTML=ic+'<span>'+(NF.wa?'كلّمنا واتساب':'احجز استشارة')+'</span>';
  a.setAttribute('aria-label',NF.wa?'تواصل على واتساب':'احجز استشارة');
  document.body.appendChild(a);
}
if(NF.wa){document.querySelectorAll('a[href^="book.html"]').forEach(a=>{const pl=new URL(a.getAttribute('href'),location.href).searchParams.get('plan');a.href=NF.waLink(a.dataset.wa||('أهلًا د. محمد، عايز أحجز متابعة مع NutFit'+(pl?' — باقة '+pl:'')));a.rel='noopener'});
 document.addEventListener('click',e=>{const g=e.target.closest('#go');if(g&&NF.wa){const p=document.querySelector('.plan[aria-checked=true]');g.href=NF.waLink('أهلًا د. محمد، عايز أحجز '+(p?p.dataset.p:'متابعة')+' مع NutFit')}},true);}
const soc=document.getElementById('social');
if(soc){const L=[['instagram','Instagram'],['facebook','Facebook'],['tiktok','TikTok'],['youtube','YouTube']].filter(([k])=>NF[k]);
  if(L.length){soc.innerHTML='<h4>تابعنا</h4>'+L.map(([k,n])=>`<a href="${NF[k]}" rel="noopener">${n}</a>`).join('')}else soc.remove()}
}

/* ---- discount code block ---- */
(function(){const p=document.querySelectorAll('.promo');if(!p.length)return;const P=(window.NF&&NF.promo)||{};
if(P.active===false){p.forEach(x=>x.remove());return}
const A=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
p.forEach(sec=>{const l=sec.querySelector('#pleft');if(l&&typeof P.left==='number'){l.hidden=false;l.innerHTML=P.left>0?`<i></i> فاضل <b>${A(P.left)}</b> مكان بس`:'خلص العرض — تابعنا للعروض الجاية';l.style.setProperty('--w',Math.max(4,Math.min(100,P.left))+'%')}
const b=sec.querySelector('.pcode'),t=sec.querySelector('.ptoast');if(!b)return;
b.addEventListener('click',async()=>{const code=P.code||'NUTFIT15';try{await navigator.clipboard.writeText(code)}catch(e){const r=document.createRange();r.selectNodeContents(b.querySelector('b'));const s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy')}catch(_){}}
b.classList.add('done');b.querySelector('.pcopy').textContent='✓ اتنسخ';if(t){t.textContent=(location.pathname.includes('pricing')?'اتنسخ الكود '+code+' — اختار باقتك واحجز 🎉':'اتنسخ الكود '+code+' 🎉 — بنوديك على الباقات…');t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2600)}
for(let i=0;i<18;i++){const c=document.createElement('i');c.className='pconf';c.style.setProperty('--x',(Math.random()*240-120)+'px');c.style.setProperty('--y',(-60-Math.random()*120)+'px');c.style.setProperty('--r',(Math.random()*540)+'deg');c.style.background=['#259D4E','#ffd23f','#ff5a1f','#fff'][i%4];b.appendChild(c);setTimeout(()=>c.remove(),1000)}
if(!location.pathname.includes('pricing'))setTimeout(()=>{location.href='pricing.html#plans'},1100);
setTimeout(()=>{b.classList.remove('done');b.querySelector('.pcopy').textContent='انسخ الكود'},3000)})})})();
