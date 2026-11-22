/* Tanymio pilot route: 15 lessons in order with progress kept on this device.
   The same script serves route.html (RU) and kz/route.html (KZ, <html lang="kk">). */
(function () {
  "use strict";

  var T = window.TANYMIO;
  var lessons = window.TANYMIO_LESSONS || [];
  var KZ = document.documentElement.lang === "kk";

  var THEMES = {
    safety: ["Безопасность", "Қауіпсіздік"],
    taxi: ["Такси", "Такси"],
    bank: ["Банк", "Банк"],
    shop: ["Покупки", "Сатып алу"],
    delivery: ["Доставка", "Жеткізу"],
    family: ["Связь с семьёй", "Отбасымен байланыс"],
    gov: ["Госуслуги", "Мемлекеттік қызметтер"]
  };

  var ROUTE = [
    { meet: 1, theme: "safety", ids: ["safety-call"] },
    { meet: 2, theme: "safety", ids: ["safety-sms-link"] },
    { meet: 3, theme: "taxi", ids: ["taxi-yandex"] },
    { meet: 4, theme: "taxi", ids: ["taxi-indrive"] },
    { meet: 5, theme: "bank", ids: ["kaspi-transfer"] },
    { meet: 6, theme: "bank", ids: ["bank-halyk"] },
    { meet: 7, theme: "shop", ids: ["market-kaspi-search", "market-kaspi-cart"] },
    { meet: 8, theme: "shop", ids: ["market-wb-search", "market-wb-cart"] },
    { meet: 9, theme: "delivery", ids: ["delivery-glovo-cart"] },
    { meet: 10, theme: "delivery", ids: ["delivery-magnum-cart"] },
    { meet: 11, theme: "family", ids: ["whatsapp-photo"] },
    { meet: 12, theme: "family", ids: ["telegram"] },
    { meet: 13, theme: "gov", ids: ["egov"] }
  ];

  var UI = {
    done: ["Пройден", "Өтілді"],
    started: ["Начат", "Басталды"],
    fresh: ["Не начат", "Басталмаған"],
    repeat: ["Повторить", "Қайталау"],
    resume: ["Продолжить", "Жалғастыру"],
    start: ["Начать", "Бастау"],
    other: ["Қазақша", "Орысша"],
    next: ["следующий: встреча ", "келесісі: "],
    nextSep: [" — ", "-кездесу — "],
    all: ["все уроки маршрута пройдены", "маршруттың барлық сабағы өтілді"]
  };
  function t(pair) { return pair[KZ ? 1 : 0]; }
  function meetLabel(n) { return KZ ? n + "-кездесу" : "Встреча " + n; }

  function byId(id) {
    for (var i = 0; i < lessons.length; i++) if (lessons[i].id === id) return lessons[i];
    return null;
  }

  var list = document.getElementById("routeList");
  if (!list || !T) return;

  function status(id) {
    var p = T.getProgress()[id] || {};
    if (p.completedAt) return "done";
    if (typeof p.step === "number" && p.step > 0) return "started";
    return "new";
  }

  function render() {
    var total = 0, done = 0, next = null, html = "";
    ROUTE.forEach(function (meet) {
      var items = meet.ids.map(function (id) {
        var l = byId(id);
        if (!l) return "";
        total += 1;
        var st = status(id);
        if (st === "done") done += 1;
        else if (!next) next = { id: id, title: l.title, meet: meet.meet };
        var label = t(st === "done" ? UI.done : st === "started" ? UI.started : UI.fresh);
        var q = "lesson.html?id=" + encodeURIComponent(id);
        return '<div class="route-lesson route-lesson--' + st + '">' +
          '<span class="route-lesson__mark" aria-hidden="true">' + (st === "done" ? "✓" : "") + "</span>" +
          '<span class="route-lesson__text"><b>' + T.escape(l.title) + "</b><small>" + T.escape(l.appLabel) + " · " + T.escape(l.duration) + " · " + label + "</small></span>" +
          '<span class="route-lesson__go">' +
          '<a class="btn btn--primary" href="' + q + '">' + t(st === "done" ? UI.repeat : st === "started" ? UI.resume : UI.start) + "</a>" +
          '<a class="btn btn--ghost" href="' + (KZ ? "../" : "kz/") + q + '" lang="' + (KZ ? "ru" : "kk") + '">' + t(UI.other) + "</a>" +
          "</span></div>";
      }).join("");
      html += '<li class="route-meet"><p class="route-meet__head"><span>' + meetLabel(meet.meet) + "</span>" + T.escape(t(THEMES[meet.theme])) + "</p>" + items + "</li>";
    });
    list.innerHTML = html;
    document.getElementById("routeDone").textContent = done;
    document.getElementById("routeBar").style.width = Math.round((done / (total || 1)) * 100) + "%";
    var nextEl = document.getElementById("routeNext");
    nextEl.textContent = next ? t(UI.next) + next.meet + t(UI.nextSep) + next.title : t(UI.all);
  }

  var print = document.querySelector("[data-print]");
  if (print) print.addEventListener("click", function () { window.print(); });

  document.addEventListener("tanymio:progress", render);
  window.addEventListener("pageshow", render);
  render();
})();
