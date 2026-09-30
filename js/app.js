/* ============================================================
   高一新生致天南地北大学生的43封信 —— 交互逻辑
   ============================================================ */
(function () {
  'use strict';

  var wall = document.getElementById('wall');
  var overlay = document.getElementById('overlay');
  var modalScroll = document.getElementById('modal-scroll');
  var letterDetail = document.getElementById('letter-detail');
  var modalClose = document.getElementById('modal-close');
  var reshuffleBtn = document.getElementById('reshuffle');
  var reshuffleHint = document.getElementById('reshuffle-hint');
  var modeBtns = document.querySelectorAll('.mode-btn');

  var currentMode = 'random'; // random | all
  var currentRandomIds = [];

  /* ---------- 工具 ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function byId(id) {
    for (var i = 0; i < LETTERS.length; i++) {
      if (LETTERS[i].id === id) return LETTERS[i];
    }
    return null;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linesHtml(lines) {
    return lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('');
  }

  /* ---------- 渲染信件墙 ---------- */
  function render() {
    var ids;
    if (currentMode === 'random') {
      currentRandomIds = shuffle(LETTERS.map(function (l) { return l.id; })).slice(0, 5);
      ids = currentRandomIds;
    } else {
      ids = LETTERS.map(function (l) { return l.id; });
    }

    reshuffleBtn.hidden = currentMode !== 'random';
    reshuffleHint.textContent = currentMode === 'random'
      ? '已随机抽取 5 封 · 点击信封拆开阅读并回信'
      : '共 ' + LETTERS.length + ' 封信 · 点击任一信封拆开阅读并回信';

    wall.innerHTML = ids.map(function (id) {
      var lt = byId(id);
      var sig = lt.signature ? '<div class="card-sign">—— ' + esc(lt.signature) + '</div>' : '';
      return (
        '<article class="letter-card reveal" data-id="' + id + '" tabindex="0" role="button" aria-label="拆开第 ' + id + ' 封信">' +
          '<div class="card-head">' +
            '<span class="card-no">第 ' + id + ' 封</span>' +
            '<span class="card-seal">✉</span>' +
          '</div>' +
          '<div class="card-body">' + linesHtml(lt.lines) + '</div>' +
          sig +
          '<div class="card-open">拆开这封信 <span>→</span></div>' +
        '</article>'
      );
    }).join('');

    observeReveals();
  }

  /* ---------- 信件详情 ---------- */
  function openLetter(id) {
    var lt = byId(id);
    if (!lt) return;

    var sig = lt.signature ? '<div class="detail-sign">—— ' + esc(lt.signature) + '</div>' : '';

    letterDetail.innerHTML =
      '<div class="detail-head">' +
        '<div class="dh-kicker">潼南中学 · 高一（13）班</div>' +
        '<h3>第 ' + id + ' 封信</h3>' +
      '</div>' +
      '<div class="letter-paper detail-paper">' +
        '<div class="detail-body">' + linesHtml(lt.lines) + '</div>' +
        sig +
      '</div>' +
      '<div class="evidence">' +
        '<div class="ev-box">' +
          '<h4>十五岁，一笔一画写下的疑问</h4>' +
          '<div class="ev-sub">这位同学的手写原稿</div>' +
          '<div class="photo-frame">' +
            '<img src="assets/photos/' + id + '.jpg" alt="第 ' + id + ' 封信手写原稿" loading="lazy" />' +
          '</div>' +
        '</div>' +
        '<div class="ev-box">' +
          '<h4>扫描二维码，写下你的回答</h4>' +
          '<div class="ev-sub">用你的经历，认真回一封</div>' +
          '<div class="qr-frame">' +
            '<img src="assets/qrcodes/' + id + '.png" alt="第 ' + id + ' 封信答题二维码" />' +
            '<p class="qr-tip">手机扫码，即可进入这封信的答题页面。<br />也许只要几分钟，<strong>却足以照亮一个孩子。</strong></p>' +
          '</div>' +
        '</div>' +
      '</div>';

    overlay.hidden = false;
    modalScroll.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('show'); });
  }

  function closeLetter() {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    if (location.hash.indexOf('letter') === 0) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    setTimeout(function () { overlay.hidden = true; }, 300);
  }

  /* ---------- 事件绑定 ---------- */
  wall.addEventListener('click', function (e) {
    var card = e.target.closest('.letter-card');
    if (card) openLetter(parseInt(card.getAttribute('data-id'), 10));
  });
  wall.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var card = e.target.closest('.letter-card');
      if (card) { e.preventDefault(); openLetter(parseInt(card.getAttribute('data-id'), 10)); }
    }
  });

  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentMode = btn.getAttribute('data-mode');
      render();
    });
  });

  reshuffleBtn.addEventListener('click', render);
  modalClose.addEventListener('click', closeLetter);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeLetter(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeLetter();
  });

  /* ---------- 深链接：#letter/N ---------- */
  function handleHash() {
    var m = location.hash.match(/^#letter\/(\d+)/);
    if (m) openLetter(parseInt(m[1], 10));
  }
  window.addEventListener('hashchange', handleHash);

  /* ---------- Reveal 动效 ---------- */
  var io;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
    }
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 启动 ---------- */
  render();
  observeReveals();
  if (location.hash.indexOf('#letter') === 0) handleHash();
})();
