import { invoke } from "@tauri-apps/api/core";
import "./VehicleOpsLogin.css";

export function VehicleOpsLogin({ username, setPage }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        //After this we have todo 1. transfer data from here to backend to update in db 
        setPage("VehicleOps")
    };

    return (
        <div className="vehicleops-login-page">
            <button className="back-btn" onClick={() => setPage('register')}>Back</button>
            <form className="form" onSubmit={handleSubmit}>
                <h2>Driver Details</h2>
                
                <div>
                    <label className="label">License Number</label>
                    <input className="input" type="text" name="license" required />
                </div>
                {/* You can add other i don't know what to add */}

                <button className="btn" type="submit">Complete Registration</button>
            </form>
        </div>
    );
}
