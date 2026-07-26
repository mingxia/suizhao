import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/password";

describe("password hashing", () => {
  it("hashes and verifies a password without storing plaintext", async () => {
    const password = "correct horse battery staple";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^pbkdf2-sha256:100000:[0-9a-f]{32}:[0-9a-f]{64}$/);
    expect(hash).not.toContain(password);
    await expect(verifyPassword({ hash, password })).resolves.toBe(true);
    await expect(verifyPassword({ hash, password: "incorrect" })).resolves.toBe(false);
  });

  it("rejects malformed hashes", async () => {
    await expect(verifyPassword({ hash: "not-a-password-hash", password: "anything" })).resolves.toBe(false);
  });
});
