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
        const drmKey = (channel.props && channel.props['inputstream.adaptive.license_key']) || 
                       channel.license_key || 
                       channel.drmKey || "";
        
        console.log("[TV365 Bridge] Đẩy sang Media3 ExoPlayer Native:", channel.url);
        window.AndroidBridge.playChannel(channel.url, drmKey);
        
        updatePlayerUI(channel);
        return;
    }

    // =========================================================================
    // 2. TRÌNH PHÁT TRÊN TRÌNH DUYỆT WEB (Dành cho Test trên PC)
    // =========================================================================
    const videoElement = document.getElementById('video-player') || document.querySelector('video');
    if (!videoElement) return;

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
        } else if (typeof Hls !== 'undefined' && Hls.isSupported() && (url.includes('.m3u8') || url.includes('playlist.m3u'))) {
            hlsPlayerInstance = new Hls();
            hlsPlayerInstance.loadSource(url);
            hlsPlayerInstance.attachMedia(videoElement);
            hlsPlayerInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play().catch(e => console.error("HLS play error:", e));
            });
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

    // Làm trong suốt khung chứa và ẩn thẻ video web để hiển thị PlayerView Native ở dưới
    const playerSection = document.querySelector('.player-section') || document.getElementById('player');
    if (playerSection) {
        playerSection.style.background = 'transparent';
    }
    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.style.display = 'none';
    }
}

// Dừng phát kênh
function stopChannel() {
    if (window.AndroidBridge && window.AndroidBridge.stopChannel) {
        window.AndroidBridge.stopChannel();
    }
    
    if (hlsPlayerInstance) { hlsPlayerInstance.destroy(); hlsPlayerInstance = null; }
    if (shakaPlayerInstance) { await shakaPlayerInstance.destroy(); shakaPlayerInstance = null; }

    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
        videoElement.style.display = 'block'; // Hiển thị lại thẻ video khi dừng
    }

    const placeholder = document.querySelector('.player-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
}
