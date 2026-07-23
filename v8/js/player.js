// ===============================
// TV365 V8 - player.js
// ===============================

let hls = null;

// Phát kênh
function playChannel(channel) {

    const player = document.getElementById("player");

    if (!player) return;

    // Hủy HLS cũ
    if (hls) {
        hls.destroy();
        hls = null;
    }

    // Xóa nội dung cũ
    player.innerHTML = "";

    // Tạo video
    const video = document.createElement("video");

    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    video.style.width = "100%";
    video.style.height = "100%";

    player.appendChild(video);

    // Tiêu đề kênh
    const title = document.createElement("div");

    title.className = "player-title";
    title.innerText = channel.name;

    player.appendChild(title);

    // Phát HLS
    if (Hls.isSupported()) {

        hls = new Hls({

            enableWorker: true,

            lowLatencyMode: true

        });

        hls.loadSource(channel.url);

        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {

            video.play().catch(function (e) {

                console.log(e);

            });

        });

    }

    // Safari / Android hỗ trợ HLS trực tiếp
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {

        video.src = channel.url;

        video.addEventListener("loadedmetadata", function () {

            video.play();

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
