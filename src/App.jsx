import React, { useState, useEffect } from 'react';
import { Network, Server, Shield, ShieldAlert, Zap, Activity, Eye, Lock, Unlock, HardDrive, Wifi, Cpu, Database, BarChart2 } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('architecture'); // architecture, resources
  const [mode, setMode] = useState('classical'); // classical, pqc, qkd
  const [eveActive, setEveActive] = useState(false);
  const [transmissionState, setTransmissionState] = useState('idle'); // idle, sending, intercepted, received, aborted
  const [qber, setQber] = useState(0); // Quantum Bit Error Rate
  const [cps, setCps] = useState(1000); // Connections Per Second for the resource simulator

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
      rsa: { name: 'RSA-3072', cpuFactor: 100, keySize: 384, cipherSize: 384, bufferMultiplier: 1.5, color: 'bg-yellow-500' },
      ecc: { name: 'ECC (P-256)', cpuFactor: 40, keySize: 32, cipherSize: 32, bufferMultiplier: 1.0, color: 'bg-blue-500' },
      mlkem: { name: 'ML-KEM-768 (PQC)', cpuFactor: 15, keySize: 1184, cipherSize: 1088, bufferMultiplier: 12.0, color: 'bg-green-500' }
    };

    const calculateLoad = (algo) => {
      const data = metrics[algo];
      const cpuLoad = (data.cpuFactor * cps) / 100; // Arbitrary units for visualization
      const bandwidthKBps = (cps * (data.keySize + data.cipherSize)) / 1024;
      // Memory = base socket memory + (payload size * buffer multiplier) per connection
      const memoryMB = (cps * (8 + (data.keySize + data.cipherSize) * data.bufferMultiplier / 1024)) / 1024; 
      return { cpuLoad, bandwidthKBps, memoryMB, ...data };
    };

    const currentLoad = calculateLoad(mode === 'pqc' ? 'mlkem' : (mode === 'classical' ? 'ecc' : 'rsa'));

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="mr-2 text-indigo-400" /> Edge Terminations Simulator
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Adjust the connections per second to see how Post-Quantum Cryptography trades CPU efficiency for massive network and memory overhead in a highly concurrent environment (e.g., Telco Edge or Ingress Load Balancer).
          </p>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300 font-bold">Connections Per Second (CPS)</span>
              <span className="text-indigo-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">{cps.toLocaleString()} req/s</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="50000" 
              step="100"
              value={cps}
              onChange={(e) => setCps(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Metric */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center mb-4 text-slate-300">
                <Cpu className="mr-2 text-red-400" size={20}/> 
                <span className="font-bold">Relative CPU Load</span>
              </div>
              <div className="space-y-4">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && algo === 'mlkem') || (mode === 'classical' && algo === 'ecc');
                  return (
                    <div key={algo} className={`relative ${isSelected ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{data.name}</span>
                        <span className="font-mono text-slate-400">{data.cpuLoad.toLocaleString()} units</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${data.color}`} style={{ width: `${Math.min((data.cpuLoad / 50000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-[10px] text-slate-500 italic leading-tight">
                * CPU cycles required for key generation and encapsulation. ML-KEM lattice math is highly optimized for modern SIMD.
              </div>
            </div>

            {/* Bandwidth Metric */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center mb-4 text-slate-300">
                <Activity className="mr-2 text-blue-400" size={20}/> 
                <span className="font-bold">Network Bandwidth</span>
              </div>
              <div className="space-y-4">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && algo === 'mlkem') || (mode === 'classical' && algo === 'ecc');
                  return (
                    <div key={algo} className={`relative ${isSelected ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{data.name}</span>
                        <span className="font-mono text-slate-400">{(data.bandwidthKBps / 1024).toFixed(2)} MB/s</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${data.color}`} style={{ width: `${Math.min((data.bandwidthKBps / 111000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
               <div className="mt-4 text-[10px] text-slate-500 italic leading-tight">
                * Pure payload size on the wire. ML-KEM pushes TLS handshakes well over standard 1500B MTU limits, causing fragmentation.
              </div>
            </div>

            {/* Memory Metric */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center mb-4 text-slate-300">
                <Database className="mr-2 text-purple-400" size={20}/> 
                <span className="font-bold">Edge Memory (RAM)</span>
              </div>
              <div className="space-y-4">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && algo === 'mlkem') || (mode === 'classical' && algo === 'ecc');
                  return (
                    <div key={algo} className={`relative ${isSelected ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{data.name}</span>
                        <span className="font-mono text-slate-400">{data.memoryMB.toFixed(2)} GB</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${data.color}`} style={{ width: `${Math.min((data.memoryMB / 1.5) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
               <div className="mt-4 text-[10px] text-slate-500 italic leading-tight">
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
      <div className="relative w-full h-64 bg-slate-900 rounded-xl p-4 flex items-center justify-between overflow-hidden border border-slate-700 shadow-inner">
        {/* Alice */}
        <div className="z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Server className="text-white" size={32} />
          </div>
          <span className="mt-2 font-bold text-blue-300">Alice (HQ)</span>
        </div>

        {/* Network Channels */}
        <div className="flex-1 h-full relative flex flex-col justify-center px-4">
          
          {/* Standard IP Channel (Always present) */}
          <div className="relative w-full h-8 mb-4 flex items-center">
            <div className="absolute w-full h-1 bg-slate-600 top-1/2 transform -translate-y-1/2 border-t border-b border-slate-500"></div>
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 font-mono">
              Public IP Network (Layer 3)
            </span>
            
            {/* Packet Animation */}
            {transmissionState !== 'idle' && (
              <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-1/2' : 'left-full'} -ml-4`}>
                <div className={`
                  flex items-center justify-center rounded
                  ${mode === 'classical' ? 'w-8 h-6 bg-yellow-400' : ''}
                  ${mode === 'pqc' ? 'w-24 h-10 bg-green-500 border-2 border-white' : ''}
                  ${mode === 'qkd' ? 'w-8 h-4 bg-gray-500' : ''}
                `}>
                  {mode === 'pqc' && <span className="text-[10px] font-bold text-white px-1">ML-KEM (1184B)</span>}
                  {mode === 'classical' && <span className="text-[10px] font-bold text-black">RSA</span>}
                  {mode === 'qkd' && <span className="text-[10px] text-white">Auth</span>}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Quantum Channel (Only QKD) */}
          {mode === 'qkd' && (
            <div className="relative w-full h-16 flex items-center mt-8">
              {/* Link 1 (Alice to Node) */}
              <div className="absolute w-[45%] h-2 bg-purple-900/50 top-1/2 transform -translate-y-1/2 left-0 rounded-l-full shadow-[0_0_10px_rgba(168,85,247,0.4)] border border-purple-500/30"></div>
              {/* Link 2 (Node to Bob) */}
              <div className="absolute w-[45%] h-2 bg-purple-900/50 top-1/2 transform -translate-y-1/2 right-0 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.4)] border border-purple-500/30"></div>
              
              {/* Trusted Repeater Node */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="w-10 h-10 bg-orange-900/80 rounded border-2 border-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                  <Unlock className="text-orange-400" size={18} />
                </div>
                <span className="mt-1 text-[9px] font-bold text-orange-400 text-center leading-tight uppercase">Trusted<br/>Repeater</span>
              </div>

              <span className="absolute -top-4 left-1/4 transform -translate-x-1/2 text-[10px] text-purple-400 font-mono flex items-center">
                <Zap size={10} className="mr-1"/> Link 1
              </span>
              <span className="absolute -top-4 left-3/4 transform -translate-x-1/2 text-[10px] text-purple-400 font-mono flex items-center">
                <Zap size={10} className="mr-1"/> Link 2
              </span>

              {/* Photon Animation Link 1 */}
              {transmissionState !== 'idle' && (
                <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-linear ${transmissionState === 'sending' ? 'left-0' : transmissionState === 'intercepted' ? 'left-[25%]' : 'left-[50%]'} -ml-2 z-10`}>
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

          {/* Eve the Attacker */}
          <div className={`absolute top-1/2 ${mode === 'qkd' ? 'left-[25%]' : 'left-1/2'} transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 transition-all duration-500`}>
            <div className={`w-12 h-12 rounded bg-slate-800 border-2 flex items-center justify-center transition-colors duration-300 ${eveActive ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-slate-600 opacity-50'}`}>
              <Eye className={eveActive ? 'text-red-500' : 'text-slate-500'} size={24} />
            </div>
            <span className={`mt-1 text-xs font-bold ${eveActive ? 'text-red-400' : 'text-slate-500'}`}>Eve</span>
            {transmissionState === 'intercepted' && (
              <span className="absolute -bottom-6 text-[10px] text-red-400 bg-slate-900 px-1 rounded border border-red-900 whitespace-nowrap">
                {mode === 'qkd' ? 'Measuring Photons...' : 'Copying Packets...'}
              </span>
            )}
          </div>
        </div>

        {/* Bob */}
        <div className="z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <HardDrive className="text-white" size={32} />
          </div>
          <span className="mt-2 font-bold text-blue-300">Bob (Data Center)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Shield className="mr-2 text-indigo-400" /> Cryptography Architecture Simulator
              </h1>
              <p className="text-slate-400 text-sm">
                Evaluate the OSI layer impact, infrastructure requirements, and system resource utilization of Classical vs. Post-Quantum mechanisms.
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setActiveTab('architecture')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'architecture' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Network Topology
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'resources' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Resource Impact
              </button>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={() => setMode('classical')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${mode === 'classical' ? 'border-blue-500 bg-blue-900/30 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
            >
              <div className="font-bold">Classical (RSA/ECC)</div>
              <div className="text-xs mt-1 opacity-70">Software / Math based</div>
            </button>
            <button 
              onClick={() => setMode('pqc')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${mode === 'pqc' ? 'border-green-500 bg-green-900/30 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
            >
              <div className="font-bold">PQC (ML-KEM)</div>
              <div className="text-xs mt-1 opacity-70">Software / Lattice Math</div>
            </button>
            <button 
              onClick={() => setMode('qkd')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${mode === 'qkd' ? 'border-purple-500 bg-purple-900/30 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
            >
              <div className="font-bold">QKD (BB84)</div>
              <div className="text-xs mt-1 opacity-70">Hardware / Physics based</div>
            </button>
          </div>
        </div>

        {/* Main Simulator Area */}
        {activeTab === 'architecture' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Left Column: Visualization & Controls */}
            <div className="lg:col-span-2 space-y-6">
              {renderTopology()}

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center justify-between">
                <div className="space-x-4">
                  <button 
                    onClick={runSimulation}
                    disabled={transmissionState !== 'idle' && transmissionState !== 'received' && transmissionState !== 'aborted'}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Initiate Key Exchange
                  </button>
                  <button 
                    onClick={() => setEveActive(!eveActive)}
                    className={`px-6 py-2 rounded font-bold border transition-colors ${eveActive ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {eveActive ? 'Disable Eve' : 'Enable Eve (Eavesdrop)'}
                  </button>
                </div>

                {/* Status Output */}
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Status</div>
                  <div className="font-mono font-bold text-lg">
                    {transmissionState === 'idle' && <span className="text-slate-500">Ready</span>}
                    {transmissionState === 'sending' && <span className="text-blue-400 animate-pulse">Transmitting...</span>}
                    {transmissionState === 'intercepted' && <span className="text-red-500 animate-pulse">Intercepted by Eve!</span>}
                    {transmissionState === 'received' && <span className="text-green-400">Key Established</span>}
                    {transmissionState === 'aborted' && <span className="text-red-500 flex items-center"><ShieldAlert size={18} className="mr-1"/> Protocol Aborted</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Analysis */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Architectural Impact</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-slate-400 mb-1">OSI Layer Operation</div>
                    <div className="font-mono text-slate-200 bg-slate-800 p-2 rounded border border-slate-700">
                      {mode === 'classical' && "Layer 7 (Software/Math)"}
                      {mode === 'pqc' && "Layer 7 (Software/Lattice Math)"}
                      {mode === 'qkd' && "Layer 1 (Hardware/Physics)"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1">Infrastructure Requirement</div>
                    <div className={`font-mono p-2 rounded border ${mode === 'qkd' ? 'bg-purple-900/20 border-purple-500/50 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
                      {mode === 'classical' && "Standard IP Network. No hardware changes."}
                      {mode === 'pqc' && "Standard IP Network. Requires TLS 1.3 updates."}
                      {mode === 'qkd' && "Dedicated dark fiber. Highly secure physical bunkers (Trusted Nodes) required every ~100km to act as repeaters."}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1">Network Payload Size (Public Key)</div>
                    <div className="font-mono text-slate-200 bg-slate-800 p-2 rounded border border-slate-700 flex items-center justify-between">
                      <span>
                        {mode === 'classical' && "Small (e.g., 32B for ECC)"}
                        {mode === 'pqc' && "Massive (e.g., 1,184B for ML-KEM-768)"}
                        {mode === 'qkd' && "N/A (Single Photons)"}
                      </span>
                      {mode === 'pqc' && <Activity size={16} className="text-yellow-500"/>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Security Analysis</h3>
                
                {mode === 'qkd' && (
                  <div className="mb-4 bg-slate-950 p-3 rounded border border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">Quantum Bit Error Rate (QBER)</div>
                    <div className="flex items-center">
                      <div className="w-full bg-slate-800 rounded-full h-2.5 mr-2">
                        <div className={`h-2.5 rounded-full ${qber > 11 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${qber}%` }}></div>
                      </div>
                      <span className={`font-mono text-xs ${qber > 11 ? 'text-red-400' : 'text-green-400'}`}>{qber}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Threshold: ~11%. Eve's measurement forces collapse.</p>
                  </div>
                )}

                <div className="text-sm space-y-3">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2">
                      {mode === 'qkd' ? <Unlock className="text-orange-500" size={16}/> : (mode === 'classical' ? <Unlock className="text-red-500" size={16}/> : <Lock className="text-green-500" size={16}/>)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">Against Quantum Computers: </span>
                      <span className={mode === 'classical' ? 'text-red-400' : (mode === 'qkd' ? 'text-orange-400' : 'text-green-400')}>
                        {mode === 'classical' && "Vulnerable (Shor's Algorithm). Eve saves packets now to decrypt later (SNDL)."}
                        {mode === 'pqc' && "Secure. Mathematically resistant to known quantum algorithms."}
                        {mode === 'qkd' && "Physics link secure, BUT breaks end-to-end encryption. The Trusted Node holds plaintext keys in memory, making it a highly vulnerable classical attack vector."}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2">
                      {eveActive && mode === 'qkd' ? <Activity className="text-blue-400" size={16}/> : <Wifi className="text-slate-500" size={16}/>}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">Eavesdropping Detection: </span>
                      <span className="text-slate-400">
                        {mode === 'classical' && "None. Eve can copy IP packets passively without detection."}
                        {mode === 'pqc' && "None. Eve can copy IP packets passively, but cannot read them."}
                        {mode === 'qkd' && "Immediate. Measuring a photon alters its state. Alice and Bob detect the spike in error rates and abort."}
                      </span>
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
