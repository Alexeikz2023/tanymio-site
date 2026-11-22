/* Tanymio pilot export: turns the progress and feedback kept in this browser
   into a CSV file (one row per lesson) for the pilot team. Nothing leaves the
   device until the facilitator downloads or copies the file. */
(function () {
  "use strict";

  var PROGRESS = "tanymio.progress.v1";
  var FEEDBACK = "tanymio.feedback.v1";
  var PILOT = "tanymio.pilot.v1";
  var SURVEY = "tanymio.survey.v1";

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
    }).concat(surveyRows(pilot.code || ""));
  }

  /* Final survey answers: one row per question, the answer in the "Комментарий" column. */
  function surveyRows(code) {
    var sv = read(SURVEY, null);
    if (!sv || !Array.isArray(sv.rows)) return [];
    return sv.rows.map(function (r) {
      return [code, "анкета:" + r.key, r.q, "итоговая анкета", "ответ", "", "", "", "", "", "", "", "", "", r.a, sv.lang || "", "", localTime(sv.at)];
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

  /* Screen messages follow the page language. CSV headers and statuses stay in Russian;
     lesson and step titles come from the page data (Kazakh on kz/route.html), IDs are the same. */
  var KZ = document.documentElement.lang === "kk";
  var MSG = KZ ? {
    sum: function (d, s, f, sv) { return "Өтілген сабақ: " + d + " · басталған: " + s + " · пікір: " + f + " · қорытынды сауалнама: " + (sv ? "толтырылды" : "жоқ"); },
    saved: "Қатысушы коды сақталды: ", removed: "Қатысушы коды өшірілді.",
    file: "Файл жүктелді: ", copied: "Кесте көшірілді. Оны Excel немесе Google Кестелерге қойыңыз.",
    copyFail: "Көшіру мүмкін болмады. Файлды жүктеп алыңыз.", copyNone: "Көшіру қолжетімсіз. Файлды жүктеп алыңыз.",
    confirm: "Осы құрылғыдағы прогресті, пікірлерді және сауалнаманы өшіру керек пе? Алдымен файлды жүктеп алыңыз — деректерді қалпына келтіру мүмкін болмайды.",
    wiped: "Деректер өшірілді. Жаңа қатысушымен бастауға болады."
  } : {
    sum: function (d, s, f, sv) { return "Пройдено уроков: " + d + " · начато: " + s + " · отзывов: " + f + " · итоговая анкета: " + (sv ? "заполнена" : "нет"); },
    saved: "Код участника сохранён: ", removed: "Код участника удалён.",
    file: "Файл скачан: ", copied: "Таблица скопирована. Вставьте её в Excel или Google Таблицы.",
    copyFail: "Не удалось скопировать. Скачайте файл.", copyNone: "Копирование недоступно. Скачайте файл.",
    confirm: "Стереть прогресс, отзывы и анкету на этом устройстве? Сначала скачайте файл — восстановить данные будет нельзя.",
    wiped: "Данные стёрты. Можно начинать с новым участником."
  };
  var code = document.getElementById("pilotCode");
  var summary = document.getElementById("pilotSummary");
  var status = document.getElementById("pilotStatus");

  function render() {
    var r = rows();
    var lessonsOnly = r.filter(function (x) { return x[4] !== "ответ"; });
    var done = lessonsOnly.filter(function (x) { return x[4] === "пройден"; }).length;
    var fb = lessonsOnly.filter(function (x) { return x[12]; }).length;
    var sv = read(SURVEY, null);
    summary.textContent = MSG.sum(done, lessonsOnly.length - done, fb, !!(sv && sv.at));
    code.value = read(PILOT, {}).code || "";
  }

  code.addEventListener("change", function () {
    var data = read(PILOT, {});
    data.code = code.value.trim().slice(0, 20);
    write(PILOT, data);
    status.textContent = data.code ? MSG.saved + data.code : MSG.removed;
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
    status.textContent = MSG.file + name;
  });

  document.getElementById("pilotCopy").addEventListener("click", function () {
    var text = csv();
    var done = function () { status.textContent = MSG.copied; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { status.textContent = MSG.copyFail; });
    } else {
      status.textContent = MSG.copyNone;
    }
  });

  document.getElementById("pilotReset").addEventListener("click", function () {
    if (!window.confirm(MSG.confirm)) return;
    try {
      localStorage.removeItem(PROGRESS);
      localStorage.removeItem(FEEDBACK);
      localStorage.removeItem(PILOT);
      localStorage.removeItem(SURVEY);
    } catch (err) { /* blocked */ }
    status.textContent = MSG.wiped;
    render();
    document.dispatchEvent(new CustomEvent("tanymio:progress", { detail: {} }));
  });

  window.TANYMIO_PILOT_CSV = csv;
  render();
})();
