import React from "react";
import BotThinkingBubble from "@/components/chat/BotThinkingBubble";

type Message = {
  type: "user" | "bot";
  text: string;
};

type MessagesListProps = {
  messages: Message[];
  isLoading: boolean;
  isSwitching: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  cleanText: (text: string) => string;
};

type Tone = "green" | "red" | "amber" | "purple" | "blue" | "slate";

type HeaderBlock = { type: "header"; text: string; tone: Tone };
type ItemBlock = { type: "item"; title: string; lines: string[]; tone: Tone };
type MetricBlock = { type: "metric"; text: string };
type TextBlock = { type: "text"; text: string };
type TableBlock = { type: "table"; headers: string[]; rows: string[][]; tone: Tone };
type BotBlock = HeaderBlock | ItemBlock | MetricBlock | TextBlock | TableBlock;

const FIELD_LABELS = [
  "نوع المغسلة",
  "المغسلة",
  "الشريحة",
  "مع الخصم",
  "بدون الخصم",
  "القرار",
  "السبب",
] as const;

const HEADER_EMOJI_ONLY = /^(📊|🔎|✅|⛔|🚀|🎯|🔁|🟢|🧪|⚙️|📈|💡|🛑|⚠️|💎|🚨|🏬|📉|💰|🎟️|🚦|🧺|🧭|📦|🛡️|🛡|🚫|🗓️|🗓|📍)$/;

function cleanHeaderEmojiNoise(line: string) {
  return line
    .replace(/^(📊|🔎|✅|⛔|🚀|🎯|🔁|🟢|🧪|⚙️|📈|💡|🛑|⚠️|💎|🚨|🏬|📉|💰|🎟️|🚦|🧺|🧭|📦|🛡️|🛡|🚫|🗓️|🗓|📍)(?:\s+\1)+/u, "$1")
    .replace(/^(⚙️)\s+⚙️\s+(?=ما الذي أوصي به|ماذا تعمل الآن|التنفيذ)/u, "$1 ")
    .replace(/^(📊)\s+📊\s+(?=الخلاصة|النتيجة|ماذا حصل)/u, "$1 ")
    .replace(/^(🔎)\s+🔎\s+(?=الملخص|التحليل)/u, "$1 ")
    .trim();
}

const INLINE_HEADER_MARKERS = [
  "الخلاصة التنفيذية:",
  "الملخص المالي:",
  "الملخص العام:",
  "ماذا حصل؟",
  "ما معنى هذا؟",
  "التفسير الأقرب:",
  "القراءة التنفيذية:",
  "القرار التنفيذي:",
  "ما الذي أوصي به:",
  "أكثر القطع مبيعًا في هذا اليوم:",
  "📈 الاتجاه الشهري:",
  "🔎 أين المشكلة؟",
  "🔁 الاحتفاظ:",
  "🎟️ أثر الأثر المالي والخصومات:",
  "🚦 القرارات التنفيذية ذات",
  "📈 كيف نقيس النتيجة؟",
  "📦 شرائح الأفضل فيها Bundle / Upsell بدل الخصم:",
  "📦 شرائح الأفضل فيها Upsell بدل الخصم:",
  "📦 شرائح الأفضل فيها Bundle بدل الخصم:",
  "🛡️ شرائح قوية نحافظ عليها بدون خصم:",
  "🛡 شرائح قوية نحافظ عليها بدون خصم:",
  "💎 أفضل 3 فرص للأشهر القادمة:",
  "🎟️ ماذا كشف فحص الأثر المالي؟",
  "📉 التغير الشهري المختصر:",
  "💎 أكبر فرصة:",
  "🚨 أكبر خطر:",
  "💰 حجم الأثر المالي:",
  "💰 ماذا تعني النتائج ماليًا؟",
  "🔎 ماذا يعني هذا عمليًا؟",
  "🎯 ماذا نعمل؟",
  "👥 ماذا عن العملاء؟",
  "💰 ماذا تعني النتيجة؟",
  "💰 ماذا يعني هذا عمليًا؟",
  "🎯 الخلاصة",
  " 💰 ماذا تعني هذه النتيجة؟",
  "💰 ماذا يعني هذا؟",
  "🔎 لماذا أوصي بهذا القرار؟",
  "🔎 لماذا لا أكررها بنفس الشكل؟",
  "💰 المقارنة المالية",
  "📊 لماذا هذا العرض؟",
  "🧪 كيف نختبره؟",
  "💰 ماذا تعني ماليًا؟",
  " 📊 القرار التنفيذي",
  "🔁 الرجوع بعد الخصم",
  "💰 الأثر المالي:",
  "💰 الأثر المالي",
  "🎟️ قرار الخصومات:",
  "🧭 خريطة قرارات الخصم:",
  "🧭 خريطة قرارات الخصم",
  "🚫 شرائح نوقف عنها الخصم:",
  "🚫 شرائح نوقف عنها الخصم",
  "🎯 شرائح تحتاج A/B Test:",
  "🎯 شرائح تحتاج A/B Test",
  "🧪 شرائح تحتاج A/B Test:",
  "🧪 شرائح تحتاج A/B Test",
  "🚨 أكبر 3 مخاطر:",
  "🏬 أقوى المغاسل:",
  "📉 التغير الأساسي:",
  "🔎 ما الذي سبّب التغير؟",
  "🎟️أثر الخصومات:",
  "⛔ أين لا نوسع البروموكود؟",
  "📉 مؤشرات أساسية:",
  "✅ أين يمكن الاختبار؟",
  "📉 مؤشرات الأداء الرئيسية:",
  "🔎 ما الذي أثبتته البيانات؟",
  "🎟️ أين نختبر البروموكود؟",
  "🏬 أين نتحرك؟",
  "⛔ ماذا لا نعمل:",
  "⛔ ماذا لا نعمل؟",
  "⚙️ ماذا نعمل الآن؟",
  "🔎 ماذا أثبتت البيانات:",
  "🧺 أكثر القطع تأثيرًا:",
  "⚙️ ماذا نعمل الآن:",
  "أقوى المغاسل التي ظهرت على مستوى الشرائح:",
  "الخصومات كانت موجودة لكن ليست وحدها المحرك:",
] as const;

const INLINE_BREAK_MARKERS = [
  "وأقوى المغاسل التي ظهرت",
  "أقوى المغاسل التي ظهرت",
  "أثر الخصومات:",
  "الخصومات كانت موجودة",
  "الدخل القوي في",
  "يوجد أيضًا طلب عضوي قوي",
  "كرر نفس النمط",
  "لا تفترض أنه مشكلة خصم فقط",
  "هذا النمط",
  "ما أستطيع قوله بثقة",
  "هل كان هناك إغلاق",
  "هل حصل خلل",
  "هل كانت هناك حملة",
  "هل انخفضت جودة",
] as const;

const toneClasses: Record<
  Tone,
  {
    header: string;
    item: string;
    pill: string;
    chip: string;
    box: string;
    soft: string;
  }
> = {
  blue: {
    header: "border-blue-500 bg-blue-500/10 text-blue-100",
    item: "border-blue-500/30 bg-blue-500/10",
    pill: "bg-blue-500 text-white",
    chip: "border-blue-400/30 bg-blue-500/15 text-blue-100",
    box: "border-slate-700/70 bg-slate-950/35",
    soft: "bg-blue-500/10",
  },
  green: {
    header: "border-emerald-500 bg-emerald-500/10 text-emerald-100",
    item: "border-emerald-500/35 bg-emerald-500/10",
    pill: "bg-emerald-500 text-white",
    chip: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
    box: "border-emerald-500/20 bg-slate-950/35",
    soft: "bg-emerald-500/10",
  },
  red: {
    header: "border-rose-500 bg-rose-500/10 text-rose-100",
    item: "border-rose-500/35 bg-rose-500/10",
    pill: "bg-rose-500 text-white",
    chip: "border-rose-400/30 bg-rose-500/15 text-rose-100",
    box: "border-rose-500/20 bg-slate-950/35",
    soft: "bg-rose-500/10",
  },
  amber: {
    header: "border-amber-500 bg-amber-500/10 text-amber-100",
    item: "border-amber-500/35 bg-amber-500/10",
    pill: "bg-amber-500 text-slate-950",
    chip: "border-amber-400/30 bg-amber-500/15 text-amber-100",
    box: "border-amber-500/20 bg-slate-950/35",
    soft: "bg-amber-500/10",
  },
  purple: {
    header: "border-violet-500 bg-violet-500/10 text-violet-100",
    item: "border-violet-500/35 bg-violet-500/10",
    pill: "bg-violet-500 text-white",
    chip: "border-violet-400/30 bg-violet-500/15 text-violet-100",
    box: "border-violet-500/20 bg-slate-950/35",
    soft: "bg-violet-500/10",
  },
  slate: {
    header: "border-slate-500 bg-slate-700/40 text-slate-100",
    item: "border-slate-600 bg-slate-800/70",
    pill: "bg-slate-600 text-white",
    chip: "border-slate-600 bg-slate-800 text-slate-100",
    box: "border-slate-700/70 bg-slate-950/35",
    soft: "bg-slate-800/50",
  },
};

function sectionTone(line: string): Tone {
  const x = line.trim();

  if (x.startsWith("✅") || x.startsWith("🟢") || x.startsWith("🛡")) return "green";
  if (x.startsWith("⛔") || x.startsWith("❌") || x.startsWith("🔴") || x.startsWith("🛑") || x.startsWith("🚨") || x.startsWith("🚫")) return "red";
  if (x.startsWith("🚀") || x.startsWith("🟡") || x.startsWith("⚠️") || x.startsWith("💎") || x.startsWith("💰") || x.startsWith("🎟️") || x.startsWith("📦")) return "amber";
  if (x.startsWith("🎯") || x.startsWith("🔁") || x.startsWith("⚙️") || x.startsWith("🧪") || x.startsWith("🚦") || x.startsWith("🗓")) return "purple";
  if (x.startsWith("📈") || x.startsWith("🔎") || x.startsWith("📊") || x.startsWith("💡") || x.startsWith("🏬") || x.startsWith("📉") || x.startsWith("🧺") || x.startsWith("🧭") || x.startsWith("📍")) return "blue";
  if (/الملخص|الخلاصة|النتيجة|التحليل|الشرائح الأهم|ماذا حصل|ما معنى هذا|أكثر القطع|أقوى المغاسل|أثر الخصومات|الخصومات/i.test(x)) return "blue";
  if (/استحواذ|احتفاظ|CRM|Win-back|Loyalty|ماذا تعمل الآن|ما الذي أوصي به|القرار|القراءة التنفيذية|التفسير الأقرب/i.test(x)) return "purple";
  if (/Upsell|Bundle|رفع السلة|متوسط السلة/i.test(x)) return "amber";
  if (/أوقف|إيقاف|لا تعمل خصم|توقف عنها/i.test(x)) return "red";
  if (/خصم محدود|شرائح قوية|بدون خصم/i.test(x)) return "green";

  return "slate";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLine(line: string) {
  const cleaned = line
    .replace(/\u200f/g, "")
    .replace(/\u200e/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([|:،؛])/g, "$1")
    .replace(/([:،؛])(?=\S)/g, "$1 ")
    .replace(/\|/g, " | ")
    .replace(/\s+\|\s+/g, " | ")
    .replace(/^[.،؛]\s+(?=📊|🔎|✅|⛔|🚀|🎯|🔁|🟢|🧪|⚙️|📈|💡|🛑|⚠️|💎|🚨|🏬|📉|💰|🎟️|🚦|🧺|🧭|📦|🛡️|🛡|🚫|🗓️|🗓|📍)/u, "")
    .trim();

  return cleanHeaderEmojiNoise(cleaned);
}


const HEADER_EMOJI_PATTERN =
  /(📊|🔎|✅|⛔|🚀|🎯|🔁|🟢|🧪|⚙️|📈|💡|🛑|⚠️|💎|🚨|🏬|📉|💰|🎟️|🚦|🧺|🧭|📦|🛡️|🛡|🚫|🗓️|🗓|📍)/u;

function looksLikeDynamicHeader(text: string) {
  const x = normalizeLine(text);

  if (!x || !HEADER_EMOJI_PATTERN.test(x)) return false;
  if (x.length > 110) return false;
  if (isFieldLine(x) || isMetricLine(x)) return false;

  return (
    /^📊\s*(KPI|الخلاصة|النتيجة|مؤشرات|ماذا|أين)/i.test(x) ||
    /^📈\s*(أين|المؤشر|كيف|الأثر|التأثير|مؤشرات|الاتجاه)/.test(x) ||
    /^🎯\s*(أين|الخطة|التنفيذ|القرار|شرائح|ماذا|هدف|الهدف)/.test(x) ||
    /^⚙️\s*(ماذا|التنفيذ|ما الذي|خطوات|الإجراء)/.test(x) ||
    /^🚫\s*(ماذا|لا|شرائح|أين)/.test(x) ||
    /^⛔\s*(ماذا|لا|أين|شرائح|أوقف)/.test(x) ||
    /^🧪\s*(KPI|شكل|اختبار|شرائح|A\/B)/i.test(x) ||
    /^🧭\s*(خريطة|قرار|قرارات)/.test(x) ||
    /^📦\s*(أين|شرائح|Bundle|Upsell)/i.test(x) ||
    /^💰\s*(الأثر|حجم|مالي|المالي)/.test(x) ||
    /^🗓️?\s*(خطة|التطبيق|الجدول)/.test(x) ||
    /^📍\s*(النطاق|أين|المكان)/.test(x) ||
    /^🛡️?\s*(شرائح|قوية)/.test(x) ||
    /^🔎\s*(أين|ما|ماذا|التحليل|الملخص)/.test(x) ||
    /^✅\s*(أين|شرائح|ما)/.test(x) ||
    /^🏬\s*(أين|أقوى)/.test(x)
  );
}

function splitHeaderLabelAndValue(line: string) {
  const x = normalizeLine(line);

  if (!looksLikeDynamicHeader(x)) return [x];

  const match = x.match(/^((?:📊|🔎|✅|⛔|🚀|🎯|🔁|🟢|🧪|⚙️|📈|💡|🛑|⚠️|💎|🚨|🏬|📉|💰|🎟️|🚦|🧺|🧭|📦|🛡️|🛡|🚫|🗓️|🗓|📍)\s*[^:：]{1,45})\s*[:：]\s+(.+)$/u);

  if (!match) return [x];

  const header = normalizeLine(`${match[1]}:`);
  const value = normalizeLine(match[2]);

  if (!value) return [header];

  return [header, value];
}

function splitDynamicHeaderEmojis(line: string) {
  let parts = [normalizeLine(line)];

  for (let guard = 0; guard < 10; guard++) {
    let changed = false;

    parts = parts.flatMap((part) => {
      const matches = Array.from(part.matchAll(new RegExp(HEADER_EMOJI_PATTERN.source, "gu")));

      for (const match of matches) {
        const idx = match.index ?? -1;
        if (idx <= 0) continue;

        const before = normalizeLine(part.slice(0, idx));
        const after = normalizeLine(part.slice(idx));

        if (!before || !after) continue;

        if (looksLikeDynamicHeader(after)) {
          changed = true;
          return [before, after].filter(Boolean);
        }
      }

      return [part];
    });

    if (!changed) break;
  }

  return parts.flatMap((part) => splitHeaderLabelAndValue(part));
}

function splitByHeaderMarkers(line: string) {
  let parts = [normalizeLine(line)];

  // افصل العناوين المعروفة حتى لو كانت ملزوقة بعد رقم/جملة بنفس السطر
  // ونكرر الفصل حتى لو في أكثر من عنوان بنفس السطر، مثل:
  // 🧭 خريطة قرارات الخصم ... 🚫 شرائح نوقف عنها الخصم
  for (const marker of INLINE_HEADER_MARKERS) {
    let keepSplitting = true;

    while (keepSplitting) {
      keepSplitting = false;

      parts = parts.flatMap((part) => {
        const idx = part.indexOf(marker);

        if (idx > 0) {
          keepSplitting = true;
          return [normalizeLine(part.slice(0, idx)), normalizeLine(part.slice(idx))].filter(Boolean);
        }

        return [part];
      });
    }
  }

  return parts;
}

function splitFusedExplanation(line: string) {
  const cleaned = normalizeLine(line);
  const indexes = INLINE_BREAK_MARKERS.map((marker) => cleaned.indexOf(marker)).filter((idx) => idx > 18);

  if (indexes.length === 0) return [cleaned];

  const idx = Math.min(...indexes);
  const before = normalizeLine(cleaned.slice(0, idx));
  const after = normalizeLine(cleaned.slice(idx));

  if (!before || !after) return [cleaned];

  const beforeLooksLikeSeparateValue =
    before.includes(" - ") ||
    before.includes(" | ") ||
    /[A-Za-z].*:\s*\S+/.test(before) ||
    /(Laundry|laundry|Company|solutions|Clean|Qitaf|Khuyut|Amwaj|Smart tech|Shirt|Boxer|Trouser|Socks|Thob|Undershirt)/i.test(before);

  if (!beforeLooksLikeSeparateValue) return [cleaned];

  return [before, after];
}

function smartSplitLine(line: string) {
  return splitByHeaderMarkers(line)
    .flatMap((part) => splitDynamicHeaderEmojis(part))
    .flatMap((part) => splitFusedExplanation(part))
    .flatMap((part) => splitDynamicHeaderEmojis(part))
    .map((part) => normalizeLine(part))
    .filter(Boolean);
}

function mergeOrphanHeaderEmojis(lines: string[]) {
  const merged: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const current = normalizeLine(lines[i] || "");
    const next = normalizeLine(lines[i + 1] || "");

    if (!current) continue;

    // لو عندنا إيموجي لحاله وبعده إيموجي لحاله، تجاهل الأول
    if (HEADER_EMOJI_ONLY.test(current) && HEADER_EMOJI_ONLY.test(next)) {
      continue;
    }

    // لو الإيموجي لحاله وبعده عنوان، ادمجهم
    if (HEADER_EMOJI_ONLY.test(current) && next && !HEADER_EMOJI_ONLY.test(next)) {
      merged.push(cleanHeaderEmojiNoise(`${current} ${next}`));
      i += 1;
      continue;
    }

    // لا تضيف إيموجي لحاله ككرت
    if (HEADER_EMOJI_ONLY.test(current)) {
      continue;
    }

    merged.push(current);
  }

  return merged.filter(Boolean);
}

function normalizeBotText(text: string) {
  if (!text) return "";

  let out = text
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/^\s*---+\s*$/gm, "")

    .replace(/\s*(📊\s*(?:KPI|الخلاصة التنفيذية|النتيجة|الخلاصة)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🔎\s*(?:الملخص العام|الملخص المالي|أهم 3 استنتاجات|أهم ما ظهر من التحليل|التحليل|الشرائح الأهم[^\n:]*)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(✅\s*(?:شرائح[^\n:]*|أين الخصم مفيد[^\n:]*)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(⛔\s*(?:شرائح[^\n:]*|أين يجب إيقاف الخصم[^\n:]*|أوقف الخصم[^\n:]*)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🚫\s*(?:شرائح نوقف عنها الخصم)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🚀\s*(?:شرائح[^\n:]*|الأفضل[^\n:]*|Upsell[^\n:]*)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(📦\s*(?:أين نستثمر|شرائح الأفضل فيها\s*(?:Bundle\s*\/\s*)?Upsell\s*بدل الخصم|شرائح الأفضل فيها\s*Bundle\s*بدل الخصم)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🛡️?\s*(?:شرائح قوية نحافظ عليها بدون خصم)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🎯\s*(?:الهدف|أين أركز أولًا|الخطة المختصرة جدًا|شرائح تحتاج A\/B Test|شرائح تحتاج استحواذ|يحتاج استحواذ|القرار|القرار النهائي)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🔁\s*(?:شرائح تحتاج احتفاظ|تحتاج احتفاظ|CRM|Win-back|Loyalty)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🟢\s*(?:شرائح[^\n:]*|شرائح قوية[^\n:]*|شرائح صحية[^\n:]*|قوية[^\n:]*)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🧪\s*(?:شكل الاختبار|KPI للمتابعة خلال الأسبوع|شرائح تحتاج A\/B Test|شرائح[^\n:]*|اختبار[^\n:]*|A\/B[^\n:]*)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(⚙️\s*(?:التنفيذ|ماذا تعمل الآن|ما الذي أوصي به)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(📈\s*(?:الأثر المتوقع|التأثير المتوقع)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(💎\s*(?:أفضل 3 فرص للأشهر القادمة|أكبر فرصة)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🚨\s*(?:أكبر 3 مخاطر|أكبر خطر)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🏬\s*(?:أين نتحرك|أقوى المغاسل)\s*[؟?]?\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(💰\s*(?:الأثر المالي|حجم الأثر المالي)\s*:?)\s*/g, "\n$1\n")
    .replace(/\s*(🎟️\s*(?:قرار الخصومات|ماذا كشف فحص الأثر المالي|أين نختبر البروموكود)\s*[؟?]?\s*:?)\s*/g, "\n$1\n")
    .replace(/\s+(?=🧭\s*خريطة قرارات الخصم)/g, "\n")
    .replace(/(🧭\s*خريطة قرارات الخصم\s*[:：]?)/g, "\n$1")
    .replace(/\s+(?=🚫\s*شرائح نوقف عنها الخصم)/g, "\n")
    .replace(/(🚫\s*شرائح نوقف عنها الخصم\s*[:：]?)/g, "\n$1")
    .replace(/\s*(📉\s*(?:التغير الشهري المختصر|التغير الأساسي|مؤشرات أساسية|مؤشرات الأداء الرئيسية)\s*:?)\s*/g, "\n$1\n")

    .replace(/\s+(الخلاصة التنفيذية\s*:)/g, "\n$1\n")
    .replace(/\s+(ماذا حصل\s*[؟?:：])/g, "\n$1\n")
    .replace(/\s+(ما معنى هذا\s*[؟?:：])/g, "\n$1\n")
    .replace(/\s+(التفسير الأقرب\s*:)/g, "\n$1\n")
    .replace(/\s+(القراءة التنفيذية\s*:)/g, "\n$1\n")
    .replace(/\s+(القرار التنفيذي\s*:)/g, "\n$1\n")
    .replace(/\s+(ما الذي أوصي به\s*:)/g, "\n⚙️ $1\n")
    .replace(/\s+(الملخص المالي\s*:)/g, "\n$1\n")
    .replace(/\s+(الملخص العام\s*:)/g, "\n$1\n")
    .replace(/\s+(القرار النهائي\s*:)/g, "\n$1\n")
    .replace(/\s+(الأثر المتوقع\s*:)/g, "\n$1\n")
    .replace(/\s+(التأثير المتوقع\s*:)/g, "\n$1\n")
    .replace(/\s+(التنفيذ\s*:)/g, "\n$1\n")
    .replace(/\s+(ماذا تعمل الآن\s*:)/g, "\n$1\n")

    .replace(/\s+[-•]\s+/g, "\n- ")
    .replace(/(^|\s)(\d+[\.)]\s+)/g, "\n$2");

  const fieldPattern = [...FIELD_LABELS]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  out = out.replace(
    new RegExp(`\\s+(-?\\s*(?:\\d+[\\.\\)]\\s*)?(?:${fieldPattern})\\s*[:：])`, "g"),
    "\n$1"
  );

  // افصل المقاييس التي قد تأتي ملزوقة داخل سطر الشريحة أو السبب
  out = out
    .replace(/\s+(?=(?:الطلبات|العملاء|الإيراد|متوسط السلة|الخصومات|الصرف الإعلاني|صافي أثر الإيراد|النتيجة واضحة|لنتيجة واضحة|مع البروموكود|مع الخصم|بدون خصم|بدون الخصم|قيمة البروموكود|ضغط الخصم|متوسط القطع\/طلب|repeat rate|AOV)\s*[:：])/g, "\n")
    .replace(/\s+(?=متوسط السلة\s+من\s+\d)/g, "\n")
    .replace(/\s+(?=صافي أثر الإيراد بعد الصرف الإعلاني)/g, "\n")
    .replace(/\s+(?=النتيجة واضحة\s*[:：])/g, "\n")
    .replace(/\s+(?=لنتيجة واضحة\s*[:：])/g, "\n")
    .replace(/\s+(?=💰\s*الأثر المالي)/g, "\n")
    .replace(/\s+(?=📦\s*أين نستثمر)/g, "\n")
    .replace(/\s+(?=🗓️?\s*خطة التطبيق)/g, "\n")
    .replace(/\s+(?=📍\s*النطاق)/g, "\n")
    .replace(/\s+(?=🎯\s*الهدف)/g, "\n")
    .replace(/\s+(?=🧪\s*شكل الاختبار)/g, "\n")
    .replace(/\s+(?=📊\s*KPI)/g, "\n")
    .replace(/\s+(?=📦\s*شرائح الأفضل فيها)/g, "\n")
    .replace(/\s+(?=🛡️?\s*شرائح قوية نحافظ عليها بدون خصم)/g, "\n")
    .replace(/\s+(?=🚫\s*شرائح نوقف عنها الخصم)/g, "\n")
    .replace(/\s+(?=🎯\s*شرائح تحتاج A\/B Test)/g, "\n")
    .replace(/\s+(?=🧪\s*شرائح تحتاج A\/B Test)/g, "\n")
    .replace(/\s+(?=🧭\s*خريطة قرارات الخصم)/g, "\n");

  out = out.replace(/نوع\s*\n\s*المغسلة\s*[:：]/g, "نوع المغسلة:");

  out = out
    .replace(/\s+(-\s*دخل الطلبات بدون خصم\s*:)/g, "\n$1")
    .replace(/\s+(-\s*صافي دخل الطلبات التي استخدمت خصم\s*:)/g, "\n$1")
    .replace(/\s+(-\s*قيمة الخصومات المخصومة\s*:)/g, "\n$1")
    .replace(/\s+(-\s*دخل الطلبات المخفضة قبل الخصم\s*:)/g, "\n$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  out = out
    .split("\n")
    .flatMap((line) => smartSplitLine(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return out;
}

function cleanNumberedPrefix(line: string) {
  return normalizeLine(line.replace(/^[-•]\s*/, "").replace(/^\d+[\.)]\s+/, ""));
}

function getLabelValue(line: string): { label: string; value: string } | null {
  const cleaned = cleanNumberedPrefix(line);
  const match = cleaned.match(/^([^:：]{2,55})\s*[:：]\s*(.*)$/);
  if (!match) return null;

  const label = match[1].trim();
  let value = match[2].trim();

  if (label === "المغسلة") value = value.replace(/\s+نوع\s*$/i, "").trim();

  return { label, value };
}

function isKnownFieldLabel(label: string) {
  return FIELD_LABELS.includes(label as (typeof FIELD_LABELS)[number]);
}

function isFieldLine(line: string) {
  const parsed = getLabelValue(line);
  return Boolean(parsed && isKnownFieldLabel(parsed.label));
}

function fieldLabel(line: string) {
  return getLabelValue(line)?.label || "";
}

function isHeaderLine(line: string) {
  const x = line.trim();

  if (!x || isFieldLine(x)) return false;
  if (HEADER_EMOJI_ONLY.test(x)) return false;

  if (/^(📊|🔎|✅|⛔|🚀|🎯|🔁|🟢|🧪|⚙️|📈|💡|🛑|⚠️|💎|🚨|🏬|📉|💰|🎟️|🚦|🧺|🧭|📦|🛡️|🛡|🚫|🗓️|🗓|📍)\s*\S+/.test(x)) return true;

  return (
    /^(الخلاصة التنفيذية|الملخص المالي|الملخص العام|القرار النهائي|الأثر المتوقع|التأثير المتوقع|التنفيذ|ماذا تعمل الآن|ما الذي أوصي به|القراءة التنفيذية|التفسير الأقرب|القرار التنفيذي)\s*:/.test(x) ||
    /^(ماذا حصل|ما معنى هذا)\s*[؟?:：]/.test(x)
  );
}

function isBulletLine(line: string) {
  return /^[-•]\s+/.test(line.trim());
}

function isMetricLine(line: string) {
  const cleaned = cleanNumberedPrefix(line);

  return /^[-•]?\s*(دخل|صافي|قيمة|إجمالي|AOV|احتفاظ|ضغط الخصم|عدد العملاء|الطلبات|العملاء|الإيراد|متوسط السلة|المتوسط|الخصومات|الصرف الإعلاني|صافي أثر الإيراد|النتيجة واضحة|لنتيجة واضحة|أكثر القطع|أقوى المغاسل|المغسلة|نوع المغسلة|الشريحة|مع الخصم|بدون الخصم|مع البروموكود|بدون خصم|قيمة البروموكود|متوسط القطع\/طلب|السبب|القرار)\s*:/.test(
    cleaned
  ) || /^[-•]?\s*متوسط السلة\s+من\s+\d/.test(cleaned);
}

function isNumberedItemStart(line: string) {
  const numbered = line.match(/^\s*(\d+)[\.)]\s*(.*)$/);
  if (!numbered) return null;

  const rest = normalizeLine(numbered[2] || "");

  if (!rest) return `البند ${numbered[1]}`;
  if (HEADER_EMOJI_ONLY.test(rest)) return null;
  if (isFieldLine(rest)) return null;

  return rest;
}


function countPipes(line: string) {
  return (line.match(/\|/g) || []).length;
}

function isMarkdownTableDivider(line: string) {
  const cleaned = normalizeLine(line);
  if (!cleaned || countPipes(cleaned) < 2) return false;

  const cells = cleaned
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);

  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isMarkdownTableRow(line: string) {
  const cleaned = normalizeLine(line);
  if (!cleaned || countPipes(cleaned) < 2) return false;
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) return false;
  return true;
}

function splitMarkdownTableRow(line: string) {
  const protectedPipe = "__LITERAL_PIPE__";

  return normalizeLine(line)
    .replace(/\\\|/g, protectedPipe)
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) =>
      displayMoneyLine(
        cell
          .replace(new RegExp(protectedPipe, "g"), " | ")
          .replace(/\*\*/g, "")
          .replace(/<br\s*\/?\s*>/gi, "\n")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      )
    );
}

function looksLikeTableHeaderCell(cell: string) {
  const x = normalizeLine(cell).replace(/\s+/g, " ");

  return /^(الترتيب|المعيار|البند|الحملة|الشهر|القناة|الخيار|الفرع|المغسلة|الشريحة|المؤشر|المرحلة|العدد|القيمة|النتيجة|الحركة|جودة السلة|الخصومات|القرار|Metric|Channel|Campaign|Month|Rank|Value|Count)$/i.test(x) ||
    /^(الحملة\s*\/\s*الشهر|الشهر\s*\/\s*الحملة|شهر\s*\/\s*حملة|الخيار\s*الأول|الخيار\s*الثاني|قيمة\s*الخصومات|الخصومات\s*بدون\s*ضريبة)$/i.test(x);
}

function looksLikeRankingHeaderCells(cells: string[]) {
  const normalizedCells = cells.map((cell) => normalizeLine(cell).replace(/\s+/g, " "));
  const joined = normalizedCells.join(" | ");

  return (
    normalizedCells.some((cell) => /^الترتيب$/i.test(cell)) &&
    /الشهر\s*\/\s*الحملة|الحملة\s*\/\s*الشهر|الحملة|الشهر/.test(joined) &&
    /الحركة/.test(joined) &&
    /جودة السلة/.test(joined) &&
    /الخصومات/.test(joined) &&
    /القرار/.test(joined)
  );
}

function looksLikeTableHeaderLine(line: string) {
  const cells = splitMarkdownTableRow(line).filter(Boolean);
  return cells.length >= 2 && cells.some(looksLikeTableHeaderCell);
}

function tableColumnCountFromCells(cells: string[]) {
  const headerIndex = cells.findIndex(looksLikeTableHeaderCell);
  if (headerIndex === -1) return 0;

  const tableCells = cells.slice(headerIndex);
  const firstHeader = normalizeLine(cells[headerIndex] || "");

  if (looksLikeRankingHeaderCells(tableCells.slice(0, 8))) return 6;
  if (/^الترتيب$/i.test(firstHeader)) return 6;
  if (/^البند$/i.test(firstHeader)) return 3;
  if (/^القناة$/i.test(firstHeader)) return 5;
  if (/الحملة\s*\/\s*الشهر|الشهر\s*\/\s*الحملة|^الحملة$|^الشهر$/i.test(firstHeader)) return 5;
  if (/^المعيار$|^المؤشر$/i.test(firstHeader)) return 4;

  return 4;
}

function expandInlineMarkdownTables(lines: string[]) {
  const expanded: string[] = [];

  for (const originalLine of lines) {
    const line = normalizeLine(originalLine);

    // Repair only real fused markdown tables that contain a separator.
    // Do not convert any pipe-heavy normal sentence into a table.
    if (countPipes(line) < 4 || !line.includes("---")) {
      expanded.push(line);
      continue;
    }

    const protectedPipe = "__LITERAL_PIPE__";
    const safeLine = line.replace(/\\\|/g, protectedPipe);
    const tokens = safeLine
      .split("|")
      .map((cell) => normalizeLine(cell).replace(new RegExp(protectedPipe, "g"), " | "))
      .filter(Boolean);

    const isSeparatorToken = (cell: string) => /^:?-{3,}:?$/.test(cell);

    let separatorStart = -1;
    let separatorEnd = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (!isSeparatorToken(tokens[i])) continue;

      let j = i;
      while (j < tokens.length && isSeparatorToken(tokens[j])) j += 1;

      if (j - i >= 2) {
        separatorStart = i;
        separatorEnd = j;
        break;
      }
    }

    if (separatorStart === -1 || separatorEnd === -1) {
      expanded.push(line);
      continue;
    }

    const columnCount = separatorEnd - separatorStart;
    const headerStart = separatorStart - columnCount;

    if (headerStart < 0 || columnCount < 2 || columnCount > 8) {
      expanded.push(line);
      continue;
    }

    const headers = tokens.slice(headerStart, separatorStart);
    const beforeTable = tokens.slice(0, headerStart).join(" | ");
    const dataTokens = tokens.slice(separatorEnd);

    if (!headers.some(looksLikeTableHeaderCell) && !looksLikeRankingHeaderCells(headers)) {
      expanded.push(line);
      continue;
    }

    if (beforeTable) expanded.push(beforeTable);

    expanded.push(`| ${headers.join(" | ")} |`);
    expanded.push(`| ${Array.from({ length: columnCount }, () => "---").join(" | ")} |`);

    let cursor = 0;
    while (cursor < dataTokens.length) {
      const row = dataTokens.slice(cursor, cursor + columnCount);
      if (row.length < columnCount) {
        const leftover = row.join(" | ");
        if (leftover) expanded.push(leftover);
        break;
      }

      expanded.push(`| ${row.join(" | ")} |`);
      cursor += columnCount;
    }
  }

  return expanded.filter(Boolean);
}

function canStartMarkdownTable(lines: string[], index: number) {
  const current = lines[index] || "";
  const next = lines[index + 1] || "";

  if (!isMarkdownTableRow(current) || !looksLikeTableHeaderLine(current)) return false;
  if (isMarkdownTableDivider(next)) return true;

  const currentCells = splitMarkdownTableRow(current).filter(Boolean);
  const nextCells = splitMarkdownTableRow(next).filter(Boolean);

  return isMarkdownTableRow(next) && nextCells.length >= 2 && Math.abs(currentCells.length - nextCells.length) <= 1;
}

function exactMonthLike(value: string) {
  const x = normalizeLine(value)
    .replace(/^[-•]\s*/, "")
    .replace(/[،.]+$/g, "")
    .trim();

  return /^(?:2026-(?:01|02|03|04|05|06)|(?:يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو)\s*2026|2026\s*(?:يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو))$/i.test(x);
}

function moneyLike(value: string) {
  const x = normalizeLine(value)
    .replace(/[,٬]/g, "")
    .replace(/\s*(?:ريال|SAR|ر\.س)\s*$/i, "")
    .trim();

  if (!/^-?\d+(?:\.\d+)?%?$/.test(x)) return false;
  if (/^\d{4}$/.test(x)) return false;
  return true;
}

function stripTableCellNoise(value: string) {
  return displayMoneyLine(
    normalizeLine(value)
      .replace(/^[-•]\s*/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/\*\*/g, "")
      .trim()
  );
}

function repairCampaignSpendRow(cells: string[], headers: string[]) {
  const normalizedHeaders = headers.map((header) => normalizeLine(header).replace(/\s+/g, " "));
  const monthIndex = normalizedHeaders.findIndex((header) => /^الشهر$|^الشهر\s*\/\s*الحملة$|^الحملة\s*\/\s*الشهر$/i.test(header));
  const campaignIndex = normalizedHeaders.findIndex((header) => /^الحملة$|^الشهر\s*\/\s*الحملة$|^الحملة\s*\/\s*الشهر$/i.test(header));
  const spendIndex = normalizedHeaders.findIndex((header) => /الصرف|الإنفاق|التكلفة|spend/i.test(header));

  if (monthIndex === -1 || campaignIndex === -1 || spendIndex === -1) return null;
  if (cells.length < 3) return null;

  const cleanedCells = cells.map((cell) => stripTableCellNoise(cell)).filter(Boolean);

  let detectedMonthIndex = cleanedCells.findIndex(exactMonthLike);

  if (detectedMonthIndex === -1) {
    detectedMonthIndex = cleanedCells.findIndex((cell) => /2026-(?:01|02|03|04|05|06)/.test(normalizeLine(cell)));
  }

  let detectedSpendIndex = -1;
  for (let i = cleanedCells.length - 1; i >= 0; i--) {
    if (i === detectedMonthIndex) continue;
    if (moneyLike(cleanedCells[i])) {
      detectedSpendIndex = i;
      break;
    }
  }

  if (detectedMonthIndex === -1 || detectedSpendIndex === -1) return null;

  const campaignParts = cleanedCells.filter((_, index) => index !== detectedMonthIndex && index !== detectedSpendIndex);
  const repaired = Array.from({ length: headers.length }, () => "—");

  repaired[monthIndex] = cleanedCells[detectedMonthIndex] || "—";
  repaired[campaignIndex] = campaignParts.join(" | ") || "—";
  repaired[spendIndex] = cleanedCells[detectedSpendIndex] || "—";

  return repaired;
}

function normalizeTableRowToHeaders(row: string[], headers: string[]) {
  const columnCount = headers.length;
  const cleanedRow = row.map((cell) => stripTableCellNoise(cell)).filter(Boolean);

  if (columnCount <= 0) return cleanedRow;

  const spendRepair = repairCampaignSpendRow(cleanedRow, headers);
  if (spendRepair) return spendRepair;

  if (cleanedRow.length === columnCount) return cleanedRow;

  if (columnCount === 2 && cleanedRow.length > 2) {
    const secondHeader = normalizeLine(headers[1] || "");

    // بعض مخرجات الأجنت تكسر اسم الفرع إلى أكثر من خلية، مثل:
    // Example business row with literal pipe characters
    // في جدول عمودين، نعتبر آخر قيمة رقمية هي القيمة، وكل ما قبلها هو اسم البند/المغسلة.
    if (/العدد|القيمة|الخصومات|ضريبة|amount|count|value/i.test(secondHeader)) {
      let valueIndex = -1;

      for (let i = cleanedRow.length - 1; i >= 0; i--) {
        if (moneyLike(cleanedRow[i])) {
          valueIndex = i;
          break;
        }
      }

      if (valueIndex > 0) {
        const label = cleanedRow
          .slice(0, valueIndex)
          .join(" ")
          .replace(/\s+:\s+/g, ": ")
          .trim();
        const value = cleanedRow.slice(valueIndex).join(" ").trim();

        return [label || "—", value || "—"];
      }
    }
  }

  if (cleanedRow.length < columnCount) {
    return Array.from({ length: columnCount }, (_, index) => cleanedRow[index] || "—");
  }

  const normalizedHeaders = headers.map((header) => normalizeLine(header).replace(/\s+/g, " "));

  let mergeIndex = normalizedHeaders.findIndex((header) =>
    /الحملة|الشهر\s*\/\s*الحملة|الحملة\s*\/\s*الشهر|Campaign/i.test(header)
  );

  if (mergeIndex === -1) {
    mergeIndex = normalizedHeaders.findIndex((header) => /القرار|النتيجة|السبب|التوصية/i.test(header));
  }

  if (mergeIndex === -1) {
    mergeIndex = Math.min(1, columnCount - 1);
  }

  const cellsAfterMerge = columnCount - mergeIndex - 1;
  const head = cleanedRow.slice(0, mergeIndex);
  const tail = cellsAfterMerge > 0 ? cleanedRow.slice(cleanedRow.length - cellsAfterMerge) : [];
  const middleEnd = cellsAfterMerge > 0 ? cleanedRow.length - cellsAfterMerge : cleanedRow.length;
  const middle = cleanedRow.slice(mergeIndex, middleEnd).join(" | ");
  const merged = [...head, middle || "—", ...tail];

  return Array.from({ length: columnCount }, (_, index) => merged[index] || "—");
}

function parseMarkdownTable(lines: string[], startIndex: number, tone: Tone) {
  const headers = splitMarkdownTableRow(lines[startIndex] || "").filter(Boolean);
  const rows: string[][] = [];
  let index = startIndex + 1;

  if (isMarkdownTableDivider(lines[index] || "")) {
    index += 1;
  }

  while (index < lines.length) {
    const currentLine = lines[index] || "";

    if (isMarkdownTableDivider(currentLine)) {
      index += 1;
      continue;
    }

    if (!isMarkdownTableRow(currentLine)) break;
    if (looksLikeTableHeaderLine(currentLine)) break;

    const row = splitMarkdownTableRow(currentLine).filter(Boolean);
    if (row.some(Boolean)) rows.push(row);
    index += 1;
  }

  const safeHeaders = headers;
  const safeRows = rows.map((row) => normalizeTableRowToHeaders(row, safeHeaders));

  return {
    block: { type: "table", headers: safeHeaders, rows: safeRows, tone } as TableBlock,
    nextIndex: index,
  };
}

function parseBotBlocks(text: string): BotBlock[] {
  const normalized = normalizeBotText(text);
  const rawLines = normalized
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const lines = expandInlineMarkdownTables(mergeOrphanHeaderEmojis(rawLines));

  const blocks: BotBlock[] = [];
  let activeTone: Tone = "slate";
  let currentItem: ItemBlock | null = null;

  const currentHasField = (label: string) => {
    if (!currentItem) return false;
    return currentItem.lines.some((line) => fieldLabel(line) === label);
  };

  const flushItem = () => {
    if (!currentItem) return;

    if (currentItem.lines.length > 0 || currentItem.title.trim()) {
      blocks.push(currentItem);
    }

    currentItem = null;
  };

  const startItem = (title = "بند") => {
    flushItem();
    currentItem = {
      type: "item",
      title: normalizeLine(title),
      lines: [],
      tone: activeTone,
    };
  };

  const getCurrentItem = () => {
    if (!currentItem) {
      startItem("بند");
    }

    return currentItem!;
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (HEADER_EMOJI_ONLY.test(line)) {
      continue;
    }

    if (canStartMarkdownTable(lines, lineIndex)) {
      flushItem();
      const parsedTable = parseMarkdownTable(lines, lineIndex, activeTone);
      blocks.push(parsedTable.block);
      lineIndex = parsedTable.nextIndex - 1;
      continue;
    }

    if (isHeaderLine(line)) {
      flushItem();
      activeTone = sectionTone(line);
      blocks.push({ type: "header", text: line, tone: activeTone });
      continue;
    }

    if (/^البند\s*\d+/i.test(line)) {
      startItem(line);
      continue;
    }

    const itemStartTitle = isNumberedItemStart(line);
    if (itemStartTitle) {
      startItem(itemStartTitle);
      continue;
    }

    if (isFieldLine(line)) {
      const label = fieldLabel(line);

      if (!currentItem) {
        startItem("بند");
      }

      if (label === "المغسلة" && currentHasField("المغسلة")) {
        startItem("بند");
      }

      getCurrentItem().lines.push(line);
      continue;
    }

    const activeItem = currentItem as ItemBlock | null;

    if (activeItem && isHeaderLine(line)) {
      flushItem();
      activeTone = sectionTone(line);
      blocks.push({ type: "header", text: line, tone: activeTone });
      continue;
    }

    if (activeItem) {
      const shouldStartNewLooseLine =
        /^(أكثر القطع|أقوى المغاسل|أثر الخصومات|الخصومات:|الخصومات كانت|القراءة التنفيذية|يوجد أيضًا|الدخل القوي|كرر نفس|لا تفترض|هل كان|هل حصل|هل كانت|هل انخفضت|📦 أين نستثمر|🗓️? خطة التطبيق|📍 النطاق|🎯 الهدف|🧪 شكل الاختبار|📊 KPI|🎯 شرائح تحتاج A\/B Test|🧪 شرائح تحتاج A\/B Test)/.test(line);

      if (shouldStartNewLooseLine) {
        flushItem();
        blocks.push({ type: isMetricLine(line) || isBulletLine(line) ? "metric" : "text", text: line });
        continue;
      }

      activeItem.lines.push(line);
      continue;
    }

    if (isMetricLine(line) || isBulletLine(line)) {
      blocks.push({ type: "metric", text: line });
    } else {
      blocks.push({ type: "text", text: line });
    }
  }

  flushItem();
  return blocks;
}

function stripLabel(line: string) {
  return getLabelValue(line)?.value || cleanNumberedPrefix(line);
}

function findField(lines: string[], labels: string | string[]) {
  const wanted = Array.isArray(labels) ? labels : [labels];
  const found = lines.find((line) => wanted.includes(fieldLabel(line)));
  return found ? stripLabel(found) : "";
}

function displayMoneyLine(text: string) {
  return text
    .replace(/\s*\|\s*/g, " | ")
    .replace(/دخل(?=\d)/g, "دخل ")
    .replace(/احتفاظ(?=\d)/g, "احتفاظ ")
    .replace(/AOV(?=\d)/g, "AOV ")
    .replace(/ضغط الخصم(?=\d)/g, "ضغط الخصم ")
    .replace(/ريال(?=\S)/g, "ريال ");
}

function displayReadableLine(text: string) {
  return displayMoneyLine(text)
    .replace(/\s+(?=(?:الطلبات|العملاء|الإيراد|متوسط السلة|الخصومات|الصرف الإعلاني|صافي أثر الإيراد|النتيجة واضحة|لنتيجة واضحة|السبب|التنفيذ|الهدف|النطاق|KPI)\s*[:：])/g, "\n")
    .replace(/\s+(?=متوسط السلة\s+من\s+\d)/g, "\n")
    .replace(/\s+(?=صافي أثر الإيراد بعد الصرف الإعلاني)/g, "\n")
    .replace(/\s+(?=📊\s*KPI|🎯\s*الهدف|📍\s*النطاق|🗓️?\s*خطة التطبيق|🧪\s*شكل الاختبار|💰\s*الأثر المالي|⚙️\s*ماذا|🚫\s*ماذا|⛔\s*ماذا|📈\s*أين)/g, "\n");
}

function MetricLine({ text }: { text: string }) {
  const parsed = getLabelValue(text);
  const isBullet = isBulletLine(text);

  const isRealMetricLabel =
    parsed &&
    (isKnownFieldLabel(parsed.label) ||
      /^(دخل|صافي|قيمة|إجمالي|AOV|احتفاظ|ضغط الخصم|عدد العملاء|الطلبات|العملاء|الإيراد|متوسط السلة|المتوسط|الخصومات|الصرف الإعلاني|صافي أثر الإيراد|النتيجة واضحة|لنتيجة واضحة|أكثر القطع|أقوى المغاسل|مع البروموكود|بدون خصم|قيمة البروموكود|متوسط القطع\/طلب)$/i.test(
        parsed.label
      ));

  if (isRealMetricLabel && parsed) {
    return (
      <div
        className="rounded-xl border border-slate-700/70 bg-slate-950/30 px-3 py-2 text-sm leading-relaxed text-slate-100"
        dir="rtl"
        style={{ unicodeBidi: "plaintext", textAlign: "right" }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400">{parsed.label}</span>
          <span className="whitespace-pre-line break-words text-right font-semibold text-slate-100">
            {displayReadableLine(parsed.value)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-slate-800/70 bg-slate-950/15 px-3 py-2 text-sm leading-7 text-slate-100"
      dir="rtl"
      style={{ unicodeBidi: "plaintext", textAlign: "right" }}
    >
      <div className="flex items-start gap-2">
        {isBullet && <span className="mt-1 text-blue-300">•</span>}
        <span className="whitespace-pre-line break-words">{displayReadableLine(cleanNumberedPrefix(text))}</span>
      </div>
    </div>
  );
}

function FieldBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 py-2" dir="rtl">
      <div className="mb-1 text-[11px] font-bold text-slate-400">{label}</div>
      <div className="whitespace-pre-line break-words text-sm font-bold leading-relaxed text-white">{displayReadableLine(value)}</div>
    </div>
  );
}


function ExecutiveTable({ block }: { block: TableBlock }) {
  const classes = toneClasses[block.tone];

  return (
    <div
      className={`rounded-2xl border ${classes.item} shadow-lg shadow-black/20`}
      dir="rtl"
      style={{ textAlign: "right", unicodeBidi: "isolate" }}
    >
      <div className="max-w-full overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[620px] border-separate border-spacing-0 text-right text-sm text-slate-100">
          <thead>
            <tr>
              {block.headers.map((header, headerIndex) => (
                <th
                  key={`header-${header}-${headerIndex}`}
                  className="border-b border-white/10 bg-white/10 px-4 py-3 text-xs font-black text-slate-100 first:rounded-tr-2xl last:rounded-tl-2xl sm:text-sm"
                >
                  {header || "—"}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="odd:bg-slate-950/20 even:bg-slate-900/20">
                {block.headers.map((_, cellIndex) => {
                  const value = row[cellIndex] || "—";
                  const header = block.headers[cellIndex] || "";
                  const isDecisionCell = /قرار|الأفضل|الحكم|النتيجة|التوصية/i.test(header);

                  return (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={`border-b border-white/5 px-4 py-3 align-top leading-7 last:border-l-0 ${cellIndex === 0 ? "font-black text-white" : "text-slate-200"} ${isDecisionCell ? "font-extrabold text-emerald-100" : ""}`}
                    >
                      <span className="whitespace-pre-line break-words">{displayReadableLine(value)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemCard({ block, index }: { block: ItemBlock; index: number }) {
  const classes = toneClasses[block.tone];
  const lines = block.lines;

  const branch = findField(lines, "المغسلة");
  const laundryType = findField(lines, "نوع المغسلة");
  const segment = findField(lines, "الشريحة");
  const withDiscount = findField(lines, "مع الخصم");
  const withoutDiscount = findField(lines, "بدون الخصم");
  const decision = findField(lines, "القرار");
  const reason = findField(lines, "السبب");

  const usedFieldIndexes = new Set<number>();

  lines.forEach((line, i) => {
    if (FIELD_LABELS.includes(fieldLabel(line) as (typeof FIELD_LABELS)[number])) {
      usedFieldIndexes.add(i);
    }
  });

  const others = lines.filter((_, i) => !usedFieldIndexes.has(i));
  const title = branch || stripLabel(block.title) || "بند";

  return (
    <article
      className={`rounded-2xl border ${classes.item} p-3 shadow-lg shadow-black/10 sm:p-4`}
      dir="rtl"
      style={{ textAlign: "right", unicodeBidi: "isolate" }}
    >
      <div className="mb-3 flex items-start gap-3">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${classes.pill}`}>
          {index}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-black leading-relaxed text-white sm:text-lg">{title}</h3>
          {laundryType && <div className="mt-1 text-xs font-semibold text-slate-300">{laundryType}</div>}
        </div>
      </div>

      {segment && (
        <div className={`mb-3 rounded-full border px-3 py-2 text-xs font-bold leading-relaxed sm:text-sm ${classes.chip}`}>
          {segment}
        </div>
      )}

      {(withDiscount || withoutDiscount) && (
        <div className="mb-3 grid gap-2 md:grid-cols-2">
          {withDiscount && <FieldBox label="مع الخصم" value={withDiscount} />}
          {withoutDiscount && <FieldBox label="بدون الخصم" value={withoutDiscount} />}
        </div>
      )}

      {(decision || reason) && (
        <div className="grid gap-2">
          {decision && <FieldBox label="القرار" value={decision} />}
          {reason && <FieldBox label="السبب" value={reason} />}
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-2 grid gap-2">
          {others.map((line, i) => (
            <MetricLine key={`${line}-${i}`} text={line} />
          ))}
        </div>
      )}
    </article>
  );
}

function RenderBotText({ text }: { text: string }) {
  const blocks = parseBotBlocks(text);
  let itemCounter = 0;

  return (
    <div className="flex w-full flex-col gap-3" dir="rtl" style={{ textAlign: "right" }}>
      {blocks.map((block, index) => {
        if (block.type === "header") {
          itemCounter = 0;
          const classes = toneClasses[block.tone];

          return (
            <div
              key={`header-${index}`}
              className={`mt-3 rounded-xl border-r-4 px-4 py-3 text-base font-black leading-relaxed shadow-sm sm:text-lg ${classes.header}`}
              style={{ unicodeBidi: "plaintext" }}
            >
              {block.text}
            </div>
          );
        }

        if (block.type === "item") {
          itemCounter += 1;
          return <ItemCard key={`item-${index}`} block={block} index={itemCounter} />;
        }

        if (block.type === "metric") {
          return <MetricLine key={`metric-${index}`} text={block.text} />;
        }

        if (block.type === "table") {
          return <ExecutiveTable key={`table-${index}`} block={block} />;
        }

        return (
          <div
            key={`text-${index}`}
            className="rounded-lg px-1 py-1 text-sm leading-8 text-slate-100 sm:text-base"
            dir="rtl"
            style={{ unicodeBidi: "plaintext", textAlign: "right" }}
          >
            {displayReadableLine(block.text)}
          </div>
        );
      })}
    </div>
  );
}

export default function MessagesList({
  messages,
  isLoading,
  isSwitching,
  messagesEndRef,
  cleanText,
}: MessagesListProps) {
  if (isSwitching) {
    return (
      <div className="mt-4 flex w-full max-w-4xl animate-pulse flex-col gap-6 opacity-40">
        <div className="mr-auto h-12 w-1/2 self-start rounded-2xl bg-slate-800" />
        <div className="ml-auto h-32 w-2/3 self-end rounded-2xl bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="mt-4 flex w-full max-w-6xl flex-col gap-6 px-2 pb-12">
      {messages.map((msg, i) => {
        if (msg.type === "bot" && !msg.text) return null;

        const rawText = cleanText(msg.text || "");

        return (
          <div
            key={i}
            className={`relative px-4 py-4 shadow-xl transition-all duration-300 sm:px-6 ${msg.type === "user"
              ? "mr-auto max-w-[92%] rounded-2xl rounded-tl-none bg-blue-600 text-white shadow-blue-900/20 sm:max-w-[75%]"
              : "ml-auto w-full max-w-[98%] rounded-2xl rounded-tr-none border border-slate-800 bg-[#0F1721] text-slate-100 shadow-black/40 sm:max-w-[94%]"
              }`}
          >
            {msg.type === "bot" ? (
              <RenderBotText text={rawText} />
            ) : (
              <div
                className="whitespace-pre-line text-right leading-relaxed"
                dir="rtl"
                style={{ unicodeBidi: "plaintext" }}
              >
                {rawText}
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="ml-auto mr-2 self-end">
          <BotThinkingBubble />
        </div>
      )}

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}