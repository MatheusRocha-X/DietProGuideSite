const modal = document.querySelector("#download-modal");
const modalDialog = modal?.querySelector(".modal__dialog");
const openButtons = document.querySelectorAll(".js-open-download");
const closeTriggers = modal?.querySelectorAll("[data-close-modal]") ?? [];
const copyButton = document.querySelector("#copy-pix");
const copyFeedback = document.querySelector("#copy-feedback");

let lastFocusedElement = null;

function openModal() {
  if (!modal || !modalDialog) return;

  lastFocusedElement = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  copyFeedback.textContent = "";
  window.setTimeout(() => modalDialog.focus(), 0);
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

async function copyPixCode() {
  if (!copyButton || !copyFeedback) return;

  const code = copyButton.dataset.pixCode?.trim();
  if (!code) return;

  const copyWithSelection = () => {
    const helper = document.createElement("textarea");
    helper.value = code;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "-999px";
    helper.style.left = "-999px";
    document.body.appendChild(helper);
    helper.focus();
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    window.getSelection()?.removeAllRanges();
    return copied;
  };

  try {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        if (!copyWithSelection()) throw new Error("Clipboard fallback failed");
      }
    } else if (!copyWithSelection()) {
      throw new Error("Clipboard fallback failed");
    }

    copyFeedback.textContent = "Pix copiado com sucesso.";
  } catch {
    copyFeedback.textContent = "Não foi possível copiar agora. Tente novamente.";
  }
}

function keepFocusInsideModal(event) {
  if (!modal?.classList.contains("is-open") || event.key !== "Tab") return;

  const focusableElements = modal.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const focusable = Array.from(focusableElements);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

openButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

closeTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeModal);
});

copyButton?.addEventListener("click", copyPixCode);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) {
    closeModal();
  }

  keepFocusInsideModal(event);
});
