import React, { useState, useEffect } from 'react';
import { Network, Server, Shield, ShieldAlert, Zap, Activity, Eye, Lock, Unlock, HardDrive, Wifi, Cpu, Database, BarChart2 } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('architecture'); // architecture, resources
  const [mode, setMode] = useState('classical'); // classical, pqc, qkd
  const [eveActive, setEveActive] = useState(false);
  const [transmissionState, setTransmissionState] = useState('idle'); // idle, sending, intercepted, received, aborted
  const [qber, setQber] = useState(0); // Quantum Bit Error Rate
  const [cps, setCps] = useState(1000); // Connections Per Second for the resource simulator

  // A1 Brand Colors
  const A1_RED = "bg-[#E50000]";
  const A1_RED_TEXT = "text-[#E50000]";
  const A1_RED_BORDER = "border-[#E50000]";
  const A1_RED_GLOW = "shadow-[0_0_15px_rgba(229,0,0,0.4)]";

  // Reset state when mode changes
  useEffect(() => {
    setTransmissionState('idle');
    setQber(0);
    setEveActive(false);
  }, [mode]);

  const runSimulation = () => {
    setTransmissionState('sending');
    
    setTimeout(() => {
      if (eveActive) {
        setTransmissionState('intercepted');
        if (mode === 'qkd') {
          // Eve measuring photons collapses the state, causing high QBER
          setQber(Math.floor(Math.random() * 25) + 25); // 25-50% error rate
        } else {
          setQber(0);
        }
      }
    }, 1000);

    setTimeout(() => {
      if (mode === 'qkd' && eveActive) {
        setTransmissionState('aborted'); // Protocol aborts due to high QBER
      } else {
        setTransmissionState('received');
      }
    }, 2500);
  };

  const renderResourceImpact = () => {
    // Relative baseline metrics per single connection handshake
    const metrics = {
      rsa: { name: 'RSA-3072', cpuFactor: 100, keySize: 384, cipherSize: 384, bufferMultiplier: 1.5, color: 'bg-slate-400' },
      ecc: { name: 'ECC (P-256)', cpuFactor: 40, keySize: 32, cipherSize: 32, bufferMultiplier: 1.0, color: 'bg-slate-300' },
      mlkem: { name: 'ML-KEM-768 (PQC)', cpuFactor: 15, keySize: 1184, cipherSize: 1088, bufferMultiplier: 12.0, color: 'bg-[#E50000]' }
    };

    const calculateLoad = (algo) => {
      const data = metrics[algo];
      const cpuLoad = (data.cpuFactor * cps) / 100; 
      const bandwidthKBps = (cps * (data.keySize + data.cipherSize)) / 1024;
      const memoryMB = (cps * (8 + (data.keySize + data.cipherSize) * data.bufferMultiplier / 1024)) / 1024; 
      return { cpuLoad, bandwidthKBps, memoryMB, ...data };
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center tracking-tight">
            <Activity className={`mr-3 ${A1_RED_TEXT} w-8 h-8`} /> Edge Terminations Simulator
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Adjust the connections per second to see how Post-Quantum Cryptography trades CPU efficiency for massive network and memory overhead in a highly concurrent environment.
          </p>

          <div className="mb-10 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-inner">
            <div className="flex justify-between text-base mb-4">
              <span className="text-white font-bold uppercase tracking-wider">Connections Per Second (CPS)</span>
              <span className={`${A1_RED_TEXT} font-mono font-bold bg-black px-3 py-1 rounded border ${A1_RED_BORDER} shadow-[0_0_10px_rgba(229,0,0,0.2)]`}>
                {cps.toLocaleString()} req/s
              </span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="50000" 
              step="100"
              value={cps}
              onChange={(e) => setCps(Number(e.target.value))}
              className="w-full h-3 bg-black rounded-lg appearance-none cursor-pointer accent-[#E50000] outline-none ring-2 ring-slate-800 focus:ring-[#E50000] transition-shadow"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CPU Metric */}
            <div className="bg-black p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 group-hover:bg-slate-600 transition-colors"></div>
              <div className="flex items-center mb-6 text-white">
                <Cpu className="mr-3 text-slate-400" size={24}/> 
                <span className="font-black tracking-wide">Relative CPU Load</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && algo === 'mlkem') || (mode === 'classical' && algo === 'ecc');
                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-105' : 'opacity-30 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-bold">{data.name}</span>
                        <span className="font-mono text-white">{data.cpuLoad.toLocaleString()} units</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800">
                        <div className={`h-3 rounded-full ${data.color} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.cpuLoad / 50000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bandwidth Metric */}
            <div className="bg-black p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 group-hover:bg-slate-600 transition-colors"></div>
              <div className="flex items-center mb-6 text-white">
                <Activity className="mr-3 text-slate-400" size={24}/> 
                <span className="font-black tracking-wide">Network Bandwidth</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && algo === 'mlkem') || (mode === 'classical' && algo === 'ecc');
                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-105' : 'opacity-30 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-bold">{data.name}</span>
                        <span className="font-mono text-white">{(data.bandwidthKBps / 1024).toFixed(2)} MB/s</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800">
                        <div className={`h-3 rounded-full ${data.color} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.bandwidthKBps / 111000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Memory Metric */}
            <div className="bg-black p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 group-hover:bg-slate-600 transition-colors"></div>
              <div className="flex items-center mb-6 text-white">
                <Database className="mr-3 text-slate-400" size={24}/> 
                <span className="font-black tracking-wide">Edge Memory (RAM)</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && algo === 'mlkem') || (mode === 'classical' && algo === 'ecc');
                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-105' : 'opacity-30 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-bold">{data.name}</span>
                        <span className="font-mono text-white">{data.memoryMB.toFixed(2)} GB</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800">
                        <div className={`h-3 rounded-full ${data.color} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.memoryMB / 1.5) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopology = () => {
    return (
      <div className="relative w-full h-80 bg-black rounded-xl p-6 flex items-center justify-between overflow-hidden border-2 border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Alice */}
        <div className="z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-slate-600 shadow-[0_0_20px_rgba(255,255,255,0.05)] relative">
            <div className={`absolute -right-2 -top-2 w-4 h-4 rounded-full ${transmissionState === 'idle' ? 'bg-slate-500' : 'bg-[#E50000] animate-pulse'} shadow-[0_0_10px_rgba(229,0,0,0.8)]`}></div>
            <Server className="text-white" size={40} />
          </div>
          <span className="mt-3 font-black text-white tracking-widest uppercase text-sm">Alice (HQ)</span>
        </div>

        {/* Network Channels */}
        <div className="flex-1 h-full relative flex flex-col justify-center px-8">
          
          {/* Standard IP Channel */}
          <div className="relative w-full h-8 mb-4 flex items-center">
            <div className="absolute w-full h-1 bg-slate-600 top-1/2 transform -translate-y-1/2 border-t border-b border-slate-500"></div>
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 font-mono">
              Public IP Network (Layer 3)
            </span>
            
            {/* Packet Animation */}
            {transmissionState !== 'idle' && (
              <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-1/2' : 'left-full'} -ml-6 z-20`}>
                <div className={`
                  flex items-center justify-center rounded-md shadow-lg
                  ${mode === 'classical' ? 'w-12 h-8 bg-slate-200 border-2 border-white' : ''}
                  ${mode === 'pqc' ? 'w-32 h-12 bg-[#E50000] border-2 border-white shadow-[0_0_15px_rgba(229,0,0,0.6)]' : ''}
                  ${mode === 'qkd' ? 'w-12 h-6 bg-slate-600 border border-slate-400' : ''}
                `}>
                  {mode === 'pqc' && <span className="text-xs font-black text-white px-2 tracking-wider">ML-KEM (1184B)</span>}
                  {mode === 'classical' && <span className="text-xs font-black text-slate-900 tracking-wider">RSA</span>}
                  {mode === 'qkd' && <span className="text-[10px] text-white font-bold tracking-widest">AUTH</span>}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Quantum Channel (Only QKD) */}
          {mode === 'qkd' && (
            <div className="relative w-full h-16 flex items-center mt-8">
              <div className="absolute w-[45%] h-2 bg-purple-900/50 top-1/2 transform -translate-y-1/2 left-0 rounded-l-full border border-purple-500/30"></div>
              <div className="absolute w-[45%] h-2 bg-purple-900/50 top-1/2 transform -translate-y-1/2 right-0 rounded-r-full border border-purple-500/30"></div>
              
              {/* Trusted Repeater Node */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="w-10 h-10 bg-orange-900/80 rounded border-2 border-orange-500 flex items-center justify-center">
                  <Unlock className="text-orange-400" size={18} />
                </div>
                <span className="mt-1 text-[9px] font-bold text-orange-400 text-center leading-tight">TRUSTED NODE</span>
              </div>

              {/* Photon Animation */}
              {transmissionState !== 'idle' && (
                <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-[25%]' : 'left-full'} -ml-2 z-10`}>
                   <div className="flex space-x-1">
                     <div className={`w-2 h-2 rounded-full ${eveActive && transmissionState !== 'sending' ? 'bg-red-500' : 'bg-purple-400'} shadow-[0_0_8px_rgba(168,85,247,0.8)]`}></div>
                     <div className={`w-2 h-2 rounded-full ${eveActive && transmissionState !== 'sending' ? 'bg-red-500' : 'bg-purple-400'} shadow-[0_0_8px_rgba(168,85,247,0.8)]`}></div>
                   </div>
                </div>
              )}

              {/* Photon Animation Link 2 (Only if not intercepted) */}
              {transmissionState !== 'idle' && transmissionState !== 'aborted' && transmissionState !== 'intercepted' && (
                 <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 delay-1000 ease-linear ${transmissionState === 'sending' ? 'left-[50%]' : 'left-full'} -ml-2 z-10 ${transmissionState === 'sending' ? 'opacity-0' : 'opacity-100'}`}>
                   <div className="flex space-x-1">
                     <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                     <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Eve the Attacker (Shifted to Amber/Warning instead of Red) */}
          <div className={`absolute top-1/2 ${mode === 'qkd' ? 'left-[25%]' : 'left-1/2'} transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 transition-all duration-500`}>
            <div className={`w-16 h-16 rounded-xl bg-black border-2 flex items-center justify-center transition-all duration-300 ${eveActive ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-110' : 'border-slate-800 opacity-40'}`}>
              <Eye className={eveActive ? 'text-amber-500' : 'text-slate-600'} size={32} />
            </div>
            <span className={`mt-1 text-xs font-bold ${eveActive ? 'text-red-400' : 'text-slate-500'}`}>Eve</span>
          </div>
        </div>

        {/* Bob */}
        <div className="z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-slate-600 shadow-[0_0_20px_rgba(255,255,255,0.05)] relative">
            <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-full ${transmissionState === 'received' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-slate-500'}`}></div>
            <HardDrive className="text-white" size={40} />
          </div>
          <span className="mt-3 font-black text-white tracking-widest uppercase text-sm">Bob (Data Center)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header - A1 Branded */}
        <div className="bg-[#0a0a0a] border-b-4 border-[#E50000] rounded-t-xl rounded-b-lg p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle A1 background graphic */}
          <div className="absolute -right-20 -top-20 opacity-5">
            <svg width="400" height="400" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#E50000"/></svg>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Shield className="mr-2 text-indigo-400" /> Quantum Network Architecture Simulator
              </h1>
              <p className="text-slate-400 text-sm">
                Evaluate the OSI layer impact of Classical vs. Post-Quantum mechanisms.
              </p>
            </div>
            
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setActiveTab('architecture')}
                className={`px-6 py-3 rounded-md text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'architecture' ? `${A1_RED} text-white shadow-lg` : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
              >
                Network Topology
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 rounded-md text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'resources' ? `${A1_RED} text-white shadow-lg` : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
              >
                Resource Impact
              </button>
            </div>
          </div>

          {/* Mode Selectors - Enhanced Clickability */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 relative z-10">
            <button 
              onClick={() => setMode('classical')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${mode === 'classical' ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
            >
              <div className="font-bold text-sm">Classical (RSA/ECC)</div>
            </button>
            <button 
              onClick={() => setMode('pqc')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${mode === 'pqc' ? 'border-green-500 bg-green-900/30 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
            >
              <div className="font-bold text-sm">PQC (ML-KEM)</div>
            </button>
            <button 
              onClick={() => setMode('qkd')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${mode === 'qkd' ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
            >
              <div className="font-bold text-sm">QKD (BB84)</div>
            </button>
          </div>
        </div>

        {/* Main Simulator Area */}
        {activeTab === 'architecture' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-6">
              {renderTopology()}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center justify-between">
                <div className="space-x-4">
                  <button 
                    onClick={runSimulation}
                    disabled={transmissionState !== 'idle' && transmissionState !== 'received' && transmissionState !== 'aborted'}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold disabled:opacity-50 transition-colors"
                  >
                    Initiate Key Exchange
                  </button>
                  <button 
                    onClick={() => setEveActive(!eveActive)}
                    className={`px-6 py-2 rounded font-bold border transition-colors ${eveActive ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-800 border-slate-600 text-slate-300'}`}
                  >
                    {eveActive ? 'Disable Eve' : 'Enable Eve'}
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Status</div>
                  <div className="font-mono font-bold text-lg">
                    {transmissionState === 'idle' && <span className="text-slate-500">Ready</span>}
                    {transmissionState === 'sending' && <span className="text-blue-400 animate-pulse">Transmitting...</span>}
                    {transmissionState === 'intercepted' && <span className="text-red-500 animate-pulse">Intercepted!</span>}
                    {transmissionState === 'received' && <span className="text-green-400">Secure</span>}
                    {transmissionState === 'aborted' && <span className="text-red-500">Aborted</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
              <h3 className="text-lg font-bold text-white mb-4">Analysis</h3>
              <div className="space-y-4 text-sm text-slate-300">
                <p><span className="font-bold text-indigo-400">OSI Layer:</span> {mode === 'qkd' ? "Layer 1 (Physical)" : "Layer 7 (Application)"}</p>
                <p><span className="font-bold text-indigo-400">Against Quantum:</span> {mode === 'classical' ? "Vulnerable" : "Resistant"}</p>
                <p className="p-3 bg-slate-950 rounded border border-slate-800 text-xs italic">
                  {mode === 'qkd' && "QKD uses Heisenberg's Uncertainty Principle to ensure any eavesdropping is detected via physical state change."}
                  {mode === 'pqc' && "ML-KEM uses lattice-based math which remains hard even for Shor's algorithm."}
                  {mode === 'classical' && "RSA/ECC are solvable in polynomial time by a sufficiently large quantum computer."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          renderResourceImpact()
        )}
      </div>
    </div>
  );
};

export default App;
