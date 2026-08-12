import { describe, expect, it } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { yearPhotos } from "../src/db/schema";
import { yearDetailsSchema } from "../src/lib/validation";

describe("year details", () => {
  it("stores both optional fields on an annual photo", () => {
    const columns = getTableColumns(yearPhotos);
    expect(columns.locationName.notNull).toBe(false);
    expect(columns.yearHighlight.notNull).toBe(false);
  });

  it("accepts empty details and trims values", () => {
    expect(yearDetailsSchema.parse({ locationName: "", yearHighlight: "" })).toEqual({ locationName: "", yearHighlight: "" });
    expect(yearDetailsSchema.parse({ locationName: "  杭州 ", yearHighlight: " 搬家 " })).toEqual({ locationName: "杭州", yearHighlight: "搬家" });
  });

  it("keeps lightweight text within its limits", () => {
    expect(yearDetailsSchema.safeParse({ locationName: "城".repeat(51), yearHighlight: "" }).success).toBe(false);
    expect(yearDetailsSchema.safeParse({ locationName: "北京", yearHighlight: "事".repeat(101) }).success).toBe(false);
  });
});
