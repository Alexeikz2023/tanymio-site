/* Tanymio pilot route: 15 lessons in order with progress kept on this device. */
(function () {
  "use strict";

  var T = window.TANYMIO;
  var lessons = window.TANYMIO_LESSONS || [];

  var ROUTE = [
    { meet: 1, theme: "Безопасность", ids: ["safety-call"] },
    { meet: 2, theme: "Безопасность", ids: ["safety-sms-link"] },
    { meet: 3, theme: "Такси", ids: ["taxi-yandex"] },
    { meet: 4, theme: "Такси", ids: ["taxi-indrive"] },
    { meet: 5, theme: "Банк", ids: ["kaspi-transfer"] },
    { meet: 6, theme: "Банк", ids: ["bank-halyk"] },
    { meet: 7, theme: "Покупки", ids: ["market-kaspi-search", "market-kaspi-cart"] },
    { meet: 8, theme: "Покупки", ids: ["market-wb-search", "market-wb-cart"] },
    { meet: 9, theme: "Доставка", ids: ["delivery-glovo-cart"] },
    { meet: 10, theme: "Доставка", ids: ["delivery-magnum-cart"] },
    { meet: 11, theme: "Связь с семьёй", ids: ["whatsapp-photo"] },
    { meet: 12, theme: "Связь с семьёй", ids: ["telegram"] },
    { meet: 13, theme: "Госуслуги", ids: ["egov"] }
  ];

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
        var label = st === "done" ? "Пройден" : st === "started" ? "Начат" : "Не начат";
        return '<div class="route-lesson route-lesson--' + st + '">' +
          '<span class="route-lesson__mark" aria-hidden="true">' + (st === "done" ? "✓" : "") + "</span>" +
          '<span class="route-lesson__text"><b>' + T.escape(l.title) + "</b><small>" + T.escape(l.appLabel) + " · " + T.escape(l.duration) + " · " + label + "</small></span>" +
          '<span class="route-lesson__go">' +
          '<a class="btn btn--primary" href="lesson.html?id=' + encodeURIComponent(id) + '">' + (st === "done" ? "Повторить" : st === "started" ? "Продолжить" : "Начать") + "</a>" +
          '<a class="btn btn--ghost" href="kz/lesson.html?id=' + encodeURIComponent(id) + '" lang="kk">Қазақша</a>' +
          "</span></div>";
      }).join("");
      html += '<li class="route-meet"><p class="route-meet__head"><span>Встреча ' + meet.meet + "</span>" + T.escape(meet.theme) + "</p>" + items + "</li>";
    });
    list.innerHTML = html;
    document.getElementById("routeDone").textContent = done;
    document.getElementById("routeBar").style.width = Math.round((done / (total || 1)) * 100) + "%";
    var nextEl = document.getElementById("routeNext");
    nextEl.textContent = next ? "следующий: встреча " + next.meet + " — " + next.title : "все уроки маршрута пройдены";
  }

  var print = document.querySelector("[data-print]");
  if (print) print.addEventListener("click", function () { window.print(); });

  document.addEventListener("tanymio:progress", render);
  window.addEventListener("pageshow", render);
  render();
})();
