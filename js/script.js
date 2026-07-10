const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
window.addEventListener('load',()=>setTimeout(()=>$('.loader').classList.add('done'),450));
const header=$('.site-header'),progress=$('.progress'),menu=$('.menu-toggle'),nav=$('#site-nav');
const onScroll=()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;header.classList.toggle('scrolled',y>30);progress.style.width=`${h?y/h*100:0}%`};
addEventListener('scroll',onScroll,{passive:true});onScroll();
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open);document.body.classList.toggle('menu-open',!open)});
$$('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open');document.body.classList.remove('menu-open')}));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.14});
$$('.reveal').forEach(el=>revealObserver.observe(el));
let counted=false;const stats=$('.stat-grid');
const countObserver=new IntersectionObserver(([e])=>{if(!e.isIntersecting||counted)return;counted=true;$$('[data-count]').forEach(el=>{const end=+el.dataset.count,duration=reduced?0:1300,start=performance.now();const tick=now=>{const p=duration?Math.min((now-start)/duration,1):1;el.textContent=Math.floor(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)});countObserver.disconnect()},{threshold:.5});countObserver.observe(stats);
if(!reduced&&matchMedia('(pointer:fine)').matches){const glow=$('.cursor-glow');addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});$('.hero').addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*8;$('.hero-content').style.transform=`translate(${x}px,${y}px)`});$('.hero').addEventListener('pointerleave',()=>$('.hero-content').style.transform='')}
$$('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('details').filter(d=>d!==item).forEach(d=>d.open=false)}));
