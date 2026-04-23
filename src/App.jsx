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
      <div className="space-y-6 animate-in fade-in duration-1000">
        <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center tracking-tight">
            <Activity className={`mr-3 ${A1_RED_TEXT} w-8 h-8`} /> Edge Terminations Simulator
          </h2>
          <p className="text-base text-slate-400 mb-8 border-l-4 border-slate-700 pl-4">
            Adjust the connections per second to see how Post-Quantum Cryptography trades CPU efficiency for massive network and memory overhead in a highly concurrent environment (e.g., Telco Edge or Ingress Load Balancer).
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
                        <div className={`h-3 rounded-full ${data.color} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((data.cpuLoad / 50000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 text-xs text-slate-500 italic leading-relaxed">
                * CPU cycles required for key generation and encapsulation. ML-KEM lattice math is highly optimized for modern SIMD.
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
                        <div className={`h-3 rounded-full ${data.color} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((data.bandwidthKBps / 111000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
               <div className="mt-6 text-xs text-slate-500 italic leading-relaxed">
                * Pure payload size on the wire. ML-KEM pushes TLS handshakes well over standard 1500B MTU limits, causing fragmentation.
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
                        <div className={`h-3 rounded-full ${data.color} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((data.memoryMB / 1.5) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
               <div className="mt-6 text-xs text-slate-500 italic leading-relaxed">
                * TCP buffers & socket state. Handling fragmented packets requires holding partial data in RAM until reassembly.
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
          
          {/* Standard IP Channel (Always present) */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            <div className="absolute w-full h-2 bg-slate-800 top-1/2 transform -translate-y-1/2 border-t border-b border-slate-700"></div>
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 font-mono tracking-widest bg-black px-2">
              PUBLIC IP NETWORK (LAYER 3)
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
            <div className="relative w-full h-20 flex items-center mt-12">
              {/* Link 1 (Alice to Node) */}
              <div className="absolute w-[47%] h-3 bg-purple-900/40 top-1/2 transform -translate-y-1/2 left-0 rounded-l-full shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/50"></div>
              {/* Link 2 (Node to Bob) */}
              <div className="absolute w-[47%] h-3 bg-purple-900/40 top-1/2 transform -translate-y-1/2 right-0 rounded-r-full shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/50"></div>
              
              {/* Trusted Repeater Node */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 bg-black p-2 rounded-xl">
                <div className="w-12 h-12 bg-slate-900 rounded-lg border-2 border-slate-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Unlock className="text-white" size={20} />
                </div>
                <span className="mt-2 text-[10px] font-black text-white text-center leading-tight tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-700">TRUSTED<br/>REPEATER</span>
              </div>

              <span className="absolute -top-5 left-1/4 transform -translate-x-1/2 text-xs text-purple-400 font-mono tracking-widest flex items-center bg-black px-2">
                <Zap size={12} className="mr-2"/> QKD LINK 1
              </span>
              <span className="absolute -top-5 left-3/4 transform -translate-x-1/2 text-xs text-purple-400 font-mono tracking-widest flex items-center bg-black px-2">
                <Zap size={12} className="mr-2"/> QKD LINK 2
              </span>

              {/* Photon Animation Link 1 */}
              {transmissionState !== 'idle' && (
                <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-[25%]' : 'left-[50%]'} -ml-3 z-10`}>
                   <div className="flex space-x-2">
                     <div className={`w-3 h-3 rounded-full ${eveActive && transmissionState !== 'sending' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.9)]' : 'bg-purple-300 shadow-[0_0_15px_rgba(216,180,254,0.9)]'}`}></div>
                     <div className={`w-3 h-3 rounded-full ${eveActive && transmissionState !== 'sending' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.9)]' : 'bg-purple-300 shadow-[0_0_15px_rgba(216,180,254,0.9)]'}`}></div>
                   </div>
                </div>
              )}

              {/* Photon Animation Link 2 (Only if not intercepted) */}
              {transmissionState !== 'idle' && transmissionState !== 'aborted' && transmissionState !== 'intercepted' && (
                 <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 delay-1000 ease-linear ${transmissionState === 'sending' ? 'left-[50%]' : 'left-full'} -ml-3 z-10 ${transmissionState === 'sending' ? 'opacity-0' : 'opacity-100'}`}>
                   <div className="flex space-x-2">
                     <div className="w-3 h-3 rounded-full bg-purple-300 shadow-[0_0_15px_rgba(216,180,254,0.9)]"></div>
                     <div className="w-3 h-3 rounded-full bg-purple-300 shadow-[0_0_15px_rgba(216,180,254,0.9)]"></div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Eve the Attacker (Shifted to Amber/Warning instead of Red) */}
          <div className={`absolute top-1/2 ${mode === 'qkd' ? 'left-[25%]' : 'left-1/2'} transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 transition-all duration-1000`}>
            <div className={`w-16 h-16 rounded-xl bg-black border-2 flex items-center justify-center transition-all duration-300 ${eveActive ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-110' : 'border-slate-800 opacity-40'}`}>
              <Eye className={eveActive ? 'text-amber-500' : 'text-slate-600'} size={32} />
            </div>
            <span className={`mt-3 text-sm font-black tracking-widest uppercase ${eveActive ? 'text-amber-500' : 'text-slate-600'}`}>Eve</span>
            {transmissionState === 'intercepted' && (
              <span className="absolute -bottom-8 text-[11px] font-bold text-black bg-amber-500 px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {mode === 'qkd' ? 'MEASURING PHOTONS...' : 'COPYING PACKETS...'}
              </span>
            )}
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
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 ${A1_RED} rounded-md flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(229,0,0,0.5)]`}>
                  <Shield className="text-white" size={18} />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                  Cryptography Architecture Simulator
                </h1>
              </div>
              <p className="text-slate-400 text-base font-medium ml-11">
                Evaluate the OSI layer impact, infrastructure requirements, and system resource utilization of Classical vs. Post-Quantum mechanisms.
              </p>
            </div>
            
            {/* Tab Navigation - High Visibility */}
            <div className="flex bg-black rounded-lg p-1 border border-slate-800 mt-6 md:mt-0 shadow-inner">
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
              className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-300 group hover:-translate-y-1 ${mode === 'classical' ? 'border-white bg-slate-900 shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : 'border-slate-800 bg-black text-slate-500 hover:border-slate-600 hover:text-white'}`}
            >
              <div className={`font-black text-lg tracking-wide ${mode === 'classical' ? 'text-white' : ''}`}>Classical (RSA/ECC)</div>
              <div className={`text-xs mt-2 font-bold tracking-widest uppercase ${mode === 'classical' ? 'text-slate-400' : 'opacity-50'}`}>Software / Math based</div>
            </button>
            <button 
              onClick={() => setMode('pqc')}
              className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-300 group hover:-translate-y-1 ${mode === 'pqc' ? `border-[#E50000] bg-[rgba(229,0,0,0.05)] shadow-[0_10px_20px_rgba(229,0,0,0.15)]` : 'border-slate-800 bg-black text-slate-500 hover:border-slate-600 hover:text-white'}`}
            >
              <div className={`font-black text-lg tracking-wide ${mode === 'pqc' ? 'text-[#E50000]' : ''}`}>PQC (ML-KEM)</div>
              <div className={`text-xs mt-2 font-bold tracking-widest uppercase ${mode === 'pqc' ? 'text-[#E50000] opacity-80' : 'opacity-50'}`}>Software / Lattice Math</div>
            </button>
            <button 
              onClick={() => setMode('qkd')}
              className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-300 group hover:-translate-y-1 ${mode === 'qkd' ? 'border-purple-500 bg-purple-900/10 shadow-[0_10px_20px_rgba(168,85,247,0.15)]' : 'border-slate-800 bg-black text-slate-500 hover:border-slate-600 hover:text-white'}`}
            >
              <div className={`font-black text-lg tracking-wide ${mode === 'qkd' ? 'text-purple-400' : ''}`}>QKD (BB84)</div>
              <div className={`text-xs mt-2 font-bold tracking-widest uppercase ${mode === 'qkd' ? 'text-purple-500 opacity-80' : 'opacity-50'}`}>Hardware / Physics based</div>
            </button>
          </div>
        </div>

        {/* Main Simulator Area */}
        {activeTab === 'architecture' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-1000">
            {/* Left Column: Visualization & Controls */}
            <div className="xl:col-span-2 space-y-8">
              {renderTopology()}

              <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button 
                    onClick={runSimulation}
                    disabled={transmissionState !== 'idle' && transmissionState !== 'received' && transmissionState !== 'aborted'}
                    className={`w-full sm:w-auto ${A1_RED} hover:bg-red-700 text-white px-8 py-4 rounded-lg font-black tracking-widest uppercase shadow-lg hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(229,0,0,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 outline-none focus:ring-4 focus:ring-red-500/50`}
                  >
                    Initiate Key Exchange
                  </button>
                  <button 
                    onClick={() => setEveActive(!eveActive)}
                    className={`w-full sm:w-auto px-8 py-4 rounded-lg font-black tracking-widest uppercase border-2 transition-all duration-200 shadow-lg hover:-translate-y-0.5 outline-none ${eveActive ? 'bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/20 shadow-[0_8px_20px_rgba(245,158,11,0.2)]' : 'bg-black border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-900'}`}
                  >
                    {eveActive ? 'Disable Eve' : 'Enable Eve (Attack)'}
                  </button>
                </div>

                {/* Status Output */}
                <div className="text-center sm:text-right w-full sm:w-auto bg-black p-4 rounded-lg border border-slate-800 min-w-[200px]">
                  <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-widest">Network Status</div>
                  <div className="font-mono font-black text-xl tracking-wider">
                    {transmissionState === 'idle' && <span className="text-slate-400">READY</span>}
                    {transmissionState === 'sending' && <span className="text-blue-400 animate-pulse">TRANSMITTING...</span>}
                    {transmissionState === 'intercepted' && <span className="text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">INTERCEPTED!</span>}
                    {transmissionState === 'received' && <span className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">SECURE</span>}
                    {transmissionState === 'aborted' && <span className="text-red-500 flex items-center justify-center sm:justify-end"><ShieldAlert size={20} className="mr-2"/> ABORTED</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Analysis */}
            <div className="space-y-8">
              <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-slate-600"></div>
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center">
                  <Activity className="mr-3 text-slate-500"/> Architectural Impact
                </h3>
                
                <div className="space-y-6 text-sm">
                  <div>
                    <div className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-xs">OSI Layer Operation</div>
                    <div className="font-mono text-white bg-black p-4 rounded-lg border border-slate-800 shadow-inner font-bold text-base">
                      {mode === 'classical' && "Layer 7 (Software/Math)"}
                      {mode === 'pqc' && "Layer 7 (Software/Lattice Math)"}
                      {mode === 'qkd' && "Layer 1 (Hardware/Physics)"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-xs">Infrastructure Requirement</div>
                    <div className={`font-mono p-4 rounded-lg border shadow-inner leading-relaxed ${mode === 'qkd' ? 'bg-purple-950/30 border-purple-500/50 text-purple-200' : 'bg-black border-slate-800 text-slate-300'}`}>
                      {mode === 'classical' && "Standard IP Network. No hardware changes required."}
                      {mode === 'pqc' && "Standard IP Network. Requires TLS 1.3 infrastructure updates."}
                      {mode === 'qkd' && "Dedicated dark fiber required. Highly secure physical bunkers (Trusted Nodes) required every ~100km."}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 mb-2 font-bold uppercase tracking-wider text-xs">Network Payload (Public Key)</div>
                    <div className="font-mono text-white bg-black p-4 rounded-lg border border-slate-800 shadow-inner flex items-center justify-between font-bold">
                      <span>
                        {mode === 'classical' && "Small (e.g., 32B for ECC)"}
                        {mode === 'pqc' && <span className={`${A1_RED_TEXT}`}>Massive (1,184B for ML-KEM)</span>}
                        {mode === 'qkd' && "N/A (Single Photons)"}
                      </span>
                      {mode === 'pqc' && <Activity size={20} className={`${A1_RED_TEXT} animate-pulse`}/>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className={`absolute left-0 top-0 w-1 h-full ${mode === 'classical' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center">
                  <Shield className="mr-3 text-slate-500"/> Security Analysis
                </h3>
                
                {mode === 'qkd' && (
                  <div className="mb-6 bg-black p-5 rounded-lg border border-slate-800 shadow-inner">
                    <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Quantum Bit Error Rate (QBER)</div>
                    <div className="flex items-center">
                      <div className="w-full bg-slate-900 rounded-full h-3 mr-4 border border-slate-700">
                        <div className={`h-3 rounded-full transition-all duration-1000 ${qber > 11 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`} style={{ width: `${qber}%` }}></div>
                      </div>
                      <span className={`font-mono font-black text-lg ${qber > 11 ? 'text-amber-500' : 'text-green-500'}`}>{qber}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 italic leading-relaxed border-t border-slate-800 pt-2">Threshold: ~11%. Eve's measurement forces collapse.</p>
                  </div>
                )}

                <div className="text-sm space-y-6">
                  <div className="flex items-start bg-black p-4 rounded-lg border border-slate-800">
                    <div className="mt-1 mr-4 bg-slate-900 p-2 rounded-md border border-slate-700">
                      {mode === 'qkd' ? <Unlock className="text-amber-500" size={20}/> : (mode === 'classical' ? <Unlock className={`${A1_RED_TEXT}`} size={20}/> : <Lock className="text-green-500" size={20}/>)}
                    </div>
                    <div>
                      <div className="font-black text-white uppercase tracking-wider text-xs mb-1">Against Quantum Computers</div>
                      <div className={`leading-relaxed ${mode === 'classical' ? A1_RED_TEXT : (mode === 'qkd' ? 'text-amber-400' : 'text-green-400')}`}>
                        {mode === 'classical' && "Vulnerable (Shor's Algorithm). Eve saves packets now to decrypt later (SNDL)."}
                        {mode === 'pqc' && "Secure. Mathematically resistant to known quantum algorithms."}
                        {mode === 'qkd' && "Physics link secure, BUT breaks end-to-end encryption. The Trusted Node holds plaintext keys in memory, making it a highly vulnerable classical attack vector."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start bg-black p-4 rounded-lg border border-slate-800">
                    <div className="mt-1 mr-4 bg-slate-900 p-2 rounded-md border border-slate-700">
                      {eveActive && mode === 'qkd' ? <Activity className="text-blue-400" size={20}/> : <Wifi className="text-slate-500" size={20}/>}
                    </div>
                    <div>
                      <div className="font-black text-white uppercase tracking-wider text-xs mb-1">Eavesdropping Detection</div>
                      <div className="text-slate-400 leading-relaxed">
                        {mode === 'classical' && "None. Eve can copy IP packets passively without detection."}
                        {mode === 'pqc' && "None. Eve can copy IP packets passively, but cannot read them."}
                        {mode === 'qkd' && <span className="text-blue-300 font-bold">Immediate. Measuring a photon alters its state. Alice and Bob detect the spike in error rates and abort.</span>}
                      </div>
                    </div>
                  </div>
                </div>
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