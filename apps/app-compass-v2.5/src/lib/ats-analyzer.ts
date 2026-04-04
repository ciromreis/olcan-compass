/**
 * ATS Analyzer - Resume Matcher
 * Inspirado em: github.com/srbhr/Resume-Matcher
 * 
 * Analisa compatibilidade entre currículo e descrição de vaga
 * para otimização de ATS (Applicant Tracking Systems)
 */

export interface ATSAnalysisResult {
  overallScore: number; // 0-100
  keywordMatch: {
    score: number;
    matched: string[];
    missing: string[];
    total: number;
  };
  skillsMatch: {
    score: number;
    matched: string[];
    missing: string[];
    recommendations: string[];
  };
  experienceMatch: {
    score: number;
    yearsRequired: number | null;
    yearsFound: number | null;
    feedback: string;
  };
  educationMatch: {
    score: number;
    required: string[];
    found: string[];
    feedback: string;
  };
  suggestions: ATSSuggestion[];
  strengths: string[];
  weaknesses: string[];
}

export interface ATSSuggestion {
  id: string;
  type: "critical" | "important" | "optional";
  category: "keywords" | "skills" | "experience" | "education" | "formatting";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable: string;
}

interface AnalysisInput {
  resumeText: string;
  jobDescription: string;
}

// Palavras comuns a ignorar na análise
const STOP_WORDS = new Set([
  "a", "o", "e", "de", "da", "do", "em", "para", "com", "por", "um", "uma",
  "the", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "que", "como", "mais", "muito", "sua", "seu", "seus", "suas", "este", "esta"
]);

// Skills técnicas comuns
const COMMON_SKILLS = [
  // Programming
  "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "php",
  "react", "angular", "vue", "node.js", "express", "django", "flask", "spring",
  "sql", "nosql", "mongodb", "postgresql", "mysql", "redis",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
  "git", "ci/cd", "jenkins", "github actions",
  
  // Data Science
  "machine learning", "deep learning", "nlp", "computer vision",
  "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
  "data analysis", "statistics", "r", "matlab",
  
  // Business
  "project management", "agile", "scrum", "kanban",
  "leadership", "communication", "teamwork", "problem solving",
  "excel", "powerpoint", "tableau", "power bi",
  
  // Languages
  "english", "spanish", "german", "french", "portuguese", "mandarin",
  "inglês", "espanhol", "alemão", "francês", "português", "mandarim"
];

/**
 * Extrai palavras-chave relevantes de um texto
 */
function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  const words = normalized.split(" ");
  const keywords = new Set<string>();
  
  // Palavras individuais
  words.forEach(word => {
    if (word.length > 3 && !STOP_WORDS.has(word)) {
      keywords.add(word);
    }
  });
  
  // Bigramas (duas palavras)
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
      keywords.add(bigram);
    }
  }
  
  // Trigramas (três palavras) para skills compostas
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    const isSkill = COMMON_SKILLS.some(skill => 
      trigram.includes(skill) || skill.includes(trigram)
    );
    if (isSkill) {
      keywords.add(trigram);
    }
  }
  
  return Array.from(keywords);
}

/**
 * Extrai skills técnicas do texto
 */
function extractSkills(text: string): string[] {
  const normalized = text.toLowerCase();
  const foundSkills = new Set<string>();
  
  COMMON_SKILLS.forEach(skill => {
    if (normalized.includes(skill)) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills);
}

/**
 * Extrai anos de experiência mencionados no texto
 */
function extractYearsOfExperience(text: string): number | null {
  const patterns = [
    /(\d+)\+?\s*(?:anos?|years?)\s*(?:de\s*)?(?:experiência|experience)/gi,
    /(?:experiência|experience)\s*(?:de\s*)?(\d+)\+?\s*(?:anos?|years?)/gi,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/);
      if (numbers) {
        return parseInt(numbers[0], 10);
      }
    }
  }
  
  return null;
}

/**
 * Extrai requisitos de educação
 */
function extractEducation(text: string): string[] {
  const normalized = text.toLowerCase();
  const education = new Set<string>();
  
  const degrees = [
    "phd", "doutorado", "doctorate",
    "master", "mestrado", "msc", "mba",
    "bachelor", "bacharelado", "graduação", "licenciatura",
    "técnico", "technical degree"
  ];
  
  degrees.forEach(degree => {
    if (normalized.includes(degree)) {
      education.add(degree);
    }
  });
  
  return Array.from(education);
}

/**
 * Calcula score de compatibilidade entre dois conjuntos
 */
function calculateMatchScore(required: string[], found: string[]): number {
  if (required.length === 0) return 100;
  
  const requiredSet = new Set(required.map(r => r.toLowerCase()));
  const foundSet = new Set(found.map(f => f.toLowerCase()));
  
  let matches = 0;
  requiredSet.forEach(req => {
    if (foundSet.has(req)) {
      matches++;
    } else {
      // Partial match (substring)
      const hasPartialMatch = Array.from(foundSet).some(f => 
        f.includes(req) || req.includes(f)
      );
      if (hasPartialMatch) {
        matches += 0.5;
      }
    }
  });
  
  return Math.round((matches / requiredSet.size) * 100);
}

/**
 * Gera sugestões de otimização
 */
function generateSuggestions(
  resumeKeywords: string[],
  jobKeywords: string[],
  resumeSkills: string[],
  jobSkills: string[],
  resumeEducation: string[],
  jobEducation: string[]
): ATSSuggestion[] {
  const suggestions: ATSSuggestion[] = [];
  let suggestionId = 0;
  
  // Missing critical keywords
  const missingKeywords = jobKeywords.filter(jk => 
    !resumeKeywords.some(rk => rk.includes(jk) || jk.includes(rk))
  ).slice(0, 5);
  
  if (missingKeywords.length > 0) {
    suggestions.push({
      id: `suggestion-${suggestionId++}`,
      type: "critical",
      category: "keywords",
      title: "Palavras-chave ausentes",
      description: `Sua vaga menciona: ${missingKeywords.join(", ")}. Inclua essas palavras-chave no seu currículo se você tiver experiência relevante.`,
      impact: "high",
      actionable: `Adicione menções a: ${missingKeywords.slice(0, 3).join(", ")} nas seções de experiência ou competências.`
    });
  }
  
  // Missing skills
  const missingSkills = jobSkills.filter(js => !resumeSkills.includes(js)).slice(0, 5);
  
  if (missingSkills.length > 0) {
    suggestions.push({
      id: `suggestion-${suggestionId++}`,
      type: "important",
      category: "skills",
      title: "Competências técnicas faltando",
      description: `A vaga requer: ${missingSkills.join(", ")}. Se você possui essas habilidades, destaque-as claramente.`,
      impact: "high",
      actionable: `Crie uma seção "Competências Técnicas" e liste: ${missingSkills.slice(0, 3).join(", ")}.`
    });
  }
  
  // Education mismatch
  const missingEducation = jobEducation.filter(je => !resumeEducation.includes(je));
  
  if (missingEducation.length > 0) {
    suggestions.push({
      id: `suggestion-${suggestionId++}`,
      type: "important",
      category: "education",
      title: "Formação acadêmica",
      description: `A vaga menciona: ${missingEducation.join(", ")}. Certifique-se de que sua formação está claramente descrita.`,
      impact: "medium",
      actionable: "Adicione sua formação acadêmica completa com grau, instituição e ano."
    });
  }
  
  // Formatting tips
  suggestions.push({
    id: `suggestion-${suggestionId++}`,
    type: "optional",
    category: "formatting",
    title: "Otimização para ATS",
    description: "Use formatação simples e evite tabelas, caixas de texto ou gráficos que podem confundir sistemas ATS.",
    impact: "medium",
    actionable: "Use texto simples, bullets (•) e seções claramente marcadas com títulos."
  });
  
  return suggestions;
}

/**
 * Analisa compatibilidade entre currículo e vaga
 */
export function analyzeATSCompatibility(input: AnalysisInput): ATSAnalysisResult {
  const { resumeText, jobDescription } = input;
  
  // Extract features
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);
  
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);
  
  const resumeYears = extractYearsOfExperience(resumeText);
  const jobYears = extractYearsOfExperience(jobDescription);
  
  const resumeEducation = extractEducation(resumeText);
  const jobEducation = extractEducation(jobDescription);
  
  // Calculate matches
  const keywordScore = calculateMatchScore(jobKeywords, resumeKeywords);
  const skillsScore = calculateMatchScore(jobSkills, resumeSkills);
  const educationScore = calculateMatchScore(jobEducation, resumeEducation);
  
  let experienceScore = 100;
  let experienceFeedback = "Experiência não especificada na vaga.";
  
  if (jobYears !== null) {
    if (resumeYears !== null) {
      if (resumeYears >= jobYears) {
        experienceScore = 100;
        experienceFeedback = `Você atende o requisito de ${jobYears}+ anos de experiência.`;
      } else {
        experienceScore = Math.round((resumeYears / jobYears) * 100);
        experienceFeedback = `A vaga pede ${jobYears}+ anos, você tem ${resumeYears}. Destaque projetos relevantes.`;
      }
    } else {
      experienceScore = 50;
      experienceFeedback = `A vaga pede ${jobYears}+ anos. Adicione anos de experiência no seu currículo.`;
    }
  }
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    keywordScore * 0.35 +
    skillsScore * 0.35 +
    experienceScore * 0.20 +
    educationScore * 0.10
  );
  
  // Generate suggestions
  const suggestions = generateSuggestions(
    resumeKeywords,
    jobKeywords,
    resumeSkills,
    jobSkills,
    resumeEducation,
    jobEducation
  );
  
  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (keywordScore >= 70) {
    strengths.push("Boa correspondência de palavras-chave com a vaga");
  } else {
    weaknesses.push("Poucas palavras-chave da vaga presentes no currículo");
  }
  
  if (skillsScore >= 70) {
    strengths.push("Competências técnicas bem alinhadas");
  } else {
    weaknesses.push("Faltam competências técnicas mencionadas na vaga");
  }
  
  if (experienceScore >= 80) {
    strengths.push("Experiência profissional adequada");
  } else if (experienceScore < 50) {
    weaknesses.push("Experiência abaixo do requisitado");
  }
  
  const matchedKeywords = jobKeywords.filter(jk =>
    resumeKeywords.some(rk => rk.includes(jk) || jk.includes(rk))
  );
  
  const missingKeywords = jobKeywords.filter(jk =>
    !resumeKeywords.some(rk => rk.includes(jk) || jk.includes(rk))
  );
  
  const matchedSkills = jobSkills.filter(js => resumeSkills.includes(js));
  const missingSkills = jobSkills.filter(js => !resumeSkills.includes(js));
  
  return {
    overallScore,
    keywordMatch: {
      score: keywordScore,
      matched: matchedKeywords,
      missing: missingKeywords.slice(0, 10),
      total: jobKeywords.length,
    },
    skillsMatch: {
      score: skillsScore,
      matched: matchedSkills,
      missing: missingSkills,
      recommendations: missingSkills.slice(0, 5).map(skill => 
        `Adicione "${skill}" se você tiver experiência relevante`
      ),
    },
    experienceMatch: {
      score: experienceScore,
      yearsRequired: jobYears,
      yearsFound: resumeYears,
      feedback: experienceFeedback,
    },
    educationMatch: {
      score: educationScore,
      required: jobEducation,
      found: resumeEducation,
      feedback: jobEducation.length > 0 
        ? `Vaga requer: ${jobEducation.join(", ")}`
        : "Formação não especificada na vaga",
    },
    suggestions,
    strengths,
    weaknesses,
  };
}
