import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  Lock,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

export default function SecuritySuitePage() {
  const [suiteResult, setSuiteResult] = useState(null);
  const [running, setRunning] = useState(false);

  const runSuite = async () => {
    setRunning(true);
    try {
      const data = await api.runTestSuite();
      setSuiteResult(data);
    } catch (err) {
      alert(`Test suite execution failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runSuite();
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-neutral-100">
      
      {/* Header */}
      <div className="bg-neutral-950 rounded-none p-6 sm:p-8 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-neutral-700 bg-black text-neutral-300 text-xs font-mono uppercase tracking-widest mb-3">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>ACCEPTANCE VERIFICATION SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            Automated MVP Security Suite (12 Scenarios)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1 max-w-2xl leading-relaxed">
            Live validation of MVP-01 through MVP-12 acceptance scenarios, verifying tenant separation, intra-company role isolation, and zero cross-department data leakage.
          </p>
        </div>

        <button
          onClick={runSuite}
          disabled={running}
          className="btn-waxy-white inline-flex items-center gap-2 px-6 py-3 rounded-none font-mono font-bold text-xs uppercase tracking-wider"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>RUNNING TESTS...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>RE-RUN ALL TESTS</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecard */}
      {suiteResult && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="bg-black p-5 rounded-none border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Scenarios</div>
              <div className="text-3xl font-black text-white mt-1">{suiteResult.total_tests}</div>
            </div>
            <div className="w-10 h-10 border border-neutral-800 bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
              12
            </div>
          </div>

          <div className="bg-neutral-950 p-5 rounded-none border border-white flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">Passed Verification</div>
              <div className="text-3xl font-black text-white mt-1">{suiteResult.passed_count}</div>
            </div>
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          <div className="bg-black p-5 rounded-none border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Failed Tests</div>
              <div className="text-3xl font-black text-neutral-300 mt-1">{suiteResult.failed_count}</div>
            </div>
            <div className="w-10 h-10 border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-400">
              {suiteResult.failed_count === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <XCircle className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Scenarios List */}
      <div className="bg-neutral-950 rounded-none border border-neutral-800 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
          <Layers className="w-4 h-4 text-white" />
          <span>Execution Breakdown & Security Evidence</span>
        </h2>

        {running ? (
          <div className="py-12 text-center space-y-3 font-mono">
            <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Executing database checks and retrieval assertions...</p>
          </div>
        ) : suiteResult ? (
          <div className="divide-y divide-neutral-900">
            {suiteResult.results.map((res) => (
              <div key={res.test_id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 border border-neutral-700 bg-black text-white">
                      {res.test_id}
                    </span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">{res.scenario}</h3>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono pl-0.5 leading-relaxed">{res.evidence}</p>
                </div>

                <div className="shrink-0 font-mono">
                  {res.passed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-white text-black text-xs font-bold tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>PASSED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-white text-white text-xs font-bold tracking-wider">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAILED</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-500 font-mono text-xs">No test data available.</div>
        )}
      </div>
    </div>
  );
}
