import React, { useState } from 'react';
import { Save, CheckCircle, Shield, Bell, Key, ExternalLink, Eye, EyeOff, User, Lock, RefreshCw, Smartphone, Mail, Globe, Building2, Layout } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (p) => (
  <input {...p} className={`w-full px-5 py-4 border-2 border-black/10 rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none text-sm font-black uppercase tracking-wide transition-all bg-black/5 hover:bg-black/[0.08] ${p.className || ''}`} />
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{children}</label>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button type="button" onClick={onChange}
    className={`relative w-16 h-9 transition-all border-2 rounded-full ${checked ? 'bg-black border-black shadow-lg shadow-black/10' : 'bg-white border-black/10 hover:border-black'}`}>
    <span className={`absolute top-1 w-6 h-6 border-2 rounded-full transition-all duration-300 ${checked ? 'right-1.5 left-auto bg-white border-black scale-110 shadow-md' : 'left-1.5 bg-black/5 border-black/5'}`} />
  </button>
);

interface SettingsSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  subtitle?: string;
  isDanger?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children, subtitle, isDanger }) => (
  <div className={`bg-white border-2 rounded-[2rem] p-10 md:p-12 transition-all duration-500 animate-fade-in ${isDanger ? 'border-red-600 shadow-xl shadow-red-600/5 bg-red-50/10' : 'border-black/5 hover:border-black shadow-sm hover:shadow-2xl'}`}>
    <div className="flex items-center gap-4 mb-10">
      <div className={`p-4 rounded-2xl ${isDanger ? 'bg-red-600' : 'bg-black'} text-white shadow-xl`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${isDanger ? 'text-red-600/60' : 'text-black/40'}`}>{subtitle || 'CONFIGURATION'}</p>
        <h3 className={`text-2xl font-black uppercase tracking-tighter ${isDanger ? 'text-red-900' : 'text-black'}`}>{title}</h3>
      </div>
    </div>
    {children}
  </div>
);

const AdminSettingsPage: React.FC = () => {
  const { user } = useAdminAuth();

  // Password change
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState({ newBooking: true, newEnquiry: true, cancellation: true });
  const [notifSaved, setNotifSaved] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'Credentials Mismatch: Passwords do not match' }); return; }
    if (newPwd.length < 6) { setPwdMsg({ type: 'error', text: 'Security Violation: Password must be at least 6 characters' }); return; }
    setPwdLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg({ type: 'success', text: 'System Record Updated: Password changed successfully' });
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        setPwdMsg({ type: 'error', text: data.error || 'Access Denied: Failed to change password' });
      }
    } catch {
      setPwdMsg({ type: 'error', text: 'Network Protocol Error: Check backend sync status' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-xl text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Infrastructure</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-black">
            SETTINGS
          </h1>
          <p className="text-black/60 text-sm mt-4 max-w-md font-medium tracking-wide">
            Control your infrastructure credentials, security layers, and network notifications.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="group p-4 border-2 border-black/10 text-black/40 hover:border-black hover:text-black transition-all rounded-2xl">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="grid gap-12">
        {/* Account Meta Section */}
        <SettingsSection title="ADMIN ACCOUNT" icon={User} subtitle="Master Record">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-3xl">
              <Label>System Identity</Label>
              <div className="p-4 bg-white border-2 border-black text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">{user?.username || 'admin'}</div>
            </div>
            <div className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-3xl">
              <Label>Access Protocol</Label>
              <div className="p-4 bg-white border-2 border-black/5 text-sm font-black uppercase tracking-widest rounded-xl opacity-60">{user?.role || 'SUPER_ADMIN'}</div>
            </div>
            <div className="p-8 bg-black/10 border-2 border-black rounded-3xl flex flex-col justify-center items-center shadow-xl shadow-black/5">
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-green-500/50 shadow-lg" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Operational</span>
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-black/40">Status Check: Nominal</p>
            </div>
          </div>
        </SettingsSection>

        {/* Security / Password Section */}
        <SettingsSection title="SECURITY PROTOCOLS" icon={Lock} subtitle="Credentials">
          <form onSubmit={handlePasswordChange} className="space-y-10 max-w-2xl px-2">
            {pwdMsg && (
              <div className={`p-6 border-2 text-[11px] font-black uppercase tracking-widest rounded-2xl animate-scale-in flex items-center gap-4 ${pwdMsg.type === 'success' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'}`}>
                <div className={`p-2 rounded-full ${pwdMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                   {pwdMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                {pwdMsg.text}
              </div>
            )}
            
            <div className="space-y-8">
              <div>
                <Label>Current Master Access Key</Label>
                <div className="relative group">
                  <Inp type={showPwd ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required placeholder="••••••••" className="pr-16" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg border-2 border-black/5 hover:border-black transition-all">
                    {showPwd ? <EyeOff className="w-4 h-4 text-black" /> : <Eye className="w-4 h-4 text-black/40" />}
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div>
                  <Label>New Security Key</Label>
                  <Inp type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} required placeholder="MIN 6 CHARACTERS" minLength={6} />
                </div>
                <div>
                  <Label>Confirm Security Key</Label>
                  <Inp type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required placeholder="REPEAT KEY" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-black/5">
              <button type="submit" disabled={pwdLoading}
                className="group relative flex items-center gap-4 px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 disabled:opacity-50 transition-all rounded-2xl shadow-xl hover:-translate-y-1">
                {pwdLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {pwdLoading ? 'UPDATING SYSTEMS...' : 'EXECUTE RECORD UPDATE'}
              </button>
            </div>
          </form>
        </SettingsSection>

        {/* Global Notifications Section */}
        <SettingsSection title="NETWORK ALERTS" icon={Bell} subtitle="External Communication">
           <div className="space-y-6 mb-12">
              <div className="p-8 bg-black/[0.03] border-2 border-black/5 rounded-3xl flex items-center justify-between gap-10">
                 <div className="flex items-center gap-5">
                    <div className="p-3 bg-white border-2 border-black/5 rounded-2xl text-black/40"><Mail className="w-5 h-5" /></div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">SMTP Infrastructure Check</p>
                       <p className="text-xs text-black/40 font-medium tracking-wide mt-1 uppercase">Emails deployed via ZOHO CLOUD protocol</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <code className="text-[9px] font-black bg-black/5 border border-black/10 px-3 py-1 rounded-md text-black/40">ZOHO_MASTER_RELAY</code>
                 </div>
              </div>

              <div className="space-y-4 px-2">
                {[
                  { key: 'newBooking', label: 'Inbound Booking Notification', desc: 'Alert the commander of new incoming bookings' },
                  { key: 'newEnquiry', label: 'External Confirmation Protocol', desc: 'Auto-reply verify user credentials' },
                  { key: 'cancellation', label: 'Network status sync', desc: 'Broadcast status shifts to nodes' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-8 border-2 border-black/5 hover:border-black/20 rounded-[2rem] transition-all bg-white group">
                    <div className="flex items-center gap-6">
                       <div className="w-3 h-3 bg-black/10 group-hover:bg-black rounded-full transition-all" />
                       <div>
                         <p className="text-sm font-black text-black uppercase tracking-tight">{item.label}</p>
                         <p className="text-[9px] text-black/40 mt-1 uppercase font-black tracking-widest">{item.desc}</p>
                       </div>
                    </div>
                    <Toggle checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))} />
                  </div>
                ))}
              </div>
           </div>
           
           <button onClick={() => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); }}
             className="px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 transition-all rounded-2xl flex items-center justify-center gap-3 shadow-xl">
             {notifSaved ? <CheckCircle className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
             {notifSaved ? 'PREFERENCES SYNCED' : 'SAVE PROTOCOL PREFERENCES'}
           </button>
        </SettingsSection>

        {/* Global Access Links */}
        <SettingsSection title="QUICK ACCESS" icon={ExternalLink} subtitle="Shortcuts">
          <div className="grid md:grid-cols-2 gap-6 px-2">
            {[
              { label: 'View Primary Showreel', href: '/', external: true, icon: Globe },
              { label: 'Infrastructure Documentation', href: '/api-docs', external: true, icon: Shield },
              { label: 'Site Media CMS', href: '/admin/content', external: false, icon: Layout },
              { label: 'Unit Management', href: '/admin/studios', external: false, icon: Building2 },
            ].map(link => {
              const LIcon = link.icon;
              return (
                 <a key={link.label} href={link.href} target={link.external ? '_blank' : undefined} rel="noreferrer"
                  className="group flex items-center justify-between p-8 border-2 border-black/5 hover:border-black rounded-[2rem] transition-all duration-500 bg-white shadow-sm hover:shadow-2xl translate-z-0 hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-black/5 rounded-xl text-black group-hover:bg-black group-hover:text-white transition-all"><LIcon className="w-5 h-5" /></div>
                    <span className="text-sm font-black uppercase tracking-tight">{link.label}</span>
                  </div>
                  <div className="p-3 bg-black/5 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                     <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </SettingsSection>

        {/* The Danger Cluster */}
        <SettingsSection title="DANGER PROTOCOLS" icon={Key} subtitle="Critical Action Zone" isDanger>
          <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-red-600/5 border-2 border-dashed border-red-600/20 rounded-[2.5rem]">
            <div className="mb-8 md:mb-0">
              <h4 className="text-lg font-black text-red-900 uppercase tracking-tight">System Cache Depurge</h4>
              <p className="text-[10px] text-red-600 mt-2 uppercase font-black tracking-widest leading-none">Forces full record refresh and state clear</p>
              <p className="text-[9px] text-red-600/40 mt-1 uppercase font-medium">Use only if local synchronisation fails</p>
            </div>
            <button onClick={() => { if (confirm('PROTOCOL OVERRIDE: CLEAR LOCAL STATE?')) { localStorage.clear(); window.location.reload(); } }}
              className="group px-12 py-5 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all rounded-2xl shadow-xl shadow-red-600/20">
              PURGE LOCAL CACHE
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
