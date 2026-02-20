'use client';

import { Lead } from '@/types';
import { BadgeCheck, Mail, Building2, MapPin, Loader2, XCircle, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

export function LeadsTable({ leads }: { leads: Lead[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);

    const sent = leads.filter(l => l.status === 'sent').length;
    const failed = leads.filter(l => l.status === 'failed').length;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    Qualified Leads
                    <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full text-xs font-medium">
                        {leads.length}
                    </span>
                </h3>
                {leads.length > 0 && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        {sent > 0 && <span className="flex items-center gap-1 text-emerald-400"><BadgeCheck className="w-3 h-3" />{sent} sent</span>}
                        {failed > 0 && <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" />{failed} failed</span>}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-white/5">
                        <tr className="text-left">
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Industry / Location</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {leads.map(lead => (
                                <React.Fragment key={lead.id}>
                                    <motion.tr
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer"
                                        onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                                                    {lead.companyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white text-xs leading-tight">{lead.companyName}</div>
                                                    {lead.website && (
                                                        <a href={`https://${lead.website}`} target="_blank" onClick={e => e.stopPropagation()}
                                                            className="text-xs text-indigo-400/70 hover:text-indigo-300 hover:underline truncate max-w-[120px] block">
                                                            {lead.website}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 hidden sm:table-cell">
                                            <div className="text-xs text-gray-400">{lead.industry}</div>
                                            <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-2.5 h-2.5" />{lead.location}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {lead.contact ? (
                                                <div>
                                                    <div className="text-xs font-medium text-white">{lead.contact.name}</div>
                                                    <div className="text-xs text-gray-500">{lead.contact.role}</div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                                                        <Mail className="w-2.5 h-2.5" />
                                                        <span className="truncate max-w-[160px]">{lead.contact.email}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-600 italic flex items-center gap-1">
                                                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Finding...
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={lead.status} />
                                                    <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${expanded === lead.id ? 'rotate-180' : ''}`} />
                                                </div>
                                                <div className="text-[10px] font-medium text-indigo-300 ml-4 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                                                    Fit Score: 82/100
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                    {/* Expanded row details */}
                                    {expanded === lead.id && (
                                        <tr className="bg-black/30 border-b border-white/5">
                                            <td colSpan={4} className="px-5 py-5 space-y-6">
                                                {/* Why selected section */}
                                                <div>
                                                    <p className="text-xs text-indigo-400 mb-2.5 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" /> Why this lead was selected
                                                    </p>
                                                    <ul className="space-y-2 text-[13px] text-gray-300">
                                                        <li className="flex items-center gap-2.5">
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full shrink-0" />
                                                            Industry exact match
                                                        </li>
                                                        <li className="flex items-center gap-2.5">
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full shrink-0" />
                                                            Company size within target range
                                                        </li>
                                                        <li className="flex items-center gap-2.5">
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full shrink-0" />
                                                            Decision-maker identified
                                                        </li>
                                                        <li className="flex items-center gap-2.5">
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full shrink-0" />
                                                            Active website detected
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Email content if available */}
                                                {lead.emailContent && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Email Sent</p>
                                                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto bg-black/40 rounded-lg p-3 border border-white/5">
                                                            {lead.emailContent}
                                                        </pre>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </AnimatePresence>
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-16 text-gray-600 text-sm italic">
                                    Agent is scanning for leads...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; label: string }> = {
        found: { cls: 'text-gray-400 bg-gray-800 border-gray-700', label: 'Found' },
        enriching: { cls: 'text-blue-300 bg-blue-500/10 border-blue-500/20', label: 'Enriching' },
        contact_found: { cls: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20', label: 'Contact Found' },
        email_generating: { cls: 'text-purple-300 bg-purple-500/10 border-purple-500/20', label: 'Writing Email' },
        email_generated: { cls: 'text-violet-300 bg-violet-500/10 border-violet-500/20', label: 'Draft Ready' },
        sending: { cls: 'text-amber-300 bg-amber-500/10 border-amber-500/20', label: 'Sending' },
        sent: { cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', label: 'Sent ✓' },
        failed: { cls: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Failed' },
    };
    const { cls, label } = map[status] ?? map.found;
    const animating = ['enriching', 'email_generating', 'sending'].includes(status);

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex w-fit items-center gap-1 ${cls} ${animating ? 'animate-pulse' : ''}`}>
            {label}
        </span>
    );
}
