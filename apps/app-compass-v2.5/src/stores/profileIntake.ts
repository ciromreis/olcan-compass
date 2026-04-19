/**
 * Profile Intake Store
 *
 * Stores structured career/academic profile data entered by the user.
 * This data feeds directly into document section auto-fill and narrative
 * generation across the Forge — the career identity layer that Olcan
 * uses to personalise every document produced.
 *
 * Kept separate from the billing/plan profile store (profile.ts).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Language proficiency levels ─────────────────────────────────────────────
export type LanguageLevel = "native" | "fluent" | "advanced" | "intermediate" | "basic";

export interface LanguageEntry {
  language: string;
  level: LanguageLevel;
  certification?: string; // e.g. "IELTS 7.5", "TOEFL 105", "DELF B2"
}

// ─── Work experience entry ────────────────────────────────────────────────────
export interface WorkExperience {
  id: string;
  role: string;
  organization: string;
  location?: string;
  startDate: string; // "2021-03"
  endDate?: string;  // "2023-08" or undefined = current
  isCurrent: boolean;
  achievements: string[]; // bullet points, ideally quantified
  sector?: string;
}

// ─── Education entry ──────────────────────────────────────────────────────────
export interface EducationEntry {
  id: string;
  degree: string;         // "Bachelor's", "Master's", "PhD"
  field: string;          // "Computer Science"
  institution: string;
  country: string;
  graduationYear?: string;
  gpa?: string;
  thesis?: string;
  honours?: string;
  isCurrent: boolean;
}

// ─── Complete intake profile ──────────────────────────────────────────────────
export interface ProfileIntake {
  // Identity
  fullName: string;
  email: string;
  phone?: string;
  nationality: string;
  currentCity: string;
  currentCountry: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;

  // Professional summary
  currentRole: string;
  currentOrganization: string;
  yearsOfExperience: string; // "5", "3-5", "10+"
  professionalSummary: string; // 2-4 sentence overview for CV/profiles

  // Academic
  education: EducationEntry[];

  // Experience
  workExperience: WorkExperience[];

  // Skills
  technicalSkills: string[];
  softSkills: string[];
  languages: LanguageEntry[];

  // Narrative / motivation fields
  careerGoal: string;        // Long-term career aspiration
  whyInternational: string;  // Why studying/working abroad
  uniqueStrengths: string[];  // 3-5 differentiators
  keyAchievements: string[];  // 3-7 headline accomplishments
  researchInterests?: string; // For academic applications
  communityImpact?: string;  // Leadership/volunteer work

  // Targeting
  targetField: string;       // "Data Science", "Public Policy"
  targetCountries: string[]; // ["UK", "Germany"]
  targetRoles: string[];     // ["Research Associate", "Product Manager"]

  // Meta
  completionScore: number;   // 0-100, computed
  lastUpdated: string;
}

// ─── Store shape ──────────────────────────────────────────────────────────────
interface ProfileIntakeState {
  intake: ProfileIntake;
  isComplete: boolean;
  updateIntake: (partial: Partial<ProfileIntake>) => void;
  addWorkExperience: (entry: Omit<WorkExperience, "id">) => void;
  updateWorkExperience: (id: string, partial: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: (entry: Omit<EducationEntry, "id">) => void;
  updateEducation: (id: string, partial: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  computeCompletion: () => number;
  reset: () => void;
}

// ─── Completion calculation ───────────────────────────────────────────────────
function computeProfileCompletion(p: ProfileIntake): number {
  const checks = [
    !!p.fullName,
    !!p.email,
    !!p.nationality,
    !!p.currentCountry,
    !!p.currentRole,
    !!p.currentOrganization,
    !!p.yearsOfExperience,
    !!p.professionalSummary,
    p.education.length > 0,
    p.workExperience.length > 0,
    p.technicalSkills.length > 0,
    p.languages.length > 0,
    !!p.careerGoal,
    !!p.whyInternational,
    p.uniqueStrengths.length > 0,
    p.keyAchievements.length > 0,
    p.targetField !== "",
    p.targetCountries.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─── Default state ────────────────────────────────────────────────────────────
const DEFAULT_INTAKE: ProfileIntake = {
  fullName: "",
  email: "",
  phone: "",
  nationality: "",
  currentCity: "",
  currentCountry: "",
  linkedin: "",
  portfolio: "",
  github: "",
  currentRole: "",
  currentOrganization: "",
  yearsOfExperience: "",
  professionalSummary: "",
  education: [],
  workExperience: [],
  technicalSkills: [],
  softSkills: [],
  languages: [],
  careerGoal: "",
  whyInternational: "",
  uniqueStrengths: [],
  keyAchievements: [],
  researchInterests: "",
  communityImpact: "",
  targetField: "",
  targetCountries: [],
  targetRoles: [],
  completionScore: 0,
  lastUpdated: new Date().toISOString(),
};

function genId(): string {
  return `pi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useProfileIntakeStore = create<ProfileIntakeState>()(
  persist(
    (set, get) => ({
      intake: DEFAULT_INTAKE,
      isComplete: false,

      updateIntake: (partial) =>
        set((s) => {
          const updated = { ...s.intake, ...partial, lastUpdated: new Date().toISOString() };
          const score = computeProfileCompletion(updated);
          updated.completionScore = score;
          return { intake: updated, isComplete: score >= 70 };
        }),

      addWorkExperience: (entry) =>
        set((s) => {
          const updated = {
            ...s.intake,
            workExperience: [{ ...entry, id: genId() }, ...s.intake.workExperience],
            lastUpdated: new Date().toISOString(),
          };
          return { intake: { ...updated, completionScore: computeProfileCompletion(updated) } };
        }),

      updateWorkExperience: (id, partial) =>
        set((s) => {
          const updated = {
            ...s.intake,
            workExperience: s.intake.workExperience.map((w) =>
              w.id === id ? { ...w, ...partial } : w
            ),
            lastUpdated: new Date().toISOString(),
          };
          return { intake: { ...updated, completionScore: computeProfileCompletion(updated) } };
        }),

      removeWorkExperience: (id) =>
        set((s) => {
          const updated = {
            ...s.intake,
            workExperience: s.intake.workExperience.filter((w) => w.id !== id),
            lastUpdated: new Date().toISOString(),
          };
          return { intake: { ...updated, completionScore: computeProfileCompletion(updated) } };
        }),

      addEducation: (entry) =>
        set((s) => {
          const updated = {
            ...s.intake,
            education: [{ ...entry, id: genId() }, ...s.intake.education],
            lastUpdated: new Date().toISOString(),
          };
          return { intake: { ...updated, completionScore: computeProfileCompletion(updated) } };
        }),

      updateEducation: (id, partial) =>
        set((s) => {
          const updated = {
            ...s.intake,
            education: s.intake.education.map((e) =>
              e.id === id ? { ...e, ...partial } : e
            ),
            lastUpdated: new Date().toISOString(),
          };
          return { intake: { ...updated, completionScore: computeProfileCompletion(updated) } };
        }),

      removeEducation: (id) =>
        set((s) => {
          const updated = {
            ...s.intake,
            education: s.intake.education.filter((e) => e.id !== id),
            lastUpdated: new Date().toISOString(),
          };
          return { intake: { ...updated, completionScore: computeProfileCompletion(updated) } };
        }),

      computeCompletion: () => {
        const score = computeProfileCompletion(get().intake);
        set((s) => ({ intake: { ...s.intake, completionScore: score } }));
        return score;
      },

      reset: () => set({ intake: DEFAULT_INTAKE, isComplete: false }),
    }),
    { name: "olcan-profile-intake-v1" }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Returns the most recent (current) work experience. */
export function selectCurrentRole(intake: ProfileIntake): string {
  const current = intake.workExperience.find((w) => w.isCurrent);
  if (current) return `${current.role} at ${current.organization}`;
  return intake.currentRole || "";
}

/** Returns a short education summary for CV headers. */
export function selectHighestDegree(intake: ProfileIntake): EducationEntry | null {
  const order = ["PhD", "Master's", "MBA", "Bachelor's", "Associate"];
  for (const d of order) {
    const found = intake.education.find((e) => e.degree.includes(d));
    if (found) return found;
  }
  return intake.education[0] ?? null;
}

/** Pre-fills text for a given document section ID from profile data. */
export function fillSectionFromProfile(sectionId: string, intake: ProfileIntake): string {
  const highestEd = selectHighestDegree(intake);
  const currentJob = intake.workExperience.find((w) => w.isCurrent);

  switch (sectionId) {
    case "header":
      return [
        intake.fullName,
        intake.currentCity && intake.currentCountry
          ? `${intake.currentCity}, ${intake.currentCountry}`
          : intake.currentCountry,
        [intake.email, intake.phone].filter(Boolean).join(" | "),
        [intake.linkedin, intake.portfolio, intake.github].filter(Boolean).join(" | "),
      ]
        .filter(Boolean)
        .join("\n");

    case "summary":
      return intake.professionalSummary;

    case "experience":
      if (!currentJob) return "";
      return [
        `${currentJob.role} | ${currentJob.organization}${currentJob.location ? ` | ${currentJob.location}` : ""}`,
        `${currentJob.startDate} — ${currentJob.isCurrent ? "Presente" : currentJob.endDate || ""}`,
        ...currentJob.achievements.map((a) => `• ${a}`),
      ].join("\n");

    case "education":
      if (!highestEd) return "";
      return `${highestEd.degree} em ${highestEd.field} | ${highestEd.institution}, ${highestEd.country}${highestEd.graduationYear ? ` | ${highestEd.graduationYear}` : ""}${highestEd.gpa ? ` | GPA: ${highestEd.gpa}` : ""}`;

    case "skills":
      return [
        intake.technicalSkills.length ? `Técnicas: ${intake.technicalSkills.join(", ")}` : "",
        intake.softSkills.length ? `Comportamentais: ${intake.softSkills.join(", ")}` : "",
        intake.languages.length
          ? `Idiomas: ${intake.languages.map((l) => `${l.language} (${l.level}${l.certification ? ` — ${l.certification}` : ""})`).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    case "opener":
    case "intro":
      return intake.fullName
        ? `Meu nome é ${intake.fullName}${intake.currentRole ? `, atualmente ${intake.currentRole}${intake.currentOrganization ? ` na ${intake.currentOrganization}` : ""}` : ""}.`
        : "";

    case "motivation":
    case "background":
      return [
        currentJob
          ? `Com ${intake.yearsOfExperience ? intake.yearsOfExperience + " anos de experiência em " : "experiência em "}${currentJob.sector || intake.targetField || "minha área"}, atuando como ${currentJob.role} na ${currentJob.organization}.`
          : "",
        highestEd
          ? `Formado em ${highestEd.field} pela ${highestEd.institution}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

    case "goals":
    case "future_goals":
      return intake.careerGoal;

    case "why_international":
    case "why_abroad":
    case "why_uk":
    case "why_country":
      return intake.whyInternational;

    case "research":
    case "research_interests":
      return intake.researchInterests || "";

    case "leadership":
    case "community":
      return intake.communityImpact || "";

    case "achievements":
      return intake.keyAchievements.map((a) => `• ${a}`).join("\n");

    case "strengths":
      return intake.uniqueStrengths.map((s) => `• ${s}`).join("\n");

    default:
      return "";
  }
}
