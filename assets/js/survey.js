/* Tanymio pilot: final survey (RU + KZ). Answers stay on this device in
   tanymio.survey.v1 and go into the CSV export on the account page. Each answer
   is also stored with its Russian wording so the team reads one language. */
(function () {
  "use strict";

  var KEY = "tanymio.survey.v1";
  var KZ = document.documentElement.lang === "kk";
  var root = document.getElementById("survey");
  if (!root) return;

  function t(pair) { return KZ ? pair[1] : pair[0]; }

  var SCALE5 = [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]];
  var TASK_OPTS = [["Смогу сам(а)", "Өзім жасаймын"], ["С помощью", "Көмекпен"], ["Не смогу", "Жасай алмаймын"]];

  var Q = [
    { key: "conf_before", type: "scale", q: ["Насколько уверенно вы пользовались телефоном до занятий?", "Сабаққа дейін телефонды қаншалықты сенімді қолдандыңыз?"],
      ends: [["совсем не умел(а)", "мүлде білмедім"], ["уверенно", "сенімді"]], opts: SCALE5 },
    { key: "conf_after", type: "scale", q: ["А сейчас?", "Ал қазір?"],
      ends: [["совсем не умею", "мүлде білмеймін"], ["уверенно", "сенімді"]], opts: SCALE5 },
    { key: "clearer", type: "scale", q: ["Стало ли понятнее, как пользоваться приложениями?", "Қосымшаларды қалай қолдану керегі түсініктірек болды ма?"],
      ends: [["нет", "жоқ"], ["намного понятнее", "әлдеқайда түсінікті"]], opts: SCALE5 },
    { key: "tasks", type: "tasks", q: ["Что вы теперь сможете сделать сами?", "Енді өзіңіз не істей аласыз?"],
      items: [
        ["taxi", ["Заказать такси", "Такси шақыру"]],
        ["transfer", ["Перевести деньги родным", "Туыстарға ақша аудару"]],
        ["scam", ["Распознать звонок мошенника", "Алаяқтың қоңырауын тану"]],
        ["photo", ["Отправить фото в WhatsApp", "WhatsApp-қа сурет жіберу"]],
        ["egov", ["Получить справку в eGov", "eGov-тан анықтама алу"]]
      ], opts: TASK_OPTS },
    { key: "used_real", type: "single", q: ["Делали ли вы что-то из уроков в жизни за время пилота?", "Пилот кезінде сабақтардағы бір нәрсені өмірде жасадыңыз ба?"],
      opts: [["Да, несколько раз", "Иә, бірнеше рет"], ["Один раз", "Бір рет"], ["Пока нет", "Әзірге жоқ"]] },
    { key: "hardest", type: "single", q: ["Что было труднее всего?", "Ең қиыны не болды?"],
      opts: [["Найти нужную кнопку", "Керекті батырманы табу"], ["Понять задание", "Тапсырманы түсіну"], ["Мелкие буквы", "Ұсақ әріптер"], ["Быстрый темп", "Жылдам қарқын"], ["Ничего", "Ештеңе"]] },
    { key: "voice", type: "single", q: ["Помогала ли озвучка?", "Дыбыстау көмектесті ме?"],
      opts: [["Очень помогала", "Өте көмектесті"], ["Немного", "Аздап"], ["Не включал(а)", "Қоспадым"], ["Мешала", "Кедергі болды"]] },
    { key: "nps", type: "nps", q: ["Порекомендуете ли вы Tanymio знакомым?", "Tanymio-ны таныстарыңызға ұсынасыз ба?"],
      ends: [["0 — точно нет", "0 — әрине жоқ"], ["10 — точно да", "10 — әрине иә"]] },
    { key: "pay", type: "single", q: ["Стали бы вы платить 2 490 ₸ в месяц за такие уроки?", "Осындай сабақтар үшін айына 2 490 ₸ төлер ме едіңіз?"],
      opts: [["Да", "Иә"], ["Возможно", "Мүмкін"], ["Нет", "Жоқ"]] },
    { key: "payer", type: "single", q: ["Кто бы платил?", "Кім төлер еді?"],
      opts: [["Я сам(а)", "Өзім"], ["Дети или внуки", "Балалар немесе немерелер"], ["Не знаю", "Білмеймін"]] },
    { key: "liked", type: "text", q: ["Что понравилось больше всего?", "Сізге не бәрінен көп ұнады?"] },
    { key: "improve", type: "text", q: ["Что нам улучшить?", "Нені жақсартуымыз керек?"] }
  ];

  var UI = {
    progress: ["Ответов: ", "Жауаптар: "],
    of: [" из ", " / "],
    save: ["Сохранить анкету", "Сауалнаманы сақтау"],
    missing: ["Ответьте, пожалуйста, на вопросы с отметкой «Нет ответа»: ", "«Жауап жоқ» белгісі бар сұрақтарға жауап беріңіз: "],
    noanswer: ["Нет ответа", "Жауап жоқ"],
    optional: ["Можно пропустить", "Өткізіп жіберуге болады"],
    thanks: ["Спасибо! Анкета сохранена на этом устройстве. Ведущий скачает её вместе с уроками.", "Рақмет! Сауалнама осы құрылғыда сақталды. Жүргізуші оны сабақтармен бірге жүктеп алады."],
    again: ["Изменить ответы", "Жауаптарды өзгерту"],
    saved: ["Анкета уже заполнена ", "Сауалнама толтырылған "]
  };

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (err) { return null; }
  }

  var answers = {};
  var prev = read();
  if (prev && prev.raw) answers = prev.raw;

  function required(q) { return q.type !== "text"; }

  function answered(q) {
    var a = answers[q.key];
    if (q.type === "text") return !!(a && a.trim());
    if (q.type === "tasks") return a && q.items.every(function (it) { return a[it[0]] != null; });
    return a != null;
  }

  function btn(qkey, value, label, on, sub) {
    return '<button type="button" class="sv-opt" data-q="' + qkey + '"' + (sub ? ' data-sub="' + sub + '"' : "") +
      ' data-v="' + value + '" aria-pressed="' + (on ? "true" : "false") + '">' + label + "</button>";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var html = Q.map(function (q, i) {
      var a = answers[q.key];
      var body = "";
      if (q.type === "scale" || q.type === "single") {
        body = '<div class="sv-opts' + (q.type === "scale" ? " sv-opts--scale" : "") + '">' +
          q.opts.map(function (o, j) { return btn(q.key, j, esc(t(o)), a === j); }).join("") + "</div>";
        if (q.ends) body += '<p class="sv-ends"><span>' + esc(t(q.ends[0])) + "</span><span>" + esc(t(q.ends[1])) + "</span></p>";
      } else if (q.type === "nps") {
        var b = "";
        for (var n = 0; n <= 10; n++) b += btn(q.key, n, String(n), a === n);
        body = '<div class="sv-opts sv-opts--nps">' + b + '</div><p class="sv-ends"><span>' + esc(t(q.ends[0])) + "</span><span>" + esc(t(q.ends[1])) + "</span></p>";
      } else if (q.type === "tasks") {
        body = q.items.map(function (it) {
          var v = a && a[it[0]];
          return '<div class="sv-task"><b>' + esc(t(it[1])) + '</b><div class="sv-opts">' +
            q.opts.map(function (o, j) { return btn(q.key, j, esc(t(o)), v === j, it[0]); }).join("") + "</div></div>";
        }).join("");
      } else {
        body = '<textarea class="sv-text" rows="3" maxlength="600" data-text="' + q.key + '">' + esc(a || "") + "</textarea>";
      }
      var mark = required(q) ? "" : '<small class="sv-optional">' + t(UI.optional) + "</small>";
      return '<fieldset class="sv-q" id="sv-' + q.key + '"><legend><span>' + (i + 1) + "</span>" + esc(t(q.q)) + mark + "</legend>" + body +
        '<p class="sv-miss" hidden>' + t(UI.noanswer) + "</p></fieldset>";
    }).join("");
    root.innerHTML = html +
      '<div class="sv-foot"><p class="sv-count" aria-live="polite"></p><button type="button" class="btn btn--primary btn--lg" data-sv-save>' + t(UI.save) + '</button>' +
      '<p class="sv-status" role="status"></p></div>';
    count();
  }

  function count() {
    var req = Q.filter(required);
    var n = req.filter(answered).length;
    var el = root.querySelector(".sv-count");
    if (el) el.textContent = t(UI.progress) + n + t(UI.of) + req.length;
  }

  root.addEventListener("click", function (event) {
    var b = event.target.closest(".sv-opt");
    if (b) {
      var key = b.dataset.q, v = Number(b.dataset.v), sub = b.dataset.sub;
      if (sub) {
        answers[key] = answers[key] || {};
        answers[key][sub] = v;
        root.querySelectorAll('.sv-opt[data-q="' + key + '"][data-sub="' + sub + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      } else {
        answers[key] = v;
        root.querySelectorAll('.sv-opt[data-q="' + key + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      }
      var fs = document.getElementById("sv-" + key);
      var q = Q.filter(function (x) { return x.key === key; })[0];
      if (fs && answered(q)) fs.querySelector(".sv-miss").hidden = true;
      count();
      return;
    }
    if (event.target.closest("[data-sv-save]")) save();
  });

  root.addEventListener("input", function (event) {
    var ta = event.target.closest("[data-text]");
    if (ta) answers[ta.dataset.text] = ta.value;
  });

  function ruAnswer(q) {
    var a = answers[q.key];
    if (q.type === "scale") return a == null ? "" : String(a + 1);
    if (q.type === "nps") return a == null ? "" : String(a);
    if (q.type === "single") return a == null ? "" : q.opts[a][0];
    if (q.type === "tasks") return q.items.map(function (it) { return it[1][0] + ": " + (a && a[it[0]] != null ? q.opts[a[it[0]]][0].toLowerCase() : "—"); }).join("; ");
    return (a || "").trim().slice(0, 600);
  }

  function save() {
    var missing = Q.filter(function (q) { return required(q) && !answered(q); });
    Q.forEach(function (q) {
      var fs = document.getElementById("sv-" + q.key);
      if (fs) fs.querySelector(".sv-miss").hidden = missing.indexOf(q) < 0;
    });
    var status = root.querySelector(".sv-status");
    if (missing.length) {
      status.textContent = t(UI.missing) + missing.map(function (q) { return Q.indexOf(q) + 1; }).join(", ");
      document.getElementById("sv-" + missing[0].key).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var record = {
      lang: KZ ? "kk" : "ru",
      at: new Date().toISOString(),
      raw: answers,
      rows: Q.map(function (q) { return { key: q.key, q: q.q[0], a: ruAnswer(q) }; })
    };
    try { localStorage.setItem(KEY, JSON.stringify(record)); } catch (err) { /* blocked */ }
    root.innerHTML = '<div class="card sv-done"><p class="sv-done__title">' + t(UI.thanks) + '</p><button type="button" class="btn btn--ghost" data-sv-again>' + t(UI.again) + "</button></div>";
    root.querySelector("[data-sv-again]").addEventListener("click", render);
    window.scrollTo({ top: root.offsetTop - 80, behavior: "smooth" });
  }

  if (prev && prev.at) {
    var note = document.getElementById("surveyNote");
    if (note) {
      var b = document.createElement("b");
      b.textContent = t(UI.saved) + "(" + new Date(prev.at).toLocaleDateString(KZ ? "kk-KZ" : "ru-RU") + "). ";
      note.insertBefore(b, note.firstChild);
    }
  }
  render();
})();
