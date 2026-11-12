const T = s => (window.pnT ? window.pnT(s) : s);
// Cambiar entre Log In y Create Account
const texts = { login: ['Welcome back', 'Log in to Pet Nova'], register: ['Join Pet Nova', 'Register your pet and yourself in under two minutes'] };
function setMode(m) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.mode === m));
  document.getElementById('thumb').style.transform = m === 'login' ? 'translateX(0)' : 'translateX(100%)';
  document.getElementById('login').classList.toggle('on', m === 'login');
  document.getElementById('register').classList.toggle('on', m === 'register');
  document.getElementById('title').textContent = texts[m][0];
  document.getElementById('subtitle').textContent = texts[m][1];
  if (window.pnApply) window.pnApply(document.body);
}
document.querySelectorAll('[data-mode]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); setMode(el.dataset.mode); }));

// Registro en 3 pasos
let step = 1;
const next = document.getElementById('next'), back = document.getElementById('back'), err = document.getElementById('err');
function showStep() {
  document.querySelectorAll('.step').forEach(s => s.classList.toggle('on', +s.dataset.step === step));
  back.hidden = step === 1;
  next.textContent = T(step === 3 ? 'Register' : 'Next');
}
next.addEventListener('click', () => {
  if (step < 3) { step++; showStep(); return; }
  const v3 = vals(3);
  const pw = document.getElementById('pw').value, pw2 = document.getElementById('pw2').value;
  err.hidden = false;
  if (pw.length < 6) err.textContent = T('Password must be at least 6 characters');
  else if (pw !== pw2) err.textContent = T("Passwords don't match");
  else if (!v3[0].trim()) err.textContent = T('Please enter your full name');
  else if (!/^\S+@\S+\.\S+$/.test(v3[1].trim())) err.textContent = T('Please enter a valid email');
  else {
    const v1 = vals(1), v2 = vals(2);
    const acc = {
      owner: { name: v3[0].trim(), email: v3[1].trim().toLowerCase(), phone: v3[2], city: v3[3] },
      pet: { name: v1[0].trim() || 'Your pet', species: v1[1], age: v1[2], breed: v1[3], weight: v1[4], unit: v1[5], photo: photoData },
      medical: { vaccinated: v2[0], condition: v2[1], condText: v2[2], notes: v2[3] },
      appointments: [], vaccines: []
    };
    try { localStorage.setItem('pn-account', JSON.stringify(acc)); sessionStorage.setItem('pn-session', '1'); } catch (e) {}
    location.href = 'panel.html';
  }
});
back.addEventListener('click', () => { step--; err.hidden = true; showStep(); });
document.getElementById('species').addEventListener('change', e => document.getElementById('breedBox').hidden = !e.target.value);
document.getElementById('cond').addEventListener('change', e => document.getElementById('condBox').hidden = e.target.value !== 'Yes');
document.getElementById('login').addEventListener('submit', e => e.preventDefault());

// Datos de los pasos del registro (en orden de aparición)
function vals(n) { return [...document.querySelectorAll('.step[data-step="' + n + '"] input:not([type=file]),.step[data-step="' + n + '"] select,.step[data-step="' + n + '"] textarea')].map(e => e.value); }
// Foto de la mascota: se reduce para guardarla en el dispositivo
let photoData = '';
const fileIn = document.querySelector('.step[data-step="1"] input[type=file]');
if (fileIn) fileIn.addEventListener('change', () => {
  const f = fileIn.files[0]; if (!f) { photoData = ''; return; }
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 420 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); photoData = c.toDataURL('image/jpeg', .8); }; im.src = r.result; };
  r.readAsDataURL(f);
});
// Iniciar sesión: abre el panel si la cuenta guardada en este dispositivo coincide
const loginForm = document.getElementById('login');
let lerr = document.getElementById('lerr');
if (!lerr) { lerr = document.createElement('p'); lerr.className = 'err'; lerr.id = 'lerr'; lerr.hidden = true; loginForm.insertBefore(lerr, loginForm.querySelector('button[type=submit]')); }
loginForm.addEventListener('submit', () => {
  const mail = loginForm.querySelector('input[type=email]').value.trim().toLowerCase();
  let acc = null; try { acc = JSON.parse(localStorage.getItem('pn-account') || 'null'); } catch (x) {}
  if (acc && acc.owner && acc.owner.email === mail) { try { sessionStorage.setItem('pn-session', '1'); } catch (x) {} location.href = 'panel.html'; }
  else { lerr.hidden = false; lerr.textContent = T('No account found on this device. Create one first.'); }
});
