import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import "./ClientPage.css";

export function ClientPage() {
    const [dataByUser, setDataByUser] = useState([]);

    const handleData = async () => {
        try {
            const data = await invoke("get_all_cargos");
            setDataByUser(data);
            console.log("daata", data)
        } catch (error) {
            console.error("Failed to load data", error);
        }
    }

    // Load data only when the page opens first time
    useEffect(() => {
        handleData();
    }, []);

    return (
        <div className="client-page">
            <h2 className="title">Client Dashboard</h2>
            <div className="table-container">
                {/* this is the table data where you can directly implement data and before implementing check these rows first */}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Cargo Name</th>
                            <th>Description</th>
                            <th>Weight (kg)</th>
                            <th>Date Available</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataByUser.map((row) => (
                            <tr key={row.id}>
                                <td>{row.cargo_name}</td>
                                <td>{row.description || 'N/A'}</td>
                                <td>{row.weight_kg ? `${row.weight_kg} kg` : 'N/A'}</td>
                                <td>{row.date_available || 'N/A'}</td>
                                <td>
                                    <span className={`status-badge ${row.is_currently_available ? 'status-good' : 'status-danger'}`}>
                                        {row.is_currently_available ? 'Available' : 'Reserved'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}