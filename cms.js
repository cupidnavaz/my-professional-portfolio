// Loads content managed in the admin panel. Falls back to the built-in HTML if Supabase isn't set up.
(function(){
  try{
    var k='sb-'+new URL(SUPABASE_URL).hostname.split('.')[0]+'-auth-token', s=JSON.parse(localStorage.getItem(k)||'null');
    if(s && s.expires_at*1000>Date.now()) document.querySelectorAll('.admin-only').forEach(function(e){ e.hidden=false; });
  }catch(e){}
  if(typeof SUPABASE_READY==='undefined' || !SUPABASE_READY) return;
  var esc=function(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var $=function(s,r){ return (r||document).querySelector(s); }, $$=function(s,r){ return [].slice.call((r||document).querySelectorAll(s)); };
  var qs='?select=*&published=eq.true&order=sort.asc';

  // ----- site settings
  fetchRecords('settings','?select=*').then(function(rows){
    var map={footer_text:'footer .wrap p:nth-of-type(1)',footer_tagline:'footer .wrap p:nth-of-type(2)',hero_lead:'.hero p.lead'};
    rows.forEach(function(r){ var el=map[r.key]&&$(map[r.key]); if(el&&r.value) el.textContent=r.value; });
  });

  // ----- projects
  var pGrid=$('#projects .project-grid'), pPage=$('.category-block');
  if(pGrid||pPage) fetchRecords('projects',qs).then(function(rows){
    if(!rows.length) return;
    rows.forEach(function(p){
      if(window.__projectsData) window.__projectsData[p.slug]={tag:p.tag,title:p.title,client:p.client,duration:p.duration,overview:p.overview,request:p.request,challenge:p.challenge,solution:p.solution,results:p.results,
        tools:(p.tools||'').split(',').map(function(x){return x.trim();}).filter(Boolean),images:[{icon:p.icon||'📁',cap:p.title}]};
    });
    var card=function(p,i){
      var th=p.image_url?'<img src="'+esc(p.image_url)+'" alt="" style="width:100%;height:100%;object-fit:cover">':'<span style="font-size:54px">'+esc(p.icon||'📁')+'</span>';
      return '<div class="project-card in-view" data-cat="'+esc(p.category)+'"><div class="project-thumb thumb-'+(i%3+1)+'">'+th+'</div><div class="project-body"><span class="project-tag">'+esc(p.tag)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.summary||p.overview)+'</p><a href="#" class="project-link" data-cms-project="'+esc(p.slug)+'">View case study →</a></div></div>';
    };
    if(pGrid){ var f=rows.filter(function(p){return p.featured;}); pGrid.innerHTML=(f.length?f:rows.slice(0,3)).map(card).join(''); }
    $$('.category-block').forEach(function(b){
      var c0=$('.project-card',b), cat=c0&&c0.getAttribute('data-cat'); if(!cat) return;
      var mine=rows.filter(function(p){return p.category===cat;});
      $('.project-grid',b).innerHTML=mine.map(card).join('');
      var cnt=$('.category-head span',b); if(cnt) cnt.textContent=mine.length+' project'+(mine.length===1?'':'s');
      b.style.display=mine.length?'':'none';
    });
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-cms-project]');
    if(a){ e.preventDefault(); if(window.__openProject) window.__openProject(a.getAttribute('data-cms-project')); }
  });

  // ----- services
  var det=$('.service-detail'), tea=$('#services .grid-6');
  if(det||tea) fetchRecords('services',qs).then(function(rows){
    if(!rows.length) return;
    if(det) det.parentNode.innerHTML=rows.map(function(s){
      return '<div class="service-detail in-view"><div class="card-ic ic-'+esc(s.color)+'">'+esc(s.icon)+'</div><div><h3>'+esc(s.title)+'</h3><p class="desc">'+esc(s.description)+'</p><div class="includes">'+
        (s.includes||'').split(',').map(function(x){return x.trim();}).filter(Boolean).map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div></div></div>';
    }).join('');
    if(tea) tea.innerHTML=rows.map(function(s){
      return '<div class="card in-view"><div class="card-ic ic-'+esc(s.color)+'">'+esc(s.icon)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p></div>';
    }).join('');
  });
})();
