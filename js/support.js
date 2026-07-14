(async function () {

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

        const contactBtn = document.getElementById("contactBtn");
        const groupBtn = document.getElementById("groupBtn");

        if (!contactBtn || !groupBtn) return;

      if (cfg.contact && cfg.contact.title) {
    contactBtn.textContent = cfg.contact.title;
}

if (cfg.group && cfg.group.title) {
    groupBtn.textContent = cfg.group.title;
}

        function openLink(url){

            if(!url) return;

            window.open(url,"_blank");

        }

        contactBtn.onclick = ()=>openLink(cfg.contact.url);
        groupBtn.onclick = ()=>openLink(cfg.group.url);

    } catch(e){

        console.log(e);

    }

})();
