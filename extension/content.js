// Adds a "Copy link" button to the header of Google Chat's conversation pane
// (the split-pane right side, or a full-screen conversation), next to
// "Open in full screen", so a link can be copied without maximizing.
//
// The header (header[data-open-conversation-in-full-screen-event-type-xid])
// carries the space in its jsdata ("jUcABe;space/<id>;$n" or "dm/<id>").
// When the pane shows a thread (aria-label ends in "Thread"), the thread id
// is the data-topic-id of the c-wiz messages shown under that header.
// Links: https://chat.google.com[/u/N]/room/<id>[/<topic>] (or /dm/...).
(() => {
  const BTN_CLASS = "gccl-btn";
  const HEADER_SEL = "header[data-open-conversation-in-full-screen-event-type-xid]";
  const LINK_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7A3.1 3.1 0 0 1 3.9 12zM8 13h8v-2H8v2zm9-6h-4v1.9h4a3.1 3.1 0 0 1 0 6.2h-4V17h4a5 5 0 0 0 0-10z"/></svg>';
  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

  function accountPrefix() {
    const m = /\/u\/(\d+)\//.exec(location.pathname);
    return m ? `/u/${m[1]}` : "";
  }

  function groupOf(header) {
    const m = /(space|dm)\/([A-Za-z0-9_-]+)/.exec(header.getAttribute("jsdata") || "");
    if (m) return { kind: m[1] === "dm" ? "dm" : "room", id: m[2] };
    const view = header.closest("[data-soft-view-id]");
    const v = view && /^\/(room|dm)\/([A-Za-z0-9_-]+)/.exec(view.getAttribute("data-soft-view-id"));
    return v ? { kind: v[1], id: v[2] } : null;
  }

  // The topic of the thread open under this header: a visible c-wiz message
  // horizontally inside the header's pane and below it.
  function topicOf(header) {
    if (!/Thread$/.test(header.getAttribute("aria-label") || "")) return null;
    const hr = header.getBoundingClientRect();
    for (const el of document.querySelectorAll("c-wiz[data-topic-id]")) {
      const r = el.getBoundingClientRect();
      if (r.width && r.left >= hr.left - 1 && r.right <= hr.right + 1 && r.top >= hr.bottom - 1) {
        return el.getAttribute("data-topic-id");
      }
    }
    return null;
  }

  function linkOf(header) {
    const group = groupOf(header);
    if (!group) return null;
    const topic = topicOf(header);
    return `https://chat.google.com${accountPrefix()}/${group.kind}/${group.id}${topic ? "/" + topic : ""}`;
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  function decorate(header) {
    if (header.querySelector(`.${BTN_CLASS}`)) return;
    const fullScreen = header.querySelector("button[aria-label^='Open in full screen']");
    if (!fullScreen) return;
    const anchor = fullScreen.closest("[data-is-tooltip-wrapper]") || fullScreen;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = BTN_CLASS;
    btn.innerHTML = LINK_ICON;
    const reset = () => {
      btn.innerHTML = LINK_ICON;
      btn.classList.remove("gccl-done", "gccl-fail");
      btn.title = /Thread$/.test(header.getAttribute("aria-label") || "")
        ? "Copy link to this thread"
        : "Copy link to this conversation";
    };
    reset();
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const link = linkOf(header);
      const ok = link && (await copy(link));
      btn.innerHTML = ok ? CHECK_ICON : LINK_ICON;
      btn.classList.add(ok ? "gccl-done" : "gccl-fail");
      btn.title = ok ? `Copied: ${link}` : "Couldn't find a link";
      setTimeout(reset, 1500);
    });
    ["mousedown", "mouseup", "pointerdown"].forEach((t) =>
      btn.addEventListener(t, (e) => e.stopPropagation())
    );
    anchor.parentNode.insertBefore(btn, anchor);
  }

  function scan() {
    document.querySelectorAll(HEADER_SEL).forEach(decorate);
  }

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      scan();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  scan();
})();
