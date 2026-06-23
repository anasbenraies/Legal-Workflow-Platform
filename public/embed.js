(function () {
  "use strict";

  var currentScript = document.currentScript;
  var workflowId = currentScript.getAttribute("data-workflow-id");
  var token = currentScript.getAttribute("data-token") || "";
  var baseUrl = new URL(currentScript.src).origin;

  function injectStyles(theme) {
    var radiusMap = { none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px" };
    var fontMap = { inter: "Inter, sans-serif", georgia: "Georgia, serif", roboto: "Roboto, sans-serif" };
    var layoutMap = { compact: "0.75rem", comfortable: "1.25rem", spacious: "2rem" };

    var css = "" +
      "[data-lf-widget] { background:" + theme.backgroundColor + "; font-family:" + fontMap[theme.fontFamily] + ";" +
      " padding: 24px; border-radius:" + radiusMap[theme.borderRadius] + "; --lf-gap: " + (layoutMap[theme.layout] || "1rem") + "; }" +
      "[data-lf-widget] .lf-field { margin-bottom: var(--lf-gap); }" +
      "[data-lf-widget] label { display:block; font-size: 14px; margin-bottom: calc(var(--lf-gap) / 6); font-weight: 500; }" +
      "[data-lf-widget] input, [data-lf-widget] select, [data-lf-widget] textarea { width:100%; padding: 8px 12px;" +
      " border-radius:" + radiusMap[theme.borderRadius] + "; border: 1px solid #d1d5db; box-sizing: border-box; }" +
      "[data-lf-widget] button[type=submit] { background:" + theme.primaryColor + "; color:#fff; border:none;" +
      " padding: 10px 18px; border-radius:" + radiusMap[theme.borderRadius] + "; cursor:pointer; font-weight:600; }" +
      "[data-lf-widget] .lf-error { color:#dc2626; font-size:12px; margin-top:4px; }" +
      "[data-lf-widget] .lf-radio-option { display:flex; align-items:center; gap:8px; font-weight:400; margin-bottom: calc(var(--lf-gap) / 4); }" +
      "[data-lf-widget] .lf-radio-option input[type=radio] { width:16px; height:16px; margin:0; }" +
      "[data-lf-widget] .lf-dyn-row { margin-bottom: calc(var(--lf-gap) / 4); display:flex; gap: calc(var(--lf-gap) / 2); align-items:flex-end; }";

    var styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
  }

  function createField(field) {
    var wrapper = document.createElement("div");
    wrapper.className = "lf-field";

    var label = document.createElement("label");
    label.textContent = field.label + (field.required ? " *" : "");
    wrapper.appendChild(label);

    var input;

    if (field.type === "select") {
      input = document.createElement("select");
      (field.options || []).forEach(function (opt) {
        var o = document.createElement("option");
        o.value = opt.value; o.textContent = opt.label;
        input.appendChild(o);
      });
    } else if (field.type === "radio") {
      input = document.createElement("div");
      (field.options || []).forEach(function (opt) {
        var radioLabel = document.createElement("label");
        radioLabel.className = "lf-radio-option";
        var radio = document.createElement("input");
        radio.type = "radio"; radio.name = field.id; radio.value = opt.value;
        radio.className = "lf-input";
        radioLabel.appendChild(radio);
        radioLabel.appendChild(document.createTextNode(opt.label));
        input.appendChild(radioLabel);
      });
    } else if (field.type === "file") {
      input = document.createElement("input");
      input.type = "file"; input.accept = ".pdf";
    } else if (field.type === "dynamic_list") {
      // Build a small repeatable-row widget for subFields
      input = document.createElement("div");
      input.setAttribute("data-dynamic-list", field.id);

      function createRow(values) {
        var row = document.createElement("div");
        row.className = "lf-dyn-row";
        row.style.display = "flex";
        row.style.gap = "var(--lf-gap)";
        row.style.alignItems = "flex-end";

        (field.subFields || []).forEach(function (sub) {
          var wrap = document.createElement("div");
          wrap.style.flex = "1";
          var lab = document.createElement("label");
          lab.className = "text-xs";
          lab.style.display = "block";
          lab.style.fontSize = "12px";
          lab.textContent = sub.label;
          var inp = document.createElement("input");
          inp.type = sub.type === "email" ? "email" : "text";
          inp.placeholder = sub.placeholder || "";
          inp.value = (values && values[sub.id]) || "";
          inp.setAttribute("data-sub-id", sub.id);
          inp.className = "lf-input";
          wrap.appendChild(lab);
          wrap.appendChild(inp);
          row.appendChild(wrap);
        });

        var rem = document.createElement("button");
        rem.type = "button";
        rem.textContent = "✕";
        rem.onclick = function () { row.remove(); };
        row.appendChild(rem);

        return row;
      }

      // rows container
      var rows = document.createElement("div");
      rows.className = "lf-dyn-rows";
      // start with one row
      rows.appendChild(createRow());

      var addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.textContent = "+ Add " + (field.label ? field.label.replace(/s$/, "") : "item");
      addBtn.style.marginTop = "var(--lf-gap)";
      addBtn.onclick = function () { rows.appendChild(createRow()); };

      input.appendChild(rows);
      input.appendChild(addBtn);
    } else {
      input = document.createElement("input");
      input.type = field.type === "email" ? "email" : "text";
      if (field.placeholder) input.placeholder = field.placeholder;
    }

    if (input.tagName === "INPUT" || input.tagName === "SELECT") {
      input.name = field.id;
      if (field.required) input.required = true;
    }

    wrapper.appendChild(input);
    return wrapper;
  }

  function renderWidget(schema) {
    var container = document.getElementById("legalflow-widget");
    if (!container) return;

    injectStyles(schema.theme);

    var wrapper = document.createElement("form");
    wrapper.setAttribute("data-lf-widget", schema.id);

    (schema.fields || []).forEach(function (field) {
      wrapper.appendChild(createField(field));
    });

    var submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Submit";
    wrapper.appendChild(submitBtn);

    wrapper.addEventListener("submit", function (e) {
      e.preventDefault();

      // Build data object manually so we can include dynamic_list rows as arrays
      var data = {};

      (schema.fields || []).forEach(function (field) {
        if (field.type === "dynamic_list") {
          var container = wrapper.querySelector('[data-dynamic-list="' + field.id + '"]');
          var rows = [];
          if (container) {
            var rowEls = container.querySelectorAll(".lf-dyn-row");
            rowEls.forEach(function (r) {
              var obj = {};
              var inputs = r.querySelectorAll("[data-sub-id]");
              inputs.forEach(function (inp) {
                var key = inp.getAttribute("data-sub-id");
                obj[key] = inp.value;
              });
              rows.push(obj);
            });
          }
          data[field.id] = rows;
        } else {
          var el = wrapper.querySelector('[name="' + field.id + '"]');
          if (!el) return;
          if (el.tagName === "SELECT") {
            data[field.id] = el.value;
          } else if (el.type === "radio") {
            var checked = wrapper.querySelector('input[name="' + field.id + '"]:checked');
            data[field.id] = checked ? checked.value : null;
          } else if (el.type === "file") {
            data[field.id] = null; // client-side embed does not upload files
          } else {
            data[field.id] = el.value;
          }
        }
      });

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";

      fetch(baseUrl + "/api/submit/" + schema.id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: schema.id, data: data, clientOrigin: window.location.origin }),
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          submitBtn.textContent = "Submitted ✓";
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        });
    });

    container.appendChild(wrapper);
  }

  var widgetUrl = baseUrl + "/api/widget/" + workflowId + (token ? "?token=" + encodeURIComponent(token) : "");

  fetch(widgetUrl, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) {
        // log server error body for easier debugging
        res.text().then(function (txt) { console.error("LegalFlow widget fetch failed:", res.status, txt); });
        throw new Error("Widget fetch failed: " + res.status);
      }
      return res.json();
    })
    .then(function (data) {
      // ensure payload looks like a WidgetConfigResponse
      if (!data || !data.theme || !Array.isArray(data.fields)) {
        console.error("LegalFlow widget response missing expected fields:", data);
        return;
      }
      renderWidget(data);
    })
    .catch(function (err) { console.error("LegalFlow widget failed to load:", err); });
})();