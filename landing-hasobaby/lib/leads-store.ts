// lib/leads-store.ts
//
// Provider abstraction — re-export từ Supabase impl.
// API routes import từ file này, không biết underlying là gì.
// Đổi provider sau = sửa 1 dòng dưới đây.

export * from "./leads-supabase";
