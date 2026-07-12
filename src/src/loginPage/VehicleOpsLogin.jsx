import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./VehicleOpsLogin.css";

export function VehicleOpsLogin() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        toast.success("Driver details registered successfully!");
        navigate("/");
    };

    return (
        <div className="vehicleops-login-page">
            <button className="back-btn" onClick={() => navigate('/register')}>Back</button>
            <form className="form" onSubmit={handleSubmit}>
                <h2 className="form-title">Driver Details</h2>
                
                <div className="form-group">
                    <label className="label">Full Name</label>
                    <input className="input" type="text" name="name" required />
                </div>

                <div className="form-group">
                    <label className="label">License Number</label>
                    <input className="input" type="text" name="license_number" required />
                </div>

                <div className="form-group">
                    <label className="label">License Category</label>
                    <input className="input" type="text" name="license_category" placeholder="e.g. Standard, Commercial" required />
                </div>

                <div className="form-group">
                    <label className="label">License Expiry Date</label>
                    <input className="input" type="date" name="license_expiry" required />
                </div>

                <div className="form-group-last">
                    <label className="label">Contact Number</label>
                    <input className="input" type="text" name="contact_number" required />
                </div>

                <button className="btn" type="submit">Complete Registration</button>
            </form>
        </div>
    );
}
