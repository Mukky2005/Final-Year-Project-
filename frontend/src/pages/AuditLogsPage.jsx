import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  ShieldAlert, 
  History, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

export default function AuditLogsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  const loadAuditEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditEvents(50);
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterAction === 'ALL') return true;
    if (filterAction === 'DENIED') return e.outcome.includes('DENIED');
    return e.action === filterAction;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 text-neutral-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-neutral-950 p-6 border border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-neutral-700 bg-black text-neutral-300 text-xs font-mono uppercase tracking-widest mb-2">
            <History className="w-3.5 h-3.5 text-white" />
            <span>COMPLIANCE & AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Security Audit Log Explorer</h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Tamper-evident log of knowledge queries, role verifications, and pre-LLM access denials.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs px-3 py-2 bg-black border border-neutral-700 text-white rounded-none outline-none"
          >
            <option value="ALL">All Events</option>
            <option value="DENIED">Access Denied / Insufficient Scope</option>
            <option value="KNOWLEDGE_QUERY">Knowledge Queries Only</option>
            <option value="DOCUMENT_UPLOAD_AND_INDEXED">Document Uploads</option>
            <option value="ROLE_REASSIGNED">Role Reassignments</option>
          </select>

          <button
            onClick={loadAuditEvents}
            disabled={loading}
            className="btn-waxy-white p-2 text-black transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-neutral-950 rounded-none border border-neutral-800 overflow-hidden font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-black text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Security Verification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-neutral-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isDenied = evt.outcome.includes('DENIED');
                  return (
                    <tr key={evt.event_id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 px-4 text-neutral-400 text-[11px] whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-[11px]">{evt.actor_email}</div>
                        <div className="text-[10px] text-neutral-400 uppercase">{evt.actor_role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-1.5 py-0.5 border border-neutral-700 bg-black text-neutral-300">
                          {evt.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isDenied ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black px-2 py-0.5 border border-white">
                            <ShieldAlert className="w-3 h-3 text-white" />
                            <span>DENIED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-black bg-white px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3 text-black stroke-[2.2]" />
                            <span>AUTHORIZED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-300 max-w-md truncate">
                        {evt.details ? (
                          <span>
                            {evt.details.query && `"${evt.details.query}" `}
                            {evt.details.authorized_chunks !== undefined && `(Chunks: ${evt.details.authorized_chunks}/${evt.details.total_tenant_chunks})`}
                            {evt.details.reason && `[${evt.details.reason}]`}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
