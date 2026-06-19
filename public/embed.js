(function () {
  "use strict";

  var currentScript = document.currentScript;
  var workflowId = currentScript.getAttribute("data-workflow-id");
  var token = currentScript.getAttribute("data-token") || "";
  var baseUrl = new URL(currentScript.src).origin;

  function injectStyles(theme) {
    var radiusMap = { none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px" };
    var fontMap = { inter: "Inter, sans-serif", georgia: "Georgia, serif", roboto: "Roboto, sans-serif" };

    var css = "" +
      "[data-lf-widget] { background:" + theme.backgroundColor + "; font-family:" + fontMap[theme.fontFamily] + ";" +
      " padding: 24px; border-radius:" + radiusMap[theme.borderRadius] + "; }" +
      "[data-lf-widget] .lf-field { margin-bottom: 16px; }" +
      "[data-lf-widget] label { display:block; font-size: 14px; margin-bottom: 4px; font-weight: 500; }" +
      "[data-lf-widget] input, [data-lf-widget] select { width:100%; padding: 8px 12px;" +
      " border-radius:" + radiusMap[theme.borderRadius] + "; border: 1px solid #d1d5db; box-sizing: border-box; }" +
      "[data-lf-widget] button[type=submit] { background:" + theme.primaryColor + "; color:#fff; border:none;" +
      " padding: 10px 18px; border-radius:" + radiusMap[theme.borderRadius] + "; cursor:pointer; font-weight:600; }" +
      "[data-lf-widget] .lf-error { color:#dc2626; font-size:12px; margin-top:4px; }";

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
        radioLabel.style.display = "flex";
        radioLabel.style.gap = "6px";
        radioLabel.style.fontWeight = "400";
        var radio = document.createElement("input");
        radio.type = "radio"; radio.name = field.id; radio.value = opt.value;
        radioLabel.appendChild(radio);
        radioLabel.appendChild(document.createTextNode(opt.label));
        input.appendChild(radioLabel);
      });
    } else if (field.type === "file") {
      input = document.createElement("input");
      input.type = "file"; input.accept = ".pdf";
    } else if (field.type === "dynamic_list") {
      input = document.createElement("div");
      input.setAttribute("data-dynamic-list", field.id);
      // Implémentation simplifiée : une ligne de sous-champs par défaut + bouton add
      // (cf. version React /components/fields/DynamicListField.tsx pour la logique complète)
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
      var formData = new FormData(wrapper);
      var data = {};
      formData.forEach(function (value, key) { data[key] = value; });

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