import "server-only";

// All secrets are read on the server only. Missing values switch the paid flow off
// with a clear message instead of crashing, so the builder still works locally.
export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  // Business UPI ID that receives payments (PhonePe/Paytm/BharatPe for Business).
  upiVpa: process.env.UPI_VPA ?? "",
  upiPayeeName: process.env.UPI_PAYEE_NAME ?? "HeartLink",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
};

export const backendReady = () => Boolean(env.supabaseUrl && env.supabaseServiceKey && env.upiVpa);

export const MEDIA_BUCKET = "media";
