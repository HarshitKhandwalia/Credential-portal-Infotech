import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import EmployeePortal from "./EmployeePortal";
import Scanner from "./Scanner";
import AppleWalletPage from "./AppleWalletPage";
import GoogleWalletPage from "./GoogleWalletPage";
import Chapters from "./Chapters";
import ChapterDetail from "./ChapterDetail";
import SessionDetail from "./SessionDetail";
import { Toaster } from "./toast";
import PaymentReport from "./PaymentReport";
import Staff from "./Staff";
import LoginScreen from "./LoginScreen";
import { AuthProvider, useAuth } from "./auth";

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        Checking session...
      </div>
    );
  }
  if (!user) return <LoginScreen />;
  return children;
}

function RequireSuperadmin({ children }) {
  const { isSuperadmin } = useAuth();
  if (!isSuperadmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/wallet/apple/:token" element={<AppleWalletPage />} />
          <Route path="/wallet/google/:token" element={<GoogleWalletPage />} />
          <Route path="/" element={<RequireAuth><EmployeePortal /></RequireAuth>} />
          <Route path="/chapters" element={<RequireAuth><Chapters /></RequireAuth>} />
          <Route path="/chapters/:chapterId" element={<RequireAuth><ChapterDetail /></RequireAuth>} />
          <Route path="/sessions/:sessionId" element={<RequireAuth><SessionDetail /></RequireAuth>} />
          <Route path="/scanner" element={<RequireAuth><Scanner /></RequireAuth>} />
          <Route
            path="/chapters/:chapterId/payment-report"
            element={<RequireAuth><PaymentReport /></RequireAuth>}
          />
          <Route
            path="/staff"
            element={
              <RequireAuth>
                <RequireSuperadmin>
                  <Staff />
                </RequireSuperadmin>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
