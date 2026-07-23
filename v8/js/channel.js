// ===============================
// TV365 V8 - channel.js
// Hiển thị danh sách kênh
// ===============================

// Hiển thị danh sách kênh
function createChannels(category = "TẤT CẢ") {

    const channelGrid = document.getElementById("channelGrid");

    if (!channelGrid) return;

    channelGrid.innerHTML = "";

    // Lọc theo danh mục
    const list = (category === "TẤT CẢ")
        ? channels
        : channels.filter(channel => channel.group === category);

    // Không có kênh
    if (list.length === 0) {

        channelGrid.innerHTML = `
            <div class="empty">
                Không có kênh nào.
            </div>
        `;

        return;
    }

    // Tạo từng ô kênh
    list.forEach((channel, index) => {

        const card = document.createElement("div");

        card.className = "channel-card";

        card.innerHTML = `
            <img
                src="${channel.logo}"
                alt="${channel.name}"
                loading="lazy"
                onerror="this.src='images/logo.png'"
            >

            <div class="channel-name">
                ${channel.name}
            </div>
        `;

        // Click phát kênh
        card.onclick = function () {

            // Xóa active cũ
            document
                .querySelectorAll(".channel-card")
                .forEach(item => item.classList.remove("active"));

            // Active mới
            card.classList.add("active");

            // Gọi player
            if (typeof playChannel === "function") {
                playChannel(channel);
            }

            console.log(
                "Đang phát:",
                channel.name,
                channel.url
            );

        };

        channelGrid.appendChild(card);

    });

}
