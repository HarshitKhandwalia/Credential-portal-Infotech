import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeePortal from "./EmployeePortal";
import AppleWalletPage from "./AppleWalletPage";
import GoogleWalletPage from "./GoogleWalletPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmployeePortal />} />
        <Route path="/wallet/apple/:token" element={<AppleWalletPage />} />
        <Route path="/wallet/google/:token" element={<GoogleWalletPage />} />
      </Routes>
    </BrowserRouter>
  );
}
