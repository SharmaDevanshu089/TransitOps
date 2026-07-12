import { useState } from "react";
import { SignIn } from "./SignUp";
import { Register } from "./Register";
import "./LoginPage.css";
import { VehicleOpsLogin } from "./VehicleOpsLogin";
import { ClientPage } from "../MainPages/ClientPage/ClientPage";
import { AdminPage } from "../MainPages/AdminPage/AdminPage";
import { SafetyOfficerPage } from "../MainPages/SafetyOfficerPage/SafetyOfficerPage";
import { VehicleOpsPage } from "../MainPages/VehicleOpsPage/VehicleOpsPage";

export function LoginPage() {
    const [signUp, setSignUp] = useState("signIn")

    return (<div className="login-page">
        {signUp === "signIn" && (
            <>
                <h1 className="app-title">TransitOps</h1>
                <SignIn setPage={setSignUp} />
            </>
        )}
        {signUp === "register" && <Register setPage={setSignUp} />}
        {/* ONLY CHANGE I MADE */}
        {signUp === "VehicleOpsLogin" && <VehicleOpsLogin setPage={setSignUp} />}
        {/* THESE ARE THE PAGES WHERE WE WILL REDIRECT USER BASED ON ROLE */}
        {signUp === "Client" && <ClientPage />}
        {signUp === "Admin" && <AdminPage />}
        {signUp === "Safety Officer" && <SafetyOfficerPage />}
        {signUp === "VehicleOps" && <VehicleOpsPage />}
    </div>)
}
