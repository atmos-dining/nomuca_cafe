/**
 * common.js — ノムカ+Cafe 共通スクリプト
 * ヘッダー・フッターのfetch挿入、ドロワー、ページトップ、スクロール表示
 */

(function () {
  'use strict';

  /* -------------------------------------------------------
   * 現在ページ判定（data-page属性を<body>に付ける）
   * home / course / menu / drink / blog
   * ------------------------------------------------------- */
  const currentPage = document.body.dataset.page || 'home';

  /* -------------------------------------------------------
   * ルートへの相対パスを自動計算
   * ------------------------------------------------------- */
  function getRootPath() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      const src = s.getAttribute('src');
      if (src && src.includes('common.js')) {
        const ups = (src.match(/\.\.\//g) || []).length;
        return '../'.repeat(ups);
      }
    }
    return './';
  }

  const ROOT = getRootPath();

  /* -------------------------------------------------------
   * ヘッダー読み込み
   * ------------------------------------------------------- */
  function loadHeader() {
    const mount = document.getElementById('shared-header');
    if (!mount) return;

    fetch(ROOT + 'partials/header.html')
      .then(r => r.text())
      .then(html => {
        html = html.replace(/href="\.\//g, `href="${ROOT}`);
        mount.outerHTML = html;
        initNav();
        initDrawer();
        initHeaderScroll();
      })
      .catch(() => {});
  }

  /* -------------------------------------------------------
   * ヘッダー：スクロールで背景を変化
   * ------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 60) {
        header.style.background = 'rgba(26, 15, 8, 0.95)';
      } else {
        header.style.background = '';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------
   * ナビ：現在ページにaria-currentを付与
   * ------------------------------------------------------- */
  function initNav() {
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === currentPage) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* -------------------------------------------------------
   * ドロワー（スマホメニュー）
   * ------------------------------------------------------- */
  function initDrawer() {
    const btn     = document.querySelector('.nav-toggle');
    const drawer  = document.getElementById('drawerMenu');
    const overlay = document.getElementById('drawerOverlay');
    if (!btn || !drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      btn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', () =>
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer()
    );

    document.querySelectorAll('[data-close="drawer"]').forEach(el =>
      el.addEventListener('click', closeDrawer)
    );

    drawer.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', closeDrawer)
    );

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* -------------------------------------------------------
   * フッター読み込み
   * ------------------------------------------------------- */
  function loadBottom() {
    const mount = document.getElementById('shared-bottom');
    if (!mount) return;

    fetch(ROOT + 'partials/bottom.html')
      .then(r => r.text())
      .then(html => {
        mount.innerHTML = html;
        mount.querySelectorAll('.section').forEach(sec => sec.classList.add('is-inview'));

        if (currentPage === 'home') {
          mount.querySelectorAll('.js-hide-on-home').forEach(el => el.style.display = 'none');
        }

        // bottom.html内の #access / #reserve へのハッシュスクロール対応
        const hash = location.hash;
        if (hash) {
          setTimeout(() => {
            const target = document.querySelector(hash);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }
      })
      .catch(() => {});
  }

  /* -------------------------------------------------------
   * ページトップボタン
   * ------------------------------------------------------- */
  function initPageTop() {
    const pageTop = document.querySelector('.page-top');
    if (!pageTop) return;

    function toggle() {
      const y = window.scrollY || document.documentElement.scrollTop;
      pageTop.classList.toggle('is-show', y > 480);
    }

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  /* -------------------------------------------------------
   * セクション スクロール表示（IntersectionObserver）
   * ------------------------------------------------------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.section, .reveal-up, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.10,
      rootMargin: '0px 0px -8% 0px'
    });

    targets.forEach(el => {
      // 下層ページの .section はアニメなし（CSSで制御）
      // reveal-* クラスは常にアニメ
      io.observe(el);
    });
  }

  /* -------------------------------------------------------
   * 初期化
   * ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadBottom();
    initPageTop();
    initScrollReveal();
  });

})();
