/* Marketplace modules: five additional lessons per app, on the shared app screens.
   Existing intro lessons (kaspi-shop, ozon, wildberries, temu) stay as lesson 1. */
(function () {
  "use strict";

  var modules = window.TANYMIO_MARKET_CONFIGS || [];

  function step(kind, lesson, mod) {
    if (kind === "home") {
      return {
        screen: "a_home", target: "home_open", rail: lesson.home.label,
        title: "Откройте раздел",
        text: "В приложении " + mod.brand + " нажмите «" + lesson.home.label + "».",
        hint: "Это верхняя кнопка на экране.",
        wrong: "Сейчас нужен раздел «" + lesson.home.label + "».",
        success: "Раздел открылся.",
        voice: "Нажмите " + lesson.home.label + "."
      };
    }
    if (kind === "list") {
      return {
        screen: "a_list", target: "list_pick", rail: lesson.list.items[0][0],
        title: "Выберите нужное",
        text: "Нажмите на «" + lesson.list.items[0][0] + "» — " + lesson.list.items[0][1] + ".",
        hint: "Это первая строка списка.",
        wrong: "Сейчас нужна первая строка — «" + lesson.list.items[0][0] + "».",
        success: "Выбор сделан.",
        voice: "Выберите " + lesson.list.items[0][0] + "."
      };
    }
    if (kind === "confirm") {
      return {
        screen: "a_confirm", target: "confirm_go", rail: "Проверка",
        title: "Проверьте данные",
        text: "Сверьте данные и нажмите «" + lesson.confirm.cta + "» внизу.",
        hint: "Кнопка подтверждения — в самом низу.",
        wrong: "Нажмите кнопку «" + lesson.confirm.cta + "».",
        success: "Действие подтверждено.",
        voice: "Проверьте данные и нажмите " + lesson.confirm.cta + "."
      };
    }
    return {
      screen: "a_code", target: "code_ok", rail: "Код",
      title: "Введите код",
      text: "Введите код 4821 и нажмите «" + lesson.code.cta + "».",
      hint: "Код приходит в SMS. Не называйте его посторонним.",
      wrong: "Введите 4821 и нажмите «" + lesson.code.cta + "».",
      success: "Код принят.",
      voice: "Введите код 4821 и подтвердите."
    };
  }

  function build(mod, lesson, index) {
    var id = mod.prefix + "-" + lesson.slug;
    var ui = {
      brand: mod.brand, letter: mod.letter, city: "Алматы · учебный экран", theme: mod.theme || "market",
      homeLabel: lesson.home.label, homeValue: lesson.home.value, homeNote: lesson.home.note,
      homeAmount: lesson.home.amount, homeHint: "Это учебный экран. Реальные заказы не выполняются.",
      listTitle: lesson.list.title
    };
    lesson.list.items.forEach(function (item, i) {
      ui["item" + i + "Label"] = item[0];
      ui["item" + i + "Sub"] = item[1];
    });
    (mod.tabs || []).forEach(function (tab, i) { ui["tab" + i] = tab; });
    ui.confirmTitle = lesson.confirm.title;
    lesson.confirm.rows.forEach(function (row, i) {
      ui["row" + i + "Label"] = row[0];
      ui["row" + i + "Value"] = row[1];
    });
    ui.confirmNote = lesson.confirm.note;
    ui.confirmValue = lesson.confirm.value;
    ui.confirmCta = lesson.confirm.cta;
    if (lesson.code) {
      ui.codeTitle = lesson.code.title;
      ui.codeText = lesson.code.text;
      ui.codeCta = lesson.code.cta;
    }
    var flow = lesson.code ? ["home", "list", "confirm", "code"] : ["home", "list", "confirm"];
    return {
      id: id,
      order: 40 + index,
      app: "generic",
      appLabel: mod.brand,
      uiGroup: "generic",
      ui: ui,
      category: "market",
      title: lesson.title,
      short: lesson.goal,
      goal: lesson.goal,
      level: "Новичок",
      duration: "4 минуты",
      free: false,
      checked: "9 ноября 2026",
      intro: "Учебный сценарий. Реальный заказ не оформляется.",
      steps: flow.map(function (kind) { return step(kind, lesson, mod); }),
      done: lesson.done,
      next: index < 19 ? null : "kaspi-shop"
    };
  }

  window.TANYMIO_MARKET_CONFIGS = modules;

  var all = [];
  modules.forEach(function (mod) {
    mod.lessons.forEach(function (lesson) { all.push(build(mod, lesson)); });
  });
  var custom = {
    "market-kaspi-search": ["ks_home:k_search", "ks_results:k_item", "ks_product:k_cart"],
    "market-wb-search": ["wb_home:w_search", "wb_results:w_item", "wb_product:w_cart"]
  };
  all.forEach(function (lesson) {
    var map = custom[lesson.id];
    if (!map) return;
    lesson.uiGroup = lesson.id.indexOf("kaspi") !== -1 ? "market-kaspi" : "market-wb";
    lesson.steps = lesson.steps.slice(0, map.length).map(function (step, i) {
      var pair = map[i].split(":");
      step.screen = pair[0];
      step.target = pair[1];
      return step;
    });
  });

  /* Wildberries lessons on the real-capture screens: own step scripts.
     The screens keep their own consistent order data, only the theme comes from config. */
  var wbScripts = {
    "market-wb-size": [
      {
        "screen": "wb_home",
        "target": "w_search",
        "rail": "Поиск",
        "title": "Найдите товар",
        "text": "Нажмите на строку «Найти на Wildberries» вверху экрана.",
        "hint": "Строка поиска — сразу под логотипом.",
        "wrong": "Нажмите на строку поиска вверху.",
        "success": "Поиск открыт.",
        "voice": "Нажмите на строку поиска вверху экрана."
      },
      {
        "screen": "wb_results",
        "target": "w_item",
        "rail": "Куртка, 48",
        "title": "Выберите товар",
        "text": "Нажмите на карточку «Куртка, 48» — 8 900 ₸.",
        "hint": "Это первая карточка в списке.",
        "wrong": "Нужна первая карточка — «Куртка, 48».",
        "success": "Карточка товара открыта.",
        "voice": "Нажмите на карточку: куртка, сорок восьмой размер."
      },
      {
        "screen": "wb_product",
        "target": "w_size",
        "rail": "Размер 48",
        "title": "Выберите размер",
        "text": "Нажмите на размер 48: по таблице он подходит при обхвате груди 96–100 см.",
        "hint": "Кнопки с размерами — под ценой.",
        "wrong": "Нажмите на кнопку «48» в строке «Размер».",
        "success": "Размер 48 выбран.",
        "voice": "Нажмите на размер сорок восемь."
      },
      {
        "screen": "wb_product",
        "target": "w_cart",
        "rail": "В корзину",
        "title": "Добавьте в корзину",
        "text": "Проверьте, что выбран размер 48, и нажмите «В корзину» внизу.",
        "hint": "Кнопка — в самом низу экрана.",
        "wrong": "Нажмите «В корзину» внизу.",
        "success": "Товар в корзине.",
        "voice": "Проверьте размер и нажмите «В корзину»."
      }
    ],
    "market-wb-cart": [
      {
        "screen": "wb_product",
        "target": "w_cart",
        "rail": "В корзину",
        "title": "Добавьте товар",
        "text": "Нажмите «В корзину» внизу карточки товара.",
        "hint": "Кнопка — в самом низу экрана.",
        "wrong": "Нажмите «В корзину» внизу.",
        "success": "Товар в корзине.",
        "voice": "Нажмите «В корзину» внизу экрана."
      },
      {
        "screen": "wb_cart",
        "target": "w_checkout",
        "rail": "Итого",
        "title": "Проверьте сумму",
        "text": "Цена 8 900 ₸, скидка −1 000 ₸, итого 7 900 ₸. Если всё верно, нажмите «Оформить заказ».",
        "hint": "Итог — в строке «Итого», кнопка — внизу.",
        "wrong": "Нажмите «Оформить заказ» внизу.",
        "success": "Сумма проверена.",
        "voice": "Проверьте скидку и итог: семь тысяч девятьсот тенге. Затем нажмите «Оформить заказ»."
      }
    ],
    "market-wb-pickup": [
      {
        "screen": "wb_cart",
        "target": "w_checkout",
        "rail": "Оформить",
        "title": "Оформите заказ",
        "text": "В корзине нажмите «Оформить заказ».",
        "hint": "Кнопка — внизу корзины.",
        "wrong": "Нажмите «Оформить заказ» внизу.",
        "success": "Открылось оформление.",
        "voice": "В корзине нажмите «Оформить заказ»."
      },
      {
        "screen": "wb_delivery",
        "target": "w_pickup",
        "rail": "Толе би, 59",
        "title": "Проверьте пункт выдачи",
        "text": "Нажмите на адрес «Толе би, 59». В этом пункте можно примерить вещь.",
        "hint": "Адрес — в белой рамке под словами «Пункт выдачи».",
        "wrong": "Нажмите на адрес пункта выдачи.",
        "success": "Пункт выдачи выбран.",
        "voice": "Нажмите на адрес пункта выдачи: Толе би, пятьдесят девять. Там можно примерить вещь."
      },
      {
        "screen": "wb_delivery",
        "target": "w_pay",
        "rail": "Срок",
        "title": "Проверьте срок",
        "text": "Заказ придёт сегодня, доставка 0 ₸. Нажмите «Перейти к оплате».",
        "hint": "Кнопка — в самом низу экрана.",
        "wrong": "Нажмите «Перейти к оплате» внизу.",
        "success": "Срок проверен.",
        "voice": "Проверьте срок и стоимость доставки, затем нажмите «Перейти к оплате»."
      }
    ],
    "market-wb-pay": [
      {
        "screen": "wb_delivery",
        "target": "w_pay",
        "rail": "К оплате",
        "title": "Перейдите к оплате",
        "text": "Проверьте адрес и нажмите «Перейти к оплате».",
        "hint": "Кнопка — в самом низу экрана.",
        "wrong": "Нажмите «Перейти к оплате» внизу.",
        "success": "Открылась оплата.",
        "voice": "Проверьте адрес и нажмите «Перейти к оплате»."
      },
      {
        "screen": "wb_payment",
        "target": "w_pay",
        "rail": "Карта",
        "title": "Выберите карту",
        "text": "Нажмите на строку «Карта •••• 4412».",
        "hint": "Способы оплаты — под суммой.",
        "wrong": "Нажмите на строку с картой.",
        "success": "Карта выбрана.",
        "voice": "Нажмите на строку с вашей картой."
      },
      {
        "screen": "wb_payment",
        "target": "w_code",
        "rail": "Оплатить",
        "title": "Оплатите заказ",
        "text": "Сверьте сумму 7 900 ₸ и нажмите «Оплатить».",
        "hint": "Кнопка — в самом низу экрана.",
        "wrong": "Нажмите «Оплатить» внизу.",
        "success": "Запрошен код.",
        "voice": "Сверьте сумму и нажмите «Оплатить»."
      },
      {
        "screen": "wb_code",
        "target": "w_code_ok",
        "rail": "Код",
        "title": "Подтвердите кодом",
        "text": "Код 4821 из SMS уже введён. Нажмите «Подтвердить». Никому не называйте этот код.",
        "hint": "Код приходит в SMS на ваш номер.",
        "wrong": "Нажмите «Подтвердить» внизу.",
        "success": "Оплата подтверждена.",
        "voice": "Код из СМС уже введён. Нажмите «Подтвердить». Никому не называйте этот код."
      }
    ]
  };
  all.forEach(function (lesson) {
    var steps = wbScripts[lesson.id];
    if (!steps) return;
    lesson.uiGroup = "market-wb";
    lesson.ui = { theme: lesson.ui && lesson.ui.theme };
    lesson.steps = steps.map(function (s) {
      var copy = {};
      Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
      return copy;
    });
  });

  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(all);
})();