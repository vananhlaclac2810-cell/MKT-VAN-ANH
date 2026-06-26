// Sinh & kiểm tra mã OTP (lưu trong session ở dạng băm, có hạn dùng)
import { randomInt, createHash, timingSafeEqual } from 'node:crypto';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút
const MAX_ATTEMPTS = 5;

function hashCode(code) {
  return createHash('sha256').update(String(code)).digest('hex');
}

export function createOtp() {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  return {
    code, // bản rõ chỉ dùng để gửi mail, không lưu
    record: { hash: hashCode(code), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 },
  };
}

export function verifyOtp(record, input) {
  if (!record) return { ok: false, reason: 'no_otp' };
  if (Date.now() > record.expiresAt) return { ok: false, reason: 'expired' };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' };
  record.attempts += 1;
  const a = Buffer.from(hashCode(input), 'hex');
  const b = Buffer.from(record.hash, 'hex');
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, reason: ok ? null : 'mismatch' };
}

export { OTP_TTL_MS };
