// electron/render/js/windowControls.js
document.addEventListener('DOMContentLoaded', () => {
  const minBtn   = document.getElementById('min-btn');
  const maxBtn   = document.getElementById('max-btn');
  const closeBtn = document.getElementById('close-btn');

  if (minBtn)   minBtn.addEventListener('click', () => window.api.minimize());
  if (maxBtn)   maxBtn.addEventListener('click', () => window.api.maximize());
  if (closeBtn) closeBtn.addEventListener('click', () => window.api.close());
});
