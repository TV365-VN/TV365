// ==========================================
// TV365 PLAYER ENGINE (Fix hoàn chỉnh ô xem trước & WebView player)
// ==========================================

let currentPlayingChannel = null;
let hlsPlayerInstance = null;
let shakaPlayerInstance = null;

async function playChannel(channel) {
    if (!channel || !channel.url) return;
    currentPlayingChannel = channel;

    console.log("[TV365 Player] Đang chọn kênh:", channel.name);

    // =========================================================================
    // 1. CẦU NỐI SANG ANDROID NATIVE (MEDIA3 EXOPLAYER & DRM)
    // =========================================================================
    if (window.AndroidBridge && window.AndroidBridge.playChannel) {
        const drmKey = channel.licenseKey ||
                       channel.license_key ||
                       (channel.props && channel.props['inputstream.adaptive.license_key']) ||
                       channel.drmKey ||
                       channel.licenseUrl ||
                       channel.drm_url ||
                       channel.key || "";

        window.AndroidBridge.playChannel(channel.url, drmKey);
        updatePlayerUI(channel);
        return;
    }

    // =========================================================================
    // 2. TRÌNH PHÁT TRÊN TRÌNH DUYỆT WEB / Ô XEM TRƯỚC (PREVIEW)
    // =========================================================================
    const videoElement = document.getElementById('videoElement');
    if (!videoElement) return;

    videoElement.style.display = 'block';
    videoElement.muted = true;
    videoElement.autoplay = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');

    const url = channel.url;
    const isMpd = url.includes('.mpd') || (channel.props && channel.props['inputstream.adaptive.manifest_type'] === 'mpd');

    updatePlayerUI(channel);

    try {
        if (hlsPlayerInstance) { hlsPlayerInstance.destroy(); hlsPlayerInstance = null; }
        if (shakaPlayerInstance) { await shakaPlayerInstance.destroy(); shakaPlayerInstance = null; }

        if (isMpd && typeof shaka !== 'undefined') {
            shakaPlayerInstance = new shaka.Player(videoElement);
            await shakaPlayerInstance.load(url);
            videoElement.play().catch(e => console.error("Shaka play error:", e));
        } else if (url.includes('.m3u8') || url.includes('playlist.m3u')) {
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                hlsPlayerInstance = new Hls();
                hlsPlayerInstance.loadSource(url);
                hlsPlayerInstance.attachMedia(videoElement);
                hlsPlayerInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoElement.play().catch(e => console.error("HLS play error:", e));
                });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = url;
                videoElement.play().catch(e => console.error("Native HLS play error:", e));
            }
        } else {
            videoElement.src = url;
            videoElement.play().catch(e => console.error("Native play error:", e));
        }
    } catch (e) {
        console.error("[TV365 Player] Lỗi khởi chạy player web:", e);
    }
}

// Cập nhật giao diện khi bắt đầu xem kênh
function updatePlayerUI(channel) {
    const placeholder = document.querySelector('.player-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
}

// Dừng phát kênh
async function stopChannel() {
    if (window.AndroidBridge && window.AndroidBridge.stopChannel) {
        window.AndroidBridge.stopChannel();
    }

    if (hlsPlayerInstance) {
        hlsPlayerInstance.destroy();
        hlsPlayerInstance = null;
    }

    if (shakaPlayerInstance) {
        await shakaPlayerInstance.destroy();
        shakaPlayerInstance = null;
    }

    const videoElement = document.getElementById('videoElement');
    if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
        videoElement.style.display = 'none';
    }

    const placeholder = document.querySelector('.player-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
}
