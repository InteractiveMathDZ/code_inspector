document.addEventListener("DOMContentLoaded", () => {
    const inspectBtn = document.getElementById("inspectBtn");
    if (inspectBtn) {
        inspectBtn.addEventListener("click", inspectCode);
    }
});

async function inspectCode() {
    const codeInput = document.getElementById("codeInput").value;
    const tool = document.getElementById("toolSelect").value;
    const resultsContainer = document.getElementById("results");
    const inspectBtn = document.getElementById("inspectBtn");

    const alertTpl = document.getElementById("alert-template");
    const issueTpl = document.getElementById("issue-template");

    // دالة مساعدة لزرع الرسائل العامة باستغلال القوالب
    const showAlert = (title, message, type = "error") => {
        const clone = alertTpl.content.cloneNode(true);
        const alertBox = clone.querySelector(".alert-box");
        alertBox.classList.add(type === "success" ? "success" : "error");
        clone.querySelector(".alert-title").textContent = title;
        clone.querySelector(".alert-message").textContent = message;
        resultsContainer.appendChild(clone);
    };

    if (!codeInput.trim()) {
        resultsContainer.innerHTML = "";
        showAlert("⚠️ تنبيه:", "يرجى إدخال شفرة برمجية أولاً.");
        return;
    }

    inspectBtn.disabled = true;
    inspectBtn.innerText = "جاري الفحص...";
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch("https://interactivemathdz.pythonanywhere.com/inspect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeInput, tool: tool })
        });

        const data = await response.json();
        resultsContainer.innerHTML = "";

        if (data.raw_error) {
            showAlert("⚠️ خطأ في الخادم:", data.raw_error, "error");
        } else if (data.is_valid) {
            showAlert(`✔ نتائج الفحص (${data.tool})`, "الكود سليم تماماً وخالٍ من الأخطاء!", "success");
        } else {
            const issues = data.issues || [];
            
            // عنوان ملخص النتائج
            const header = document.createElement("p");
            header.style.fontWeight = "bold";
            header.style.marginBottom = "12px";
            header.textContent = `تم اكتشاف ${data.total_issues || issues.length} من الأخطاء/التنبيهات (${data.tool}):`;
            resultsContainer.appendChild(header);

            // استنساخ بطاقة لكل خطأ
            issues.forEach(issue => {
                const clone = issueTpl.content.cloneNode(true);
                const itemNode = clone.querySelector(".issue-item");
                const isError = issue.severity === "error";

                if (issue.severity) itemNode.classList.add(issue.severity);

                // الشارة (Error / Warning)
                const badgeNode = clone.querySelector(".issue-badge");
                badgeNode.classList.add(isError ? "badge-error" : "badge-warning");
                badgeNode.textContent = isError ? "خطأ" : "تنبيه";

                // الموقع (السطر والعمود)
                clone.querySelector(".issue-location").textContent = `السطر ${issue.line}، العمود ${issue.column}`;

                // تنظيف ونص الرسالة
                let cleanMessage = issue.message;
                const ruleName = issue.rule || issue.rule_id;
                if (ruleName && cleanMessage.endsWith(`(${ruleName})`)) {
                    cleanMessage = cleanMessage.slice(0, -`(${ruleName})`.length).trim();
                }
                clone.querySelector(".issue-message").textContent = cleanMessage;

                // القاعدة (Rule)
                const ruleElement = clone.querySelector(".issue-rule");
                if (ruleName) {
                    ruleElement.textContent = `rule: ${ruleName}`;
                } else {
                    ruleElement.remove();
                }

                resultsContainer.appendChild(clone);
            });
        }
    } catch (error) {
        resultsContainer.innerHTML = "";
        showAlert("❌ تعذر الاتصال بالسيرفر", `تأكد من عمل PythonAnywhere. (${error.message})`, "error");
    } finally {
        inspectBtn.disabled = false;
        inspectBtn.innerText = "فحص الكود";
    }
}
