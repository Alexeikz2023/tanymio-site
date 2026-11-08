/* Tanymio — short interactive trial embedded on the landing page. */
(function () {
  "use strict";

  var root = document.querySelector("[data-demo]");
  if (!root) return;

  var phone = root.querySelector(".phone");
  var titleEl = root.querySelector("[data-demo-title]");
  var textEl = root.querySelector("[data-demo-text]");
  var bars = Array.prototype.slice.call(root.querySelectorAll("[data-demo-progress] span"));
  var resetBtn = root.querySelector("[data-demo-reset]");
  var done = root.querySelector(".phone-done");

  var steps = [
    {
      screen: "d_home",
      target: "search",
      title: "Шаг 1 из 3 · адрес",
      text: "Нажмите на поле «Куда поедем?» в верхней части телефона."
    },
    {
      screen: "d_search",
      target: "clinic",
      title: "Шаг 2 из 3 · поликлиника",
      text: "Выберите «Поликлиника №4» на улице Толе би, 59."
    },
    {
      screen: "d_route",
      target: "order",
      title: "Шаг 3 из 3 · заказ",
      text: "Проверьте цену и нажмите «Заказать». Это учебный заказ."
    }
  ];

  var index = 0;

  function setScreen(name) {
    Array.prototype.slice.call(phone.querySelectorAll("[data-demo-screen]")).forEach(function (screen) {
      screen.classList.toggle("is-active", screen.dataset.demoScreen === name);
    });
    phone.dataset.screen = name;
  }

  function render() {
    if (index >= steps.length) {
      setScreen("d_route");
      if (done) done.hidden = false;
      titleEl.textContent = "Готово — такси заказано";
      textEl.textContent = "Это была короткая проба. В полном уроке — ещё три шага: водитель, сообщение и проверка машины.";
      bars.forEach(function (bar) { bar.classList.add("is-on"); });
      return;
    }

    var step = steps[index];
    if (done) done.hidden = true;
    setScreen(step.screen);
    titleEl.textContent = step.title;
    textEl.textContent = step.text;
    bars.forEach(function (bar, i) {
      bar.classList.toggle("is-on", i < index);
    });
  }

  root.addEventListener("click", function (event) {
    var reset = event.target.closest("[data-demo-reset]");
    if (reset) {
      index = 0;
      render();
      return;
    }

    var target = event.target.closest("[data-demo-t]");
    if (!target || index >= steps.length) return;
    if (target.dataset.demoT !== steps[index].target) return;

    target.classList.add("is-tapped");
    setTimeout(function () { target.classList.remove("is-tapped"); }, 340);

    index += 1;
    setTimeout(render, 180);
  });

  render();
})();