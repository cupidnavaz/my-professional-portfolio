/* CMS-compatible project links and five-image galleries. */
(function(){
  var MAX_IMAGES = 5;
  var esc = function(value){ return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; }); };
  var safeUrl = function(value){
    var url = String(value || '').trim();
    return /^https?:\/\//i.test(url) ? url : '';
  };
  function projectImages(project){
    var raw = project.project_images || project.images || [];
    var images = [];
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (ignore) { raw = raw.split(/[\n,]+/); }
    }
    if (!Array.isArray(raw)) raw = [];
    raw.forEach(function(item){
      if (images.length >= MAX_IMAGES) return;
      if (typeof item === 'string') {
        var url = safeUrl(item);
        if (url) images.push({src:url, cap:project.title || 'Project image'});
      } else if (item && typeof item === 'object') {
        var src = safeUrl(item.src || item.url || item.image_url);
        if (src) images.push({src:src, cap:item.cap || item.caption || project.title || 'Project image'});
      }
    });
    if (!images.length && safeUrl(project.image_url)) images.push({src:safeUrl(project.image_url), cap:project.title || 'Project image'});
    return images;
  }
  function projectData(project){
    var data = {
      tag:project.tag || project.category || 'Project', title:project.title || 'Project',
      client:project.client || '—', duration:project.duration || '—',
      overview:project.overview || project.summary || '', request:project.request || '',
      challenge:project.challenge || '', solution:project.solution || '', results:project.results || '',
      tools:(Array.isArray(project.tools) ? project.tools : String(project.tools || '').split(',')).map(function(x){return String(x).trim();}).filter(Boolean),
      images:projectImages(project), project_url:safeUrl(project.project_url)
    };
    if (!data.images.length) data.images = [{icon:project.icon || '📁', cap:project.title || 'Project'}];
    return data;
  }
  function cardMarkup(project, index){
    var slug = String(project.slug || '').replace(/[^\w-]/g, '');
    if (!slug) return '';
    var images = projectImages(project), cover = images[0] && images[0].src;
    if (!cover) cover = safeUrl(project.image_url);
    var media = cover ? '<img src="'+esc(cover)+'" alt="'+esc(project.title || 'Project preview')+'" loading="lazy">' : '<span aria-hidden="true" style="font-size:54px">'+esc(project.icon || '📁')+'</span>';
    var live = safeUrl(project.project_url);
    return '<article class="project-card in-view" id="'+esc(slug)+'" data-cat="'+esc(project.category || 'data')+'">'+
      '<div class="project-thumb thumb-'+(index % 3 + 1)+'">'+media+'</div>'+
      '<div class="project-body"><span class="project-tag">'+esc(project.tag || project.category || 'Project')+'</span>'+
      '<h3>'+esc(project.title || 'Project')+'</h3><p>'+esc(project.summary || project.overview || '')+'</p>'+
      '<div class="project-actions">'+(live ? '<a class="project-live-link" href="'+esc(live)+'" target="_blank" rel="noopener noreferrer">Visit project ↗</a>' : '')+
      '<button class="project-case-link" type="button" data-open-project="'+esc(slug)+'">View case study →</button></div></div></article>';
  }
  function renderProjects(rows){
    if (!rows || !rows.length) return;
    rows.forEach(function(project){
      if (window.__projectsData) window.__projectsData[project.slug] = projectData(project);
    });
    var homeGrid = document.querySelector('#projects .project-grid');
    var home = document.body.getAttribute('data-pg') === 'home';
    if (homeGrid && home) {
      var featured = rows.filter(function(project){return project.featured;});
      homeGrid.innerHTML = (featured.length ? featured : rows).slice(0, 3).map(cardMarkup).join('');
    }
    document.querySelectorAll('.category-block').forEach(function(block){
      var sample = block.querySelector('.project-card'), category = sample && sample.getAttribute('data-cat');
      if (!category) return;
      var matching = rows.filter(function(project){return project.category === category;});
      var grid = block.querySelector('.project-grid');
      if (grid) grid.innerHTML = matching.map(cardMarkup).join('');
      var count = block.querySelector('.category-head span');
      if (count) count.textContent = matching.length + ' project' + (matching.length === 1 ? '' : 's');
      block.style.display = matching.length ? '' : 'none';
    });
    if (window.fxScan) window.fxScan();
  }
  function openProject(slug){
    var data = window.__projectsData && window.__projectsData[slug];
    if (!data) return;
    var overlay = document.getElementById('projectOverlay');
    var slides = document.getElementById('projSlides'), dots = document.getElementById('projDots');
    if (!overlay || !slides || !dots) return;
    var max = Math.min(MAX_IMAGES, (data.images || []).length);
    slides.innerHTML = ''; dots.innerHTML = '';
    for (var i = 0; i < max; i++) {
      var image = data.images[i], slide = document.createElement('div');
      slide.className = 'proj-slide thumb-' + (i % 3 + 1) + (i === 0 ? ' active' : '');
      if (image.src && safeUrl(image.src)) {
        var img = document.createElement('img'); img.src = safeUrl(image.src); img.alt = image.cap || data.title; img.loading = 'lazy'; slide.appendChild(img);
      } else {
        var icon = document.createElement('span'); icon.className = 'proj-icon'; icon.textContent = image.icon || '📁'; slide.appendChild(icon);
      }
      var caption = document.createElement('span'); caption.className = 'proj-cap'; caption.textContent = image.cap || data.title; slide.appendChild(caption); slides.appendChild(slide);
      var dot = document.createElement('button'); dot.type = 'button'; dot.className = 'proj-dot' + (i === 0 ? ' active' : ''); dot.setAttribute('aria-label', 'Show project image ' + (i + 1)); dot.setAttribute('data-index', i); dots.appendChild(dot);
    }
    var live = document.getElementById('projLiveLink');
    if (!live) {
      live = document.createElement('a'); live.id = 'projLiveLink'; live.target = '_blank'; live.rel = 'noopener noreferrer';
      var cta = document.getElementById('projCTA');
      if (cta && cta.parentNode) cta.parentNode.insertBefore(live, cta);
    }
    live.href = safeUrl(data.project_url); live.hidden = !live.href; live.textContent = 'Visit project ↗';
    overlay.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  document.addEventListener('click', function(event){
    var link = event.target.closest && event.target.closest('[data-open-project]');
    if (link) { event.preventDefault(); openProject(link.getAttribute('data-open-project') || (link.closest('.project-card') || {}).id); return; }
    var dot = event.target.closest && event.target.closest('.proj-dot');
    if (dot) {
      var index = parseInt(dot.getAttribute('data-index'), 10);
      document.querySelectorAll('#projSlides .proj-slide').forEach(function(slide, i){slide.classList.toggle('active', i === index);});
      document.querySelectorAll('#projDots .proj-dot').forEach(function(button, i){button.classList.toggle('active', i === index);});
    }
  });
  function start(){
    if (typeof SUPABASE_READY === 'undefined' || !SUPABASE_READY) return;
    fetchRecords('projects', '?select=*&published=eq.true&order=sort.asc').then(renderProjects);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
