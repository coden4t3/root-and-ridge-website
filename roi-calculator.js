/* Home page "What are the gaps costing you?" estimate. Uses only the visitor's own inputs. */
(function () {
  "use strict";
  var form = document.getElementById("roi-calculator");
  if (!form) return;

  var WEEKS_PER_MONTH = 52 / 12;
  var money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var $ = function (id) { return document.getElementById(id); };
  var num = function (id) {
    var v = parseFloat($(id).value);
    return isFinite(v) && v > 0 ? v : 0;
  };

  function update() {
    var rate = Math.min(num("calc-rate"), 100) / 100;
    var lostWork = num("calc-calls") * WEEKS_PER_MONTH * rate * num("calc-value");
    var admin = num("calc-hours") * WEEKS_PER_MONTH * num("calc-wage");
    var total = lostWork + admin;
    $("calc-out-calls").textContent = money.format(lostWork) + "/mo";
    $("calc-out-admin").textContent = money.format(admin) + "/mo";
    $("calc-out-total").textContent = money.format(total);
    $("calc-out-year").textContent = "About " + money.format(total * 12) + " a year";
  }

  form.addEventListener("input", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  update();
})();
