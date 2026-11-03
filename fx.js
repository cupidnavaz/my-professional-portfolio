// UI behaviour: mobile menu, scroll progress, reveal + tilt animations, CV preview, credential filters.
(function(){
  var d=document,w=window,$=function(s,r){return (r||d).querySelector(s);},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s));};
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- mobile menu (independent of every other script)
  var t=$('#navToggle'),l=$('#navLinks');
  function nav(o){ if(!t||!l) return; l.classList.toggle('open',o); t.setAttribute('aria-expanded',String(o)); t.textContent=o?'✕':'☰'; d.body.classList.toggle('nav-lock',o); }
  if(t&&l){
    t.setAttribute('aria-expanded','false');
    t.addEventListener('click',function(e){ e.stopPropagation(); nav(!l.classList.contains('open')); });
    l.addEventListener('click',function(e){ if(e.target.closest('a')) nav(false); });
    d.addEventListener('click',function(e){ if(l.classList.contains('open')&&!e.target.closest('header')) nav(false); });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape'){ nav(false); closeCv(); } });
    w.addEventListener('resize',function(){ if(w.innerWidth>860) nav(false); });
  }

  // ----- scroll progress
  var bar=d.createElement('div'); bar.id='fxProgress'; d.body.appendChild(bar);
  function prog(){ var h=d.documentElement.scrollHeight-w.innerHeight; bar.style.width=(h>0?w.scrollY/h*100:0)+'%'; }
  w.addEventListener('scroll',prog,{passive:true}); prog();

  // ----- reveal + tilt
  var io=(!reduce&&'IntersectionObserver' in w)?new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('fx-in'); io.unobserve(e.target); } }); },{threshold:.1}):null;
  w.fxScan=function(){
    $$('.card,.project-card,.service-detail,.cred-card,.rec-card,.obj-card,.vision-card,.tl-item,.venture-card,.testi-card').forEach(function(el){
      if(el.__fx||!io) return; el.__fx=1;
      el.style.setProperty('--fxd',Math.min([].indexOf.call(el.parentNode.children,el),8)*70+'ms'); el.classList.add('fx'); io.observe(el);
    });
  };
  w.fxScan(); setTimeout(w.fxScan,1200); setTimeout(function(){ $$('.fx:not(.fx-in)').forEach(function(e){ var r=e.getBoundingClientRect(); if(r.top<w.innerHeight) e.classList.add('fx-in'); }); },2500);
  if(!reduce&&w.matchMedia('(hover:hover)').matches){
    d.addEventListener('pointermove',function(e){
      var c=e.target.closest&&e.target.closest('.card,.project-card,.service-detail,.cred-card'); if(!c||d.body.classList.contains('no-tilt')) return;
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.classList.add('tilt'); c.style.setProperty('--ry',((x-.5)*7).toFixed(2)+'deg'); c.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg'); c.style.setProperty('--mx',(x*100)+'%'); c.style.setProperty('--my',(y*100)+'%');
    });
    d.addEventListener('pointerout',function(e){ var c=e.target.closest&&e.target.closest('.tilt'); if(c&&!c.contains(e.relatedTarget)){ c.style.setProperty('--rx','0deg'); c.style.setProperty('--ry','0deg'); } });
  }

  // ----- CV preview (stage 1: review in a viewer, stage 2: download)
  var cv=null;
  function closeCv(){ if(cv){ cv.classList.remove('open'); d.body.classList.remove('nav-lock'); var f=$('iframe',cv); if(f) f.src='about:blank'; } }
  function openCv(){
    var url=w.CV_URL||'assets/cv.pdf', abs=new URL(url,location.href).href, mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if(!cv){ cv=d.createElement('div'); cv.className='cv-overlay'; cv.innerHTML='<div class="cv-modal" role="dialog" aria-label="CV preview"><div class="cv-head"><b>Curriculum Vitae</b><span class="sp"></span><a class="btn btn-ghost" id="cvNew" target="_blank" rel="noopener">Open ↗</a><a class="btn btn-primary" id="cvDl" download>⬇ Download</a><button class="cv-x" aria-label="Close">✕</button></div><iframe title="CV" loading="lazy"></iframe></div>'; d.body.appendChild(cv);
      cv.addEventListener('click',function(e){ if(e.target===cv||e.target.closest('.cv-x')) closeCv(); }); }
    $('#cvNew',cv).href=abs; $('#cvDl',cv).href=abs;
    $('iframe',cv).src=mobile?'https://docs.google.com/viewer?embedded=true&url='+encodeURIComponent(abs):abs+'#view=FitH';
    cv.classList.add('open'); d.body.classList.add('nav-lock');
  }
  d.addEventListener('click',function(e){
    if(e.target.closest('[data-cv-open]')){ e.preventDefault(); openCv(); }
    var f=e.target.closest('.cred-filter'); if(f){ $$('.cred-filter').forEach(function(b){b.classList.toggle('active',b===f);}); var k=f.getAttribute('data-f');
      $$('.cred-sec').forEach(function(s){ s.hidden=!(k==='all'||s.getAttribute('data-sec')===k); }); }
  });
  // recommendation form fallback when Supabase isn't configured
  var rf=$('#recForm'); if(rf) rf.addEventListener('submit',function(e){ if(typeof SUPABASE_READY==='undefined'||!SUPABASE_READY){ e.preventDefault(); $('#recMsg').textContent='This form isn’t connected yet. Please use the contact page.'; } });

  // ----- bio modal tabs
  d.addEventListener('click',function(e){
    var b=e.target.closest('[data-bt]'); if(!b) return; var m=b.closest('.bio-modal'), k=b.getAttribute('data-bt');
    $$('[data-bt]',m).forEach(function(x){ x.classList.toggle('on',x===b); });
    $$('[data-bp]',m).forEach(function(p){ p.hidden=p.getAttribute('data-bp')!==k; });
    var body=$('.bio-body',m); if(body) body.scrollTop=0;
  });
  // ----- switchable Contact / Rate section
  function pick(k,scroll){
    var w=$('.switch-wrap'); if(!w) return; var pane=$('[data-pane="'+k+'"]',w); if(!pane) return;
    $$('[data-tab]',w).forEach(function(x){ x.classList.toggle('on',x.getAttribute('data-tab')===k); x.setAttribute('aria-selected',String(x.getAttribute('data-tab')===k)); });
    $$('.switch-pane',w).forEach(function(p){ p.hidden=p!==pane; });
    $$('[data-reveal],[data-reveal-stagger]',pane).forEach(function(x){ x.classList.add('in-view'); });
    pane.classList.remove('pane-in'); void pane.offsetWidth; pane.classList.add('pane-in');
    if(scroll) w.scrollIntoView({behavior:'smooth',block:'start'});
  }
  d.addEventListener('click',function(e){ var b=e.target.closest('[data-tab]'); if(b){ pick(b.getAttribute('data-tab'),false); } });
  function fromHash(){ var h=(location.hash||'').slice(1); if(h==='contact'||h==='rate-us') pick(h,true); }
  w.addEventListener('hashchange',fromHash); if($('.switch-wrap')) setTimeout(fromHash,50);
})();
