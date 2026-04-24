/**
 * Olcan Liquid Glass PDF Tokens — EC-2
 *
 * Single source of truth for brand colors, fonts, and spacing used in
 * all client-side PDF exports. Mirrors the design tokens defined in
 * SPEC_Dossier_System_v2_5.md §4.3.
 *
 * DO NOT change these values without also updating the server-side
 * WeasyPrint templates (apps/api-core-v2.5/app/templates/dossier/styles.css).
 */

export const PDF_TOKENS = {
  // ─── Colors ─────────────────────────────────────────────────────────────────
  colors: {
    /** Deep Navy — headings, cover, footer backgrounds */
    deepNavy: "#001338",
    /** Indigo — accents, links, section dividers */
    indigo: "#4F46E5",
    /** Paper — page background */
    paper: "#F8F9FC",
    /** Body text */
    text: "#1A1A2E",
    /** Muted text / metadata */
    muted: "#6B7280",
    /** Divider lines */
    divider: "#E5E7EB",
    /** White */
    white: "#FFFFFF",
  },

  // ─── Typography ──────────────────────────────────────────────────────────────
  fonts: {
    heading: "Roboto",   // pdfmake built-in (Montserrat fallback)
    body: "Roboto",      // pdfmake built-in (Inter fallback)
  },

  /** Font sizes in pt */
  fontSize: {
    cover: 28,
    coverSub: 9,
    coverTitle: 20,
    coverMeta: 11,
    sectionLabel: 7,
    sectionTitle: 16,
    toc: 10,
    h1: 14,
    h2: 12,
    h3: 11,
    body: 10,
    caption: 8,
    footer: 8,
  },

  // ─── Spacing (in pt, 1 pt ≈ 0.35 mm) ────────────────────────────────────────
  margin: {
    page: [40, 50, 40, 50] as [number, number, number, number],
    coverPad: 20,
    sectionGap: 20,
    elementGap: 8,
    captionGap: 4,
  },

  // ─── Page ────────────────────────────────────────────────────────────────────
  pageSize: "A4" as const,
} as const;

export type PdfColors = typeof PDF_TOKENS.colors;
