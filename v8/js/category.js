// ===============================
// TV365 V8 - category.js
// ===============================

let currentCategory = "TẤT CẢ";
let focusedCategory = "TẤT CẢ";

function createCategories() {

    const categoryBar = document.getElementById("categoryBar");

    if (!categoryBar) return;

    categoryBar.innerHTML = "";

    categories.forEach(group => {
        createCategoryButton(group);
    });
}

function createCategoryButton(name) {

    const categoryBar = document.getElementById("categoryBar");

    const button = document.createElement("button");

    button.className = "category-btn";
    button.textContent = name;

    if (name === currentCategory) {
        button.classList.add("active");
    }

    if (name === focusedCategory) {
        button.classList.add("focus");
    }

    // Khi remote hoặc chuột focus vào nút
    button.addEventListener("focus", function () {

        focusedCategory = name;

        document
            .querySelectorAll(".category-btn")
            .forEach(btn => btn.classList.remove("focus"));

        button.classList.add("focus");
    });

    // Khi nhấn OK hoặc click
    button.onclick = function () {

        currentCategory = name;

        document
            .querySelectorAll(".category-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        if (typeof createChannels === "function") {
            createChannels(currentCategory);
        }
    };

    categoryBar.appendChild(button);
}
