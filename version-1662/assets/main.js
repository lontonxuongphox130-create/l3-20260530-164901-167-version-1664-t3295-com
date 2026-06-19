(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length <= 1) {
      return;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function bindFilters() {
    var bars = document.querySelectorAll("[data-filter-bar]");
    bars.forEach(function (bar) {
      var scope = document.querySelector("[data-filter-scope]");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter-button]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = normalize(button.getAttribute("data-filter-button"));
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          cards.forEach(function (card) {
            var haystack = normalize([
              card.getAttribute("data-title"),
              card.getAttribute("data-year"),
              card.getAttribute("data-genre"),
              card.getAttribute("data-region")
            ].join(" "));
            card.hidden = Boolean(value) && haystack.indexOf(value) === -1;
          });
        });
      });
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-movie-card>",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"poster-link\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"play-hover\">▶</span>",
      "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"movie-title\">" + escapeHtml(movie.title) + "</a>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var subtitle = document.querySelector("[data-search-subtitle]");
    if (input && query) {
      input.value = params.get("q");
    }
    var movies = window.SEARCH_INDEX;
    var matched = query ? movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine
      ].join(" "));
      return haystack.indexOf(query) !== -1;
    }) : movies.slice(0, 60);
    if (title) {
      title.textContent = query ? "搜索结果" : "热门内容";
    }
    if (subtitle) {
      subtitle.textContent = query ? "与关键词相关的影片内容" : "可直接输入关键词继续检索";
    }
    if (!matched.length) {
      results.innerHTML = "<div class=\"detail-article\"><h2>没有找到相关影片</h2><p>可以尝试更换片名、年份、地区或类型关键词。</p></div>";
      return;
    }
    results.innerHTML = matched.slice(0, 120).map(createSearchCard).join("");
  }

  ready(function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    bindSearchPage();
  });
})();
