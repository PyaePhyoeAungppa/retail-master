
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
// ... existing hero translations ...
    },
// ... existing other translations ...
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
// ... existing mm hero translations ...
// ... existing mm other translations ...
    cta: {
      badge: "၁ လ အခမဲ့ စမ်းသုံးခွင့်",
      title: "သင့်လုပ်ငန်းကို အလိုအလျောက် စနစ်ပြောင်းလဲဖို့ အဆင်သင့်ပဲလား?",
      description: "Retail Master ကို အသုံးပြုပြီး အချိန်ကုန်သက်သာကာ အကျိုးအမြတ်ပိုမိုရရှိနေသော ရာပေါင်းများစွာသော အွန်လိုင်းလုပ်ငန်းရှင်များအကြား ပါဝင်လိုက်ပါ။",
      cta_primary: "အခုပဲ အခမဲ့ စမ်းသုံးကြည့်ပါ",
      cta_secondary: "ဆက်သွယ်မေးမြန်းရန်",
      trial_info: "၁ လ အပြည့်အဝ အသုံးပြုနိုင်သည် · Credit Card မလိုပါ · နည်းပညာအကူအညီ ပါဝင်သည်",
    },
    how_it_works: {
      badge: "အသုံးပြုပုံ အဆင့်ဆင့်",
      title: "မိနစ်ပိုင်းအတွင်း",
      subtitle: "စတင်အသုံးပြုနိုင်သည်၏။",
      description: "ကျွန်ုပ်တို့၏ ပလက်ဖောင်းကို အမြန်ဆုံး အသုံးပြုနိုင်ရန် ဒီဇိုင်းထုတ်ထားပါသည်။ ခက်ခဲသော တပ်ဆင်မှုများ မလိုအပ်ဘဲ ဘရောက်ဇာရှိရုံဖြင့် စတင်နိုင်ပါသည်။",
      steps: [
        { title: "ဆိုင်ဖွင့်လှစ်ခြင်း", desc: "မိနစ်ပိုင်းအတွင်း သင့်ဆိုင်ကို မှတ်ပုံတင်ပါ။ ဆိုင်အချက်အလက်များနှင့် ဝန်ထမ်းအခွင့်အာဏာများကို သတ်မှတ်ပါ။" },
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

