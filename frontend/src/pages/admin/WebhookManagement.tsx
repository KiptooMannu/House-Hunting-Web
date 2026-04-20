import React, { useState } from 'react';
import { 
  useGetWebhooksQuery, 
  useCreateWebhookMutation, 
  useUpdateWebhookMutation, 
  useDeleteWebhookMutation 
} from '../../store/apiSlice';
import { toast } from 'react-hot-toast';

const EVENT_TYPES = [
  'payment.succeeded',
  'payment.failed',
  'booking.confirmed',
  'house.verified',
  'compliance.audit_failed'
];

export default function WebhookManagement() {
  const { data: webhooks, isLoading } = useGetWebhooksQuery();
  const [createWebhook, { isLoading: creating }] = useCreateWebhookMutation();
  const [updateWebhook] = useUpdateWebhookMutation();
  const [deleteWebhook] = useDeleteWebhookMutation();

  const [newWebhook, setNewWebhook] = useState({
    url: '',
    eventType: 'payment.succeeded',
    secret: Math.random().toString(36).substring(7).toUpperCase()
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebhook(newWebhook).unwrap();
      toast.success('Bridge endpoint established.');
      setNewWebhook({ ...newWebhook, url: '' });
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to create webhook');
    }
  };

  const handleToggle = async (webhook: any) => {
    try {
      await updateWebhook({ 
        webhookId: webhook.webhookId, 
        updates: { isActive: !webhook.isActive } 
      }).unwrap();
      toast.success(webhook.isActive ? 'Bridge deactivated' : 'Bridge active');
    } catch (err) {
      toast.error('Failed to toggle bridge status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sever bridge connection? This cannot be undone.')) return;
    try {
      await deleteWebhook(id).unwrap();
      toast.success('Bridge dismantled.');
    } catch (err) {
      toast.error('Failed to dismantle bridge');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto py-24 px-8">
        <header className="mb-16 text-left">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[2px] bg-cyan-500"></span>
            <span className="text-cyan-500 font-bold tracking-[0.3em] text-[10px] uppercase">
              Connectivity Console
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white mb-6">
            Webhook <span className="text-cyan-500">Bridges.</span>
          </h1>
          <p className="text-slate-400 max-w-xl text-lg font-medium italic border-l-2 border-slate-800 pl-6">
            Manage outbound event streams to third-party services. Securely relay system state transitions via SHA-256 signed payloads.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Create Form */}
          <div className="lg:col-span-4 self-start">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-cyan-500">sensors</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-8 italic">New Bridge Configuration</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 text-left block">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.partner.com/webhook"
                    value={newWebhook.url}
                    onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-medium text-white placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 text-left block">
                    Event Trigger
                  </label>
                  <select
                    value={newWebhook.eventType}
                    onChange={e => setNewWebhook({ ...newWebhook, eventType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-bold text-white appearance-none"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 text-left block">
                    Signing Secret
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newWebhook.secret}
                      className="flex-1 bg-slate-800 border-none rounded-xl p-4 text-xs font-mono text-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setNewWebhook({ ...newWebhook, secret: Math.random().toString(36).substring(7).toUpperCase() })}
                      className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">refresh</span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-xl shadow-cyan-900/20 transition-all mt-4"
                >
                  {creating ? 'Establishing...' : 'Deploy Bridge'}
                </button>
              </form>
            </div>
          </div>

          {/* List Display */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 text-center text-slate-700 font-black tracking-widest animate-pulse">
                  SCANNING FOR ACTIVE BRIDGES...
                </div>
              ) : webhooks?.length === 0 ? (
                <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2rem] py-32 flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-5xl text-slate-800">link_off</span>
                  <p className="text-slate-600 font-bold italic">No active bridge connections detected.</p>
                </div>
              ) : (
                webhooks?.map((hook: any) => (
                  <div key={hook.webhookId} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all group">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${hook.isActive ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-800 text-slate-500'}`}>
                          <span className="material-symbols-outlined">
                            {hook.isActive ? 'podcasts' : 'shutter_speed'}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            {hook.eventType}
                            {hook.isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>}
                          </h3>
                          <p className="text-xs font-mono text-slate-500 mt-1 truncate max-w-sm">
                            {hook.url}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Status</p>
                          <p className={`text-xs font-bold ${hook.isActive ? 'text-cyan-500' : 'text-slate-500'}`}>
                            {hook.isActive ? 'Active & Relaying' : 'Suspended'}
                          </p>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(hook)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${hook.isActive ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-cyan-500 text-white'}`}
                          >
                            {hook.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(hook.webhookId)}
                            className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-12 p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[2rem] flex items-center gap-6">
              <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
                <span className="material-symbols-outlined">vpn_key</span>
              </div>
              <div className="text-left">
                <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">Security Advisory</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  All payloads are signed with <strong>X-HouseHunt-Signature</strong>. Verify the signature in your endpoint using your assigned secret to ensure authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
