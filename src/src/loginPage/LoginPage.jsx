import { SignIn } from "./SignUp";
import "./LoginPage.css";

export function LoginPage() {
    return (
        <div className="login-page">
            <h1 className="app-title">&nbsp;&nbsp;TransitOps</h1>
            <SignIn />
        </div>
    );
}
