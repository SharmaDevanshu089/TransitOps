import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from "react-hot-toast";
import "./AdminPage.css";

export function AdminPage() {
    const [financeData, setFinanceData] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    const handleData = async () => {
        try {
            const data = await invoke("get_expenses");
            const vData = await invoke("get_all_vehicles");
            setFinanceData(data.reverse());
            setVehicles(vData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleData();
    }, []);

    const expensesByType = financeData.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.expense_type);
        if (existing) {
            existing.value += curr.cost;
        } else {
            acc.push({ name: curr.expense_type, value: curr.cost });
        }
        return acc;
    }, []);

    const totalCost = financeData.reduce((sum, item) => sum + item.cost, 0);

    const exportToCSV = async () => {
        const headers = ["Date,Expense Type,Cost,Description"];
        const rows = financeData.map(row =>
            `${row.date},"${row.expense_type}",${row.cost},"${row.description || ''}"`
        );
        const csvContent = headers.concat(rows).join("\n");

        try {
            const filePath = await invoke("export_to_csv", { csvContent });
            toast.success(`CSV exported to Downloads!`);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to export CSV: ${error}`);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await invoke("add_expense", {
                vehicleId: parseInt(data.vehicle_id),
                expenseType: data.expense_type,
                cost: parseFloat(data.cost),
                date: data.date,
                description: data.description || null
            });
            toast.success("Expense logged successfully!");
            setShowExpenseModal(false);
            handleData();
        } catch (err) {
            toast.error(err.toString());
        }
    };

    // Calculate Vehicle ROI per vehicle
    // ROI = (Estimated Revenue - Total Expenses) / Acquisition Cost
    // Since we don't have revenue, we will show Total Operational Cost and Acquisition Cost
    const vehicleMetrics = vehicles.map(v => {
        const vExpenses = financeData.filter(e => e.vehicle_id === v.id).reduce((sum, e) => sum + e.cost, 0);
        const acqCost = v.acquisition_cost || 0;
        // Mock revenue = $2 per km of odometer
        const estRevenue = v.odometer * 2;
        const roi = acqCost > 0 ? ((estRevenue - vExpenses) / acqCost) * 100 : 0;
        return {
            ...v,
            totalExpenses: vExpenses,
            roi: roi
        };
    });

    return (
        <div className="admin-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ margin: 0 }}>Financial Analyst Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
                    <button className="btn" onClick={exportToCSV}>Export CSV</button>
                    <div className="total-cost-badge" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                        Total Operational Cost: ${totalCost.toFixed(2)}
                    </div>
                </div>
            </header>

            {loading ? (
                <p>Loading analytics...</p>
            ) : (
                <>
                    <div className="charts-container" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        <div className="chart-card" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ marginTop: 0 }}>Expenses Over Time</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={financeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Cost ($)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ marginTop: 0 }}>Expenses Breakdown</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={expensesByType}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                        <Bar dataKey="value" fill="#f87171" radius={[4, 4, 0, 0]} name="Total Cost ($)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="table-container" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title">Vehicle ROI & Costs</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Acquisition Cost</th>
                                    <th>Total Expenses</th>
                                    <th>Est. ROI (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleMetrics.map((v) => (
                                    <tr key={v.id}>
                                        <td>{v.registration_number} ({v.name_model})</td>
                                        <td>${(v.acquisition_cost || 0).toFixed(2)}</td>
                                        <td style={{ color: '#ef4444' }}>${v.totalExpenses.toFixed(2)}</td>
                                        <td style={{ color: v.roi >= 0 ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>{v.roi.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-container">
                        <h2 className="section-title">Recent Transactions</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Expense Type</th>
                                    <th>Cost</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...financeData].reverse().map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.date}</td>
                                        <td>{row.expense_type}</td>
                                        <td style={{ color: '#ef4444', fontWeight: 'bold' }}>-${row.cost.toFixed(2)}</td>
                                        <td>{row.description || 'N/A'}</td>
                                    </tr>
                                ))}
                                {financeData.length === 0 && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showExpenseModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Log Manual Expense</h2>
                        <form onSubmit={handleAddExpense}>
                            <select name="vehicle_id" required className="select">
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.registration_number}</option>
                                ))}
                            </select>
                            <br/><br/>
                            <select name="expense_type" required className="select">
                                <option value="">Select Type</option>
                                <option value="Fuel">Fuel</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Toll">Toll</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Other">Other</option>
                            </select>
                            <br/><br/>
                            <input name="cost" type="number" step="0.01" placeholder="Cost ($)" required className="input" />
                            <br/><br/>
                            <input name="date" type="date" required className="input" />
                            <br/><br/>
                            <input name="description" placeholder="Description (Optional)" className="input" />
                            <br/><br/>
                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn">Add</button>
                                <button type="button" className="btn" style={{background: '#334155'}} onClick={() => setShowExpenseModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
