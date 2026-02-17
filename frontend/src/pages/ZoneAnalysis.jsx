import React, { useEffect, useState } from 'react';
import { Map, TrendingUp, AlertTriangle, Info, ShieldAlert, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import client from '../api/client';

const ZoneAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('demand'); // demand, supply, wait

    useEffect(() => {
        client.get('/zones')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-primary font-display text-center py-20">Analysing Zones...</div>;
    if (!data) return <div className="text-critical font-display text-center py-20">Error: Unable to load zone data. Please check backend.</div>;


    const getIntensityColor = (intensity) => {
        if (intensity > 70) return 'from-critical/50 to-critical/30 border-critical/30';
        if (intensity > 40) return 'from-warning/50 to-warning/30 border-warning/30';
        return 'from-primary/50 to-primary/30 border-primary/30';
    };

    return (
        <div className="space-y-8 pb-12">
            {/* View Toggles */}
            <section className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold mb-1">Geographic Zone Analysis</h2>
                    <p className="text-sm text-text-secondary">Spatial demand and supply distribution across NYC.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {['demand', 'supply', 'wait'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${view === v ? 'bg-primary text-white emerald-glow' : 'text-text-tertiary hover:text-text-secondary'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </section>

            {/* Main Grid Map */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {data.zones.map((zone) => (
                    <GlassCard
                        key={zone.id}
                        className={`aspect-square flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br transition-transform hover:scale-105 ${getIntensityColor(zone.demand_intensity)}`}
                    >
                        <span className="text-[10px] text-text-primary/70 font-medium mb-1 truncate w-full">{zone.name}</span>
                        <span className="text-xl font-display font-bold text-white mb-1">{zone.demand_intensity}%</span>
                        <span className="text-[10px] uppercase font-bold tracking-tighter text-white/60">{view} Level</span>
                    </GlassCard>
                ))}
            </section>

            {/* Analysis Details */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard className="lg:col-span-2">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-display font-semibold text-lg">Top Performing Zones</h3>
                        <span className="text-xs text-primary font-bold">Show All <ChevronRight size={14} className="inline" /></span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-text-tertiary font-medium">
                                    <th className="pb-4">Zone</th>
                                    <th className="pb-4">Rides/Hr</th>
                                    <th className="pb-4">Avg Fare</th>
                                    <th className="pb-4">Wait Time</th>
                                    <th className="pb-4 text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.zones.slice(0, 5).map((zone) => (
                                    <tr key={zone.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 font-medium transition-colors group-hover:text-primary">{zone.name}</td>
                                        <td className="py-4 text-text-secondary">{zone.rides_per_hr}</td>
                                        <td className="py-4 text-text-secondary">{zone.avg_fare}</td>
                                        <td className="py-4 text-text-secondary">{zone.wait_time}</td>
                                        <td className={`py-4 text-right font-bold ${zone.trend.startsWith('+') ? 'text-primary' : 'text-critical'}`}>
                                            {zone.trend}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                <section className="space-y-4">
                    <h3 className="font-display font-semibold text-lg mb-4">Hot Zones Alert</h3>
                    {data.alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl border flex gap-4 transition-all hover:translate-x-1 ${alert.level === 'Critical' ? 'bg-critical/10 border-critical/30 text-critical-light' :
                                alert.level === 'Warning' ? 'bg-warning/10 border-warning/30 text-warning-light' :
                                    'bg-info/10 border-info/30 text-info-light'
                                }`}
                        >
                            <div className="pt-1">
                                {alert.level === 'Critical' ? <ShieldAlert size={20} /> :
                                    alert.level === 'Warning' ? <AlertTriangle size={20} /> :
                                        <Info size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight">{alert.zone}</h4>
                                <p className="text-xs opacity-80 mt-1">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </section>
        </div>
    );
};

export default ZoneAnalysis;
