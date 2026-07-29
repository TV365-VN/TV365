// ==========================================
// TV365 PLAYER ENGINE (Đã tối ưu bắt khóa DRM cho HBO)
// ==========================================

let currentPlayingChannel = null;
let hlsPlayerInstance = null;
let shakaPlayerInstance = null;

async function playChannel(channel) {
    if (!channel || !channel.url) return;
    currentPlayingChannel = channel;

    console.log("[TV365 Player] Đang chọn kênh:", channel.name);
    console.log("[TV365 Player] URL Video:", channel.url);
    console.log("[TV365 Player] Thông tin Channel đầy đủ:", JSON.stringify(channel));

    // =========================================================================
    // 1. CẦU NỐI SANG ANDROID NATIVE (MEDIA3 EXOPLAYER)
    // =========================================================================
    if (window.AndroidBridge && window.AndroidBridge.playChannel) {
        // Quét tất cả các trường có khả năng chứa license key / DRM URL của HBO
        const drmKey = channel.license_key || 
                       (channel.props && channel.props['inputstream.adaptive.license_key']) || 
                       channel.drmKey || 
                       channel.licenseUrl || 
                       channel.drm_url || 
                       channel.key || "";
        
        console.log("[TV365 Bridge] DRM Key trích xuất được:", drmKey);
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
