const sendBtn = document.getElementById("ai-chat-send-btn");
const inputField = document.getElementById("ai-chat-input");
const messagesContainer = document.getElementById("ai-chat-messages");

sendBtn.addEventListener("click", async () => {
  const question = inputField.value.trim();
  if (!question) return;

  // 1. عرض سؤال المستخدم في الشات
  appendMessage(question, "user");
  inputField.value = "";

  // 2. إظهار رسالة "جاري التفكير..."
  const loadingId = appendMessage("جاري صياغة الإجابة...", "ai", true);

  // إرسال الطلب لنفس النموذج المستقر الذي جربناه
  const promptForCodeInspector = "أنت خبير في فحص الكود البرمجي وإصلاحه لموقع يقوم بفحص كود ، html, css, javascript, python.  الموقع هو https://interactivemathdz.github.io/code_inspector/. أجب بدقة بناءً على ما يقدمه الموقع.";

  askCentralAI(question, promptForCodeInspector).then(reply => {
      updateMessage(loadingId, reply);
  });
});

function appendMessage(text, sender, isLoading = false) {
  const msgDiv = document.createElement("div");
  const id = "msg-" + Date.now();
  msgDiv.id = id;
  if (sender === "user") {
    msgDiv.classList.add("user-question");
  } else {
    msgDiv.classList.add("bot-response");
    if (isLoading) msgDiv.style.fontStyle = "italic";
  }

  msgDiv.textContent = text;
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return id;
}

function updateMessage(id, newText) {
  const msgDiv = document.getElementById(id);
  if (msgDiv) {
    msgDiv.innerHTML = marked.parse(newText);
    msgDiv.style.fontStyle = "normal";
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([msgDiv]).catch((err) => console.log('MathJax error:', err));
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

async function askCentralAI(userQuestion, customPrompt) {
  try {
    const response = await fetch(
      "https://ai-proxy-server-reul.vercel.app/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userQuestion,
          systemPrompt: customPrompt,
        }),
      },
    );

    const data = await response.json();

    // التصحيح هنا: الاعتماد على response.ok أو وجود data.reply
    if (response.ok && data.reply) {
      return data.reply;
    } else {
      console.error("خطأ من السيرفر:", data.error || data.reply);
      return "عذراً، حدث خطأ أثناء الاتصال بالخادم.";
    }
  } catch (error) {
    console.error("خطأ في الشبكة:", error);
    return "عذراً، تعذر الاتصال بالخدمة.";
  }
}
