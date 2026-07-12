import { useState } from "react";
import { SignIn } from "./SignUp";
import { Register } from "./Register";
import "./LoginPage.css";

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
    </div>)
}
