
export type Language = "en" | "mm";

export interface Translation {
  hero: {
    badge: string;
    title: string;
    description: string;
    cta_primary: string;
    cta_secondary: string;
    highlight_whatsapp: string;
    highlight_setup: string;
    highlight_analytics: string;
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  showcase: {
    inventory_badge: string;
    inventory_title: string;
    inventory_subtitle: string;
    inventory_description: string;
    inventory_points: string[];
    social_badge: string;
    social_title: string;
    social_subtitle: string;
    social_description: string;
    social_points: string[];
    reports_badge: string;
    reports_title: string;
    reports_subtitle: string;
    reports_description: string;
    reports_points: string[];
  };
  audience: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    items: { title: string; desc: string }[];
  };
  cta: {
    badge: string;
    title: string;
    description: string;
    cta_primary: string;
    cta_secondary: string;
    trial_info: string;
  };
  how_it_works: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    steps: { title: string; desc: string }[];
    preview_badge: string;
    preview_title: string;
    preview_desc: string;
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    hero: {
      badge: "Efficiency & Accuracy for Online Retail",
      title: "Built to manage online Retail business with efficiency",
      description: "Retail Master is a high-performance platform designed specifically for the modern online merchant. Eliminate order errors and save hours on administration every single day.",
      cta_primary: "Start One Month Free Trial",
      cta_secondary: "Explore Impact",
      highlight_whatsapp: "Viber & WhatsApp Ready",
      highlight_setup: "Zero Hardware Needed",
      highlight_analytics: "Live Sales Accuracy",
    },
    features: {
      badge: "Efficiency First",
      title: "Built for how you",
      subtitle: "actually sell.",
      description: "Every tool is designed to maximize your business impact. No bloat, no jargon—just pure digital efficiency for your store.",
    },
    showcase: {
      inventory_badge: "Accurate Inventory",
      inventory_title: "Automate your stock.",
      inventory_subtitle: "Stop losing sales.",
      inventory_description: "Real-time tracking that alerts you before stock runs out. Precision inventory management that you can choose to enable or disable per product.",
      inventory_points: ["Low-stock alerts & out-of-stock tracking", "Optional stock tracking per item", "Bulk SKU management", "Multi-brand catalog sync"],
      social_badge: "Digital POS",
      social_title: "Close deals in DMs.",
      social_subtitle: "Instant Share Links.",
      social_description: "Generate professional order lists via unique shareable links. Share instantly to WhatsApp, Messenger, and Viber with payment instructions integrated.",
      social_points: ["58mm & 80mm receipt support", "Viber, WhatsApp & Messenger sharing", "Unique customer order links", "Seamless payment account sharing"],
      reports_badge: "Impact Analytics",
      reports_title: "Track your growth",
      reports_subtitle: "with absolute precision.",
      reports_description: "Know exactly which products drive your revenue. Detailed staff roles for Owners, Managers, and Cashiers ensure your data stays secure and accurate.",
      reports_points: ["Owner: Full Control & Full Reports", "Manager: Stock & Shift Operations", "Cashier: POS & Customer Tracking", "Detailed spending history per customer"],
    },
    audience: {
      badge: "The Modern Merchant",
      title: "Scaling with",
      subtitle: "Absolute Confidence.",
      description: "From solo entrepreneurs on social media to established retail teams, we provide the accuracy needed to scale.",
      items: [
        { title: "Social Commerce", desc: "Perfect for sellers on Instagram, Facebook & TikTok." },
        { title: "Online Boutiques", desc: "Run your entire business from your smartphone." },
        { title: "Multi-Brand Hubs", desc: "Manage separate stores with distinct staff permissions." },
        { title: "Wholesale Teams", desc: "Generate bulk orders and track long-term customer value." },
      ],
    },
    cta: {
      badge: "One Month Free Trial",
      title: "Ready to automate your retail business?",
      description: "Join hundreds of online sellers who have already optimized their operations and saved hours of manual work with Retail Master.",
      cta_primary: "Start Your Free Trial Now",
      cta_secondary: "Contact Support",
      trial_info: "1 month full access · No credit card · Professional support included",
    },
    how_it_works: {
      badge: "The Onboarding Flow",
      title: "Up and running in",
      subtitle: "minutes.",
      description: "Our platform is designed for speed. No lengthy setups or complex hardware required — just your browser and a passion to sell.",
      steps: [
        { title: "Set Up Your Store", desc: "Register your store in minutes. Configure branding, currency, and add team members with clear roles." },
        { title: "Add Your Products", desc: "Import your catalogue with pricing and stock levels. Set optional tracking alerts as needed." },
        { title: "Launch Your POS", desc: "Start selling immediately. Share digital receipts via WhatsApp, Viber, or Messenger instantly." },
        { title: "Track & Grow", desc: "Monitor revenue, peak hours, and customer spending history from your analytics centre." },
      ],
      preview_badge: "LIVE POS INTERFACE PREVIEW",
      preview_title: "Zero learning curve. Pure efficiency.",
      preview_desc: "Our interface is built for high-volume retailers. Tap to add, swipe to remove, and share links instantly. It's the POS experience you've always wanted.",
    },
  },
  mm: {
    hero: {
      badge: "အွန်လိုင်းလုပ်ငန်းများအတွက် အကောင်းဆုံး POS စနစ်",
      title: "သင့်လုပ်ငန်းကို အဆင့်မြင့်ပြီး ပိုမိုထိရောက်လာအောင် လုပ်ဆောင်ပါ",
      description: "Retail Master သည် ခေတ်မီအွန်လိုင်းရောင်းချသူများအတွက် အထူးဒီဇိုင်းထုတ်ထားသော POS ဖြစ်သည်။ အော်ဒါအမှားများကို လျှော့ချပေးပြီး စီမံခန့်ခွဲမှုအချိန်များကို သက်သာစေကာ လုပ်ငန်းကို ပိုမိုမြန်ဆန်လာစေပါသည်။",
      cta_primary: "၁ လ အခမဲ့ စမ်းသုံးကြည့်ရန်",
      cta_secondary: "အကျိုးကျေးဇူးများကို ကြည့်ရှုရန်",
      highlight_whatsapp: "Viber နှင့် WhatsApp အဆင်သင့်",
      highlight_setup: "စက်ပစ္စည်းဝယ်ရန် မလိုပါ",
      highlight_analytics: "တိကျသော အရောင်းမှတ်တမ်း",
    },
    features: {
      badge: "ထိရောက်မှု ပထမ",
      title: "သင့်လုပ်ငန်း ပိုမို",
      subtitle: "တိုးတက်အောင်မြင်စေဖို့။",
      description: "လုပ်ငန်းတစ်ခုချင်းစီ၏ လိုအပ်ချက်များကို အကောင်းဆုံးဖြည့်ဆည်းပေးနိုင်ရန် တည်ဆောက်ထားပါသည်။ ရိုးရှင်းပြီး အမှန်တကယ် ထိရောက်သော လုပ်ဆောင်ချက်များသာ ပါဝင်ပါသည်။",
    },
    showcase: {
      inventory_badge: "တိကျသော စတော့မှတ်တမ်း",
      inventory_title: "စတော့များကို စနစ်တကျ ထိန်းသိမ်းပါ။",
      inventory_subtitle: "ပစ္စည်းပြတ်လို့ အရောင်းလွတ်တာမျိုး မရှိစေရ။",
      inventory_description: "ပစ္စည်းပြတ်တော့မည့်အချိန်တွင် အချက်ပေးပေးသည့်အပြင် ပစ္စည်းတစ်ခုချင်းစီအလိုက် စတော့မှတ်စရာလို/မလိုကိုလည်း စိတ်ကြိုက်ရွေးချယ်နိုင်သောကြောင့် စတော့စီမံရတာ ပိုမိုလွယ်ကူလာပါမည်။",
      inventory_points: ["ပစ္စည်းပြတ်ရန်နီးကပ်ပါက အလိုအလျောက် အကြောင်းကြားပေးခြင်း", "ပစ္စည်းအလိုက် စတော့မှတ်စရာလို/မလို ရွေးချယ်နိုင်ခြင်း", "ပစ္စည်းအများအပြားကို တစ်ခါတည်း စီမံနိုင်ခြင်း", "ဆိုင်ခွဲများအကြား စတော့အချက်အလက် ချိတ်ဆက်နိုင်ခြင်း"],
      social_badge: "ဒစ်ဂျစ်တယ် POS စနစ်",
      social_title: "ချက်တင် (Chat) ထဲမှာတင် အရောင်းပိတ်လိုက်ပါ။",
      social_subtitle: "အော်ဒါလင့်ခ်များ ချက်ချင်းပေးပို့ရန်။",
      social_description: "ကျွမ်းကျင်ဆန်သော အော်ဒါမှတ်တမ်းများကို လင့်ခ်များမှတစ်ဆင့် ပေးပို့နိုင်ပါသည်။ WhatsApp, Messenger နှင့် Viber တို့တွင် ငွေပေးချေရန် အချက်အလက်များနှင့်အတူ ချက်ချင်း မျှဝေနိုင်ပါသည်။",
      social_points: ["58mm နှင့် 80mm ဘေလ်စာရွက်စနစ်", "Viber, WhatsApp နှင့် Messenger မျှဝေနိုင်ခြင်း", "ဝယ်ယူသူအတွက် ကိုယ်ပိုင်အော်ဒါလင့်ခ်များ", "ငွေလွှဲအကောင့် အချက်အလက်များကို လွယ်ကူစွာပေးပို့နိုင်ခြင်း"],
      reports_badge: "လုပ်ငန်းသုံးသပ်ခြင်း",
      reports_title: "လုပ်ငန်းတိုးတက်မှုကို",
      reports_subtitle: "တိကျစွာ စောင့်ကြည့်ပါ။",
      reports_description: "မည်သည့်ပစ္စည်းများက အရောင်းအသွက်ဆုံးလဲဆိုတာကို ခွဲခြားသိရှိနိုင်ပါသည်။ ဆိုင်ပိုင်ရှင်၊ မန်နေဂျာ နှင့် အရောင်းဝန်ထမ်း များအတွက် သီးခြားအခွင့်အာဏာများ သတ်မှတ်ပေးထားနိုင်သဖြင့် အချက်အလက်များ လုံခြုံစိတ်ချရပါသည်။",
      reports_points: ["ဆိုင်ပိုင်ရှင်: လုပ်ငန်းတစ်ခုလုံးကို အနှစ်ချုပ် ကြည့်ရှုနိုင်ခြင်း", "မန်နေဂျာ: စတော့နှင့် အဆိုင်းများ စီမံနိုင်ခြင်း", "အရောင်းဝန်ထမ်း: အရောင်းနှင့် ဝယ်သူများကို စီမံနိုင်ခြင်း", "ဝယ်သူတစ်ဦးချင်းစီ၏ ဝယ်ယူမှုမှတ်တမ်းများ"],
    },
    audience: {
      badge: "ခေတ်မီလုပ်ငန်းရှင်များအတွက်",
      title: "ယုံကြည်မှုအပြည့်ဖြင့်",
      subtitle: "လုပ်ငန်းချဲ့ထွင်လိုက်ပါ။",
      description: "တစ်နိုင်တစ်ပိုင် အွန်လိုင်းလုပ်ငန်းရှင်များမှစ၍ အဖွဲ့အစည်းဖြင့် လုပ်ကိုင်နေသော ဆိုင်ခွဲများအထိ လုပ်ငန်းလည်ပတ်မှု ပိုမိုကောင်းမွန်လာစေရန် အထောက်အကူပြုပါသည်။",
      items: [
        { title: "Social Commerce", desc: "Instagram, Facebook နှင့် TikTok ရောင်းချသူများအတွက် အထူးသင့်လျော်သည်။" },
        { title: "အွန်လိုင်းဆိုင်များ", desc: "သင့်ဖုန်းတစ်လုံးတည်းဖြင့် လုပ်ငန်းတစ်ခုလုံးကို လွယ်ကူစွာ စီမံနိုင်သည်။" },
        { title: "ဆိုင်ခွဲများ", desc: "ဆိုင်ခွဲအသီးသီးအတွက် ဝန်ထမ်းခွင့်ပြုချက်များကို သီးခြားစီမံနိုင်သည်။" },
        { title: "လက်ကားလုပ်ငန်းများ", desc: "အော်ဒါအများအပြားကို စနစ်တကျ စီမံနိုင်ပြီး ဝယ်သူမှတ်တမ်းများကို သိမ်းဆည်းနိုင်သည်။" },
      ],
    },
    cta: {
      badge: "၁ လ အခမဲ့ စမ်းသုံးခွင့်",
      title: "သင့်လုပ်ငန်းကို ဒီဂျစ်တယ်စနစ် ပြောင်းလဲဖို့ အဆင်သင့်ဖြစ်ပြီလား?",
      description: "Retail Master ကို အသုံးပြုပြီး အချိန်ကုန်သက်သာကာ အကျိုးအမြတ်ပိုမိုရရှိနေသော ရာပေါင်းများစွာသော အွန်လိုင်းလုပ်ငန်းရှင်များအကြား ပါဝင်လိုက်ပါ။",
      cta_primary: "အခုပဲ အခမဲ့ စမ်းသုံးကြည့်ရန်",
      cta_secondary: "ဆက်သွယ်မေးမြန်းရန်",
      trial_info: "၁ လ အပြည့်အဝ အသုံးပြုနိုင်သည် · Credit Card မလိုပါ · နည်းပညာအကူအညီ ပါဝင်သည်",
    },
    how_it_works: {
      badge: "အသုံးပြုပုံ အဆင့်ဆင့်",
      title: "မိနစ်ပိုင်းအတွင်း",
      subtitle: "စတင်အသုံးပြုနိုင်ပါသည်။",
      description: "ကျွန်ုပ်တို့၏ ပလက်ဖောင်းကို အမြန်ဆုံး အသုံးပြုနိုင်ရန် ဒီဇိုင်းထုတ်ထားပါသည်။ ခက်ခဲသော တပ်ဆင်မှုများ မလိုအပ်ဘဲ ဘရောက်ဇာရှိရုံဖြင့် စတင်နိုင်ပါသည်။",
      steps: [
        { title: "ဆိုင်ဖွင့်လှစ်ခြင်း", desc: "မိနစ်ပိုင်းအတွင်း သင့်ဆိုင်ကို မှတ်ပုံတင်ပါ။ ဆိုင်အချက်အလက်များနှင့် ဝန်ထမ်းအဆင့်ဆင့်ကို သတ်မှတ်ပါ။" },
        { title: "ပစ္စည်းများထည့်သွင်းခြင်း", desc: "သင့်ပစ္စည်းများကို ဈေးနှုန်း၊ စတော့များနှင့်အတူ ထည့်သွင်းပါ။ စတော့မှတ်စရာလို/မလို ရွေးချယ်နိုင်ပါသည်။" },
        { title: "စတင်ရောင်းချခြင်း", desc: "ချက်ချင်းစတင်ရောင်းချပါ။ ဒစ်ဂျစ်တယ်ဘေလ်များကို WhatsApp, Viber နှင့် Messenger တို့မှ ပေးပို့ပါ။" },
        { title: "လုပ်ငန်းတိုးချဲ့ခြင်း", desc: "အရောင်းမှတ်တမ်းများ၊ လူကြိုက်အများဆုံး ပစ္စည်းများနှင့် ဝယ်သူမှတ်တမ်းများကို စောင့်ကြည့်ပါ။" },
      ],
      preview_badge: "POS အသုံးပြုပုံ အစမ်းကြည့်ရှုရန်",
      preview_title: "အလွယ်တကူ အသုံးပြုနိုင်သော စနစ်။",
      preview_desc: "အရောင်းများသော ဆိုင်များအတွက် အထူးရည်ရွယ်ပါသည်။ အော်ဒါများကို လွယ်ကူစွာ ကိုင်တွယ်နိုင်ပြီး ဘေလ်လင့်ခ်များကို ချက်ချင်း ပေးပို့နိုင်ပါသည်။",
    },
  },
};
