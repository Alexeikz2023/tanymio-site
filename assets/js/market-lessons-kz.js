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
      brand: mod.brand, letter: mod.letter, city: "Алматы · оқу экраны", theme: "market",
      homeLabel: lesson.home.label, homeValue: lesson.home.value, homeNote: lesson.home.note,
      homeAmount: lesson.home.amount, homeHint: "Бұл оқу экраны. Нақты тапсырыс орындалмайды.",
      listTitle: lesson.list.title
    };
    lesson.list.items.forEach(function (item, i) {
      ui["item" + i + "Label"] = item[0];
      ui["item" + i + "Sub"] = item[1];
    });
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
  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(all);
})();