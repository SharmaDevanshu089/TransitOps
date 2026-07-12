import { useState } from "react";
import { SignIn } from "./SignUp";
import { Register } from "./Register";

export function LoginPage(){
    const [signUp,setSignUp] = useState("none")

    return(<div>
        {signUp === "none" && (
            <div>
                <button onClick={() => setSignUp("signIn")}>Sign In</button>
                <button onClick={() => setSignUp('register')}>Register</button>
            </div>
        )}
        {signUp === "signIn" && <SignIn setPage={setSignUp} />}
        {signUp === "register" && <Register setPage={setSignUp} />}
    </div>)
}
