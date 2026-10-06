import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Scheme, SchemeInput } from "@workspace/api-zod";

const dataDirectory = process.env.GRAMASEVA_DATA_DIR ?? join(process.cwd(), ".data");
mkdirSync(dataDirectory, { recursive: true });

export const sqlite = new DatabaseSync(join(dataDirectory, "gramaseva.sqlite"));
sqlite.exec("PRAGMA foreign_keys = ON");
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

const categories = [
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

for (const category of categories) {
  sqlite
    .prepare(
      "INSERT OR IGNORE INTO categories (id, label, icon) VALUES (?, ?, ?)",
    )
    .run(category.id, category.label, category.icon);
}

const seedSchemes: Array<SchemeInput & { id: string }> = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    nameTe: "పీఎం-కిసాన్",
    nameHi: "पीएम-किसान",
    summary: "Income support information for eligible farmer families.",
    summaryTe: "అర్హులైన రైతు కుటుంబాలకు ఆదాయ సహాయం సమాచారం.",
    summaryHi: "पात्र किसान परिवारों के लिए आय सहायता की जानकारी।",
    description:
      "A central government scheme that provides income support to eligible landholding farmer families. This sample record is for discovery only; current rules and enrollment status must be verified with official sources.",
    descriptionTe:
      "అర్హత కలిగిన భూమి కలిగిన రైతు కుటుంబాలకు ఆదాయ సహాయం అందించే కేంద్ర పథకం. ఇది నమూనా సమాచారం మాత్రమే; ప్రస్తుత నిబంధనలను అధికారిక వనరుల ద్వారా నిర్ధారించండి.",
    descriptionHi:
      "पात्र भूमिधारक किसान परिवारों के लिए आय सहायता की केंद्रीय योजना। यह केवल नमूना जानकारी है; वर्तमान नियम आधिकारिक स्रोत से जाँचें।",
    category: "agriculture",
    benefits: ["Information about farmer-family income support."],
    eligibilitySummary:
      "Eligibility depends on landholding and scheme exclusions. Confirm current criteria with the agriculture department.",
    documents: ["Identity proof", "Bank account details", "Land records may be requested"],
    applicationSteps: [
      "Ask your local agriculture office or Common Service Centre for current enrollment guidance.",
      "Confirm the required records and application status before submitting.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["farmer", "farming", "income support", "kisan", "రైతు", "किसान"],
  },
  {
    id: "pm-fasal-bima",
    name: "Pradhan Mantri Fasal Bima Yojana",
    nameTe: "ప్రధానమంత్రి ఫసల్ బీమా యోజన",
    nameHi: "प्रधानमंत्री फसल बीमा योजना",
    summary: "Crop insurance guidance for farmers.",
    summaryTe: "రైతుల కోసం పంట బీమా మార్గదర్శకం.",
    summaryHi: "किसानों के लिए फसल बीमा मार्गदर्शन।",
    description:
      "A crop insurance programme intended to support farmers against specified crop losses. Crop, season, location, and enrollment windows can affect availability; check with the local agriculture department.",
    descriptionTe:
      "నిర్దిష్ట పంట నష్టాల సందర్భంలో రైతులకు సహాయపడే పంట బీమా కార్యక్రమం. పంట, సీజన్, ప్రాంతం, నమోదు గడువులను స్థానిక వ్యవసాయ శాఖతో తనిఖీ చేయండి.",
    descriptionHi:
      "निर्दिष्ट फसल हानि की स्थिति में किसानों की सहायता के लिए फसल बीमा कार्यक्रम। फसल, मौसम, क्षेत्र और नामांकन अवधि स्थानीय कृषि विभाग से जाँचें।",
    category: "agriculture",
    benefits: ["Information about crop-loss insurance coverage."],
    eligibilitySummary:
      "Participation depends on crop, location, season, and current enrollment rules.",
    documents: ["Identity proof", "Bank details", "Cultivation or land records"],
    applicationSteps: [
      "Ask the local agriculture office or bank about the current season.",
      "Confirm crop and location coverage before enrollment.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["farmer", "crop", "insurance", "agriculture", "పంట", "फसल"],
  },
  {
    id: "kisan-credit-card",
    name: "Kisan Credit Card",
    nameTe: "కిసాన్ క్రెడిట్ కార్డ్",
    nameHi: "किसान क्रेडिट कार्ड",
    summary: "Credit access information for eligible agricultural needs.",
    summaryTe: "అర్హమైన వ్యవసాయ అవసరాలకు రుణ సమాచారం.",
    summaryHi: "पात्र कृषि जरूरतों के लिए ऋण की जानकारी।",
    description:
      "A credit facility offered through participating banks for eligible agricultural and allied activities. Banks determine applications and terms; this sample does not promise approval.",
    descriptionTe:
      "అర్హమైన వ్యవసాయ మరియు అనుబంధ కార్యకలాపాల కోసం భాగస్వామ్య బ్యాంకుల ద్వారా అందించే రుణ సౌకర్యం. దరఖాస్తులు, నిబంధనలను బ్యాంకులే నిర్ణయిస్తాయి.",
    descriptionHi:
      "पात्र कृषि और संबंधित गतिविधियों के लिए भाग लेने वाले बैंकों द्वारा दी जाने वाली ऋण सुविधा। आवेदन और शर्तें बैंक तय करते हैं।",
    category: "agriculture",
    benefits: ["Information about agricultural credit through participating banks."],
    eligibilitySummary:
      "Applicants and eligible activities are assessed by the participating bank.",
    documents: ["Identity proof", "Address proof", "Agriculture activity details"],
    applicationSteps: [
      "Contact a participating bank or local agriculture office.",
      "Ask the bank which records and terms apply to your case.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["farmer", "credit", "loan", "bank", "agriculture", "రుణం", "ऋण"],
  },
  {
    id: "pmay-gramin",
    name: "Pradhan Mantri Awas Yojana – Gramin",
    nameTe: "ప్రధానమంత్రి ఆవాస్ యోజన – గ్రామీణ",
    nameHi: "प्रधानमंत्री आवास योजना – ग्रामीण",
    summary: "Rural housing assistance information.",
    summaryTe: "గ్రామీణ గృహ సహాయం సమాచారం.",
    summaryHi: "ग्रामीण आवास सहायता की जानकारी।",
    description:
      "A rural housing programme for eligible households. Selection and assistance depend on current programme rules and official beneficiary lists; this sample is not an application or approval.",
    descriptionTe:
      "అర్హమైన కుటుంబాల కోసం గ్రామీణ గృహ పథకం. ఎంపిక, సహాయం ప్రస్తుత నిబంధనలు మరియు అధికారిక జాబితాలపై ఆధారపడి ఉంటాయి.",
    descriptionHi:
      "पात्र परिवारों के लिए ग्रामीण आवास कार्यक्रम। चयन और सहायता वर्तमान नियमों तथा आधिकारिक सूची पर निर्भर है।",
    category: "housing",
    benefits: ["Information about rural housing assistance."],
    eligibilitySummary:
      "Eligibility and selection follow government criteria and local verification.",
    documents: ["Identity proof", "Residence details", "Household records"],
    applicationSteps: [
      "Ask your Gram Panchayat or block office about beneficiary selection.",
      "Verify your details and current application process locally.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["housing", "home", "house", "rural", "awas", "ఇల్లు", "घर"],
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat – PM-JAY",
    nameTe: "ఆయుష్మాన్ భారత్ – పీఎం-జేఏవై",
    nameHi: "आयुष्मान भारत – पीएम-जेएवाई",
    summary: "Public health coverage eligibility information.",
    summaryTe: "ప్రజారోగ్య కవరేజ్ అర్హత సమాచారం.",
    summaryHi: "सार्वजनिक स्वास्थ्य कवरेज पात्रता की जानकारी।",
    description:
      "A publicly funded health assurance programme for eligible families. Coverage, empanelled hospitals, and eligibility should be confirmed through the official health department or an authorized service centre.",
    descriptionTe:
      "అర్హమైన కుటుంబాల కోసం ప్రజా ఆరోగ్య భరోసా కార్యక్రమం. కవరేజ్, ఆసుపత్రులు, అర్హతను అధికారిక ఆరోగ్య శాఖ వద్ద నిర్ధారించండి.",
    descriptionHi:
      "पात्र परिवारों के लिए सार्वजनिक स्वास्थ्य आश्वासन कार्यक्रम। कवरेज, अस्पताल और पात्रता आधिकारिक स्वास्थ्य विभाग से जाँचें।",
    category: "health",
    benefits: ["Information about public health coverage for eligible families."],
    eligibilitySummary:
      "Eligibility is based on official criteria and available beneficiary records.",
    documents: ["Identity proof", "Family or ration-card records may help with verification"],
    applicationSteps: [
      "Check eligibility at an authorized health or Common Service Centre.",
      "Confirm participating hospitals and current coverage before care.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["health", "hospital", "medical", "insurance", "ఆరోగ్యం", "स्वास्थ्य"],
  },
  {
    id: "nmmss",
    name: "National Means-cum-Merit Scholarship Scheme",
    nameTe: "నేషనల్ మీన్స్-కమ్-మెరిట్ స్కాలర్‌షిప్",
    nameHi: "राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति योजना",
    summary: "Scholarship information for eligible school students.",
    summaryTe: "అర్హులైన పాఠశాల విద్యార్థులకు స్కాలర్‌షిప్ సమాచారం.",
    summaryHi: "पात्र स्कूली विद्यार्थियों के लिए छात्रवृत्ति की जानकारी।",
    description:
      "A scholarship programme for eligible students at the specified school stage. Current academic requirements, dates, and selection rules must be checked with the education department.",
    descriptionTe:
      "నిర్దిష్ట తరగతి దశలోని అర్హులైన విద్యార్థుల కోసం స్కాలర్‌షిప్ కార్యక్రమం. తాజా విద్యా అర్హతలు, తేదీలను నిర్ధారించండి.",
    descriptionHi:
      "निर्धारित कक्षा स्तर के पात्र विद्यार्थियों के लिए छात्रवृत्ति कार्यक्रम। वर्तमान शैक्षिक शर्तें और तिथियाँ जाँचें।",
    category: "scholarships",
    benefits: ["Information about scholarship support for eligible students."],
    eligibilitySummary:
      "School stage, academic performance, and family criteria may apply.",
    documents: ["Student identity and school records", "Income or category records if required"],
    applicationSteps: [
      "Ask your school about the current application and selection process.",
      "Confirm dates and required records with the education department.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["student", "school", "education", "scholarship", "విద్యార్థి", "छात्र"],
  },
  {
    id: "national-scholarship-portal",
    name: "National Scholarship Portal schemes",
    nameTe: "నేషనల్ స్కాలర్‌షిప్ పోర్టల్ పథకాలు",
    nameHi: "राष्ट्रीय छात्रवृत्ति पोर्टल की योजनाएँ",
    summary: "A starting point for finding eligible student scholarships.",
    summaryTe: "అర్హమైన విద్యార్థి స్కాలర్‌షిప్‌లను కనుగొనే ప్రారంభ స్థానం.",
    summaryHi: "पात्र छात्रवृत्तियाँ खोजने का शुरुआती स्थान।",
    description:
      "The National Scholarship Portal lists participating scholarship programmes. The application, eligibility, and dates differ by scheme, state, and student group; review each current notice.",
    descriptionTe:
      "నేషనల్ స్కాలర్‌షిప్ పోర్టల్‌లో పలు స్కాలర్‌షిప్ పథకాలు ఉంటాయి. పథకం, రాష్ట్రం, విద్యార్థి వర్గం ఆధారంగా నిబంధనలు మారుతాయి.",
    descriptionHi:
      "राष्ट्रीय छात्रवृत्ति पोर्टल पर कई छात्रवृत्ति कार्यक्रम सूचीबद्ध हैं। नियम योजना, राज्य और विद्यार्थी समूह के अनुसार बदलते हैं।",
    category: "education",
    benefits: ["Information about participating education scholarship programmes."],
    eligibilitySummary:
      "Requirements vary by scholarship; check the current notice for each programme.",
    documents: ["Student identity", "Enrollment records", "Other records listed in the current notice"],
    applicationSteps: [
      "Ask your school or college which current scholarship applies.",
      "Review the programme notice and submit through its official channel.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["student", "education", "college", "scholarship", "విద్య", "शिक्षा"],
  },
  {
    id: "mgnrega",
    name: "Mahatma Gandhi National Rural Employment Guarantee Act",
    nameTe: "మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ చట్టం",
    nameHi: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम",
    summary: "Information about rural wage-employment services.",
    summaryTe: "గ్రామీణ వేతన ఉపాధి సేవల సమాచారం.",
    summaryHi: "ग्रामीण मजदूरी-रोजगार सेवाओं की जानकारी।",
    description:
      "A rural employment programme that provides a process for eligible rural households to request work. Job-card status, work availability, and local procedures should be confirmed with the Gram Panchayat.",
    descriptionTe:
      "అర్హమైన గ్రామీణ కుటుంబాలు పనిని కోరుకునే ప్రక్రియను కలిగిన ఉపాధి కార్యక్రమం. జాబ్ కార్డ్, పని లభ్యతను గ్రామ పంచాయతీలో నిర్ధారించండి.",
    descriptionHi:
      "पात्र ग्रामीण परिवारों के लिए काम माँगने की प्रक्रिया वाला रोजगार कार्यक्रम। जॉब कार्ड, काम की उपलब्धता और स्थानीय प्रक्रिया पंचायत से जाँचें।",
    category: "employment",
    benefits: ["Information about requesting wage employment through local rural services."],
    eligibilitySummary:
      "Rural household members meeting programme rules can ask the Gram Panchayat about work registration.",
    documents: ["Household identity records", "Residence details", "Job card if already issued"],
    applicationSteps: [
      "Contact your Gram Panchayat to register or request work.",
      "Ask for a receipt or acknowledgement and check local procedures.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["job", "work", "employment", "rural", "wage", "ఉపాధి", "रोजगार"],
  },
  {
    id: "pm-ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana",
    nameTe: "ప్రధానమంత్రి ఉజ్వల యోజన",
    nameHi: "प्रधानमंत्री उज्ज्वला योजना",
    summary: "Clean cooking fuel connection guidance for eligible households.",
    summaryTe: "అర్హమైన కుటుంబాలకు శుభ్రమైన వంట ఇంధన మార్గదర్శకం.",
    summaryHi: "पात्र परिवारों के लिए स्वच्छ रसोई ईंधन कनेक्शन की जानकारी।",
    description:
      "A programme related to LPG connections for eligible adult women in specified households. Current beneficiary criteria and connection terms should be checked with an authorized LPG distributor.",
    descriptionTe:
      "నిర్దిష్ట కుటుంబాల్లోని అర్హమైన వయోజన మహిళలకు LPG కనెక్షన్‌కు సంబంధించిన పథకం. తాజా అర్హతను అధీకృత పంపిణీదారుని వద్ద నిర్ధారించండి.",
    descriptionHi:
      "निर्धारित परिवारों की पात्र वयस्क महिलाओं के लिए LPG कनेक्शन से जुड़ी योजना। वर्तमान पात्रता अधिकृत वितरक से जाँचें।",
    category: "women-child",
    benefits: ["Information about clean-cooking fuel connection support."],
    eligibilitySummary:
      "Applicant and household criteria apply; confirm current rules with an authorized distributor.",
    documents: ["Identity proof", "Household or ration-card records", "Bank details if requested"],
    applicationSteps: [
      "Contact an authorized LPG distributor or Common Service Centre.",
      "Confirm current eligibility, documents, and connection terms.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["women", "cooking gas", "lpg", "household", "మహిళ", "महिला"],
  },
  {
    id: "ignoaps",
    name: "Indira Gandhi National Old Age Pension Scheme",
    nameTe: "ఇందిరా గాంధీ జాతీయ వృద్ధాప్య పెన్షన్ పథకం",
    nameHi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना",
    summary: "Social pension eligibility guidance for older adults.",
    summaryTe: "వృద్ధుల సామాజిక పెన్షన్ అర్హత మార్గదర్శకం.",
    summaryHi: "वृद्धजनों के लिए सामाजिक पेंशन पात्रता मार्गदर्शन।",
    description:
      "A social assistance pension programme for older adults who meet the applicable government criteria. State-level processes and additional support can vary; verify locally.",
    descriptionTe:
      "వర్తించే ప్రభుత్వ ప్రమాణాలను కలిసే వృద్ధుల కోసం సామాజిక సహాయ పెన్షన్ కార్యక్రమం. రాష్ట్రాల ప్రక్రియలు మారవచ్చు.",
    descriptionHi:
      "लागू सरकारी मानदंड पूरे करने वाले वृद्धजनों के लिए सामाजिक सहायता पेंशन कार्यक्रम। राज्य की प्रक्रिया अलग हो सकती है।",
    category: "pension",
    benefits: ["Information about social pension assistance."],
    eligibilitySummary:
      "Age, household circumstances, and current central and state criteria may apply.",
    documents: ["Age proof", "Identity proof", "Residence and bank details"],
    applicationSteps: [
      "Ask your Gram Panchayat, block office, or social-welfare department about local application steps.",
      "Confirm age and household criteria before applying.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["pension", "senior", "older adult", "social security", "వృద్ధులు", "पेंशन"],
  },
  {
    id: "nsap-widow",
    name: "National Social Assistance Programme – Widow Pension",
    nameTe: "జాతీయ సామాజిక సహాయ కార్యక్రమం – వితంతు పెన్షన్",
    nameHi: "राष्ट्रीय सामाजिक सहायता कार्यक्रम – विधवा पेंशन",
    summary: "Social assistance information for eligible widowed women.",
    summaryTe: "అర్హులైన వితంతు మహిళలకు సామాజిక సహాయం సమాచారం.",
    summaryHi: "पात्र विधवा महिलाओं के लिए सामाजिक सहायता की जानकारी।",
    description:
      "A social-assistance route for eligible widowed women under applicable government criteria. State implementation and criteria differ; ask the local social-welfare office.",
    descriptionTe:
      "వర్తించే ప్రభుత్వ ప్రమాణాల ప్రకారం అర్హులైన వితంతు మహిళలకు సామాజిక సహాయ మార్గం. రాష్ట్రాల అమలు మారవచ్చు.",
    descriptionHi:
      "लागू सरकारी मानदंडों के अंतर्गत पात्र विधवा महिलाओं के लिए सामाजिक सहायता। राज्य के नियम अलग हो सकते हैं।",
    category: "pension",
    benefits: ["Information about social assistance pension pathways."],
    eligibilitySummary:
      "Age, household income, and state-specific criteria may apply.",
    documents: ["Identity proof", "Residence details", "Relevant household records"],
    applicationSteps: [
      "Contact your local social-welfare office or Common Service Centre.",
      "Confirm current state requirements and supporting documents.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["women", "widow", "pension", "social support", "వితంతు", "विधवा"],
  },
  {
    id: "pmkvy",
    name: "Pradhan Mantri Kaushal Vikas Yojana",
    nameTe: "ప్రధానమంత్రి కౌశల్ వికాస్ యోజన",
    nameHi: "प्रधानमंत्री कौशल विकास योजना",
    summary: "Skill-training programme information for job seekers.",
    summaryTe: "ఉద్యోగార్థులకు నైపుణ్య శిక్షణ కార్యక్రమ సమాచారం.",
    summaryHi: "नौकरी चाहने वालों के लिए कौशल प्रशिक्षण कार्यक्रम की जानकारी।",
    description:
      "A skills programme offering training through participating centres and providers. Courses and seats vary by location; ask a recognized centre about current availability and any assessment or certification.",
    descriptionTe:
      "భాగస్వామ్య కేంద్రాల ద్వారా నైపుణ్య శిక్షణ అందించే కార్యక్రమం. కోర్సులు, సీట్లు ప్రాంతాన్ని బట్టి మారతాయి.",
    descriptionHi:
      "भाग लेने वाले केंद्रों के माध्यम से कौशल प्रशिक्षण कार्यक्रम। पाठ्यक्रम और सीटें स्थान के अनुसार बदलती हैं।",
    category: "skill-development",
    benefits: ["Information about available vocational training options."],
    eligibilitySummary:
      "Course requirements and age criteria vary by training programme and centre.",
    documents: ["Identity proof", "Education records if requested", "Contact details"],
    applicationSteps: [
      "Find a local recognized training centre through a government service centre.",
      "Confirm course availability, eligibility, fees, and certification before enrollment.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["skill", "training", "job", "employment", "vocational", "నైపుణ్యం", "कौशल"],
  },
  {
    id: "day-nrlm",
    name: "Deendayal Antyodaya Yojana – National Rural Livelihoods Mission",
    nameTe: "దీన్‌దయాళ్ అంత్యోదయ యోజన – జాతీయ గ్రామీణ జీవనోపాధి మిషన్",
    nameHi: "दीनदयाल अंत्योदय योजना – राष्ट्रीय ग्रामीण आजीविका मिशन",
    summary: "Information about rural livelihoods and self-help groups.",
    summaryTe: "గ్రామీణ జీవనోపాధి, స్వయం సహాయక సంఘాల సమాచారం.",
    summaryHi: "ग्रामीण आजीविका और स्वयं सहायता समूहों की जानकारी।",
    description:
      "A rural livelihoods programme that supports community institutions and self-help groups. Local services and support options depend on the state and district implementation.",
    descriptionTe:
      "సముదాయ సంస్థలు, స్వయం సహాయక సంఘాలకు మద్దతు ఇచ్చే గ్రామీణ జీవనోపాధి కార్యక్రమం. సేవలు రాష్ట్రం, జిల్లాను బట్టి మారతాయి.",
    descriptionHi:
      "सामुदायिक संस्थाओं और स्वयं सहायता समूहों का समर्थन करने वाला ग्रामीण आजीविका कार्यक्रम। स्थानीय सेवाएँ राज्य और जिले के अनुसार बदलती हैं।",
    category: "financial-support",
    benefits: ["Information about self-help groups and rural livelihood support."],
    eligibilitySummary:
      "Local group membership, programme activity, and implementation rules may apply.",
    documents: ["Identity proof", "Residence details", "Group or livelihood records if applicable"],
    applicationSteps: [
      "Contact your village-level organization or block livelihoods mission office.",
      "Ask about active groups and support options in your area.",
    ],
    officialUrl: null,
    sourceType: "demo",
    lastUpdated: "2026-10-01",
    keywords: ["self help group", "livelihood", "women", "rural", "finance", "స్వయం సహాయక", "आजीविका"],
  },
];

const insertScheme = sqlite.prepare(`
  INSERT OR IGNORE INTO schemes (
    id, name, name_te, name_hi, summary, summary_te, summary_hi,
    description, description_te, description_hi, category, benefits,
    eligibility_summary, documents, application_steps, official_url,
    source_type, last_updated, keywords, search_text, active
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

for (const scheme of seedSchemes) {
  const searchText = [
    scheme.name,
    scheme.nameTe,
    scheme.nameHi,
    scheme.summary,
    scheme.summaryTe,
    scheme.summaryHi,
    scheme.description,
    scheme.category,
    scheme.keywords.join(" "),
    scheme.benefits.join(" "),
  ]
    .join(" ")
    .toLocaleLowerCase();
  insertScheme.run(
    scheme.id,
    scheme.name,
    scheme.nameTe,
    scheme.nameHi,
    scheme.summary,
    scheme.summaryTe,
    scheme.summaryHi,
    scheme.description,
    scheme.descriptionTe,
    scheme.descriptionHi,
    scheme.category,
    JSON.stringify(scheme.benefits),
    scheme.eligibilitySummary,
    JSON.stringify(scheme.documents),
    JSON.stringify(scheme.applicationSteps),
    scheme.officialUrl ?? null,
    scheme.sourceType,
    scheme.lastUpdated ?? "2026-10-01",
    JSON.stringify(scheme.keywords),
    searchText,
  );
}

const configuredAdminPassword =
  process.env.GRAMASEVA_ADMIN_PASSWORD ??
  (process.env.NODE_ENV === "development" ? "seva-demo" : undefined);

if (configuredAdminPassword) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(configuredAdminPassword, salt, 64).toString("hex");
  sqlite
    .prepare(
      `INSERT INTO admin_users (username, password_salt, password_hash)
       VALUES ('demo-admin', ?, ?)
       ON CONFLICT(username) DO UPDATE SET
         password_salt = excluded.password_salt,
         password_hash = excluded.password_hash`,
    )
    .run(salt, passwordHash);
}

type SchemeRow = {
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
};

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
  if (options.category) {
    clauses.push("category = ?");
    params.push(options.category);
  }
  if (options.query?.trim()) {
    clauses.push("search_text LIKE ? COLLATE NOCASE");
    params.push(`%${options.query.trim().toLocaleLowerCase()}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = sqlite
    .prepare(`SELECT * FROM schemes ${where} ORDER BY name COLLATE NOCASE`)
    .all(...params) as unknown as SchemeRow[];
  return rows.map(mapScheme);
}

export function getScheme(id: string): Scheme | undefined {
  const row = sqlite.prepare("SELECT * FROM schemes WHERE id = ?").get(id) as
    | SchemeRow
    | undefined;
  return row ? mapScheme(row) : undefined;
}

export function saveScheme(id: string, input: SchemeInput): Scheme {
  const lastUpdated = input.lastUpdated ?? new Date().toISOString().slice(0, 10);
  const active = input.active === false ? 0 : 1;
  const searchText = [
    input.name,
    input.nameTe,
    input.nameHi,
    input.summary,
    input.summaryTe,
    input.summaryHi,
    input.description,
    input.descriptionTe,
    input.descriptionHi,
    input.category,
    input.keywords.join(" "),
    input.benefits.join(" "),
    input.eligibilitySummary,
  ]
    .join(" ")
    .toLocaleLowerCase();

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
        search_text=excluded.search_text, active=excluded.active`,
    )
    .run(
      id,
      input.name,
      input.nameTe,
      input.nameHi,
      input.summary,
      input.summaryTe,
      input.summaryHi,
      input.description,
      input.descriptionTe,
      input.descriptionHi,
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
      active,
    );

  const saved = getScheme(id);
  if (!saved) throw new Error("Saved scheme could not be read back.");
  return saved;
}

export function newSchemeId(name: string): string {
  const slug = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  return `${slug || "scheme"}-${randomBytes(3).toString("hex")}`;
}

export function verifyAdminPassword(password: string): boolean {
  const row = sqlite
    .prepare(
      "SELECT password_salt, password_hash FROM admin_users WHERE username = 'demo-admin'",
    )
    .get() as { password_salt: string; password_hash: string } | undefined;
  if (!row) return false;

  const received = scryptSync(password, row.password_salt, 64);
  const expected = Buffer.from(row.password_hash, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
