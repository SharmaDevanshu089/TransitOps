import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from "react-hot-toast";
import "./AdminPage.css";

export function AdminPage() {
    const [financeData, setFinanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleData = async () => {
        try {
            const data = await invoke("get_expenses");
            // Data from DB is DESC by date. We want ASC for charts (left to right)
            setFinanceData(data.reverse());
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleData();
    }, []);

    // Group expenses by type for the bar chart
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

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1 className="title">Finance Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn" onClick={exportToCSV}>Export CSV</button>
                    <div className="total-cost-badge">
                        Total Operational Cost: ${totalCost.toFixed(2)}
                    </div>
                </div>
            </header>

            {loading ? (
                <p>Loading analytics...</p>
            ) : (
                <>
                    <div className="charts-container">
                        <div className="chart-card">
                            <h3>Expenses Over Time</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={financeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Cost ($)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3>Expenses Breakdown</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={expensesByType}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                        <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} name="Total Cost ($)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
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
                                {/* Reverse back for DESC order in the table */}
                                {[...financeData].reverse().map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.date}</td>
                                        <td>{row.expense_type}</td>
                                        <td style={{ color: '#f43f5e', fontWeight: 'bold' }}>-${row.cost.toFixed(2)}</td>
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
        </div>
    );
}
