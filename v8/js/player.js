// ===============================
// TV365 V8 - player.js
// ===============================

let hls = null;
let shakaPlayer = null;
let tsPlayer = null;

// Đọc chất lượng đã lưu
let qualityLevel = parseInt(localStorage.getItem("quality") ?? "-1");

// Phát kênh
function playChannel(channel) {

    window.currentChannel = channel;

    const player = document.getElementById("player");

    if (!player || !channel) return;

    // Hủy player cũ
    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (shakaPlayer) {
        shakaPlayer.destroy();
        shakaPlayer = null;
    }

    if (tsPlayer) {
        tsPlayer.destroy();
        tsPlayer = null;
    }

    // Dừng video cũ
    const oldVideo = player.querySelector("video");

    if (oldVideo) {
        oldVideo.pause();
        oldVideo.removeAttribute("src");
        oldVideo.load();
    }

    player.innerHTML = "";

    // Video
    const video = document.createElement("video");

    video.autoplay = true;
    video.controls = true;
    video.playsInline = true;

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.display = "block";

    // Lấp kín khung phát
    video.style.objectFit = "contain";

    video.style.background = "#000";

    player.appendChild(video);
    video.ondblclick = function () {

        if (!document.fullscreenElement) {

       video.requestFullscreen?.().catch(()=>{});

        } else {

            document.exitFullscreen?.();

        }

    };

    // Tiêu đề
    const title = document.createElement("div");

    title.className = "player-title";
    title.textContent = channel.name || "";

    player.appendChild(title);


    // Nếu hỗ trợ HLS.js
    if (Hls.isSupported()) {

    hls = new Hls({

        enableWorker: true,
        lowLatencyMode: true,

        startLevel: -1,
        capLevelToPlayerSize: false

    });

        hls.loadSource(channel.url);

        hls.attachMedia(video);

        hls.on(Hls.Events.MEDIA_ATTACHED, function () {

            console.log("MEDIA ATTACHED");

        });

       hls.on(Hls.Events.MANIFEST_PARSED, function () {

           if (hls.levels.length > 0) {

               if (qualityLevel == -1) {
let best = 0;

hls.levels.forEach((l, i) => {
    if ((l.height || 0) > (hls.levels[best].height || 0)) {
        best = i;
    }
});

hls.currentLevel = best;

               } else {

                   hls.currentLevel = qualityLevel;

               }

           }

           video.play().catch(console.log);

           setTimeout(() => {
                if (document.fullscreenElement == null && video.requestFullscreen) {
                    video.requestFullscreen().catch(() => {});
                }
            }, 300);

        });

        hls.on(Hls.Events.ERROR, function (event, data) {

            console.log("HLS ERROR", data);

        });

    }

    // Safari / iPhone
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {

        video.src = channel.url;
video.addEventListener("loadedmetadata", function () {

    video.play().catch(function (err) {

        console.log(err);

    });

    setTimeout(() => {
        if (!document.fullscreenElement && video.requestFullscreen) {
            video.requestFullscreen().catch(() => {});
        }
    }, 300);

});

    }

    // Không hỗ trợ
    else {

        player.innerHTML = `
            <div class="player-placeholder">
                Thiết bị không hỗ trợ HLS
            </div>
        `;

    }

}
// ===============================
// Remote TV - Đổi kênh
// ===============================

let remoteLock = false;

document.addEventListener("keydown", function (e) {

    if (!document.fullscreenElement) return;

    if (!window.channels || !window.currentChannel) return;

    if (remoteLock) return;

    const key = e.key || "";
    const code = e.code || "";
    const keyCode = e.keyCode || e.which;

    let index = window.channels.findIndex(
        c => c.url === window.currentChannel.url
    );

    if (index < 0) return;

    // Kênh trước
    if (
        key === "ArrowUp" ||
        code === "ArrowUp" ||
        keyCode === 19
    ) {

        e.preventDefault();

        if (index > 0) {

            remoteLock = true;

            playChannel(window.channels[index - 1]);

            setTimeout(() => {
                remoteLock = false;
            }, 400);

        }

        return;
    }

    // Kênh sau
    if (
        key === "ArrowDown" ||
        code === "ArrowDown" ||
        keyCode === 20
    ) {

        e.preventDefault();

        if (index < window.channels.length - 1) {

            remoteLock = true;

            playChannel(window.channels[index + 1]);

            setTimeout(() => {
                remoteLock = false;
            }, 400);

        }

        return;
    }

});
document.addEventListener("keydown",function(e){

    if(e.key=="f" || e.key=="F"){

        const video=document.querySelector("video");

        if(!video) return;

        if(document.fullscreenElement){

            document.exitFullscreen?.();

        }else{

            video.requestFullscreen?.().catch(()=>{});

        }

    }

});
