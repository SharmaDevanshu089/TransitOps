import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import "./SafetyOfficerPage.css";

export function SafetyOfficerPage() {
    const [safetyData, setSafetyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleData = async () => {
        try {
            const data = await invoke("get_all_vehcle_ops");
            setSafetyData(data);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleData();
    }, []);

    const getExpiryStatus = (expiryDateStr) => {
        if (!expiryDateStr) return { class: 'status-danger', text: 'Missing' };
        const expiryDate = new Date(expiryDateStr);
        const today = new Date();
        const daysDiff = (expiryDate - today) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 0) return { class: 'status-danger', text: 'Expired' };
        if (daysDiff < 30) return { class: 'status-warning', text: 'Expiring Soon' };
        return { class: 'status-good', text: 'Valid' };
    };

    const getScoreClass = (score) => {
        if (score >= 90) return 'score-badge high';
        if (score >= 70) return 'score-badge medium';
        return 'score-badge low';
    };

    return (
        <div className="safety-officer-page">
            <h2 className="title">Safety & Compliance Dashboard</h2>
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
                                <th>Safety Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safetyData.map((row) => {
                                const name = row.name || "Unknown";
                                const licenseNo = row.license_number || "N/A";
                                const category = row.license_category || "Standard";
                                const expiry = row.license_expiry || "";
                                const expiryStatus = getExpiryStatus(expiry);
                                
                                return (
                                    <tr key={row.id}>
                                        <td>{name}</td>
                                        <td>{licenseNo}</td>
                                        <td>{category}</td>
                                        <td>{expiry || "N/A"}</td>
                                        <td>
                                            <span className={`expiry-badge ${expiryStatus.class}`}>
                                                {expiryStatus.text}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getScoreClass(row.safety_score)}>
                                                {row.safety_score}/100
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {safetyData.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
