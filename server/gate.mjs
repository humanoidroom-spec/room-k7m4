export function gatePage(message = '', unavailable = false, nonce = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#edf2f8"><title>ROOM — Private preview</title><style>
*{box-sizing:border-box}html{color-scheme:light}body{margin:0;min-height:100svh;font-family:Arial,Helvetica,sans-serif;color:#19283d;background:radial-gradient(ellipse at 90% 0%,#c4d8fa 0%,transparent 60%),linear-gradient(130deg,#f6f8fc,#e6edf7);display:flex;flex-direction:column}header{padding:28px clamp(24px,5vw,80px);border-bottom:1px solid #2339511a;display:flex;align-items:center;justify-content:space-between}.logo{font-size:28px;font-weight:700;letter-spacing:-1.8px}.logo span{color:#315cda}.edition{font:12px monospace;letter-spacing:.1em;color:#60748c}main{flex:1;display:grid;place-items:center;padding:56px 24px}.panel{width:100%;max-width:460px;padding:clamp(28px,5vw,48px);border:1px solid #fff;background:#ffffffa8;box-shadow:0 24px 80px #34588712;border-radius:12px}.kicker{font:12px monospace;letter-spacing:.14em;color:#4368a0;margin:0 0 28px}.lock{width:40px;height:40px;color:#315cda;margin-bottom:24px}h1{font-size:clamp(30px,5vw,38px);font-weight:500;letter-spacing:-1.5px;line-height:1.15;margin:0 0 16px}.intro{font-size:16px;line-height:1.6;color:#657387;margin:0 0 32px}label{display:block;font-size:14px;font-weight:600;margin-bottom:10px}input{width:100%;font:18px monospace;padding:15px;border:1px solid #bcc9dc;border-radius:5px;background:#f9fbff;color:#19283d}input:focus-visible,button:focus-visible{outline:3px solid #86aaff;outline-offset:3px}button{width:100%;margin-top:18px;padding:16px 20px;border:0;border-radius:5px;color:white;background:#315cda;font:500 16px Arial,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:space-between}button:hover{background:#244dbf}.error{font-size:14px;line-height:1.5;color:#a32438;margin:14px 0 0}.note{font-size:12px;line-height:1.6;color:#748398;margin:24px 0 0}footer{padding:24px;text-align:center;font:12px monospace;color:#7d8da4;letter-spacing:.05em}@media(max-width:450px){header{padding:22px 24px}.edition{font-size:12px}.panel{padding:28px}main{padding:32px 20px}}
</style></head><body><header><div class="logo">ROOM<span>.</span></div><span class="edition">VERSION 02</span></header><main><section class="panel"><p class="kicker">PRIVATE PREVIEW</p><svg class="lock" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="9" y="18" width="22" height="17" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M14 18v-6a6 6 0 0 1 12 0v6M20 25v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><h1>${unavailable ? 'Preview unavailable.' : 'A closer look at ROOM.'}</h1><p class="intro">${unavailable ? 'Please try again later.' : 'Enter the password shared with you to view this research preview.'}</p>${unavailable ? '' : `<form method="post" action="/access"><label for="password">Access password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256" autocapitalize="none" spellcheck="false" aria-describedby="access-note access-error"><p id="access-error" class="error" role="alert" ${message ? '' : 'hidden'}>${message}</p><button type="submit">Unlock preview <span aria-hidden="true">↗</span></button></form><p id="access-note" class="note">Access lasts 8 hours on this browser.</p><script nonce="${nonce}">
const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  const error = document.querySelector('#access-error');
  button.disabled = true;
  button.textContent = 'Checking…';
  error.hidden = true;
  try {
    const result = await fetch('/access', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json' }, body: new URLSearchParams(new FormData(form)) });
    if (result.ok) { location.replace('/'); return; }
    error.textContent = result.status === 429 ? 'Too many attempts. Please wait a minute.' : 'Incorrect password. Please try again.';
  } catch { error.textContent = 'Unable to connect. Please try again.'; }
  error.hidden = false;
  button.disabled = false;
  button.textContent = 'Unlock preview';
});
</script>`}</section></main><footer>ROOM / RESEARCH PREVIEW</footer></body></html>`;
}
