import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const toggle = $('.mobile-toggle');
  const panel = $('.mobile-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupHeroCarousel() {
  const slides = $$('.hero-slide');
  const thumbs = $$('.hero-thumb');
  if (!slides.length || !thumbs.length) return;

  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, itemIndex) => slide.classList.toggle('active', itemIndex === activeIndex));
    thumbs.forEach((thumb, itemIndex) => thumb.classList.toggle('active', itemIndex === activeIndex));
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      showSlide(index);
      start();
    });
  });

  showSlide(0);
  start();
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function setupFilters() {
  const grid = $('[data-filter-grid]');
  if (!grid) return;

  const cards = $$('.movie-card', grid);
  const keywordInput = $('[data-filter-keyword]');
  const yearSelect = $('[data-filter-year]');
  const regionSelect = $('[data-filter-region]');
  const counter = $('[data-filter-count]');
  const empty = $('[data-empty-message]');

  const applyFilter = () => {
    const keyword = normalizeText(keywordInput && keywordInput.value);
    const year = yearSelect ? yearSelect.value : '';
    const region = regionSelect ? regionSelect.value : '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalizeText(card.dataset.search);
      const cardYear = card.dataset.year || '';
      const cardRegion = card.dataset.region || '';
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchYear = !year || cardYear === year;
      const matchRegion = !region || cardRegion === region;
      const shouldShow = matchKeyword && matchYear && matchRegion;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visible += 1;
    });

    if (counter) counter.textContent = `当前显示 ${visible} 部 / 共 ${cards.length} 部`;
    if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
  };

  [keywordInput, yearSelect, regionSelect].forEach((control) => {
    if (control) control.addEventListener('input', applyFilter);
  });

  applyFilter();
}

function setupMoviePlayer() {
  const video = $('#movie-player');
  const button = $('.play-overlay');
  if (!video || !button) return;

  let loaded = false;
  let hlsInstance = null;

  const fallbackToMp4 = () => {
    const fallback = video.dataset.fallback;
    if (!fallback) return;
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    video.src = fallback;
    video.load();
  };

  const loadPlayer = () => {
    if (!loaded) {
      loaded = true;
      const hlsUrl = video.dataset.hls;
      const fallback = video.dataset.fallback;

      if (hlsUrl && Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            fallbackToMp4();
          }
        });
      } else if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else if (fallback) {
        video.src = fallback;
      }
    }

    button.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        video.setAttribute('controls', 'controls');
      });
    }
  };

  button.addEventListener('click', loadPlayer);
  video.addEventListener('play', () => button.classList.add('is-hidden'));
  video.addEventListener('pause', () => {
    if (video.currentTime === 0 || video.ended) button.classList.remove('is-hidden');
  });
}

setupMobileMenu();
setupHeroCarousel();
setupFilters();
setupMoviePlayer();
