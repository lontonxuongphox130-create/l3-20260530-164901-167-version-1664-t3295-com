(function () {
  function each(items, callback) {
    Array.prototype.forEach.call(items, callback);
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  each(document.querySelectorAll('[data-hero]'), function (hero) {
    var slides = hero.querySelectorAll('[data-hero-slide]');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    var current = 0;

    function show(index) {
      current = index % slides.length;
      each(slides, function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      each(dots, function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (slides.length > 1) {
      each(dots, function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  each(document.querySelectorAll('[data-search-scope]'), function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var filterButtons = scope.querySelectorAll('[data-filter]');
    var container = scope.parentElement || document;
    var cards = container.querySelectorAll('.movie-card');
    var selected = 'all';
    var empty = container.querySelector('[data-no-results]');

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      each(cards, function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var category = card.getAttribute('data-category') || '';
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchFilter = selected === 'all' || category === selected;
        var showCard = matchText && matchFilter;
        card.classList.toggle('hidden-card', !showCard);
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    each(filterButtons, function (button) {
      button.addEventListener('click', function () {
        selected = button.getAttribute('data-filter') || 'all';
        each(filterButtons, function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
  });

  each(document.querySelectorAll('.movie-player'), function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function start() {
      if (!video || !stream) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var playCall = video.play();
      if (playCall && playCall.catch) {
        playCall.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance && hlsInstance.stopLoad) {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
