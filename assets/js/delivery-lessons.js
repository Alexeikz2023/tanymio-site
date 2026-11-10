/* Build delivery lessons from shared configs. */
(function () {
  "use strict";
  var modules = window.TANYMIO_DELIVERY_CONFIGS || [];

  function step(kind, lesson, mod) {
    if (kind === "home") {
      return { screen: "a_home", target: "home_open", rail: lesson.home.label,
        title: "Откройте раздел", text: "В приложении " + mod.brand + " нажмите «" + lesson.home.label + "».",
        hint: "Это верхняя кнопка на экране.", wrong: "Сейчас нужен раздел «" + lesson.home.label + "».",
        success: "Раздел открылся.", voice: "Нажмите " + lesson.home.label + "." };
    }
    if (kind === "list") {
      return { screen: "a_list", target: "list_pick", rail: lesson.list.items[0][0],
        title: "Выберите нужное", text: "Нажмите на «" + lesson.list.items[0][0] + "» — " + lesson.list.items[0][1] + ".",
        hint: "Это первая строка списка.", wrong: "Нужна первая строка — «" + lesson.list.items[0][0] + "».",
        success: "Выбор сделан.", voice: "Выберите " + lesson.list.items[0][0] + "." };
    }
    if (kind === "confirm") {
      return { screen: "a_confirm", target: "confirm_go", rail: "Проверка",
        title: "Проверьте данные", text: "Сверьте данные и нажмите «" + lesson.confirm.cta + "» внизу.",
        hint: "Кнопка подтверждения — в самом низу.", wrong: "Нажмите «" + lesson.confirm.cta + "».",
        success: "Действие подтверждено.", voice: "Проверьте данные и нажмите " + lesson.confirm.cta + "." };
    }
    return { screen: "a_code", target: "code_ok", rail: "Код",
      title: "Введите код", text: "Введите код 4821 и нажмите «" + lesson.code.cta + "».",
      hint: "Код приходит в SMS. Не называйте его посторонним.", wrong: "Введите 4821 и нажмите «" + lesson.code.cta + "».",
      success: "Код принят.", voice: "Введите код 4821 и подтвердите." };
  }

  function build(mod, lesson, index) {
    var ui = { brand: mod.brand, letter: mod.letter, city: "Алматы · учебный экран", theme: "delivery",
      homeLabel: lesson.home.label, homeValue: lesson.home.value, homeNote: lesson.home.note,
      homeAmount: lesson.home.amount, homeHint: "Это учебный экран. Реальная доставка не выполняется.",
      listTitle: lesson.list.title };
    lesson.list.items.forEach(function (item, i) { ui["item" + i + "Label"] = item[0]; ui["item" + i + "Sub"] = item[1]; });
    ui.confirmTitle = lesson.confirm.title;
    lesson.confirm.rows.forEach(function (row, i) { ui["row" + i + "Label"] = row[0]; ui["row" + i + "Value"] = row[1]; });
    ui.confirmNote = lesson.confirm.note; ui.confirmValue = lesson.confirm.value; ui.confirmCta = lesson.confirm.cta;
    if (lesson.code) { ui.codeTitle = lesson.code.title; ui.codeText = lesson.code.text; ui.codeCta = lesson.code.cta; }
    var flow = lesson.code ? ["home", "list", "confirm", "code"] : ["home", "list", "confirm"];
    return {
      id: mod.prefix + "-" + lesson.slug, order: 60 + index, app: "generic", appLabel: mod.brand,
      uiGroup: "generic", ui: ui, category: "delivery", title: lesson.title, short: lesson.goal, goal: lesson.goal,
      level: "Новичок", duration: "4 минуты", free: false, checked: "10 ноября 2026",
      intro: "Учебный сценарий. Реальная доставка не выполняется.",
      steps: flow.map(function (kind) { return step(kind, lesson, mod); }), done: lesson.done, next: "yandex-delivery"
    };
  }

  var all = [];
  modules.forEach(function (mod) { mod.lessons.forEach(function (lesson) { all.push(build(mod, lesson)); }); });
  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(all);
})();