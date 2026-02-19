'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import BUSINESS_TYPES from '@/lib/business-types';

// Deduplicate once at module load — prevents React duplicate-key warnings
const UNIQUE_TYPES = Array.from(new Set(BUSINESS_TYPES));

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export function BusinessTypeSelect({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = query.length < 1
        ? UNIQUE_TYPES
        : UNIQUE_TYPES.filter(b => b.toLowerCase().includes(query.toLowerCase()));

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const select = (type: string) => {
        onChange(type);
        setOpen(false);
        setQuery('');
    };

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setQuery('');
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-left flex items-center justify-between gap-2 hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
                <span className={value ? 'text-white' : 'text-gray-600'}>
                    {value || 'Select or search a business type'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {value && (
                        <span onClick={clear} className="p-0.5 hover:bg-white/10 rounded-md transition-colors">
                            <X className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-white/10 sticky top-0 bg-gray-900">
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2 border border-white/10">
                            <Search className="w-4 h-4 text-gray-500 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search business types..."
                                className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1"
                            />
                            {query && (
                                <button onClick={() => setQuery('')}>
                                    <X className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Count */}
                    <div className="px-3 py-1.5 text-xs text-gray-600 border-b border-white/5">
                        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                    </div>

                    {/* List */}
                    <ul className="max-h-56 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-700">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-gray-500 italic">No matches found</li>
                        ) : (
                            filtered.map((type, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => select(type)}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2 hover:bg-indigo-500/10 transition-colors ${value === type ? 'text-indigo-400 bg-indigo-500/5' : 'text-gray-200'}`}
                                    >
                                        {type}
                                        {value === type && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
