import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./ClientPage.css";

export function ClientPage() {
    const [activeTab, setActiveTab] = useState('vehicles');
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const vData = await invoke("get_all_vehicles");
            const dData = await invoke("get_all_vehcle_ops");
            setVehicles(vData);
            setDrivers(dData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await invoke("add_vehicle", {
                registrationNumber: data.registration_number,
                nameModel: data.name_model,
                vehicleType: data.vehicle_type,
                maxLoadCapacityKg: parseFloat(data.max_load_capacity_kg),
                odometer: parseFloat(data.odometer || 0),
                acquisitionCost: data.acquisition_cost ? parseFloat(data.acquisition_cost) : null,
            });
            toast.success("Vehicle added!");
            setShowVehicleModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.toString());
        }
    };

    const handleDeleteVehicle = async (id) => {
        try {
            await invoke("delete_vehicle", { id });
            toast.success("Vehicle removed!");
            fetchData();
        } catch (err) {
            toast.error(err.toString());
        }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await invoke("add_vehcle_op", {
                name: data.name,
                licenseNumber: data.license_number,
                licenseCategory: data.license_category,
                licenseExpiry: data.license_expiry,
                contactNumber: data.contact_number,
                email: data.email,
                safetyScore: parseInt(data.safety_score || 100),
                status: "Available",
                notes: data.notes
            });
            toast.success("Driver added!");
            setShowDriverModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.toString());
        }
    };

    const handleDeleteDriver = async (id) => {
        try {
            await invoke("delete_vehcle_op", { id });
            toast.success("Driver removed!");
            fetchData();
        } catch (err) {
            toast.error(err.toString());
        }
    };

    return (
        <div className="client-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="title" style={{ margin: 0 }}>&nbsp;&nbsp;Fleet Manager Dashboard</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={() => setActiveTab('vehicles')}>Vehicles</button>
                    <button className="btn" onClick={() => setActiveTab('drivers')}>Drivers</button>
                </div>
            </header>

            {loading ? (
                <p>Loading fleet data...</p>
            ) : (
                <>
                    {activeTab === 'vehicles' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>Vehicle Registry</h3>
                                <button className="btn-small" onClick={() => setShowVehicleModal(true)}>+ Add Vehicle</button>
                            </div>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Registration</th>
                                            <th>Model</th>
                                            <th>Capacity (kg)</th>
                                            <th>Odometer</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicles.map(v => (
                                            <tr key={v.id}>
                                                <td>{v.registration_number}</td>
                                                <td>{v.name_model}</td>
                                                <td>{v.max_load_capacity_kg}</td>
                                                <td>{v.odometer}</td>
                                                <td>{v.status}</td>
                                                <td>
                                                    <button className="btn-small" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => handleDeleteVehicle(v.id)}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'drivers' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>Driver Management</h3>
                                <button className="btn-small" onClick={() => setShowDriverModal(true)}>+ Add Driver</button>
                            </div>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>License No</th>
                                            <th>Expiry</th>
                                            <th>Contact</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.map(d => (
                                            <tr key={d.id}>
                                                <td>{d.name}</td>
                                                <td>{d.license_number}</td>
                                                <td>{d.license_expiry}</td>
                                                <td>{d.contact_number}</td>
                                                <td>{d.safety_score}</td>
                                                <td>{d.status}</td>
                                                <td>
                                                    <button className="btn-small" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => handleDeleteDriver(d.id)}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showVehicleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Vehicle</h2>
                        <form onSubmit={handleAddVehicle}>
                            <input name="registration_number" placeholder="Reg Number" required className="input" /><br/><br/>
                            <input name="name_model" placeholder="Model (e.g. Ford Transit)" required className="input" /><br/><br/>
                            <input name="vehicle_type" placeholder="Type (e.g. Van)" required className="input" /><br/><br/>
                            <input name="max_load_capacity_kg" type="number" step="0.1" placeholder="Max Capacity (kg)" required className="input" /><br/><br/>
                            <input name="odometer" type="number" step="0.1" placeholder="Odometer" className="input" /><br/><br/>
                            <input name="acquisition_cost" type="number" step="0.1" placeholder="Acquisition Cost" className="input" /><br/><br/>
                            <div className="modal-actions" style={{gap: '1rem'}}>
                                <button type="submit" className="btn">Add</button>
                                <button type="button" className="btn" style={{background: '#334155'}} onClick={() => setShowVehicleModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDriverModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Driver</h2>
                        <form onSubmit={handleAddDriver}>
                            <input name="name" placeholder="Name" required className="input" /><br/><br/>
                            <input name="license_number" placeholder="License Number" required className="input" /><br/><br/>
                            <input name="license_category" placeholder="License Category" className="input" /><br/><br/>
                            <input name="license_expiry" type="date" required className="input" /><br/><br/>
                            <input name="contact_number" placeholder="Contact Number" className="input" /><br/><br/>
                            <input name="email" type="email" placeholder="Email" className="input" /><br/><br/>
                            <input name="safety_score" type="number" placeholder="Safety Score (0-100)" defaultValue={100} className="input" /><br/><br/>
                            <div className="modal-actions" style={{gap: '1rem'}}>
                                <button type="submit" className="btn">Add</button>
                                <button type="button" className="btn" style={{background: '#334155'}} onClick={() => setShowDriverModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}