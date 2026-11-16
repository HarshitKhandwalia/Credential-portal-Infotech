import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EmployeePortal from "./EmployeePortal";
import AppleWalletPage from "./AppleWalletPage";
import GoogleWalletPage from "./GoogleWalletPage";
import { Toaster } from "./toast";
import ConfigurationPage from "./ConfigurationPage";
import ContactProfilePage from "./ContactProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<EmployeePortal />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
        <Route path="/profile/:token" element={<ContactProfilePage />} />
        <Route path="/wallet/apple/:token" element={<AppleWalletPage />} />
        <Route path="/wallet/google/:token" element={<GoogleWalletPage />} />
        {/* Chapters / Scanner / Sessions temporarily blocked */}
        <Route path="/chapters/*" element={<Navigate to="/" replace />} />
        <Route path="/scanner" element={<Navigate to="/" replace />} />
        <Route path="/sessions/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
