/* Panel de la mascota: se crea al registrarse. Todo se guarda solo en este dispositivo (sin servidor). */
(function () {
  const KEY = 'pn-account', root = document.getElementById('panel'); if (!root) return;
  const T = s => (window.pnT ? window.pnT(s) : s);
  const F = (s, o) => T(s).replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let acc = null, session = false;
  try { acc = JSON.parse(localStorage.getItem(KEY) || 'null'); session = !!sessionStorage.getItem('pn-session'); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(acc)); } catch (e) {} };
  const ico = {
    cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    vac: '<svg viewBox="0 0 24 24"><path d="M18 2l4 4M20 4l-9 9M13 7l4 4M9 11l4 4M7 13l-4 4M3 21l4-4M5 15l4 4"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'
  };
  const paw = '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="43" rx="14" ry="12"/><ellipse cx="11" cy="29" rx="6" ry="8"/><ellipse cx="24" cy="15" rx="6" ry="8"/><ellipse cx="40" cy="15" rx="6" ry="8"/><ellipse cx="53" cy="29" rx="6" ry="8"/></svg>';
  const loc = () => (document.documentElement.lang === 'es' ? 'es-PA' : 'en-US');
  const fmt = a => { try { return new Date(a.date + 'T' + (a.time || '00:00')).toLocaleString(loc(), a.time ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }); } catch (e) { return a.date; } };
  const fmtD = d => { try { return new Date(d + 'T00:00').toLocaleDateString(loc(), { dateStyle: 'medium' }); } catch (e) { return d; } };
  function logout() { try { sessionStorage.removeItem('pn-session'); } catch (e) {} location.href = 'index.html'; }
  function navLink() {
    const a = document.querySelector('.nav-login'); if (!a || !session) return;
    a.setAttribute('href', '#'); a.onclick = e => { e.preventDefault(); logout(); };
    const u = a.querySelector('u'); if (u) u.textContent = T('LOG OUT');
  }
  function render() {
    if (!acc || !session) {
      root.innerHTML = '<div class="pn-empty-state"><h2>' + esc(T(acc ? 'Log in to see your panel' : 'No account found on this device. Create one first.')) + '</h2><a class="btn" href="login.html">' + esc(T(acc ? 'Go to log in' : 'Create account')) + '</a></div>'; return;
    }
    const p = acc.pet, o = acc.owner;
    const appts = acc.appointments.filter(a => !a.done).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
    const pend = acc.vaccines.filter(v => !v.done);
    const li = (it, kind, title, sub) => '<li><div><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div><div class="pn-act"><button data-done="' + kind + ':' + it.id + '">' + esc(T('Mark as done')) + '</button><button data-del="' + kind + ':' + it.id + '">' + esc(T('Remove')) + '</button></div></li>';
    root.innerHTML =
      '<div class="pn-hero"><div class="pn-photo">' + (p.photo ? '<img alt="' + esc(p.name) + '" src="' + esc(p.photo) + '">' : paw) + '</div><div><h1>' + esc(p.name) + '</h1><div class="pn-facts">' +
        '<span><b>' + esc(p.breed || T('Not specified')) + '</b><small>' + esc(T('Breed')) + '</small></span>' +
        '<span><b>' + esc(p.age || '—') + '</b><small>' + esc(T('Age (years)')) + '</small></span>' +
        '<span><b>' + esc(p.species ? T(p.species) : '—') + '</b><small>' + esc(T('Species')) + '</small></span></div></div></div>' +
      '<div class="pn-over"><span class="pn-kicker">' + esc(T('Overview')) + '</span><h2>' + esc(F('Hello, {name}!', { name: o.name })) + '</h2><p>' + esc(F("Welcome to {pet}'s panel", { pet: p.name })) + '</p></div>' +
      '<div class="pn-stats"><div class="pn-stat">' + ico.cal + '<span>' + esc(T('Appointments')) + '</span><b>' + appts.length + '</b></div>' +
        '<div class="pn-stat">' + ico.vac + '<span>' + esc(T('Vaccines')) + '</span><b>' + acc.vaccines.length + '</b></div>' +
        '<div class="pn-stat">' + ico.bell + '<span>' + esc(T('Active Alerts')) + '</span><b>0</b></div></div>' +
      '<div class="pn-todo"><span>' + esc(T('To Do')) + '</span><b>' + (appts.length + pend.length) + '</b></div>' +
      '<div class="pn-grid"><section class="pn-card"><h3>' + esc(T('Schedule')) + '</h3><h4>' + esc(T('Upcoming Appointments')) + '</h4><button class="btn" data-add="appt">' + esc(T('Schedule Appointment')) + ' +</button>' +
        (appts.length ? '<ul class="pn-list">' + appts.map(a => li(a, 'appt', a.reason || T('Appointment'), fmt(a))).join('') + '</ul>' : '<p class="pn-empty">' + esc(T('No appointments scheduled')) + '</p>') + '</section>' +
      '<section class="pn-card"><h3>' + esc(T('Health')) + '</h3><h4>' + esc(T('Pending Vaccines')) + '</h4><button class="btn" data-add="vac">' + esc(T('Schedule Vaccine')) + ' +</button>' +
        (pend.length ? '<ul class="pn-list">' + pend.map(v => li(v, 'vac', v.name, fmtD(v.date))).join('') + '</ul>' : '<p class="pn-empty">' + esc(T('No vaccines registered')) + '</p>') + '</section></div>';
    navLink();
  }
  function modal(kind) {
    const m = document.createElement('div'); m.className = 'pn-modal';
    const isA = kind === 'appt', today = new Date().toISOString().slice(0, 10);
    m.innerHTML = '<form><h4>' + esc(T(isA ? 'Schedule Appointment' : 'Schedule Vaccine')) + '</h4>' +
      (isA ? '<label>' + esc(T('Reason')) + '<input name="reason" type="text" placeholder="' + esc(T('Check-up')) + '"></label><div class="row"><label>' + esc(T('Date')) + '<input name="date" type="date" min="' + today + '" required></label><label>' + esc(T('Time')) + '<input name="time" type="time"></label></div>'
           : '<label>' + esc(T('Vaccine name')) + '<input name="name" type="text" required></label><label>' + esc(T('Date')) + '<input name="date" type="date" required></label>') +
      '<div class="acts"><button type="button" class="btn ghost" data-x>' + esc(T('Cancel')) + '</button><button class="btn" type="submit">' + esc(T('Save')) + '</button></div></form>';
    document.body.append(m);
    const f = m.querySelector('form'); f.querySelector('input').focus();
    const close = () => m.remove();
    m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-x')) close(); });
    addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); removeEventListener('keydown', k); } });
    f.addEventListener('submit', e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f)); d.id = Date.now() + '';
      if (!d.date) return;
      if (isA) acc.appointments.push({ id: d.id, reason: (d.reason || '').trim(), date: d.date, time: d.time || '' });
      else { if (!(d.name || '').trim()) return; acc.vaccines.push({ id: d.id, name: d.name.trim(), date: d.date }); }
      save(); close(); render();
    });
  }
  root.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'); if (add) return modal(add.dataset.add);
    const del = e.target.closest('[data-del]'), done = e.target.closest('[data-done]'); if (!del && !done) return;
    const [kind, id] = (del ? del.dataset.del : done.dataset.done).split(':'), list = kind === 'appt' ? acc.appointments : acc.vaccines;
    const i = list.findIndex(x => x.id === id); if (i < 0) return;
    if (del) list.splice(i, 1); else list[i].done = true;
    save(); render();
  });
  addEventListener('pn-lang', render);
  render();
})();
