// Static UI string table for the two supported languages.
//
// Content that varies per surgery/plan/case (tier + plan names, treatment
// details) is NOT here — that already ships bilingual in data.ts / the endpoint
// and is resolved via pick() in i18n.tsx. This table only covers the fixed UI
// chrome (labels, buttons, headings, the WhatsApp message scaffolding).
//
// `en` is the source of truth for the key set; `zh` is typed as
// Record<StringKey, string> so a missing translation is a COMPILE error.
// Templated strings carry {tokens} that callers fill via String.replace.

export type Lang = "en" | "zh";

const en = {
  // ── shared / reused across components ──
  "common.male": "Male",
  "common.female": "Female",
  "common.any": "Any",
  "common.anyAge": "Any age",
  "common.allGenders": "All genders",
  "common.allAges": "All ages",
  "common.none": "None",
  "common.dayCase": "Day case",
  "common.noCap": "No cap",
  "common.notApplicable": "N/A",
  "common.noRestriction": "No restriction",
  "common.perMonth": "/mo",
  "common.removeFromComparison": "Remove from comparison",
  "common.addToComparison": "Add to comparison",
  "ward.standard": "Standard ward",
  "ward.semi-private": "Semi-private",
  "ward.private": "Private",

  // ── top bar ──
  "topbar.toolBadge": "Claim Comparison",
  "topbar.quotes": "Quotes",
  "topbar.quotesTitle": "Show indicative monthly premiums",
  // Doubles as the button's aria-label, so "and" rather than "&" — screen
  // readers announce the ampersand.
  "topbar.sort": "Sort plans and cases in order",
  "topbar.clearAll": "Clear all",

  // ── left rail tabs ──
  "rail.about": "About me",
  "rail.plan": "Plan",
  "rail.case": "Case",
  "about.intro":
    "Tell us a little about yourself to see an indicative monthly premium for each plan. This stays separate from the case filters.",

  // ── loading / error gates ──
  "gate.loading": "Loading operation data…",
  "gate.errorTitle": "Couldn’t load operation data",
  "gate.errorHint":
    "Check that you can reach the operation-data endpoint, then try again.",
  "gate.retry": "Retry",

  // ── coverage chart ──
  "chart.estimateDisclaimer":
    "Figures are estimates for operation-related benefits only, meant to help you compare plans at a glance. For exact coverage or an actual claim, please refer to the benefit schedule.",
  "chart.pickCasesTitle": "Pick cases to compare",
  "chart.pickCasesSub": "Choose surgeries in the Case tab on the left",
  "chart.pickPlansTitle": "Pick VHIS plans",
  "chart.pickPlansSub": "Choose plans in the Plan tab on the left",
  "chart.showDetails": "Show coverage details",
  "chart.hideDetails": "Hide coverage details",
  "chart.eligibleCharge": "Eligible medical charge",
  "chart.deductible": "Deductible",
  "chart.vhisCovers": "VHIS covers",
  "chart.vhisReimburses": "VHIS reimburses",
  "chart.dedYouPayFirst": "Deductible · you pay first",
  "chart.aboveLimitYouPay": "Above plan limit · you pay",
  "chart.netPayout": "Net payout",
  // Names both halves of it, since the deductible row above is subtracted
  // separately from the excess and this line is their sum.
  "chart.youPayTotal": "Customer pays (deductible + excess)",
  "chart.fullyCovered": "HK$0 · fully covered",
  "chart.monthlyPremium": "Monthly premium",
  "chart.feeSurgeon": "Surgeon’s fee",
  "chart.feeAnaesthetist": "Anaesthetist’s fee",
  "chart.feeTheatre": "Operating theatre charges",
  "chart.feeSmm": "SMM coverage",
  "chart.smmBreakdownTpl":
    "{remaining} remaining after surgeon’s, anaesthetist’s & theatre fees × {pct}%",
  "chart.feeCombinedSurgical":
    "Surgeon’s, anaesthetist’s & theatre fees (combined)",
  "chart.scheduleLoading": "Calculating coverage…",
  "chart.scheduleErrorTitle": "Couldn’t calculate coverage",
  "chart.tierSurgeryTpl": "{tier} surgery",
  "chart.estMedicalCharge": "Est. medical charge",
  "chart.usualStay": "Usual hospital stay",
  "chart.noOvernight": "No overnight",
  "chart.inpatient": "Inpatient",
  "chart.night": "night",
  "chart.nights": "nights",
  "chart.annualBenefitLimit": "Annual benefit limit",
  // Shown for every plan, whether or not it carries them: a plan with no SMM
  // rider reads "N/A", and one with no lifetime cap reads "No cap".
  "chart.smmLimit": "SMM limit",
  "chart.lifetimeLimit": "Lifetime limit",
  // Ward class only bites on the SMM top-up for the tiered plans — the plan
  // itself doesn't restrict which ward you stay in.
  "chart.smmWardOnlyTpl": "SMM covers {ward} only",
  "chart.wardClass": "Ward class",
  "chart.internal": "Internal",
  "chart.internalDetails": "Internal details",
  "chart.internalTreatmentDetails": "Internal treatment details",
  "chart.internalOnlyTreatmentDetails": "Internal-only treatment details",
  "chart.removeThisPlan": "Remove this plan",

  // ── coverage tabs bar ──
  "tabs.cases": "Cases",
  "tabs.plans": "Plans",
  "tabs.pickCasesHint": "Pick surgeries in the Case tab →",
  "tabs.pickPlansHint": "Pick plans in the Plan tab →",

  // ── case tab ──
  "case.title": "Case",
  "case.sub": "Pick the surgery examples to compare",
  "case.surgeryTier": "Surgery tier",
  "case.realExamples": "Real examples",
  "case.gender": "Gender",
  "case.age": "Age",
  "case.noMatching": "No matching cases",

  // ── plan tab ──
  "plan.configure": "Configure",
  "plan.addToCompare": "Add VHIS plans to compare",
  "plan.vhisPlans": "VHIS plans",
  "plan.noDeduct": "No deduct.",
  "plan.deductTpl": "Deduct {amount}",
  "plan.pinkPlan": "Pink plan",
  "plan.pinkBulkSuffix": "Get all quotes",
  "plan.remove": "Remove",
  "plan.addShort": "Add to compare",

  // ── profile form ──
  "profile.nonSmoker": "Non-smoker",
  "profile.smoker": "Smoker",
  "profile.age": "Age",
  "profile.selectBirthYear": "Select birth year",
  "profile.year": "Year",
  "profile.yrs": "yrs",
  "profile.month": "Month",
  "profile.optional": "optional",
  "profile.notSpecified": "Not specified",
  "profile.cancel": "Cancel",
  "profile.apply": "Apply",
  "profile.pickByBirthYear": "Pick by birth year",

  // ── internal detail modal ──
  "modal.internalOnly": "Internal only · not shown to customers",
  "modal.close": "Close",
  "modal.whoGetsThis": "Who gets this",
  "modal.ageGroup": "Age group",
  "modal.gender": "Gender",
  "modal.aboutOperation": "About the operation",
  "modal.operationPurpose": "Operation purpose",
  "modal.operationIntro": "Operation introduction",
  "modal.estOperationTime": "Estimated operation time",
  "modal.chargeReference": "Private hospital charge reference",
  "modal.inRider": "In rider",
  "modal.notInRider": "Not in rider",
  "modal.officialName": "Official name",
  "modal.dayCaseInpatient": "Day case / inpatient",
  "modal.priceRange": "Price (range)",

  // ── message panel: chrome ──
  "msg.title": "Message",
  "msg.showMessage": "Show message",
  "msg.collapse": "Collapse",
  "msg.placeholder": "Pick a case + plans to generate a message...",
  "msg.chars": "chars",
  "msg.edited": "· edited",
  "msg.copied": "✓ Copied",
  "msg.copy": "Copy",

  // ── message panel: generated WhatsApp body ──
  "msg.headerCompare": "🔎 Coverage comparison 🔎",
  "msg.headerCompareCases": "🔎 Coverage across surgeries 🔎",
  // Block heading wrapper — full-width 【】 in zh, plain brackets in en.
  "msg.blockTpl": "[{label}]",
  "msg.exampleLabel": "Example",
  "msg.procedure": "Procedure: ",
  "msg.surgeryType": "Surgery type: ",
  "msg.surgeryCostEst": "Estimated surgery cost: ",
  "msg.tierSurgeryTpl": "{tier} surgery",
  // "[Minor surgery: Injection or ligation of haemorrhoids]" — the case block
  // heading in "By plan", where the tier varies from block to block.
  "msg.caseBlockTpl": "{tier}: {name}",
  "msg.baseBenefit": "Basic coverage (surgeon + anaesthetist + theatre):",
  // Short form for "By plan", where the plan's payout method is spelled out in
  // the summary block above and the label doesn't need to repeat it.
  "msg.baseBenefitInline": "Basic coverage: ",
  "msg.smmBenefit": "SMM coverage: ",
  // {note} always carries at least the covered percentage, so the brackets are
  // never empty — hence one template rather than an optional suffix.
  "msg.totalPaidTpl": "Total paid: {amount} ({note})",
  "msg.oopAmount": "You pay: ",
  "msg.deductibleSuffixTpl": ": {amount} deductible",
  "msg.belowDeductible": ", below the deductible",
  "msg.deductible": "Deductible: ",
  "msg.payoutMethod": "How it pays: ",
  // Tiered plans (Standard, Flexi): per-tier surgical caps, then the SMM rider
  // tops up what's left. Standard has no SMM rider, hence the shorter variant.
  "msg.methodTieredSmmTpl": "capped by surgery type, with SMM covering {pct}% of the excess",
  "msg.methodTiered": "capped by surgery type",
  "msg.methodPremium": "eligible medical expenses fully covered once the annual deductible is met",
  // The SMM rider's own annual ceiling, separate from the plan's overall limit.
  "msg.smmCeilingTpl": "SMM limit: {amount} a year",
  "msg.coverageCeiling": "Coverage limit: ",
  "msg.limitAnnualTpl": "{amount}/year",
  "msg.limitLifetimeTpl": "{amount}/lifetime",
  "msg.limitSep": " · ",
  "msg.ward": "Ward class: ",
  // Ward class only bites on the SMM top-up for tiered plans — name it so.
  "msg.wardSmm": "SMM ward class: ",
  "msg.calculating": "(calculating…)",
  "msg.unavailable": "(coverage unavailable)",
  "msg.estimateDisclaimer":
    "Please note: these figures are for reference only and cover operation-related benefits, to help you compare plans at a glance. Actual claim amounts follow the benefit schedule.",
  "msg.closing":
    "Let me know if you have any questions — happy to walk through it 😊",
} as const;

export type StringKey = keyof typeof en;

const zh: Record<StringKey, string> = {
  // ── shared / reused across components ──
  "common.male": "男",
  "common.female": "女",
  "common.any": "不限",
  "common.anyAge": "不限年齡",
  "common.allGenders": "所有性別",
  "common.allAges": "所有年齡",
  "common.none": "無",
  "common.dayCase": "日間手術",
  "common.noCap": "無上限",
  "common.notApplicable": "不適用",
  "common.noRestriction": "無限制",
  "common.perMonth": "/月",
  "common.removeFromComparison": "從比較中移除",
  "common.addToComparison": "加入比較",
  "ward.standard": "普通房",
  "ward.semi-private": "半私家",
  "ward.private": "私家房",

  // ── top bar ──
  "topbar.toolBadge": "賠償試算",
  "topbar.quotes": "報價",
  "topbar.quotesTitle": "顯示參考每月保費",
  "topbar.sort": "按順序排列計劃及個案",
  "topbar.clearAll": "全部清除",

  // ── left rail tabs ──
  "rail.about": "關於我",
  "rail.plan": "計劃",
  "rail.case": "手術",
  "about.intro":
    "告訴我們一些關於你的基本資料，即可查看每個計劃的參考每月保費。此資料與個案篩選分開處理。",

  // ── loading / error gates ──
  "gate.loading": "正在載入手術資料…",
  "gate.errorTitle": "無法載入手術資料",
  "gate.errorHint": "請確認能連接手術資料端點後再試一次。",
  "gate.retry": "重試",

  // ── coverage chart ──
  "chart.estimateDisclaimer":
    "金額僅供參考，只計算手術相關保障，以快速了解不同計劃差異",
  "chart.pickCasesTitle": "選擇要比較的個案",
  "chart.pickCasesSub": "在左方「手術例子」分頁選擇手術",
  "chart.pickPlansTitle": "選擇自願醫保計劃",
  "chart.pickPlansSub": "在左方「計劃」分頁選擇計劃",
  "chart.showDetails": "顯示保障詳情",
  "chart.hideDetails": "隱藏保障詳情",
  "chart.eligibleCharge": "合資格醫療費用",
  "chart.deductible": "自付費",
  "chart.vhisCovers": "自願醫保賠償",
  "chart.vhisReimburses": "自願醫保賠償",
  "chart.dedYouPayFirst": "自付費",
  "chart.aboveLimitYouPay": "超額費用",
  "chart.netPayout": "淨賠償額",
  "chart.youPayTotal": "客人自行承擔（自付費＋超額費用）",
  "chart.fullyCovered": "HK$0 · 全數保障",
  "chart.monthlyPremium": "每月保費",
  "chart.feeSurgeon": "外科醫生費",
  "chart.feeAnaesthetist": "麻醉科醫生費",
  "chart.feeTheatre": "手術室費用",
  "chart.feeSmm": "額外醫療保障（SMM）",
  "chart.smmBreakdownTpl":
    "扣除外科醫生費、麻醉科醫生費及手術室費後餘額 {remaining} × {pct}%",
  "chart.feeCombinedSurgical": "外科醫生費、麻醉科醫生費及手術室費（合併）",
  "chart.scheduleLoading": "正在計算保障…",
  "chart.scheduleErrorTitle": "無法計算保障",
  "chart.tierSurgeryTpl": "{tier}",
  "chart.estMedicalCharge": "預估醫療費用",
  "chart.usualStay": "一般住院時間",
  "chart.noOvernight": "毋須過夜",
  "chart.inpatient": "住院",
  "chart.night": "晚",
  "chart.nights": "晚",
  "chart.annualBenefitLimit": "每年保障限額",
  "chart.smmLimit": "SMM 保障上限",
  "chart.lifetimeLimit": "終身保障限額",
  "chart.smmWardOnlyTpl": "SMM 保障只適用於{ward}",
  "chart.wardClass": "病房級別",
  "chart.internal": "手術詳情",
  "chart.internalDetails": "手術詳情",
  "chart.internalTreatmentDetails": "內部治療詳情",
  "chart.internalOnlyTreatmentDetails": "僅供內部的治療詳情",
  "chart.removeThisPlan": "移除此計劃",

  // ── coverage tabs bar ──
  "tabs.cases": "手術例子",
  "tabs.plans": "計劃",
  "tabs.pickCasesHint": "在「手術例子」分頁選擇手術 →",
  "tabs.pickPlansHint": "在「計劃」分頁選擇計劃 →",

  // ── case tab ──
  "case.title": "手術",
  "case.sub": "選擇要比較的手術例子",
  "case.surgeryTier": "手術類型",
  "case.realExamples": "手術",
  "case.gender": "性別",
  "case.age": "年齡",
  "case.noMatching": "沒有符合的個案",

  // ── plan tab ──
  "plan.configure": "設定",
  "plan.addToCompare": "加入自願醫保計劃作比較",
  "plan.vhisPlans": "自願醫保計劃",
  "plan.noDeduct": "無自付費",
  "plan.deductTpl": "自付費 {amount}",
  "plan.pinkPlan": "粉紅計劃",
  "plan.pinkBulkSuffix": "一鍵取得全系列報價",
  "plan.remove": "移除",
  "plan.addShort": "加入比較",

  // ── profile form ──
  "profile.nonSmoker": "非吸煙",
  "profile.smoker": "吸煙",
  "profile.age": "年齡",
  "profile.selectBirthYear": "選擇出生年份",
  "profile.year": "年份",
  "profile.yrs": "歲",
  "profile.month": "月份",
  "profile.optional": "選填",
  "profile.notSpecified": "不指定",
  "profile.cancel": "取消",
  "profile.apply": "套用",
  "profile.pickByBirthYear": "按出生年份選擇",

  // ── internal detail modal ──
  "modal.internalOnly": "僅供內部 · 不會向客戶顯示",
  "modal.close": "關閉",
  "modal.whoGetsThis": "高危組別",
  "modal.ageGroup": "年齡組別",
  "modal.gender": "性別",
  "modal.aboutOperation": "手術詳情",
  "modal.operationPurpose": "手術目的",
  "modal.operationIntro": "手術簡介",
  "modal.estOperationTime": "預計手術時間",
  "modal.chargeReference": "私家醫院收費參考",
  "modal.inRider": "包含於附加保障",
  "modal.notInRider": "不包含於附加保障",
  "modal.officialName": "手術名稱",
  "modal.dayCaseInpatient": "日間手術／住院",
  "modal.priceRange": "價格（範圍）",

  // ── message panel: chrome ──
  "msg.title": "訊息",
  "msg.showMessage": "顯示訊息",
  "msg.collapse": "收合",
  "msg.placeholder": "選擇個案及計劃以生成訊息…",
  "msg.chars": "字",
  "msg.edited": "· 已編輯",
  "msg.copied": "✓ 已複製",
  "msg.copy": "複製",

  // ── message panel: generated WhatsApp body ──
  "msg.headerCompare": "🔎 不同計劃賠償比較 🔎",
  "msg.headerCompareCases": "🔎 不同手術賠償比較 🔎",
  "msg.blockTpl": "【{label}】",
  "msg.exampleLabel": "例子",
  "msg.procedure": "手術：",
  "msg.surgeryType": "手術類型：",
  "msg.surgeryCostEst": "手術費估算：",
  "msg.tierSurgeryTpl": "{tier}手術",
  "msg.caseBlockTpl": "{tier}：{name}",
  "msg.baseBenefit": "基本保額賠償（外科醫生＋麻醉科＋手術室費）：",
  "msg.baseBenefitInline": "基本保額賠償：",
  "msg.smmBenefit": "額外醫療保障（SMM）賠償：",
  "msg.totalPaidTpl": "共賠償：{amount}（{note}）",
  "msg.oopAmount": "自付金額：",
  "msg.deductibleSuffixTpl": "：{amount}自付費",
  "msg.belowDeductible": "，醫療費用未過自付費",
  "msg.deductible": "自付費：",
  "msg.payoutMethod": "賠償方式：",
  "msg.methodTieredSmmTpl": "按手術類型有不同上限，額外醫療保障（SMM）賠償超支部分 {pct}%",
  "msg.methodTiered": "按手術類型有不同上限",
  "msg.methodPremium": "年度合資格醫療開支超過自付費後全數賠償",
  "msg.smmCeilingTpl": "SMM保障上限：每年 {amount}",
  "msg.coverageCeiling": "保障上限：",
  "msg.limitAnnualTpl": "{amount}/年",
  "msg.limitLifetimeTpl": "{amount}/終身",
  "msg.limitSep": "．",
  "msg.ward": "病房級別：",
  "msg.wardSmm": "SMM 病房級別：",
  "msg.calculating": "（計算中…）",
  "msg.unavailable": "（保障資料暫時無法計算）",
  "msg.estimateDisclaimer":
    "溫馨提示：以上金額僅供參考，只計算手術相關保障，以快速比較不同計劃的保障差異。實際賠償金額以保障表為準。",
  "msg.closing": "如有任何疑問，歡迎隨時聯絡我們了解更多 😊",
};

export const STRINGS: Record<Lang, Record<StringKey, string>> = { en, zh };
