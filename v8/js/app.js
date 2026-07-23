// ===============================
// TV365 V8 - app.js
// ===============================

window.addEventListener("load", async function () {

    console.log("TV365 V8 đang khởi động...");

    // Đọc error.m3u
    await loadM3U();

    // Tạo danh mục
    createCategories();

    // Hiển thị tất cả kênh
    createChannels();

    // Tự động phát kênh đầu tiên
    if (channels.length > 0) {

        playChannel(channels[0]);

        // Active kênh đầu tiên
        setTimeout(function () {

            const first = document.querySelector(".channel-card");

            if (first) {
                first.classList.add("active");
            }

        }, 200);

    }

    console.log("TV365 V8 sẵn sàng.");

});
