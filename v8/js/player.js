// ===============================
// TV365 V8 - player.js
// ===============================

let hls = null;
let shakaPlayer = null;
let tsPlayer = null;

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
    video.style.objectFit = "cover";

    video.style.background = "#000";

    player.appendChild(video);

    // Tiêu đề
    const title = document.createElement("div");

    title.className = "player-title";
    title.textContent = channel.name || "";

    player.appendChild(title);

    const url = (channel.url || "").toLowerCase();

    // Nếu hỗ trợ HLS.js
    if (Hls.isSupported()) {

        hls = new Hls({

            enableWorker: true,
            lowLatencyMode: true

        });

        hls.loadSource(channel.url);

        hls.attachMedia(video);

        hls.on(Hls.Events.MEDIA_ATTACHED, function () {

            console.log("MEDIA ATTACHED");

        });

        hls.on(Hls.Events.MANIFEST_PARSED, function () {

            video.play().catch(function (err) {

                console.log(err);

            });
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

document.addEventListener("keydown", function (e) {

    if (!document.fullscreenElement) return;

    if (!window.channels || !window.currentChannel) return;

    let index = window.channels.findIndex(c => c.url === window.currentChannel.url);

    if (index < 0) return;

    switch (e.key) {

        case "ArrowUp":

            e.preventDefault();

            if (index > 0) {

                playChannel(window.channels[index - 1]);

                window.currentChannel = window.channels[index - 1];

            }

            break;

        case "ArrowDown":

            e.preventDefault();

            if (index < window.channels.length - 1) {

                playChannel(window.channels[index + 1]);

                window.currentChannel = window.channels[index + 1];

            }

            break;

    }

});
