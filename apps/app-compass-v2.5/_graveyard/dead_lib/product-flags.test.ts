import { describe, expect, it } from "vitest";
import { parsePublicBooleanEnv } from "./product-flags";

describe("parsePublicBooleanEnv", () => {
  it("returns default when undefined or empty", () => {
    expect(parsePublicBooleanEnv(undefined, true)).toBe(true);
    expect(parsePublicBooleanEnv(undefined, false)).toBe(false);
    expect(parsePublicBooleanEnv("", true)).toBe(true);
  });

  it("treats 1 and true as enabled", () => {
    expect(parsePublicBooleanEnv("1", false)).toBe(true);
    expect(parsePublicBooleanEnv("true", false)).toBe(true);
    expect(parsePublicBooleanEnv("TRUE", false)).toBe(true);
  });

  it("treats other strings as disabled", () => {
    expect(parsePublicBooleanEnv("0", true)).toBe(false);
    expect(parsePublicBooleanEnv("no", true)).toBe(false);
  });
});
