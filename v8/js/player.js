// ==========================================
// TV365 PLAYER ENGINE (Hỗ trợ Native Android Bridge & Web Player)
// ==========================================

let currentPlayingChannel = null;
let hlsPlayerInstance = null;
let shakaPlayerInstance = null;

async function playChannel(channel) {
    if (!channel || !channel.url) return;
    currentPlayingChannel = channel;

    console.log("[TV365 Player] Đang chọn kênh:", channel.name, channel.url);

    // =========================================================================
    // 1. CẦU NỐI SANG ANDROID NATIVE (MEDIA3 EXOPLAYER) - Dành cho App Android & Tivi
    // =========================================================================
    if (window.AndroidBridge && window.AndroidBridge.playChannel) {
        // Lấy khóa DRM (ClearKey/Widevine) từ thuộc tính kênh (Hỗ trợ HBO, SCTV, Cinemax...)
        const drmKey = (channel.props && channel.props['inputstream.adaptive.license_key']) ||
                       channel.license_key ||
                       channel.drmKey || "";

        console.log("[TV365 Bridge] Đẩy sang Media3 ExoPlayer Native:", channel.url);
        window.AndroidBridge.playChannel(channel.url, drmKey);

        // Ẩn chữ hướng dẫn, hiện giao diện đang phát trên web
        updatePlayerUI(channel);
        return;
    }

    // =========================================================================
    // 2. TRÌNH PHÁT TRÊN TRÌNH DUYỆT WEB (Dành cho Test trên PC / Trình duyệt)
    // =========================================================================
    const videoElement = document.getElementById('video-player') || document.querySelector('video');
    if (!videoElement) return;

    const url = channel.url;
    const isMpd = url.includes('.mpd') || (channel.props && channel.props['inputstream.adaptive.manifest_type'] === 'mpd');

    updatePlayerUI(channel);

    try {
        // Dừng các player cũ trên web
        if (hlsPlayerInstance) { hlsPlayerInstance.destroy(); hlsPlayerInstance = null; }
        if (shakaPlayerInstance) { await shakaPlayerInstance.destroy(); shakaPlayerInstance = null; }

        if (isMpd && typeof shaka !== 'undefined') {
            // Phát luồng DASH (.mpd) bằng Shaka Player
            shakaPlayerInstance = new shaka.Player(videoElement);
            await shakaPlayerInstance.load(url);
            videoElement.play().catch(e => console.error("Shaka play error:", e));
        } else if (typeof Hls !== 'undefined' && Hls.isSupported() && (url.includes('.m3u8') || url.includes('playlist.m3u'))) {
            // Phát luồng HLS (.m3u8) bằng Hls.js
            hlsPlayerInstance = new Hls();
            hlsPlayerInstance.loadSource(url);
            hlsPlayerInstance.attachMedia(videoElement);
            hlsPlayerInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play().catch(e => console.error("HLS play error:", e));
            });
        } else {
            // Phát trực tiếp qua thẻ video HTML5 thông thường
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
function stopChannel() {
    if (window.AndroidBridge && window.AndroidBridge.stopChannel) {
        window.AndroidBridge.stopChannel();
    }

    if (hlsPlayerInstance) { hlsPlayerInstance.destroy(); hlsPlayerInstance = null; }
    if (shakaPlayerInstance) { shakaPlayerInstance.destroy(); shakaPlayerInstance = null; }

    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
    }

    const placeholder = document.querySelector('.player-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
}
