import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}
