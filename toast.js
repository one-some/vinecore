async function toastError(title, desc) {
    const toastBar = $el("toast-bar");

    $el("toast .title").innerText = title;
    $el("toast .desc").innerText = desc;

    toastBar.style.transition = "none";
    toastBar.style.width = "100%";

    // Trigger reflow
    void toastBar.offsetLeft;

    $el("toast").classList.add("out");
    toastBar.style.transition = "width 2400ms";
    toastBar.style.width = "0%";

    await timeout(2500);
    $el("toast").classList.remove("out");
}
