import { useState } from "react";
import { SignIn } from "./SignUp";
import { Register } from "./Register";
import "./LoginPage.css";

export function LoginPage(){
    const [signUp,setSignUp] = useState("none")

    return(<div className="login-page">
        {signUp === "none" && (
            <div className="button-container">
                <button className="btn login-btn" onClick={() => setSignUp("signIn")}>Sign In</button>
                <button className="btn register-btn" onClick={() => setSignUp('register')}>Register</button>
            </div>
        )}
        {signUp === "signIn" && <SignIn setPage={setSignUp} />}
        {signUp === "register" && <Register setPage={setSignUp} />}
    </div>)
}
