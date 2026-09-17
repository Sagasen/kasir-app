import { createClient } from "@supabase/supabase-js";

// ============================================================
// KONFIGURASI SUPABASE
// Ganti dua nilai di bawah dengan milikmu.
// Ambil dari: Supabase Dashboard > Project Settings > API
// ============================================================
const SUPABASE_URL = "https://oclflgfrqxhtegbahmkd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bvNVHB-NpfTRxNF2sGqKNw_ioyP6Acm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
