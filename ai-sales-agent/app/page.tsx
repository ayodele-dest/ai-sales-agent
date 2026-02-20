'use client';

import Link from 'next/link';
import { Bot, ArrowRight, Sparkles, Globe, Zap, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    { icon: Globe, label: 'Lead Discovery', desc: 'AI finds qualified businesses in any industry & location' },
    { icon: Zap, label: 'Contact Enrichment', desc: 'Automatically uncovers decision-maker emails and roles' },
    { icon: Mail, label: 'Auto Outreach', desc: 'Sends personalized emails using your custom template' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg"><Bot className="w-5 h-5" /></div>
          <span className="font-bold text-lg">SalesAgent AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth">
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Sign In</button>
          </Link>
          <Link href="/auth">
            <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            Automated Sales Development Representative
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight leading-none">
            Build a predictable pipeline<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">without hiring an SDR.</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Define your ideal client once. SalesAgent finds verified decision-makers and launches personalized outreach safely using your own mailbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/auth">
              <button className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-8 py-4 rounded-xl font-semibold text-lg border border-white/10 hover:bg-white/5 text-gray-300 transition-all">
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-24 max-w-4xl w-full"
        >
          {features.map((f, i) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-all">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit mb-4">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{f.label}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
