// ONE place for your keys. Used by the public site AND the admin panel.
// Formspree: https://formspree.io  |  Supabase: Project Settings -> API (use the "anon public" key, never the service_role key)
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpppjbgo'; // EDIT ME
var SUPABASE_URL = 'https://ajdsdckaucivcjeslxuc.supabase.co'; // EDIT ME
var SUPABASE_ANON_KEY = 'sb_publishable_1sFqR3Dk3bhQkeLWgqlj_A_0uELR7mF'; // EDIT ME

// Shared visual polish for all public pages; resolve relative to this script so
// it also works when config.js is loaded from a nested route such as /admin.
(function () {
  if (document.getElementById('portfolio-enhancements')) return;
  var configScript = document.currentScript;
  if (!configScript) return;
  var stylesheet = document.createElement('link');
  stylesheet.id = 'portfolio-enhancements';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('enhancements.css', configScript.src).href;
  document.head.appendChild(stylesheet);
})();
