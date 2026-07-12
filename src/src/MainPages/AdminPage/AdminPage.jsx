import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import "./AdminPage.css";

export function AdminPage(){
    const [financeData, setFinanceData] = useState([]);

    const handleData = async () => {
        try {
            // now fit the backend name in this
            const data = await invoke("", {});
            setFinanceData(data);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    }

    // Load data only when the page opens first time
    useEffect(() => {
        handleData();
    }, []);

    return (
        <div className="admin-page">
            <h2 className="title">Finance Dashboard</h2>
            <div className="table-container">
                {/* read client page in that i defined what does it do and here also same */}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle Number</th>
                            <th>Fuel Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financeData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.vehicleNumber}</td>
                                <td>{row.fuelCost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
