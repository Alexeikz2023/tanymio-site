/* Tanymio — site shell: reading settings, navigation, demo access, small helpers. */
(function () {
  "use strict";

  var STORE = {
    settings: "tanymio.settings.v1",
    access: "tanymio.access.v1",
    progress: "tanymio.progress.v1"
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* private mode / file:// restrictions — the prototype still works, just without memory */
    }
  }

  var settings = Object.assign(
    { text: "normal", contrast: false, voice: false },
    read(STORE.settings, {})
  );

  var T = (window.TANYMIO = window.TANYMIO || {});
  var KZ = document.documentElement.lang === "kk";
  function ui(ru, kk) { return KZ ? kk : ru; }

  T.store = { read: read, write: write, keys: STORE };
  settings.voiceRu = settings.voiceRu === "male" ? "male" : "female";
  settings.voiceKk = settings.voiceKk === "male" ? "male" : "female";
  T.settings = settings;

  var audioBase = (document.body && document.body.dataset.audioBase) || "assets/audio/";
  if (!/\/$/.test(audioBase)) audioBase += "/";
  T.audioBase = audioBase;
  T.audioUrl = function (lang, lessonId, part) {
    var pack = lang === "kk" ? settings.voiceKk : settings.voiceRu;
    return audioBase + lang + "/" + (pack === "male" ? "male" : "female") + "/" + lessonId + "/" + part + ".mp3";
  };

  T.saveSettings = function () {
    write(STORE.settings, settings);
    applySettings();
  };

  T.getAccess = function () {
    return read(STORE.access, { unlocked: false, plan: null, since: null });
  };

  T.isUnlocked = function () {
    return !!T.getAccess().unlocked;
  };

  T.unlock = function (plan) {
    write(STORE.access, { unlocked: true, plan: plan || "course", since: new Date().toISOString() });
    document.dispatchEvent(new CustomEvent("tanymio:access", { detail: { unlocked: true } }));
  };

  T.getProgress = function () {
    return read(STORE.progress, {});
  };

  T.setProgress = function (id, patch) {
    var all = T.getProgress();
    all[id] = Object.assign({}, all[id] || {}, patch);
    write(STORE.progress, all);
    return all[id];
  };

  T.resetProgress = function (id) {
    var all = T.getProgress();
    delete all[id];
    write(STORE.progress, all);
  };

  T.qs = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  T.qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  T.escape = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  };

  /* ---------------------------------------------------------------------- */
  /* reading settings                                                        */
  /* ---------------------------------------------------------------------- */

  var TEXT_STEPS = ["normal", "large", "xlarge"];

  function applySettings() {
    document.documentElement.dataset.text = settings.text;
    document.documentElement.dataset.contrast = settings.contrast ? "high" : "normal";
    T.qsa("button[data-contrast]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(!!settings.contrast));
    });
    T.qsa("[data-voice]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(!!settings.voice));
      var label = btn.querySelector("span");
      if (label) label.textContent = settings.voice ? "Озвучка вкл." : "Озвучка";
    });
  }

  T.applySettings = applySettings;

  T.qsa("[data-text-up]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = TEXT_STEPS.indexOf(settings.text);
      if (i < TEXT_STEPS.length - 1) {
        settings.text = TEXT_STEPS[i + 1];
        T.saveSettings();
        toast(settings.text === "xlarge" ? ui("Самый крупный текст", "Ең үлкен мәтін") : ui("Текст крупнее", "Мәтін үлкейді"));
      } else {
        toast(ui("Это самый крупный размер", "Бұдан үлкені жоқ"));
      }
    });
  });

  T.qsa("[data-text-down]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = TEXT_STEPS.indexOf(settings.text);
      if (i > 0) {
        settings.text = TEXT_STEPS[i - 1];
        T.saveSettings();
        toast(ui("Текст меньше", "Мәтін кішірейді"));
      } else {
        toast(ui("Это обычный размер текста", "Бұл әдеттегі мәтін өлшемі"));
      }
    });
  });

  T.qsa("button[data-contrast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      settings.contrast = !settings.contrast;
      T.saveSettings();
      toast(settings.contrast ? ui("Высокий контраст включён", "Жоғары контраст қосылды") : ui("Обычные цвета", "Әдеттегі түстер"));
    });
  });

  T.qsa("[data-voice]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      settings.voice = !settings.voice;
      T.saveSettings();
      if (settings.voice && T.speak) {
        T.speak(ui("Озвучивание включено. В уроках подсказки будут читаться вслух.", "Дыбыстау қосылды. Сабақтарда кеңестер дауыстап оқылады."), T.audioUrl(KZ ? "kk" : "ru", "ui", "voice-on"));
      }
      toast(settings.voice ? ui("Озвучивание включено", "Дыбыстау қосылды") : ui("Озвучивание выключено", "Дыбыстау өшірілді"));
    });
  });

  /* ---------------------------------------------------------------------- */
  /* speech                                                                  */
  /* ---------------------------------------------------------------------- */

  var voice = null;

  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    var voices = window.speechSynthesis.getVoices() || [];
    voice = voices.find(function (v) { return (KZ ? /^kk([-_]|$)/i : /^ru([-_]|$)/i).test(v.lang); }) || null;
  }

  if ("speechSynthesis" in window) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  var audioEl = null;

  function speakFallback(text) {
    if (!("speechSynthesis" in window) || !text) return false;
    try {
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(String(text));
      utter.lang = KZ ? "kk-KZ" : "ru-RU";
      utter.rate = 0.88;
      utter.pitch = 1;
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
      return true;
    } catch (err) {
      return false;
    }
  }

  T.speak = function (text, url) {
    if (!text && !url) return false;
    T.stopSpeech();
    if (url) {
      try {
        audioEl = new Audio(url);
        audioEl.preload = "auto";
        audioEl.onerror = function () {
          audioEl = null;
          speakFallback(text);
        };
        var playing = audioEl.play();
        if (playing && playing.catch) {
          playing.catch(function () {
            audioEl = null;
            speakFallback(text);
          });
        }
        return true;
      } catch (err) {
        audioEl = null;
      }
    }
    return speakFallback(text);
  };

  T.stopSpeech = function () {
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  /* ---------------------------------------------------------------------- */
  /* toast                                                                   */
  /* ---------------------------------------------------------------------- */

  var toastEl = null;
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 3200);
  }

  T.toast = toast;

  /* ---------------------------------------------------------------------- */
  /* navigation                                                              */
  /* ---------------------------------------------------------------------- */

  var page = document.body.dataset.page;
  if (page) {
    var current = document.querySelector('[data-nav="' + page + '"]');
    if (current) current.setAttribute("aria-current", "page");
  }

  var burger = T.qs("[data-burger]");
  var closeBtn = T.qs("[data-burger-close]");
  var mobileNav = T.qs("#mobileNav");

  function openNav() {
    document.body.classList.add("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    var first = mobileNav && mobileNav.querySelector("a, button");
    if (first) first.focus();
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (burger) burger.focus();
  }

  if (burger) burger.addEventListener("click", openNav);
  if (closeBtn) closeBtn.addEventListener("click", closeNav);
  if (mobileNav) {
    T.qsa("a", mobileNav).forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        if (burger) burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) closeNav();
  });

  /* ---------------------------------------------------------------------- */
  /* modal                                                                   */
  /* ---------------------------------------------------------------------- */

  var lastFocus = null;

  T.openModal = function (id) {
    var modal = document.getElementById(id || "accessModal");
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var focusTarget = modal.querySelector("[data-autofocus]") || modal.querySelector("button, input, a");
    if (focusTarget) setTimeout(function () { focusTarget.focus(); }, 20);
  };

  T.closeModal = function (modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  document.addEventListener("click", function (event) {
    var closer = event.target.closest("[data-modal-close]");
    if (closer) {
      var modal = closer.closest(".modal");
      T.closeModal(modal);
      return;
    }
    if (event.target.classList.contains("modal")) {
      T.closeModal(event.target);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var open = document.querySelector(".modal:not([hidden])");
    if (open) T.closeModal(open);
  });

  /* ---------------------------------------------------------------------- */
  /* demo access                                                             */
  /* ---------------------------------------------------------------------- */

  function markButtons() {
    T.qsa("[data-demo-pay]").forEach(function (btn) {
      if (T.isUnlocked()) {
        btn.textContent = ui("Доступ уже открыт", "Қолжетімділік ашық");
        btn.disabled = true;
      }
    });
    T.qsa("[data-access-state]").forEach(function (el) {
      el.textContent = T.isUnlocked() ? ui("Доступ открыт", "Қолжетімділік ашық") : ui("Демо-доступ закрыт", "Демо-қолжетімділік жабық");
    });
  }

  T.qsa("[data-demo-pay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (T.isUnlocked()) return;
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Проводим демо-оплату…";
      setTimeout(function () {
        T.unlock("course");
        btn.textContent = "Готово";
        toast(ui("Демо-оплата прошла. Все уроки открыты на этом устройстве.", "Демо-төлем өтті. Барлық сабақ осы құрылғыда ашық."));
        setTimeout(function () {
          btn.textContent = original;
          markButtons();
          var modal = btn.closest(".modal");
          if (modal) T.closeModal(modal);
          if (document.body.dataset.page === "lesson" && window.TANYMIO.reloadTrainer) {
            window.TANYMIO.reloadTrainer();
          }
        }, 600);
      }, 900);
    });
  });

  T.qsa("[data-code-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var value = (input && input.value || "").trim().toUpperCase();
      if (value === "TANYMIO" || value === "TANYMIO2026") {
        T.unlock("code");
        toast(ui("Код принят. Все уроки открыты.", "Код қабылданды. Барлық сабақ ашық."));
        var modal = form.closest(".modal");
        if (modal) T.closeModal(modal);
        if (window.TANYMIO.reloadTrainer) window.TANYMIO.reloadTrainer();
      } else {
        toast(ui("Код не подошёл. Для прототипа: TANYMIO", "Код сәйкес келмеді. Прототип үшін: TANYMIO"));
        if (input) input.select();
      }
    });
  });

  /* Any element can request the paywall: <a data-require-access href="lesson.html?id=x"> */
  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-open-modal]");
    if (opener) {
      event.preventDefault();
      T.openModal(opener.dataset.openModal);
      return;
    }

    var link = event.target.closest("[data-require-access]");
    if (!link || T.isUnlocked()) return;
    event.preventDefault();
    T.openModal(link.dataset.modal || "accessModal");
  });

  document.addEventListener("tanymio:access", function () {
    markButtons();
    T.qsa(".lesson-card[data-paid]").forEach(function (card) {
      card.classList.remove("is-locked");
      var lock = card.querySelector(".locked-overlay");
      if (lock) lock.remove();
    });
  });

  document.addEventListener("tanymio:progress", function () {
    markButtons();
  });

  /* Language switch keeps the current page where a translation exists. */
  document.querySelectorAll(".lang-switch").forEach(function (link) {
    link.addEventListener("click", function (event) {
      var p = location.pathname;
      var file = p.substring(p.lastIndexOf("/") + 1);
      var dir = p.substring(0, p.lastIndexOf("/") + 1);
      var known = /^(index|lessons|lesson|pricing|voice|family|help|legal)\.html$/.test(file);
      var target = KZ
        ? dir.replace(/kz\/$/, "") + (known ? file : "index.html")
        : dir + "kz/" + (known ? file : "index.html");
      event.preventDefault();
      location.href = target + location.search;
    });
  });

  markButtons();
  applySettings();
})();