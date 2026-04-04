import { describe, expect, it } from "vitest";
import { normalizeForComparison } from "./text-normalize";

describe("normalizeForComparison", () => {
  it("removes accents, trims and lowercases", () => {
    expect(normalizeForComparison("  Linguística  ")).toBe("linguistica");
  });

  it("normalizes mixed diacritics consistently", () => {
    expect(normalizeForComparison("Documentação")).toBe("documentacao");
    expect(normalizeForComparison("FINANCEIRA")).toBe("financeira");
  });
});

