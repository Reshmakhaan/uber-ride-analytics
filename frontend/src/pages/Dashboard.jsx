import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, MapPin, ShieldCheck, Zap, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import client from '../api/client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';



const KPICard = ({ title, value, subtext, icon: Icon, trend, colorClass }) => (
    <GlassCard className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div className={`px-2 py-0.5 rounded-lg text-xs font-bold bg-white/5 ${trend.startsWith('+') ? 'text-primary' : 'text-critical'}`}>
                {trend}
            </div>
        </div>
        <div>
            <h3 className="text-3xl font-display font-bold leading-none mb-1">{value}</h3>
            <p className="text-sm font-body text-text-secondary">{title}</p>
            {subtext && <p className="text-[10px] text-text-tertiary mt-1">{subtext}</p>}
        </div>
    </GlassCard>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(9);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const ranges = [6, 9, 12, 24];

    useEffect(() => {
        client.get('/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-primary font-display text-center py-20">Loading Intelligence...</div>;
    if (!stats) return <div className="text-critical font-display text-center py-20">Error: Unable to load dashboard data. Please check backend.</div>;

    // Slice data based on timeRange (get last N hours)
    const labelsSlice = stats.demand_trend.labels.slice(-timeRange);
    const actualSlice = stats.demand_trend.actual.slice(-timeRange);
    const predictedSlice = stats.demand_trend.predicted.slice(-timeRange);

    const lineData = {
        labels: labelsSlice,
        datasets: [
            {
                label: 'Actual',
                data: actualSlice,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Predicted',
                data: predictedSlice,
                borderColor: '#8b5cf6',
                borderDash: [5, 5],
                tension: 0.4,
            }
        ],
    };

    const doughnutData = {
        labels: stats.zone_distribution.map(d => d.name),
        datasets: [{
            data: stats.zone_distribution.map(d => d.value),
            backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444'],
            borderWidth: 0,
        }],
    };

    return (
        <div className="space-y-8 pb-12">
            {/* KPI Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPICard
                    title="Total Rides Today"
                    value={stats.total_rides_today.toLocaleString()}
                    trend="+12.5%"
                    icon={TrendingUp}
                    colorClass="bg-primary/20 emerald-glow"
                />
                <KPICard
                    title="Avg Wait Time"
                    value={stats.avg_wait_time}
                    trend="-2.3min"
                    icon={Clock}
                    colorClass="bg-secondary/20 violet-glow"
                />
                <KPICard
                    title="Active Hot Zones"
                    value={stats.active_hot_zones}
                    trend="Hot"
                    icon={MapPin}
                    colorClass="bg-warning/20"
                />
                <KPICard
                    title="Model Accuracy"
                    value={stats.model_accuracy}
                    trend="+0.4%"
                    icon={ShieldCheck}
                    colorClass="bg-info/20"
                />
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard>
                    <div className="flex justify-between items-center mb-6 relative">
                        <div>
                            <h3 className="font-display font-semibold text-lg">Demand Trend</h3>
                            <p className="text-sm text-text-secondary">Hourly ride volume comparisons</p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs transition-colors hover:bg-white/10"
                            >
                                Last {timeRange}h <ChevronDown size={14} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-background-light border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                                    {ranges.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => {
                                                setTimeRange(r);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-xs hover:bg-white/5 transition-colors ${timeRange === r ? 'text-primary font-bold' : 'text-text-secondary'}`}
                                        >
                                            Last {r} hours
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-64">
                        <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 }, usePointStyle: true, padding: 20 } } } }} />
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="mb-6">
                        <h3 className="font-display font-semibold text-lg">Zone Distribution</h3>
                        <p className="text-sm text-text-secondary">Rides volume by borough</p>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af', boxWidth: 12, padding: 15 } } } }} />
                    </div>
                </GlassCard>
            </section>

            {/* Heat Map & Feed */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <GlassCard className="lg:col-span-8">
                    <div className="mb-6">
                        <h3 className="font-display font-semibold text-lg">Demand Heat Map</h3>
                        <p className="text-sm text-text-secondary">Temporal demand density matrix</p>
                    </div>
                    <div className="grid grid-cols-24 gap-1">
                        {Array.from({ length: 7 * 24 }).map((_, i) => {
                            const intensity = Math.random();
                            let color = 'bg-primary/10';
                            if (intensity > 0.8) color = 'bg-critical';
                            else if (intensity > 0.6) color = 'bg-warning';
                            else if (intensity > 0.4) color = 'bg-primary-dark';
                            else if (intensity > 0.2) color = 'bg-primary';

                            return (
                                <div
                                    key={i}
                                    className={`aspect-square w-full rounded-sm hover:scale-125 transition-transform cursor-pointer ${color}`}
                                    title={`Hour ${i % 24}, Day ${Math.floor(i / 24)}`}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] text-text-tertiary uppercase tracking-wider">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>23:00</span>
                    </div>
                </GlassCard>

                <GlassCard className="lg:col-span-4" hover={false}>
                    <div className="mb-6">
                        <h3 className="font-display font-semibold text-lg">Live Activity Feed</h3>
                        <p className="text-sm text-text-secondary">Real-time supply updates</p>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                                    <Zap size={14} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold">Midtown Manhattan</span>
                                        <span className="text-[10px] text-text-tertiary">2m ago</span>
                                    </div>
                                    <p className="text-[11px] text-text-secondary">High demand surge predicted (+15%)</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </section>
        </div>
    );
};

export default Dashboard;
