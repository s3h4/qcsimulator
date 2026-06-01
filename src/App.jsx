import React, { useState, useEffect } from 'react';
import { Network, Server, Shield, ShieldAlert, Zap, Activity, UserX, Lock, Unlock, HardDrive, Wifi, Cpu, Database, BarChart2, Smartphone, LayoutTemplate } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('architecture'); // architecture, resources
  const [mode, setMode] = useState('classical'); // classical, pqc, qkd
  const [attackerActive, setAttackerActive] = useState(false);
  const [transmissionState, setTransmissionState] = useState('idle'); // idle, sending, intercepted, received, aborted
  const [qber, setQber] = useState(0); // Quantum Bit Error Rate
  const [cps, setCps] = useState(1000); // Connections Per Second for the resource simulator

  // A1 Brand Identity
  const A1_RED_BG = "bg-[#E50000]";
  const A1_RED_TEXT = "text-[#E50000]";

  // Strict Theme Mapping for Tailwind JIT Compiler
  const themes = {
    classical: {
      id: 'classical',
      name: 'Classical (RSA/ECC)',
      desc: 'Software / Math based',
      btnActive: 'border-blue-600 bg-blue-50 shadow-[0_4px_15px_rgba(37,99,235,0.15)]',
      textPrimary: 'text-blue-800',
      textAccent: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderLight: 'border-blue-200',
      borderMain: 'border-blue-500',
      barColor: 'bg-blue-600',
      packetBg: 'bg-blue-600',
      packetText: 'text-white'
    },
    pqc: {
      id: 'pqc',
      name: 'PQC (ML-KEM)',
      desc: 'Software / Lattice Math',
      btnActive: 'border-emerald-600 bg-emerald-50 shadow-[0_4px_15px_rgba(5,150,105,0.15)]',
      textPrimary: 'text-emerald-800',
      textAccent: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200',
      borderMain: 'border-emerald-500',
      barColor: 'bg-emerald-600',
      packetBg: 'bg-emerald-600',
      packetText: 'text-white'
    },
    qkd: {
      id: 'qkd',
      name: 'QKD (BB84)',
      desc: 'Hardware / Physics based',
      btnActive: 'border-purple-600 bg-purple-50 shadow-[0_4px_15px_rgba(147,51,234,0.15)]',
      textPrimary: 'text-purple-800',
      textAccent: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderLight: 'border-purple-200',
      borderMain: 'border-purple-500',
      barColor: 'bg-purple-600',
      packetBg: 'bg-purple-600',
      packetText: 'text-white'
    }
  };

  const currentTheme = themes[mode];

  // Reset state when mode changes
  useEffect(() => {
    setTransmissionState('idle');
    setQber(0);
    setAttackerActive(false);
  }, [mode]);

  const runSimulation = () => {
    setTransmissionState('sending');
    
    // SLOWED DOWN: Intercept happens at 2000ms instead of 1000ms
    setTimeout(() => {
      if (attackerActive) {
        setTransmissionState('intercepted');
        if (mode === 'qkd') {
          // Attacker measuring photons collapses the state, causing high QBER
          setQber(Math.floor(Math.random() * 25) + 25); // 25-50% error rate
        } else {
          setQber(0);
        }
      }
    }, 2000); 

    // SLOWED DOWN: Final state reached at 4500ms instead of 2500ms
    setTimeout(() => {
      if (mode === 'qkd' && attackerActive) {
        setTransmissionState('aborted'); // Protocol aborts due to high QBER
      } else {
        setTransmissionState('received');
      }
    }, 4500); 
  };

  const renderResourceImpact = () => {
    // Relative baseline metrics per single connection handshake
    const metrics = {
      rsa: { id: 'rsa', name: 'RSA-3072', cpuFactor: 100, keySize: 384, cipherSize: 384, bufferMultiplier: 1.5, themeId: 'classical' },
      ecc: { id: 'ecc', name: 'ECC (P-256)', cpuFactor: 40, keySize: 32, cipherSize: 32, bufferMultiplier: 1.0, themeId: 'classical' },
      mlkem: { id: 'mlkem', name: 'ML-KEM-768 (PQC)', cpuFactor: 15, keySize: 1184, cipherSize: 1088, bufferMultiplier: 12.0, themeId: 'pqc' }
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
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center tracking-tight">
            <Activity className={`mr-3 ${currentTheme.textAccent} w-8 h-8`} /> Edge Terminations Simulator
          </h2>
          <p className="text-base text-slate-600 mb-8 border-l-4 border-slate-300 pl-4">
            Adjust the connections per second to see how Post-Quantum Cryptography trades CPU efficiency for massive network and memory overhead in a highly concurrent environment (e.g., Telco Edge or Ingress Load Balancer).
          </p>

          <div className={`${currentTheme.bgLight} p-6 rounded-xl border ${currentTheme.borderLight} mb-10 transition-colors duration-500`}>
            <div className="flex justify-between text-base mb-4">
              <span className={`${currentTheme.textPrimary} font-bold uppercase tracking-wider`}>Connections Per Second (CPS)</span>
              <span className={`font-mono font-bold bg-white px-3 py-1 rounded border ${currentTheme.borderLight} ${currentTheme.textAccent} shadow-sm`}>
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
              className={`w-full h-3 bg-white rounded-lg appearance-none cursor-pointer border border-slate-300 outline-none focus:ring-2 transition-shadow`}
              style={{ accentColor: mode === 'classical' ? '#2563eb' : (mode === 'pqc' ? '#059669' : '#9333ea') }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CPU Metric Box */}
            <div className={`bg-white p-6 rounded-xl border ${currentTheme.borderLight} shadow-md relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${currentTheme.barColor} transition-colors duration-500`}></div>
              <div className="flex items-center mb-6 text-slate-800">
                <Cpu className={`mr-3 ${currentTheme.textAccent}`} size={24}/> 
                <span className="font-black tracking-wide">Relative CPU Load</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && data.themeId === 'pqc') || (mode === 'classical' && data.themeId === 'classical');
                  const barBg = isSelected ? currentTheme.barColor : 'bg-slate-300';
                  
                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-800 font-bold">{data.name}</span>
                        <span className="font-mono text-slate-900 font-bold">{data.cpuLoad.toLocaleString()} units</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200">
                        <div className={`h-3 rounded-full ${barBg} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.cpuLoad / 50000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 text-xs text-slate-500 italic leading-relaxed">
                * CPU cycles required for key generation and encapsulation. ML-KEM lattice math is highly optimized for modern SIMD.
              </div>
            </div>

            {/* Bandwidth Metric Box */}
            <div className={`bg-white p-6 rounded-xl border ${currentTheme.borderLight} shadow-md relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${currentTheme.barColor} transition-colors duration-500`}></div>
              <div className="flex items-center mb-6 text-slate-800">
                <Activity className={`mr-3 ${currentTheme.textAccent}`} size={24}/> 
                <span className="font-black tracking-wide">Network Bandwidth</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && data.themeId === 'pqc') || (mode === 'classical' && data.themeId === 'classical');
                  const barBg = isSelected ? currentTheme.barColor : 'bg-slate-300';

                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-800 font-bold">{data.name}</span>
                        <span className="font-mono text-slate-900 font-bold">{(data.bandwidthKBps / 1024).toFixed(2)} MB/s</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200">
                        <div className={`h-3 rounded-full ${barBg} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.bandwidthKBps / 111000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
               <div className="mt-6 text-xs text-slate-500 italic leading-relaxed">
                * Pure payload size on the wire. ML-KEM pushes TLS handshakes well over standard 1500B MTU limits, causing fragmentation.
              </div>
            </div>

            {/* Memory Metric Box */}
            <div className={`bg-white p-6 rounded-xl border ${currentTheme.borderLight} shadow-md relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${currentTheme.barColor} transition-colors duration-500`}></div>
              <div className="flex items-center mb-6 text-slate-800">
                <Database className={`mr-3 ${currentTheme.textAccent}`} size={24}/> 
                <span className="font-black tracking-wide">Edge Memory (RAM)</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && data.themeId === 'pqc') || (mode === 'classical' && data.themeId === 'classical');
                  const barBg = isSelected ? currentTheme.barColor : 'bg-slate-300';

                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-800 font-bold">{data.name}</span>
                        <span className="font-mono text-slate-900 font-bold">{data.memoryMB.toFixed(2)} GB</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200">
                        <div className={`h-3 rounded-full ${barBg} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.memoryMB / 1.5) * 100, 100)}%` }}></div>
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
      <div className="relative w-full h-80 bg-white rounded-xl p-6 flex items-center justify-between overflow-hidden border border-slate-200 shadow-sm">
        {/* Light Mode Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Sender (Alice/A1 User/Vienna 1) */}
        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-slate-300 shadow-md relative">
            <div className={`absolute -right-2 -top-2 w-4 h-4 rounded-full ${transmissionState === 'idle' ? 'bg-slate-300' : 'bg-green-500 animate-pulse'} shadow-sm`}></div>
            {mode === 'qkd' ? <Server className="text-slate-700" size={40} /> : <Smartphone className="text-slate-700" size={40} />}
          </div>
          <span className="mt-3 font-black text-slate-800 tracking-widest uppercase text-[10px] sm:text-xs leading-tight whitespace-pre-line">
            {mode === 'qkd' ? 'A1 Datacenter\nVienna 1' : 'A1 User'}
          </span>
        </div>

        {/* Network Channels */}
        <div className="flex-1 h-full relative flex flex-col justify-center px-4 sm:px-8">
          
          {/* Standard IP Channel (Always present) */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            <div className="absolute w-full h-2 bg-slate-100 top-1/2 transform -translate-y-1/2 border-t border-b border-slate-200"></div>
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-slate-600 font-mono tracking-widest bg-white px-3 border border-slate-200 rounded-full shadow-sm">
              PUBLIC IP NETWORK (LAYER 3)
            </span>
            
            {/* Packet Animation - Double Slower */}
            {transmissionState !== 'idle' && (
              <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-[2000ms] ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-1/2' : 'left-full'} -ml-6 z-20`}>
                <div className={`
                  flex items-center justify-center rounded-md shadow-lg
                  ${mode === 'classical' ? `w-14 h-8 ${currentTheme.packetBg} border-2 border-white` : ''}
                  ${mode === 'pqc' ? `w-36 h-12 ${currentTheme.packetBg} border-2 border-white shadow-[0_4px_15px_rgba(5,150,105,0.4)]` : ''}
                  ${mode === 'qkd' ? `w-12 h-6 bg-slate-500 border border-slate-300` : ''}
                `}>
                  {mode === 'pqc' && <span className={`text-xs font-black ${currentTheme.packetText} px-2 tracking-wider`}>ML-KEM (1184B)</span>}
                  {mode === 'classical' && <span className={`text-xs font-black ${currentTheme.packetText} tracking-wider`}>RSA</span>}
                  {mode === 'qkd' && <span className="text-[10px] text-white font-bold tracking-widest">AUTH</span>}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Quantum Channel (Only QKD) */}
          {mode === 'qkd' && (
            <div className="relative w-full h-20 flex items-center mt-12">
              {/* Link 1 (Vienna 1 to Node) */}
              <div className="absolute w-[47%] h-3 bg-purple-100 top-1/2 transform -translate-y-1/2 left-0 rounded-l-full shadow-inner border border-purple-300"></div>
              {/* Link 2 (Node to Vienna 2) */}
              <div className="absolute w-[47%] h-3 bg-purple-100 top-1/2 transform -translate-y-1/2 right-0 rounded-r-full shadow-inner border border-purple-300"></div>
              
              {/* Trusted Repeater Node */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 bg-slate-50 p-2 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-purple-300 flex items-center justify-center shadow-md relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border border-white"></div>
                  <Unlock className="text-purple-600" size={20} />
                </div>
                <span className="mt-2 text-[10px] font-black text-purple-800 text-center leading-tight tracking-widest bg-purple-50 px-2 py-1 rounded border border-purple-200">TRUSTED<br/>REPEATER</span>
              </div>

              <span className="absolute -top-5 left-1/4 transform -translate-x-1/2 text-[10px] sm:text-xs text-purple-700 font-mono tracking-widest flex items-center bg-purple-50 px-2 rounded-full border border-purple-200 shadow-sm">
                <Zap size={12} className="mr-2 text-purple-600"/> QKD LINK 1
              </span>
              <span className="absolute -top-5 left-3/4 transform -translate-x-1/2 text-[10px] sm:text-xs text-purple-700 font-mono tracking-widest flex items-center bg-purple-50 px-2 rounded-full border border-purple-200 shadow-sm">
                <Zap size={12} className="mr-2 text-purple-600"/> QKD LINK 2
              </span>

              {/* Photon Animation Link 1 - Double Slower */}
              {transmissionState !== 'idle' && (
                <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-[2000ms] ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-[25%]' : 'left-[50%]'} -ml-3 z-10`}>
                   <div className="flex space-x-2">
                     <div className={`w-3 h-3 rounded-full ${attackerActive && transmissionState !== 'sending' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.6)]'}`}></div>
                     <div className={`w-3 h-3 rounded-full ${attackerActive && transmissionState !== 'sending' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.6)]'}`}></div>
                   </div>
                </div>
              )}

              {/* Photon Animation Link 2 (Only if not intercepted) - Double Slower */}
              {transmissionState !== 'idle' && transmissionState !== 'aborted' && transmissionState !== 'intercepted' && (
                 <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-[2000ms] delay-[2000ms] ease-linear ${transmissionState === 'sending' ? 'left-[50%]' : 'left-full'} -ml-3 z-10 ${transmissionState === 'sending' ? 'opacity-0' : 'opacity-100'}`}>
                   <div className="flex space-x-2">
                     <div className="w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.6)]"></div>
                     <div className="w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.6)]"></div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Attacker Node (Amber Warning Theme) */}
          <div className={`absolute top-1/2 ${mode === 'qkd' ? 'left-[25%]' : 'left-1/2'} transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 transition-all duration-500`}>
            <div className={`w-16 h-16 rounded-xl bg-white border-2 flex items-center justify-center transition-all duration-300 ${attackerActive ? 'border-amber-500 shadow-[0_8px_20px_rgba(245,158,11,0.3)] scale-110' : 'border-slate-200 opacity-60'}`}>
              <UserX className={attackerActive ? 'text-amber-500' : 'text-slate-400'} size={32} />
            </div>
            <span className={`mt-3 text-sm font-black tracking-widest uppercase bg-white/80 px-2 rounded ${attackerActive ? 'text-amber-600' : 'text-slate-400'}`}>Attacker</span>
            {transmissionState === 'intercepted' && (
              <span className="absolute -bottom-8 text-[11px] font-bold text-amber-900 bg-amber-200 border border-amber-400 px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                {mode === 'qkd' ? 'MEASURING PHOTONS...' : 'COPYING PACKETS...'}
              </span>
            )}
          </div>
        </div>

        {/* Receiver (Bob/A1 App/Vienna 2) */}
        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-slate-300 shadow-md relative">
            <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-full ${transmissionState === 'received' ? 'bg-green-500 shadow-sm animate-pulse' : 'bg-slate-300'}`}></div>
            {mode === 'qkd' ? <HardDrive className="text-slate-700" size={40} /> : <LayoutTemplate className="text-slate-700" size={40} />}
          </div>
          <span className="mt-3 font-black text-slate-800 tracking-widest uppercase text-[10px] sm:text-xs leading-tight whitespace-pre-line">
            {mode === 'qkd' ? 'A1 Datacenter\nVienna 2' : 'A1 App'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header - A1 Corporate Light Theme */}
        <div className="bg-white border-t-8 border-[#E50000] rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden border-x border-b border-slate-200">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
            <div>
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 ${A1_RED_BG} rounded-lg flex items-center justify-center mr-4 shadow-md`}>
                  <Shield className="text-white" size={20} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                  Cryptography Architecture Simulator
                </h1>
              </div>
              <p className="text-slate-600 text-base font-medium ml-14">
                Evaluate the OSI layer impact, infrastructure requirements, and system resource utilization of Classical vs. Post-Quantum mechanisms.
              </p>
            </div>
            
            {/* Tab Navigation - Light Theme */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200 mt-6 md:mt-0 shadow-inner">
              <button 
                onClick={() => setActiveTab('architecture')}
                className={`px-6 py-3 rounded-md text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'architecture' ? `${A1_RED_BG} text-white shadow-md` : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                Network Topology
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 rounded-md text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'resources' ? `${A1_RED_BG} text-white shadow-md` : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                Resource Impact
              </button>
            </div>
          </div>

          {/* Mode Selectors - Topic Color Coded */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 relative z-10">
            {Object.values(themes).map((t) => (
              <button 
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-300 group hover:-translate-y-1 ${mode === t.id ? t.btnActive : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <div className={`font-black text-lg tracking-wide ${mode === t.id ? t.textPrimary : 'text-slate-700'}`}>{t.name}</div>
                <div className={`text-xs mt-2 font-bold tracking-widest uppercase ${mode === t.id ? t.textAccent : 'opacity-60'}`}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Simulator Area */}
        {activeTab === 'architecture' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left Column: Visualization & Controls */}
            <div className="xl:col-span-2 space-y-8">
              {renderTopology()}

              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button 
                    onClick={runSimulation}
                    disabled={transmissionState !== 'idle' && transmissionState !== 'received' && transmissionState !== 'aborted'}
                    className={`w-full sm:w-auto ${A1_RED_BG} hover:bg-red-700 text-white px-8 py-4 rounded-lg font-black tracking-widest uppercase shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 outline-none`}
                  >
                    Initiate Key Exchange
                  </button>
                  <button 
                    onClick={() => setAttackerActive(!attackerActive)}
                    className={`w-full sm:w-auto px-8 py-4 rounded-lg font-black tracking-widest uppercase border-2 transition-all duration-200 shadow-sm hover:-translate-y-0.5 outline-none ${attackerActive ? 'bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100 shadow-[0_4px_10px_rgba(245,158,11,0.2)]' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    {attackerActive ? 'Disable Attacker' : 'Simulate Attack (MitM)'}
                  </button>
                </div>

                {/* Status Output */}
                <div className="text-center sm:text-right w-full sm:w-auto bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[200px]">
                  <div className="text-xs text-slate-600 mb-1 font-bold uppercase tracking-widest">Network Status</div>
                  <div className="font-mono font-black text-xl tracking-wider">
                    {transmissionState === 'idle' && <span className="text-slate-500">READY</span>}
                    {transmissionState === 'sending' && <span className="text-blue-600 animate-pulse">TRANSMITTING...</span>}
                    {transmissionState === 'intercepted' && <span className="text-amber-600 animate-pulse">INTERCEPTED!</span>}
                    {transmissionState === 'received' && <span className="text-green-600">SECURE</span>}
                    {transmissionState === 'aborted' && <span className="text-red-600 flex items-center justify-center sm:justify-end"><ShieldAlert size={20} className="mr-2"/> ABORTED</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Analysis */}
            <div className="space-y-8">
              <div className={`bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden transition-colors duration-500`}>
                <div className={`absolute left-0 top-0 w-2 h-full ${currentTheme.barColor} transition-colors duration-500`}></div>
                <h3 className={`text-xl font-black ${currentTheme.textPrimary} mb-6 uppercase tracking-widest flex items-center`}>
                  <Activity className={`mr-3 ${currentTheme.textAccent}`}/> Architectural Impact
                </h3>
                
                <div className="space-y-6 text-sm">
                  <div>
                    <div className="text-slate-600 mb-2 font-bold uppercase tracking-wider text-xs">OSI Layer Operation</div>
                    <div className={`font-mono ${currentTheme.textPrimary} ${currentTheme.bgLight} p-4 rounded-lg border ${currentTheme.borderLight} font-bold text-base transition-colors duration-500`}>
                      {mode === 'classical' && "Layer 7 (Software/Math)"}
                      {mode === 'pqc' && "Layer 7 (Software/Lattice Math)"}
                      {mode === 'qkd' && "Layer 1 (Hardware/Physics)"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-600 mb-2 font-bold uppercase tracking-wider text-xs">Infrastructure Requirement</div>
                    <div className={`font-mono p-4 rounded-lg border leading-relaxed transition-colors duration-500 ${currentTheme.bgLight} ${currentTheme.borderLight} ${currentTheme.textPrimary} font-medium`}>
                      {mode === 'classical' && "Standard IP Network. No hardware changes required."}
                      {mode === 'pqc' && "Standard IP Network. Requires TLS 1.3 infrastructure updates."}
                      {mode === 'qkd' && "Dedicated dark fiber required. Highly secure physical bunkers (Trusted Nodes) required every ~100km."}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-600 mb-2 font-bold uppercase tracking-wider text-xs">Network Payload (Public Key)</div>
                    <div className={`font-mono ${currentTheme.textPrimary} ${currentTheme.bgLight} p-4 rounded-lg border ${currentTheme.borderLight} flex items-center justify-between font-bold transition-colors duration-500`}>
                      <span>
                        {mode === 'classical' && "Small (e.g., 32B for ECC)"}
                        {mode === 'pqc' && <span className="text-emerald-800">Massive (1,184B for ML-KEM)</span>}
                        {mode === 'qkd' && "N/A (Single Photons)"}
                      </span>
                      {mode === 'pqc' && <Activity size={20} className="text-emerald-600 animate-pulse"/>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                <div className={`absolute left-0 top-0 w-2 h-full ${mode === 'classical' ? 'bg-red-500' : 'bg-green-500'} transition-colors duration-500`}></div>
                <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center">
                  <Shield className="mr-3 text-slate-500"/> Security Analysis
                </h3>
                
                {mode === 'qkd' && (
                  <div className="mb-6 bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-700 mb-2 font-bold uppercase tracking-wider">Quantum Bit Error Rate (QBER)</div>
                    <div className="flex items-center">
                      <div className="w-full bg-slate-200 rounded-full h-3 mr-4 border border-slate-300">
                        <div className={`h-3 rounded-full transition-all duration-500 ${qber > 11 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${qber}%` }}></div>
                      </div>
                      <span className={`font-mono font-black text-lg ${qber > 11 ? 'text-amber-600' : 'text-green-600'}`}>{qber}%</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-3 italic leading-relaxed border-t border-slate-200 pt-2">Threshold: ~11%. Attacker's measurement forces collapse.</p>
                  </div>
                )}

                <div className="text-sm space-y-6">
                  <div className="flex items-start bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="mt-1 mr-4 bg-white p-2 rounded-md border border-slate-300 shadow-sm">
                      {mode === 'qkd' ? <Unlock className="text-amber-500" size={20}/> : (mode === 'classical' ? <Unlock className="text-red-600" size={20}/> : <Lock className="text-green-600" size={20}/>)}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 uppercase tracking-wider text-xs mb-1">Against Quantum Computers</div>
                      <div className={`leading-relaxed font-medium ${mode === 'classical' ? 'text-red-700' : (mode === 'qkd' ? 'text-amber-700' : 'text-green-700')}`}>
                        {mode === 'classical' && "Vulnerable (Shor's Algorithm). Attacker saves packets now to decrypt later (SNDL)."}
                        {mode === 'pqc' && "Secure. Mathematically resistant to known quantum algorithms."}
                        {mode === 'qkd' && "Physics link secure, BUT breaks end-to-end encryption. The Trusted Node holds plaintext keys in memory, making it a highly vulnerable classical attack vector."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="mt-1 mr-4 bg-white p-2 rounded-md border border-slate-300 shadow-sm">
                      {attackerActive && mode === 'qkd' ? <Activity className="text-blue-600" size={20}/> : <Wifi className="text-slate-500" size={20}/>}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 uppercase tracking-wider text-xs mb-1">Eavesdropping Detection</div>
                      <div className="text-slate-700 leading-relaxed font-medium">
                        {mode === 'classical' && "None. Attacker can copy IP packets passively without detection."}
                        {mode === 'pqc' && "None. Attacker can copy IP packets passively, but cannot read them."}
                        {mode === 'qkd' && <span className="text-blue-700 font-bold">Immediate. Measuring a photon alters its state. Alice and Bob detect the spike in error rates and abort.</span>}
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