'use client';

import { Terminal } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function StatusLog({ logs }: { logs: string[] }) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-black/60 border border-white/5 text-green-400 font-mono text-xs p-4 rounded-2xl h-full flex flex-col shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3 text-gray-600 uppercase text-xs tracking-widest">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <Terminal className="w-3.5 h-3.5 ml-2" />
                <span>Agent Terminal</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide pr-1">
                {logs.length === 0 && (
                    <div className="text-gray-700 italic">Awaiting instructions...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 break-words">
                        <span className="text-gray-700 shrink-0 tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={log.startsWith('✅') ? 'text-emerald-400' : log.startsWith('Error') ? 'text-red-400' : 'text-green-400'}>
                            {'>'} {log}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
