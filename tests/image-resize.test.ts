import { describe, expect, it } from "vitest";
import { containSize } from "../src/lib/image-resize";

describe("containSize", () => {
  it("scales landscape images without changing their ratio", () => {
    expect(containSize(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
  });

  it("does not enlarge a small image", () => {
    expect(containSize(500, 800, 2000)).toEqual({ width: 500, height: 800 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => containSize(0, 800, 2000)).toThrow(RangeError);
  });
});
