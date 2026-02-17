import React, { useState } from 'react';
import { ShieldAlert, Zap, TrendingUp, Users, Clock, DollarSign, Play, Activity } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import client from '../api/client';

const Simulator = () => {
    const [params, setParams] = useState({
        demand_multiplier: 1.0,
        driver_supply_change: 0,
        surge_pricing_factor: 1.0,
        event_type: 'No Special Event',
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const res = await client.post('/simulate', params);
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const Slider = ({ label, value, min, max, step, onChange, colorClass, unit = "" }) => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-xs text-text-tertiary uppercase font-bold tracking-widest">{label}</label>
                <span className={`text-sm font-bold ${colorClass}`}>{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-text-tertiary font-medium">
                <span>Min</span>
                <span>Center</span>
                <span>Max</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <section>
                <h2 className="text-2xl font-display font-bold mb-2">Demand & Supply Simulator</h2>
                <p className="text-text-secondary font-body">Run "What-If" scenarios to optimize fleet allocation.</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <GlassCard className="space-y-8">
                    <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                        <ShieldAlert size={20} className="text-primary" /> Scenario Controls
                    </h3>

                    <Slider
                        label="Demand Multiplier"
                        value={params.demand_multiplier}
                        min={0.5} max={2.5} step={0.1}
                        unit="x"
                        colorClass="text-primary"
                        onChange={(val) => setParams({ ...params, demand_multiplier: val })}
                    />

                    <Slider
                        label="Driver Supply Change"
                        value={params.driver_supply_change}
                        min={-50} max={50} step={5}
                        unit="%"
                        colorClass="text-secondary"
                        onChange={(val) => setParams({ ...params, driver_supply_change: val })}
                    />

                    <Slider
                        label="Surge Pricing Factor"
                        value={params.surge_pricing_factor}
                        min={1.0} max={3.0} step={0.1}
                        unit="x"
                        colorClass="text-warning"
                        onChange={(val) => setParams({ ...params, surge_pricing_factor: val })}
                    />

                    <div className="space-y-2">
                        <label className="text-xs text-text-tertiary uppercase font-bold tracking-widest pl-1">Event Type</label>
                        <select
                            value={params.event_type}
                            onChange={(e) => setParams({ ...params, event_type: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm appearance-none"
                        >
                            <option className="bg-background-secondary">No Special Event</option>
                            <option className="bg-background-secondary">Concert/Stadium Event</option>
                            <option className="bg-background-secondary">Holiday</option>
                            <option className="bg-background-secondary">Bad Weather</option>
                            <option className="bg-background-secondary">Rush Hour Peak</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-display font-bold rounded-xl flex items-center justify-center gap-2 emerald-glow hover:opacity-90 active:scale-95 transition-all"
                    >
                        {loading ? <Zap className="animate-spin" size={20} /> : <Play size={20} />}
                        {loading ? 'Simulating...' : 'Run Simulation'}
                    </button>
                </GlassCard>

                {/* Results */}
                <div className="space-y-6">
                    <h3 className="font-display font-semibold text-lg">Simulation Results</h3>
                    {!results ? (
                        <div className="h-full min-h-[400px] glass-card border-dashed flex flex-col items-center justify-center text-text-tertiary text-center p-8">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Adjust controls and run simulation to see impact analysis.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-slide-up">
                            <div className="glass-card p-5 flex justify-between items-center border-primary/20 bg-primary/5">
                                <div>
                                    <p className="text-xs text-text-secondary uppercase mb-1">Estimated Demand</p>
                                    <p className="text-2xl font-display font-bold text-primary">{results.estimated_demand.toLocaleString()}</p>
                                </div>
                                <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30">
                                    {params.demand_multiplier > 1 ? '+' : ''}{(params.demand_multiplier - 1) * 100}%
                                </div>
                            </div>

                            <div className="glass-card p-5 flex justify-between items-center border-secondary/20 bg-secondary/5">
                                <div>
                                    <p className="text-xs text-text-secondary uppercase mb-1">Drivers Needed</p>
                                    <p className="text-2xl font-display font-bold text-secondary">{results.drivers_needed}</p>
                                </div>
                                <Users className="text-secondary/40" size={24} />
                            </div>

                            <div className="glass-card p-5 flex justify-between items-center border-warning/20 bg-warning/5">
                                <div>
                                    <p className="text-xs text-text-secondary uppercase mb-1">Estimated Wait Time</p>
                                    <p className="text-2xl font-display font-bold text-warning">{results.estimated_wait_time}</p>
                                </div>
                                <Clock className="text-warning/40" size={24} />
                            </div>

                            <div className="glass-card p-5 flex justify-between items-center border-info/20 bg-info/5">
                                <div>
                                    <p className="text-xs text-text-secondary uppercase mb-1">Revenue Impact</p>
                                    <p className="text-2xl font-display font-bold text-info">{results.revenue_impact}</p>
                                </div>
                                <DollarSign className="text-info/40" size={24} />
                            </div>

                            <div className="pt-4 space-y-3">
                                <p className="text-xs text-text-tertiary uppercase font-bold tracking-widest px-1">Zone Recommendations</p>
                                {results.recommendations.map((rec) => (
                                    <div key={rec.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-primary">{rec.id}</div>
                                            <div>
                                                <p className="text-xs font-bold">{rec.zone}</p>
                                                <p className="text-[10px] text-text-tertiary">{rec.desc}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[11px] font-bold ${rec.count === 'OK' ? 'text-primary' : 'text-secondary'}`}>{rec.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulator;
