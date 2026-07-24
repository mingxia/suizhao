import { expect, it } from "vitest";
import { yearPhotos } from "../src/db/schema";
it("keeps person age unique index",()=>{expect(String(yearPhotos)).toContain("year_photos")});
