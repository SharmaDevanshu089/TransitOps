import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import "./VehicleOpsPage.css";

export function VehicleOpsPage() {
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [warnings, setWarnings] = useState([]);
    
    // Modal states
    const [showTripModal, setShowTripModal] = useState(false);
    const [showMaintModal, setShowMaintModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const vData = await invoke("get_all_vehicles");
            const tData = await invoke("get_all_trips");
            const dData = await invoke("get_all_vehcle_ops");
            setVehicles(vData);
            setTrips(tData);
            setDrivers(dData);
            
            // Check for expiring licenses
            const today = new Date();
            const expWarnings = dData.filter(d => {
                if (!d.license_expiry) return false;
                const expiryDate = new Date(d.license_expiry);
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30; // Expired or expiring within 30 days
            });
            setWarnings(expWarnings);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load operations data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await invoke("create_trip", {
                source: data.source,
                destination: data.destination,
                vehicleId: parseInt(data.vehicle_id),
                driverId: parseInt(data.driver_id),
                cargoWeightKg: parseFloat(data.cargo_weight),
                plannedDistanceKm: parseFloat(data.planned_distance)
            });
            toast.success("Trip created successfully!");
            setShowTripModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleLogMaintenance = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await invoke("log_maintenance", {
                vehicleId: parseInt(data.vehicle_id),
                maintenanceType: data.maintenance_type,
                date: data.date,
                cost: parseFloat(data.cost)
            });
            toast.success("Maintenance logged!");
            setShowMaintModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleDispatch = async (tripId) => {
        try {
            await invoke("dispatch_trip", { tripId });
            toast.success("Trip dispatched!");
            fetchData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleComplete = async (tripId) => {
        try {
            await invoke("complete_trip", { tripId });
            toast.success("Trip completed!");
            fetchData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleCancel = async (tripId) => {
        try {
            await invoke("cancel_trip", { tripId });
            toast.success("Trip cancelled!");
            fetchData();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const totalVehicles = vehicles.length;
    const availableCount = vehicles.filter(v => v.status === 'Available').length;
    const unavailableCount = totalVehicles - availableCount;
    const availablePercent = totalVehicles === 0 ? 0 : (availableCount / totalVehicles) * 100;

    return (
        <div className="vehicleops-page">
            <header className="page-header">
                <h1 className="page-title">Vehicle Operations Dashboard</h1>
                <div className="action-buttons">
                    <button className="btn" onClick={() => setShowTripModal(true)}>+ Create Trip</button>
                    &nbsp;&nbsp;
                    <button className="btn" onClick={() => setShowMaintModal(true)}>+ Log Maintenance</button>
                </div>
            </header>

            <main className="main-content">
                {!loading && totalVehicles > 0 && (
                    <div className="stats-overview">
                        <div className="chart-card">
                            <h3 className="section-title">Fleet Availability</h3>
                            <div className="donut-wrapper">
                                <div 
                                    className="donut-chart" 
                                    style={{ background: `conic-gradient(#7dd3fc ${availablePercent}%, #334155 ${availablePercent}% 100%)` }}
                                >
                                    <div className="donut-hole">
                                        <span className="donut-total">{totalVehicles}</span>
                                        <span className="donut-label">Total</span>
                                    </div>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item">
                                        <span className="legend-dot" style={{backgroundColor: '#7dd3fc'}}></span> 
                                        Available ({availableCount})
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot" style={{backgroundColor: '#334155'}}></span> 
                                        Unavailable ({unavailableCount})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {warnings.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#f87171' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚠️ Driver License Warnings
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                            {warnings.map(w => (
                                <li key={w.id}>
                                    <strong>{w.name}</strong> (License: {w.license_number}) - Expires on {w.license_expiry}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="table-container">
                    <h2 className="section-title">Active Trips</h2>
                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : (
                        <table className="drivers-table">
                            <thead>
                                <tr>
                                    <th>Trip ID</th>
                                    <th>Source</th>
                                    <th>Destination</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map((trip) => (
                                    <tr key={trip.id}>
                                        <td>#{trip.id}</td>
                                        <td>{trip.source}</td>
                                        <td>{trip.destination}</td>
                                        <td>
                                            <span className={`status-badge status-${trip.status.toLowerCase().replace(' ', '-')}`}>
                                                {trip.status}
                                            </span>
                                        </td>
                                        <td>
                                            {trip.status === 'Draft' && (
                                                <>
                                                    <button className="btn-small" onClick={() => handleDispatch(trip.id)}>Dispatch</button>
                                                    &nbsp;
                                                    <button className="btn-small" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => handleCancel(trip.id)}>Cancel</button>
                                                </>
                                            )}
                                            {trip.status === 'Dispatched' && (
                                                <>
                                                    <button className="btn-small btn-success" onClick={() => handleComplete(trip.id)}>Complete</button>
                                                    &nbsp;
                                                    <button className="btn-small" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => handleCancel(trip.id)}>Cancel</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {trips.length === 0 && (
                                    <tr><td colSpan="5" className="no-data">No trips found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Trip Modal */}
            {showTripModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Trip</h2>
                        <form onSubmit={handleCreateTrip}>
                            <input name="source" placeholder="Source" required className="input" />
                            <br/><br/>
                            <input name="destination" placeholder="Destination" required className="input" />
                            <br/><br/>
                            <select name="vehicle_id" required className="select">
                                <option value="">Select Vehicle</option>
                                {vehicles.filter(v => v.status === 'Available').map(v => (
                                    <option key={v.id} value={v.id}>{v.registration_number} - {v.name_model} (Max: {v.max_load_capacity_kg}kg)</option>
                                ))}
                            </select>
                            <br/><br/>
                            <select name="driver_id" required className="select">
                                <option value="">Select Driver</option>
                                {drivers.filter(d => d.status === 'Available').map(d => {
                                    // optional: visually show if expiring soon, but we only show available
                                    return <option key={d.id} value={d.id}>{d.name} (ID: {d.id})</option>;
                                })}
                            </select>
                            <br/><br/>
                            <input name="cargo_weight" type="number" step="0.1" placeholder="Cargo Weight (kg)" required className="input" />
                            <br/><br/>
                            <input name="planned_distance" type="number" step="0.1" placeholder="Planned Distance (km)" required className="input" />
                            <br/><br/>
                            <div className="modal-actions">
                                <button type="submit" className="btn">Submit</button>
                                &nbsp;&nbsp;
                                <button type="button" className="btn" style={{background: '#334155'}} onClick={() => setShowTripModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Log Maintenance</h2>
                        <form onSubmit={handleLogMaintenance}>
                            <select name="vehicle_id" required className="select">
                                <option value="">Select Vehicle</option>
                                {vehicles.filter(v => v.status !== 'Retired').map(v => (
                                    <option key={v.id} value={v.id}>{v.registration_number}</option>
                                ))}
                            </select>
                            <br/><br/>
                            <input name="maintenance_type" placeholder="Maintenance Type (e.g. Oil Change)" required className="input" />
                            <br/><br/>
                            <input name="date" type="date" required className="input" />
                            <br/><br/>
                            <input name="cost" type="number" step="0.01" placeholder="Cost ($)" required className="input" />
                            <br/><br/>
                            <div className="modal-actions">
                                <button type="submit" className="btn">Submit</button>
                                &nbsp;&nbsp;
                                <button type="button" className="btn" style={{background: '#334155'}} onClick={() => setShowMaintModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}