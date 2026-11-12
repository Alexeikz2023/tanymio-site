/* Tanymio pilot export: turns the progress and feedback kept in this browser
   into a CSV file (one row per lesson) for the pilot team. Nothing leaves the
   device until the facilitator downloads or copies the file. */
(function () {
  "use strict";

  var PROGRESS = "tanymio.progress.v1";
  var FEEDBACK = "tanymio.feedback.v1";
  var PILOT = "tanymio.pilot.v1";

  var EASE = { easy: "легко", ok: "нормально", hard: "трудно" };
  var HARD = { button: "не нашёл кнопку", text: "непонятный текст", small: "мелкие буквы", voice: "голос", none: "ничего не мешало" };

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch (err) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* blocked */ }
  }
  function lessonsById() {
    var map = {};
    (window.TANYMIO_LESSONS || []).forEach(function (l) { map[l.id] = l; });
    return map;
  }
  function cell(value) {
    var s = String(value == null ? "" : value);
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function localTime(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    function p(n) { return n < 10 ? "0" + n : String(n); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function rows() {
    var progress = read(PROGRESS, {});
    var feedback = read(FEEDBACK, {});
    var pilot = read(PILOT, {});
    var lessons = lessonsById();
    var ids = Object.keys(progress).concat(Object.keys(feedback).filter(function (id) { return !progress[id]; }));
    ids.sort(function (a, b) {
      var la = lessons[a], lb = lessons[b];
      return (la ? la.order : 999) - (lb ? lb.order : 999);
    });

    return ids.map(function (id) {
      var p = progress[id] || {};
      var f = feedback[id] || {};
      var l = lessons[id] || {};
      var total = l.steps ? l.steps.length : "";
      var stats = Array.isArray(p.stats) ? p.stats : [];
      var seconds = 0, worst = -1, worstScore = 0;
      var detail = [];
      stats.forEach(function (s, i) {
        if (!s) return;
        seconds += s.s || 0;
        var score = (s.w || 0) + 2 * (s.h || 0);
        if (score > worstScore) { worstScore = score; worst = i; }
        detail.push((i + 1) + ":" + (s.w || 0) + "/" + (s.h || 0) + "/" + (s.s || 0) + "с");
      });
      var worstText = "";
      if (worst >= 0) {
        var ws = stats[worst];
        var title = l.steps && l.steps[worst] ? l.steps[worst].title : "";
        worstText = "шаг " + (worst + 1) + (title ? " «" + title + "»" : "") + ": ошибок " + (ws.w || 0) + ", подсказок " + (ws.h || 0);
      }
      return [
        pilot.code || "",
        id,
        l.title || "",
        l.category || "",
        p.completedAt ? "пройден" : (p.step ? "начат" : "нет"),
        p.completedAt ? total : (typeof p.step === "number" ? p.step : ""),
        total,
        p.hints || 0,
        p.wrong || 0,
        seconds ? Math.round(seconds / 6) / 10 : "",
        worstText,
        detail.join(" | "),
        EASE[f.ease] || "",
        (f.hard || []).map(function (k) { return HARD[k] || k; }).join(", "),
        f.note || "",
        f.lang === "kk" ? "kk" : (f.lang ? "ru" : ""),
        localTime(p.completedAt || p.updatedAt),
        localTime(f.at)
      ];
    });
  }

  var HEAD = ["Участник", "ID урока", "Урок", "Категория", "Статус", "Дошёл до шага", "Шагов всего", "Подсказок",
    "Ошибок", "Минут", "Самый трудный шаг", "По шагам (ошибки/подсказки/секунды)", "Оценка", "Что мешало",
    "Комментарий", "Язык отзыва", "Когда урок", "Когда отзыв"];

  function csv() {
    return [HEAD].concat(rows()).map(function (r) { return r.map(cell).join(";"); }).join("\r\n");
  }

  var root = document.getElementById("pilotExport");
  if (!root) return;
  var code = document.getElementById("pilotCode");
  var summary = document.getElementById("pilotSummary");
  var status = document.getElementById("pilotStatus");

  function render() {
    var r = rows();
    var done = r.filter(function (x) { return x[4] === "пройден"; }).length;
    var fb = r.filter(function (x) { return x[12]; }).length;
    summary.textContent = "Пройдено уроков: " + done + " · начато: " + (r.length - done) + " · отзывов: " + fb;
    code.value = read(PILOT, {}).code || "";
  }

  code.addEventListener("change", function () {
    var data = read(PILOT, {});
    data.code = code.value.trim().slice(0, 20);
    write(PILOT, data);
    status.textContent = data.code ? "Код участника сохранён: " + data.code : "Код участника удалён.";
  });

  document.getElementById("pilotDownload").addEventListener("click", function () {
    var name = "tanymio-" + ((read(PILOT, {}).code || "uchastnik").replace(/[^\w-]+/g, "_")) + "-" + localTime(new Date().toISOString()).slice(0, 10) + ".csv";
    var blob = new Blob(["﻿" + csv()], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    status.textContent = "Файл скачан: " + name;
  });

  document.getElementById("pilotCopy").addEventListener("click", function () {
    var text = csv();
    var done = function () { status.textContent = "Таблица скопирована. Вставьте её в Excel или Google Таблицы."; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { status.textContent = "Не удалось скопировать. Скачайте файл."; });
    } else {
      status.textContent = "Копирование недоступно. Скачайте файл.";
    }
  });

  document.getElementById("pilotReset").addEventListener("click", function () {
    if (!window.confirm("Стереть прогресс и отзывы на этом устройстве? Сначала скачайте файл — восстановить данные будет нельзя.")) return;
    try {
      localStorage.removeItem(PROGRESS);
      localStorage.removeItem(FEEDBACK);
      localStorage.removeItem(PILOT);
    } catch (err) { /* blocked */ }
    status.textContent = "Данные стёрты. Можно начинать с новым участником.";
    render();
    document.dispatchEvent(new CustomEvent("tanymio:progress", { detail: {} }));
  });

  window.TANYMIO_PILOT_CSV = csv;
  render();
})();
