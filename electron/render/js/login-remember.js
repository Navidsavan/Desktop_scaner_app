document.addEventListener('DOMContentLoaded', async () => {
  const emailEl    = document.getElementById('email');
  const passEl     = document.getElementById('password');
  const rememberEl = document.getElementById('rememberMe');
  const loginBtn   = document.getElementById('login_btn');

  try {
    // Load saved values
    const { rememberMe, email, password } = await window.prefs.getLogin();
    if (rememberMe) {
      rememberEl.checked = true;
      if (email)    emailEl.value = email;
      if (password) passEl.value  = password;
    }
  } catch (e) {
    console.warn('Failed to load saved login prefs:', e);
  }

  // When Login is clicked, save/clear based on checkbox
  loginBtn.addEventListener('click', async () => {
    const rememberMe = rememberEl.checked;
    const email      = emailEl.value.trim();
    const password   = passEl.value;

    try {
      await window.prefs.saveLogin({ rememberMe, email, password });
      // Continue with your existing login flow
      // e.g., call your login IPC or function here if not already wired
      // window.api.login({ email, password }) ...
    } catch (e) {
      console.warn('Failed to save login prefs:', e);
    }
  });
});
