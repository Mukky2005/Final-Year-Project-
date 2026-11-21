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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 text-black bg-white font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-black bg-neutral-100 text-black text-xs font-mono uppercase tracking-widest mb-2 font-bold">
            <History className="w-3.5 h-3.5 text-black" />
            <span>COMPLIANCE & AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Security Audit Log Explorer</h1>
          <p className="text-xs text-neutral-600 font-mono mt-1 font-medium">
            Tamper-evident log of knowledge queries, role verifications, and pre-LLM access denials.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs px-3 py-2 bg-white border-2 border-black text-black rounded-none outline-none font-bold"
          >
            <option value="ALL">All Events</option>
            <option value="DENIED">Access Denied / Insufficient Scope</option>
            <option value="PROMPT_INJECTION_BLOCKED">Prompt Injection Interceptions</option>
            <option value="KNOWLEDGE_QUERY">Knowledge Queries Only</option>
            <option value="DOCUMENT_UPLOAD_AND_INDEXED">Document Uploads</option>
            <option value="ROLE_REASSIGNED">Role Reassignments</option>
          </select>

          <button
            onClick={loadAuditEvents}
            disabled={loading}
            className="btn-waxy-black p-2 transition-transform text-block-pop"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-none border-2 border-black overflow-hidden font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-block-pop">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100 text-[10px] font-black text-black uppercase tracking-widest">
                <th className="py-3 px-4 border-r border-black">Timestamp</th>
                <th className="py-3 px-4 border-r border-black">Actor & Role</th>
                <th className="py-3 px-4 border-r border-black">Action</th>
                <th className="py-3 px-4 border-r border-black">Outcome</th>
                <th className="py-3 px-4">Security Verification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-xs bg-white">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-neutral-500 font-bold">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isDenied = evt.outcome.includes('DENIED');
                  return (
                    <tr key={evt.event_id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 text-neutral-600 font-mono text-[11px] whitespace-nowrap border-r border-black font-medium">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 border-r border-black">
                        <div className="font-bold text-black text-[11px]">{evt.actor_email}</div>
                        <div className="text-[10px] text-neutral-600 font-bold uppercase">{evt.actor_role}</div>
                      </td>
                      <td className="py-3 px-4 border-r border-black">
                        <span className="text-[10px] px-1.5 py-0.5 border border-black bg-neutral-100 text-black font-bold">
                          {evt.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-black">
                        {isDenied ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-black bg-white px-2 py-0.5 border-2 border-black text-block-pop shadow-xs">
                            <ShieldAlert className="w-3 h-3 text-black stroke-[2.5]" />
                            <span>DENIED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-black px-2 py-0.5 text-block-pop shadow-xs">
                            <CheckCircle2 className="w-3 h-3 text-white stroke-[2.5]" />
                            <span>AUTHORIZED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-800 font-medium">
                        {evt.details ? (
                          <div className="space-y-1.5 max-w-2xl">
                            {(evt.details.query || evt.details.question) && (
                              <div className="text-black font-bold text-xs">
                                <span className="text-neutral-500 uppercase font-mono text-[10px] mr-1">Query:</span>
                                <span>"{evt.details.query || evt.details.question}"</span>
                              </div>
                            )}

                            {evt.action === 'PROMPT_INJECTION_BLOCKED' ? (
                              <div className="p-2.5 border-2 border-black bg-black text-white text-xs space-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <div className="text-[10px] font-mono font-black uppercase text-white flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                  <span>PRE-RETRIEVAL GUARDRAIL INTERCEPTION</span>
                                </div>
                                <div className="text-xs font-bold text-neutral-200">
                                  Category: <span className="text-white font-mono">{evt.details.category || 'INSTRUCTION_OVERRIDE'}</span>
                                </div>
                                <p className="font-sans font-medium text-neutral-300 leading-relaxed text-[11px]">
                                  {evt.details.reason}
                                </p>
                                <div className="text-[10px] font-mono text-neutral-400 pt-0.5 border-t border-neutral-800">
                                  Matched Pattern: <span className="font-bold text-white">"{evt.details.pattern}"</span> · Vector DB Query: <span className="font-bold text-white">Aborted (0 Chunks)</span>
                                </div>
                              </div>
                            ) : isDenied ? (
                              <div className="p-2.5 border-2 border-black bg-neutral-50 text-black text-xs space-y-1 text-block-pop shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <div className="text-[10px] font-mono font-black uppercase text-black flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                                  <span>Denial Reason & Security Verification:</span>
                                </div>
                                <p className="font-sans font-medium text-black leading-relaxed">
                                  {evt.details.reason || 'Physical SQL retrieval filter pruned 100% of candidate chunks. Role lacks required permission scope for requested target.'}
                                </p>
                                <div className="text-[10px] font-mono text-neutral-600 pt-0.5 border-t border-neutral-200">
                                  Chunks Authorized: <span className="font-bold text-black">{evt.details.authorized_chunks ?? evt.details.authorized_chunks_count ?? 0}</span> / {evt.details.total_tenant_chunks ?? 0} Total Chunks
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                {evt.details.reason && (
                                  <div className="text-[11px] text-neutral-700 font-sans">
                                    {evt.details.reason}
                                  </div>
                                )}
                                {evt.details.authorized_chunks !== undefined && (
                                  <div className="text-[10px] text-neutral-600 font-mono">
                                    Passed Pre-LLM Filter: <span className="font-bold text-black">{evt.details.authorized_chunks}</span> / {evt.details.total_tenant_chunks} chunks
                                  </div>
                                )}
                              </div>
                            )}

                            {evt.details.pii_redacted_count > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-black bg-neutral-100 text-black text-[10px] font-bold">
                                <span>🔒 Egress Sanitizer: {evt.details.pii_redacted_count} Sensitive Token(s) Redacted [{evt.details.pii_categories?.join(', ')}]</span>
                              </div>
                            )}

                            {evt.action === 'DOCUMENT_UPLOAD_AND_INDEXED' && evt.details.filename && (
                              <div className="text-[11px] text-black">
                                Ingested: <span className="font-bold">{evt.details.filename}</span> ({evt.details.chunk_count || 0} chunks)
                              </div>
                            )}

                            {evt.action === 'ROLE_REASSIGNED' && (
                              <div className="text-[11px] text-black">
                                Reassigned <span className="font-bold">{evt.details.target_employee || evt.details.employee_email}</span> to <span className="font-bold">{evt.details.new_role}</span>
                              </div>
                            )}
                          </div>
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
