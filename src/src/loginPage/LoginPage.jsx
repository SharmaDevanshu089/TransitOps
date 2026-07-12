import { useState } from "react";
import { SignUp } from "./SignUp";
import { Register } from "./Register";

export function LoginPage(){
    const [signUp,setSignUp] = useState("none")

    return(<div>
        {signUp === "none" && (
            <div>
                <button onClick={() => setSignUp("signUp")}>Sign Up</button>
                <button onClick={() => setSignUp('register')}>Register</button>
            </div>
        )}
        {signUp === "signUp" && <SignUp setPage={setSignUp} />}
        {signUp === "register" && <Register setPage={setSignUp} />}
    </div>)
}
