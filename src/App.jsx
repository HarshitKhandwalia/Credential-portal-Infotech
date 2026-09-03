import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeePortal from "./EmployeePortal";
import Scanner from "./Scanner";
import AppleWalletPage from "./AppleWalletPage";
import GoogleWalletPage from "./GoogleWalletPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmployeePortal />} />
        <Route path="/scanner" element={<Scanner onBack={() => window.history.back()} />} />
        <Route path="/wallet/apple/:token" element={<AppleWalletPage />} />
        <Route path="/wallet/google/:token" element={<GoogleWalletPage />} />
      </Routes>
    </BrowserRouter>
  );
}