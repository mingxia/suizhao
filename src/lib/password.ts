const ITERATIONS = 210_000;
const KEY_LENGTH = 32;
const ALGORITHM = "pbkdf2-sha256";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return null;
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(bits);
}

/** Uses Web Crypto so password hashing works in the Cloudflare Workers runtime. */
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await derive(password, salt, ITERATIONS);
  return `${ALGORITHM}:${ITERATIONS}:${toHex(salt)}:${toHex(key)}`;
}

export async function verifyPassword({ hash, password }: { hash: string; password: string }) {
  const [algorithm, rawIterations, rawSalt, rawKey] = hash.split(":");
  const iterations = Number(rawIterations);
  const salt = fromHex(rawSalt ?? "");
  const expected = fromHex(rawKey ?? "");

  if (algorithm !== ALGORITHM || !Number.isSafeInteger(iterations) || iterations <= 0 || !salt || !expected || expected.length !== KEY_LENGTH) {
    return false;
  }

  const actual = await derive(password, salt, iterations);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected[index] ^ actual[index];
  return difference === 0;
}
