import { importSPKI, jwtVerify } from "jose";
import { JwtPayload } from "jwt-decode";

const basurl = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
const CACHE_DURATION = 43200 * 1000; // 12 hours

interface cust extends JwtPayload {
  role: string;
  token_type: string;
  username: string;
}

interface KeyCache {
  key: CryptoKey;
  expiry: number;
}

let publicKeyCache: KeyCache | null = null;

export default async function verify(t: string, type: string) {
  try {
    if (!publicKeyCache || Date.now() > publicKeyCache.expiry) {
      const res = await fetch(`${basurl}accounts/public-key/`);
      if (!res.ok) throw new Error("Failed to fetch public key");

      const { public_key: publickeyraw } = await res.json();
      const publickey = await importSPKI(publickeyraw, "RS256");

      publicKeyCache = {
        key: publickey,
        expiry: Date.now() + CACHE_DURATION,
      };
    }

    const { payload } = await jwtVerify<cust>(t, publicKeyCache.key, {
      algorithms: ["RS256"],
    });

    if (payload.token_type !== type) throw new TypeError("Invalid token type");

    return { code: 200, payload };
  } catch (e) {
    console.log(`Token validation error: ${e}`);
    return {
      code: e instanceof TypeError ? 401 : 500,
      error: "Token verification failed",
    };
  }
}
