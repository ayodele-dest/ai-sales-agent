'use client';

import { motion } from 'framer-motion';
import { Bot, Zap, Globe, Mail, CheckCircle } from 'lucide-react';

export function AgentCard({ status, currentAction }: {
    status: 'idle' | 'working' | 'completed';
    currentAction: string;
}) {
    const isWorking = status === 'working';
    const isDone = status === 'completed';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent border border-indigo-500/20 p-5">
            {/* Ambient glow */}
            <motion.div
                animate={{ opacity: isWorking ? [0.15, 0.4, 0.15] : 0.12, scale: isWorking ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ opacity: isWorking ? [0.1, 0.3, 0.1] : 0.08, scale: isWorking ? [1, 1.5, 1] : 1 }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500 rounded-full blur-3xl pointer-events-none"
            />

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl border transition-all ${isWorking ? 'bg-indigo-500/20 border-indigo-500/40' : isDone ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'}`}>
                    {isDone ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Bot className={`w-6 h-6 ${isWorking ? 'text-indigo-300' : 'text-gray-400'}`} />}
                </div>
                <div>
                    <h2 className="font-bold text-white text-base leading-tight">Sales Agent AI</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${isWorking ? 'bg-green-400 animate-pulse' : isDone ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                        <span className="text-xs text-gray-400">
                            {status === 'idle' ? 'Standby' : status === 'working' ? 'Active & Processing' : 'Mission Complete'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sub-agent trio */}
            <div className="relative grid grid-cols-3 gap-2 mb-4">
                {[
                    { icon: Globe, label: 'Finder', match: ['Search', 'Finding', 'Scraping'] },
                    { icon: Zap, label: 'Enricher', match: ['Enrich', 'Contact', 'Qualifying'] },
                    { icon: Mail, label: 'Outreach', match: ['Email', 'Send', 'Writing'] },
                ].map(({ icon: Icon, label, match }) => {
                    const active = isWorking && match.some(m => currentAction.includes(m));
                    return (
                        <div key={label} className={`flex flex-col items-center py-3 rounded-xl border transition-all ${active ? 'bg-indigo-500/15 border-indigo-500/30' : 'bg-white/5 border-white/5'}`}>
                            <Icon className={`w-4 h-4 mb-1.5 transition-all ${active ? 'text-indigo-300 animate-pulse' : 'text-gray-600'}`} />
                            <span className="text-xs text-gray-500">{label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Current action */}
            <div className="relative bg-black/30 rounded-xl px-3 py-2 border border-white/5">
                <p className="text-xs text-gray-400 truncate">
                    {isWorking && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse align-middle" />}
                    {currentAction || 'Initializing...'}
                </p>
            </div>
        </div>
    );
}
