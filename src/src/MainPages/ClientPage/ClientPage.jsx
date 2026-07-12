import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./ClientPage.css";

export function ClientPage() {
    const [dataByUser, setDataByUser] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const handleData = async () => {
        try {
            const data = await invoke("get_all_cargos");
            setDataByUser(data);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load cargo data");
        }
    }

    useEffect(() => {
        handleData();
    }, []);

    const handleAddCargo = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await invoke("add_cargo", {
                cargoName: data.cargo_name,
                description: data.description,
                dateAvailable: data.date_available,
                weightKg: parseFloat(data.weight_kg)
            });
            toast.success("Cargo added successfully!");
            setShowModal(false);
            handleData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleDelete = async (id) => {
        try {
            await invoke("delete_cargo", { id });
            toast.success("Cargo removed!");
            handleData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    return (
        <div className="client-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="title" style={{ margin: 0 }}>Client Dashboard</h2>
                <button className="btn" onClick={() => setShowModal(true)}>+ Add Cargo</button>
            </header>
            
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Cargo Name</th>
                            <th>Description</th>
                            <th>Weight (kg)</th>
                            <th>Date Available</th>
                            <th>Status</th>
                            <th>Actions</th>
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
                                <td>
                                    <button className="btn-small" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => handleDelete(row.id)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                        {dataByUser.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No cargos found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Cargo</h2>
                        <form onSubmit={handleAddCargo}>
                            <input name="cargo_name" placeholder="Cargo Name" required className="input" />
                            <br/><br/>
                            <input name="description" placeholder="Description" className="input" />
                            <br/><br/>
                            <input name="weight_kg" type="number" step="0.1" placeholder="Weight (kg)" required className="input" />
                            <br/><br/>
                            <input name="date_available" type="date" required className="input" />
                            <br/><br/>
                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn">Add</button>
                                <button type="button" className="btn" style={{background: '#334155'}} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}