// giovannicuchiaro.com: revelação no scroll, contagem dos números, menu, abas,
// barra de progresso, cursor e magnetismo. Comportamento copiado de referencia/guia-animacoes.js.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* Contagem: 0 -> valor em 1600 ms, out cúbico */
  function count(el) {
    var to = +el.dataset.to, suf = el.dataset.suf || '';
    var out = function (v) { el.innerHTML = v + (suf ? '<sup>' + suf + '</sup>' : ''); };
    if (reduce) { out(to); return; }
    var t0 = performance.now(), D = 1600;
    var step = function (t) { var p = Math.min(1, (t - t0) / D); out(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* Revelação: a 18% de visibilidade, uma vez */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('.n[data-to]').forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    $$('.rv,.stat').forEach(function (el) { io.observe(el); });

    /* Item ativo do menu conforme o scroll */
    var links = $$('.menu a[data-id]');
    var ioNav = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.dataset.id === e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = document.getElementById(a.dataset.id); if (s) ioNav.observe(s); });
  } else {
    $$('.rv,.stat').forEach(function (el) { el.classList.add('in'); });
  }

  /* Menu do celular: a mesma lista, em tela cheia */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* Abas: clique e setas do teclado */
  var tabs = $$('.tab');
  function sel(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { sel(t); });
    t.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); sel(tabs[j]); tabs[j].focus(); }
    });
  });

  /* Progresso: fio de 3 px no topo */
  var pr = $('#progress');
  var onScroll = function () { var h = document.documentElement; pr.style.transform = 'scaleX(' + (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) + ')'; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Cursor e magnetismo: só ponteiro fino */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var c = $('#cur'), x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; c.style.opacity = 1; });
    document.addEventListener('mouseleave', function () { c.style.opacity = 0; });
    (function loop() { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; c.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    $$('a,button,summary').forEach(function (a) {
      a.addEventListener('mouseenter', function () { c.classList.add('big'); });
      a.addEventListener('mouseleave', function () { c.classList.remove('big'); });
    });
    $$('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', (e.clientX - r.left - r.width / 2) * 0.3 + 'px');
        b.style.setProperty('--by', (e.clientY - r.top - r.height / 2) * 0.3 + 'px');
      });
      b.addEventListener('mouseleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }
})();
