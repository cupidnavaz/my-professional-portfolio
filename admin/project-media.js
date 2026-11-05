/* Admin add-on for project destination URLs and a five-image gallery. */
(function(){
  var MAX_IMAGES = 5, client = null;
  var esc = function(value){ return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; }); };
  function toast(message){ var node = document.getElementById('toast'); if(node){ node.textContent = message; node.classList.add('show'); setTimeout(function(){node.classList.remove('show');}, 3500); } }
  function getClient(){
    if (client) return client;
    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return null;
    client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return client;
  }
  function normalizeImages(text){
    return String(text || '').split(/[\n,]+/).map(function(url){return url.trim();}).filter(Boolean).slice(0, MAX_IMAGES);
  }
  function addFields(){
    var modal = document.getElementById('modal'), form = modal && modal.querySelector('form.dlg');
    if (!form || form.querySelector('[data-project-gallery-fields]')) return;
    var heading = form.querySelector('h3');
    if (!heading || !/Projects/.test(heading.textContent)) return;
    var slugField = form.querySelector('[name="slug"]'), current = null;
    try { current = window.__projectMediaRow || null; } catch (ignore) {}
    var liveUrl = current && current.project_url || '';
    var existing = current && current.project_images || '';
    var fields = document.createElement('div'); fields.setAttribute('data-project-gallery-fields','');
    fields.innerHTML = '<label>Project URL <small>(optional; opens in a new tab)</small><input type="url" data-project-url value="'+esc(liveUrl)+'" placeholder="https://example.com"></label>'+
      '<label>Project gallery image URLs <small>(one URL per line, up to 5; these appear in the case-study carousel)</small><textarea data-project-images rows="5" placeholder="https://example.com/image-1.jpg&#10;https://example.com/image-2.jpg">'+esc(existing)+'</textarea>'+
      '<span class="up-row"><small class="muted">Or upload up to 5 gallery images</small><input type="file" accept="image/*" multiple data-project-gallery-upload></span></label>';
    var foot = form.querySelector('.foot');
    if (foot) form.insertBefore(fields, foot); else form.appendChild(fields);
    var upload = fields.querySelector('[data-project-gallery-upload]');
    upload.addEventListener('change', async function(){
      var files = Array.prototype.slice.call(upload.files || []), area = fields.querySelector('[data-project-images]'), urls = normalizeImages(area.value);
      if (urls.length + files.length > MAX_IMAGES) { toast('A project can have up to 5 images.'); upload.value = ''; return; }
      var api = getClient(); if (!api) { toast('Could not connect to media storage.'); return; }
      for (var i = 0; i < files.length; i++) {
        var file = files[i], name = Date.now() + '-' + Math.random().toString(36).slice(2,7) + '-' + file.name.replace(/[^\w.-]+/g,'-');
        toast('Uploading gallery image ' + (i + 1) + ' of ' + files.length + '…');
        var result = await api.storage.from('media').upload(name, file, {cacheControl:'31536000', upsert:false});
        if (result.error) { toast(result.error.message + ' (check the Supabase media bucket)'); break; }
        urls.push(api.storage.from('media').getPublicUrl(name).data.publicUrl);
        area.value = urls.join('\n');
      }
      upload.value = ''; toast('Gallery images ready to save.');
    });
    form.addEventListener('submit', function(){
      var urlInput = fields.querySelector('[data-project-url]'), imageInput = fields.querySelector('[data-project-images]');
      var projectUrl = (urlInput.value || '').trim(), images = normalizeImages(imageInput.value);
      if (projectUrl && !/^https?:\/\//i.test(projectUrl)) { toast('Project URL must start with http:// or https://'); return; }
      if (images.some(function(url){return !/^https?:\/\//i.test(url);})) { toast('Gallery image URLs must start with http:// or https://'); return; }
      var slug = slugField && slugField.value.trim();
      if (!slug) return;
      var attempts = 0;
      (function persistWhenBaseSaveCompletes(){
        attempts++;
        if (!modal || modal.hidden) {
          var api = getClient();
          if (!api) return;
          api.from('projects').update({project_url:projectUrl || null, project_images:images.join('\n') || null}).eq('slug', slug)
            .then(function(result){ if (result.error) toast('Project saved, but gallery fields need migration: run supabase-project-media.sql.'); });
          return;
        }
        if (attempts < 35) setTimeout(persistWhenBaseSaveCompletes, 150);
      })();
    });
  }
  function watch(){
    var modal = document.getElementById('modal'); if (!modal) return;
    new MutationObserver(addFields).observe(modal, {childList:true, subtree:true}); addFields();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
