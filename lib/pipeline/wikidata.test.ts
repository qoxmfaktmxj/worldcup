import { describe, it, expect } from "vitest";
import { parseTime, parseHeight, pickLabels } from "./wikidata";

describe("parseTime", () => {
  it("formats a Wikidata time value to YYYY.MM.DD", () => {
    expect(parseTime("+1981-02-25T00:00:00Z")).toBe("1981.02.25");
  });
  it("returns undefined for empty", () => {
    expect(parseTime(undefined)).toBeUndefined();
  });
});

describe("parseHeight", () => {
  it("reads metres and returns cm", () => {
    expect(parseHeight({ amount: "+1.78", unit: "http://www.wikidata.org/entity/Q11573" })).toBe(178);
  });
  it("reads centimetres directly", () => {
    expect(parseHeight({ amount: "+178", unit: "http://www.wikidata.org/entity/Q174728" })).toBe(178);
  });
});

describe("pickLabels", () => {
  it("prefers ko then en", () => {
    const labels = { ko: { value: "리오넬 메시" }, en: { value: "Lionel Messi" } };
    expect(pickLabels(labels)).toEqual({ ko: "리오넬 메시", en: "Lionel Messi" });
  });
});
