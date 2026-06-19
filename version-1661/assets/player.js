import { H as Hls } from './hls-vendor-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

players.forEach(function (shell) {
    var video = shell.querySelector('.movie-player');
    var cover = shell.querySelector('.player-cover');
    var loading = shell.querySelector('.player-loading');
    var error = shell.querySelector('.player-error');
    var playButton = shell.querySelector('.player-play');
    var muteButton = shell.querySelector('.player-mute');
    var fullscreenButton = shell.querySelector('.player-fullscreen');
    var hlsUrl = video ? video.getAttribute('data-hls') : '';
    var hls = null;

    if (!video || !hlsUrl) {
        return;
    }

    var showLoading = function (visible) {
        if (loading) {
            loading.classList.toggle('is-visible', visible);
        }
    };

    var showError = function (message) {
        if (error) {
            error.textContent = message;
            error.classList.add('is-visible');
        }
        showLoading(false);
    };

    var attachSource = function () {
        showLoading(true);
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                showLoading(false);
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError('视频加载失败，请稍后重试');
                    if (hls) {
                        hls.destroy();
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl;
            video.addEventListener('loadedmetadata', function () {
                showLoading(false);
            }, { once: true });
        } else {
            showError('暂时无法播放，请稍后重试');
        }
    };

    var playVideo = function () {
        if (!video.src && !hls) {
            attachSource();
        }
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    };

    var togglePlay = function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    };

    attachSource();

    video.addEventListener('click', togglePlay);
    video.addEventListener('playing', function () {
        showLoading(false);
        if (cover) {
            cover.classList.add('is-hidden');
        }
        if (playButton) {
            playButton.textContent = '暂停';
        }
    });
    video.addEventListener('pause', function () {
        if (playButton) {
            playButton.textContent = '播放';
        }
    });
    video.addEventListener('waiting', function () {
        showLoading(true);
    });
    video.addEventListener('canplay', function () {
        showLoading(false);
    });

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    if (playButton) {
        playButton.addEventListener('click', togglePlay);
    }

    if (muteButton) {
        muteButton.addEventListener('click', function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        });
    }
});
