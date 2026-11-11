import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoFill = () => {
    setEmail('admin@freshbunch.com');
    setPassword('admin123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        adminLogin(data.user, data.token);
        navigate('/admin');
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-900/50">
            🌸
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Freshbunch Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Restricted access for store managers and order fulfillers.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-900/50 border border-red-700 text-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@freshbunch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-2xl px-4 py-3 pl-10 text-xs font-semibold text-white focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-2xl px-4 py-3 pl-10 text-xs font-semibold text-white focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Fill Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-950/60 border border-rose-800/80 px-4 py-2 rounded-xl transition"
            >
              ⚡ Quick Fill Demo Admin Credentials
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-700/80 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
            ← Back to Customer Website
          </Link>
        </div>

      </div>
    </div>
  );
}
