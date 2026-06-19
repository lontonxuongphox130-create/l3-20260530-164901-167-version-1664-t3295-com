(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            target.classList.add('is-missing');
            target.removeAttribute('src');
        }
    }, true);

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        var start = function () {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        };

        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        var next = carousel.querySelector('.hero-next');
        var prev = carousel.querySelector('.hero-prev');

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    var filterPages = Array.prototype.slice.call(document.querySelectorAll('.filter-page'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = (params.get('q') || '').trim().toLowerCase();
    var initialGenre = (params.get('genre') || '').trim().toLowerCase();
    var initialCategory = (params.get('category') || 'all').trim();

    filterPages.forEach(function (page) {
        var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(page.querySelectorAll('.filter-chip'));
        var status = page.querySelector('.filter-status');
        var searchInput = page.querySelector('.local-search input[name="q"], .page-search input[name="q"]');
        var activeCategory = initialCategory || 'all';
        var activeQuery = initialQuery;
        var activeGenre = initialGenre;

        if (searchInput && activeQuery) {
            searchInput.value = params.get('q') || '';
        }

        chips.forEach(function (chip) {
            if (chip.getAttribute('data-filter') === activeCategory) {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
            }
        });

        var apply = function () {
            cards.forEach(function (card) {
                var category = card.getAttribute('data-category') || '';
                var searchable = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var genre = (card.getAttribute('data-genre') || '').toLowerCase();
                var categoryMatch = activeCategory === 'all' || category === activeCategory;
                var queryMatch = !activeQuery || searchable.indexOf(activeQuery) !== -1;
                var genreMatch = !activeGenre || genre.indexOf(activeGenre) !== -1 || searchable.indexOf(activeGenre) !== -1;
                card.classList.toggle('hidden-by-filter', !(categoryMatch && queryMatch && genreMatch));
            });
            if (status) {
                status.textContent = activeQuery || activeGenre ? '已按当前条件筛选影片' : '';
            }
        };

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeCategory = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                apply();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                activeQuery = searchInput.value.trim().toLowerCase();
                apply();
            });
        }

        apply();
    });
})();
