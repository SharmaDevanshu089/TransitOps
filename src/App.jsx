import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./src/loginPage/LoginPage";
import { Register } from "./src/loginPage/Register";
import { VehicleOpsLogin } from "./src/loginPage/VehicleOpsLogin";
import { TitleBar } from "./src/TitleBar/TitleBar";
import { AdminPage } from "./src/MainPages/AdminPage/AdminPage";
import { ClientPage } from "./src/MainPages/ClientPage/ClientPage";
import { SafetyOfficerPage } from "./src/MainPages/SafetyOfficerPage/SafetyOfficerPage";
import { VehicleOpsPage } from "./src/MainPages/VehicleOpsPage/VehicleOpsPage";
import { Footer } from "./src/Footer/Footer";

export default function App() {
  return (
    <MemoryRouter>
      <TitleBar />
      <Toaster position="top-right" />
      <div style={{ paddingTop: '48px', height: '100vh', boxSizing: 'border-box', overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicle-ops-login" element={<VehicleOpsLogin />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/client" element={<ClientPage />} />
          <Route path="/safety" element={<SafetyOfficerPage />} />
          <Route path="/vehicle-ops" element={<VehicleOpsPage />} />
        </Routes>
        <Footer />
      </div>
    </MemoryRouter>
  );
}