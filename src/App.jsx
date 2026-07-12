import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./src/loginPage/LoginPage";
import { Register } from "./src/loginPage/Register";
import { VehicleOpsLogin } from "./src/loginPage/VehicleOpsLogin";
import { SignUp } from "./src/loginPage/SignUp";
import { TitleBar } from "./src/TitleBar/TitleBar";
import { AdminPage } from "./src/MainPages/AdminPage/AdminPage";
import { ClientPage } from "./src/MainPages/ClientPage/ClientPage";
import { SafetyOfficerPage } from "./src/MainPages/SafetyOfficerPage/SafetyOfficerPage";
import { VehicleOpsPage } from "./src/MainPages/VehicleOpsPage/VehicleOpsPage";

export default function App() {
  return (
    <MemoryRouter>
      <TitleBar />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/vehicle-ops-login" element={<VehicleOpsLogin />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/safety" element={<SafetyOfficerPage />} />
        <Route path="/vehicle-ops" element={<VehicleOpsPage />} />
      </Routes>
    </MemoryRouter>
  );
}