const modalContainer = $el("modal-container");

function ynPrompt(text) {
    $el("#conf-msg").innerText = text;

    showModal("confirm");

    return new Promise(function(resolve) {
        $el("#conf-yea").onclick = function() {
            resolve(true);
            hideModal();
        }

        $el("#conf-nae").onclick = function() {
            resolve(false);
            hideModal();
        }
    });
}

function showModal(modalId) {
    for (const etcModal of document.querySelectorAll("modal")) {
        etcModal.classList.add("hidden");
    }

    const modal = $el(`[modal-id="${modalId}"]`);
    if (!modal) throw new Error(`Bad modalid ${modalId}`);

    modalContainer.classList.remove("hidden");
    modal.classList.remove("hidden");
}

function hideModal() {
    modalContainer.classList.add("hidden");
}

modalContainer.addEventListener("click", function(event) {
    // Close when click background
    if (event.target === this) hideModal();
});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey) return;
    if (event.shiftKey) return;

    if (event.key === "Escape") {
        if (modalContainer.classList.contains("hidden")) return;
        hideModal();
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    const hookedAnchors = $el("modal:not(.hidden)").querySelectorAll("[shortcut]");
    for (const a of hookedAnchors) {
        if (event.key !== a.getAttribute("shortcut")) continue;
        a.click();
        break;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
});
