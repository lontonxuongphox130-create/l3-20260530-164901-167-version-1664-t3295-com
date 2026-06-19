(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张');
        dot.addEventListener('click', function () {
          setActive(index);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function setActive(index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === active);
        });
      }
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        setActive(active + 1);
      }, 5600);
    }

    renderDots();
    setActive(0);
    restart();

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(active + 1);
        restart();
      });
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function yearMatches(selected, yearText) {
    if (!selected || selected === '全部年份') return true;
    const year = parseInt(yearText, 10);
    if (!year) return false;
    if (/^\d{4}$/.test(selected)) return year === parseInt(selected, 10);
    const range = selected.split('-').map(function (item) {
      return parseInt(item, 10);
    });
    return range.length === 2 && year >= range[0] && year <= range[1];
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const keyword = panel.querySelector('[data-filter-keyword]');
    const year = panel.querySelector('[data-filter-year]');
    const category = panel.querySelector('[data-filter-category]');
    const reset = panel.querySelector('[data-filter-reset]');
    const count = panel.querySelector('[data-filter-count]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    function applyFilters() {
      const word = normalize(keyword && keyword.value);
      const selectedYear = year ? year.value : '';
      const selectedCategory = category ? category.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category
        ].join(' '));
        const okWord = !word || haystack.includes(word);
        const okYear = yearMatches(selectedYear, card.dataset.year);
        const okCategory = !selectedCategory || card.dataset.category === selectedCategory;
        const show = okWord && okYear && okCategory;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [keyword, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) keyword.value = '';
        if (year) year.value = '全部年份';
        if (category) category.value = '';
        applyFilters();
      });
    }

    const query = new URLSearchParams(window.location.search).get('q');
    if (query && keyword) {
      keyword.value = query;
    }

    applyFilters();
  });

  function loadHlsFromCdn() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      const existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.dataset.hlsLoader = 'true';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const message = player.querySelector('[data-player-message]');

    function showMessage(text) {
      if (!message) return;
      message.textContent = text;
      message.classList.add('show');
    }

    async function startPlayback() {
      if (!video) return;
      const source = (video.dataset.videoSrc || '').trim();

      if (!source) {
        showMessage('当前素材未提供该影片的 m3u8 或视频播放地址，未写入虚构播放源。');
        return;
      }

      try {
        if (source.toLowerCase().includes('.m3u8')) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            const Hls = await loadHlsFromCdn();
            if (Hls && Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(source);
              hls.attachMedia(video);
            } else {
              showMessage('当前浏览器暂不支持 HLS 播放。');
              return;
            }
          }
        } else {
          video.src = source;
        }

        await video.play();
        player.classList.add('playing');
      } catch (error) {
        showMessage('播放初始化失败，请检查播放源或浏览器网络环境。');
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
  });
})();
