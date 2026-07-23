// ===============================
// TV365 V8 - category.js
// Tạo thanh danh mục từ group-title
// ===============================

let currentCategory = "TẤT CẢ";

// Tạo thanh danh mục
function createCategories() {

    const categoryBar = document.getElementById("categoryBar");

    if (!categoryBar) return;

    categoryBar.innerHTML = "";

    // Nút TẤT CẢ
    createCategoryButton("TẤT CẢ");

    // Các nhóm lấy từ error.m3u
    categories.forEach(group => {
        createCategoryButton(group);
    });
}

// Tạo một nút danh mục
function createCategoryButton(name) {

    const categoryBar = document.getElementById("categoryBar");

    const button = document.createElement("button");

    button.className = "category-btn";
    button.textContent = name;

    if (name === currentCategory) {
        button.classList.add("active");
    }

    button.onclick = function () {

        currentCategory = name;

        // Cập nhật nút đang chọn
        document
            .querySelectorAll(".category-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        // Hiển thị lại danh sách kênh
        if (typeof createChannels === "function") {
            createChannels(currentCategory);
        }
    };

    categoryBar.appendChild(button);
}
