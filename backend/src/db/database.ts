import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export interface Scheme {
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  summary: string;
  summaryTe: string;
  summaryHi: string;
  description: string;
  descriptionTe: string;
  descriptionHi: string;
  category: string;
  benefits: string[];
  eligibilitySummary: string;
  documents: string[];
  applicationSteps: string[];
  officialUrl: string | null;
  sourceType: "demo" | "verified";
  lastUpdated: string;
  keywords: string[];
  active: boolean;
}

export interface SchemeInput {
  name: string;
  nameTe?: string;
  nameHi?: string;
  summary: string;
  summaryTe?: string;
  summaryHi?: string;
  description: string;
  descriptionTe?: string;
  descriptionHi?: string;
  category: string;
  benefits: string[];
  eligibilitySummary: string;
  documents: string[];
  applicationSteps: string[];
  officialUrl?: string | null;
  sourceType: "demo" | "verified";
  lastUpdated?: string;
  keywords: string[];
  active?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export interface EligibilityInput {
  age?: number;
  gender?: string;
  state?: string;
  rural?: boolean;
  occupation?: string;
  annualIncome?: number;
  farmer?: boolean;
  student?: boolean;
  disability?: boolean;
  seniorCitizen?: boolean;
  housingNeed?: boolean;
  employmentStatus?: string;
}

export interface EligibilityMatch {
  scheme: Scheme;
  relevance: number;
  reasons: string[];
}

const dataDirectory = process.env.GRAMASEVA_DATA_DIR ?? join(process.cwd(), ".data");
mkdirSync(dataDirectory, { recursive: true });

export const sqlite = new DatabaseSync(join(dataDirectory, "gramaseva.sqlite"));
sqlite.exec("PRAGMA foreign_keys = ON;");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS schemes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_te TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    summary TEXT NOT NULL,
    summary_te TEXT NOT NULL,
    summary_hi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_te TEXT NOT NULL,
    description_hi TEXT NOT NULL,
    category TEXT NOT NULL,
    benefits TEXT NOT NULL,
    eligibility_summary TEXT NOT NULL,
    documents TEXT NOT NULL,
    application_steps TEXT NOT NULL,
    official_url TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('demo', 'verified')),
    last_updated TEXT NOT NULL,
    keywords TEXT NOT NULL,
    search_text TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    username TEXT PRIMARY KEY,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scheme_id) REFERENCES schemes(id)
  );
`);

export const categoriesList: Category[] = [
  { id: "agriculture", label: "Agriculture", icon: "sprout" },
  { id: "education", label: "Education", icon: "graduation-cap" },
  { id: "health", label: "Health", icon: "heart-pulse" },
  { id: "housing", label: "Housing", icon: "house" },
  { id: "employment", label: "Employment", icon: "briefcase-business" },
  { id: "women-child", label: "Women & Child Welfare", icon: "baby" },
  { id: "pension", label: "Pension & Social Security", icon: "hand-heart" },
  { id: "financial-support", label: "Financial Support", icon: "wallet" },
  { id: "scholarships", label: "Scholarships", icon: "book-open-check" },
  { id: "skill-development", label: "Skill Development", icon: "wrench" },
];

for (const cat of categoriesList) {
  sqlite
    .prepare("INSERT OR IGNORE INTO categories (id, label, icon) VALUES (?, ?, ?)")
    .run(cat.id, cat.label, cat.icon);
}

const seedSchemes: Array<SchemeInput & { id: string }> = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    nameTe: "పీఎం-కిసాన్ (ప్రధానమంత్రి కిసాన్ సమ్మాన్ నిధి)",
    nameHi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
    summary: "Direct income support of ₹6,000 per year in 3 installments for farmer families.",
    summaryTe: "రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 ఆదాయ సహాయం 3 విడతల్లో నేరుగా ఖాతాలో జమ.",
    summaryHi: "किसान परिवारों के लिए ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता 3 किस्तों में।",
    description:
      "A central sector scheme providing income support to all landholding farmer families across the country to supplement their financial needs for procuring various inputs related to agriculture and allied activities as well as domestic needs.",
    descriptionTe:
      "వ్యవసాయం మరియు గృహ అవసరాలకు మద్దతుగా దేశవ్యాప్తంగా భూమి కలిగిన రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 అందించే కేంద్ర పథకం.",
    descriptionHi:
      "कृषि और घरेलू आवश्यकताओं की पूर्ति के लिए देश के सभी भूमिधारक किसान परिवारों को वित्तीय सहायता प्रदान करने वाली केंद्रीय योजना।",
    category: "agriculture",
    benefits: [
      "₹6,000 annual financial benefit transferred directly to Aadhaar-linked bank accounts in 3 equal installments of ₹2,000 each.",
      "Direct Benefit Transfer (DBT) eliminates middlemen and delays.",
      "Supplemental funds for buying seeds, fertilizers, and equipment."
    ],
    eligibilitySummary:
      "Small and marginal landholding farmer families with cultivable land in their names. Institutional landholders and high-income tax-paying households are excluded.",
    documents: [
      "Aadhaar Card linked with mobile number",
      "Landholding documentation (Patta / RoR / Pahani)",
      "Bank account details (IFSC and Account Number)"
    ],
    applicationSteps: [
      "Visit the official portal or your local Common Service Centre (CSC) / Rythu Bharosa Kendra.",
      "Select 'New Farmer Registration' and enter your Aadhaar and State details.",
      "Fill in land ownership details and submit bank details for verification.",
      "Check status online or through your village agriculture officer."
    ],
    officialUrl: "https://pmkisan.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["farmer", "farming", "income support", "kisan", "pm kisan", "agriculture", "రైతు", "వ్యవసాయం", "కృషి", "किसान", "खेती"],
  },
  {
    id: "pm-fasal-bima",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameTe: "ప్రధానమంత్రి ఫసల్ బీమా యోజన",
    nameHi: "प्रधानमंत्री फसल बीमा योजना",
    summary: "Comprehensive crop insurance protection against non-preventable natural risks.",
    summaryTe: "ప్రకృతి వైపరీత్యాల వల్ల పంట నష్టాలకు సమగ్ర పంట బీమా రక్షణ.",
    summaryHi: "प्राकृतिक आपदाओं से फसल नुकसान के विरुद्ध व्यापक फसल बीमा सुरक्षा।",
    description:
      "An integrated crop insurance scheme formulated to provide comprehensive financial support to farmers suffering crop loss or damage arising out of unforeseen events such as droughts, floods, pest attacks, and post-harvest losses.",
    descriptionTe:
      "వరదలు, కరువు, తెగుళ్ళు వంటి ప్రకృతి విపత్తుల వల్ల నష్టపోయిన రైతులకు ఆర్థిక భద్రత కల్పించే పంట బీమా పథకం.",
    descriptionHi:
      "बाढ़, सूखा और कीटों के प्रकोप जैसी अप्रत्याशित आपदाओं से फसल हानि होने पर किसानों को वित्तीय सहायता प्रदान करने वाली योजना।",
    category: "agriculture",
    benefits: [
      "Very low premium rates for farmers: 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.",
      "Comprehensive risk cover from pre-sowing to post-harvest stages.",
      "Quick claim settlement using satellite imagery and mobile crop-cutting estimates."
    ],
    eligibilitySummary:
      "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas are eligible.",
    documents: [
      "Land record documents / Tenant agreement or certificate",
      "Aadhaar Card",
      "Active Bank Passbook",
      "Sowing Certificate issued by village revenue officer"
    ],
    applicationSteps: [
      "Contact your local bank branch, cooperative society, or Common Service Centre before the seasonal cut-off date.",
      "Submit sowing declaration along with land and bank records.",
      "Pay the subsidized farmer premium share and collect receipt."
    ],
    officialUrl: "https://pmfby.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["crop insurance", "farmer", "agriculture", "fasal bima", "harvest", "loss", "వరి", "పంట బీమా", "బీమా", "फसल बीमा", "बीमा"],
  },
  {
    id: "kisan-credit-card",
    name: "Kisan Credit Card (KCC) Scheme",
    nameTe: "కిసాన్ క్రెడిట్ కార్డ్ పథకం",
    nameHi: "किसान क्रेडिट कार्ड (KCC)",
    summary: "Affordable short-term formal credit for farming and agricultural activities.",
    summaryTe: "వ్యవసాయ మరియు అనుబంధ అవసరాలకు తక్కువ వడ్డీతో స్వల్పకాలిక రుణ సౌకర్యం.",
    summaryHi: "खेती और संबंधित कार्यों के लिए किफायती ब्याज पर अल्पकालिक बैंक ऋण।",
    description:
      "Provides timely and hassle-free institutional credit to farmers for their cultivation needs, purchase of farm inputs, post-harvest expenses, and allied activities such as animal husbandry and fisheries.",
    descriptionTe:
      "విత్తనాలు, ఎరువులు మరియు అనుబంధ పనుల కొరకు రైతులకు సకాలంలో బ్యాంకుల ద్వారా సరసమైన వడ్డీకి రుణం అందించే విధానం.",
    descriptionHi:
      "किसानों को बीज, खाद, कृषि उपकरण और पशुपालन हेतु बैंकों द्वारा आसान ब्याज दर पर समयबद्ध ऋण उपलब्ध कराने वाली योजना।",
    category: "agriculture",
    benefits: [
      "Concessional interest rate of effectively 4% per annum upon prompt repayment.",
      "Credit limit up to ₹3,00,000 with simple documentation.",
      "Flexibility to draw and deposit funds based on farming cash cycles."
    ],
    eligibilitySummary:
      "Individual or joint borrower farmers, owner cultivators, tenant farmers, sharecroppers, and self-help groups.",
    documents: [
      "Filled KCC application form",
      "Identity and Address Proof (Aadhaar / Voter ID)",
      "Land ownership documents / Cultivation records",
      "Passport size photographs"
    ],
    applicationSteps: [
      "Approach your nearest commercial bank, regional rural bank, or primary agricultural credit society.",
      "Fill out the standard 1-page KCC application form.",
      "Bank inspects land records and issues card with approved credit limit."
    ],
    officialUrl: "https://www.myscheme.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["kcc", "credit", "loan", "farmer", "agriculture", "bank loan", "రైతు రుణం", "క్రెడిట్ కార్డ్", "ऋण", "किसान क्रेडिट कार्ड"],
  },
  {
    id: "pmay-gramin",
    name: "Pradhan Mantri Awas Yojana – Gramin (PMAY-G)",
    nameTe: "ప్రధానమంత్రి ఆవాస్ యోజన – గ్రామీణ",
    nameHi: "प्रधानमंत्री आवास योजना – ग्रामीण",
    summary: "Financial assistance of ₹1.20 to ₹1.30 lakh for building a permanent pucca house.",
    summaryTe: "గ్రామీణ పేదలకు పక్కా ఇల్లు నిర్మించుకోవడానికి ₹1.20 నుండి ₹1.30 లక్షల సహాయం.",
    summaryHi: "ग्रामीण क्षेत्रों में पक्का मकान बनाने के लिए ₹1.20 से ₹1.30 लाख की वित्तीय सहायता।",
    description:
      "A flagship rural housing scheme aimed at providing a pucca house with basic amenities to all houseless households and those households living in kutcha and dilapidated houses in rural areas.",
    descriptionTe:
      "గ్రామీణ ప్రాంతాలలో నివాస యోగ్యమైన ఇల్లు లేని లేదా మట్టి ఇళ్ళలో నివసిస్తున్న పేద కుటుంబాలకు పక్కా ఇల్లు నిర్మించే కేంద్ర పథకం.",
    descriptionHi:
      "ग्रामीण क्षेत्रों में बेघर और कच्चे घरों में रहने वाले गरीब परिवारों को बुनियादी सुविधाओं से युक्त पक्का घर उपलब्ध कराने की योजना।",
    category: "housing",
    benefits: [
      "Direct grant of ₹1,20,000 in plain areas and ₹1,30,000 in hilly/difficult areas transferred in stages.",
      "Additional 90-95 person-days of unskilled labor wages under MGNREGA (~₹25,000).",
      "Assistance for toilet construction under Swachh Bharat Mission (₹12,000)."
    ],
    eligibilitySummary:
      "Identified through the Socio-Economic and Caste Census (SECC) and Awas+ rural household survey lists. Families without permanent pucca houses.",
    documents: [
      "Aadhaar Card of all family members",
      "Bank Account details linked to Aadhaar",
      "Job Card number under MGNREGA",
      "Proof of house site or current dwelling photo"
    ],
    applicationSteps: [
      "Check your family name in the Gram Panchayat PMAY-G beneficiary priority list.",
      "Contact your Panchayat Secretary or Gram Rozgar Sahayak to verify geo-tagged site survey.",
      "Upon sanction, funds are deposited directly into your bank account as foundation, lintel, and roof construction stages are completed."
    ],
    officialUrl: "https://pmayg.nic.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["housing", "home", "awas", "pucca house", "rural home", "pmay", "గ్రామీణ ఇల్లు", "ఆవాస్", "ఇల్లు", "आवास", "पक्का मकान", "घर"],
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat – PM-JAY",
    nameTe: "ఆయుష్మాన్ భారత్ – పీఎం-జేఏవై",
    nameHi: "आयुष्मान भारत – पीएम-जेएवाई",
    summary: "Cashless secondary and tertiary healthcare coverage of up to ₹5 lakh per family per year.",
    summaryTe: "ప్రతి కుటుంబానికి ఏడాదికి ₹5 లక్షల వరకు ఉచిత నగదు రహిత ఆసుపత్రి వైద్య చికిత్స.",
    summaryHi: "प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल इलाज व स्वास्थ्य बीमा।",
    description:
      "The world's largest government-funded healthcare assurance scheme offering cashless coverage for inpatient treatment across thousands of empaneled public and private hospitals across India.",
    descriptionTe:
      "భారతదేశవ్యాప్తంగా గుర్తింపు పొందిన ఆసుపత్రులలో ఉచితంగా సర్జరీలు, ఇన్‌పేషెంట్ చికిత్స అందించే ప్రజా ఆరోగ్య భరోసా పథకం.",
    descriptionHi:
      "देशभर के सूचीबद्ध सरकारी और निजी अस्पतालों में गंभीर बीमारियों और ऑपरेशनों के लिए मुफ्त इलाज प्रदान करने वाली सबसे बड़ी स्वास्थ्य योजना।",
    category: "health",
    benefits: [
      "₹5,00,000 cashless annual medical coverage per family.",
      "Covers over 1,900 medical procedures including heart surgeries, oncology, orthopedics, and intensive care.",
      "No restriction on family size, age, or gender; pre-existing conditions covered from day one."
    ],
    eligibilitySummary:
      "Rural households categorized as vulnerable under SECC criteria (D1 to D7 deprivation categories) and all senior citizens aged 70+ irrespective of income.",
    documents: [
      "Aadhaar Card",
      "Ration Card / Food Security Card",
      "Active Mobile number for OTP verification"
    ],
    applicationSteps: [
      "Visit any Ayushman Arogya Mandir, Common Service Centre, or government hospital Ayushman Mitra desk.",
      "Provide Aadhaar to check beneficiary database status (e-KYC).",
      "Download the Ayushman Bharat PM-JAY PVC card immediately upon approval."
    ],
    officialUrl: "https://pmjay.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["health", "hospital", "ayushman", "pmjay", "medical", "treatment", "ఆరోగ్యం", "ఆసుపత్రి", "ఉచిత వైద్యం", "स्वास्थ्य", "अस्पताल", "इलाज"],
  },
  {
    id: "mgnrega",
    name: "MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)",
    nameTe: "మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ చట్టం",
    nameHi: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (मनरेगा)",
    summary: "Guaranteed 100 days of wage employment per financial year for rural adult workers.",
    summaryTe: "గ్రామీణ కుటుంబాలకు సంవత్సరానికి 100 రోజుల వేతన ఉపాధి చట్టబద్ధమైన హక్కు.",
    summaryHi: "ग्रामीण परिवारों के लिए प्रति वित्तीय वर्ष 100 दिनों के अकुशल रोजगार की कानूनी गारंटी।",
    description:
      "A landmark social security legislation guaranteeing at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work near their village.",
    descriptionTe:
      "గ్రామీణ ప్రాంతాలలో పని చేయదలచిన ప్రతి వయోజన పౌరుడికి 100 రోజుల పనులను కల్పించి ఉపాధి కల్పించే చట్టబద్ధమైన పథకం.",
    descriptionHi:
      "ग्रामीण वयस्क कामगारों को उनके गांव के समीप 100 दिन का शारीरिक अकुशल काम और न्यूनतम मजदूरी सुनिश्चित करने वाला कानून।",
    category: "employment",
    benefits: [
      "Guaranteed 100 days of paid employment per rural household.",
      "Direct bank/post office account transfer of wages every fortnight.",
      "Unemployment allowance paid if work is not allotted within 15 days of application."
    ],
    eligibilitySummary:
      "Adult residents of any rural household willing to undertake unskilled manual labor.",
    documents: [
      "Aadhaar card of adult household members",
      "Passport size photographs",
      "Bank / Post office account passbook"
    ],
    applicationSteps: [
      "Submit an oral or written application for a Job Card at the Gram Panchayat office.",
      "Panchayat issues a photo Job Card within 15 days free of cost.",
      "Submit work demand application and obtain dated receipt.",
      "Work must be allotted within 5 km of the village within 15 days."
    ],
    officialUrl: "https://nrega.nic.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["employment", "job", "work", "mgnrega", "nrega", "wage", "rural labor", "ఉపాధి", "కూలీ పని", "జాబ్ కార్డు", "रोजगार", "मनरेगा", "काम", "मजदूरी"],
  },
  {
    id: "pm-ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    nameTe: "ప్రధానమంత్రి ఉజ్వల యోజన",
    nameHi: "प्रधानमंत्री उज्ज्वला योजना",
    summary: "Deposit-free LPG connection with free first cylinder and stove for women from rural poor homes.",
    summaryTe: "పేద మహిళలకు ఉచిత గ్యాస్ సిలిండర్ మరియు స్టౌవ్ తో కూడిన ఎల్‌పీజీ కనెక్షన్.",
    summaryHi: "गरीब परिवारों की महिलाओं को मुफ्त गैस चूल्हा व पहला सिलेंडर सहित एलपीजी कनेक्शन।",
    description:
      "Provides clean cooking fuel like LPG to rural and deprived households that were using traditional cooking fuels like firewood, coal, and cow-dung cakes, safeguarding the health of rural women and children.",
    descriptionTe:
      "కట్టెల పొయ్యి పొగ వల్ల కలిగే అనారోగ్యాల నుండి గ్రామీణ మహిళలను రక్షించడానికి ఉచిత ఎల్‌పీజీ వంట గ్యాస్ కనెక్షన్ అందించే పథకం.",
    descriptionHi:
      "पारंपरिक चूल्हों के धुएं से होने वाली बीमारियों से महिलाओं और बच्चों को बचाने के लिए मुफ्त एलपीजी कनेक्शन देने की योजना।",
    category: "women-child",
    benefits: [
      "Complete waiver of security deposit for 14.2 kg LPG cylinder and regulator.",
      "Free domestic gas stove (hotplate) and first refill cylinder.",
      "Direct subsidy per cylinder credited to the woman's bank account."
    ],
    eligibilitySummary:
      "Adult woman belonging to poor rural households (BPL/SECC listed or SC/ST/PM-AWAS beneficiaries) with no existing LPG connection in the household.",
    documents: [
      "Aadhaar Card of applicant woman and all adult family members",
      "Ration Card / Family composition certificate",
      "Bank Passbook in woman's name linked with Aadhaar",
      "Declaration of 14-point exclusion"
    ],
    applicationSteps: [
      "Collect and fill Ujjwala application form from any nearby LPG gas agency (Indane / Bharat Gas / HP Gas).",
      "Attach copies of Aadhaar, Ration Card, and bank details.",
      "Gas distributor verifies eligibility and installs cylinder and stove at your residence."
    ],
    officialUrl: "https://www.pmuy.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["gas", "lpg", "ujjwala", "women", "cooking", "cylinder", "మహిళ", "గ్యాస్ సిలిండర్", "ఉజ్వల", "महिला", "उज्ज्वला", "गैस कनेक्शन", "रसोई"],
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana (SSY)",
    nameTe: "సుకన్య సమృద్ధి యోజన",
    nameHi: "सुकन्या समृद्धि योजना",
    summary: "High-interest, tax-free small savings scheme for the girl child's education and marriage.",
    summaryTe: "ఆడపిల్లల ఉన్నత విద్య మరియు వివాహం కొరకు అత్యధిక వడ్డీ ఇచ్చే చిన్న పొదుపు పథకం.",
    summaryHi: "बालिकाओं की उच्च शिक्षा और विवाह के लिए उच्च ब्याज वाली सुरक्षित बचत योजना।",
    description:
      "A government-backed savings initiative launched as part of the 'Beti Bachao, Beti Padhao' campaign. Parents can open an account in the name of a girl child from her birth until she turns 10 years old with an attractive sovereign guaranteed interest rate.",
    descriptionTe:
      "ఆడపిల్ల పుట్టినప్పటి నుండి 10 సంవత్సరాల వయస్సు వరకు తల్లిదండ్రులు తపాలా కార్యాలయం లేదా బ్యాంకులలో ప్రారంభించగల పొదుపు పథకం.",
    descriptionHi:
      "बेटी के जन्म से 10 वर्ष की आयु तक डाकघर या बैंक में खोला जाने वाला उच्च ब्याज और कर छूट युक्त बचत खाता।",
    category: "women-child",
    benefits: [
      "High annual compounded interest rate (currently ~8.2% p.a.).",
      "Triple tax exemption (EEE): investment, interest earned, and maturity proceeds are completely tax-free.",
      "Account can be opened with a minimum deposit of just ₹250."
    ],
    eligibilitySummary:
      "Girl child resident of India up to 10 years of age. Maximum of two girl children per family.",
    documents: [
      "Girl child's Birth Certificate",
      "Identity and Address proof of guardian/parent (Aadhaar/PAN)",
      "Passport size photos of child and parent"
    ],
    applicationSteps: [
      "Visit any India Post branch or authorized commercial bank.",
      "Submit the filled SSY Account Opening Form along with the child's birth certificate.",
      "Deposit the initial amount (minimum ₹250) and receive the SSY passbook."
    ],
    officialUrl: "https://www.indiapost.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["sukanya", "girl child", "education", "savings", "women", "ఆడపిల్ల", "సుకన్య", "పొదుపు", "सुकन्या", "बेटी", "बचत", "बालिका"],
  },
  {
    id: "ignoaps-pension",
    name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    nameTe: "ఇందిరా గాంధీ జాతీయ వృద్ధాప్య పింఛను పథకం",
    nameHi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना",
    summary: "Monthly social security pension for senior citizens from low-income rural households.",
    summaryTe: "నిరుపేద వృద్ధ పౌరులకు ప్రతి నెలా అందించే జీవన భృతి సామాజిక పింఛను.",
    summaryHi: "गरीब वृद्धजनों को जीवनयापन के लिए मासिक सामाजिक सुरक्षा पेंशन।",
    description:
      "Under the National Social Assistance Programme (NSAP), this non-contributory pension scheme provides monthly financial assistance to senior citizens living below the poverty line to ensure dignified living in their old age.",
    descriptionTe:
      "దరిద్రరేఖకు దిగువన ఉన్న 60 సంవత్సరాలు దాటిన వృద్ధులకు ప్రతి నెలా అందించే గౌరవప్రదమైన పింఛను సహాయం.",
    descriptionHi:
      "गरीबी रेखा से नीचे जीवन यापन करने वाले 60 वर्ष या उससे अधिक आयु के वरिष्ठ नागरिकों के लिए मासिक पेंशन।",
    category: "pension",
    benefits: [
      "Monthly pension deposited directly into the beneficiary's bank or postal account.",
      "State government tops up central grant (typically ₹1,000 to ₹3,000 total per month depending on state).",
      "Higher pension slab for super seniors aged 80 and above."
    ],
    eligibilitySummary:
      "Persons aged 60 years and above belonging to households identified as living Below Poverty Line (BPL).",
    documents: [
      "Proof of Age (Aadhaar Card, Voter ID, or medical board certificate)",
      "BPL Ration Card or local poverty certificate",
      "Bank / Post Office account passbook"
    ],
    applicationSteps: [
      "Obtain pension application form from the Gram Panchayat or Mandal/Block Development Office (BDO).",
      "Attach age proof and BPL certification.",
      "Social Welfare department verifies credentials and sanctions monthly pension."
    ],
    officialUrl: "https://nsap.nic.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["pension", "senior citizen", "old age", "social security", "nsap", "వృద్ధాప్య పింఛను", "పెన్షన్", "వృద్ధులు", "वृद्धावस्था पेंशन", "पेंशन", "बुजुर्ग"],
  },
  {
    id: "nsap-widow-pension",
    name: "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
    nameTe: "ఇందిరా గాంధీ జాతీయ వితంతు పింఛను పథకం",
    nameHi: "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना",
    summary: "Monthly financial pension for widowed women living below the poverty line.",
    summaryTe: "దారిద్య్రరేఖకు దిగువన ఉన్న వితంతు మహిళలకు నెలవారీ ఆర్థిక భరోసా పింఛను.",
    summaryHi: "गरीबी रेखा से नीचे रहने वाली विधवा महिलाओं को मासिक वित्तीय पेंशन सहायता।",
    description:
      "Provides sustained financial assistance and dignity to widowed women from underprivileged rural households who lack adequate personal or family income.",
    descriptionTe:
      "కుటుంబ ఆధారము కోల్పోయిన పేద వితంతు మహిళల ఆత్మగౌరవానికి ప్రభుత్వం అందించే నెలవారీ పింఛను.",
    descriptionHi:
      "पति की मृत्यु के बाद असहाय और निर्धन विधवा महिलाओं को भरण-पोषण हेतु सामाजिक पेंशन।",
    category: "pension",
    benefits: [
      "Monthly regular pension credited to Aadhaar-linked savings account.",
      "Integrated with free healthcare under PM-JAY and subsidised food grain under NFSA.",
      "Financial independence and social dignity."
    ],
    eligibilitySummary:
      "Widowed women aged 40 to 79 years living in households categorized Below the Poverty Line (BPL).",
    documents: [
      "Husband's Death Certificate",
      "Aadhaar Card of the applicant",
      "BPL Card or Income Certificate from local revenue authority",
      "Bank Account details"
    ],
    applicationSteps: [
      "Apply through the village administrative officer / Gram Panchayat office.",
      "Submit death certificate and proof of economic status.",
      "Upon field verification, monthly disbursal starts via Direct Benefit Transfer."
    ],
    officialUrl: "https://nsap.nic.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["widow pension", "pension", "women", "nsap", "social support", "వితంతు పింఛను", "పెన్షన్", "మహిళ", "विधवा पेंशन", "पेंशन", "महिला"],
  },
  {
    id: "nmmss-scholarship",
    name: "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    nameTe: "నేషనల్ మీన్స్-కమ్-మెరిట్ స్కాలర్‌షిప్ పథకం",
    nameHi: "राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना (NMMSS)",
    summary: "Scholarship of ₹12,000 per year for meritorious students from economically weaker sections.",
    summaryTe: "ఆర్థికంగా వెనుకబడిన ప్రతిభావంతులైన విద్యార్థులకు సంవత్సరానికి ₹12,000 స్కాలర్‌షిప్.",
    summaryHi: "आर्थिक रूप से कमजोर मेधावी विद्यार्थियों के लिए ₹12,000 प्रति वर्ष की छात्रवृत्ति।",
    description:
      "A central sector scholarship aimed at arresting dropouts at Class 8 and encouraging economically weaker students to continue secondary education through Class 12.",
    descriptionTe:
      "8వ తరగతిలో డ్రాపౌట్లను అరికట్టి పేద విద్యార్థులు 12వ తరగతి వరకు చదువుకోవడానికి ప్రోత్సహించే ప్రతిభా స్కాలర్‌షిప్.",
    descriptionHi:
      "कक्षा 8 के बाद पढ़ाई छोड़ने से रोकने और 12वीं तक शिक्षा जारी रखने के लिए छात्रवृत्ति।",
    category: "scholarships",
    benefits: [
      "₹12,000 per annum (₹1,000 per month) from Class 9 to Class 12.",
      "Disbursed directly into student's bank account through National Scholarship Portal.",
      "Motivates continued academic progression."
    ],
    eligibilitySummary:
      "Class 8 students studying in government/local body schools having at least 55% marks and parental annual income not exceeding ₹3,50,000.",
    documents: [
      "Class 7 & 8 Marksheets",
      "Parental Income Certificate",
      "Student Aadhaar Card and active Bank Passbook in student's name",
      "Caste / Category certificate if applicable"
    ],
    applicationSteps: [
      "Register for the State Level NMMSS Selection Examination conducted in Class 8.",
      "Upon qualifying the written test, apply on the National Scholarship Portal (NSP).",
      "School principal verifies application online."
    ],
    officialUrl: "https://scholarships.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["scholarship", "student", "education", "merit", "school", "nmmss", "విద్యార్థి", "స్కాలర్‌షిప్", "చదువు", "छात्रवृत्ति", "शिक्षा", "स्कूल"],
  },
  {
    id: "national-scholarship-portal",
    name: "Post-Matric Scholarships for SC/ST/OBC Students",
    nameTe: "ఎస్సీ/ఎస్టీ/ఓబీసీ విద్యార్థుల పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌లు",
    nameHi: "एससी/एसटी/ओबीसी विद्यार्थियों हेतु पोस्ट-मैट्रिक छात्रवृत्ति",
    summary: "Full fee reimbursement and maintenance allowance for higher education after Class 10.",
    summaryTe: "10వ తరగతి తర్వాత ఉన్నత విద్య కోసం పూర్తి ఫీజు రీయింబర్స్‌మెంట్ మరియు మెయింటెనెన్స్ భృతి.",
    summaryHi: "10वीं के बाद उच्च शिक्षा हेतु शिक्षण शुल्क प्रतिपूर्ति एवं निर्वाह भत्ता।",
    description:
      "Provides comprehensive financial support to students from Scheduled Castes, Scheduled Tribes, and Other Backward Classes studying at post-secondary or post-matriculation stage to enable them to complete higher education.",
    descriptionTe:
      "ఇంటర్, డిగ్రీ, ఇంజనీరింగ్, మెడిసిన్ చదివే బడుగు వర్గాల విద్యార్థులకు ఫీజులు, హాస్టల్ ఖర్చులు భరించే ఉపకార వేతనం.",
    descriptionHi:
      "कॉलेज, डिग्री, तकनीकी और व्यावसायिक शिक्षा प्राप्त करने वाले छात्रों के लिए शुल्क मुक्ति और छात्रवृत्ति योजना।",
    category: "education",
    benefits: [
      "100% compulsory non-refundable fees reimbursed directly to university/college.",
      "Monthly maintenance allowance for hostellers and day scholars.",
      "Books and study tour grant for professional degree programs."
    ],
    eligibilitySummary:
      "Students belonging to eligible categories who have passed Matriculation (Class 10) with family annual income within prescribed limits (up to ₹2.5 lakh).",
    documents: [
      "Caste Certificate issued by Competent Authority",
      "Latest Income Certificate",
      "Previous Year Marks Memo",
      "College Admission Fee Receipt and Bonafide Certificate",
      "Aadhaar-seeded Bank Account"
    ],
    applicationSteps: [
      "Apply online at National Scholarship Portal (NSP) or respective state e-Pass portal.",
      "Upload all certificates and submit verification copy to your college nodal officer.",
      "District welfare officer approves the scholarship after physical verification."
    ],
    officialUrl: "https://scholarships.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["scholarship", "college", "higher education", "fee reimbursement", "sc st obc", "ఉన్నత విద్య", "ఫీజు రీయింబర్స్", "విద్యార్థి", "उच्च शिक्षा", "छात्रवृत्ति", "फीस माफी"],
  },
  {
    id: "pmkvy-skills",
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
    nameTe: "ప్రధానమంత్రి కౌశల్ వికాస్ యోజన",
    nameHi: "प्रधानमंत्री कौशल विकास योजना (PMKVY 4.0)",
    summary: "Free industry-relevant skill training, certification, and placement assistance for rural youth.",
    summaryTe: "గ్రామీణ యువతకు ఉచిత నైపుణ్య శిక్షణ, ప్రభుత్వ సర్టిఫికెట్ మరియు ఉద్యోగ అవకాశాలు.",
    summaryHi: "ग्रामीण युवाओं के लिए निःशुल्क उद्योग-प्रासंगिक कौशल प्रशिक्षण, प्रमाणन और रोजगार सहायता।",
    description:
      "A flagship outcome-based skill training scheme aimed at enabling Indian youth to take up industry-relevant skill training that will help them secure a better livelihood and employment opportunities.",
    descriptionTe:
      "విద్య అర్ధాంతరంగా ఆపేసిన గ్రామీణ యువతకు టెక్నికల్, అగ్రికల్చర్, ఎలక్ట్రానిక్స్ రంగాలలో స్వల్పకాలిక శిక్షణ ఇచ్చే పథకం.",
    descriptionHi:
      "बेरोजगार युवाओं को विभिन्न तकनीकी क्षेत्रों में आधुनिक कौशल सिखाकर आत्मनिर्भर और रोजगारक्षम बनाने की योजना।",
    category: "skill-development",
    benefits: [
      "100% free training courses recognized by National Council for Vocational Education and Training (NCVET).",
      "Government-recognized Skill India Certificate upon assessment.",
      "Monetary reward stipend on certification and job placement melas."
    ],
    eligibilitySummary:
      "Any unemployed youth or school/college dropouts aged between 15 to 45 years with basic literacy.",
    documents: [
      "Aadhaar Card",
      "Educational qualification certificates (if any, 5th/8th/10th/12th)",
      "Bank Account details",
      "Passport size photograph"
    ],
    applicationSteps: [
      "Visit your nearest Pradhan Mantri Kaushal Kendra (PMKK) or Common Service Centre.",
      "Choose a skill course aligned with your interest (Solar technician, Electrician, Data entry, Tailoring, Food processing).",
      "Attend the training batch, take the assessment exam, and receive the certificate."
    ],
    officialUrl: "https://www.pmkvyofficial.org",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["skill", "training", "youth", "job", "pmkvy", "vocational", "నైపుణ్యం", "శిక్షణ", "ఉపాధి", "యువత", "कौशल", "प्रशिक्षण", "रोजगार"],
  },
  {
    id: "day-nrlm-shg",
    name: "DAY-NRLM (National Rural Livelihoods Mission / Aajeevika)",
    nameTe: "దీన్‌దయాళ్ అంత్యోదయ యోజన – జాతీయ గ్రామీణ జీవనోపాధి మిషన్",
    nameHi: "दीनदयाल अंत्योदय योजना – राष्ट्रीय ग्रामीण आजीविका मिशन",
    summary: "Low-interest collateral-free bank loans and revolving funds for Women Self-Help Groups (SHGs).",
    summaryTe: "మహిళా స్వయం సహాయక సంఘాలకు (డ్వాక్రా) పూచీకత్తు లేని తక్కువ వడ్డీ బ్యాంకు రుణాలు.",
    summaryHi: "महिला स्वयं सहायता समूहों (SHGs) के लिए कम ब्याज दर पर बिना गारंटी बैंक ऋण और वित्तीय सहायता।",
    description:
      "Empowers rural poor women by organizing them into Self-Help Groups (SHGs) and federations, providing revolving funds, community investment support, and bank linkage to start micro-enterprises and generate sustainable livelihoods.",
    descriptionTe:
      "గ్రామీణ మహిళలను స్వయం సహాయక సంఘాలుగా సమీకరించి, పొదుపు అలవాటును పెంచి, వ్యాపారాలు ప్రారంభించడానికి రుణాలు అందించే పథకం.",
    descriptionHi:
      "ग्रामीण गरीब महिलाओं को स्वयं सहायता समूहों से जोड़कर बचत, वित्तीय साक्षरता और स्वरोजगार के साधन उपलब्ध कराने की योजना।",
    category: "financial-support",
    benefits: [
      "Collateral-free bank loans up to ₹20 lakh for eligible Self-Help Groups.",
      "Interest Subvention reducing effective interest to as low as 7% or 4% upon prompt repayment.",
      "One-time Revolving Fund of ₹15,000 and Community Investment Support Fund."
    ],
    eligibilitySummary:
      "Rural women belonging to vulnerable and poor households willing to form or join village Self-Help Groups.",
    documents: [
      "SHG resolution copy and group ledger",
      "Aadhaar cards of group members",
      "Group Savings Bank Passbook"
    ],
    applicationSteps: [
      "Contact your Village Organization (VO) animator or Mandal Samakhya / Block Mission Management Unit.",
      "Form or participate in an SHG with regular monthly savings.",
      "Qualify for micro-credit plan and apply for bank credit linkage."
    ],
    officialUrl: "https://aajeevika.gov.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["self help group", "women", "shg", "dwacra", "livelihood", "loan", "మహిళా సంఘాలు", "డ్వాక్రా", "స్వయం సహాయక", "రుణం", "महिला समूह", "स्वयं सहायता समूह", "आजीविका", "ऋण"],
  },
  {
    id: "pm-mudra-yojana",
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    nameTe: "ప్రధానమంత్రి ముద్రా యోజన",
    nameHi: "प्रधानमंत्री मुद्रा योजना (PMMY)",
    summary: "Collateral-free business loans up to ₹10 lakh for small shopkeepers, artisans, and rural enterprises.",
    summaryTe: "చిన్న వ్యాపారులు, చేతివృత్తుల వారికి పూచీకత్తు లేకుండా ₹10 లక్షల వరకు వ్యాపార రుణాలు.",
    summaryHi: "छोटे व्यापारियों, कारीगरों और उद्यमियों के लिए ₹10 लाख तक का बिना गारंटी व्यापार ऋण।",
    description:
      "Provides formal institutional credit to non-corporate, non-farm small and micro enterprises. Categorized into Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 lakh), and Tarun (₹5 lakh to ₹10 lakh) loans.",
    descriptionTe:
      "గ్రామీణ కిరాణా దుకాణాలు, వర్క్‌షాపులు, చేతివృత్తులు నిర్వహించే చిన్న వ్యాపారులకు బ్యాంకుల ద్వారా రుణ సహాయం.",
    descriptionHi:
      "छोटे व्यवसाय, दुकान, डेयरी, हैंडीक्राफ्ट्स या सेवा उद्योग शुरू करने या बढ़ाने के लिए बिना किसी संपत्ति गिरवी रखे लोन।",
    category: "financial-support",
    benefits: [
      "No security or third-party collateral required for loans up to ₹10 lakh.",
      "Low processing fees and flexible repayment tenures up to 5 years.",
      "MUDRA debit card issued for easy working capital withdrawal."
    ],
    eligibilitySummary:
      "Any Indian citizen having a business plan for non-farm income generating micro activities such as manufacturing, processing, trading, or service sector.",
    documents: [
      "Proof of Identity and Address (Aadhaar / Voter ID / Driving License)",
      "Proof of business establishment / enterprise registration",
      "Quotation of machinery/items to be purchased",
      "Bank statement of last 6 months"
    ],
    applicationSteps: [
      "Approach any public/private commercial bank, cooperative bank, or NBFC.",
      "Submit the standard MUDRA loan application along with business proposal and KYC.",
      "Loan is sanctioned and credited upon brief verification."
    ],
    officialUrl: "https://www.mudra.org.in",
    sourceType: "verified",
    lastUpdated: "2026-10-01",
    keywords: ["mudra", "business loan", "small enterprise", "credit", "finance", "వ్యాపార రుణం", "ముద్రా", "స్వయం ఉపాధి", "व्यापार ऋण", "मुद्रा योजना", "लोन"],
  }
];

const insertScheme = sqlite.prepare(`
  INSERT OR IGNORE INTO schemes (
    id, name, name_te, name_hi, summary, summary_te, summary_hi,
    description, description_te, description_hi, category, benefits,
    eligibility_summary, documents, application_steps, official_url,
    source_type, last_updated, keywords, search_text, active
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

for (const s of seedSchemes) {
  const searchText = [
    s.name,
    s.nameTe,
    s.nameHi,
    s.summary,
    s.summaryTe,
    s.summaryHi,
    s.description,
    s.category,
    s.keywords.join(" "),
    s.benefits.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  insertScheme.run(
    s.id,
    s.name,
    s.nameTe || s.name,
    s.nameHi || s.name,
    s.summary,
    s.summaryTe || s.summary,
    s.summaryHi || s.summary,
    s.description,
    s.descriptionTe || s.description,
    s.descriptionHi || s.description,
    s.category,
    JSON.stringify(s.benefits),
    s.eligibilitySummary,
    JSON.stringify(s.documents),
    JSON.stringify(s.applicationSteps),
    s.officialUrl ?? null,
    s.sourceType,
    s.lastUpdated ?? "2026-10-01",
    JSON.stringify(s.keywords),
    searchText
  );
}

// Setup Admin
const configuredAdminPassword = process.env.GRAMASEVA_ADMIN_PASSWORD || "seva-demo";
const salt = randomBytes(16).toString("hex");
const passwordHash = scryptSync(configuredAdminPassword, salt, 64).toString("hex");

sqlite
  .prepare(
    `INSERT INTO admin_users (username, password_salt, password_hash)
     VALUES ('demo-admin', ?, ?)
     ON CONFLICT(username) DO UPDATE SET
       password_salt = excluded.password_salt,
       password_hash = excluded.password_hash`
  )
  .run(salt, passwordHash);

interface SchemeRow {
  id: string;
  name: string;
  name_te: string;
  name_hi: string;
  summary: string;
  summary_te: string;
  summary_hi: string;
  description: string;
  description_te: string;
  description_hi: string;
  category: string;
  benefits: string;
  eligibility_summary: string;
  documents: string;
  application_steps: string;
  official_url: string | null;
  source_type: "demo" | "verified";
  last_updated: string;
  keywords: string;
  active: number;
}

export function mapScheme(row: SchemeRow): Scheme {
  return {
    id: row.id,
    name: row.name,
    nameTe: row.name_te,
    nameHi: row.name_hi,
    summary: row.summary,
    summaryTe: row.summary_te,
    summaryHi: row.summary_hi,
    description: row.description,
    descriptionTe: row.description_te,
    descriptionHi: row.description_hi,
    category: row.category,
    benefits: JSON.parse(row.benefits) as string[],
    eligibilitySummary: row.eligibility_summary,
    documents: JSON.parse(row.documents) as string[],
    applicationSteps: JSON.parse(row.application_steps) as string[],
    officialUrl: row.official_url,
    sourceType: row.source_type,
    lastUpdated: row.last_updated,
    keywords: JSON.parse(row.keywords) as string[],
    active: row.active === 1,
  };
}

export function listSchemes(options: {
  query?: string;
  category?: string;
  includeInactive?: boolean;
} = {}): Scheme[] {
  const clauses: string[] = [];
  const params: string[] = [];

  if (!options.includeInactive) clauses.push("active = 1");
  if (options.category && options.category !== "all") {
    clauses.push("category = ?");
    params.push(options.category);
  }
  if (options.query?.trim()) {
    clauses.push("search_text LIKE ? COLLATE NOCASE");
    params.push(`%${options.query.trim().toLowerCase()}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = sqlite
    .prepare(`SELECT * FROM schemes ${where} ORDER BY name COLLATE NOCASE`)
    .all(...params) as unknown as SchemeRow[];
  return rows.map(mapScheme);
}

export function getSchemeById(id: string): Scheme | undefined {
  const row = sqlite.prepare("SELECT * FROM schemes WHERE id = ?").get(id) as SchemeRow | undefined;
  return row ? mapScheme(row) : undefined;
}

export function getCategoriesWithCounts(): Category[] {
  const rows = sqlite.prepare(`
    SELECT c.id, c.label, c.icon, COUNT(s.id) AS count
    FROM categories c
    LEFT JOIN schemes s ON s.category = c.id AND s.active = 1
    GROUP BY c.id, c.label, c.icon
    ORDER BY c.label
  `).all() as unknown as Array<{ id: string; label: string; icon: string; count: number }>;

  return rows;
}

export function saveScheme(id: string, input: SchemeInput): Scheme {
  const lastUpdated = input.lastUpdated ?? new Date().toISOString().slice(0, 10);
  const active = input.active === false ? 0 : 1;
  const searchText = [
    input.name,
    input.nameTe || input.name,
    input.nameHi || input.name,
    input.summary,
    input.summaryTe || input.summary,
    input.summaryHi || input.summary,
    input.description,
    input.descriptionTe || input.description,
    input.descriptionHi || input.description,
    input.category,
    input.keywords.join(" "),
    input.benefits.join(" "),
    input.eligibilitySummary,
  ]
    .join(" ")
    .toLowerCase();

  sqlite
    .prepare(
      `INSERT INTO schemes (
        id, name, name_te, name_hi, summary, summary_te, summary_hi,
        description, description_te, description_hi, category, benefits,
        eligibility_summary, documents, application_steps, official_url,
        source_type, last_updated, keywords, search_text, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, name_te=excluded.name_te, name_hi=excluded.name_hi,
        summary=excluded.summary, summary_te=excluded.summary_te, summary_hi=excluded.summary_hi,
        description=excluded.description, description_te=excluded.description_te, description_hi=excluded.description_hi,
        category=excluded.category, benefits=excluded.benefits, eligibility_summary=excluded.eligibility_summary,
        documents=excluded.documents, application_steps=excluded.application_steps, official_url=excluded.official_url,
        source_type=excluded.source_type, last_updated=excluded.last_updated, keywords=excluded.keywords,
        search_text=excluded.search_text, active=excluded.active`
    )
    .run(
      id,
      input.name,
      input.nameTe || input.name,
      input.nameHi || input.name,
      input.summary,
      input.summaryTe || input.summary,
      input.summaryHi || input.summary,
      input.description,
      input.descriptionTe || input.description,
      input.descriptionHi || input.description,
      input.category,
      JSON.stringify(input.benefits),
      input.eligibilitySummary,
      JSON.stringify(input.documents),
      JSON.stringify(input.applicationSteps),
      input.officialUrl ?? null,
      input.sourceType,
      lastUpdated,
      JSON.stringify(input.keywords),
      searchText,
      active
    );

  const saved = getSchemeById(id);
  if (!saved) throw new Error("Saved scheme could not be retrieved.");
  return saved;
}

export function generateSchemeId(name: string): string {
  const slug = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${slug || "scheme"}-${randomBytes(3).toString("hex")}`;
}

export function deactivateScheme(id: string): boolean {
  const result = sqlite
    .prepare("UPDATE schemes SET active = 0 WHERE id = ? AND active = 1")
    .run(id);
  return result.changes > 0;
}

export function createReport(schemeId: string, message: string): number {
  const result = sqlite
    .prepare("INSERT INTO reports (scheme_id, message) VALUES (?, ?)")
    .run(schemeId, message.trim());
  return Number(result.lastInsertRowid);
}

export function verifyAdminPassword(password: string): boolean {
  const row = sqlite
    .prepare("SELECT password_salt, password_hash FROM admin_users WHERE username = 'demo-admin'")
    .get() as { password_salt: string; password_hash: string } | undefined;
  if (!row) return false;

  const received = scryptSync(password, row.password_salt, 64);
  const expected = Buffer.from(row.password_hash, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function getAdminSummary(): { total: number; active: number; categories: number } {
  const total = sqlite.prepare("SELECT COUNT(*) AS count FROM schemes").get() as { count: number };
  const active = sqlite.prepare("SELECT COUNT(*) AS count FROM schemes WHERE active = 1").get() as { count: number };
  const cat = sqlite.prepare("SELECT COUNT(*) AS count FROM categories").get() as { count: number };
  return {
    total: total.count,
    active: active.count,
    categories: cat.count,
  };
}
