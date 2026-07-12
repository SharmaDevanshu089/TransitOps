import { useState } from "react";
import { SignIn } from "./SignUp";
import { Register } from "./Register";
import "./LoginPage.css";
import { VehicleOpsLogin } from "./VehicleOpsLogin";

export function LoginPage(){
    const [signUp,setSignUp] = useState("signIn")

    return(<div className="login-page">
        {signUp === "signIn" && (
            <>
                <h1 className="app-title">TransitOps</h1>
                <SignIn setPage={setSignUp} />
            </>
        )}
        {signUp === "register" && <Register setPage={setSignUp} />}
        {/* ONLY CHANGE I MADE */}
        {signUp === "VehicleOpsLogin" && <VehicleOpsLogin setPage={setSignUp}/>}
        {/* THESE ARE THE PAGES WHERE WE WILL RE DIRECT USER BASED ON ROLE*/}
        {signUp === "" && <></>}
    </div>)
}
