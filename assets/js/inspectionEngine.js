document.addEventListener("DOMContentLoaded", () => {
    // 1. Direct code inspection button handler
    const inspectBtn = document.getElementById("inspectBtn");
    if (inspectBtn) {
        inspectBtn.addEventListener("click", () => {
            const code = document.getElementById("codeInput").value;
            const tool = document.getElementById("toolSelect").value;
            inspectCode(tool, code);
        });
    }

    // 2. Direct code formatting button handler
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

    // 3. URL code inspection button handler (url-inspector.html)
    const inspectUrlBtn = document.getElementById("inspectUrlBtn");
    if (inspectUrlBtn) {
        inspectUrlBtn.addEventListener("click", () => {
            const rawUrl = document.getElementById("urlInput").value;
            inspectUrlCode(rawUrl);
        });
    }

    // 4. Synchronized Line Numbers & Editor Logic
    const codeInput = document.getElementById("codeInput");
    const lineNumbers = document.getElementById("lineNumbers");

    if (codeInput && lineNumbers) {
        function updateLineNumbers() {
            const lines = codeInput.value.split("\n").length;
            lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
        }

        function syncScroll() {
            lineNumbers.scrollTop = codeInput.scrollTop;
        }

        codeInput.addEventListener("input", updateLineNumbers);
        codeInput.addEventListener("scroll", syncScroll);

        // Initial setup
        updateLineNumbers();
    }
});

/* ==========================================
   Core Engine & API Functions
   ========================================== */

// A) Inspect direct code input
async function inspectCode(tool, code) {
    const resultsContainer = document.getElementById("results");
    const inspectBtn = document.getElementById("inspectBtn");

    if (!code.trim()) {
        resultsContainer.innerHTML = "";
        showAlert(resultsContainer, "⚠️ Warning:", "Enter your code first.");
        return;
    }

    if (inspectBtn) {
        inspectBtn.disabled = true;
        inspectBtn.innerText = "Inspecting...";
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
        showAlert(resultsContainer, "❌ Connection Error", `Unable to connect to server. Ensure PythonAnywhere is running. (${error.message})`, "error");
    } finally {
        if (inspectBtn) {
            inspectBtn.disabled = false;
            inspectBtn.innerText = "Inspect Code";
        }
    }
}

// B) Inspect code from raw URL
async function inspectUrlCode(rawUrl) {
    const resultsContainer = document.getElementById("results");
    const inspectUrlBtn = document.getElementById("inspectUrlBtn");

    if (!rawUrl.trim()) {
        resultsContainer.innerHTML = "";
        showAlert(resultsContainer, "⚠️ Warning:", "Enter raw URL first.");
        return;
    }

    if (inspectUrlBtn) {
        inspectUrlBtn.disabled = true;
        inspectUrlBtn.innerText = "Fetching & Inspecting...";
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
        showAlert(resultsContainer, "❌ Connection Error", `Verify the link and ensure the server is active. (${error.message})`, "error");
    } finally {
        if (inspectUrlBtn) {
            inspectUrlBtn.disabled = false;
            inspectUrlBtn.innerText = "Fetch & Inspect";
        }
    }
}

// C) Format code
async function formatCode(language, codeInputEl) {
    const formatBtn = document.getElementById("formatBtn");
    const resultsContainer = document.getElementById("results");
    const code = codeInputEl.value;

    if (!code.trim()) {
        showAlert(resultsContainer, "⚠️ Warning:", "Please enter code first to format.");
        return;
    }

    if (formatBtn) {
        formatBtn.disabled = true;
        formatBtn.innerText = "Formatting...";
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
            // Dispatch input event to recalculate line numbers after formatting
            codeInputEl.dispatchEvent(new Event('input'));
        } else {
            showAlert(resultsContainer, "❌ Formatting Failed:", data.message || "Unknown error occurred.", "error");
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

/* ==========================================
   UI Rendering Helpers
   ========================================== */

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

function renderResults(container, data) {
    container.innerHTML = "";
    const issueTpl = document.getElementById("issue-template");

    if (data.raw_error) {
        showAlert(container, "⚠️ Server Error:", data.raw_error, "error");
        return;
    }

    const toolName = data.tools_run ? data.tools_run.join(" + ") : (data.tool || "Inspector");
    const issues = data.issues || [];

    if (issues.length === 0) {
        showAlert(container, `✔ Inspection Results (${toolName})`, "Code is clean! No errors or warnings found.", "success");
        return;
    }

    const header = document.createElement("p");
    header.style.fontWeight = "bold";
    header.style.marginBottom = "12px";
    header.textContent = `Found ${data.total_issues || issues.length} issues/warnings (${toolName}):`;
    container.appendChild(header);

    issues.forEach(issue => {
        const clone = issueTpl.content.cloneNode(true);
        const itemNode = clone.querySelector(".issue-item");
        const isError = issue.severity === "error" || issue.type === "error";

        if (issue.severity) itemNode.classList.add(issue.severity);

        const badgeNode = clone.querySelector(".issue-badge");
        badgeNode.classList.add(isError ? "badge-error" : "badge-warning");
        badgeNode.textContent = isError ? "Error" : "Warning";

        const toolBadge = issue.tool ? ` [${issue.tool}]` : "";
        const line = issue.line || "?";
        const column = issue.column || "?";
        clone.querySelector(".issue-location").textContent = `Line ${line}, Column ${column}${toolBadge}`;

        let cleanMessage = issue.message || "";
        const ruleName = issue.rule || issue.rule_id;
        if (ruleName && cleanMessage.endsWith(`(${ruleName})`)) {
            cleanMessage = cleanMessage.slice(0, -`(${ruleName})`.length).trim();
        }
        clone.querySelector(".issue-message").textContent = cleanMessage;

        const ruleElement = clone.querySelector(".issue-rule");
        if (ruleName) {
            ruleElement.textContent = `rule: ${ruleName}`;
        } else {
            ruleElement.remove();
        }

        container.appendChild(clone);
    });
}
