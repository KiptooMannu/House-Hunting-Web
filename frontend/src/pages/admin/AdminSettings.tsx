import { useState } from 'react';
import { useListUsersQuery, useGetProfileQuery } from '../../store/apiSlice';
import { formatDistanceToNow } from 'date-fns';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const { data: adminData, isLoading: adminsLoading } = useListUsersQuery({ role: 'admin' });
  const { data: profileData } = useGetProfileQuery({});
  
  const admins = adminData?.items || [];
  const profile = profileData?.user;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 text-left">
      <header className="mb-12">
        <p className="text-primary font-bold tracking-widest uppercase text-xs mb-2">System Control Center</p>
        <h2 className="text-4xl font-extrabold tracking-tight text-primary font-headline">Savanna Horizon Settings</h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl font-body">
          Configure global parameters, manage administrative credentials, and audit security protocols for the Kenyan institutional real estate engine.
        </p>
      </header>

      {/* Tabs Interface (High-End Asymmetric) */}
      <div className="flex space-x-12 border-b border-outline-variant/30 mb-10 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-4 font-headline font-bold text-sm tracking-tight transition-colors ${activeTab === 'general' ? 'border-b-[3px] border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          General Settings
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 font-headline font-bold text-sm tracking-tight transition-colors ${activeTab === 'users' ? 'border-b-[3px] border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`pb-4 font-headline font-bold text-sm tracking-tight transition-colors ${activeTab === 'security' ? 'border-b-[3px] border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Security & Auth
        </button>
        <button 
          onClick={() => setActiveTab('integrations')}
          className={`pb-4 font-headline font-bold text-sm tracking-tight transition-colors ${activeTab === 'integrations' ? 'border-b-[3px] border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Integrations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Settings */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 space-y-8">
          
          {/* System Config Card */}
          <section className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-primary font-headline mb-1">General Branding</h3>
                <p className="text-sm text-on-surface-variant">Manage identity and global system status.</p>
              </div>
              <span className="bg-secondary-container/30 text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Live System
              </span>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest">System Name</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                    type="text" 
                    defaultValue="Savanna Horizon Estate Portal" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Contact Email</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                    type="email" 
                    defaultValue="admin@savannahorizon.co.ke" 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="flex items-center">
                  <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 text-primary">
                    <span className="material-symbols-outlined">construction</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-primary">Maintenance Mode</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Disable public access for updates</p>
                  </div>
                </div>
                <button className="w-14 h-7 bg-slate-200 rounded-full relative transition-colors shadow-inner flex items-center p-1">
                  <span className="w-5 h-5 bg-white rounded-full shadow-md"></span>
                </button>
              </div>
            </div>
          </section>

          {/* User Management Table */}
          <section className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-lg transition-all">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-primary font-headline">Administrative Users</h3>
              <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm mr-2">add</span> Add Admin
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Joined</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {adminsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Administrators...</td>
                    </tr>
                  ) : admins.map((admin: any) => (
                    <tr key={admin.userId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs mr-4 shadow-inner uppercase">
                            {admin.fullName?.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary capitalize tracking-tight">{admin.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500">
                          {profile?.userId === admin.userId ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                        {admin.createdAt ? formatDistanceToNow(new Date(admin.createdAt), { addSuffix: true }) : 'N/A'}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-full inline-flex">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2 animate-pulse"></span> Active
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors cursor-pointer bg-transparent border-none">more_vert</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Security & Integrations */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-8">
          
          {/* Security Profile Card */}
          <section className="bg-primary text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            {/* Subtle Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
              <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <span className="material-symbols-outlined mr-3 text-3xl">verified_user</span>
                <h3 className="text-2xl font-black font-headline tracking-tighter">Security Core</h3>
              </div>
              
              <ul className="space-y-6 mb-10">
                <li className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-60">MFA Status</span>
                  <span className="bg-secondary text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">Enforced</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Session Timeout</span>
                  <span className="text-xs font-black tracking-tight">30 Minutes</span>
                </li>
                <li className="flex items-center justify-between pb-2">
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Admin Protocol</span>
                  <span className="text-xs font-black tracking-tight">Level 5 Access</span>
                </li>
              </ul>
              
              <button className="w-full bg-white text-primary py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 shadow-lg border-none cursor-pointer">
                Harden Protocols
              </button>
            </div>
          </section>

          {/* Integrations Dashboard */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
            <h3 className="text-xl font-black text-primary font-headline mb-6 tracking-tight">Integrated Endpoints</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center border border-slate-100 group transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mr-4 text-primary shadow-inner">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">M-Pesa Node</p>
                  <p className="text-[9px] text-secondary font-black uppercase tracking-widest mt-1">Stripe Linked</p>
                </div>
                <button className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors text-lg border-none bg-transparent cursor-pointer group-hover:rotate-90 duration-300">settings</button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center border border-slate-100 group transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mr-4 text-primary shadow-inner">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">GavaConnect Tax</p>
                  <p className="text-[9px] text-secondary font-black uppercase tracking-widest mt-1">E-TIMS Active</p>
                </div>
                <button className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors text-lg border-none bg-transparent cursor-pointer group-hover:rotate-90 duration-300">settings</button>
              </div>
            </div>
            
            <button className="mt-8 text-primary font-black text-[10px] uppercase tracking-widest flex items-center group bg-transparent border-none cursor-pointer w-full justify-between p-2">
              Verify Webhooks
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </section>

          {/* Promotion / Info */}
          <div className="p-8 bg-[#ffdbcb]/30 rounded-[2rem] border border-[#7e3200]/10 shrink-0">
            <p className="text-[#7e3200] font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">trending_up</span> Growth Protocol
            </p>
            <p className="text-xs text-[#7e3200]/80 font-bold leading-relaxed pr-4">
              System logs indicate a 14% increase in user activity. Consider scaling node capacity for the GavaConnect Tax endpoint.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
