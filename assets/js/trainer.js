/* Tanymio — lesson trainer engine.
   Drives the phone mock-up, the step rail and the coach panel. */
(function () {
  "use strict";

  var T = window.TANYMIO;
  var lessons = window.TANYMIO_LESSONS || [];
  var LANG = document.documentElement.lang === "kk" ? "kk" : "ru";

  var els = {};
  var lesson = null;
  var state = { step: 0, hints: 0, wrong: 0, hintShown: false, wrongHere: 0, busy: false, finished: false, stats: [], stepStart: 0 };
  var advanceTimer = null;
  var FEEDBACK = "tanymio.feedback.v1";

  /* Per-step pilot stats: wrong taps, hints shown, seconds spent. */
  function stat() {
    if (!state.stats[state.step]) state.stats[state.step] = { w: 0, h: 0, s: 0 };
    return state.stats[state.step];
  }

  function closeStepTime() {
    if (!state.stepStart) return;
    stat().s += Math.min(900, Math.round((Date.now() - state.stepStart) / 1000));
    state.stepStart = 0;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function screenGroupFor(item) {
    if (item.uiGroup) return item.uiGroup;
    return item.app === "whatsapp" ? "whatsapp" : item.id;
  }

  function applyGenericUi() {
    if (!lesson || !lesson.uiGroup || !lesson.ui) return;
    var group = els.phone.querySelector('.screens[data-screens="' + lesson.uiGroup + '"]');
    if (!group) return;
    group.querySelectorAll("[data-slot]").forEach(function (el) {
      var value = lesson.ui[el.dataset.slot];
      if (typeof value === "string" && value) el.textContent = value;
    });
    group.querySelectorAll(".screen").forEach(function (screen) {
      screen.classList.remove("v-app--bank", "v-app--messenger", "v-app--social", "v-app--market", "v-app--delivery", "v-app--gov");
      if (lesson.ui.theme) screen.classList.add("v-app--" + lesson.ui.theme);
    });
  }

  function activeScreen() {
    var group = els.phone.querySelector(".screens.is-on");
    return group ? group.querySelector(".screen.is-active") : null;
  }

  function setScreen(name) {
    if (!name) return;
    T.qsa(".screens", els.phone).forEach(function (group) {
      group.classList.toggle("is-on", group.dataset.screens === screenGroupFor(lesson));
    });
    T.qsa(".screen", els.phone).forEach(function (screen) {
      screen.classList.toggle("is-active", screen.dataset.screen === name);
    });
    els.phone.dataset.screen = name;
    els.phone.dataset.app = lesson.app;
  }

  function clearHighlight() {
    T.qsa(".coach-target", els.phone).forEach(function (el) {
      el.classList.remove("coach-target");
    });
  }

  function highlightTarget() {
    var step = lesson.steps[state.step];
    if (!step || !step.target) return false;
    var screen = activeScreen();
    if (!screen) return false;
    var target = screen.querySelector('[data-t="' + step.target + '"]');
    if (!target) return false;
    clearHighlight();
    target.classList.add("coach-target");
    return true;
  }

  function lessonProgress() {
    return T.getProgress()[lesson.id] || {};
  }

  function save() {
    T.setProgress(lesson.id, {
      step: state.step,
      hints: state.hints,
      wrong: state.wrong,
      stats: state.stats,
      updatedAt: new Date().toISOString()
    });
  }

  /* ---------------------------------------------------------------------- */
  /* rail                                                                    */
  /* ---------------------------------------------------------------------- */

  function renderRail() {
    if (!els.rail) return;
    var items = lesson.steps
      .map(function (step, index) {
        var cls = "rail__item";
        if (index === state.step) cls += " is-current";
        if (index < state.step) cls += " is-done";
        return (
          '<li class="' + cls + '">' +
          '<span class="rail__num"><span>' + (index + 1) + "</span></span>" +
          "<span>" + T.escape(step.rail) + "</span>" +
          "</li>"
        );
      })
      .join("");

    els.rail.innerHTML =
      '<div class="rail__card">' +
      '<p class="rail__eyebrow">' + T.escape(lesson.appLabel) + " · " + T.escape(lesson.duration) + "</p>" +
      '<p class="rail__goal">' + T.escape(lesson.goal) + "</p>" +
      "</div>" +
      '<div class="rail__card">' +
      '<p class="rail__eyebrow">Шаги урока</p>' +
      '<ol class="rail__list">' + items + "</ol>" +
      "</div>" +
      '<div class="rail__foot">' +
      '<a class="btn btn--ghost" href="lessons.html"><svg aria-hidden="true"><use href="#i-arrow-left"/></svg>К урокам</a>' +
      '<button type="button" class="btn btn--ghost" data-pause><svg aria-hidden="true"><use href="#i-clock"/></svg>Сделать перерыв</button>' +
      '<p class="rail__note">Прогресс сохраняется на этом устройстве. Можно остановиться на любом шаге.</p>' +
      "</div>";
  }

  /* ---------------------------------------------------------------------- */
  /* coach                                                                   */
  /* ---------------------------------------------------------------------- */

  function speakStep() {
    var step = lesson.steps[state.step];
    if (!step) return;
    /* step.clip: исходная запись для шага; null — записи нет, шаг без озвучки */
    var clip = "clip" in step ? step.clip : state.step;
    if (clip === null) { T.stopSpeech(); return; }
    T.speak(step.voice || step.text, T.audioUrl(LANG, lesson.id, clip));
  }

  function renderCoach(feedback, kind) {
    var step = lesson.steps[state.step];
    if (!step) return;

    var choiceHtml = "";
    if (step.type === "choice") {
      choiceHtml = '<div class="coach__choices" role="group" aria-label="Варианты ответа">' +
        step.choices.map(function (choice, index) {
          return (
            '<button type="button" class="choice" data-choice="' + index + '">' +
            '<span class="choice__letter">' + "АБВГ"[index] + "</span>" +
            "<span>" + T.escape(choice.label) + "</span>" +
            "</button>"
          );
        }).join("") +
        "</div>";
    }

    els.coach.innerHTML =
      '<div class="coach__top">' +
      '<span class="coach__step">Шаг ' + (state.step + 1) + " из " + lesson.steps.length + "</span>" +
      '<button type="button" class="coach__voice" data-speak>' +
      '<svg aria-hidden="true"><use href="#i-speaker"/></svg>Прослушать</button>' +
      "</div>" +
      "<h2 class=\"coach__title\">" + T.escape(step.title) + "</h2>" +
      '<p class="coach__text">' + T.escape(step.text) + "</p>" +
      choiceHtml +
      '<div class="feedback' + (kind === "warn" ? " feedback--warn" : " feedback--ok") + '" data-feedback aria-live="polite"' + (feedback ? "" : " hidden") + ">" +
      '<svg aria-hidden="true"><use href="#' + (kind === "warn" ? "i-alert" : "i-check-circle") + '"/></svg>' +
      "<span>" + T.escape(feedback || "") + "</span>" +
      "</div>" +
      '<div class="coach__hint" data-hintbox' + (state.hintShown ? "" : " hidden") + ">" +
      '<svg aria-hidden="true"><use href="#i-info"/></svg>' +
      "<span>" + T.escape(step.hint) + "</span>" +
      "</div>" +
      (step.type === "choice"
        ? ""
        : '<div class="coach__actions">' +
          '<button type="button" class="btn btn--ghost" data-show-hint>' +
          '<svg aria-hidden="true"><use href="#i-map-pin"/></svg>' +
          (state.hintShown ? "Показать ещё раз" : "Показать, куда нажать") +
          "</button>" +
          "</div>") +
      '<div class="coach__progressline" aria-hidden="true"><i style="width:' +
      Math.round(((state.step) / lesson.steps.length) * 100) + '%"></i></div>' +
      '<div class="coach__foot"><span>Подсказок: ' + state.hints + "</span>" +
      '<a href="help.html">Помощь</a></div>';

    if (state.busy) {
      T.qsa(".coach__actions button, .choice", els.coach).forEach(function (btn) {
        btn.disabled = true;
      });
    }

    if (feedback) {
      var fb = els.coach.querySelector("[data-feedback]");
      if (fb) {
        fb.hidden = false;
        fb.className = "feedback " + (kind === "warn" ? "feedback--warn" : "feedback--ok");
      }
    }
  }

  function showFeedback(text, kind) {
    var fb = els.coach.querySelector("[data-feedback]");
    if (!fb) return;
    fb.hidden = false;
    fb.className = "feedback " + (kind === "warn" ? "feedback--warn" : "feedback--ok");
    fb.querySelector("use").setAttribute("href", kind === "warn" ? "#i-alert" : "#i-check-circle");
    fb.querySelector("span").textContent = text;
  }

  /* ---------------------------------------------------------------------- */
  /* step flow                                                               */
  /* ---------------------------------------------------------------------- */

  function showStep(index) {
    clearTimeout(advanceTimer);
    state.step = index;
    state.hintShown = false;
    state.wrongHere = 0;
    state.busy = false;
    state.stepStart = Date.now();

    var step = lesson.steps[index];
    if (!step) {
      finish();
      return;
    }

    if (!step.delay) setScreen(step.screen);
    renderRail();
    renderCoach("", "ok");
    save();

    if (T.settings.voice) speakStep();

    if (step.delay) {
      state.busy = true;
      var fb = els.coach.querySelector("[data-feedback]");
      if (fb) {
        fb.hidden = false;
        fb.className = "feedback feedback--ok";
        fb.querySelector("span").textContent = "Соединяем…";
      }
      T.qsa(".coach__actions button, .choice", els.coach).forEach(function (btn) {
        btn.disabled = true;
      });
      setTimeout(function () {
        if (state.step !== index) return;
        state.busy = false;
        setScreen(step.screen);
        renderCoach("", "ok");
        if (T.settings.voice) speakStep();
      }, step.delay);
    }
  }

  function nextStep(delay) {
    var step = lesson.steps[state.step];
    var wait = delay == null ? 800 : delay;
    if (step && step.type === "choice") wait = 1100;

    if (step && step.screenAfter) {
      setTimeout(function () { setScreen(step.screenAfter); }, 350);
    }

    advanceTimer = setTimeout(function () {
      showStep(state.step + 1);
    }, wait);
  }

  function applyEffect(name) {
    if (name === "chat:sent") {
      var chat = els.phone.querySelector('[data-screen="y_chat"]');
      if (chat) chat.dataset.sent = "1";
    }
    if (name === "kaspi:amount") {
      var amount = byId("kaspiAmount");
      var next = byId("kaspiNext");
      if (amount) {
        amount.textContent = "5 000 ₸";
        amount.classList.remove("is-empty");
      }
      if (next) next.disabled = false;
    }
    if (name === "kaspi:code") {
      var code = byId("kaspiCode");
      if (code) {
        var digits = ["4", "8", "2", "1"];
        T.qsa("i", code).forEach(function (cell, i) {
          cell.textContent = digits[i] || "";
        });
      }
    }
    if (name === "wa:photo") {
      var body = byId("waChatBody");
      if (body) body.dataset.sent = "1";
    }
  }

  function correct(clickedEl) {
    var step = lesson.steps[state.step];
    if (state.busy || state.finished) return;

    if (clickedEl) {
      clickedEl.classList.add("is-tapped");
      setTimeout(function () { clickedEl.classList.remove("is-tapped"); }, 340);
    }

    if (step.effect) applyEffect(step.effect);

    closeStepTime();
    save();
    showFeedback(step.success || "Верно.", "ok");

    var delay = step.effect === "chat:sent" || step.effect === "wa:photo" ? 1200 : 850;
    nextStep(delay);
  }

  function wrong(message) {
    state.wrong += 1;
    state.wrongHere += 1;
    stat().w += 1;
    save();
    showFeedback(message || "Это другая кнопка. Попробуем ещё раз.", "warn");

    if (state.wrongHere >= 2 && !state.hintShown) {
      state.hintShown = true;
      stat().h += 1;
      var box = els.coach.querySelector("[data-hintbox]");
      if (box) box.hidden = false;
      highlightTarget();
    }
  }

  function choose(index) {
    var step = lesson.steps[state.step];
    if (!step || step.type !== "choice" || state.busy) return;
    var choice = step.choices[index];
    if (!choice) return;

    var buttons = T.qsa(".choice", els.coach);

    if (!choice.ok) {
      buttons[index].classList.add("is-wrong");
      wrong(choice.feedback);
      return;
    }

    buttons[index].classList.add("is-right");
    buttons.forEach(function (btn) { btn.disabled = true; });
    showFeedback(choice.feedback, "ok");
    closeStepTime();
    save();

    advanceTimer = setTimeout(function () {
      showStep(state.step + 1);
    }, 1300);
  }

  /* ---------------------------------------------------------------------- */
  /* finish                                                                  */
  /* ---------------------------------------------------------------------- */

  function fmtDate(date) {
    try {
      return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
    } catch (err) {
      return date.toLocaleDateString();
    }
  }

  function readFeedback() {
    try { return JSON.parse(localStorage.getItem(FEEDBACK) || "{}") || {}; } catch (err) { return {}; }
  }

  function bindFeedback() {
    var box = els.coach.querySelector("[data-fb]");
    if (!box) return;
    var pick = { ease: "", hard: [] };
    T.qsa("[data-fb-ease]", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        pick.ease = btn.dataset.fbEase;
        T.qsa("[data-fb-ease]", box).forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        box.querySelector("[data-fb-more]").hidden = false;
      });
    });
    T.qsa("[data-fb-hard]", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(on));
        pick.hard = T.qsa("[data-fb-hard][aria-pressed=\"true\"]", box).map(function (b) { return b.dataset.fbHard; });
      });
    });
    box.querySelector("[data-fb-save]").addEventListener("click", function () {
      var all = readFeedback();
      all[lesson.id] = {
        ease: pick.ease,
        hard: pick.hard,
        note: (box.querySelector("[data-fb-note]").value || "").trim().slice(0, 500),
        lang: LANG,
        at: new Date().toISOString()
      };
      try { localStorage.setItem(FEEDBACK, JSON.stringify(all)); } catch (err) { /* storage full or blocked */ }
      box.innerHTML = '<p class="fb__thanks" role="status">Спасибо! Отзыв сохранён на этом телефоне.</p>';
    });
  }

  function finish() {
    state.finished = true;
    var done = lesson.done;
    var due = new Date();
    due.setDate(due.getDate() + 3);

    T.setProgress(lesson.id, {
      step: lesson.steps.length,
      hints: state.hints,
      wrong: state.wrong,
      stats: state.stats,
      completedAt: new Date().toISOString(),
      dueAt: due.toISOString()
    });

    document.dispatchEvent(new CustomEvent("tanymio:progress", { detail: { lesson: lesson.id } }));

    var rows = done.rows.map(function (row) {
      return '<div class="done-row"><span>' + T.escape(row[0]) + "</span><b>" + T.escape(row[1]) + "</b></div>";
    }).join("");

    els.done.innerHTML =
      '<div class="phone-done__badge"><svg aria-hidden="true"><use href="#i-check"/></svg></div>' +
      "<h3>" + T.escape(done.title) + "</h3>" +
      "<p>" + T.escape(done.text) + "</p>" +
      '<div class="done-card">' + rows + "</div>" +
      '<div class="done-tip"><svg aria-hidden="true"><use href="#i-shield"/></svg><span>' + T.escape(done.tip) + "</span></div>" +
      '<div class="phone-done__skill">Навык отмечен · проверка через 3 дня</div>';
    els.done.hidden = false;

    var next = lessons.filter(function (item) { return item.id === lesson.next; })[0];
    var nextLocked = next && !next.free && !T.isUnlocked();

    els.coach.innerHTML =
      '<div class="result__head">' +
      '<span class="result__badge"><svg aria-hidden="true"><use href="#i-check"/></svg></span>' +
      "<div><p class=\"result__title\">" + T.escape(done.title) + "</p>" +
      '<p class="result__sub">' + T.escape(lesson.appLabel) + " · урок пройден</p></div>" +
      "</div>" +
      '<div class="result__score">' +
      '<div class="score-row"><span>Самостоятельность</span><b>' +
      (state.hints === 0 ? "Без подсказок" : "С подсказкой") + "</b></div>" +
      '<div class="score-row"><span>Подсказок</span><b>' + state.hints + "</b></div>" +
      '<div class="score-row"><span>Неверных нажатий</span><b>' + state.wrong + "</b></div>" +
      '<div class="score-row"><span>Повторить</span><b>' + fmtDate(due) + "</b></div>" +
      "</div>" +
      '<div class="fb" data-fb role="group" aria-label="Отзыв об уроке">' +
      '<p class="fb__q">Как прошёл урок?</p>' +
      '<div class="fb__row">' +
      '<button type="button" class="fb__opt" data-fb-ease="easy" aria-pressed="false">Легко</button>' +
      '<button type="button" class="fb__opt" data-fb-ease="ok" aria-pressed="false">Нормально</button>' +
      '<button type="button" class="fb__opt" data-fb-ease="hard" aria-pressed="false">Трудно</button>' +
      '</div>' +
      '<div class="fb__more" data-fb-more hidden>' +
      '<p class="fb__q">Что мешало? Можно выбрать несколько.</p>' +
      '<div class="fb__chips"><button type="button" class="fb__chip" data-fb-hard="button" aria-pressed="false">Не нашёл кнопку</button><button type="button" class="fb__chip" data-fb-hard="text" aria-pressed="false">Непонятный текст</button><button type="button" class="fb__chip" data-fb-hard="small" aria-pressed="false">Мелкие буквы</button><button type="button" class="fb__chip" data-fb-hard="voice" aria-pressed="false">Голос</button><button type="button" class="fb__chip" data-fb-hard="none" aria-pressed="false">Ничего не мешало</button></div>' +
      '<label class="fb__note"><span>Что было непонятно? Можно пропустить.</span><textarea rows="2" maxlength="500" data-fb-note></textarea></label>' +
      '<button type="button" class="btn btn--primary" data-fb-save>Сохранить отзыв</button>' +
      '</div>' +
      '</div>' +
      (next
        ? '<a class="next-lesson" href="' + (nextLocked ? "#" : "lesson.html?id=" + next.id) + '"' +
          (nextLocked ? ' data-require-access' : "") + ">" +
          '<span class="next-lesson__icon"><svg aria-hidden="true"><use href="#i-' +
          (nextLocked ? "lock" : "arrow-right") + '"/></svg></span>' +
          "<span><b>" + T.escape(next.title) + "</b><span>" +
          (nextLocked ? "Входит в курс" : "Следующий урок · " + next.duration) + "</span></span>" +
          "</a>"
        : "") +
      '<div class="result__actions">' +
      '<button type="button" class="btn btn--primary" data-repeat>Пройти ещё раз</button>' +
      '<a class="btn btn--ghost" href="lessons.html">Вернуться к урокам</a>' +
      "</div>";

    bindFeedback();

    T.qsa("[data-require-access]", els.coach).forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        T.openModal("accessModal");
      });
    });

    els.coach.querySelector("[data-repeat]").addEventListener("click", function () {
      T.resetProgress(lesson.id);
      state.hints = 0;
      state.wrong = 0;
      state.stats = [];
      state.finished = false;
      els.done.hidden = true;
      showStep(0);
    });

    if (T.settings.voice) {
      T.speak("Урок пройден. " + done.title, T.audioUrl(LANG, lesson.id, "done"));
    }
  }

  /* ---------------------------------------------------------------------- */
  /* events                                                                  */
  /* ---------------------------------------------------------------------- */

  var bound = false;

  function bind() {
    if (bound) return;
    bound = true;

    els.phone.addEventListener("click", function (event) {
      if (state.busy || state.finished) return;
      var step = lesson.steps[state.step];
      if (!step || step.type === "choice") return;

      var tariff = event.target.closest(".y-tariff");
      if (tariff) {
        T.qsa(".y-tariff", els.phone).forEach(function (el) { el.classList.remove("is-selected"); });
        tariff.classList.add("is-selected");
      }

      var hit = event.target.closest("[data-t]");
      var screen = activeScreen();
      if (!screen || !screen.contains(event.target)) return;

      if (!hit) {
        if (state.wrongHere >= 1) {
          state.wrongHere += 1;
          showFeedback("Нажмите на кнопку, которую подсветит подсказка.", "warn");
        }
        return;
      }

      if (hit.dataset.t === step.target) {
        correct(hit);
      } else {
        wrong(step.wrong);
      }
    });

    els.coach.addEventListener("click", function (event) {
      var speak = event.target.closest("[data-speak]");
      if (speak) { speakStep(); return; }

      var hint = event.target.closest("[data-show-hint]");
      if (hint) {
        if (!state.hintShown) {
          state.hintShown = true;
          state.hints += 1;
          stat().h += 1;
          save();
        }
        var box = els.coach.querySelector("[data-hintbox]");
        if (box) box.hidden = false;
        highlightTarget();
        var foot = els.coach.querySelector(".coach__foot span");
        if (foot) foot.textContent = "Подсказок: " + state.hints;
        return;
      }

      var choice = event.target.closest("[data-choice]");
      if (choice) {
        choose(Number(choice.dataset.choice));
        return;
      }

      var pause = event.target.closest("[data-pause]");
      if (pause) {
        save();
        T.toast("Прогресс сохранён. Продолжите с этого шага.");
        setTimeout(function () { window.location.href = "lessons.html"; }, 700);
      }
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-mismatch]")) {
        T.openModal("mismatchModal");
        return;
      }
      if (event.target.closest("[data-restart]")) {
        T.resetProgress(lesson.id);
        state.hints = 0;
        state.wrong = 0;
        state.finished = false;
        els.done.hidden = true;
        showStep(0);
        T.toast("Урок начат заново");
        return;
      }
      if (event.target.closest("[data-pause]")) {
        save();
        T.toast("Прогресс сохранён. Продолжите с этого шага.");
        setTimeout(function () { window.location.href = "lessons.html"; }, 700);
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* paywall                                                                 */
  /* ---------------------------------------------------------------------- */

  function showPaywall() {
    var shell = byId("paywallShell");
    var grid = byId("trainerGrid");
    if (shell) {
      shell.hidden = false;
      var title = byId("paywallTitle");
      if (title) title.textContent = lesson ? "«" + lesson.title + "» — в курсе" : "Урок входит в курс";
    }
    if (grid) grid.hidden = true;
    var head = byId("lessonHeadTitle");
    if (head && lesson) head.textContent = lesson.title;
  }

  /* ---------------------------------------------------------------------- */
  /* init                                                                    */
  /* ---------------------------------------------------------------------- */

  function init() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || "taxi-yandex";
    lesson = lessons.filter(function (item) { return item.id === id; })[0];

    if (!lesson) {
      window.location.replace("lessons.html");
      return;
    }

    els.phone = byId("trainerPhone");
    els.coach = byId("coach");
    els.rail = byId("rail");
    els.done = byId("phoneDone");
    if (!els.phone || !els.coach) return;

    document.title = lesson.title + " · Tanymio";

    var headTitle = byId("lessonHeadTitle");
    if (headTitle) headTitle.textContent = lesson.title;

    var headMeta = byId("lessonHeadMeta");
    if (headMeta) {
      headMeta.innerHTML = '<span class="badge ' + (lesson.free ? "badge--free" : "badge--paid") + '">' +
        (lesson.free ? "Бесплатный урок" : "В курсе") + "</span><span>" +
        T.escape(lesson.appLabel) + " · " + T.escape(lesson.duration) + "</span>";
    }

    var app = byId("lessonApp");
    if (app) app.textContent = lesson.appLabel;

    if (!lesson.free && !T.isUnlocked()) {
      showPaywall();
      return;
    }

    var shell = byId("paywallShell");
    var grid = byId("trainerGrid");
    if (shell) shell.hidden = true;
    if (grid) grid.hidden = false;

    applyGenericUi();
    setScreen(lesson.steps[0].screen);
    els.done.hidden = true;
    state.hints = 0;
    state.wrong = 0;
    state.stats = [];
    state.finished = false;

    bind();

    var saved = lessonProgress();
    var jump = parseInt(params.get("jump"), 10);
    var startAt = 0;
    if (!isNaN(jump) && jump >= 0) {
      startAt = Math.min(jump, lesson.steps.length);
    } else if (saved.completedAt) {
      startAt = 0;
    } else if (typeof saved.step === "number" && saved.step > 0 && saved.step < lesson.steps.length) {
      startAt = saved.step;
    }

    if (startAt > 0 && startAt < lesson.steps.length) {
      state.hints = saved.hints || 0;
      state.wrong = saved.wrong || 0;
      state.stats = Array.isArray(saved.stats) ? saved.stats : [];
      T.toast("Продолжаем с шага " + (startAt + 1));
    }

    showStep(startAt);
  }

  T.initTrainer = init;
  T.reloadTrainer = function () {
    var shell = byId("paywallShell");
    if (shell) shell.hidden = true;
    init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();