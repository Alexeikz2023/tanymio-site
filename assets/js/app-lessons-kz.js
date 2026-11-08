/* Kazakh build of the app modules. Uses the shared configs for app UI labels,
   but explains every step in Kazakh. */
(function () {
  "use strict";

  var apps = window.TANYMIO_APP_CONFIGS || [];

  var titles = {
    "bank-halyk": "Halyk Bank-те аударым",
    "bank-bcc": "БЦК-де аударым",
    "bank-freedom": "Freedom Bank-те аударым",
    "telegram": "Telegram: немереге жазу",
    "instagram": "Instagram: сурет жариялау",
    "tiktok": "TikTok: бейне жазу",
    "kaspi-shop": "Kaspi Магазин: дәрі тапсыру",
    "ozon": "Ozon: термометр тапсыру",
    "wildberries": "Wildberries: куртка тапсыру",
    "temu": "Temu: құлаққап тапсыру",
    "yandex-delivery": "Яндекс Доставка: құжат жіберу",
    "wolt": "Wolt: пицца тапсыру",
    "glovo": "Glovo: дәріханадан жеткізу",
    "magnum": "Magnum: азық-түлік тапсыру",
    "egov": "Egov: зейнетақы анықтамасы",
    "eotinish": "Eotinish: өтініш жіберу",
    "kaspi-gov": "Kaspi: айыппұлды тексеру",
    "halyk-gov": "Халык: анықтамаға өтініш"
  };

  function stepFor(kind, app) {
    if (app.bank && kind === "home") {
      return {
        screen: (app.prefix || "b") + "_home", target: (app.prefix || "b") + "_home_open", rail: app.home.label,
        title: "Бөлімді ашыңыз",
        text: app.brand + " қосымшасында «" + app.home.label + "» бөлімін басыңыз.",
        hint: "Бұл — басты экрандағы үлкен түйме.",
        wrong: "Қазір «" + app.home.label + "» бөлімі керек.",
        success: "Бөлім ашылды.",
        voice: app.home.label + " бөлімін басыңыз."
      };
    }
    if (app.bank && kind === "list") {
      return {
        screen: (app.prefix || "b") + "_list", target: (app.prefix || "b") + "_list_pick", rail: app.list.items[0][0],
        title: "Алушыны таңдаңыз",
        text: "«" + app.list.items[0][0] + "» — " + app.list.items[0][1] + " жолын басыңыз.",
        hint: "Бұл — тізімнің бірінші жолы.",
        wrong: "Бірінші алушы керек — «" + app.list.items[0][0] + "».",
        success: "Алушы таңдалды.",
        voice: app.list.items[0][0] + " алушысын таңдаңыз."
      };
    }
    if (app.bank && kind === "confirm") {
      return {
        screen: (app.prefix || "b") + "_confirm", target: (app.prefix || "b") + "_confirm_go", rail: "Тексеру",
        title: "Аударымды тексеріңіз",
        text: "Алушы мен соманы тексеріп, төмендегі аударым түймесін басыңыз.",
        hint: "Аударым түймесі — ең төменде.",
        wrong: "Төмендегі аударым түймесін басыңыз.",
        success: "Аударым расталды.",
        voice: "Деректерді тексеріп, аударым түймесін басыңыз."
      };
    }
    if (app.bank) {
      return {
        screen: (app.prefix || "b") + "_code", target: (app.prefix || "b") + "_code_ok", rail: "Код",
        title: "Кодты енгізіңіз",
        text: "4821 кодын енгізіп, «Подтвердить» түймесін басыңыз.",
        hint: "Код SMS-пен келеді. Оны бөгде адамға айтпаңыз.",
        wrong: "4821 кодын енгізіп, «Подтвердить» түймесін басыңыз.",
        success: "Код қабылданды.",
        voice: "4821 кодын енгізіп, растаңыз."
      };
    }
    if (kind === "home") {
      return {
        screen: "a_home", target: "home_open", rail: app.home.label,
        title: "Бөлімді ашыңыз",
        text: app.brand + " қосымшасында «" + app.home.label + "» бөлімін басыңыз.",
        hint: "Бұл — экранның жоғарғы жағындағы түйме.",
        wrong: "Қазір «" + app.home.label + "» бөлімі керек.",
        success: "Бөлім ашылды.",
        voice: app.home.label + " бөлімін басыңыз."
      };
    }
    if (kind === "list") {
      return {
        screen: "a_list", target: "list_pick", rail: app.list.items[0][0],
        title: "Керекті таңдаңыз",
        text: "«" + app.list.items[0][0] + "» — " + app.list.items[0][1] + " жолын басыңыз.",
        hint: "Бұл — тізімнің бірінші жолы.",
        wrong: "Бірінші жол керек — «" + app.list.items[0][0] + "».",
        success: "Таңдау жасалды.",
        voice: app.list.items[0][0] + " таңдаңыз."
      };
    }
    if (kind === "confirm") {
      return {
        screen: "a_confirm", target: "confirm_go", rail: "Тексеру",
        title: "Деректерді тексеріңіз",
        text: "Деректерді салыстырып, төмендегі «" + app.confirm.cta + "» түймесін басыңыз.",
        hint: "Растау түймесі — экранның ең төменінде.",
        wrong: "Төмендегі «" + app.confirm.cta + "» түймесін басыңыз.",
        success: "Әрекет расталды.",
        voice: "Деректерді тексеріп, " + app.confirm.cta + " түймесін басыңыз."
      };
    }
    if (kind === "code") {
      return {
        screen: "a_code", target: "code_ok", rail: "Код",
        title: "Кодты енгізіңіз",
        text: "4821 кодын енгізіп, «" + app.code.cta + "» түймесін басыңыз.",
        hint: "Код SMS-пен келеді. Оны ешкімге айтпаңыз.",
        wrong: "4821 кодын енгізіп, «" + app.code.cta + "» басыңыз.",
        success: "Код қабылданды.",
        voice: "4821 кодын енгізіп, растаңыз."
      };
    }
    return {
      screen: "a_chat", target: "chat_send", rail: "Хабарлама",
      title: "Хабарлама жіберіңіз",
      text: "«" + app.chat.quick + "» дайын фразасын басыңыз.",
      hint: "Дайын фраза — хабарламалардың астындағы ашық түйме.",
      wrong: "«" + app.chat.quick + "» фразасын таңдаңыз.",
      success: "Хабарлама жіберілді.",
      voice: app.chat.quick + " фразасын басыңыз."
    };
  }

  function build(app, index) {
    var ui = {
      brand: app.brand, letter: app.letter, city: "Алматы · оқу экраны", theme: app.theme,
      homeLabel: app.home.label, homeValue: app.home.value, homeNote: app.home.note,
      homeAmount: app.home.amount,
      homeHint: "Бұл оқу экраны. Нақты операциялар орындалмайды.",
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
      ui.chatHint = "Дайын фраза уақытты үнемдейді.";
    }

    var title = titles[app.id] || app.title;
    var steps = app.flow.map(function (kind) { return stepFor(kind, app); });
    return {
      id: app.id,
      order: 10 + index,
      app: "generic",
      appLabel: app.brand,
      uiGroup: app.bank ? app.id : "generic",
      ui: ui,
      category: app.category,
      title: title,
      short: "Қадамдарды өзіңіз орындап, қосымшадағы әрекетті үйренесіз.",
      goal: title + " — қадамдарды түсініп, өзіңіз орындау.",
      level: "Жаңа бастаған",
      duration: "5 минут",
      free: false,
      checked: "8 қараша 2026",
      intro: "Оқу сценарийі. Нақты операциялар орындалмайды.",
      steps: steps,
      done: {
        title: "Дайын: " + title,
        text: "Сіз қадамдарды өзіңіз орындадыңыз. Бұл — оқу жаттығуы, нақты операция емес.",
        rows: [["Қосымша", app.brand], ["Нәтиже", "Оқу сценарийі орындалды"]],
        tip: "Нақты операция алдында алушыны, соманы және кодты тексеріңіз."
      },
      next: index < apps.length - 1 ? apps[index + 1].id : "taxi-yandex"
    };
  }

  var built = apps.map(build);
  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(built);
})();