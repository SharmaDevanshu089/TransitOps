import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import "./SafetyOfficerPage.css";

export function SafetyOfficerPage(){
    const [safetyData, setSafetyData] = useState([]);

    const handleData = async () => {
        try {
            // Replace with your actual backend command to fetch driver/safety data
            const data = await invoke("", {});
            setSafetyData(data);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    }

    // Load data only when the page opens first time
    useEffect(() => {
        handleData();
    }, []);

    return (
        <div className="safety-officer-page">
            <h2 className="title">Safety Dashboard</h2>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>License Number</th>
                            <th>License Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safetyData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.licenseNumber}</td>
                                <td>{row.licenseExpiryDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
