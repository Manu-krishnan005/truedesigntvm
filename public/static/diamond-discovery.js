/* Smooth, scroll-distance-driven diamond choreography; retains all existing links. */
(()=>{
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const segment=(p,a,b)=>ease((p-a)/(b-a));
 function init(){
  const section=document.querySelector('.td-diamond-discovery');
  const stage=section?.querySelector('.td-diamond-stage');
  const svg=stage?.querySelector('.td-quad-outline');
  if(!section||!stage||!svg)return;
  const cards=[...stage.querySelectorAll('.td-diamond-item')];
  const paths=[...svg.querySelectorAll('path')];
  const tabs=section.querySelector('.td-diamond-tabs');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let lengths=[],raf=0,current=0,target=0,initialized=false;
  function measure(){
   lengths=paths.map(path=>{const n=path.getTotalLength();path.style.strokeDasharray=`${n} ${n}`;return n});
   updateTarget();
  }
  function updateTarget(){
   const r=section.getBoundingClientRect();
   target=clamp(-r.top/Math.max(1,section.offsetHeight-innerHeight));
   if(!initialized){current=target;initialized=true}
   schedule();
  }
  function render(){
   raf=0;
   if(reduced.matches){
    cards.forEach(c=>{c.style.opacity='1';c.style.transform='none'});
    paths.forEach(path=>path.style.strokeDashoffset='0');
    if(tabs){tabs.style.opacity='1';tabs.style.pointerEvents='auto'}
    return;
   }
   // Damped interpolation avoids sudden jumps from a small wheel gesture.
   // Scroll distance is also longer (CSS 540vh), so the choreography unfolds gradually.
   current+=(target-current)*.105;
   if(Math.abs(target-current)<.00015)current=target;
   const p=current,w=innerWidth,h=innerHeight;
   const entries=[{a:.12,b:.38,x:0,y:-h},{a:.12,b:.38,x:w,y:0},{a:.29,b:.53,x:-w,y:0},{a:.29,b:.53,x:0,y:h}];
   cards.forEach((card,i)=>{
    const e=entries[i];if(!e)return;
    const t=segment(p,e.a,e.b);
    card.style.transform=`translate3d(${e.x*(1-t)}px,${e.y*(1-t)}px,0)`;
    card.style.opacity=String(segment(p,e.a,e.a+.08));
   });
   paths.forEach((path,i)=>{
    const t=i===0?segment(p,.49,.73):segment(p,.60,.84);
    path.style.strokeDashoffset=String(lengths[i]*(1-t));
   });
   if(tabs){const t=segment(p,.83,.95);tabs.style.opacity=String(t);tabs.style.pointerEvents=t>.98?'auto':'none'}
   if(current!==target)schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render)}
  addEventListener('scroll',updateTarget,{passive:true});
  addEventListener('resize',measure,{passive:true});
  reduced.addEventListener?.('change',schedule);
  measure();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
