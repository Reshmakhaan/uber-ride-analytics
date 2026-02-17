import React, { useEffect, useState } from 'react';
import { PieChart, TrendingUp, MapPin, Clock, Zap, Lightbulb, ChevronRight, BarChart3, Radar, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import client from '../api/client';
import { Bar, Radar as RadarChart } from 'react-chartjs-2';

const Insights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/insights')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-primary font-display text-center py-20 flex flex-col items-center gap-4">
        <Zap className="animate-spin text-primary" size={40} />
        Extracting Insights...
    </div>;

    if (!data || !data.insights || !data.trip_duration) return (
        <div className="text-critical font-display text-center py-20 bg-critical/5 border border-critical/20 rounded-2xl">
            <ShieldAlert className="mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Error: Fragmented Data</h3>
            <p className="text-sm opacity-70">Unable to reconstruct operational patterns. Please verify API stability.</p>
        </div>
    );


    const getThemeColors = (type) => {
        switch (type) {
            case 'emerald': return { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: 'bg-primary/20' };
            case 'violet': return { bg: 'bg-secondary/10', border: 'border-secondary/20', text: 'text-secondary', icon: 'bg-secondary/20' };
            case 'amber': return { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', icon: 'bg-warning/20' };
            case 'cyan': return { bg: 'bg-info/10', border: 'border-info/20', text: 'text-info', icon: 'bg-info/20' };
            default: return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white', icon: 'bg-white/10' };
        }
    };

    const radarData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Demand Intensity',
            data: data.weekly_pattern,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            borderWidth: 2,
        }]
    };

    return (
        <div className="space-y-8 pb-12">
            <section>
                <h2 className="text-2xl font-display font-bold mb-2">Operational Insights</h2>
                <p className="text-text-secondary font-body">Deep dive into ride patterns and efficiency metrics.</p>
            </section>

            {/* Distribution Charts */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GlassCard>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-primary" />
                        <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">Trip Duration</span>
                    </div>
                    <div className="h-48">
                        <Bar
                            data={{
                                labels: ['0-10', '10-20', '20-30', '30-45', '45-60', '60+'],
                                datasets: [{ label: 'Trips', data: data.trip_duration, backgroundColor: '#10b981', borderRadius: 4 }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } } } }}
                        />
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-secondary" />
                        <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">Trip Distance</span>
                    </div>
                    <div className="h-48">
                        <Bar
                            data={{
                                labels: ['0-2', '2-5', '5-10', '10-15', '15-20', '20+'],
                                datasets: [{ label: 'Trips', data: data.trip_distance, backgroundColor: '#8b5cf6', borderRadius: 4 }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } } } }}
                        />
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-warning" />
                        <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">Weekly Pattern</span>
                    </div>
                    <div className="h-48">
                        <RadarChart data={radarData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#9ca3af', font: { size: 9 } }, ticks: { display: false } } },
                            plugins: { legend: { display: false } }
                        }} />
                    </div>
                </GlassCard>
            </section>

            {/* Key Insight Cards */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {data.insights.map((insight, i) => {
                    const theme = getThemeColors(insight.type);
                    return (
                        <GlassCard key={i} className={`border-none ${theme.bg}`}>
                            <div className="flex flex-col gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.icon}`}>
                                    <Lightbulb size={20} className={theme.text} />
                                </div>
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme.text}`}>{insight.title}</h4>
                                    <p className="text-[12px] leading-relaxed text-text-secondary">{insight.desc}</p>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </section>

            {/* Actionable Recommendations */}
            <section className="space-y-6">
                <h3 className="font-display font-semibold text-lg">Actionable Recommendations</h3>
                <div className="space-y-4">
                    {[
                        { id: 1, type: 'emerald', title: 'Dynamic Workforce Rebalancing', desc: 'Predictive models show a 15% supply gap in Brooklyn during weekend late-night hours. Recommend incentivizing 40-50 drivers to relocate from Manhattan.', impact: 'High Impact', value: 'Est. +$12,400/day revenue' },
                        { id: 2, type: 'violet', title: 'Route Optimization Strategy', desc: 'Average trip duration from JFK to Midtown has increased by 12%. Suggest alternative routing signals for driver apps to bypass current construction zones.', impact: 'Medium Impact', value: '-2.3 min avg wait time' },
                        { id: 3, type: 'amber', title: 'Customer Satisfaction Program', desc: 'Wait times in Queens exceed the NYC average by 4 minutes during peak hours. Launching a "Quick-Pick" incentive program could improve local retention.', impact: 'Strategic', value: '+8% rider satisfaction' }
                    ].map((rec) => {
                        const theme = getThemeColors(rec.type);
                        return (
                            <GlassCard key={rec.id} className="flex flex-col md:flex-row gap-6 p-6 items-start md:items-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.icon}`}>
                                    <span className={`text-xl font-display font-bold ${theme.text}`}>{rec.id}</span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="font-display font-bold text-lg">{rec.title}</h4>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${theme.bg} ${theme.border} ${theme.text}`}>
                                            {rec.impact}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">{rec.desc}</p>
                                </div>
                                <div className="shrink-0 pt-2 md:pt-0">
                                    <div className={`px-4 py-2 rounded-xl text-xs font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                                        {rec.value}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Insights;
