import * as crypto from "crypto";
import { promisify } from "util";

const pbkdf2 = promisify(crypto.pbkdf2);

class PasswordUtils {
  private readonly ITERATIONS = 210000;
  private readonly KEY_LENGTH = 64;
  private readonly DIGEST = "sha512";

  async hash(password: string): Promise<{ hash: string; salt: string }> {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await pbkdf2(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.DIGEST,
    );
    return { hash: derivedKey.toString("hex"), salt };
  }

  async compare(
    password: string,
    hash: string,
    salt: string,
  ): Promise<boolean> {
    const derivedKey = await pbkdf2(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.DIGEST,
    );
    const stored = Buffer.from(hash, "hex");
    if (stored.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(derivedKey, stored);
  }
}

export default PasswordUtils;
