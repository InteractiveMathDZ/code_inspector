async function inspectCode() {
    const codeInput = document.getElementById("codeInput").value;
    const tool = document.getElementById("toolSelect").value;
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
                tool: tool 
            })
        });

        const data = await response.json();

        // تفريغ عنصر المخرجات قبل إدراج النتائج الجديدة
        outputElement.innerHTML = "";

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
            const fragment = document.createDocumentFragment();
                
            const h3item = document.createElement('h4');
            h3item.dir = 'rtl';
            h3item.textContent = `تم اكتشاف ${data.total_issues} من الأخطاء/التنبيهات (${data.tool}):`;
            fragment.appendChild(h3item);
                
            const ulitem = document.createElement('ul');
            ulitem.dir = 'rtl';
            fragment.appendChild(ulitem);
            
            data.issues.forEach(issue => {
                const liitem = document.createElement('li');
                ulitem.appendChild(liitem);
                    
                const h4item = document.createElement('h4');
                h4item.textContent = `السطر ${issue.line}، العمود ${issue.column}:`;
                liitem.appendChild(h4item);
                
                const pitem = document.createElement('p');
                
                // استخدام createTextNode يضمن عرض وسوم الـ HTML كنصوص مجردة
                const msgNode = document.createTextNode(`${issue.message} `);
                msgNode.dir ='ltr';
                msgNode.style.unicodeBidi = 'isolate';
                pitem.appendChild(msgNode);
                
                const ruleSpan = document.createElement('span');
                ruleSpan.style.color = '#94a3b8';
                ruleSpan.dir = 'ltr';
                ruleSpan.textContent = `(${issue.rule || issue.severity})`;
                pitem.appendChild(ruleSpan);

                liitem.appendChild(pitem);
            });
                
            outputElement.appendChild(fragment);
        }
    } catch (error) {
        outputElement.innerHTML = `<p class='text-danger' dir='rtl'>تعذر الاتصال بالسيرفر. تأكد من عمل PythonAnywhere. (${error.message})</p>`;
    } finally {
        inspectBtn.disabled = false;
        inspectBtn.innerText = "فحص الكود";
    }
}
