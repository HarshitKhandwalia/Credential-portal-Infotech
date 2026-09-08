import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeePortal from "./EmployeePortal";
import Scanner from "./Scanner";
import AppleWalletPage from "./AppleWalletPage";
import GoogleWalletPage from "./GoogleWalletPage";
import Chapters from "./Chapters";
import ChapterDetail from "./ChapterDetail";
import SessionDetail from "./SessionDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmployeePortal />} />
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/chapters/:chapterId" element={<ChapterDetail />} />
        <Route path="/sessions/:sessionId" element={<SessionDetail />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/wallet/apple/:token" element={<AppleWalletPage />} />
        <Route path="/wallet/google/:token" element={<GoogleWalletPage />} />
      </Routes>
    </BrowserRouter>
  );
}
