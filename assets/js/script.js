async function inspectCode() {
        const codeInput = document.getElementById("codeInput").value;
        const language = document.getElementById("languageSelect").value;
        const outputElement = document.getElementById("reportOutput");
        const inspectBtn = document.getElementById("inspectBtn");

        if (!codeInput.trim()) {
            outputElement.innerHTML = "<p class='text-danger' dir='rtl'>يرجى إدخال شفرة برمجية أولاً.</p>";
            return;
        }

        inspectBtn.disabled = true;
        inspectBtn.innerText = "جاري الفحص...";
        outputElement.innerHTML = "<p dir='rtl'>جاري الاتصال بالخادم...</p>";

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
                outputElement.innerHTML = `<p class='text-danger' dir='rtl'>خطأ في الخادم: ${data.raw_error}</p>`;
            } else if (data.is_valid) {
                outputElement.innerHTML = `
                    <div class="report-box" dir="rtl">
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
                            <strong>السطر ${issue.line}، العمود ${issue.column}:</strong><p dir="ltr">
                            ${issue.message} 
                            <span style="color: #94a3b8;">(${issue.rule || issue.severity})</span></p>
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
