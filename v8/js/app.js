// ===============================
// TV365 V8 - app.js
// ===============================

window.addEventListener("load", async function () {

    try {

        console.log("TV365 V8 đang khởi động...");

        // Đọc M3U
        await loadM3U();

        window.channels = channels;

        createCategories();

        createChannels();

        console.log("Đã tạo giao diện.");

        // ===== TẠM THỜI KHÔNG TỰ PHÁT KÊNH =====
        /*
        if (channels.length > 0) {

            playChannel(channels[0]);

            setTimeout(function () {

                const first = document.querySelector(".channel-card");

                if (first) {
                    first.classList.add("active");
                }

            }, 200);

        }
        */

        console.log("TV365 V8 sẵn sàng.");

    } catch (e) {

        console.error(e);

        alert(e);

    }

});
