import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RetroCard, RetroButton } from '../components/RetroUI';
import { Clock, Zap, Shield, BarChart2, MousePointer, Activity, Eye, Linkedin, Github } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Landing() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ count: 0, gmailCount: 0, newToday: 0, visitCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Add timestamp to prevent caching
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/user-count?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        const recordVisit = async () => {
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/stats/visit`, { method: 'POST' });
            } catch (err) {
                console.error("Failed to record visit:", err);
            }
        };

        fetchStats();
        recordVisit();
    }, []);

    const userCount = stats.count;

    return (
        <div className="min-h-screen bg-retro-bg font-mono overflow-x-hidden">
            {/* Navbar */}
            <nav className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-50 relative">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 transform -rotate-2"
                >
                    <img src="/nono.png" alt="Logo" className="w-10 h-10 border-2 border-black shadow-retro" />
                    <span className="text-2xl font-black bg-white inline-block px-2 border-2 border-black shadow-retro">
                        NONO
                    </span>
                </motion.div>
                <div className="flex gap-4">
                    <RetroButton variant="white" onClick={() => navigate('/login')}>Login</RetroButton>
                    <RetroButton onClick={() => navigate('/login')}>Start Free</RetroButton>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative w-full max-w-5xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                {/* Decorative Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [5, 10, 5] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-10 left-10 md:left-0 hidden md:block text-retro-accent"
                >
                    <Clock size={64} strokeWidth={2.5} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [-10, -5, -10] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute top-20 right-10 md:right-0 hidden md:block text-retro-primary"
                >
                    <Zap size={64} strokeWidth={2.5} />
                </motion.div>

                <motion.h1
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="text-5xl md:text-7xl font-black mb-6 bg-white border-2 border-black shadow-retro p-4 inline-block transform rotate-1 uppercase"
                >
                    SAY "NO NO"<br />TO DISTRACTION.
                </motion.h1>

                {/* User Count Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="mb-8 flex flex-col items-center gap-3"
                >
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <img
                                key={i}
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 42}`}
                                alt="User"
                                className="w-10 h-10 rounded-none border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]"
                            />
                        ))}
                        <div className="w-10 h-10 rounded-none border-2 border-black bg-retro-secondary flex items-center justify-center text-white font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                            +{userCount}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-retro-secondary text-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] transform -rotate-1">
                        <Zap size={18} className="animate-pulse" />
                        <span className="font-black text-sm uppercase tracking-wider">
                            {userCount + 100}+ BATTLE-TESTED PRODUCTIVITY WARRIORS
                        </span>
                    </div>
                </motion.div>

                <motion.p
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="text-lg md:text-xl font-bold text-gray-700 max-w-2xl mb-10 bg-yellow-100 border-2 border-black p-4 shadow-retro-hover transform -rotate-1"
                >
                    The internet is designed to steal your attention. Nono is designed to steal it back. A privacy-first, retro-brutalist time tracker that lives in your browser and tells you the harsh truth about your productivity.
                </motion.p>

                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-4"
                >
                    <RetroButton
                        onClick={() => window.open('https://github.com/OneforAll-Deku/NONO/releases/tag/v1.0.0', '_blank')}
                        className="text-xl px-10 py-4 !bg-retro-secondary text-white shadow-[6px_6px_0px_0px_#000]"
                    >
                        [ GET NONO / FREE ]
                    </RetroButton>
                    <button
                        onClick={() => document.getElementById('problem-block').scrollIntoView({ behavior: 'smooth' })}
                        className="text-retro-accent font-bold underline hover:text-black transition-colors"
                    >
                        See how it works -&gt;
                    </button>
                </motion.div>
            </header>

            {/* Problem Block */}
            <section id="problem-block" className="w-full bg-black py-20 px-6 border-y-4 border-white text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center animate-pulse-slow">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        className="text-white mb-6 animate-bounce"
                    >
                        <Eye size={64} strokeWidth={2} />
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase tracking-tighter">
                        YOUR BROWSER IS A <span className="text-retro-secondary">BLACK HOLE.</span>
                    </h2>

                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed max-w-3xl border-2 border-white p-6 shadow-[8px_8px_0px_0px_#f472b6]">
                        You open a tab for "research." Twenty minutes later you are deep in a meme scroll or reading conspiracy theories about ancient grains. It’s not entirely your fault—the web is weaponized to distract you.
                        <br /><br />
                        <span className="text-retro-secondary bg-white px-2">But it is your problem.</span> Nono stops the bleeding by showing you exactly where the time went. No sugarcoating.
                    </p>
                </div>
            </section>

            {/* Social Proof Marquee */}
            <div className="w-full bg-white border-b-4 border-black py-4 overflow-hidden select-none">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap gap-12 items-center"
                >
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-12 items-center">
                            <span className="text-2xl font-black uppercase text-retro-accent">🔥 {userCount + 150} DISTRACTION KILLERS</span>
                            <span className="text-2xl font-black uppercase text-retro-secondary">⚡ {stats.gmailCount + 80} GOOGLE SIGN-INS</span>
                            <span className="text-2xl font-black uppercase text-retro-primary">🚀 {stats.newToday + 5} JOINED TODAY</span>
                            <span className="text-2xl font-black uppercase text-green-500">👀 {stats.visitCount + 1000} TOTAL VISITS</span>
                            <span className="text-2xl font-black uppercase text-retro-accent">💎 {userCount + 150} DISTRACTION KILLERS</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Features Stagger */}
            <motion.section
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.2 }}
                className="w-full max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                <motion.div variants={fadeInUp}>
                    <RetroCard className="h-full hover:translate-y-[-5px] transition-transform">
                        <div className="bg-retro-accent text-white w-12 h-12 flex items-center justify-center border-2 border-black shadow-retro mb-4">
                            <MousePointer />
                        </div>
                        <h3 className="text-xl font-black mb-2">Automatic Tracking</h3>
                        <p className="text-sm font-bold text-gray-600">
                            No start/stop buttons. We detect your active window and track productivity automatically.
                        </p>
                    </RetroCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <RetroCard className="h-full bg-green-100 hover:translate-y-[-5px] transition-transform">
                        <div className="bg-white text-black w-12 h-12 flex items-center justify-center border-2 border-black shadow-retro mb-4">
                            <BarChart2 />
                        </div>
                        <h3 className="text-xl font-black mb-2">Retro Analytics</h3>
                        <p className="text-sm font-bold text-gray-600">
                            Visualize your focus trends with beautiful 8-bit inspired charts and heatmaps.
                        </p>
                    </RetroCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <RetroCard className="h-full hover:translate-y-[-5px] transition-transform">
                        <div className="bg-retro-primary text-black w-12 h-12 flex items-center justify-center border-2 border-black shadow-retro mb-4">
                            <Shield />
                        </div>
                        <h3 className="text-xl font-black mb-2">Privacy First</h3>
                        <p className="text-sm font-bold text-gray-600">
                            Your data lives locally and is only synced when you say so. No creepy spying.
                        </p>
                    </RetroCard>
                </motion.div>
            </motion.section>

            {/* Showcase Section */}
            <section className="w-full bg-black py-20 text-white border-y-4 border-retro-accent overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <motion.h2
                            initial={{ x: -100, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-4xl font-black mb-6 text-retro-primary"
                        >
                            SEE WHERE YOUR DAY GOES
                        </motion.h2>
                        <p className="text-lg font-bold mb-6">
                            Smart Time Tracker creates a detailed timeline of your day. Spot distractions, find your flow state, and optimize your schedule.
                        </p>
                        <ul className="space-y-4 font-bold text-retro-bg">
                            <li className="flex items-center gap-2"><Activity size={20} className="text-green-400" /> Real-time activity feed</li>
                            <li className="flex items-center gap-2"><Activity size={20} className="text-green-400" /> Daily Focus Score</li>
                            <li className="flex items-center gap-2"><Activity size={20} className="text-green-400" /> Exportable reports</li>
                        </ul>
                    </div>
                    <motion.div
                        initial={{ scale: 0.8, rotate: 5 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        className="flex-1"
                    >
                        <div className="bg-white text-black p-4 border-4 border-retro-primary shadow-[8px_8px_0px_0px_#fff]">
                            <img
                                src="/dashboard-preview.png"
                                alt="Dashboard Preview"
                                className="w-full h-auto border-2 border-black"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full max-w-6xl mx-auto p-10 text-center">
                <h2 className="text-3xl font-black mb-8">Ready to reclaim your time?</h2>
                <RetroButton onClick={() => navigate('/login')} className="bg-retro-accent text-white px-8 py-3 text-lg">
                    Join the Beta
                </RetroButton>
                <div className="mt-12 flex flex-col items-center gap-4">
                    <p className="text-sm font-bold text-gray-600">
                        Made by <span className="text-black font-black bg-white border-2 border-black px-1 shadow-[2px_2px_0px_0px_#000]">Pratyaksh</span>
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="https://www.linkedin.com/in/pratykash-raj-singh-a33aa9325?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2 border-2 border-black shadow-retro hover:translate-y-[2px] hover:shadow-none transition-all text-blue-600"
                        >
                            <Linkedin size={20} />
                        </a>
                        <a
                            href="https://github.com/OneforAll-Deku/NONO"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2 border-2 border-black shadow-retro hover:translate-y-[2px] hover:shadow-none transition-all text-black"
                        >
                            <Github size={20} />
                        </a>
                    </div>
                    <div className="text-xs font-bold text-gray-400 mt-4">
                        © 2025 Smart Time Tracker.
                    </div>
                </div>
            </footer>
        </div>
    );
}
