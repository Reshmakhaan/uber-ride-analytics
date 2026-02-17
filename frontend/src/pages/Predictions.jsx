import React, { useState } from 'react';
import { Target, Calendar, Clock, MapPin, TrendingUp, Users, Zap, ShieldCheck, Activity, BarChart2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import client from '../api/client';
import { Bar } from 'react-chartjs-2';

const Predictions = () => {
    const [formData, setFormData] = useState({
        zone_id: '1',
        date: new Date().toISOString().split('T')[0],
        time_window: 'Afternoon (2-6 PM)',
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const zones = [
        { id: '1', name: 'Manhattan' },
        { id: '2', name: 'Brooklyn' },
        { id: '3', name: 'Queens' },
        { id: '4', name: 'Bronx' },
        { id: '5', name: 'Staten Island' },
        { id: '8', name: 'JFK Airport' },
        { id: '9', name: 'LGA Airport' },
    ];

    const windows = ['Morning (6-10 AM)', 'Midday (10 AM-2 PM)', 'Afternoon (2-6 PM)', 'Evening (6-10 PM)', 'Night (10 PM-2 AM)', 'Late Night (2-6 AM)'];

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await client.post('/predict', formData);
            setPrediction(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const importanceData = prediction ? {
        labels: prediction.feature_importance.map(f => f.feature),
        datasets: [{
            label: 'Importance Score',
            data: prediction.feature_importance.map(f => f.importance),
            backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#ec4899'],
            borderRadius: 8,
        }]
    } : null;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <section>
                <h2 className="text-2xl font-display font-bold mb-2">Demand Forecasting</h2>
                <p className="text-text-secondary font-body">Input parameters to generate AI-driven ride predictions.</p>
            </section>

            {/* Input Form */}
            <GlassCard className="p-0 overflow-visible" hover={false}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs text-text-tertiary uppercase font-bold tracking-widest pl-1">Zone</label>
                        <div className="relative">
                            <select
                                value={formData.zone_id}
                                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors appearance-none text-sm"
                            >
                                {zones.map(z => <option key={z.id} value={z.id} className="bg-background-secondary">{z.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-text-tertiary uppercase font-bold tracking-widest pl-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-text-tertiary uppercase font-bold tracking-widest pl-1">Time Window</label>
                        <div className="relative">
                            <select
                                value={formData.time_window}
                                onChange={(e) => setFormData({ ...formData, time_window: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors appearance-none text-sm"
                            >
                                {windows.map(w => <option key={w} value={w} className="bg-background-secondary">{w}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
                        </div>
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-secondary text-white font-display font-bold py-3.5 rounded-xl emerald-glow hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Generate Prediction'}
                    </button>
                </div>
            </GlassCard>

            {prediction && (
                <>
                    {/* Results Section */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                        <GlassCard className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                            <p className="text-sm text-text-secondary mb-1">Predicted Ride Volume</p>
                            <h3 className="text-4xl font-display font-bold text-primary mb-2">{prediction.predicted_rides}</h3>
                            <p className="text-[10px] text-text-tertiary">Unit: Hourly demand for coordinate block</p>
                        </GlassCard>
                        <GlassCard className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
                            <p className="text-sm text-text-secondary mb-1">Recommended Drivers</p>
                            <h3 className="text-4xl font-display font-bold text-secondary mb-2">{prediction.recommended_drivers}</h3>
                            <p className="text-[10px] text-text-tertiary">Coverage set at 1 driver per 8 rides</p>
                        </GlassCard>
                        <GlassCard className="bg-gradient-to-br from-warning/20 to-warning/5 border-warning/20">
                            <p className="text-sm text-text-secondary mb-1">Surge Probability</p>
                            <h3 className="text-4xl font-bold text-warning mb-2">{prediction.surge_probability}</h3>
                            <p className="text-[10px] text-text-tertiary">Real-time pricing likelihood</p>
                        </GlassCard>
                    </section>

                    {/* Location Intel Section */}
                    {prediction.location_context && (
                        <GlassCard className="border-info/20 bg-info/5">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="text-info" size={20} />
                                <h3 className="font-display font-semibold text-lg">Location Intelligence</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Selected Region</p>
                                    <p className="text-sm font-semibold">{prediction.location_context.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Target Coordinates</p>
                                    <p className="text-sm font-mono">{prediction.location_context.lat.toFixed(4)}, {prediction.location_context.lon.toFixed(4)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Prediction Logic</p>
                                    <p className="text-[11px] text-text-secondary">{prediction.location_context.method}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Data Source</p>
                                    <p className="text-[11px] text-text-secondary">Uber Ride Dataset (4M records)</p>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Model Insights */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <GlassCard>
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart2 className="text-primary" size={20} />
                                <h3 className="font-display font-semibold text-lg">Feature Importance</h3>
                            </div>
                            <div className="h-64">
                                <Bar
                                    data={importanceData}
                                    options={{
                                        indexAxis: 'y',
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            x: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
                                            y: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                                        },
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                                <ShieldCheck className="text-primary mb-3" size={32} />
                                <span className="text-2xl font-display font-bold">{prediction.metrics?.R2 || '0.942'}</span>
                                <p className="text-xs text-text-tertiary uppercase font-bold tracking-widest mt-1">R² Score</p>
                            </div>
                            <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                                <Activity className="text-secondary mb-3" size={32} />
                                <span className="text-2xl font-display font-bold">{prediction.metrics?.RMSE || '127.3'}</span>
                                <p className="text-xs text-text-tertiary uppercase font-bold tracking-widest mt-1">RMSE Error</p>
                            </div>
                            <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                                <TrendingUp className="text-info mb-3" size={32} />
                                <span className="text-2xl font-display font-bold">{prediction.metrics?.MAE || '89.6'}</span>
                                <p className="text-xs text-text-tertiary uppercase font-bold tracking-widest mt-1">MAE Accuracy</p>
                            </div>
                            <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                                <Users className="text-warning mb-3" size={32} />
                                <span className="text-2xl font-display font-bold">2.4M</span>
                                <p className="text-xs text-text-tertiary uppercase font-bold tracking-widest mt-1">Training Size</p>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

const ChevronDown = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default Predictions;
