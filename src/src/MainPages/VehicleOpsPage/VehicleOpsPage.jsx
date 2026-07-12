import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./VehicleOpsPage.css";

export function VehicleOpsPage() {
    //declaring few states
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    // loading driver details once opening the page
    useEffect(() => {
        fetchDrivers();
    }, []);

    // to get data from backend
    const fetchDrivers = async () => {
        try {
            const data = await invoke("get_all_drivers");
            setDrivers(data);
        } catch (error) {
            console.error("Error in fetching drivers:", error);
            
        } finally {
            setLoading(false);
        }
    };

    const totalDrivers = drivers.length;
    const availableCount = drivers.filter(d => d.is_available).length;
    const unavailableCount = totalDrivers - availableCount;
    const availablePercent = totalDrivers === 0 ? 0 : (availableCount / totalDrivers) * 100;

    return (
        <div className="vehicleops-page">
            <header className="page-header">
                <h1 className="page-title">Vehicle Operations Dashboard</h1>
            </header>
{/* I have No Idea how is this pie chart created */}
            <main className="main-content">
                {!loading && totalDrivers > 0 && (
                    <div className="stats-overview">
                        <div className="chart-card">
                            <h3 className="section-title">Availability Overview</h3>
                            <div className="donut-wrapper">
                                <div 
                                    className="donut-chart" 
                                    style={{ background: `conic-gradient(#7dd3fc ${availablePercent}%, #334155 ${availablePercent}% 100%)` }}
                                >
                                    <div className="donut-hole">
                                        <span className="donut-total">{totalDrivers}</span>
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

                <div className="table-container">
                    <h2 className="section-title">Drivers & Trucks Roster</h2>
                    {/* if data is loading then loading else continue */}
                    {loading ? (
                        <p className="loading-text">Loading drivers data...</p>
                    ) : (
                        <table className="drivers-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>License No.</th>
                                    <th>Truck No.</th>
                                    <th>Capacity (kg)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* mapping the driver details and after that setting the condition for no driver */}
                                {drivers.map((driver) => (
                                    <tr key={driver.id} className={driver.is_available ? "" : "inactive-row"}>
                                        <td>{driver.id}</td>
                                        <td>{driver.name}</td>
                                        <td>{driver.license_number}</td>
                                        <td>{driver.truck_number}</td>
                                        <td>{driver.truck_capacity_kg}</td>
                                        <td>
                                            <span className={`status-badge ${driver.is_available ? 'status-available' : 'status-off-duty'}`}>
                                                {driver.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {drivers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="no-data">No drivers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}