const RULES_REGISTRY = {
  eslint: [
    {
      id: "no-var",
      name: "منع استخدام var",
      defaultChecked: true,
      summary: "فرض استخدام let و const بدلاً من var لتجنب مشاكل النطاق (Scope).",
      details: {
        why: "متغيرات var تمتلك نطاق دالة (Function Scope) وترفع (Hoisting) للأعلى، مما يسبب أخطاء خفية عند إعادة التصريح عنها. استخدام let و const يضمن نطاق الكتلة (Block Scope).",
        badCode: "var count = 10;",
        goodCode: "const count = 10;\nlet index = 0;"
      }
    },
    {
      id: "eqeqeq",
      name: "فرض المساواة الصارمة (===)",
      defaultChecked: true,
      summary: "كشف استخدام == و != ومنع التحويل التلقائي للأنواع (Type Coercion).",
      details: {
        why: "المساواة العادية (==) تقوم بتحويل الأنواع بشكل غير متوقع (مثلاً: '0' == false تعطي true)، بينما (===) تقارن القيمة والنوع معاً.",
        badCode: "if (userRole == 'guest')",
        goodCode: "if (userRole === 'guest')"
      }
    },
    {
      id: "no-eval",
      name: "حظر استخدام eval()",
      defaultChecked: true,
      summary: "منع تنفيذ النصوص كأكواد برمجية تجنباً للثغرات الأمنية الحرجة.",
      details: {
        why: "تعتبر eval() منفذاً رئيسياً لثغرات حقن الأكواد (Code Injection) وXSS، حيث تسمح بفك وسرد نصوص مجهولة المصدر وتنفيذها بصلاحيات كاملة.",
        badCode: "eval('console.log(' + userInput + ')');",
        goodCode: "JSON.parse(userInput);"
      }
    },
    {
      id: "no-console",
      name: "تنظيف سجلات التطوير console.log",
      defaultChecked: false,
      summary: "التنبيه على إزالة عبارات الطباعة قبل الترفيع للإنتاج (Production).",
      details: {
        why: "ترك سجلات console قد يؤدي لتسريب بيانات حساسة في واجهة المستكشف (DevTools)، إضافة لتأثيرها السلبي على الأداء.",
        badCode: "console.log('User Token:', token);",
        goodCode: "// إزالة الطباعة أو استخدام مكتبة Logging معتمدة"
      }
    },
    {
      id: "semi",
      name: "فرض الفواصل المنقوطة (;)",
      defaultChecked: true,
      summary: "إلزام وجود الفاصلة المنقوطة في نهاية كل عبارة برمجية.",
      details: {
        why: "تعتمد JavaScript على الإدراج التلقائي للفواصل (ASI)، وهو ما يسفر أحياناً عن إنهاء الجمل في أماكن خاطئة مسبباً أخطاء منطقية صعبة التتبع.",
        badCode: "const x = 5\nconst y = 10",
        goodCode: "const x = 5;\nconst y = 10;"
      }
    }
  ],
  semgrep: [
    {
      id: "insecure-localstorage",
      name: "حماية التخزين المحلي (localStorage)",
      defaultChecked: true,
      summary: "كشف تخزين الرموز أو المفاتيح الحساسة في localStorage.",
      details: {
        why: "التخزين المحلي مكشوف لأي كود JavaScript يعمل في الصفحة، مما يجعله عرضة للسرقة عند حدوث أي ثغرة XSS. الأفضل استخدام HttpOnly Cookies.",
        badCode: "localStorage.setItem('session_token', token);",
        goodCode: "// إرسال الرمز عبر HttpOnly Secure Cookie"
      }
    }
  ],
  custom: [
    {
      id: "todo-fixme-check",
      name: "كشف وسوم الملاحظات المؤقتة",
      defaultChecked: true,
      summary: "البحث عن تعليقات TODO أو FIXME المتروكة في الكود.",
      details: {
        why: "غالباً ما تشير هذه الوسوم إلى منطق غير مكتمل أو حلول مؤقتة يجب معالجتها قبل اعتماد النسخة النهائية.",
        badCode: "// TODO: fix authentication bypass here",
        goodCode: "// معالجة المنطق بالكامل وإزالة التعليق"
      }
    }
  ]
};
