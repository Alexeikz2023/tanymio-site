/* Additional app modules built on the shared training screen set.
   Each config becomes a full lesson with 3–4 steps. */
(function () {
  "use strict";

  var apps = window.TANYMIO_APP_CONFIGS || [];

  function stepFor(kind, app) {
    if (app.bank && kind === "home") {
      return { screen: (app.prefix || "b") + "_home", target: (app.prefix || "b") + "_home_open", rail: app.home.label,
        title: "Откройте раздел", text: "Нажмите «" + app.home.label + "» в приложении " + app.brand + ".",
        hint: "Это крупная кнопка на главном экране.", wrong: "Сейчас нужен раздел «" + app.home.label + "».",
        success: "Раздел открылся.", voice: "Нажмите " + app.home.label + "." };
    }
    if (app.bank && kind === "list") {
      return { screen: (app.prefix || "b") + "_list", target: (app.prefix || "b") + "_list_pick", rail: app.list.items[0][0],
        title: "Выберите получателя", text: "Нажмите на «" + app.list.items[0][0] + "» — " + app.list.items[0][1] + ".",
        hint: "Это первая строка списка.", wrong: "Нужен первый получатель — «" + app.list.items[0][0] + "».",
        success: "Получатель выбран.", voice: "Выберите " + app.list.items[0][0] + "." };
    }
    if (app.bank && kind === "confirm") {
      return { screen: (app.prefix || "b") + "_confirm", target: (app.prefix || "b") + "_confirm_go", rail: "Проверка",
        title: "Проверьте перевод", text: "Сверьте получателя и сумму, затем нажмите кнопку перевода внизу.",
        hint: "Кнопка перевода — в самом низу.", wrong: "Нажмите кнопку перевода внизу.",
        success: "Перевод подтверждён.", voice: "Проверьте данные и нажмите кнопку перевода." };
    }
    if (app.bank) {
      return { screen: (app.prefix || "b") + "_code", target: (app.prefix || "b") + "_code_ok", rail: "Код",
        title: "Введите код", text: "Введите код 4821 и нажмите «Подтвердить».",
        hint: "Код приходит в SMS. Не называйте его посторонним.", wrong: "Введите 4821 и нажмите «Подтвердить».",
        success: "Код принят.", voice: "Введите код 4821 и подтвердите." };
    }
    if (kind === "home") {
      return {
        screen: "a_home", target: "home_open", rail: app.home.label,
        title: "Откройте раздел",
        text: "Нажмите «" + app.home.label + "» в приложении " + app.brand + ".",
        hint: "Это верхняя кнопка на экране.",
        wrong: "Сейчас нужен раздел «" + app.home.label + "».",
        success: "Раздел открылся.",
        voice: "Нажмите " + app.home.label + "."
      };
    }
    if (kind === "list") {
      return {
        screen: "a_list", target: "list_pick", rail: app.list.items[0][0],
        title: "Выберите нужное",
        text: "Нажмите на «" + app.list.items[0][0] + "» — " + app.list.items[0][1] + ".",
        hint: "Это первая строка в списке.",
        wrong: "Сейчас нужна первая строка — «" + app.list.items[0][0] + "».",
        success: "Выбор сделан.",
        voice: "Выберите " + app.list.items[0][0] + "."
      };
    }
    if (kind === "confirm") {
      return {
        screen: "a_confirm", target: "confirm_go", rail: "Проверка",
        title: "Проверьте данные",
        text: "Сверьте данные и нажмите «" + app.confirm.cta + "» внизу.",
        hint: "Кнопка подтверждения — в самом низу экрана.",
        wrong: "Нажмите кнопку «" + app.confirm.cta + "» внизу.",
        success: "Действие подтверждено.",
        voice: "Проверьте данные и нажмите " + app.confirm.cta + "."
      };
    }
    if (kind === "code") {
      return {
        screen: "a_code", target: "code_ok", rail: "Код",
        title: "Введите код",
        text: "Введите код 4821 и нажмите «" + app.code.cta + "».",
        hint: "Код приходит в SMS. Его нельзя называть посторонним.",
        wrong: "Введите 4821 и нажмите «" + app.code.cta + "».",
        success: "Код принят.",
        voice: "Введите код 4821 и подтвердите."
      };
    }
    return {
      screen: "a_chat", target: "chat_send", rail: "Сообщение",
      title: "Отправьте сообщение",
      text: "Нажмите готовую фразу «" + app.chat.quick + "».",
      hint: "Готовая фраза — светлая кнопка под сообщениями.",
      wrong: "Выберите готовую фразу «" + app.chat.quick + "».",
      success: "Сообщение отправлено.",
      voice: "Нажмите " + app.chat.quick + "."
    };
  }

  function build(app, index) {
    var ui = {
      brand: app.brand, letter: app.letter, city: app.home.city || "Алматы · учебный экран", theme: app.theme,
      homeLabel: app.home.label, homeValue: app.home.value, homeNote: app.home.note,
      homeAmount: app.home.amount, homeHint: "Это учебный экран. Реальные операции не выполняются.",
      listTitle: app.list.title
    };
    app.list.items.forEach(function (item, i) {
      ui["item" + i + "Label"] = item[0];
      ui["item" + i + "Sub"] = item[1];
    });
    if (app.confirm) {
      ui.confirmTitle = app.confirm.title;
      app.confirm.rows.forEach(function (row, i) {
        ui["row" + i + "Label"] = row[0];
        ui["row" + i + "Value"] = row[1];
      });
      ui.confirmNote = app.confirm.note;
      ui.confirmValue = app.confirm.value;
      ui.confirmCta = app.confirm.cta;
    }
    if (app.code) {
      ui.codeTitle = app.code.title;
      ui.codeText = app.code.text;
      ui.codeCta = app.code.cta;
    }
    if (app.chat) {
      ui.chatTitle = app.chat.title;
      ui.chatIn = app.chat.in;
      ui.chatOut = app.chat.out;
      ui.chatQuick = app.chat.quick;
      ui.chatHint = app.chat.hint;
    }

    var steps = app.flow.map(function (kind) { return stepFor(kind, app); });
    return {
      id: app.id,
      order: 10 + index,
      app: "generic",
      appLabel: app.brand,
      uiGroup: app.bank ? app.id : "generic",
      ui: ui,
      category: app.category,
      title: app.title,
      short: app.short,
      goal: app.goal,
      level: "Новичок",
      duration: "5 минут",
      free: false,
      checked: "8 ноября 2026",
      intro: "Учебный сценарий. Реальные операции не выполняются.",
      steps: steps,
      done: app.done,
      next: index < apps.length - 1 ? apps[index + 1].id : "taxi-yandex"
    };
  }

  var built = apps.map(build);
  var custom = {
    "kaspi-shop": { group: "market-kaspi", map: ["ks_home:k_search", "ks_results:k_item", "ks_product:k_cart"] },
    "wildberries": { group: "market-wb", map: ["wb_home:w_search", "wb_results:w_item", "wb_product:w_cart"] }
  };
  built.forEach(function (lesson) {
    var c = custom[lesson.id];
    if (!c) return;
    lesson.uiGroup = c.group;
    lesson.steps = lesson.steps.slice(0, c.map.length).map(function (step, i) {
      var pair = c.map[i].split(":");
      step.screen = pair[0];
      step.target = pair[1];
      return step;
    });
  });

  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(built);
})();