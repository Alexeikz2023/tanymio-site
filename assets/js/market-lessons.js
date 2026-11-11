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

  /* Own screens for Kaspi, Ozon and Temu lessons (group «market-own»). */
  var ownScripts = {
    "market-kaspi-search": [
      {
        screen: "mka_home",
        target: "x_search",
        rail: "Поиск",
        title: "Найдите товар",
        text: "Нажмите на строку «Поиск в Магазине» вверху.",
        hint: "Белая строка под названием магазина.",
        wrong: "Нужна строка поиска вверху.",
        success: "Вы ввели «аспирин» — вот результаты.",
        voice: "Нажмите на строку поиска вверху экрана."
      },
      {
        screen: "mka_results",
        target: "x_item",
        rail: "Аспирин",
        title: "Откройте товар",
        text: "Нажмите на первый результат — «Аспирин 500 мг, 20 таблеток».",
        hint: "Первая строка в списке.",
        wrong: "Нужна первая строка — аспирин 500 мг.",
        success: "Открылась карточка товара.",
        voice: "Нажмите на первый результат: аспирин пятьсот миллиграммов."
      },
      {
        screen: "mka_product",
        type: "choice",
        rail: "Цена «от»",
        title: "Что значит «от 1 200 ₸»",
        text: "Цена написана «от 1 200 ₸». Что значит «от»?",
        hint: "Один товар продают несколько аптек.",
        success: "Верно понимаете.",
        voice: "Цена написана от тысячи двухсот тенге. Что значит «от»?",
        choices: [
          { label: "В аптеках цена разная, 1 200 ₸ — самая низкая", ok: true, feedback: "Верно. Нажмите «Где купить», чтобы сравнить аптеки." },
          { label: "Это точная цена во всех аптеках", ok: false, feedback: "Нет: в другой аптеке может быть дороже. Смотрите «Где купить»." },
          { label: "Это цена за 100 таблеток", ok: false, feedback: "Цена — за упаковку из 20 таблеток, как в названии." }
        ]
      },
      {
        screen: "mka_product",
        target: "x_cart",
        rail: "В корзину",
        title: "Добавьте в корзину",
        text: "Нажмите «В корзину» внизу.",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «В корзину».",
        success: "Товар в корзине.",
        voice: "Нажмите «В корзину» внизу экрана."
      }
    ],
    "market-kaspi-pharmacy": [
      {
        screen: "mka_product",
        target: "x_seller",
        rail: "Где купить",
        title: "Откройте список аптек",
        text: "Нажмите «Где купить» — там аптеки, цены и наличие.",
        hint: "Строка под ценой.",
        wrong: "Нужна строка «Где купить».",
        success: "Открылся список аптек.",
        voice: "Нажмите строку «Где купить» под ценой."
      },
      {
        screen: "mka_sellers",
        type: "choice",
        rail: "Аптека",
        title: "Какую аптеку выбрать",
        text: "Лекарство нужно сегодня. Какую аптеку выбрать?",
        hint: "Смотрите на наличие и срок.",
        success: "Хороший выбор.",
        voice: "Лекарство нужно сегодня. Какую аптеку выбрать?",
        choices: [
          { label: "Толе би, 59: в наличии, забрать сегодня", ok: true, feedback: "Верно. И цена там самая низкая." },
          { label: "Абая, 20: тоже рядом", ok: false, feedback: "Там лекарство будет только завтра и на 100 ₸ дороже." },
          { label: "Аптека у дома", ok: false, feedback: "Там сейчас нет в наличии." }
        ]
      },
      {
        screen: "mka_sellers",
        target: "x_seller_pick",
        rail: "Толе би, 59",
        title: "Выберите аптеку",
        text: "Нажмите «Аптека на Толе би, 59».",
        hint: "Первая строка.",
        wrong: "Нужна аптека на Толе би.",
        success: "Аптека выбрана.",
        voice: "Нажмите на аптеку на Толе би."
      }
    ],
    "market-kaspi-cart": [
      {
        screen: "mka_product",
        target: "x_cart",
        rail: "В корзину",
        title: "Добавьте в корзину",
        text: "Нажмите «В корзину» внизу карточки.",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «В корзину».",
        success: "Открылась корзина.",
        voice: "Нажмите «В корзину» внизу."
      },
      {
        screen: "mka_cart",
        type: "choice",
        rail: "Проверка",
        title: "Что проверить в корзине",
        text: "В корзине два товара, итого 2 100 ₸. Что проверить перед оформлением?",
        hint: "После оплаты изменить заказ сложнее.",
        success: "Всё проверено.",
        voice: "Что проверить в корзине перед оформлением?",
        choices: [
          { label: "Что товары нужные, по 1 штуке, и итоговую сумму", ok: true, feedback: "Верно. Лишнее уберите сейчас, до оплаты." },
          { label: "Только итоговую сумму", ok: false, feedback: "Сумма важна, но проверьте и сами товары, и количество." },
          { label: "Ничего: всё можно поменять после оплаты", ok: false, feedback: "После оплаты менять заказ сложнее. Проверьте сейчас." }
        ]
      },
      {
        screen: "mka_cart",
        target: "x_checkout",
        rail: "Оформить",
        title: "Перейдите к оформлению",
        text: "Всё верно. Нажмите «Оформить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Оформить».",
        success: "Открылся выбор способа получения.",
        voice: "Нажмите «Оформить» внизу."
      }
    ],
    "market-kaspi-delivery": [
      {
        screen: "mka_delivery",
        target: "x_deliv",
        rail: "Самовывоз",
        title: "Выберите самовывоз",
        text: "Аптека на Толе би, 59 — сегодня до 21:00, бесплатно. Нажмите «Самовывоз».",
        hint: "Первая строка.",
        wrong: "Нужна строка «Самовывоз».",
        success: "Самовывоз выбран.",
        voice: "Нажмите строку «Самовывоз»."
      },
      {
        screen: "mka_delivery",
        type: "choice",
        rail: "Курьер",
        title: "Когда нужен курьер",
        text: "Когда удобнее заказать курьера?",
        hint: "Курьер стоит 500 ₸ и приезжает к вам.",
        success: "Верно.",
        voice: "Когда удобнее заказать курьера?",
        choices: [
          { label: "Когда тяжело выйти из дома: доставка 500 ₸, нужно ждать дома", ok: true, feedback: "Верно. Если можете дойти до аптеки — самовывоз бесплатный." },
          { label: "Курьер всегда бесплатный", ok: false, feedback: "Здесь доставка курьером стоит 500 ₸." },
          { label: "Курьер приедет в любое время без звонка", ok: false, feedback: "Курьер приезжает в выбранное время и обычно звонит заранее." }
        ]
      },
      {
        screen: "mka_delivery",
        target: "x_continue",
        rail: "Продолжить",
        title: "Продолжите",
        text: "Нажмите «Продолжить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Продолжить».",
        success: "Способ получения выбран.",
        voice: "Нажмите «Продолжить» внизу."
      }
    ],
    "market-kaspi-pay": [
      {
        screen: "mka_payment",
        target: "x_pay",
        rail: "Оплатить",
        title: "Проверьте и оплатите",
        text: "К оплате 2 100 ₸ с Kaspi Gold. Нажмите «Оплатить 2 100 ₸».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Оплатить».",
        success: "Пришёл код из SMS.",
        voice: "Проверьте сумму и нажмите «Оплатить»."
      },
      {
        screen: "mka_code",
        type: "choice",
        rail: "Звонок",
        title: "Звонят во время оплаты",
        text: "Звонит «сотрудник Kaspi»: «Назовите код, чтобы подтвердить заказ». Что делать?",
        hint: "Код вводят только в приложении.",
        success: "Вы не попались.",
        voice: "Звонит «сотрудник Kaspi» и просит код. Что делать?",
        choices: [
          { label: "Положить трубку: код вводят только в приложении", ok: true, feedback: "Верно. Сотрудники никогда не спрашивают код." },
          { label: "Назвать код: это же сотрудник", ok: false, feedback: "Это мошенник. Код нужен только вам." },
          { label: "Назвать половину кода", ok: false, feedback: "Даже часть кода помогает мошенникам. Кладите трубку." }
        ]
      },
      {
        screen: "mka_code",
        target: "x_code_ok",
        rail: "Подтвердить",
        title: "Подтвердите оплату",
        text: "Код 4821 уже введён. Нажмите «Подтвердить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Подтвердить».",
        success: "Заказ оплачен.",
        voice: "Нажмите «Подтвердить» внизу."
      }
    ],
    "market-ozon-search": [
      {
        screen: "moz_home",
        target: "x_search",
        rail: "Поиск",
        title: "Найдите товар",
        text: "Нажмите на строку «Искать на Ozon» вверху.",
        hint: "Белая строка под названием.",
        wrong: "Нужна строка поиска вверху.",
        success: "Вы ввели «термометр» — вот результаты.",
        voice: "Нажмите на строку поиска вверху экрана."
      },
      {
        screen: "moz_results",
        target: "x_item",
        rail: "Термометр",
        title: "Откройте товар",
        text: "Нажмите на «Термометр электронный» — 2 300 ₸.",
        hint: "Первая строка.",
        wrong: "Нужен электронный термометр.",
        success: "Открылась карточка товара.",
        voice: "Нажмите на электронный термометр."
      },
      {
        screen: "moz_product",
        type: "choice",
        rail: "Сравнить",
        title: "Электронный или ртутный",
        text: "Ртутный термометр дешевле — 1 100 ₸. Почему лучше электронный?",
        hint: "Подумайте о безопасности дома.",
        success: "Верно.",
        voice: "Почему электронный термометр лучше ртутного?",
        choices: [
          { label: "Ртутный легко разбить, а ртуть опасна", ok: true, feedback: "Верно. Электронный безопаснее, особенно если дома внуки." },
          { label: "Они ничем не отличаются — берите дешёвый", ok: false, feedback: "Отличаются: разбитый ртутный термометр опасен." },
          { label: "Электронный показывает погоду", ok: false, feedback: "Нет, он только меряет температуру тела, но безопаснее." }
        ]
      },
      {
        screen: "moz_product",
        target: "x_cart",
        rail: "В корзину",
        title: "Добавьте в корзину",
        text: "Нажмите «В корзину» внизу.",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «В корзину».",
        success: "Товар в корзине.",
        voice: "Нажмите «В корзину» внизу."
      }
    ],
    "market-ozon-sellers": [
      {
        screen: "moz_product",
        target: "x_seller",
        rail: "Продавец",
        title: "Посмотрите продавцов",
        text: "Этот термометр продают три продавца. Нажмите строку «Продавец: Медтехника».",
        hint: "Строка под ценой.",
        wrong: "Нужна строка с продавцом.",
        success: "Открылся список продавцов.",
        voice: "Нажмите строку с продавцом под ценой."
      },
      {
        screen: "moz_sellers",
        type: "choice",
        rail: "Выбор",
        title: "Какого продавца выбрать",
        text: "У кого лучше купить?",
        hint: "Смотрите на рейтинг, срок работы и условия возврата.",
        success: "Надёжный выбор.",
        voice: "У какого продавца лучше купить?",
        choices: [
          { label: "Медтехника: высокий рейтинг, давно на Ozon, понятный возврат", ok: true, feedback: "Верно. Переплата не нужна, а риск меньше." },
          { label: "Новый продавец — дешевле всех", ok: false, feedback: "Без отзывов и условий возврата рискованно, а экономия всего 400 ₸." },
          { label: "Любой — разницы нет", ok: false, feedback: "Разница есть: рейтинг и условия возврата." }
        ]
      },
      {
        screen: "moz_sellers",
        target: "x_seller_pick",
        rail: "Медтехника",
        title: "Выберите продавца",
        text: "Нажмите «Медтехника».",
        hint: "Первая строка.",
        wrong: "Нужна строка «Медтехника».",
        success: "Продавец выбран.",
        voice: "Нажмите на Медтехнику."
      }
    ],
    "market-ozon-pickup": [
      {
        screen: "moz_delivery",
        target: "x_deliv",
        rail: "Абая, 15",
        title: "Выберите пункт выдачи",
        text: "Ближайший пункт — Абая, 15, сегодня, бесплатно. Нажмите на него.",
        hint: "Первая строка.",
        wrong: "Нужен пункт выдачи на Абая, 15.",
        success: "Пункт выдачи выбран.",
        voice: "Нажмите на пункт выдачи на Абая."
      },
      {
        screen: "moz_delivery",
        type: "choice",
        rail: "Получить",
        title: "Что нужно, чтобы забрать",
        text: "Что понадобится, чтобы забрать заказ в пункте выдачи?",
        hint: "Для выдачи есть отдельный код.",
        success: "Верно.",
        voice: "Что понадобится, чтобы забрать заказ?",
        choices: [
          { label: "Код получения из приложения Ozon", ok: true, feedback: "Верно. Его показывают сотруднику пункта. Иногда просят и документ." },
          { label: "Ничего — достаточно назвать фамилию", ok: false, feedback: "Без кода получения заказ не выдадут." },
          { label: "Код из SMS, которым вы подтверждали оплату", ok: false, feedback: "Код оплаты никому не называют. Для выдачи — отдельный код в приложении." }
        ]
      },
      {
        screen: "moz_delivery",
        target: "x_continue",
        rail: "Продолжить",
        title: "Продолжите",
        text: "Нажмите «Продолжить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Продолжить».",
        success: "Пункт выдачи сохранён.",
        voice: "Нажмите «Продолжить» внизу."
      }
    ],
    "market-ozon-checkout": [
      {
        screen: "moz_cart",
        target: "x_checkout",
        rail: "Оформить",
        title: "Перейдите к оформлению",
        text: "Нажмите «Перейти к оформлению».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Перейти к оформлению».",
        success: "Открылась проверка данных.",
        voice: "Нажмите кнопку внизу."
      },
      {
        screen: "moz_checkout",
        type: "choice",
        rail: "Страховка",
        title: "Нужна ли страховка",
        text: "Внизу пункт «Страховка посылки +150 ₸». Нужна ли она?",
        hint: "Прочитайте мелкий текст под пунктом.",
        success: "Правильно.",
        voice: "Нужна ли страховка посылки за сто пятьдесят тенге?",
        choices: [
          { label: "Необязательна: ставлю галочку, только если сам решил", ok: true, feedback: "Верно. Дополнительные услуги проверяйте перед подтверждением." },
          { label: "Обязательна — без неё не привезут", ok: false, feedback: "Нет, это необязательная услуга." },
          { label: "Её нельзя убрать", ok: false, feedback: "Её можно не выбирать — галочка не стоит." }
        ]
      },
      {
        screen: "moz_checkout",
        target: "x_confirm",
        rail: "Подтвердить",
        title: "Подтвердите заказ",
        text: "Получатель, телефон и пункт выдачи верны. Нажмите «Подтвердить заказ».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Подтвердить заказ».",
        success: "Заказ подтверждён.",
        voice: "Нажмите «Подтвердить заказ»."
      }
    ],
    "market-ozon-pay": [
      {
        screen: "moz_payment",
        target: "x_pay",
        rail: "Оплатить",
        title: "Проверьте и оплатите",
        text: "К оплате 2 300 ₸ картой •••• 4412. Нажмите «Оплатить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Оплатить».",
        success: "Пришёл код из SMS.",
        voice: "Проверьте сумму и нажмите «Оплатить»."
      },
      {
        screen: "moz_code",
        type: "choice",
        rail: "Код",
        title: "Кому можно назвать код",
        text: "Кому можно назвать код из SMS для оплаты?",
        hint: "Код подтверждает списание денег.",
        success: "Верно.",
        voice: "Кому можно назвать код из SMS для оплаты?",
        choices: [
          { label: "Никому — только ввести здесь самому", ok: true, feedback: "Верно. Сотрудники Ozon и пункта выдачи его не спрашивают." },
          { label: "Сотруднику пункта выдачи", ok: false, feedback: "Для выдачи есть другой код. Код оплаты — никому." },
          { label: "Тому, кто позвонит из «поддержки»", ok: false, feedback: "Это мошенники. Поддержка код не спрашивает." }
        ]
      },
      {
        screen: "moz_code",
        target: "x_code_ok",
        rail: "Подтвердить",
        title: "Подтвердите оплату",
        text: "Код уже введён. Нажмите «Подтвердить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Подтвердить».",
        success: "Заказ оплачен.",
        voice: "Нажмите «Подтвердить» внизу."
      }
    ],
    "market-temu-search": [
      {
        screen: "mte_home",
        target: "x_search",
        rail: "Поиск",
        title: "Найдите товар",
        text: "Нажмите на строку «Поиск на Temu» вверху.",
        hint: "Белая строка под названием.",
        wrong: "Нужна строка поиска вверху.",
        success: "Вы ввели «наушники» — вот результаты.",
        voice: "Нажмите на строку поиска вверху экрана."
      },
      {
        screen: "mte_results",
        target: "x_item",
        rail: "Наушники",
        title: "Откройте товар",
        text: "Нажмите на «Наушники беспроводные» — 3 400 ₸.",
        hint: "Первая строка.",
        wrong: "Нужны беспроводные наушники.",
        success: "Открылась карточка товара.",
        voice: "Нажмите на беспроводные наушники."
      },
      {
        screen: "mte_product",
        type: "choice",
        rail: "Скидка",
        title: "Скидка 72% и таймер",
        text: "«Было 12 000 ₸, стало 3 400 ₸», и таймер: скидка закончится через 2 часа. Как к этому отнестись?",
        hint: "Таймер нужен, чтобы вы поторопились.",
        success: "Спокойный подход.",
        voice: "Огромная скидка и таймер. Как к этому отнестись?",
        choices: [
          { label: "Спокойно: сначала почитать отзывы, потом решать", ok: true, feedback: "Верно. Зачёркнутая цена часто завышена, а таймер подгоняет." },
          { label: "Срочно брать, пока скидка", ok: false, feedback: "Спешка — враг покупки. Сначала отзывы." },
          { label: "Заказать сразу три штуки", ok: false, feedback: "Сначала убедитесь, что товар хороший, — по отзывам." }
        ]
      },
      {
        screen: "mte_product",
        target: "x_cart",
        rail: "В корзину",
        title: "Добавьте в корзину",
        text: "Нажмите «В корзину» внизу.",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «В корзину».",
        success: "Товар в корзине.",
        voice: "Нажмите «В корзину» внизу."
      }
    ],
    "market-temu-seller": [
      {
        screen: "mte_product",
        target: "x_reviews",
        rail: "Отзывы",
        title: "Откройте отзывы",
        text: "Нажмите строку с рейтингом «★ 4,7 · 3 210 отзывов».",
        hint: "Вторая строка под ценой.",
        wrong: "Нужна строка с отзывами.",
        success: "Открылись отзывы.",
        voice: "Нажмите строку с отзывами."
      },
      {
        screen: "mte_reviews",
        type: "choice",
        rail: "Каким верить",
        title: "Каким отзывам доверять",
        text: "Каким отзывам стоит доверять больше?",
        hint: "Подробный отзыв с фото сложнее подделать.",
        success: "Верно.",
        voice: "Каким отзывам стоит доверять больше?",
        choices: [
          { label: "Подробным, с фото: как у Айгуль и Марата", ok: true, feedback: "Верно. Из них видно и плюсы, и минусы товара." },
          { label: "Коротким «Супер!!! Всем советую!!!»", ok: false, feedback: "Такие отзывы часто пишут за вознаграждение." },
          { label: "Только средней оценке в звёздах", ok: false, feedback: "Оценку можно накрутить. Читайте подробные отзывы." }
        ]
      },
      {
        screen: "mte_reviews",
        target: "x_cart",
        rail: "В корзину",
        title: "Добавьте в корзину",
        text: "Отзывы хорошие. Нажмите «В корзину».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «В корзину».",
        success: "Товар в корзине.",
        voice: "Нажмите «В корзину» внизу."
      }
    ],
    "market-temu-delivery": [
      {
        screen: "mte_delivery",
        target: "x_deliv",
        rail: "Курьер",
        title: "Выберите доставку",
        text: "Курьер — 15–25 дней, бесплатно. Нажмите «Курьер».",
        hint: "Первая строка.",
        wrong: "Нужна строка «Курьер».",
        success: "Доставка выбрана.",
        voice: "Нажмите строку «Курьер»."
      },
      {
        screen: "mte_delivery",
        type: "choice",
        rail: "SMS",
        title: "SMS о «задержке посылки»",
        text: "Через неделю приходит SMS: «Посылка задержана на таможне, оплатите пошлину 2 990 ₸ по ссылке». Что делать?",
        hint: "Статус посылки смотрят в приложении магазина.",
        success: "Вы не попались.",
        voice: "Пришло SMS: оплатите пошлину по ссылке, иначе посылку не отдадут. Что делать?",
        choices: [
          { label: "Не платить по ссылке, проверить статус в приложении Temu", ok: true, feedback: "Верно. Такие SMS рассылают мошенники." },
          { label: "Оплатить, чтобы не потерять посылку", ok: false, feedback: "Деньги уйдут мошенникам. Проверьте статус в приложении." },
          { label: "Позвонить по номеру из SMS", ok: false, feedback: "Номер тоже мошеннический. Смотрите только приложение." }
        ]
      },
      {
        screen: "mte_delivery",
        target: "x_continue",
        rail: "Продолжить",
        title: "Продолжите",
        text: "Нажмите «Продолжить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Продолжить».",
        success: "Способ доставки сохранён.",
        voice: "Нажмите «Продолжить» внизу."
      }
    ],
    "market-temu-checkout": [
      {
        screen: "mte_cart",
        target: "x_checkout",
        rail: "Оформить",
        title: "Перейдите к оформлению",
        text: "Нажмите «Оформить заказ».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Оформить заказ».",
        success: "Открылась проверка данных.",
        voice: "Нажмите «Оформить заказ» внизу."
      },
      {
        screen: "mte_checkout",
        type: "choice",
        rail: "Квартира",
        title: "В адресе нет квартиры",
        text: "В адресе красным: «Квартира — не указана». Что делать?",
        hint: "Посылка едет издалека, адрес должен быть полным.",
        success: "Правильно.",
        voice: "В адресе не указана квартира. Что делать?",
        choices: [
          { label: "Дописать номер квартиры до подтверждения", ok: true, feedback: "Верно. Иначе курьер может не найти вас." },
          { label: "Ничего — курьер позвонит", ok: false, feedback: "Может и не позвонить. Допишите квартиру сейчас." },
          { label: "Указать адрес соседа", ok: false, feedback: "Указывайте свой полный адрес." }
        ]
      },
      {
        screen: "mte_checkout",
        target: "x_confirm",
        rail: "Подтвердить",
        title: "Подтвердите заказ",
        text: "Квартиру дописали. Нажмите «Подтвердить заказ».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Подтвердить заказ».",
        success: "Заказ оформлен.",
        voice: "Нажмите «Подтвердить заказ»."
      }
    ],
    "market-temu-pay": [
      {
        screen: "mte_payment",
        target: "x_pay",
        rail: "Оплатить",
        title: "Проверьте и оплатите",
        text: "К оплате 3 400 ₸ картой •••• 4412. Нажмите «Оплатить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Оплатить».",
        success: "Пришёл код из SMS.",
        voice: "Проверьте сумму и нажмите «Оплатить»."
      },
      {
        screen: "mte_code",
        target: "x_code_ok",
        rail: "Подтвердить",
        title: "Подтвердите оплату",
        text: "Код 4821 уже введён. Никому его не называйте. Нажмите «Подтвердить».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Подтвердить».",
        success: "Заказ оплачен.",
        voice: "Нажмите «Подтвердить» внизу."
      },
      {
        screen: "mte_paid",
        target: "x_track",
        rail: "Отследить",
        title: "Откройте отслеживание",
        text: "Заказ оплачен. Нажмите «Отследить заказ».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Отследить заказ».",
        success: "Открылось отслеживание.",
        voice: "Нажмите «Отследить заказ»."
      },
      {
        screen: "mte_track",
        type: "choice",
        rail: "Где смотреть",
        title: "Где смотреть, где посылка",
        text: "Где проверять, где сейчас посылка?",
        hint: "Подсказка внизу экрана.",
        success: "Верно.",
        voice: "Где проверять, где сейчас посылка?",
        choices: [
          { label: "Только в приложении Temu, в «Отслеживании»", ok: true, feedback: "Верно. Ссылкам из SMS и звонкам про «доплату» не верьте." },
          { label: "По ссылкам из SMS", ok: false, feedback: "Такие ссылки часто мошеннические." },
          { label: "Позвонить на таможню по номеру из SMS", ok: false, feedback: "Номер из SMS может быть мошенническим. Смотрите приложение." }
        ]
      }
    ]
  };
  all.forEach(function (lesson) {
    var steps = ownScripts[lesson.id];
    if (!steps) return;
    lesson.uiGroup = "market-own";
    lesson.ui = { theme: lesson.ui && lesson.ui.theme };
    lesson.steps = JSON.parse(JSON.stringify(steps));
  });
  var returnLesson = {
    id: "market-kaspi-return",
    order: 40.5,
    app: "generic",
    appLabel: "Kaspi Магазин",
    uiGroup: "market-own",
    ui: {
      theme: "market-kaspi"
    },
    category: "market",
    title: "Kaspi: вернуть товар с браком",
    short: "Оформить возврат в приложении: причина, фото, пункт приёма.",
    goal: "Найти заказ, оформить возврат бракованного товара с правдивой причиной и фото и выбрать, куда сдать.",
    level: "Новичок",
    duration: "5 минут",
    free: false,
    checked: "11 ноября 2026",
    intro: "Учебные экраны по мотивам Kaspi Магазина. Заказ, продавец и суммы вымышленные — ничего не вернётся по-настоящему.",
    steps: [
      {
        screen: "mka_home",
        target: "x_orders",
        rail: "Заказы",
        title: "Откройте «Заказы»",
        text: "Купленный чайник сломался на третий день. Нажмите «Заказы» внизу справа.",
        hint: "Последняя вкладка внизу.",
        wrong: "Нужна вкладка «Заказы».",
        success: "Открылся список заказов.",
        voice: "Нажмите «Заказы» внизу справа."
      },
      {
        screen: "mka_orders",
        target: "x_order",
        rail: "Чайник",
        title: "Откройте заказ",
        text: "Нажмите на заказ «Электрочайник 1,7 л».",
        hint: "Первая строка.",
        wrong: "Нужен заказ с чайником.",
        success: "Открылся заказ.",
        voice: "Нажмите на заказ с электрочайником."
      },
      {
        screen: "mka_order",
        target: "x_return",
        rail: "Вернуть",
        title: "Начните возврат",
        text: "Нажмите «Вернуть товар» внизу.",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Вернуть товар».",
        success: "Открылся выбор причины.",
        voice: "Нажмите «Вернуть товар» внизу."
      },
      {
        screen: "mka_return",
        type: "choice",
        rail: "Причина",
        title: "Как описать причину",
        text: "Чайник не включается. Что выбрать и что приложить?",
        hint: "Причина должна быть правдивой.",
        success: "Правильно.",
        voice: "Чайник не включается. Что выбрать и что приложить?",
        choices: [
          { label: "«Не работает, брак» и фото или видео поломки", ok: true, feedback: "Верно. По фото продавец быстрее поймёт, в чём дело." },
          { label: "«Не подошёл» — так проще", ok: false, feedback: "Указывайте правду: здесь брак. По браку продавец проверяет товар и возвращает деньги." },
          { label: "Ничего не писать — сами разберутся", ok: false, feedback: "Без причины и фото возврат затянется." }
        ]
      },
      {
        screen: "mka_return",
        target: "x_reason",
        rail: "Брак",
        title: "Выберите причину",
        text: "Нажмите «Не работает, брак».",
        hint: "Первая строка.",
        wrong: "Нужна строка «Не работает, брак».",
        success: "Причина выбрана, фото приложено.",
        voice: "Нажмите «Не работает, брак»."
      },
      {
        screen: "mka_return_way",
        target: "x_return_go",
        rail: "Оформить",
        title: "Оформите возврат",
        text: "Сдать можно в пункт приёма на Толе би, 59 — бесплатно. Нажмите «Оформить возврат».",
        hint: "Кнопка внизу экрана.",
        wrong: "Нужна кнопка «Оформить возврат».",
        success: "Возврат оформлен.",
        voice: "Нажмите «Оформить возврат» внизу."
      }
    ],
    done: {
      title: "Возврат оформлен",
      text: "Вы нашли заказ, указали правдивую причину с фото и выбрали пункт приёма.",
      rows: [
        ["Товар", "электрочайник"],
        ["Причина", "брак, фото приложено"],
        ["Сдать", "пункт приёма, Толе би, 59"]
      ],
      tip: "Храните коробку и чек, пока товар новый. Если продавец отказал — напишите в поддержку магазина в приложении."
    },
    next: "market-ozon-search"
  };
  var kaspiPay = all.findIndex(function (l) { return l.id === "market-kaspi-pay"; });
  if (kaspiPay !== -1) { returnLesson.next = all[kaspiPay].next; all[kaspiPay].next = "market-kaspi-return"; all.splice(kaspiPay + 1, 0, returnLesson); }
  else all.push(returnLesson);

  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(all);
})();