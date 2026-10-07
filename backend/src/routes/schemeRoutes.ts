import { Router, type Request, type Response } from "express";
import {
  listSchemes,
  getSchemeById,
  getCategoriesWithCounts,
  createReport,
  type EligibilityInput,
  type EligibilityMatch,
  type Scheme,
} from "../db/database.js";

const router = Router();

// Health Check
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), service: "GramaSeva API" });
});

router.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), service: "GramaSeva API" });
});

// List Schemes
router.get("/schemes", (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const sort = typeof req.query.sort === "string" ? req.query.sort : "relevance";

    const schemes = listSchemes({ query: q, category });

    if (sort === "name") {
      schemes.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json(schemes);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({ error: "Failed to fetch schemes." });
  }
});

// Search Schemes
router.get("/schemes/search", (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const results = listSchemes({ query: q });
    res.json(results);
  } catch (error) {
    console.error("Error searching schemes:", error);
    res.status(500).json({ error: "Failed to search schemes." });
  }
});

// Categories with Counts
router.get("/categories", (_req: Request, res: Response) => {
  try {
    const categories = getCategoriesWithCounts();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// Schemes by Category
router.get("/schemes/category/:category", (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const schemes = listSchemes({ category });
    res.json(schemes);
  } catch (error) {
    console.error("Error fetching category schemes:", error);
    res.status(500).json({ error: "Failed to fetch category schemes." });
  }
});

// Scheme Details by ID
router.get("/schemes/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const scheme = getSchemeById(id);
    if (!scheme || !scheme.active) {
      res.status(404).json({ error: "Scheme not found or is currently inactive." });
      return;
    }
    res.json(scheme);
  } catch (error) {
    console.error("Error fetching scheme details:", error);
    res.status(500).json({ error: "Failed to fetch scheme details." });
  }
});

// Eligibility Evaluation Helper
function evaluateEligibility(scheme: Scheme, input: EligibilityInput): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const category = scheme.category;

  const occupationStr = (input.occupation || "").toLowerCase();
  const isFarmer = Boolean(input.farmer) || occupationStr.includes("farm") || occupationStr.includes("kisan") || occupationStr.includes("రైతు") || occupationStr.includes("किसान");
  const isStudent = Boolean(input.student) || occupationStr.includes("student") || occupationStr.includes("చదువు") || occupationStr.includes("छात्र");
  const isJobSeeker = occupationStr.includes("job") || occupationStr.includes("unemploy") || input.employmentStatus === "unemployed";
  const isSenior = Boolean(input.seniorCitizen) || (typeof input.age === "number" && input.age >= 60);

  if (isFarmer && category === "agriculture") {
    score += 8;
    reasons.push("Matches your agricultural/farming background.");
  }

  if (isStudent && (category === "education" || category === "scholarships")) {
    score += 8;
    reasons.push("Designed for students pursuing education or scholarships.");
  }

  if (isSenior && category === "pension") {
    score += 8;
    reasons.push("Applicable for senior citizens and older adults.");
  }

  if (input.housingNeed && category === "housing") {
    score += 8;
    reasons.push("Addresses your identified housing and shelter requirements.");
  }

  if (isJobSeeker && (category === "employment" || category === "skill-development")) {
    score += 7;
    reasons.push("Assists individuals seeking rural employment or vocational training.");
  }

  if (input.disability && category === "pension") {
    score += 3;
    reasons.push("Contains social assistance provisions for persons with disabilities.");
  }

  if (input.gender?.toLowerCase() === "female" && (category === "women-child" || category === "financial-support")) {
    score += 5;
    reasons.push("Tailored initiatives for women welfare and self-help group entrepreneurship.");
  }

  if (input.rural && ["agriculture", "housing", "employment", "financial-support", "women-child"].includes(category)) {
    score += 3;
    reasons.push("Specially targeted toward rural citizens and panchayat areas.");
  }

  if (input.annualIncome !== undefined && input.annualIncome < 300000) {
    if (["pension", "housing", "scholarships", "employment", "health"].includes(category)) {
      score += 2;
      reasons.push("Tailored for low to middle-income rural families.");
    }
  }

  return { score, reasons };
}

// Eligibility Check API
router.post("/eligibility/check", (req: Request, res: Response) => {
  try {
    const input: EligibilityInput = req.body || {};
    const allSchemes = listSchemes();

    const matches: EligibilityMatch[] = allSchemes
      .map((scheme) => {
        const { score, reasons } = evaluateEligibility(scheme, input);
        return {
          scheme,
          relevance: Math.min(98, Math.max(35, score * 10 + 15)),
          reasons,
        };
      })
      .filter((m) => m.reasons.length > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    res.json(matches);
  } catch (error) {
    console.error("Error running eligibility check:", error);
    res.status(500).json({ error: "Failed to evaluate scheme eligibility." });
  }
});

// Assistant Synonyms and Stopwords
const synonymGroups: Array<{ keywords: string[]; tag: string }> = [
  { keywords: ["farmer", "farming", "agriculture", "crop", "seeds", "kisan", "రైతు", "వ్యవసాయం", "పంట", "किसान", "खेती", "फसल"], tag: "agriculture" },
  { keywords: ["student", "school", "college", "study", "scholarship", "fees", "విద్యార్థి", "స్కాలర్‌షిప్", "చదువు", "छात्र", "पढ़ाई", "छात्रवृत्ति", "शिक्षा"], tag: "education" },
  { keywords: ["housing", "house", "home", "shelter", "pucca", "awas", "ఇల్లు", "ఆవాస్", "నివాసం", "घर", "मकान", "आवास"], tag: "housing" },
  { keywords: ["health", "hospital", "doctor", "medical", "treatment", "medicine", "ఆరోగ్యం", "ఆసుపత్రి", "వైద్యం", "स्वास्थ्य", "अस्पताल", "इलाज", "बीमारी"], tag: "health" },
  { keywords: ["job", "work", "employment", "wage", "labor", "mgnrega", "ఉపాధి", "పని", "కూలీ", "జాబ్", "रोजगार", "काम", "नौकरी", "मजदूरी"], tag: "employment" },
  { keywords: ["pension", "old age", "senior", "widow", "elderly", "వృద్ధాప్యం", "పింఛను", "పెన్షన్", "వితంతు", "पेंशन", "बुजुर्ग", "वृद्धावस्था", "विधवा"], tag: "pension" },
  { keywords: ["women", "girl", "mother", "daughter", "child", "gas", "cylinder", "ujjwala", "మహిళ", "ఆడపిల్ల", "ఉజ్వల", "గ్యాస్", "महिला", "बेटी", "उज्ज्वला", "गैस"], tag: "women-child" },
  { keywords: ["skill", "training", "vocational", "course", "learn", "నైపుణ్యం", "శిక్షణ", "कौशल", "ट्रेनिंग", "प्रशिक्षण"], tag: "skill-development" },
  { keywords: ["loan", "credit", "business", "money", "fund", "shg", "mudra", "రుణం", "వ్యాపారం", "ముద్రా", "డ్వాక్రా", "ऋण", "लोन", "व्यापार", "मुद्रा"], tag: "financial-support" },
];

// Multilingual Assistant Query
router.post("/assistant/query", async (req: Request, res: Response) => {
  try {
    const { message, language = "en" } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const cleanMsg = message.trim().toLowerCase();
    const allSchemes = listSchemes();

    // Match categories and schemes
    const matchedCategories = new Set<string>();
    for (const group of synonymGroups) {
      if (group.keywords.some((kw) => cleanMsg.includes(kw.toLowerCase()))) {
        matchedCategories.add(group.tag);
      }
    }

    // Rank schemes
    const matchedSchemes = allSchemes
      .map((scheme) => {
        let score = 0;
        if (matchedCategories.has(scheme.category)) score += 5;

        // Search text matching
        const searchCorpus = `${scheme.name} ${scheme.nameTe} ${scheme.nameHi} ${scheme.summary} ${scheme.summaryTe} ${scheme.summaryHi} ${scheme.description} ${scheme.keywords.join(" ")}`.toLowerCase();

        const words = cleanMsg.split(/[\s,?.!;:+-]+/).filter((w) => w.length > 2);
        for (const word of words) {
          if (searchCorpus.includes(word)) score += 2;
        }

        return { scheme, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.scheme);

    // Natural answer generation in user language
    let answerText = "";
    if (matchedSchemes.length > 0) {
      const topScheme = matchedSchemes[0];
      const schemeName = language === "te" ? topScheme.nameTe : language === "hi" ? topScheme.nameHi : topScheme.name;
      const schemeSummary = language === "te" ? topScheme.summaryTe : language === "hi" ? topScheme.summaryHi : topScheme.summary;

      if (language === "te") {
        answerText = `మీ అభ్యర్థనకు సంబంధించి "${schemeName}" మరియు ఇతర సంబంధిత పథకాలు కనుగొనబడ్డాయి. ${schemeSummary} వివరాల కోసం క్రింది పథకాలను పరిశీలించండి లేదా మీ సమీప గ్రామ సచివాలయం / సేవా కేంద్రాన్ని సంప్రదించండి.`;
      } else if (language === "hi") {
        answerText = `आपके प्रश्न के अनुसार "${schemeName}" और अन्य संबंधित योजनाएँ मिली हैं। ${schemeSummary} अधिक जानकारी के लिए नीचे दी गई योजनाओं को देखें या अपने नज़दीकी जन सेवा केंद्र पर संपर्क करें।`;
      } else {
        answerText = `Based on your request, I found relevant programs including "${schemeName}". ${schemeSummary} Check the scheme cards below for required documents, eligibility details, and application steps.`;
      }
    } else {
      if (language === "te") {
        answerText = "క్షమించండి, మీ ప్రశ్నకు సరిగ్గా సరిపోయే పథకం కనుగొనబడలేదు. దయచేసి పథకాల జాబితాను శోధించండి లేదా మీ సమీప గ్రామ సచివాలయాన్ని సంప్రదించండి.";
      } else if (language === "hi") {
        answerText = "क्षमा करें, आपके प्रश्न से मेल खाती कोई सटीक योजना नहीं मिली। कृपया योजनाओं की सूची में खोजें या अपने नज़दीकी सेवा केंद्र से संपर्क करें।";
      } else {
        answerText = "I couldn't locate an exact scheme matching those terms. You can browse through our categorized schemes or consult your nearest Common Service Centre for personalized assistance.";
      }
    }

    res.json({
      answer: answerText,
      schemes: matchedSchemes,
    });
  } catch (error) {
    console.error("Error in assistant endpoint:", error);
    res.status(500).json({ error: "Failed to answer question." });
  }
});

// Citizen Report Outdated Info
router.post("/reports", (req: Request, res: Response) => {
  try {
    const { schemeId, message } = req.body || {};
    if (!schemeId || !message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Scheme ID and message are required." });
      return;
    }

    const scheme = getSchemeById(schemeId);
    if (!scheme) {
      res.status(404).json({ error: "Scheme not found." });
      return;
    }

    const reportId = createReport(schemeId, message);
    res.status(201).json({ id: reportId, received: true, message: "Report successfully received. Thank you!" });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to record report." });
  }
});

export default router;
