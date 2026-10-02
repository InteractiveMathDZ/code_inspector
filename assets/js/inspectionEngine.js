function addEventToInspectBtn() {
  const inspectBtn = document.getElementById("inspectBtn");
  if (inspectBtn) {
    inspectBtn.addEventListener("click", () => {
      const code = document.getElementById("codeInput").value;
      const tool = document.getElementById("toolSelect").value;
      inspectCode(tool, code);
    });
  }
}

function addEventToFormatBtn(codeInputEl) {
  const formatBtn = document.getElementById("formatBtn");
  if (formatBtn) {
    formatBtn.addEventListener("click", () => {
      const toolSelectEl = document.getElementById("toolSelect");

      const toolToLang = {
        ESLint: "js",
        HTMLValidate: "html",
        Stylelint: "css",
        PyCodeStyle: "python",
        PyFlakes: "python",
        Bandit: "python",
        "Python AST": "python",
      };

      const selectedTool = toolSelectEl ? toolSelectEl.value : "ESLint";
      const language = toolToLang[selectedTool] || "js";

      formatCode(language, codeInputEl);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Direct code inspection button
  addEventToInspectBtn();

  // 2. Direct code formatting button
  const codeInputEl = document.getElementById("codeInput");
  addEventToFormatBtn(codeInputEl);

  // 3. Line numbers strictly synchronized scrolling logic
  const lineNumbers = document.getElementById("lineNumbers");

  if (codeInputEl && lineNumbers) {
    function updateLineNumbers() {
      const lines = codeInputEl.value.split("\n").length;
      lineNumbers.textContent = Array.from(
        { length: lines },
        (_, i) => i + 1,
      ).join("\n");
    }

    function adjustHeight() {
      codeInputEl.style.height = "auto"; // إعادة ضبط الارتفاع أولاً لحساب scrollHeight بشكل صحيح عند الحذف
      codeInputEl.style.height = codeInputEl.scrollHeight + "px";
    }

    // الأحداث: التحديث التلقائي لأرقام الأسطر والمزامنة التامة للتمرير
    codeInputEl.addEventListener("input", () => {
      updateLineNumbers();
      adjustHeight();
    });

    window.addEventListener("focus", () => {
      updateLineNumbers();
      adjustHeight();
    });

    // 3. تحديث الأسطر عند العودة للتبويب (Tab Visibility)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        updateLineNumbers();
        adjustHeight();
      }
    });

    const copyBtn = document.getElementById("copyBtn");

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        handleCopyCode(codeInputEl.value, copyBtn);
      });
    }

    const clearBtn = document.getElementById("clearBtn");

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        codeInputEl.value = "";
        codeInputEl.dispatchEvent(new Event("input")); // يُحفّز إعادة تحديث الأسطر والارتفاع فوراً
        document.getElementById("results").innerHTML = "";
        updateLineNumbers();
        adjustHeight();
      });
    }

    // التشغيل المبدئي
    updateLineNumbers();
    adjustHeight();
  }
});

// دالة مساعدة معالجة للنسخ وإعطاء التغذية الراجعة (التعقيد: 2 فقط)
async function handleCopyCode(text, buttonEl) {
  if (!text.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    const originalText = buttonEl.textContent;

    buttonEl.textContent = "✔ Copied!";
    buttonEl.disabled = true;

    setTimeout(() => {
      buttonEl.textContent = originalText;
      buttonEl.disabled = false;
    }, 2000);
  } catch (err) {
    console.error("Clipboard copy failed:", err);
  }
}

/* API Logic */
async function inspectCode(tool, code) {
  const resultsContainer = document.getElementById("results");
  const inspectBtn = document.getElementById("inspectBtn");
  resultsContainer.innerHTML = "";

  if (!code.trim()) {
    showAlert(resultsContainer, "⚠️ Warning:", "Enter your code first.");
    return;
  }

  if (inspectBtn) {
    inspectBtn.disabled = true;
    inspectBtn.innerText = "Inspecting...";
  }

  try {
    const response = await fetch(
      "https://interactivemathdz.pythonanywhere.com/inspect",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, tool: tool }),
      },
    );

    const data = await response.json();
    renderResults(resultsContainer, data);
  } catch (error) {
    resultsContainer.innerHTML = "";
    showAlert(
      resultsContainer,
      "❌ Connection Error",
      `Unable to connect to server. (${error.message})`,
      "error",
    );
  } finally {
    if (inspectBtn) {
      inspectBtn.disabled = false;
      inspectBtn.innerText = "🔍 Inspect Code";
    }
  }
}

async function formatCode(language, codeInputEl) {
  const formatBtn = document.getElementById("formatBtn");
  const resultsContainer = document.getElementById("results");
  const code = codeInputEl.value;
  resultsContainer.innerHTML = "";

  if (!code.trim()) {
    showAlert(
      resultsContainer,
      "⚠️ Warning:",
      "Please enter code first to format.",
    );
    return;
  }

  if (formatBtn) {
    formatBtn.disabled = true;
    formatBtn.innerText = "Formatting...";
  }

  try {
    const response = await fetch(
      "https://interactivemathdz.pythonanywhere.com/format",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, language: language }),
      },
    );

    const data = await response.json();

    if (data.status === "success" && data.formatted_code) {
      codeInputEl.value = data.formatted_code;
      codeInputEl.dispatchEvent(new Event("input")); // إعادة حساب الأسطر بعد التنسيق
    } else {
      showAlert(
        resultsContainer,
        "❌ Formatting Failed:",
        data.message || "Unknown error occurred.",
        "error",
      );
    }
  } catch (error) {
    showAlert(resultsContainer, "❌ Connection Error", error.message, "error");
  } finally {
    if (formatBtn) {
      formatBtn.disabled = false;
      formatBtn.innerText = "✨ Format Code";
    }
  }
}

function showAlert(container, title, message, type = "error") {
  const alertTpl = document.getElementById("alert-template");
  if (!alertTpl || !container) return;

  const clone = alertTpl.content.cloneNode(true);
  const alertBox = clone.querySelector(".alert-box");
  alertBox.classList.add(type === "success" ? "success" : "error");
  clone.querySelector(".alert-title").textContent = title;
  clone.querySelector(".alert-message").textContent = message;
  container.appendChild(clone);
}

// 1. دالة فرعية لتنسيق الشارة (التعقيد: 4)
function setupBadge(badgeNode, severity) {
  const isError = severity === "error" || severity === 2;
  badgeNode.classList.add(isError ? "badge-error" : "badge-warning");
  badgeNode.textContent = isError ? "Error" : "Warning";
}

// 2. دالة فرعية لتنسيق نص الموقع (التعقيد: 4)
function formatLocation(issue) {
  const line = issue.line || 1;
  const column = issue.column || 1;
  const toolBadge = issue.tool ? ` [${issue.tool}]` : "";
  return `Line ${line}, Column ${column}${toolBadge}`;
}

// 3. دالة فرعية لتنظيف الرسالة من اسم القاعدة (التعقيد: 3)
function cleanRuleMessage(message = "", ruleName) {
  if (ruleName && message.includes(`(${ruleName})`)) {
    return message.replace(`(${ruleName})`, "").trim();
  }
  return message;
}

// 4. الدالة الرئيسية بعد التفكيك (التعقيد: 4 فقط)
function createIssueNode(issue, template) {
  const clone = template.content.cloneNode(true);
  const ruleName = issue.rule || issue.ruleId;

  const itemNode = clone.querySelector(".issue-item");
  if (itemNode && issue.severity) itemNode.classList.add(issue.severity);

  setupBadge(clone.querySelector(".issue-badge"), issue.severity);

  clone.querySelector(".issue-location").textContent = formatLocation(issue);

  clone.querySelector(".issue-message").textContent = cleanRuleMessage(
    issue.message,
    ruleName,
  );

  const ruleElement = clone.querySelector(".issue-rule");
  if (ruleName) {
    ruleElement.textContent = `rule: ${ruleName}`;
  } else {
    ruleElement.remove();
  }

  return clone;
}

function renderResults(container, data) {
  container.innerHTML = "";
  const issueTpl = document.getElementById("issue-template");

  if (data.raw_error) {
    showAlert(container, "⚠️ Server Error:", data.raw_error, "error");
    return;
  }

  const toolName = data.tools_run
    ? data.tools_run.join(" + ")
    : data.tool || "Inspector";
  const issues = data.issues || [];

  if (issues.length === 0) {
    showAlert(
      container,
      `✔ Inspection Results (${toolName})`,
      "Code is clean! No errors or warnings found.",
      "success",
    );
    return;
  }

  const header = document.createElement("p");
  header.style.fontWeight = "bold";
  header.style.marginBottom = "12px";
  const count = data.total_issues || issues.length;
  const issueLabel = count === 1 ? "issue/warning" : "issues/warnings";
  header.textContent = `Found ${count} ${issueLabel} (${toolName}):`;

  container.appendChild(header);

  issues.forEach((issue) => {
    container.appendChild(createIssueNode(issue, issueTpl));
  });
}
