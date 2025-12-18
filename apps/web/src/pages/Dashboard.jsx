import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, BarChart2, Zap, Layers, LogOut, CheckSquare, Download } from 'lucide-react';
import { RetroCard, RetroButton } from '../components/RetroUI';
import { supabase } from '../lib/supabase';

function notifyExtensionUserId(userId) {
    try {
        window.dispatchEvent(new CustomEvent('SMART_TIME_TRACKER_AUTH', {
            detail: { user_id: userId }
        }));
        return true;
    } catch (e) {
        return false;
    }
}

export default function Dashboard({ session }) {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState([]);
    const [totalTime, setTotalTime] = useState(0);
    const [chartData, setChartData] = useState([]);

    // New Feature: Hourly Heatmap
    const [hourlyStats, setHourlyStats] = useState([]);

    // Date Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [isExtensionConnected, setIsExtensionConnected] = useState(false);

    useEffect(() => {
        const userId = session?.user?.id;
        if (!userId) return;
        document.body.setAttribute('data-smart-tracker-user-id', userId);
        const checkFlag = () => {
            if (document.documentElement.getAttribute('data-smart-tracker-installed') === 'true') {
                setIsExtensionConnected(true);
                return true;
            }
            return false;
        };
        const flagInterval = setInterval(() => {
            if (checkFlag()) dispatchAuth();
        }, 1000);
        const dispatchAuth = () => {
            try {
                window.dispatchEvent(new CustomEvent('SMART_TIME_TRACKER_AUTH', {
                    detail: { user_id: userId }
                }));
            } catch (e) {
                console.warn('Failed to dispatch auth event:', e);
            }
        };
        dispatchAuth();
        const timeout = setTimeout(() => clearInterval(flagInterval), 5000);
        return () => {
            document.body.removeAttribute('data-smart-tracker-user-id');
            clearInterval(flagInterval);
            clearTimeout(timeout);
        };
    }, [session?.user?.id]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [session, dateRange]); // Re-fetch when dateRange changes

    const fetchLogs = async () => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/logs?user_id=${session?.user?.id}`;
            if (dateRange.start) url += `&start_date=${dateRange.start}`;
            if (dateRange.end) url += `&end_date=${dateRange.end}`;

            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                processLogs(data);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    };

    const processLogs = (data) => {
        const grouped = {};
        let total = 0;
        const timeline = {};
        const hours = Array(24).fill(0);

        data.forEach(log => {
            // 1. Domain Grouping
            const domain = log.domain;
            if (!grouped[domain]) grouped[domain] = 0;
            grouped[domain] += log.duration;
            total += log.duration;

            // 2. Date Grouping
            const date = log.created_at ? log.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
            if (!timeline[date]) timeline[date] = 0;
            timeline[date] += log.duration;

            // 3. Hour Breakdown (Local Time)
            const d = new Date(log.created_at || new Date());
            const h = d.getHours();
            if (h >= 0 && h < 24) {
                hours[h] += log.duration;
            }
        });

        const sortedStats = Object.keys(grouped)
            .map(domain => ({
                app: domain,
                duration: grouped[domain],
                time: formatDuration(grouped[domain]),
                percent: total > 0 ? Math.round((grouped[domain] / total) * 100) : 0,
                color: getColor(domain)
            }))
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5);

        const chart = Object.keys(timeline).sort().map(date => ({
            name: date,
            minutes: Math.round(timeline[date] / 60)
        }));

        // Hourly Data Processing
        const maxHour = Math.max(...hours, 1);
        const hourlyData = hours.map((seconds, h) => ({
            hour: h,
            label: h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`,
            seconds,
            // Calculate intensity 1-5 relative to max, or 0 if empty
            intensity: seconds === 0 ? 0 : Math.ceil((seconds / maxHour) * 5)
        }));

        setStats(sortedStats);
        setTotalTime(total);
        setLogs(data);
        setChartData(chart);
        setHourlyStats(hourlyData);
    };

    // ... existing formatDuration, getColor, handleGeneratePairingCode ...
    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const getColor = (domain) => {
        const colors = ['bg-retro-accent', 'bg-retro-secondary', 'bg-retro-primary'];
        return colors[domain.length % colors.length];
    };

    const handleExport = () => {
        if (!logs || logs.length === 0) return;

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Domain,Duration (Seconds),Date,Time Logged\n";

        // CSV Rows
        logs.forEach(log => {
            const date = log.created_at ? log.created_at.split('T')[0] : '';
            const time = log.created_at ? new Date(log.created_at).toLocaleTimeString() : '';
            const safeDomain = log.domain.replace(/,/g, ''); // Simple escape
            csvContent += `${safeDomain},${log.duration},${date},${time}\n`;
        });

        // Download Trigger
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `smart_time_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
            {/* ... Header ... */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black bg-white inline-block px-2 border-2 border-retro-border shadow-retro-hover transform -rotate-1">
                        DASHBOARD
                    </h1>
                    <p className="font-bold mt-2 text-gray-600">
                        Welcome, {session?.user?.email}
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-white border-2 border-black p-2 font-mono text-xs">
                        ID: {session?.user?.id.slice(0, 8)}...
                    </div>
                    <RetroButton onClick={() => supabase.auth.signOut()} className="!py-1 !px-3 text-sm">
                        <LogOut size={16} />
                    </RetroButton>
                </div>
            </div>

            {/* ... Connection Status ... */}
            {isExtensionConnected ? (
                <div className="bg-green-100 border-2 border-black p-4 mb-4 space-y-4 shadow-retro">
                    <div>
                        <strong>Extension Connected:</strong> Your session is authorized and tracking time.
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white px-3 py-2 border-2 border-black font-black text-lg flex items-center gap-2">
                            <CheckSquare size={20} />
                            CONNECTED
                        </div>
                        <div className="text-xs font-bold text-green-800">
                            Updates automatically
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-100 border-2 border-black p-4 mb-4 space-y-2 shadow-retro">
                    <div>
                        <strong>Extension Not Connected:</strong> Please install the Smart Time Tracker extension.
                    </div>
                    <div className="text-sm font-bold text-gray-700">
                        Once installed, just reload this page and it should connect automatically.
                    </div>
                </div>
            )}

            {/* Filters */}
            <RetroCard>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold uppercase mb-1 block">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="date"
                                className="w-full bg-white border-2 border-black p-2 pl-8 font-mono text-sm focus:outline-none focus:shadow-retro-hover transition-all"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold uppercase mb-1 block">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="date"
                                className="w-full bg-white border-2 border-black p-2 pl-8 font-mono text-sm focus:outline-none focus:shadow-retro-hover transition-all"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                    <RetroButton
                        onClick={() => setDateRange({ start: '', end: '' })}
                        className="h-10 text-sm whitespace-nowrap"
                        disabled={!dateRange.start && !dateRange.end}
                    >
                        <Filter size={14} className="mr-2" /> Clear
                    </RetroButton>
                    <RetroButton
                        onClick={handleExport}
                        className="h-10 text-sm whitespace-nowrap !bg-retro-secondary text-white"
                        disabled={!logs || logs.length === 0}
                    >
                        <Download size={14} className="mr-2" /> Export
                    </RetroButton>
                </div>
            </RetroCard>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Stats */}
                <RetroCard className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-retro-border pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BarChart2 /> Focus Overview
                        </h2>
                        <span className="font-mono font-bold text-2xl">{formatDuration(totalTime)}</span>
                    </div>

                    {/* Chart */}
                    <div className="h-64 w-full border-2 border-black bg-white p-2" style={{ minHeight: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData && chartData.length > 0 ? chartData : [{ name: 'Today', minutes: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Area type="monotone" dataKey="minutes" stroke="#000" fill="#a78bfa" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase">Top Applications</h3>
                        {stats.length === 0 ? (
                            <div className="text-center py-8 font-bold text-gray-400">
                                No activity recorded yet.<br />Ensure the extension is connected.
                            </div>
                        ) : (
                            stats.map((item) => (
                                <div key={item.app} className="space-y-1">
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{item.app}</span>
                                        <span>{item.time}</span>
                                    </div>
                                    <div className="w-full h-8 border-2 border-retro-border bg-white relative p-1">
                                        <div
                                            className={`h-full ${item.color} border-r-2 border-retro-border`}
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </RetroCard>

                {/* Side Stats */}
                <div className="space-y-6">
                    <RetroCard className="!bg-retro-secondary text-white">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Zap /> Productivity Pulse
                        </h3>
                        <div className="text-5xl font-black mb-2">
                            {totalTime > 0 ? (Math.round((stats.length / (logs.length || 1)) * 80) + 20) + '%' : '-%'}
                        </div>
                    </RetroCard>

                    {/* New Peak Hours Card */}
                    <RetroCard>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            Peak Hours (24H)
                        </h3>
                        <div className="h-32 flex items-end justify-between gap-[2px] w-full">
                            {hourlyStats.length > 0 ? hourlyStats.map((stat) => (
                                <div key={stat.hour} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                                    {/* Tooltip */}
                                    <div className="hidden group-hover:block absolute bottom-full mb-1 bg-black text-white text-[10px] px-1 py-0.5 whitespace-nowrap z-20 font-mono pointer-events-none">
                                        {stat.label}: {Math.round(stat.seconds / 60)}m
                                    </div>

                                    {/* Bar - Use green intensities */}
                                    <div
                                        className={`w-full transition-all duration-300 hover:opacity-80
                                            ${stat.intensity === 0 ? 'bg-gray-100 h-px' : ''}
                                            ${stat.intensity === 1 ? 'bg-green-200' : ''}
                                            ${stat.intensity === 2 ? 'bg-green-400' : ''}
                                            ${stat.intensity === 3 ? 'bg-green-600' : ''}
                                            ${stat.intensity >= 4 ? 'bg-black' : ''}
                                        `}
                                        style={{
                                            height: stat.intensity === 0 ? '4px' : `${Math.max(10, (stat.intensity / 5) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                            )) : (
                                <div className="w-full text-center text-xs text-gray-400 self-center">No data</div>
                            )}
                        </div>
                        <div className="flex justify-between text-[10px] font-mono mt-2 text-gray-500 font-bold uppercase">
                            <span>12am</span>
                            <span>6am</span>
                            <span>12pm</span>
                            <span>6pm</span>
                        </div>
                    </RetroCard>

                    <RetroCard>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Layers /> History
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto text-sm pr-2 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-black">
                                        <th className="py-1">Site</th>
                                        <th className="py-1 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, i) => (
                                        <tr key={i} className="border-b border-dashed border-gray-300">
                                            <td className="py-2 truncate max-w-[120px] font-bold" title={log.domain}>{log.domain}</td>
                                            <td className="py-2 text-right font-mono text-gray-600">{Math.round(log.duration)}s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </RetroCard>
                </div>
            </div>
        </div>
    );
}
