/* Kazakh bank lessons from shared configs. */
(function () {
  "use strict";
  var modules = window.TANYMIO_BANK_CONFIGS || [];
  var titles = {
    "bank-freedom-kopilka": "Freedom: «Копилка» — толықтыру және алу",
    "bank-freedom-strategy": "Freedom: «Стратегия» және «Капитал»",
    "bank-freedom-utilities": "Freedom: ТКШ төлеу",
    "bank-freedom-history": "Freedom: тарих және түбіртек"
  };

  function step(kind, lesson, mod) {
    if (kind === "home") {
      return { screen: "a_home", target: "home_open", rail: lesson.home.label,
        title: "Бөлімді ашыңыз", text: mod.brand + " қосымшасында «" + lesson.home.label + "» бөлімін басыңыз.",
        hint: "Бұл — экранның жоғарғы жағындағы түйме.", wrong: "Қазір «" + lesson.home.label + "» бөлімі керек.",
        success: "Бөлім ашылды.", voice: lesson.home.label + " бөлімін басыңыз." };
    }
    if (kind === "list") {
      return { screen: "a_list", target: "list_pick", rail: lesson.list.items[0][0],
        title: "Керекті таңдаңыз", text: "«" + lesson.list.items[0][0] + "» — " + lesson.list.items[0][1] + " жолын басыңыз.",
        hint: "Бұл — тізімнің бірінші жолы.", wrong: "Бірінші жол керек — «" + lesson.list.items[0][0] + "».",
        success: "Таңдау жасалды.", voice: lesson.list.items[0][0] + " таңдаңыз." };
    }
    if (kind === "confirm") {
      return { screen: "a_confirm", target: "confirm_go", rail: "Тексеру",
        title: "Деректерді тексеріңіз", text: "Деректерді салыстырып, «" + lesson.confirm.cta + "» түймесін басыңыз.",
        hint: "Растау түймесі — экранның ең төменінде.", wrong: "Төмендегі «" + lesson.confirm.cta + "» түймесін басыңыз.",
        success: "Әрекет расталды.", voice: "Деректерді тексеріп, " + lesson.confirm.cta + " түймесін басыңыз." };
    }
    return { screen: "a_code", target: "code_ok", rail: "Код",
      title: "Кодты енгізіңіз", text: "4821 кодын енгізіп, «" + lesson.code.cta + "» түймесін басыңыз.",
      hint: "Код SMS-пен келеді. Оны ешкімге айтпаңыз.", wrong: "4821 кодын енгізіп, «" + lesson.code.cta + "» басыңыз.",
      success: "Код қабылданды.", voice: "4821 кодын енгізіп, растаңыз." };
  }

  function build(mod, lesson, index) {
    var id = mod.prefix + "-" + lesson.slug;
    var ui = { brand: mod.brand, letter: mod.letter, city: "Алматы · оқу экраны", theme: mod.theme || "bank",
      homeLabel: lesson.home.label, homeValue: lesson.home.value, homeNote: lesson.home.note,
      homeAmount: lesson.home.amount, homeHint: "Бұл оқу экраны. Нақты операциялар орындалмайды.",
      listTitle: lesson.list.title };
    lesson.list.items.forEach(function (item, i) { ui["item" + i + "Label"] = item[0]; ui["item" + i + "Sub"] = item[1]; });
    ui.confirmTitle = lesson.confirm.title;
    lesson.confirm.rows.forEach(function (row, i) { ui["row" + i + "Label"] = row[0]; ui["row" + i + "Value"] = row[1]; });
    ui.confirmNote = lesson.confirm.note; ui.confirmValue = lesson.confirm.value; ui.confirmCta = lesson.confirm.cta;
    if (lesson.code) { ui.codeTitle = lesson.code.title; ui.codeText = lesson.code.text; ui.codeCta = lesson.code.cta; }
    var flow = lesson.code ? ["home", "list", "confirm", "code"] : ["home", "list", "confirm"];
    var title = titles[id] || lesson.title;
    return {
      id: id, order: 10 + index, app: "generic", appLabel: mod.brand, uiGroup: "generic", ui: ui,
      category: "bank", title: title, short: "Қадамдарды өзіңіз орындап, банк операциясын үйренесіз.",
      goal: title + " — қадамдарды түсініп, өзіңіз орындау.", level: "Жаңа бастаған", duration: "4 минут",
      free: false, checked: "10 қараша 2026", intro: "Оқу сценарийі. Нақты операциялар орындалмайды.",
      steps: flow.map(function (kind) { return step(kind, lesson, mod); }),
      done: { title: "Дайын: " + title, text: "Сіз қадамдарды өзіңіз орындадыңыз. Бұл — оқу жаттығуы.",
        rows: [["Банк", mod.brand], ["Нәтиже", "Оқу сценарийі орындалды"]],
        tip: "Нақты операция алдында шарттарды, соманы және алу мүмкіндігін тексеріңіз." },
      next: "bank-halyk"
    };
  }

  var all = [];
  modules.forEach(function (mod) { mod.lessons.forEach(function (lesson) { all.push(build(mod, lesson)); }); });
  window.TANYMIO_LESSONS = (window.TANYMIO_LESSONS || []).concat(all);
})();