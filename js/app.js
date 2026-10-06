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
  var musicToggle = document.getElementById('music-toggle');

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

  /* ---------- 回答按时间排序 ---------- */
  function parseTime(s) {
    var m = String(s || '').match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})/);
    if (!m) return 0;
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
  }

  function sortedAnswers(lt) {
    var ans = (lt.answers || []).slice();
    ans.sort(function (a, b) { return parseTime(a.time) - parseTime(b.time); });
    return ans;
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
      ? '已随机抽取 5 封 · 点击信封，读一读那些来自远方的回答'
      : '共 ' + LETTERS.length + ' 封信 · 点击任一信封拆开阅读';

    wall.innerHTML = ids.map(function (id) {
      var lt = byId(id);
      var sig = lt.signature ? '<div class="card-sign">—— ' + esc(lt.signature) + '</div>' : '';
      var count = (lt.answers || []).length;
      var badge = count ? '<span class="card-count">' + count + ' 封回信</span>' : '';
      return (
        '<article class="letter-card reveal" data-id="' + id + '" tabindex="0" role="button" aria-label="拆开第 ' + id + ' 封信">' +
          '<div class="card-head">' +
            '<span class="card-no">第 ' + id + ' 封</span>' +
            '<div class="card-head-right">' + badge + '<span class="card-seal">✉</span></div>' +
          '</div>' +
          '<div class="card-body">' + linesHtml(lt.lines) + '</div>' +
          sig +
          '<div class="card-open">拆开这封信 <span>→</span></div>' +
        '</article>'
      );
    }).join('');

    observeReveals();
  }

  /* ---------- 回答列表 HTML ---------- */
  function answersHtml(lt) {
    var ans = sortedAnswers(lt);
    if (!ans.length) {
      return (
        '<div class="answers-section">' +
          '<div class="answers-head"><h4>来自天南地北的回信</h4></div>' +
          '<div class="answers-empty">这封信，还在等它的回音。</div>' +
        '</div>'
      );
    }
    var cards = ans.map(function (a) {
      return (
        '<article class="answer-card">' +
          '<div class="answer-body">' + linesHtml(a.lines) + '</div>' +
          '<div class="answer-meta">' +
            '<span class="answer-author">—— ' + esc(a.author) + '</span>' +
            (a.time ? '<span class="answer-time">' + esc(a.time) + '</span>' : '') +
          '</div>' +
        '</article>'
      );
    }).join('');
    return (
      '<div class="answers-section">' +
        '<div class="answers-head">' +
          '<h4>来自天南地北的回信</h4>' +
          '<span class="answers-count">共 ' + ans.length + ' 封</span>' +
        '</div>' +
        '<div class="answers-list">' + cards + '</div>' +
      '</div>'
    );
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
      '</div>' +
      answersHtml(lt);

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

  /* ---------- 背景音乐 ---------- */
  var bgm = new Audio('assets/audio/bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.55;
  bgm.preload = 'auto';
  var playing = false;

  function setPlaying(on) {
    playing = on;
    musicToggle.classList.toggle('playing', on);
    musicToggle.classList.toggle('paused', !on);
    musicToggle.setAttribute('title', on ? '暂停背景音乐' : '播放背景音乐');
    musicToggle.setAttribute('aria-label', on ? '暂停背景音乐' : '播放背景音乐');
  }

  function tryPlay() {
    bgm.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
  }

  musicToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (playing) {
      bgm.pause();
      setPlaying(false);
    } else {
      tryPlay();
    }
  });

  // 初始尝试自动播放
  tryPlay();

  // 浏览器可能拦截自动播放：首次用户交互时若仍未播放，则补一次
  var interactionHandler = function () {
    if (!playing) tryPlay();
    document.removeEventListener('click', interactionHandler);
    document.removeEventListener('keydown', interactionHandler);
    document.removeEventListener('touchstart', interactionHandler);
  };
  document.addEventListener('click', interactionHandler);
  document.addEventListener('keydown', interactionHandler);
  document.addEventListener('touchstart', interactionHandler);

  /* ---------- 启动 ---------- */
  render();
  observeReveals();
  if (location.hash.indexOf('#letter') === 0) handleHash();
})();
