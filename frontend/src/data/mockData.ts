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

export interface Category {
  id: string;
  label: string;
  icon: string;
}

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

export const seedSchemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    nameTe: "పీఎం-కిసాన్ (ప్రధానమంత్రి కిసాన్ సమ్మాన్ నిధి)",
    nameHi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
    summary: "Direct income support of ₹6,000 per year in 3 installments for farmer families.",
    summaryTe: "రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 ఆదాయ సహాయం 3 విడతల్లో నేరుగా ఖాతాలో జమ.",
    summaryHi: "किसान परिवारों के लिए ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता 3 किस्तों में।",
    description: "A central sector scheme providing income support to all landholding farmer families across the country to supplement their financial needs for procuring various inputs related to agriculture and allied activities as well as domestic needs.",
    descriptionTe: "వ్యవసాయం మరియు గృహ అవసరాలకు మద్దతుగా దేశవ్యాప్తంగా భూమి కలిగిన రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 అందించే కేంద్ర పథకం.",
    descriptionHi: "कृषि और घरेलू आवश्यकताओं की पूर्ति के लिए देश के सभी भूमिधारक किसान परिवारों को वित्तीय सहायता प्रदान करने वाली केंद्रीय योजना।",
    category: "agriculture",
    benefits: [
      "₹6,000 annual financial benefit transferred directly to Aadhaar-linked bank accounts in 3 equal installments of ₹2,000 each.",
      "Direct Benefit Transfer (DBT) eliminates middlemen and delays.",
      "Supplemental funds for buying seeds, fertilizers, and equipment."
    ],
    eligibilitySummary: "Small and marginal landholding farmer families with cultivable land in their names. Institutional landholders and high-income tax-paying households are excluded.",
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
    active: true
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat – PM-JAY",
    nameTe: "ఆయుష్మాన్ భారత్ – పీఎం-జేఏవై",
    nameHi: "आयुष्मान भारत – पीएम-जेएवाई",
    summary: "Cashless secondary and tertiary healthcare coverage of up to ₹5 lakh per family per year.",
    summaryTe: "ప్రతి కుటుంబానికి ఏడాదికి ₹5 లక్షల వరకు ఉచిత నగదు రహిత ఆసుపత్రి వైద్య చికిత్స.",
    summaryHi: "प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल इलाज व स्वास्थ्य बीमा।",
    description: "The world's largest government-funded healthcare assurance scheme offering cashless coverage for inpatient treatment across thousands of empaneled public and private hospitals across India.",
    descriptionTe: "భారతదేశవ్యాప్తంగా గుర్తింపు పొందిన ఆసుపత్రులలో ఉచితంగా సర్జరీలు, ఇన్‌పేషెంట్ చికిత్స అందించే ప్రజా ఆరోగ్య భరోసా పథకం.",
    descriptionHi: "देशभर के सूचीबद्ध सरकारी और निजी अस्पतालों में गंभीर बीमारियों और ऑपरेशनों के लिए मुफ्त इलाज प्रदान करने वाली सबसे बड़ी स्वास्थ्य योजना।",
    category: "health",
    benefits: [
      "₹5,00,000 cashless annual medical coverage per family.",
      "Covers over 1,900 medical procedures including heart surgeries, oncology, orthopedics, and intensive care.",
      "No restriction on family size, age, or gender; pre-existing conditions covered from day one."
    ],
    eligibilitySummary: "Rural households categorized as vulnerable under SECC criteria (D1 to D7 deprivation categories) and all senior citizens aged 70+ irrespective of income.",
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
    active: true
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana (SSY)",
    nameTe: "సుకన్య సమృద్ధి యోజన",
    nameHi: "सुकन्या समृद्धि योजना",
    summary: "High-interest, tax-free small savings scheme for the girl child's education and marriage.",
    summaryTe: "ఆడపిల్లల ఉన్నత విద్య మరియు వివాహం కొరకు అత్యధిక వడ్డీ ఇచ్చే చిన్న పొదుపు పథకం.",
    summaryHi: "बालिकाओं की उच्च शिक्षा और विवाह के लिए उच्च ब्याज वाली सुरक्षित बचत योजना।",
    description: "A government-backed savings initiative launched as part of the 'Beti Bachao, Beti Padhao' campaign. Parents can open an account in the name of a girl child from her birth until she turns 10 years old with an attractive sovereign guaranteed interest rate.",
    descriptionTe: "ఆడపిల్ల పుట్టినప్పటి నుండి 10 సంవత్సరాల వయస్సు వరకు తల్లిదండ్రులు తపాలా కార్యాలయం లేదా బ్యాంకులలో ప్రారంభించగల పొదుపు పథకం.",
    descriptionHi: "बेटी के जन्म से 10 वर्ष की आयु तक डाकघर या बैंक में खोला जाने वाला उच्च ब्याज और कर छूट युक्त बचत खाता।",
    category: "women-child",
    benefits: [
      "High annual compounded interest rate (currently ~8.2% p.a.).",
      "Triple tax exemption (EEE): investment, interest earned, and maturity proceeds are completely tax-free.",
      "Account can be opened with a minimum deposit of just ₹250."
    ],
    eligibilitySummary: "Girl child resident of India up to 10 years of age. Maximum of two girl children per family.",
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
    active: true
  }
];
