import { invoke } from "@tauri-apps/api/core";
import "./Register.css";

export function Register({ setPage }) {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // 1. Verify passwords match before talking to the backend
        if (data.password !== data.confirmPassword) {
            console.error("Passwords do not match!");
            // You should probably set an error state here to show the user
            return;
        }

        try {
            const successMessage = await invoke("create_user", {
                // 2. These keys MUST exactly match the camelCase versions of your Rust parameters
                usernameInput: data.username,    // Sending the email to act as the username in the DB
                passwordInput: data.password, // Matching password_input in Rust
                roleInput: data.role          // Matching role_input in Rust
            });

            console.log(successMessage);
            // On success, redirect to login page
            setPage('signIn');

        } catch (err) {
            console.error("Backend error:", err);
        }
    };

    return <div className="register-page">
        {/* back button to go again his/her choice */}
        <button className="back-btn" onClick={() => setPage('signIn')}>Back</button>
        {/* form to register */}
        <form className="form" onSubmit={handleSubmit}>
            <div className="username-input">
                <label className="label">User Name</label><br /><br />
                {/* required => for the confirmation like no submit without it */}
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
        <p>Already have an account? <button className="btn" type="button" onClick={() => setPage('signIn')}>
            Login
        </button></p>
    </div>
}