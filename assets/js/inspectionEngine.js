document.addEventListener("DOMContentLoaded", () => {
    // 1. ربط زر الفحص المباشر (الصفحة الرئيسية)
    const inspectBtn = document.getElementById("inspectBtn");
    if (inspectBtn) {
        inspectBtn.addEventListener("click", () => { const code = document.getElementById("codeInput").value; const tool = document.getElementById("toolSelect").value;
            inspectCode(tool, code);
        });
    }

    // 2. ربط زر التنسيق المباشر (الصفحة الرئيسية)
    const formatBtn = document.getElementById("formatBtn");
    if (formatBtn) {
        formatBtn.addEventListener("click", () => {
            const codeInputEl = document.getElementById("codeInput");
            const toolSelectEl = document.getElementById("toolSelect");

            const toolToLang = {
                'ESLint': 'js',
                'HTMLValidate': 'html',
                'Stylelint': 'css',
                'PyCodeStyle': 'python',
                'PyFlakes': 'python',
                'Bandit': 'python',
                'Python AST': 'python'
            };

            const selectedTool = toolSelectEl ? toolSelectEl.value : 'ESLint';
            const language = toolToLang[selectedTool] || 'js';

            formatCode(language, codeInputEl);
        });
    }

    // 3. ربط زر الفحص من رابط (url-inspector.html)
    const inspectUrlBtn = document.getElementById("inspectUrlBtn");
    if (inspectUrlBtn) {
        inspectUrlBtn.addEventListener("click", () => {
            const rawUrl = document.getElementById("urlInput").value;
            inspectUrlCode(rawUrl);
        });
    }
});

/* ==========================================
   دوال المنطق والاتصال بالخادم (Core Engine)
   ========================================== */

// أ) فحص الكود المباشر
async function inspectCode(tool, code) {
    const resultsContainer = document.getElementById("results");
    const inspectBtn = document.getElementById("inspectBtn");

    if (!code.trim()) {
        resultsContainer.innerHTML = "";
        showAlert(resultsContainer, "⚠️ تنبيه:", "يرجى إدخال شفرة برمجية أولاً.");
        return;
    }

    if (inspectBtn) {
        inspectBtn.disabled = true;
        inspectBtn.innerText = "جاري الفحص...";
    }
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch("https://interactivemathdz.pythonanywhere.com/inspect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, tool: tool })
        });

        const data = await response.json();
        renderResults(resultsContainer, data);
    } catch (error) {
        resultsContainer.innerHTML = "";
        showAlert(resultsContainer, "❌ تعذر الاتصال بالسيرفر", `تأكد من عمل PythonAnywhere. (${error.message})`, "error");
    } finally {
        if (inspectBtn) {
            inspectBtn.disabled = false;
            inspectBtn.innerText = "فحص الكود";
        }
    }
}

// ب) فحص الكود عبر رابط (Raw URL)
async function inspectUrlCode(rawUrl) {
    const resultsContainer = document.getElementById("results");
    const inspectUrlBtn = document.getElementById("inspectUrlBtn");

    if (!rawUrl.trim()) {
        resultsContainer.innerHTML = "";
        showAlert(resultsContainer, "⚠️ تنبيه:", "يرجى إدخال رابط الملف المباشر أولاً.");
        return;
    }

    if (inspectUrlBtn) {
        inspectUrlBtn.disabled = true;
        inspectUrlBtn.innerText = "جاري جلب وفحص الكود...";
    }
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch("https://interactivemathdz.pythonanywhere.com/inspect-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: rawUrl })
        });

        const data = await response.json();
        renderResults(resultsContainer, data);
    } catch (error) {
        resultsContainer.innerHTML = "";
        showAlert(resultsContainer, "❌ تعذر الاتصال بالسيرفر", `تأكد من صحة الرابط وعمل الخادم. (${error.message})`, "error");
    } finally {
        if (inspectUrlBtn) {
            inspectUrlBtn.disabled = false;
            inspectUrlBtn.innerText = "جلب وفحص الكود";
        }
    }
}

// ج) تنسيق الكود
async function formatCode(language, codeInputEl) {
    const formatBtn = document.getElementById("formatBtn");
    const resultsContainer = document.getElementById("results");
    const code = codeInputEl.value;

    if (!code.trim()) {
        showAlert(resultsContainer, "⚠️ تنبيه:", "يرجى إدخال شفرة برمجية أولاً لتنسيقها.");
        return;
    }

    if (formatBtn) {
        formatBtn.disabled = true;
        formatBtn.innerText = "جاري التنسيق...";
    }

    try {
        const response = await fetch("https://interactivemathdz.pythonanywhere.com/format", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, language: language })
        });

        const data = await response.json();

        if (data.status === "success" && data.formatted_code) {
            codeInputEl.value = data.formatted_code;
        } else {
            showAlert(resultsContainer, "❌ تعذر التنسيق:", data.message || "خطأ غير معروف", "error");
        }
    } catch (error) {
        showAlert(resultsContainer, "❌ تعذر الاتصال بالسيرفر", error.message, "error");
    } finally {
        if (formatBtn) {
            formatBtn.disabled = false;
            formatBtn.innerText = "✨ تنسيق الكود";
        }
    }
}

/* ==========================================
   دوال العرض والتنسيق الظاهري (Rendering Helpers)
   ========================================== */

// عرض تنبيه عام (نجاح / خطأ)
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

// رسم بطاقات النتائج والأخطاء والتنبيهات
function renderResults(container, data) {
    container.innerHTML = "";
    const issueTpl = document.getElementById("issue-template");

    if (data.raw_error) {
        showAlert(container, "⚠️ خطأ في الخادم:", data.raw_error, "error");
        return;
    }

    const toolName = data.tools_run ? data.tools_run.join(" + ") : (data.tool || "الفاحص");
    
    // 💡 تعريف المتغير مرة واحدة فقط في البداية
    const issues = data.issues || [];

    // إذا كانت القائمة فارغة تماماً (لا أخطاء ولا تنبيهات)
    if (issues.length === 0) {
        showAlert(container, `✔ نتائج الفحص (${toolName})`, "الكود سليم تماماً وخالٍ من الأخطاء والتنبيهات!", "success");
        return;
    }

    // رأس ملخص النتائج
    const header = document.createElement("p");
    header.style.fontWeight = "bold";
    header.style.marginBottom = "12px";
    header.textContent = `تم اكتشاف ${data.total_issues || issues.length} من الأخطاء/التنبيهات (${toolName}):`;
    container.appendChild(header);

    // بناء بطاقات الملاحظات
    issues.forEach(issue => {
        const clone = issueTpl.content.cloneNode(true);
        const itemNode = clone.querySelector(".issue-item");
        const isError = issue.severity === "error" || issue.type === "error";

        if (issue.severity) itemNode.classList.add(issue.severity);

        // الشارة (خطأ / تنبيه)
        const badgeNode = clone.querySelector(".issue-badge");
        badgeNode.classList.add(isError ? "badge-error" : "badge-warning");
        badgeNode.textContent = isError ? "خطأ" : "تنبيه";

        // الموقع واسم الأداة
        const toolBadge = issue.tool ? ` [${issue.tool}]` : "";
        const line = issue.line || "?";
        const column = issue.column || "?";
        clone.querySelector(".issue-location").textContent = `السطر ${line}، العمود ${column}${toolBadge}`;

        // نص الرسالة
        let cleanMessage = issue.message || "";
        const ruleName = issue.rule || issue.rule_id;
        if (ruleName && cleanMessage.endsWith(`(${ruleName})`)) {
            cleanMessage = cleanMessage.slice(0, -`(${ruleName})`.length).trim();
        }
        clone.querySelector(".issue-message").textContent = cleanMessage;

        // القاعدة
        const ruleElement = clone.querySelector(".issue-rule");
        if (ruleName) {
            ruleElement.textContent = `rule: ${ruleName}`;
        } else {
            ruleElement.remove();
        }

        container.appendChild(clone);
    });
}

