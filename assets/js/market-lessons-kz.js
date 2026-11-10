/* Kazakh marketplace lessons on the shared app screens. */
(function () {
  "use strict";

  var modules = window.TANYMIO_MARKET_CONFIGS || [];

  var titles = {
    "market-kaspi-search": "Kaspi: тауар іздеу және баға",
    "market-kaspi-pharmacy": "Kaspi: дәріхана және қолжетімділік",
    "market-kaspi-cart": "Kaspi: себет және қорытынды сома",
    "market-kaspi-delivery": "Kaspi: жеткізу немесе өзі алу",
    "market-kaspi-pay": "Kaspi: төлем және код",
    "market-ozon-search": "Ozon: іздеу және баға",
    "market-ozon-sellers": "Ozon: сатушы және рейтинг",
    "market-ozon-pickup": "Ozon: беру пункті",
    "market-ozon-checkout": "Ozon: тапсырысты рәсімдеу",
    "market-ozon-pay": "Ozon: төлем және код",
    "market-wb-search": "Wildberries: іздеу және сүзгілер",
    "market-wb-size": "Wildberries: өлшем",
    "market-wb-cart": "Wildberries: себет және жеңілдік",
    "market-wb-pickup": "Wildberries: беру пункті және киіп көру",
    "market-wb-pay": "Wildberries: төлем және қайтару",
    "market-temu-search": "Temu: іздеу және тауар",
    "market-temu-seller": "Temu: сатушы және пікірлер",
    "market-temu-delivery": "Temu: жеткізу және мерзім",
    "market-temu-checkout": "Temu: рәсімдеу және мекенжай",
    "market-temu-pay": "Temu: төлем және бақылау"
  };

  function step(kind, lesson, mod) {
    if (kind === "home") {
      return {
        screen: "a_home", target: "home_open", rail: lesson.home.label,
        title: "Бөлімді ашыңыз",
        text: mod.brand + " қосымшасында «" + lesson.home.label + "» бөлімін басыңыз.",
        hint: "Бұл — экранның жоғарғы жағындағы түйме.",
        wrong: "Қазір «" + lesson.home.label + "» бөлімі керек.",
        success: "Бөлім ашылды.",
        voice: lesson.home.label + " бөлімін басыңыз."
      };
    }
    if (kind === "list") {
      return {
        screen: "a_list", target: "list_pick", rail: lesson.list.items[0][0],
        title: "Керекті таңдаңыз",
        text: "«" + lesson.list.items[0][0] + "» — " + lesson.list.items[0][1] + " жолын басыңыз.",
        hint: "Бұл — тізімнің бірінші жолы.",
        wrong: "Бірінші жол керек — «" + lesson.list.items[0][0] + "».",
        success: "Таңдау жасалды.",
        voice: lesson.list.items[0][0] + " таңдаңыз."
      };
    }
    if (kind === "confirm") {
      return {
        screen: "a_confirm", target: "confirm_go", rail: "Тексеру",
        title: "Деректерді тексеріңіз",
        text: "Деректерді салыстырып, «" + lesson.confirm.cta + "» түймесін басыңыз.",
        hint: "Растау түймесі — экранның ең төменінде.",
        wrong: "Төмендегі «" + lesson.confirm.cta + "» түймесін басыңыз.",
        success: "Әрекет расталды.",
        voice: "Деректерді тексеріп, " + lesson.confirm.cta + " түймесін басыңыз."
      };
    }
    return {
      screen: "a_code", target: "code_ok", rail: "Код",
      title: "Кодты енгізіңіз",
      text: "4821 кодын енгізіп, «" + lesson.code.cta + "» түймесін басыңыз.",
      hint: "Код SMS-пен келеді. Оны ешкімге айтпаңыз.",
      wrong: "4821 кодын енгізіп, «" + lesson.code.cta + "» басыңыз.",
      success: "Код қабылданды.",
      voice: "4821 кодын енгізіп, растаңыз."
    };
  }

  function build(mod, lesson, index) {
    var id = mod.prefix + "-" + lesson.slug;
    var ui = {
      brand: mod.brand, letter: mod.letter, city: "Алматы · оқу экраны", theme: mod.theme || "market",
      homeLabel: lesson.home.label, homeValue: lesson.home.value, homeNote: lesson.home.note,
      homeAmount: lesson.home.amount, homeHint: "Бұл оқу экраны. Нақты тапсырыс орындалмайды.",
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
    var title = titles[id] || lesson.title;
    return {
      id: id,
      order: 40 + index,
      app: "generic",
      appLabel: mod.brand,
      uiGroup: "generic",
      ui: ui,
      category: "market",
      title: title,
      short: "Қадамдарды өзіңіз орындап, қосымшадағы әрекетті үйренесіз.",
      goal: title + " — қадамдарды түсініп, өзіңіз орындау.",
      level: "Жаңа бастаған",
      duration: "4 минут",
      free: false,
      checked: "10 қараша 2026",
      intro: "Оқу сценарийі. Нақты тапсырыс орындалмайды.",
      steps: flow.map(function (kind) { return step(kind, lesson, mod); }),
      done: {
        title: "Дайын: " + title,
        text: "Сіз қадамдарды өзіңіз орындадыңыз. Бұл — оқу жаттығуы.",
        rows: [["Қосымша", mod.brand], ["Нәтиже", "Оқу сценарийі орындалды"]],
        tip: "Нақты тапсырыс алдында сатушыны, бағаны және жеткізуді тексеріңіз."
      },
      next: "kaspi-shop"
    };
  }

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
        "rail": "Іздеу",
        "title": "Тауарды табыңыз",
        "text": "Экранның жоғарғы жағындағы «Найти на Wildberries» жолын басыңыз.",
        "hint": "Іздеу жолы — логотиптің астында.",
        "wrong": "Жоғарыдағы іздеу жолын басыңыз.",
        "success": "Іздеу ашылды.",
        "voice": "Экранның жоғарғы жағындағы іздеу жолын басыңыз."
      },
      {
        "screen": "wb_results",
        "target": "w_item",
        "rail": "Куртка, 48",
        "title": "Тауарды таңдаңыз",
        "text": "«Куртка, 48» — 8 900 ₸ карточкасын басыңыз.",
        "hint": "Бұл — тізімдегі бірінші карточка.",
        "wrong": "Бірінші карточка керек — «Куртка, 48».",
        "success": "Тауар карточкасы ашылды.",
        "voice": "Қырық сегізінші өлшемдегі куртка карточкасын басыңыз."
      },
      {
        "screen": "wb_product",
        "target": "w_size",
        "rail": "48 өлшем",
        "title": "Өлшемді таңдаңыз",
        "text": "48 өлшемін басыңыз: кесте бойынша ол кеуде көлемі 96–100 см болғанда келеді.",
        "hint": "Өлшем түймелері — бағаның астында.",
        "wrong": "«Размер» жолындағы «48» түймесін басыңыз.",
        "success": "48 өлшемі таңдалды.",
        "voice": "Қырық сегіз өлшемін басыңыз."
      },
      {
        "screen": "wb_product",
        "target": "w_cart",
        "rail": "В корзину",
        "title": "Себетке салыңыз",
        "text": "48 өлшемі таңдалғанын тексеріп, төмендегі «В корзину» түймесін басыңыз.",
        "hint": "Түйме — экранның ең төменінде.",
        "wrong": "Төмендегі «В корзину» түймесін басыңыз.",
        "success": "Тауар себетте.",
        "voice": "Өлшемді тексеріп, «В корзину» түймесін басыңыз."
      }
    ],
    "market-wb-cart": [
      {
        "screen": "wb_product",
        "target": "w_cart",
        "rail": "В корзину",
        "title": "Тауарды қосыңыз",
        "text": "Тауар карточкасының төменіндегі «В корзину» түймесін басыңыз.",
        "hint": "Түйме — экранның ең төменінде.",
        "wrong": "Төмендегі «В корзину» түймесін басыңыз.",
        "success": "Тауар себетте.",
        "voice": "Төмендегі «В корзину» түймесін басыңыз."
      },
      {
        "screen": "wb_cart",
        "target": "w_checkout",
        "rail": "Итого",
        "title": "Соманы тексеріңіз",
        "text": "Бағасы 8 900 ₸, жеңілдік −1 000 ₸, барлығы 7 900 ₸. Бәрі дұрыс болса, «Оформить заказ» түймесін басыңыз.",
        "hint": "Қорытынды — «Итого» жолында, түйме — төменде.",
        "wrong": "Төмендегі «Оформить заказ» түймесін басыңыз.",
        "success": "Сома тексерілді.",
        "voice": "Жеңілдік пен қорытынды соманы тексеріңіз: жеті мың тоғыз жүз теңге. Содан кейін «Оформить заказ» түймесін басыңыз."
      }
    ],
    "market-wb-pickup": [
      {
        "screen": "wb_cart",
        "target": "w_checkout",
        "rail": "Оформить",
        "title": "Тапсырысты рәсімдеңіз",
        "text": "Себетте «Оформить заказ» түймесін басыңыз.",
        "hint": "Түйме — себеттің төменінде.",
        "wrong": "Төмендегі «Оформить заказ» түймесін басыңыз.",
        "success": "Рәсімдеу ашылды.",
        "voice": "Себетте «Оформить заказ» түймесін басыңыз."
      },
      {
        "screen": "wb_delivery",
        "target": "w_pickup",
        "rail": "Толе би, 59",
        "title": "Беру пунктін тексеріңіз",
        "text": "«Толе би, 59» мекенжайын басыңыз. Бұл пунктте затты киіп көруге болады.",
        "hint": "Мекенжай — «Пункт выдачи» деген жазудың астындағы ақ жақтауда.",
        "wrong": "Беру пунктінің мекенжайын басыңыз.",
        "success": "Беру пункті таңдалды.",
        "voice": "Беру пунктінің мекенжайын басыңыз: Төле би, елу тоғыз. Онда затты киіп көруге болады."
      },
      {
        "screen": "wb_delivery",
        "target": "w_pay",
        "rail": "Мерзім",
        "title": "Мерзімді тексеріңіз",
        "text": "Тапсырыс бүгін келеді, жеткізу 0 ₸. «Перейти к оплате» түймесін басыңыз.",
        "hint": "Түйме — экранның ең төменінде.",
        "wrong": "Төмендегі «Перейти к оплате» түймесін басыңыз.",
        "success": "Мерзім тексерілді.",
        "voice": "Жеткізу мерзімі мен құнын тексеріп, «Перейти к оплате» түймесін басыңыз."
      }
    ],
    "market-wb-pay": [
      {
        "screen": "wb_delivery",
        "target": "w_pay",
        "rail": "Төлемге",
        "title": "Төлемге өтіңіз",
        "text": "Мекенжайды тексеріп, «Перейти к оплате» түймесін басыңыз.",
        "hint": "Түйме — экранның ең төменінде.",
        "wrong": "Төмендегі «Перейти к оплате» түймесін басыңыз.",
        "success": "Төлем беті ашылды.",
        "voice": "Мекенжайды тексеріп, «Перейти к оплате» түймесін басыңыз."
      },
      {
        "screen": "wb_payment",
        "target": "w_pay",
        "rail": "Карта",
        "title": "Картаны таңдаңыз",
        "text": "«Карта •••• 4412» жолын басыңыз.",
        "hint": "Төлем тәсілдері — соманың астында.",
        "wrong": "Картасы бар жолды басыңыз.",
        "success": "Карта таңдалды.",
        "voice": "Картаңыз бар жолды басыңыз."
      },
      {
        "screen": "wb_payment",
        "target": "w_code",
        "rail": "Оплатить",
        "title": "Тапсырысты төлеңіз",
        "text": "7 900 ₸ сомасын тексеріп, «Оплатить» түймесін басыңыз.",
        "hint": "Түйме — экранның ең төменінде.",
        "wrong": "Төмендегі «Оплатить» түймесін басыңыз.",
        "success": "Код сұралды.",
        "voice": "Соманы тексеріп, «Оплатить» түймесін басыңыз."
      },
      {
        "screen": "wb_code",
        "target": "w_code_ok",
        "rail": "Код",
        "title": "Кодпен растаңыз",
        "text": "SMS-тегі 4821 коды енгізілген. «Подтвердить» түймесін басыңыз. Бұл кодты ешкімге айтпаңыз.",
        "hint": "Код нөміріңізге SMS арқылы келеді.",
        "wrong": "Төмендегі «Подтвердить» түймесін басыңыз.",
        "success": "Төлем расталды.",
        "voice": "СМС-тегі код енгізілді. «Подтвердить» түймесін басыңыз. Бұл кодты ешкімге айтпаңыз."
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