(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function showMessage(element, text) {
    if (!element) {
      return;
    }
    element.textContent = text;
    element.classList.add("show");
    window.setTimeout(function () {
      element.classList.remove("show");
    }, 3200);
  }

  function setupPlayer(player) {
    var video = player.querySelector("[data-player-video]");
    var button = player.querySelector("[data-play-button]");
    var message = player.querySelector("[data-player-message]");
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute("data-src");
    var initialized = false;
    var loading = false;
    var pendingPlay = false;
    var hls = null;

    function markReady() {
      loading = false;
      initialized = true;
      if (pendingPlay) {
        pendingPlay = false;
        playVideo();
      }
    }

    function initialize() {
      if (initialized || loading || !source) {
        return;
      }
      loading = true;
      showMessage(message, "正在加载影片...");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            loading = false;
            showMessage(message, "视频加载失败，请稍后重试");
          }
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", markReady, { once: true });
        return;
      }

      loading = false;
      showMessage(message, "当前浏览器不支持 HLS 播放");
    }

    function playVideo() {
      initialize();
      if (loading && !initialized) {
        pendingPlay = true;
        return;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showMessage(message, "点击播放按钮开始播放");
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      button.classList.remove("hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
