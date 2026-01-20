// js/chat.js

(() => {
    const fab = document.querySelector(".chat-fab");
    const overlay = document.getElementById("chat");     // <div class="chat" id="chat" hidden>
    const windowEl = overlay?.querySelector(".chat-window");
    const closeBtn = overlay?.querySelector(".chat-close");

    const body = document.getElementById("chatBody");
    const input = document.getElementById("chatInput");
    const send = document.getElementById("chatSend");

    if (!fab || !overlay || !body || !input || !send) {
        console.warn("[chat] elements not found");
        return;
    }

    const lockScroll = (locked) => {
        document.documentElement.style.overflow = locked ? "hidden" : "";
        document.body.style.overflow = locked ? "hidden" : "";
    };

    const openChat = () => {
        overlay.hidden = false;
        fab.setAttribute("aria-expanded", "true");
        lockScroll(true);
        setTimeout(() => input.focus(), 0);

        // приветствие один раз
        if (!body.dataset.inited) {
            body.dataset.inited = "1";
            addMessage("Здравствуйте! Я AI-ассистент AnaTil. Чем могу помочь?", "assistant");
        }
    };

    const closeChat = () => {
        overlay.hidden = true;
        fab.setAttribute("aria-expanded", "false");
        lockScroll(false);
    };

    fab.addEventListener("click", () => {
        if (overlay.hidden) openChat();
        else closeChat();
    });

    closeBtn?.addEventListener("click", closeChat);

    // ESC закрывает
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlay.hidden) closeChat();
    });

    // клик по затемнению — закрыть (но не при клике внутри окна)
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeChat();
    });

    // Enter отправляет (Shift+Enter не используем — у тебя input, не textarea)
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            send.click();
        }
    });

    send.addEventListener("click", async () => {
        const text = input.value.trim();
        if (!text || send.disabled) return;

        addMessage(text, "user");
        input.value = "";

        const typingEl = addTyping();
        send.disabled = true;

        try {
            const res = await fetch("http://localhost:3000/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });


            removeTyping(typingEl);

            if (!res.ok) {
                addMessage("Ошибка сервера. Попробуйте ещё раз.", "assistant");
                return;
            }

            const data = await res.json();
            addMessage(data.reply || "Пустой ответ от ИИ", "assistant");
        } catch (err) {
            console.error(err);
            removeTyping(typingEl);
            addMessage("Ошибка сети. Проверьте подключение.", "assistant");
        } finally {
            send.disabled = false;
            input.focus();
        }
    });

    function addMessage(text, role) {
        const wrap = document.createElement("div");
        wrap.className = `msg msg--${role}`;

        const bubble = document.createElement("div");
        bubble.className = "msg__bubble";
        bubble.textContent = text;

        const time = document.createElement("div");
        time.className = "msg__time";
        time.textContent = formatTime(new Date());

        wrap.appendChild(bubble);
        wrap.appendChild(time);

        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
    }

    function addTyping() {
        const wrap = document.createElement("div");
        wrap.className = "msg msg--assistant";
        wrap.dataset.typing = "1";

        const bubble = document.createElement("div");
        bubble.className = "msg__bubble";
        bubble.textContent = "Печатает…";

        wrap.appendChild(bubble);
        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
        return wrap;
    }

    function removeTyping(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function formatTime(d) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }
})();
