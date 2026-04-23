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
            Adjust the connections per second to see how Post-Quantum Cryptography trades CPU efficiency for massive network and memory overhead in a highly concurrent environment.
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
          
          {/* Standard IP Channel */}
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
            </div>
          )}

          {/* Eve the Attacker */}
          <div className={`absolute top-1/2 ${mode === 'qkd' ? 'left-[25%]' : 'left-1/2'} transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 transition-all duration-500`}>
            <div className={`w-12 h-12 rounded bg-slate-800 border-2 flex items-center justify-center transition-colors duration-300 ${eveActive ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-slate-600 opacity-50'}`}>
              <Eye className={eveActive ? 'text-red-500' : 'text-slate-500'} size={24} />
            </div>
            <span className={`mt-1 text-xs font-bold ${eveActive ? 'text-red-400' : 'text-slate-500'}`}>Eve</span>
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
                <Shield className="mr-2 text-indigo-400" /> Quantum Network Architecture Simulator
              </h1>
              <p className="text-slate-400 text-sm">
                Evaluate the OSI layer impact of Classical vs. Post-Quantum mechanisms.
              </p>
            </div>
            
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