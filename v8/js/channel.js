// ===============================
// TV365 PREMIUM V8.1
// channel.js
// Hiển thị danh sách kênh
// ===============================

function createChannels(category = "TẤT CẢ") {

    const channelGrid = document.getElementById("channelGrid");

    if (!channelGrid) return;

    channelGrid.innerHTML = "";

    // Lọc danh sách theo nhóm
    const list = category === "TẤT CẢ"
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

    // Render nhanh hơn
    const fragment = document.createDocumentFragment();

    list.forEach(channel => {

        const card = document.createElement("div");

        card.className = "channel-card";

        // Hỗ trợ TV Remote / Keyboard
        card.tabIndex = 0;

        // Chuẩn bị cho các tính năng sau này
        card.dataset.name = channel.name;
        card.dataset.group = channel.group;

        // Tooltip trên PC
        card.title = channel.name;

        card.innerHTML = `
            <img
                src="${channel.logo}"
                alt="${channel.name}"
                loading="lazy"
                draggable="false"
                onerror="this.src='images/logo.png'"
            >

            <div class="channel-name">
                ${channel.name}
            </div>
        `;

        // Click phát kênh
        card.addEventListener("click", () => {

            // Bỏ active cũ
            document.querySelectorAll(".channel-card")
                .forEach(item => item.classList.remove("active"));

            // Active mới
            card.classList.add("active");

            // Phát kênh
            if (typeof playChannel === "function") {
                playChannel(channel);
            }

            console.log(
                "[TV365]",
                channel.name,
                channel.url
            );

        });

        fragment.appendChild(card);

    });

    channelGrid.appendChild(fragment);

}
