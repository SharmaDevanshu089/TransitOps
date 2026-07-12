import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Register.css";

export function Register() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            const successMessage = await invoke("create_user", {
                usernameInput: data.username,
                passwordInput: data.password,
                roleInput: data.role
            });

            toast.success(successMessage);
            
            if(data.role === "VehicleOps"){
                navigate("/vehicle-ops-login");
            }
            else{
                navigate("/");
            }
        } catch (err) {
            console.error("Backend error:", err);
            toast.error(err.toString());
        }
    };

    return <div className="register-page">
        <button className="back-btn" onClick={() => navigate('/')}>Back</button>
        <h2 className="form-title">&nbsp;&nbsp;Create Account</h2>
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
            <br />
            <div>
                <label className="label">Confirm Password</label><br /><br />
                <input className="input" type="password" name="confirmPassword" required />
            </div>
            <br />
            <select className="select" name="role" required>
                <option value="Client">Fleet Manager</option>
                <option value="VehicleOps">Driver</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Admin">Financial Analyst</option>
            </select>
            <br /><br />
            <button className="btn" type="submit">Register</button>
        </form>
        <br />
        <br />
        <p>Already have an account? <button className="btn" type="button" onClick={() => navigate('/')}>
            Login
        </button></p>
    </div>
}