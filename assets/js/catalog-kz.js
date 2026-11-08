/* Tanymio — lesson catalogue: cards, filters, progress. */
(function () {
  "use strict";

  var T = window.TANYMIO;
  var lessons = window.TANYMIO_LESSONS || [];
  var categories = window.TANYMIO_CATEGORIES || {};
  var grid = document.querySelector("[data-lesson-grid]");
  if (!grid) return;

  var filterButtons = T.qsa("[data-filter]");
  var activeFilter = "all";
  var progressPanel = document.querySelector("[data-progress-panel]");

  function preview(app) {
    if (app === "yandex") {
      return (
        '<div class="mini">' +
        '<div class="mini__bar mini__bar--yandex"><span style="font-weight:800">Яндекс Go</span></div>' +
        '<div class="mini__body">' +
        '<div class="mini__map"></div>' +
        '<div class="mini__field"><svg aria-hidden="true"><use href="#i-search"/></svg>Куда поедем?</div>' +
        '<div class="mini__cta">Заказать · 1 250 ₸</div>' +
        "</div></div>"
      );
    }
    if (app === "vostok") {
      return (
        '<div class="mini">' +
        '<div class="mini__bar" style="background:#123a5c;color:#fff"><span style="font-weight:800">Восток Си</span></div>' +
        '<div class="mini__body">' +
        '<div class="mini__row"><span>Откуда</span><b>Абая, 15</b></div>' +
        '<div class="mini__row"><span>Куда</span><b>Толе би, 59</b></div>' +
        '<div class="mini__row"><span>Стоимость</span><b>900 ₸</b></div>' +
        '<div class="mini__cta" style="background:#f08a24">Заказать такси</div>' +
        "</div></div>"
      );
    }
    if (app === "kaspi") {
      return (
        '<div class="mini">' +
        '<div class="mini__bar mini__bar--kaspi"><span style="font-weight:800">kaspi.kz</span></div>' +
        '<div class="mini__body">' +
        '<div style="height:26px;border-radius:6px;background:linear-gradient(135deg,#8f2118,#5c140e);margin-bottom:6px"></div>' +
        '<div class="mini__items">' +
        '<div class="mini__tile"><i></i>Переводы</div>' +
        '<div class="mini__tile"><i style="background:#3d5a78"></i>Платежи</div>' +
        "</div>" +
        '<div class="mini__row" style="margin-top:4px"><span>Аслан</span><b>5 000 ₸</b></div>' +
        "</div></div>"
      );
    }
    if (app === "whatsapp") {
      return (
        '<div class="mini">' +
        '<div class="mini__bar mini__bar--whatsapp"><span style="font-weight:800">WhatsApp</span></div>' +
        '<div class="mini__body" style="background:#ece5dd">' +
        '<div class="mini__bubble">Привет, бабушка!</div>' +
        '<div class="mini__bubble mini__bubble--out">Сейчас отправлю фото</div>' +
        '<div class="mini__photo"></div>' +
        "</div></div>"
      );
    }
    if (app === "indrive") {
      return (
        '<div class="mini">' +
        '<div class="mini__bar" style="background:#c8f36a;color:#101010"><span style="font-weight:800">inDrive</span></div>' +
        '<div class="mini__body">' +
        '<div class="mini__map"></div>' +
        '<div class="mini__field"><svg aria-hidden="true"><use href="#i-search"/></svg>Куда едем?</div>' +
        '<div class="mini__cta">Предложить 1 200 ₸</div>' +
        "</div></div>"
      );
    }
    if (app === "greensm") {
      return (
        '<div class="mini">' +
        '<div class="mini__bar" style="background:#0b7a45;color:#fff"><span style="font-weight:800">Xanh SM</span></div>' +
        '<div class="mini__body">' +
        '<div class="mini__field"><svg aria-hidden="true"><use href="#i-search"/></svg>Where to?</div>' +
        '<div class="mini__row"><span>GreenCar</span><b>180 000 ₫</b></div>' +
        '<div class="mini__cta" style="background:#0b7a45">Book</div>' +
        "</div></div>"
      );
    }
    return (
      '<div class="mini">' +
      '<div class="mini__bar" style="background:#101a17;color:#fff"><span style="font-weight:800">Входящий вызов</span></div>' +
      '<div class="mini__body" style="background:#101a17;color:#fff;text-align:center">' +
      '<div style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.3);margin:8px auto 6px;display:grid;place-items:center">' +
      '<svg aria-hidden="true" style="width:14px;height:14px"><use href="#i-phone"/></svg></div>' +
      '<div style="font-size:7px;color:#c9b6b2">+7 700 123 45 67</div>' +
      '<div style="display:flex;justify-content:center;gap:10px;margin-top:10px">' +
      '<span style="width:18px;height:18px;border-radius:50%;background:#d0352a"></span>' +
      '<span style="width:18px;height:18px;border-radius:50%;background:#2f7d4f"></span>' +
      "</div></div></div>"
    );
  }

  function statusFor(item) {
    var entry = T.getProgress()[item.id] || {};
    if (entry.completedAt) return { cls: "status-dot--done", label: "Өтілді", foot: "Сабақты қайталау" };
    if (typeof entry.step === "number" && entry.step > 0) {
      return { cls: "status-dot--progress", label: "Жалғастыру", foot: "Қадамнан жалғастыру: " + (entry.step + 1) };
    }
    return { cls: "", label: "Басталмаған", foot: "Сабақты бастау" };
  }

  function card(item) {
    var unlocked = T.isUnlocked();
    var locked = !item.free && !unlocked;
    var status = statusFor(item);
    var badge = item.free
      ? '<span class="badge badge--free">Тегін</span>'
      : locked
        ? '<span class="badge badge--locked">Курста</span>'
        : '<span class="badge badge--free">Ашық</span>';

    return (
      '<a class="lesson-card' + (locked ? " is-locked" : "") + '" href="lesson.html?id=' + item.id + '"' +
      ' data-lesson="' + item.id + '" data-cat="' + item.category + '"' +
      (locked ? " data-paid data-require-access" : "") + ">" +
      '<div class="lesson-card__visual">' +
      '<div class="lesson-card__badges">' + badge +
      '<span class="lesson-card__app">' + T.escape(item.appLabel) + "</span></div>" +
      preview(item.app) +
      (locked ? '<div class="locked-overlay" aria-hidden="true"><svg><use href="#i-lock"/></svg></div>' : "") +
      "</div>" +
      '<div class="lesson-card__body">' +
      '<div class="lesson-card__meta"><span>' + item.steps.length + " қадам</span><span class=\"dot\"></span><span>" +
      T.escape(item.duration) + "</span><span class=\"dot\"></span><span>" + T.escape(categories[item.category] || "") + "</span></div>" +
      "<h3>" + T.escape(item.title) + "</h3>" +
      '<p class="lesson-card__desc">' + T.escape(item.short) + "</p>" +
      '<div class="lesson-card__foot"><span class="status-dot ' + status.cls + '">' + status.label + "</span>" +
      '<span class="row" style="gap:6px">' + status.foot +
      '<svg aria-hidden="true"><use href="#i-arrow-right"/></svg></span></div>' +
      "</div></a>"
    );
  }

  function render() {
    grid.innerHTML = lessons.map(card).join("");

    var doneCount = lessons.filter(function (item) {
      var entry = T.getProgress()[item.id] || {};
      return !!entry.completedAt;
    }).length;

    if (progressPanel) {
      var ring = progressPanel.querySelector(".progress-panel__ring");
      var label = progressPanel.querySelector("[data-progress-count]");
      var pct = Math.round((doneCount / lessons.length) * 100);
      if (ring) {
        ring.style.setProperty("--p", pct + "%");
        var b = ring.querySelector("b");
        if (b) b.textContent = pct + "%";
      }
      if (label) {
        label.textContent = doneCount === 0
          ? "Тегін сабақтан бастаңыз — шамамен сегіз минут."
          : doneCount === lessons.length
            ? "Барлық " + lessons.length + " сабақ өтілді. Кез келгенін өз қарқыныңызбен қайталауға болады."
            : lessons.length + " сабақтың " + doneCount + " өтілді. Келесі қадам — өзіңізде.";
      }
    }

    var cta = progressPanel.querySelector("[data-progress-cta]");
    if (cta) {
      var nextLesson = lessons.filter(function (item) {
        return !(T.getProgress()[item.id] || {}).completedAt;
      })[0];
      if (nextLesson) {
        cta.href = "lesson.html?id=" + nextLesson.id;
        cta.textContent = doneCount ? "Жалғастыру" : "Тегін бастау";
      } else {
        cta.href = "lesson.html?id=" + lessons[0].id;
        cta.textContent = "Қайталау";
      }
    }

    applyFilter();
  }

  function applyFilter() {
    var cards = T.qsa("[data-lesson]", grid);
    var visible = 0;
    cards.forEach(function (cardEl) {
      var show = activeFilter === "all" ||
        (activeFilter === "free" && !cardEl.hasAttribute("data-paid")) ||
        cardEl.dataset.cat === activeFilter;
      cardEl.hidden = !show;
      if (show) visible += 1;
    });
    var empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = visible !== 0;
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.dataset.filter;
      filterButtons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === btn));
      });
      applyFilter();
    });
  });

  document.addEventListener("tanymio:access", render);
  document.addEventListener("tanymio:progress", render);

  if (location.hash === "#free") {
    activeFilter = "free";
    filterButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === "free"));
    });
  }

  render();
})();