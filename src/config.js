// Production (Railway):
// export const API_ROOT = "https://portal-production-fc81.up.railway.app/api";
export const API_ROOT = "http://127.0.0.1:8000/api";
export const API_BASE_URL = `${API_ROOT}/credentials/`;
export const WALLET_API_BASE_URL = `${API_ROOT.replace(/\/api$/, "")}/api/wallet`;
