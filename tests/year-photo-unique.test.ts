import { expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { yearPhotos } from "../src/db/schema";
it("keeps age and first-seen photos unique",()=>{const indexes=getTableConfig(yearPhotos).indexes.map((index)=>index.config.name);expect(indexes).toContain("year_photos_person_age_unique");expect(indexes).toContain("year_photos_person_stage_year_unique")});
