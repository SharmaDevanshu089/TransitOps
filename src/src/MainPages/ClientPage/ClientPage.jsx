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
                            <th>Vehicle Number</th>
                            <th>Life-cycle</th>
                            <th>Maintenance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataByUser.map((row) => (
                            <tr key={row.id}>
                                <td>{row.vehicleNumber}</td>
                                <td>{row.lifeCycle}</td>
                                <td>{row.maintenance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}