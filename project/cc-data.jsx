// Data layer for the Claim Comparison tool.
// All amounts in HK$.

const SURGERY_TIERS = [
  { id: 'minor',        zh: '小手術',   en: 'Minor',        rangeMin: 15000,  rangeMax: 25000,  rangeLabel: 'HK$15K–25K',    accent: 'var(--bt-green-day)' },
  { id: 'intermediate', zh: '中手術',   en: 'Intermediate', rangeMin: 40000,  rangeMax: 70000,  rangeLabel: 'HK$40K–70K',    accent: 'var(--bt-smurf)' },
  { id: 'major',        zh: '大手術',   en: 'Major',        rangeMin: 100000, rangeMax: 200000, rangeLabel: 'HK$100K–200K',  accent: 'var(--bt-yellow-submarine)' },
  { id: 'complex',      zh: '複雜手術', en: 'Complex',      rangeMin: 250000, rangeMax: 500000, rangeLabel: 'HK$250K–500K+', accent: 'var(--bt-hotel-california)' },
];

const CASES = [
  // Minor
  { tier: 'minor',  zh: '白內障手術',      en: 'Cataract surgery',        simple: 'Cataract removal',           gender: 'all',    age: '60+',   cost: 22000,  days: 0 },
  { tier: 'minor',  zh: '胃鏡檢查',        en: 'Gastroscopy',             simple: 'Stomach camera check',       gender: 'all',    age: 'all',   cost: 18000,  days: 0 },
  { tier: 'minor',  zh: '腸鏡檢查',        en: 'Colonoscopy',             simple: 'Bowel camera check',         gender: 'all',    age: '40-59', cost: 20000,  days: 0 },
  // Intermediate
  { tier: 'intermediate', zh: '腹腔鏡膽囊切除', en: 'Lap. cholecystectomy',  simple: 'Gallbladder removal',        gender: 'all',    age: '40-59', cost: 55000,  days: 2 },
  { tier: 'intermediate', zh: '疝氣修補',     en: 'Hernia repair',           simple: 'Hernia repair',              gender: 'male',   age: 'all',   cost: 45000,  days: 1 },
  { tier: 'intermediate', zh: '甲狀腺切除',   en: 'Thyroidectomy',           simple: 'Thyroid gland removal',      gender: 'female', age: '40-59', cost: 62000,  days: 2 },
  // Major
  { tier: 'major',   zh: '髖關節置換',     en: 'Hip replacement',          simple: 'New hip joint',              gender: 'all',    age: '60+',   cost: 180000, days: 5 },
  { tier: 'major',   zh: '膝關節置換',     en: 'Knee replacement',         simple: 'New knee joint',             gender: 'all',    age: '60+',   cost: 165000, days: 5 },
  { tier: 'major',   zh: '子宮切除',       en: 'Hysterectomy',             simple: 'Womb removal',               gender: 'female', age: '40-59', cost: 140000, days: 4 },
  // Complex
  { tier: 'complex', zh: '冠狀動脈搭橋',   en: 'Coronary bypass',          simple: 'Heart bypass',               gender: 'male',   age: '60+',   cost: 320000, days: 9 },
  { tier: 'complex', zh: '心臟瓣膜修復',   en: 'Heart valve repair',       simple: 'Heart valve fix',            gender: 'all',    age: '60+',   cost: 350000, days: 10 },
  { tier: 'complex', zh: '癌症切除術',     en: 'Cancer resection',         simple: 'Tumour removal',             gender: 'all',    age: '60+',   cost: 380000, days: 8 },
  { tier: 'complex', zh: '多節脊椎融合',   en: 'Multi-level spinal fusion',simple: 'Spine fusion',               gender: 'all',    age: '40-59', cost: 300000, days: 7 },
  { tier: 'complex', zh: '乳癌手術',       en: 'Breast cancer surgery',    simple: 'Breast cancer op',           gender: 'female', age: '40-59', cost: 260000, days: 4 },
];

// ── Internal-only treatment detail (English only; staff-facing) ──
// Keyed by case .en. official = full clinical name. hospitals = one row per
// hospital per treatment (public hospital fee data; inRider is dummy for now).
const TREATMENT_DETAILS = {
  'Cataract surgery': {
    official: 'Phacoemulsification with intraocular lens implantation',
    demographics: 'Strongly age-linked: incidence rises sharply after 60, and the large majority of cases are 65+. Affects both sexes roughly equally, with a slight female skew at older ages. In Hong Kong it is one of the highest-volume elective procedures, often done one eye at a time a few weeks apart.',
    purpose: 'To restore vision lost to a clouded natural lens, which causes blurring, glare and faded colour. Done once the cataract interferes with daily life (driving, reading).',
    introduction: 'Day surgery under local/topical anaesthesia. The cloudy lens is broken up by ultrasound (phacoemulsification) through a 2–3mm incision and removed, then a folded artificial intraocular lens is inserted. No sutures in most cases.',
    opTime: '15–30 minutes per eye. Same-day discharge; eye shield worn overnight and drops for 4 weeks.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Phacoemulsification + IOL (one eye)', setting: 'Day case', priceRange: 'HK$24K–34K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Hong Kong Adventist Hospital',     official: 'Cataract extraction with lens implant', setting: 'Day case', priceRange: 'HK$20K–28K', inRider: true,  updated: 'Updated Oct 2025 · HKAH price list' },
      { name: 'Union Hospital',                   official: 'Phaco cataract surgery (single eye)',   setting: 'Day case', priceRange: 'HK$18K–26K', inRider: false, updated: 'Updated Sep 2025 · Union fee guide' },
    ],
  },
  'Gastroscopy': {
    official: 'Oesophagogastroduodenoscopy (OGD)',
    demographics: 'Spread across all adult ages; uptake climbs from the 40s as screening for reflux, ulcers and gastric cancer rises. Both sexes affected. Very common in HK given high rates of H. pylori and gastric cancer relative to Western populations.',
    purpose: 'To inspect the oesophagus, stomach and duodenum for ulcers, inflammation, bleeding or tumours, and to take biopsies or remove small polyps.',
    introduction: 'Day procedure under sedation. A thin flexible endoscope with a camera is passed through the mouth; air is insufflated to open the stomach for inspection. Biopsies taken as needed.',
    opTime: '10–20 minutes. Recovery from sedation ~1 hour, then same-day discharge.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Upper GI endoscopy (OGD)',          setting: 'Day case', priceRange: 'HK$16K–24K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Matilda International Hospital',   official: 'Gastroscopy with sedation',          setting: 'Day case', priceRange: 'HK$18K–26K', inRider: false, updated: 'Updated Aug 2025 · Matilda price list' },
      { name: "St. Paul's Hospital",              official: 'Diagnostic gastroscopy',             setting: 'Day case', priceRange: 'HK$14K–20K', inRider: true,  updated: 'Updated Sep 2025 · SPH fee guide' },
    ],
  },
  'Colonoscopy': {
    official: 'Colonoscopy with polypectomy',
    demographics: 'Concentrated in the 40–59 and 60+ bands, in line with colorectal-cancer screening guidance. Both sexes. One of the most common screening procedures in HK; volumes rise around age 50.',
    purpose: 'To examine the full length of the large bowel for polyps, inflammation or cancer, and to remove polyps before they can turn malignant.',
    introduction: 'Day procedure under sedation following bowel prep. A flexible scope is advanced from the rectum to the caecum; detected polyps are removed (polypectomy) and sent for pathology.',
    opTime: '20–45 minutes depending on polyp burden. Same-day discharge after sedation wears off.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Colonoscopy ± polypectomy',          setting: 'Day case', priceRange: 'HK$20K–30K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Union Hospital',                   official: 'Lower GI endoscopy',                 setting: 'Day case', priceRange: 'HK$16K–24K', inRider: true,  updated: 'Updated Oct 2025 · Union fee guide' },
      { name: 'Hong Kong Adventist Hospital',     official: 'Screening colonoscopy',              setting: 'Day case', priceRange: 'HK$18K–26K', inRider: false, updated: 'Updated Sep 2025 · HKAH price list' },
    ],
  },
  'Lap. cholecystectomy': {
    official: 'Laparoscopic cholecystectomy',
    demographics: 'Peaks in the 40–59 band; more common in women, particularly after multiple pregnancies. Risk rises with obesity and high-fat diet. A very common general-surgery admission in HK.',
    purpose: 'To remove a gallbladder containing stones that cause pain, infection (cholecystitis) or block the bile ducts.',
    introduction: 'Keyhole surgery under general anaesthesia. Three to four small incisions admit a camera and instruments; the gallbladder is detached and removed through the navel port. Converts to open surgery only if complications arise.',
    opTime: '45–90 minutes. Typically 1–2 nights inpatient; back to light activity in a week.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Laparoscopic cholecystectomy',       setting: '2-day inpatient', priceRange: 'HK$58K–78K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'Keyhole gallbladder removal',         setting: '2-day inpatient', priceRange: 'HK$52K–70K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
      { name: "St. Paul's Hospital",              official: 'Lap. cholecystectomy',                setting: '1-day inpatient', priceRange: 'HK$45K–60K', inRider: false, updated: 'Updated Aug 2025 · SPH fee guide' },
    ],
  },
  'Hernia repair': {
    official: 'Inguinal hernia repair with mesh',
    demographics: 'Overwhelmingly male (inguinal hernias are ~8–9x more common in men) and spread across all adult ages, with a second peak in older men. Heavy lifting and chronic cough raise risk.',
    purpose: 'To push back protruding tissue and reinforce the weakened abdominal wall, preventing pain and the risk of bowel strangulation.',
    introduction: 'Open or laparoscopic repair under general or regional anaesthesia. The hernia sac is reduced and a synthetic mesh is placed to strengthen the defect.',
    opTime: '40–75 minutes. Day case to 1 night depending on approach.',
    hospitals: [
      { name: 'Union Hospital',                   official: 'Inguinal hernioplasty (mesh)',        setting: '1-day inpatient', priceRange: 'HK$46K–62K', inRider: true,  updated: 'Updated Oct 2025 · Union fee guide' },
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Hernia repair with mesh',             setting: '1-day inpatient', priceRange: 'HK$50K–66K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Canossa Hospital (Caritas)',       official: 'Open hernia repair',                  setting: 'Day case',        priceRange: 'HK$38K–50K', inRider: false, updated: 'Updated Jul 2025 · Canossa price list' },
    ],
  },
  'Thyroidectomy': {
    official: 'Hemithyroidectomy / total thyroidectomy',
    demographics: 'More common in women (thyroid nodules and cancer skew female ~3:1), typically 40–59. Often triggered by an enlarging nodule or suspicious biopsy.',
    purpose: 'To remove part or all of the thyroid gland because of nodules, goitre, overactivity or suspected/confirmed cancer.',
    introduction: 'Open surgery under general anaesthesia via a small neck crease incision. The affected lobe or whole gland is removed with care to preserve the recurrent laryngeal nerves and parathyroids.',
    opTime: '90–150 minutes. Usually 2 nights inpatient for neck-drain and calcium monitoring.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Total thyroidectomy',                 setting: '2-day inpatient', priceRange: 'HK$64K–86K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Matilda International Hospital',   official: 'Thyroid lobectomy',                   setting: '2-day inpatient', priceRange: 'HK$60K–80K', inRider: false, updated: 'Updated Aug 2025 · Matilda price list' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'Thyroidectomy',                       setting: '2-day inpatient', priceRange: 'HK$56K–74K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
    ],
  },
  'Hip replacement': {
    official: 'Total hip arthroplasty',
    demographics: 'Predominantly 60+, both sexes, driven by osteoarthritis and femoral-neck fractures. Demand grows with HK\u2019s ageing population.',
    purpose: 'To replace a hip joint destroyed by arthritis or fracture, relieving pain and restoring mobility.',
    introduction: 'Major orthopaedic surgery under general or spinal anaesthesia. The damaged femoral head and socket are removed and replaced with a metal/ceramic prosthesis and a lined acetabular cup.',
    opTime: '90–150 minutes. Around 5 nights inpatient with early physiotherapy.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Total hip replacement',               setting: '5-day inpatient', priceRange: 'HK$185K–235K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'Primary hip arthroplasty',            setting: '5-day inpatient', priceRange: 'HK$170K–215K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
      { name: 'Union Hospital',                   official: 'Total hip joint replacement',         setting: '4-day inpatient', priceRange: 'HK$155K–195K', inRider: false, updated: 'Updated Sep 2025 · Union fee guide' },
    ],
  },
  'Knee replacement': {
    official: 'Total knee arthroplasty',
    demographics: 'Mostly 60+, with a female skew; driven by end-stage knee osteoarthritis. One of the fastest-growing elective orthopaedic volumes in HK.',
    purpose: 'To resurface a knee worn out by arthritis, relieving pain and correcting deformity so the joint bends smoothly again.',
    introduction: 'Major orthopaedic surgery under general or spinal anaesthesia. Damaged cartilage and bone are trimmed and capped with metal components and a plastic spacer.',
    opTime: '75–120 minutes. Around 5 nights inpatient with intensive physiotherapy.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Total knee replacement',              setting: '5-day inpatient', priceRange: 'HK$170K–215K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Hong Kong Adventist Hospital',     official: 'Knee arthroplasty',                   setting: '5-day inpatient', priceRange: 'HK$160K–200K', inRider: true,  updated: 'Updated Oct 2025 · HKAH price list' },
      { name: 'Union Hospital',                   official: 'Total knee joint replacement',        setting: '4-day inpatient', priceRange: 'HK$145K–185K', inRider: false, updated: 'Updated Sep 2025 · Union fee guide' },
    ],
  },
  'Hysterectomy': {
    official: 'Total hysterectomy (± salpingo-oophorectomy)',
    demographics: 'Female only, peaking 40–59. Common indications are fibroids, heavy bleeding, endometriosis and prolapse. A high-volume gynaecological procedure in HK.',
    purpose: 'To remove the uterus (and sometimes ovaries/tubes) to treat fibroids, persistent bleeding, endometriosis or malignancy.',
    introduction: 'Performed laparoscopically, vaginally or open under general anaesthesia. The uterus is detached from supporting ligaments and blood supply and removed; the vaginal vault is closed.',
    opTime: '90–150 minutes. Typically 3–4 nights inpatient.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Total laparoscopic hysterectomy',     setting: '4-day inpatient', priceRange: 'HK$145K–185K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Matilda International Hospital',   official: 'Hysterectomy',                        setting: '3-day inpatient', priceRange: 'HK$135K–170K', inRider: false, updated: 'Updated Aug 2025 · Matilda price list' },
      { name: "St. Paul's Hospital",              official: 'Total abdominal hysterectomy',        setting: '4-day inpatient', priceRange: 'HK$120K–155K', inRider: true,  updated: 'Updated Sep 2025 · SPH fee guide' },
    ],
  },
  'Coronary bypass': {
    official: 'Coronary artery bypass grafting (CABG)',
    demographics: 'Predominantly male and 60+, reflecting the epidemiology of coronary artery disease. Risk factors: diabetes, hypertension, smoking, high cholesterol.',
    purpose: 'To restore blood flow to the heart muscle by routing around blocked coronary arteries, relieving angina and reducing heart-attack risk.',
    introduction: 'Major open-heart surgery under general anaesthesia, often on cardiopulmonary bypass. Grafts (usually internal mammary artery and leg vein) are sewn to bypass the blocked segments.',
    opTime: '3–6 hours. Around 9 nights inpatient including ICU recovery.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Coronary artery bypass graft',        setting: '9-day inpatient', priceRange: 'HK$330K–430K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'CABG (multi-vessel)',                 setting: '8-day inpatient', priceRange: 'HK$300K–390K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
      { name: 'Hong Kong Adventist Hospital',     official: 'Heart bypass surgery',                setting: '9-day inpatient', priceRange: 'HK$290K–370K', inRider: false, updated: 'Updated Sep 2025 · HKAH price list' },
    ],
  },
  'Heart valve repair': {
    official: 'Heart valve repair / replacement',
    demographics: 'Mostly 60+ (degenerative valve disease), both sexes; younger cases stem from rheumatic or congenital disease. Rising with the ageing population.',
    purpose: 'To repair or replace a heart valve that is leaking or narrowed, restoring efficient blood flow and relieving breathlessness.',
    introduction: 'Open-heart surgery under general anaesthesia on cardiopulmonary bypass. The valve is repaired (annuloplasty ring) or replaced with a mechanical or tissue prosthesis.',
    opTime: '3–5 hours. Around 10 nights inpatient including ICU.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Valve repair / replacement',          setting: '10-day inpatient', priceRange: 'HK$360K–470K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'Mitral / aortic valve surgery',       setting: '9-day inpatient',  priceRange: 'HK$330K–420K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
      { name: 'Union Hospital',                   official: 'Heart valve operation',               setting: '10-day inpatient', priceRange: 'HK$310K–400K', inRider: false, updated: 'Updated Sep 2025 · Union fee guide' },
    ],
  },
  'Cancer resection': {
    official: 'Surgical tumour resection',
    demographics: 'Concentrated 60+, both sexes; exact profile depends on tumour site (colorectal, lung, gastric most common in HK). Incidence climbs steeply with age.',
    purpose: 'To remove a malignant tumour with a margin of healthy tissue, often the cornerstone of curative cancer treatment.',
    introduction: 'Open or laparoscopic resection under general anaesthesia. The tumour-bearing segment and draining lymph nodes are removed; reconstruction or anastomosis follows as needed.',
    opTime: '2–5 hours depending on site. Around 8 nights inpatient.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Oncological resection',               setting: '8-day inpatient', priceRange: 'HK$390K–500K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'Tumour resection surgery',            setting: '7-day inpatient', priceRange: 'HK$350K–460K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
      { name: 'Hong Kong Adventist Hospital',     official: 'Cancer excision',                     setting: '8-day inpatient', priceRange: 'HK$340K–440K', inRider: false, updated: 'Updated Sep 2025 · HKAH price list' },
    ],
  },
  'Multi-level spinal fusion': {
    official: 'Posterior multi-level spinal fusion',
    demographics: 'Broad adult range with a peak 40–59, both sexes; driven by degenerative disc disease, spondylolisthesis and deformity. Sedentary lifestyles raise prevalence.',
    purpose: 'To permanently join two or more vertebrae to stop painful motion, correct deformity or stabilise the spine after decompression.',
    introduction: 'Major spinal surgery under general anaesthesia. Screws and rods are placed and bone graft is added between vertebrae so the segments fuse into one solid unit.',
    opTime: '3–6 hours. Around 7 nights inpatient with graduated mobilisation.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Multi-level posterior fusion',        setting: '7-day inpatient', priceRange: 'HK$310K–400K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Gleneagles Hospital Hong Kong',    official: 'Spinal instrumentation & fusion',     setting: '7-day inpatient', priceRange: 'HK$290K–375K', inRider: true,  updated: 'Updated Oct 2025 · Gleneagles packages' },
      { name: 'Union Hospital',                   official: 'Lumbar spinal fusion (multi-level)',  setting: '6-day inpatient', priceRange: 'HK$265K–340K', inRider: false, updated: 'Updated Sep 2025 · Union fee guide' },
    ],
  },
  'Breast cancer surgery': {
    official: 'Mastectomy / breast-conserving surgery',
    demographics: 'Almost entirely female, peaking 40–59 — breast cancer is the most common cancer among HK women. Family history and hormonal factors raise risk.',
    purpose: 'To remove a breast tumour, either by conserving the breast (lumpectomy) or removing it (mastectomy), with sampling of axillary lymph nodes.',
    introduction: 'Surgery under general anaesthesia. The tumour or whole breast is removed; a sentinel-node biopsy or axillary clearance assesses spread. Reconstruction may be done at the same sitting.',
    opTime: '90 minutes–3 hours depending on extent. Typically 3–4 nights inpatient.',
    hospitals: [
      { name: 'Hong Kong Sanatorium & Hospital', official: 'Mastectomy + sentinel node biopsy',   setting: '4-day inpatient', priceRange: 'HK$265K–345K', inRider: true,  updated: 'Updated Nov 2025 · HKSH fee schedule' },
      { name: 'Matilda International Hospital',   official: 'Breast-conserving surgery',           setting: '3-day inpatient', priceRange: 'HK$240K–310K', inRider: false, updated: 'Updated Aug 2025 · Matilda price list' },
      { name: "St. Paul's Hospital",              official: 'Wide local excision + axillary node', setting: '3-day inpatient', priceRange: 'HK$220K–290K', inRider: true,  updated: 'Updated Sep 2025 · SPH fee guide' },
    ],
  },
};

const getTreatmentDetail = (en) => TREATMENT_DETAILS[en] || null;

// All VHIS plans available (6). Each plan: annual coverage limit + per-surgery cap + ward class.
const VHIS_PLANS = [
  { id: 'std',          zh: '自願醫保 — 標準計劃',           en: 'VHIS Standard',                ward: 'standard',     annual: 420000,  perSurgery: 50000,   deductibles: [0],                   color: 'var(--bt-graphite)' },
  { id: 'flexi-basic',  zh: '自願醫保 — 靈活計劃（基本）',   en: 'Flexi Basic',                  ward: 'standard',     annual: 1500000, perSurgery: 200000,  deductibles: [0, 16000, 50000],     color: 'var(--bt-smurf)' },
  { id: 'flexi-sup',    zh: '自願醫保 — 靈活計劃（升級）',   en: 'Flexi Superior',               ward: 'semi-private', annual: 8000000, perSurgery: 999999,  deductibles: [0, 16000, 50000],     color: 'var(--bt-bowtie-blue)' },
  { id: 'pink-std',     zh: '粉紅計劃（普通房）',            en: 'Pink (Standard ward)',          ward: 'standard',     annual: 3000000, perSurgery: 400000,  deductibles: [0, 20000, 50000, 80000], color: 'var(--bt-bubble-gum)' },
  { id: 'pink-semi',    zh: '粉紅計劃（半私家）',            en: 'Pink (Semi-private)',           ward: 'semi-private', annual: 5000000, perSurgery: 600000,  deductibles: [0, 20000, 50000, 80000], color: 'var(--bt-bowtie-pink)' },
  { id: 'pink-priv',    zh: '粉紅計劃（私家）',              en: 'Pink (Private)',                ward: 'private',      annual: 10000000,perSurgery: 800000,  deductibles: [0, 20000, 50000, 80000], color: 'var(--bt-dragon-fruit)' },
];

// Coverage chart colors
const SEG_COLORS = {
  gm:    'var(--bt-green-day)',
  ded:   'var(--bt-bowtie-blue)',
  vhis:  'var(--bt-bowtie-pink)',
  oop:   'var(--bt-rock)',
};

// Compute coverage breakdown for one plan against a total cost + GM context
function computeBreakdown({ totalCost, gm, plan, deductible }) {
  // GM pays first, up to (perSurgery and remaining balance) min.
  let remaining = totalCost;
  let gmPaid = 0;
  if (gm.enabled) {
    gmPaid = Math.min(remaining, gm.perSurgery, gm.balance);
    remaining -= gmPaid;
  }
  // VHIS: customer pays deductible portion, then VHIS pays up to perSurgery cap
  const dedApplied = Math.min(remaining, deductible);
  remaining -= dedApplied;
  const vhisPaid = Math.min(remaining, plan.perSurgery);
  remaining -= vhisPaid;
  // Anything left is out-of-pocket
  const oop = remaining;
  return {
    gm: gmPaid,
    vhis: vhisPaid,
    ded: dedApplied,
    oop,
    customerPays: dedApplied + oop,
  };
}

const fmtHK = (n) => 'HK$' + (n || 0).toLocaleString('en-US');
const fmtHKShort = (n) => {
  if (!n) return 'HK$0';
  if (n >= 1000000) return 'HK$' + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
  if (n >= 1000) return 'HK$' + Math.round(n / 1000) + 'K';
  return 'HK$' + n;
};

Object.assign(window, { SURGERY_TIERS, CASES, VHIS_PLANS, SEG_COLORS, TREATMENT_DETAILS, getTreatmentDetail, computeBreakdown, fmtHK, fmtHKShort });
