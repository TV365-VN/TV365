const M3U_URL = atob(
    "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1RWMzY1LVZOL1RWMzY1LURBVEEvbWFpbi9lcnJvci5tM3U="
);

let channels = [];
let categories = ["TẤT CẢ"];

async function loadM3U() {
    try {
        const response = await fetch(M3U_URL, {
            cache: "no-cache"
        });

        const text = await response.text();

        parseM3U(text);

    } catch (e) {

        console.error("Không tải được M3U", e);

    }
}

function parseM3U(text) {

    channels = [];
    categories = ["TẤT CẢ"];

    const lines = text.split("\n");

    let current = {};

    for (let line of lines) {

        line = line.trim();

        if (line.startsWith("#EXTINF")) {

            const name =
                line.split(",").pop().trim();

            const logo =
                (line.match(/tvg-logo="(.*?)"/) || [])[1] || "";

            let group =
                (line.match(/group-title="(.*?)"/) || [])[1] || "KHÁC";

            // Nếu playlist có group-title="TẤT CẢ"
            // thì đổi sang KHÁC để không tạo thêm nút TẤT CẢ
            if (group === "TẤT CẢ") {
                group = "KHÁC";
            }

            current = {
                name,
                logo,
                group
            };

            if (!categories.includes(group)) {
                categories.push(group);
            }

        } else if (
            line &&
            !line.startsWith("#")
        ) {

            current.url = line;

            channels.push(current);

            current = {};

        }
    }
}
