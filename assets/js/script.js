// وظيفة إدارة الوضع الليلي التلقائي
function applyAutoTheme() {
  const getStoredTheme = () => localStorage.getItem("theme");
  //const setStoredTheme = theme => localStorage.setItem('theme', theme);

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const setTheme = (theme) => {
    if (
      theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  };

  // التنفيذ الفوري
  setTheme(getPreferredTheme());

  // مراقبة التغيير الحي في إعدادات الجهاز
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== "light" && storedTheme !== "dark") {
        setTheme(getPreferredTheme());
      }
    });
}

// تشغيل الوظيفة عند تحميل المستند
document.addEventListener("DOMContentLoaded", applyAutoTheme);
async function inspectCode() {
        const codeInput = document.getElementById("codeInput").value;
        const language = document.getElementById("languageSelect").value;
        const outputElement = document.getElementById("reportOutput");
        const inspectBtn = document.getElementById("inspectBtn");

        if (!codeInput.trim()) {
            outputElement.innerHTML = "<p class='text-danger'>يرجى إدخال شفرة برمجية أولاً.</p>";
            return;
        }

        inspectBtn.disabled = true;
        inspectBtn.innerText = "جاري الفحص...";
        outputElement.innerHTML = "<p>جاري الاتصال بالسيرفر...</p>";

        try {
            const response = await fetch("https://interactivemathdz.pythonanywhere.com/inspect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: codeInput,
                    language: language 
                })
            });

            const data = await response.json();

            // معالجة الرد حسب الهيكل الموديلر الجديد
            if (data.raw_error) {
                outputElement.innerHTML = `<p class='text-danger'>خطأ في الخادم: ${data.raw_error}</p>`;
            } else if (data.is_valid) {
                outputElement.innerHTML = `
                    <div class="report-box">
                        <h3>نتائج الفحص (${data.tool})</h3>
                        <p style="color: #4ade80;">✔ الكود سليم تماماً وخالٍ من الأخطاء!</p>
                    </div>
                `;
            } else {
                let issuesHTML = `
                    <div class="report-box">
                        <h3 class="text-danger">تم اكتشاف ${data.total_issues} من الأخطاء/التنبيهات (${data.tool}):</h3>
                        <ul>
                `;
                
                data.issues.forEach(issue => {
                    issuesHTML += `
                        <li style="margin-bottom: 8px;">
                            <strong>السطر ${issue.line}، العمود ${issue.column}:</strong> 
                            ${issue.message} 
                            <span style="color: #94a3b8;">(${issue.rule || issue.severity})</span>
                        </li>
                    `;
                });

                issuesHTML += `</ul></div>`;
                outputElement.innerHTML = issuesHTML;
            }
        } catch (error) {
            outputElement.innerHTML = "<p class='text-danger'>تعذر الاتصال بالسيرفر. تأكد من عمل PythonAnywhere.</p>";
        } finally {
            inspectBtn.disabled = false;
            inspectBtn.innerText = "فحص الكود";
        }
    }
