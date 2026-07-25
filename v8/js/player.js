// ===============================
// TV365 V8.5 - player.js
// ===============================

let hls = null;
let shakaPlayer = null;
let tsPlayer = null;

// -1 = AUTO
let qualityLevel = parseInt(localStorage.getItem("quality") ?? "-1");

// ===============================
// Phát kênh
// ===============================

function playChannel(channel) {

    if (!channel) return;

    window.currentChannel = channel;

    const player = document.getElementById("player");

    if (!player) return;

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

    // Xóa video cũ
    player.querySelectorAll("video").forEach(video => {

        video.pause();

        video.removeAttribute("src");

        video.load();

        video.remove();

    });

    // Xóa tiêu đề cũ
    player.querySelectorAll(".player-title").forEach(e => e.remove());

    // Video mới
    const video = document.createElement("video");

    video.autoplay = true;
    video.controls = true;
    video.playsInline = true;

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.display = "block";
    video.style.objectFit = "contain";
    video.style.background = "#000";

    player.appendChild(video);

    // Fullscreen bằng double click
    video.ondblclick = function () {

        if (document.fullscreenElement) {

            document.exitFullscreen?.();

        } else {

            player.requestFullscreen?.().catch(()=>{});

        }

    };

    // Tiêu đề
    const title = document.createElement("div");

    title.className = "player-title";
    title.textContent = channel.name || "";

    player.appendChild(title);

    // ===============================
    // Quality Controls
    // ===============================

    const qualityButton = document.getElementById("qualityButton");
    const qualityMenu = document.getElementById("qualityMenu");

    if (qualityButton && qualityMenu) {

        qualityMenu.innerHTML = "";

        qualityMenu.style.display = "none";

        qualityButton.onclick = function (e) {

            e.stopPropagation();

            qualityMenu.style.display =
                qualityMenu.style.display === "block"
                    ? "none"
                    : "block";

        };

    }

    // ===============================
    // HLS
    // ===============================

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
            if (hls.levels.length > 0 && qualityButton && qualityMenu) {

                qualityMenu.innerHTML = "";

                // ===== AUTO =====
                const autoItem = document.createElement("div");

                autoItem.className = "quality-item";
                autoItem.textContent = "AUTO";

                autoItem.onclick = function () {

                    qualityLevel = -1;

                    localStorage.setItem("quality", "-1");

                    let best = 0;

                    hls.levels.forEach((l, i) => {

                        if ((l.height || 0) > (hls.levels[best].height || 0)) {

                            best = i;

                        }

                    });

                    hls.currentLevel = best;

                    qualityButton.textContent =
                        "⚙ AUTO (" +
                        (hls.levels[best].height || "?") +
                        "P)";

                    qualityMenu.style.display = "none";

                };

                qualityMenu.appendChild(autoItem);

                // ===== Danh sách chất lượng =====

                [...hls.levels]
                    .map((level, index) => ({ level, index }))
                    .sort((a, b) => (b.level.height || 0) - (a.level.height || 0))
                    .forEach(function (itemData) {

                        const item = document.createElement("div");

                        item.className = "quality-item";

                        item.textContent =
                            (itemData.level.height || "?") + "P";

                        item.onclick = function () {

                            qualityLevel = itemData.index;

                            localStorage.setItem(
                                "quality",
                                qualityLevel
                            );

                            hls.currentLevel = itemData.index;

                            qualityButton.textContent =
                                "⚙ " +
                                (itemData.level.height || "?") +
                                "P";

                            qualityMenu.style.display = "none";

                        };

                        qualityMenu.appendChild(item);

                    });

                if (qualityLevel == -1) {

                    let best = 0;

                    hls.levels.forEach((l, i) => {

                        if ((l.height || 0) >
                            (hls.levels[best].height || 0)) {

                            best = i;

                        }

                    });

                    hls.currentLevel = best;

                    qualityButton.textContent =
                        "⚙ AUTO (" +
                        (hls.levels[best].height || "?") +
                        "P)";

                } else {

                    hls.currentLevel = qualityLevel;

                    if (hls.levels[qualityLevel]) {

                        qualityButton.textContent =
                            "⚙ " +
                            (hls.levels[qualityLevel].height || "?") +
                            "P";

                    }

                }

            }

            video.play().catch(console.log);

            setTimeout(function () {

             if (!document.fullscreenElement &&
                 player.requestFullscreen) {

                 player.requestFullscreen().catch(()=>{});

             }

            }, 300);

        });
        hls.on(Hls.Events.ERROR, function (event, data) {

            console.log("HLS ERROR", data);

            if (data.fatal) {

                switch (data.type) {

                    case Hls.ErrorTypes.NETWORK_ERROR:

                        console.log("Khôi phục NETWORK...");

                        hls.startLoad();

                        break;

                    case Hls.ErrorTypes.MEDIA_ERROR:

                        console.log("Khôi phục MEDIA...");

                        hls.recoverMediaError();

                        break;

                    default:

                        hls.destroy();

                        break;

                }

            }

        });

    }

    // ===============================
    // Safari / iPhone
    // ===============================

    else if (video.canPlayType("application/vnd.apple.mpegurl")) {

        video.src = channel.url;

        video.addEventListener("loadedmetadata", function () {

            video.play().catch(console.log);

            setTimeout(function () {

                if (!document.fullscreenElement &&
                    video.requestFullscreen) {

                    video.requestFullscreen().catch(() => {});

                }

            }, 300);

        });

    }

    // ===============================
    // Không hỗ trợ
    // ===============================

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

            setTimeout(function () {

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

            setTimeout(function () {

                remoteLock = false;

            }, 400);

        }

    }

});

// ===============================
// Phím F - Fullscreen
// ===============================

document.addEventListener("keydown", function (e) {

    if (e.key === "f" || e.key === "F") {

        const video = document.querySelector("#player video");

        if (!video) return;

        if (document.fullscreenElement) {

            document.exitFullscreen?.();

        } else {

            player.requestFullscreen?.().catch(()=>{});

        }

    }

});

// ===============================
// Đóng menu Quality khi click ngoài
// ===============================

document.addEventListener("click", function (e) {

    const btn = document.getElementById("qualityButton");
    const menu = document.getElementById("qualityMenu");

    if (!btn || !menu) return;

    if (!btn.contains(e.target) && !menu.contains(e.target)) {

        menu.style.display = "none";

    }

});

