(async function () {
    // Không hiển thị trên Android TV / TV Box
    const ua = navigator.userAgent.toLowerCase();
    const isTV =
        ua.includes("tv") ||
        ua.includes("android tv") ||
        ua.includes("aft") ||
        ua.includes("bravia");

    if (isTV) return;

    try {
        const res = await fetch("config/config.json");
        const cfg = await res.json();

        const box = document.createElement("div");
        box.id = "tv365-support";

        box.innerHTML = `
            <button id="tv365-contact">📞 Liên Hệ</button>
            <button id="tv365-group">👥 Nhóm trò chuyện</button>
        `;

        document.body.prepend(box);

        document
            .getElementById("tv365-contact")
            .onclick = () => window.open(cfg.support.url, "_blank");

        document
            .getElementById("tv365-group")
            .onclick = () => window.open(cfg.community.url, "_blank");

    } catch (e) {
        console.log("TV365 Support:", e);
    }
})();
