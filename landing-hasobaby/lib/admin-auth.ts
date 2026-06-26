// lib/admin-auth.ts
//
// Shared password check cho /api/admin/* routes.
// Timing-safe compare để chống side-channel attack.
//
// Hỗ trợ MULTI-PASSWORD: accept cả ADMIN_PASSWORD (owner) + ADMIN_PASSWORD_AGENCY
// (cho bên agency chạy ads xem data conversion). Revoke agency = xóa env var.

import { timingSafeEqual } from "crypto";

export function checkAdminPass(headerPass: string | null): boolean {
  if (!headerPass) return false;

  const candidates = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_PASSWORD_AGENCY,
  ].filter((p): p is string => typeof p === "string" && p.length > 0);

  const b = Buffer.from(headerPass, "utf8");
  for (const expected of candidates) {
    const a = Buffer.from(expected, "utf8");
    if (a.length !== b.length) continue;
    if (timingSafeEqual(a, b)) return true;
  }
  return false;
}
