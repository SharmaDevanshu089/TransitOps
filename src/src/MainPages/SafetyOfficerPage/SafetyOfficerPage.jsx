import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import "./SafetyOfficerPage.css";

export function SafetyOfficerPage() {
    const [safetyData, setSafetyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleData = async () => {
        try {
            // Using get_all_drivers to get full license details
            const data = await invoke("get_all_drivers");
            setSafetyData(data);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }

    // Load data only when the page opens first time
    useEffect(() => {
        handleData();
    }, []);

    // Helper to check if a license is expired or expiring soon
    const getExpiryStatus = (expiryDateStr) => {
        // if there is no expiry date then return unknown
        if (!expiryDateStr) return { class: '', text: 'Unknown' };
        // converting string to date
        const expiryDate = new Date(expiryDateStr);
        // get current date
        const today = new Date();
        // difference between expiry date and current date in days
        const daysDiff = (expiryDate - today) / (1000 * 60 * 60 * 24);
        // if difference is less than 0 then license is expired
        if (daysDiff < 0) return { class: 'status-danger', text: 'Expired' };
        // else if difference is less than 30 days then license is expiring soon
        if (daysDiff < 30) return { class: 'status-warning', text: 'Expiring Soon' };
        // else if difference is greater than 30 days then license is valid
        return { class: 'status-good', text: 'Valid' };
    };

    return (
        <div className="safety-officer-page">
            <h2 className="title">Safety Dashboard</h2>
            {/* checking is data loaded or not */}
            {loading ? (
                <p>Loading compliance data...</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Driver Name</th>
                                <th>License Number</th>
                                <th>Category</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                {/* <th>Safety Score</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {safetyData.map((row) => {
                                const name = row.name || "Unknown";
                                const licenseNo = row.license_number || row.licenseNumber || "N/A";
                                const category = row.license_category || row.licenseCategory || "Standard";
                                const expiry = row.license_expiry || row.licenseExpiryDate || row.licenseExpiry || "";
                                // safetu score
                                const expiryStatus = getExpiryStatus(expiry);
                                
                                return (
                                    <tr key={row.id || Math.random()}>
                                        <td>{name}</td>
                                        <td>{licenseNo}</td>
                                        <td>{category}</td>
                                        <td>{expiry || "N/A"}</td>
                                        <td>
                                            <span className={`expiry-badge ${expiryStatus.class}`}>
                                                {expiryStatus.text}
                                            </span>
                                        </td>
                                        {/* <td>
                                            <div></div>
                                            {/* here score badge 
                                        </td> */}
                                    </tr>
                                );
                            })}
                            {safetyData.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
