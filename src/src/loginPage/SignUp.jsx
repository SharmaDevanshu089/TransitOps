import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./SignUp.css";

export function SignIn() {
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const role = await invoke("authenticate_user", {
                username: data.username,
                password: data.password,
            });
            
            if (role) {
                toast.success(`Logged in as: ${role}`);
                setError(false);
                
                if (role === "Client") navigate("/client");
                else if (role === "Admin") navigate("/admin");
                else if (role === "Safety Officer") navigate("/safety");
                else if (role === "VehicleOps") navigate("/vehicle-ops");
            } else {
                toast.error("Invalid username or password.");
                setError(true);
            }
        } catch (err) {
            console.error("error:", err);
            toast.error(err.toString());
            setError(true);
        }
    };

    return (
        <div className="signin-page">
            <h2 className="form-title">&nbsp;&nbsp;Operator Sign In</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="username-input">
                    <label className="label">User Name</label><br /><br />
                    <input className="input" type="text" name="username" required />
                </div>
                <br />
                <div className="password-input">
                    <label className="label">Password</label><br /><br />
                    <input className="input" type="password" name="password" required />
                </div>
                {error && <span className="error-message">Wrong Username or Password</span>}
                <br />
                <button className="btn" type="submit">Login</button>
            </form>
            <br />
            <br />
            <p>Don't have an account? &nbsp;&nbsp;&nbsp;
                <button className="btn link-btn" type="button" onClick={() => navigate('/register')}>Register</button>
            </p>
        </div>
    );
}