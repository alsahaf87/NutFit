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
if(NF.wa){document.querySelectorAll('a[href^="book.html"]').forEach(a=>{const pl=new URL(a.getAttribute('href'),location.href).searchParams.get('plan');a.href=NF.waLink('أهلًا د. محمد، عايز أحجز متابعة مع NutFit'+(pl?' — باقة '+pl:''));a.rel='noopener'});
 document.addEventListener('click',e=>{const g=e.target.closest('#go');if(g&&NF.wa){const p=document.querySelector('.plan[aria-checked=true]');g.href=NF.waLink('أهلًا د. محمد، عايز أحجز '+(p?p.dataset.p:'متابعة')+' مع NutFit')}},true);}
const soc=document.getElementById('social');
if(soc){const L=[['instagram','Instagram'],['facebook','Facebook'],['tiktok','TikTok'],['youtube','YouTube']].filter(([k])=>NF[k]);
  if(L.length){soc.innerHTML='<h4>تابعنا</h4>'+L.map(([k,n])=>`<a href="${NF[k]}" rel="noopener">${n}</a>`).join('')}else soc.remove()}
}
