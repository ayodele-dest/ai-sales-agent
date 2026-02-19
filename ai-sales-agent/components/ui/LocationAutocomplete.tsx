'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface NominatimResult {
    place_id: number;
    display_name: string;
    type: string;
    addresstype: string;
    address: {
        city?: string;
        town?: string;
        county?: string;
        state?: string;
        country?: string;
        country_code?: string;
    };
}

interface Props {
    value: string;
    onChange: (value: string) => void;
}

// Format a Nominatim result into a clean short label
function formatLocation(result: NominatimResult): string {
    const a = result.address;
    const parts: string[] = [];

    const city = a.city || a.town || a.county;
    if (city) parts.push(city);
    if (a.state) parts.push(a.state);
    if (a.country) parts.push(a.country);

    return parts.length > 0 ? parts.join(', ') : result.display_name.split(',').slice(0, 2).join(',').trim();
}

export function LocationAutocomplete({ value, onChange }: Props) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Update local input if external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) { setSuggestions([]); setOpen(false); return; }
        setLoading(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=7&addressdetails=1&featuretype=settlement`;
            const res = await fetch(url, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'SalesAgentAI/1.0' },
            });
            const data: NominatimResult[] = await res.json();

            // De-duplicate by formatted label
            const seen = new Set<string>();
            const unique = data.filter(r => {
                const label = formatLocation(r);
                if (seen.has(label)) return false;
                seen.add(label);
                return true;
            });

            setSuggestions(unique);
            setOpen(unique.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };


    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val); // keep parent in sync with raw text too

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
    };

    const select = (result: NominatimResult) => {
        const label = formatLocation(result);
        setInputValue(label);
        onChange(label);
        setOpen(false);
        setSuggestions([]);
    };

    const clear = () => {
        setInputValue('');
        onChange('');
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInput}
                    onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
                    placeholder="Start typing a city, state, or country..."
                    autoComplete="off"
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                    {inputValue && !loading && (
                        <button type="button" onClick={clear} className="p-0.5 hover:bg-white/10 rounded-md transition-colors">
                            <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {open && suggestions.length > 0 && (
                <ul className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                    {suggestions.map(result => (
                        <li key={result.place_id}>
                            <button
                                type="button"
                                onClick={() => select(result)}
                                className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-500/10 transition-colors group"
                            >
                                <MapPin className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                                <div>
                                    <span className="text-sm text-gray-200 group-hover:text-white transition-colors">{formatLocation(result)}</span>
                                    <span className="block text-xs text-gray-600 truncate max-w-xs">{result.display_name}</span>
                                </div>
                            </button>
                        </li>
                    ))}
                    <li className="px-4 py-1.5 border-t border-white/5 mt-1">
                        <span className="text-xs text-gray-700">Powered by OpenStreetMap</span>
                    </li>
                </ul>
            )}
        </div>
    );
}
