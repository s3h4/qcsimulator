import React, { useState, useEffect, useRef } from 'react';
import { Network, Server, Shield, ShieldAlert, Zap, Activity, UserX, Lock, Unlock, HardDrive, Wifi, Cpu, Database, BarChart2, Smartphone, LayoutTemplate, Package, Sparkles, Key, Info } from 'lucide-react';
import a1Logo from '../A1_red_logo.png';

class PausableTimer {
  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
    this.timerId = null;
    this.start = null;
    this.isPaused = false;
    this.hasFinished = false;
    this.resume();
  }
  pause() {
    if (this.isPaused || this.hasFinished) return;
    this.isPaused = true;
    clearTimeout(this.timerId);
    this.remaining -= (Date.now() - this.start);
  }
  resume() {
    if (!this.isPaused && this.timerId !== null) return;
    if (this.hasFinished) return;
    this.isPaused = false;
    this.start = Date.now();
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.hasFinished = true;
      this.callback();
    }, this.remaining);
  }
  clear() {
    this.hasFinished = true;
    clearTimeout(this.timerId);
  }
}

const App = () => {
  const [activeTab, setActiveTab] = useState('architecture'); // architecture, resources
  const [mode, setMode] = useState('classical'); // classical, pqc, qkd
  const [attackerActive, setAttackerActive] = useState(false);
  const [transmissionState, setTransmissionState] = useState('idle'); // idle, sending, intercepted, received, aborted
  const [qber, setQber] = useState(0); // Quantum Bit Error Rate
  const [cps, setCps] = useState(1000); // Connections Per Second for the resource simulator
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState('ltr'); // ltr or rtl

  const attackerActiveRef = useRef(attackerActive);
  useEffect(() => {
    attackerActiveRef.current = attackerActive;
  }, [attackerActive]);

  const isTransmittingRef = useRef(isTransmitting);
  useEffect(() => {
    isTransmittingRef.current = isTransmitting;
  }, [isTransmitting]);

  const runSimulationRef = useRef(null);

  // A1 Brand Identity
  const A1_RED_BG = "bg-[#E50000]";
  const A1_RED_TEXT = "text-[#E50000]";
  const A1_RED_BORDER = "border-[#E50000]";

  // Dark Theme Mapping for Tailwind JIT Compiler
  const themes = {
    classical: {
      id: 'classical',
      name: 'Classical Encryption',
      desc: 'Software / Algebraic security',
      btnActive: 'border-blue-500 bg-blue-900/20 shadow-[0_4px_15px_rgba(59,130,246,0.15)]',
      textPrimary: 'text-blue-400',
      textAccent: 'text-blue-500',
      bgLight: 'bg-blue-900/20',
      borderLight: 'border-blue-800/50',
      borderMain: 'border-blue-500',
      barColor: 'bg-blue-500',
      packetBg: 'bg-blue-600',
      packetText: 'text-white'
    },
    pqc: {
      id: 'pqc',
      name: 'Post-Quantum Cryptography',
      desc: 'Software / Post-Quantum security',
      btnActive: 'border-emerald-500 bg-emerald-900/20 shadow-[0_4px_15px_rgba(16,185,129,0.15)]',
      textPrimary: 'text-emerald-400',
      textAccent: 'text-emerald-500',
      bgLight: 'bg-emerald-900/20',
      borderLight: 'border-emerald-800/50',
      borderMain: 'border-emerald-500',
      barColor: 'bg-emerald-500',
      packetBg: 'bg-emerald-600',
      packetText: 'text-white'
    },
    qkd: {
      id: 'qkd',
      name: 'Quantum Key Distribution',
      desc: 'Hardware / Quantum light',
      btnActive: 'border-purple-500 bg-purple-900/20 shadow-[0_4px_15px_rgba(168,85,247,0.15)]',
      textPrimary: 'text-purple-400',
      textAccent: 'text-purple-500',
      bgLight: 'bg-purple-900/20',
      borderLight: 'border-purple-800/50',
      borderMain: 'border-purple-500',
      barColor: 'bg-purple-500',
      packetBg: 'bg-purple-600',
      packetText: 'text-white'
    }
  };

  const currentTheme = themes[mode];

  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => {
      if (t && typeof t.clear === 'function') t.clear();
    });
    timeoutsRef.current = [];
  };

  // Reset state when mode changes
  useEffect(() => {
    setIsTransmitting(false);
    setIsPaused(false);
    isTransmittingRef.current = false;
    clearTimeouts();
    setTransmissionState('idle');
    setQber(0);
    setAttackerActive(false);
    setDirection('ltr');
  }, [mode]);

  // Aggressively sync pause state with CSS animations and SVG animations
  useEffect(() => {
    document.querySelectorAll('.packet-anim, .packet-anim *').forEach(el => {
      el.getAnimations().forEach(a => {
        if (isPaused) {
          a.pause();
        } else if (a.playState === 'paused') {
          a.play();
        }
      });
    });
    document.querySelectorAll('svg').forEach(svg => {
      if (isPaused) {
        if (svg.pauseAnimations) svg.pauseAnimations();
      } else {
        if (svg.unpauseAnimations) svg.unpauseAnimations();
      }
    });
  }); // Runs after every render to ensure transitions freeze perfectly

  const runSimulation = (dir = 'ltr') => {
    setDirection(dir);
    clearTimeouts();
    setTransmissionState('idle');
    setQber(0);

    if (!isTransmittingRef.current) return;

    // Brief delay to allow the DOM to reset to idle state
    const t1 = new PausableTimer(() => {
      setTransmissionState('sending');

      // Start animation
      const t2 = new PausableTimer(() => {
        if (attackerActiveRef.current) {
          setTransmissionState('moving_to_intercept');
        } else {
          setTransmissionState('moving');
        }
      }, 100);

      const t3 = new PausableTimer(() => {
        if (attackerActiveRef.current) {
          setTransmissionState('intercepted');
        }
      }, 1100); // 1000ms to reach middle

      const t3_5 = new PausableTimer(() => {
        if (attackerActiveRef.current) {
          setTransmissionState('moving_after_intercept');
        }
      }, 2100); // Pauses for 1000ms

      const finalTime = attackerActiveRef.current ? 3100 : 2100;

      // Final state reached
      const t4 = new PausableTimer(() => {
        if (mode === 'qkd' && attackerActiveRef.current) {
          setQber(Math.floor(Math.random() * 25) + 25); // 25-50% error rate
          setTransmissionState('aborted'); // Protocol aborts due to high QBER
        } else {
          setTransmissionState('received');
        }
        
        // Loop if still transmitting
        if (isTransmittingRef.current) {
          const t5 = new PausableTimer(() => {
            if (runSimulationRef.current) {
              runSimulationRef.current(dir === 'ltr' ? 'rtl' : 'ltr');
            }
          }, 1500); // Wait 1.5s before sending next packet
          timeoutsRef.current.push(t5);
        }
      }, finalTime); 

      timeoutsRef.current.push(t2, t3, t3_5, t4);
    }, 100);

    timeoutsRef.current.push(t1);
  };

  useEffect(() => {
    runSimulationRef.current = runSimulation;
  });

  const toggleTransmission = () => {
    if (!isTransmitting) {
      setIsTransmitting(true);
      setIsPaused(false);
      isTransmittingRef.current = true;
      runSimulation('ltr');
    } else if (!isPaused) {
      setIsPaused(true);
      timeoutsRef.current.forEach(t => t.pause());
    } else {
      setIsPaused(false);
      timeoutsRef.current.forEach(t => t.resume());
    }
  };

  const handleAttackerToggle = () => {
    setAttackerActive(!attackerActive);
  };

  const getPacketPosition = () => {
    if (transmissionState === 'idle' || transmissionState === 'sending') {
      return direction === 'ltr' ? '-left-48' : 'left-full';
    }
    if (transmissionState === 'moving_to_intercept' || transmissionState === 'intercepted') {
      return 'left-1/2 -translate-x-1/2';
    }
    return direction === 'ltr' ? 'left-full' : '-left-48';
  };

  const getPacketDuration = () => {
    if (transmissionState === 'moving_to_intercept' || transmissionState === 'moving_after_intercept') {
      return 'duration-[1000ms]';
    }
    if (transmissionState === 'intercepted') {
      return 'duration-[0ms]';
    }
    return 'duration-[2000ms]';
  };

  const renderResourceImpact = () => {
    const metrics = {
      rsa: { id: 'rsa', name: 'Classical RSA/ECC', cpuFactor: 100, keySize: 384, cipherSize: 384, bufferMultiplier: 1.5, themeId: 'classical' },
      ecc: { id: 'ecc', name: 'Classical ECC', cpuFactor: 40, keySize: 32, cipherSize: 32, bufferMultiplier: 1.0, themeId: 'classical' },
      mlkem: { id: 'mlkem', name: 'Post-Quantum key material', cpuFactor: 15, keySize: 1184, cipherSize: 1088, bufferMultiplier: 12.0, themeId: 'pqc' }
    };

    const calculateLoad = (algo) => {
      const data = metrics[algo];
      const cpuLoad = (data.cpuFactor * cps) / 100; 
      const bandwidthKBps = (cps * (data.keySize + data.cipherSize)) / 1024;
      const memoryMB = (cps * (8 + (data.keySize + data.cipherSize) * data.bufferMultiplier / 1024)) / 1024; 
      return { cpuLoad, bandwidthKBps, memoryMB, ...data };
    };

    return (
      <div className="animate-in fade-in duration-500 w-full h-full overflow-y-auto pr-2 pb-4 max-w-7xl mx-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900/50 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-zinc-100 mb-4 flex items-center tracking-tight">
            <Activity className={`mr-3 ${currentTheme.textAccent} w-8 h-8`} /> Edge Terminations Simulator
          </h2>
          <p className="text-base text-zinc-400 mb-8 border-l-4 border-zinc-700 pl-4">
            Adjust the connections per second to see how Post-Quantum Cryptography trades CPU efficiency for massive network and memory overhead in a highly concurrent environment.
          </p>

          <div className={`${currentTheme.bgLight} p-6 rounded-xl border ${currentTheme.borderLight} mb-10 transition-colors duration-500`}>
            <div className="flex justify-between text-base mb-4">
              <span className={`${currentTheme.textPrimary} font-bold uppercase tracking-wider`}>Connections Per Second (CPS)</span>
              <span className={`font-mono font-bold bg-zinc-950 px-3 py-1 rounded border ${currentTheme.borderLight} ${currentTheme.textAccent} shadow-sm`}>
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
              className={`w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer border border-zinc-700 outline-none focus:ring-2 transition-shadow`}
              style={{ accentColor: mode === 'classical' ? '#3b82f6' : (mode === 'pqc' ? '#10b981' : '#a855f7') }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CPU Metric Box */}
            <div className={`bg-zinc-800/50 p-6 rounded-xl border ${currentTheme.borderLight} shadow-md relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${currentTheme.barColor} transition-colors duration-500`}></div>
              <div className="flex items-center mb-6 text-zinc-200">
                <Cpu className={`mr-3 ${currentTheme.textAccent}`} size={24}/> 
                <span className="font-black tracking-wide">Relative CPU Load</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && data.themeId === 'pqc') || (mode === 'classical' && data.themeId === 'classical');
                  const barBg = isSelected ? currentTheme.barColor : 'bg-zinc-600';
                  
                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-200 font-bold">{data.name}</span>
                        <span className="font-mono text-zinc-300 font-bold">{data.cpuLoad.toLocaleString()} units</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-3 border border-zinc-700">
                        <div className={`h-3 rounded-full ${barBg} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.cpuLoad / 50000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bandwidth Metric Box */}
            <div className={`bg-zinc-800/50 p-6 rounded-xl border ${currentTheme.borderLight} shadow-md relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${currentTheme.barColor} transition-colors duration-500`}></div>
              <div className="flex items-center mb-6 text-zinc-200">
                <Activity className={`mr-3 ${currentTheme.textAccent}`} size={24}/> 
                <span className="font-black tracking-wide">Network Bandwidth</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && data.themeId === 'pqc') || (mode === 'classical' && data.themeId === 'classical');
                  const barBg = isSelected ? currentTheme.barColor : 'bg-zinc-600';

                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-200 font-bold">{data.name}</span>
                        <span className="font-mono text-zinc-300 font-bold">{(data.bandwidthKBps / 1024).toFixed(2)} MB/s</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-3 border border-zinc-700">
                        <div className={`h-3 rounded-full ${barBg} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.bandwidthKBps / 111000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Memory Metric Box */}
            <div className={`bg-zinc-800/50 p-6 rounded-xl border ${currentTheme.borderLight} shadow-md relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${currentTheme.barColor} transition-colors duration-500`}></div>
              <div className="flex items-center mb-6 text-zinc-200">
                <Database className={`mr-3 ${currentTheme.textAccent}`} size={24}/> 
                <span className="font-black tracking-wide">Edge Memory (RAM)</span>
              </div>
              <div className="space-y-5">
                {['rsa', 'ecc', 'mlkem'].map(algo => {
                  const data = calculateLoad(algo);
                  const isSelected = (mode === 'pqc' && data.themeId === 'pqc') || (mode === 'classical' && data.themeId === 'classical');
                  const barBg = isSelected ? currentTheme.barColor : 'bg-zinc-600';

                  return (
                    <div key={algo} className={`relative transition-all duration-300 ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-200 font-bold">{data.name}</span>
                        <span className="font-mono text-zinc-300 font-bold">{data.memoryMB.toFixed(2)} GB</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-3 border border-zinc-700">
                        <div className={`h-3 rounded-full ${barBg} transition-all duration-500 ease-out`} style={{ width: `${Math.min((data.memoryMB / 1.5) * 100, 100)}%` }}></div>
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
    const showVerdict = transmissionState === 'moving_after_intercept' || transmissionState === 'received' || transmissionState === 'aborted';
    const isIntercepting = transmissionState === 'intercepted';
    const hasBeenMeasured = attackerActive && (transmissionState === 'intercepted' || transmissionState === 'moving_after_intercept' || transmissionState === 'aborted');

    return (
      <div className="relative w-full flex-1 min-h-[340px] bg-zinc-900 rounded-xl p-4 sm:p-6 flex items-center justify-between overflow-hidden border border-zinc-800 shadow-xl">
        {/* Dark Mode Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Sender (Alice/A1 User/Vienna 1) */}
        <div className="z-10 flex flex-col items-center text-center w-24 relative">
          <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center border-2 border-zinc-700 shadow-md relative">
            <div className={`absolute -right-2 -top-2 w-4 h-4 rounded-full ${
              ((transmissionState !== 'idle' && transmissionState !== 'received' && transmissionState !== 'aborted' && direction === 'ltr') || 
               ((transmissionState === 'received' || transmissionState === 'aborted') && direction === 'rtl')) 
               ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'} shadow-sm`}></div>
            {mode === 'qkd' ? <Server className="text-zinc-300" size={40} /> : <Smartphone className="text-zinc-300" size={40} />}
          </div>
          <span className="mt-3 font-black text-zinc-300 tracking-widest uppercase text-[10px] sm:text-xs leading-tight whitespace-pre-line">
            {mode === 'qkd' ? 'A1 Datacenter\nVienna 1' : 'A1 User'}
          </span>
          {/* Animated Key Confirmation */}
          {transmissionState === 'received' && (
            <div className="absolute -bottom-8 flex items-center justify-center bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-in slide-in-from-top-2 fade-in duration-300 whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Key size={10} className="mr-1"/> Key Synced
            </div>
          )}
        </div>

        {/* Network Channels */}
        <div className="flex-1 h-full relative flex flex-col justify-center px-4 sm:px-8">
          <div className="relative w-full flex flex-col">
            
            {/* Standard IP Channel (Only for Classical and PQC) */}
            {mode !== 'qkd' && (
              <div className="relative w-full">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest bg-zinc-900 px-3 border border-zinc-700 rounded-full shadow-sm z-10 whitespace-nowrap">
                  PUBLIC IP NETWORK (LAYER 3)
                </span>
                
                {/* IP Network Pipe */}
                <div className="relative w-full h-16 bg-zinc-800/80 border-y-2 border-dashed border-zinc-600 shadow-inner overflow-hidden flex items-center">
                  {/* Decorative horizontal track lines */}
                  <div className="absolute w-full h-px bg-zinc-700/50 top-1/3"></div>
                  <div className="absolute w-full h-px bg-zinc-700/50 top-2/3"></div>

                  {/* Packet Animation */}
                  {transmissionState !== 'idle' && (
                    <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all ${getPacketDuration()} ease-linear ${getPacketPosition()} z-20 packet-anim`}>
                      <div className={`relative flex items-center justify-center rounded-2xl shadow-lg transition-all duration-500 ${mode === 'classical' ? 'w-20 h-10 bg-blue-600 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : ''} ${mode === 'pqc' ? 'w-40 h-12 bg-emerald-600 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : ''}`}>
                        {mode === 'classical' && (
                          <div className="flex items-center space-x-2 text-white text-[10px] uppercase font-black">
                            <Package size={18} className="text-white" />
                            <Lock size={14} className="text-white" />
                          </div>
                        )}
                        {mode === 'pqc' && (
                          <div className="flex items-center justify-start w-full px-3 space-x-3 text-white text-[10px] uppercase font-black">
                            <Package size={24} className="text-white flex-shrink-0" />
                            <div className="flex flex-col space-y-1 w-full">
                              <div className="text-[7px] leading-none text-emerald-200 tracking-widest">ML-KEM PAYLOAD</div>
                              <div className="grid grid-cols-6 gap-[2px] w-full">
                                {Array.from({ length: 12 }).map((_, i) => (
                                  <div key={i} className="h-1.5 bg-emerald-300/80 rounded-[1px] animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dedicated Quantum Channel (Only QKD) */}
            {mode === 'qkd' && (
              <div className="relative w-full">
                <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-purple-400 font-mono tracking-widest flex items-center bg-zinc-900 px-3 rounded-full border border-purple-800/50 shadow-sm z-10 whitespace-nowrap">
                  <Zap size={12} className="mr-2 text-purple-500"/> DEDICATED QUANTUM LINK (LAYER 1)
                </span>

                {/* The Quantum "Fiber Pipe" */}
                <div className="relative w-full h-10 bg-zinc-950 border-y-2 border-purple-600 overflow-hidden shadow-[inset_0_0_20px_rgba(168,85,247,0.2)] flex items-center rounded-full">
                  {/* Glowing core line */}
                  <div className="absolute w-full h-px bg-purple-500/80 top-1/2 transform -translate-y-1/2 shadow-[0_0_12px_rgba(168,85,247,1)]"></div>

                  {/* Photon Animation Link */}
                  {transmissionState !== 'idle' && (
                    <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all ${getPacketDuration()} ease-linear ${getPacketPosition()} z-10 packet-anim`}>
                      <div className="flex space-x-1 sm:space-x-2 items-center">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="relative flex items-center justify-center animate-pulse" style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}>
                            <svg
                              width="24"
                              height="16"
                              viewBox="0 0 24 16"
                              className={`transform transition-all duration-300 ${
                                hasBeenMeasured 
                                  ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,1)] scale-75' 
                                  : 'text-purple-300 drop-shadow-[0_0_10px_rgba(216,180,254,1)] scale-100'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {hasBeenMeasured ? (
                                /* Collapsed state: distinct particles/dots instead of waves */
                                <>
                                  <circle cx="6" cy="8" r="1.5" fill="currentColor" stroke="none" />
                                  <circle cx="18" cy="8" r="1.5" fill="currentColor" stroke="none" />
                                  <path d="M 4 8 L 20 8" strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
                                </>
                              ) : (
                                /* Wave state: undulating sine wave */
                                <path d="M 0 8 Q 3 2, 6 8 T 12 8 T 18 8 T 24 8" />
                              )}
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attacker Node (Amber Warning Theme) */}
            <div className={`absolute ${mode === 'qkd' ? '-top-3' : 'top-4'} left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30 transition-all duration-500 pointer-events-none`}>
              <div className="pointer-events-auto flex flex-col items-center relative">
                <div className={`w-16 h-16 rounded-xl bg-zinc-900 border-2 flex items-center justify-center transition-all duration-300 ${attackerActive ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110' : 'border-zinc-700 opacity-60'}`}>
                  <UserX className={attackerActive ? 'text-amber-500' : 'text-zinc-500'} size={32} />
                </div>
                <span className={`mt-3 text-sm font-black tracking-widest uppercase bg-zinc-900/90 px-2 py-1 border ${attackerActive ? 'border-amber-500 text-amber-500' : 'border-zinc-700 text-zinc-500'} rounded-md`}>Attacker</span>
                {transmissionState === 'intercepted' && (
                  <span className="absolute -bottom-10 text-[11px] font-bold text-zinc-950 bg-amber-400 border border-amber-500 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                    {mode === 'qkd' ? 'MEASURING PHOTONS...' : 'COPYING PACKETS...'}
                  </span>
                )}

                {/* HNDL Vault Visualization */}
                {attackerActive && (
                  <>
                    {/* Connecting SVG with Data Animation */}
                    <svg className="absolute pointer-events-none z-10" style={{ left: 'calc(50% + 2rem)', top: '2rem', width: '2rem', height: '4rem', overflow: 'visible' }}>
                      <path d="M 0 0 L 16 0 Q 32 0 32 16 L 32 48" fill="none" stroke="#71717a" strokeWidth="2" strokeDasharray="4 4" />
                      {isIntercepting && (
                        <circle r="4" fill={mode === 'classical' ? '#fbbf24' : (mode === 'pqc' ? '#10b981' : '#a855f7')} className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                          <animateMotion dur="0.6s" repeatCount="indefinite" path="M 0 0 L 16 0 Q 32 0 32 16 L 32 48" />
                        </circle>
                      )}
                    </svg>

                    {/* The Vault */}
                    <div className="absolute left-[calc(50%+4rem)] top-[4rem] w-48 bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl flex flex-col z-20">
                      <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <Database size={14} className={isIntercepting ? "text-amber-500 animate-pulse" : "text-zinc-500"} />
                          <span className="text-[10px] font-black tracking-wider text-zinc-300 uppercase">HNDL Vault</span>
                        </div>
                      </div>
                      
                      <div className={`h-16 w-full rounded-lg border flex items-center justify-center p-2 text-center transition-all duration-300 ${
                        showVerdict
                          ? (mode === 'classical' ? 'bg-amber-950/50 border-amber-500/50 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-950 border-zinc-800')
                          : (isIntercepting ? 'bg-zinc-800/80 border-zinc-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' : 'bg-zinc-950 border-zinc-800')
                      }`}>
                        {mode === 'classical' && (
                          <div className="flex flex-col items-center">
                            <span className={`text-[9px] font-black uppercase mb-0.5 ${showVerdict ? 'text-amber-500' : (isIntercepting ? 'text-amber-400 animate-pulse' : 'text-zinc-600')}`}>
                              {showVerdict ? 'Harvesting Data' : (isIntercepting ? 'Receiving...' : 'Waiting...')}
                            </span>
                            <span className={`text-[8px] uppercase font-bold leading-tight ${showVerdict ? 'text-amber-400/80' : 'text-zinc-700'}`}>
                              For Future Decryption
                            </span>
                          </div>
                        )}
                        {mode === 'pqc' && (
                          <div className="flex flex-col items-center">
                            <span className={`text-[9px] font-black uppercase mb-0.5 ${showVerdict ? 'text-emerald-500' : (isIntercepting ? 'text-emerald-400 animate-pulse' : 'text-zinc-600')}`}>
                              {showVerdict ? 'Data Rejected' : (isIntercepting ? 'Analyzing...' : 'Waiting...')}
                            </span>
                            <span className={`text-[8px] uppercase font-bold leading-tight ${showVerdict ? 'text-emerald-400/70' : 'text-zinc-700'}`}>
                              Quantum-Safe Math
                            </span>
                          </div>
                        )}
                        {mode === 'qkd' && (
                          <div className="flex flex-col items-center">
                            <span className={`text-[9px] font-black uppercase mb-0.5 ${showVerdict ? 'text-purple-500' : (isIntercepting ? 'text-purple-400 animate-pulse' : 'text-zinc-600')}`}>
                              {showVerdict ? 'No Data Stored' : (isIntercepting ? 'Measuring...' : 'Waiting...')}
                            </span>
                            <span className={`text-[8px] uppercase font-bold leading-tight ${showVerdict ? 'text-purple-400/70' : 'text-zinc-700'}`}>
                              State Collapsed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Receiver (Bob/A1 App/Vienna 2) */}
        <div className="z-10 flex flex-col items-center text-center w-24 relative">
          <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center border-2 border-zinc-700 shadow-md relative">
            <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-full ${
              ((transmissionState !== 'idle' && transmissionState !== 'received' && transmissionState !== 'aborted' && direction === 'rtl') || 
               ((transmissionState === 'received' || transmissionState === 'aborted') && direction === 'ltr')) 
               ? 'bg-emerald-500 animate-pulse shadow-sm' : 'bg-zinc-600'} shadow-sm`}></div>
            {mode === 'qkd' ? <HardDrive className="text-zinc-300" size={40} /> : <LayoutTemplate className="text-zinc-300" size={40} />}
          </div>
          <span className="mt-3 font-black text-zinc-300 tracking-widest uppercase text-[10px] sm:text-xs leading-tight whitespace-pre-line">
            {mode === 'qkd' ? 'A1 Datacenter\nVienna 2' : 'A1 App'}
          </span>
          {/* Animated Key Confirmation */}
          {transmissionState === 'received' && (
            <div className="absolute -bottom-8 flex items-center justify-center bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-in slide-in-from-top-2 fade-in duration-300 whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Key size={10} className="mr-1"/> Key Synced
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 p-2 sm:p-4 md:p-6 font-sans overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-800 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="max-w-[1800px] mx-auto gap-3 sm:gap-4 flex flex-col h-full min-h-[850px]">
        
        {/* Header - A1 Corporate Dark Theme */}
        <div className="bg-zinc-900 border-t-8 border-[#E50000] border-x border-b border-zinc-800 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex-shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 relative z-10">
            <div>
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(229,0,0,0.5)] overflow-hidden p-1`}>
                  <img src={a1Logo} alt="A1 Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight uppercase">
                  Cryptography Architecture Simulator
                </h1>
              </div>
              <p className="text-zinc-400 text-sm sm:text-base font-medium ml-14">
                Evaluate the OSI layer impact, infrastructure requirements, and system resource utilization of Classical vs. Post-Quantum mechanisms.
              </p>
            </div>
            
            {/* Tab Navigation - Dark Theme */}
            <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800 mt-6 md:mt-0 shadow-inner w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('architecture')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-md text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'architecture' ? `${A1_RED_BG} text-white shadow-[0_0_10px_rgba(229,0,0,0.4)]` : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
              >
                Architecture
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`flex-1 md:flex-none px-6 py-3 rounded-md text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'resources' ? `${A1_RED_BG} text-white shadow-[0_0_10px_rgba(229,0,0,0.4)]` : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
              >
                Resources
              </button>
            </div>
          </div>

          {/* Mode Selectors - Dark Theme */}
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 relative z-10">
            {Object.values(themes).map((t) => (
              <button 
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 group hover:-translate-y-1 ${mode === t.id ? t.btnActive : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'}`}
              >
                <div className={`font-black text-lg tracking-wide ${mode === t.id ? t.textPrimary : 'text-zinc-300'}`}>{t.name}</div>
                <div className={`text-xs mt-2 font-bold tracking-widest uppercase ${mode === t.id ? t.textAccent : 'opacity-50 group-hover:opacity-100 transition-opacity'}`}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Simulator Area - Center Stage & Columns Layout */}
        {activeTab === 'architecture' ? (
          <div className="flex flex-col gap-3 sm:gap-4 w-full h-full animate-in fade-in duration-500 min-h-0">
            
            {/* Top Stage: Visualization & Controls (Takes Center Stage) */}
            <div className="w-full flex flex-col gap-3 sm:gap-4 z-10 transition-all duration-700 ease-out hover:scale-[1.01] origin-top flex-[1.2] min-h-min flex-shrink-0">
              {renderTopology()}

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent w-[200%] animate-[pulse_4s_ease-in-out_infinite] pointer-events-none -translate-x-1/2"></div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
                  <button 
                    onClick={toggleTransmission}
                    className={`w-full sm:w-auto ${A1_RED_BG} hover:bg-red-700 text-white px-6 py-3 rounded-lg font-black tracking-widest uppercase shadow-[0_0_15px_rgba(229,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(229,0,0,0.5)] transition-all duration-200 outline-none`}
                  >
                    {isTransmitting ? (isPaused ? 'Continue' : 'Stop') : 'Transmit'}
                  </button>
                  <button 
                    onClick={handleAttackerToggle}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-black tracking-widest uppercase border-2 transition-all duration-200 shadow-sm hover:-translate-y-0.5 outline-none ${attackerActive ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-500/30' : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-zinc-500 hover:text-white hover:bg-zinc-700'}`}
                  >
                    {attackerActive ? 'Disable Attacker' : 'MitM Attack'}
                  </button>
                </div>

                {/* Dashboard Widgets */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-end items-stretch relative z-10">
                  {/* QBER Widget (Only for QKD) */}
                  {mode === 'qkd' && (
                    <div className="flex items-center justify-between gap-4 bg-zinc-950 p-3 sm:p-4 rounded-lg border border-zinc-800 min-w-[140px] h-[88px] relative overflow-hidden">
                      {qber > 11 && <div className="absolute inset-0 bg-[#E50000]/10 animate-pulse pointer-events-none"></div>}
                      <div className="flex flex-col text-left z-10 justify-center">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">QBER</span>
                      </div>
                      {/* Circular SVG Gauge */}
                    <div className="relative w-14 h-14 flex items-center justify-center z-10">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" />
                          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="12" fill="transparent" strokeLinecap="round"
                            className={`transition-all duration-700 ease-out ${qber > 11 ? 'text-[#E50000]' : 'text-emerald-500'}`}
                            style={{
                              strokeDasharray: 2 * Math.PI * 38,
                              strokeDashoffset: 2 * Math.PI * 38 - (qber / 100) * (2 * Math.PI * 38),
                              filter: qber > 11 ? 'drop-shadow(0 0 2px rgba(229,0,0,0.6))' : (qber > 0 ? 'drop-shadow(0 0 2px rgba(16,185,129,0.6))' : 'none')
                            }}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                        <span className={`font-mono font-black text-xs leading-none ${qber > 11 ? 'text-[#E50000]' : 'text-emerald-500'}`}>
                            {qber}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Output */}
                  <div className="text-center sm:text-right w-full sm:w-[240px] flex-shrink-0 h-[88px] bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col justify-center">
                    <div className="text-xs text-zinc-500 mb-1 font-bold uppercase tracking-widest">Network Status</div>
                    <div className="font-mono font-black text-lg sm:text-xl tracking-wider h-7 flex items-center justify-center sm:justify-end">
                      {transmissionState === 'idle' && <span className="text-zinc-500">READY</span>}
                      {(transmissionState === 'sending' || transmissionState === 'moving') && <span className="text-blue-500 animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">TRANSMITTING</span>}
                      {transmissionState === 'intercepted' && <span className="text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">INTERCEPTED!</span>}
                      {transmissionState === 'received' && <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">SECURE</span>}
                      {transmissionState === 'aborted' && <span className="text-[#E50000] flex items-center justify-center sm:justify-end drop-shadow-[0_0_8px_rgba(229,0,0,0.8)]"><ShieldAlert size={20} className="mr-2"/> ABORTED</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Columns for Architecture & Security */}
            <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch flex-1 min-h-[280px]">
              
              {/* Left Column: Architectural Impact */}
              <div className="lg:w-1/2 w-full flex flex-col">
                <div className={`bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 shadow-lg relative overflow-hidden transition-colors duration-500 h-full flex flex-col opacity-90 hover:opacity-100 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full`}>
                  <div className={`absolute left-0 top-0 w-1.5 h-full ${currentTheme.barColor} transition-colors duration-500`}></div>
                  <h3 className={`text-base font-black ${currentTheme.textPrimary} mb-4 uppercase tracking-widest flex items-center`}>
                    <Activity className={`mr-2.5 w-5 h-5 ${currentTheme.textAccent}`}/> Architectural Impact
                  </h3>
                  
                  <div className="space-y-4 text-xs flex-grow">
                    <div>
                      <div className="text-zinc-500 mb-1.5 font-bold uppercase tracking-wider text-[10px] flex items-center w-fit group relative cursor-help">
                        OSI Layer Operation
                        <Info size={12} className="ml-1 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                        <div className="absolute bottom-full left-0 mb-2 w-56 p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-[10px] text-zinc-300 normal-case tracking-normal font-medium leading-relaxed">
                          {mode === 'classical' && "Layers 3-7 handle software-based encryption (e.g., TLS/IPsec). Operates mathematically over existing network infrastructure without physical layer changes."}
                          {mode === 'pqc' && "Layers 3-7 handle post-quantum software encryption. Protects against quantum computers mathematically without requiring physical layer changes."}
                          {mode === 'qkd' && "Layer 1 (Physical) handles raw photon transmission. Uses quantum mechanics properties on dedicated fiber optic links to detect interception instantly."}
                        </div>
                      </div>
                      <div className={`font-mono ${currentTheme.textPrimary} ${currentTheme.bgLight} p-3 rounded-lg border ${currentTheme.borderLight} font-bold text-sm transition-colors duration-500`}>
                        {mode === 'classical' && "Layers 3-7 (Software/Math)"}
                        {mode === 'pqc' && "Layers 3-7 (Software/Post-Quantum Math)"}
                        {mode === 'qkd' && "Layer 1 (Hardware/Quantum Light)"}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">Infrastructure Requirement</div>
                      <div className={`font-mono p-3 rounded-lg border leading-relaxed transition-colors duration-500 ${currentTheme.bgLight} ${currentTheme.borderLight} ${currentTheme.textPrimary} font-medium`}>
                        {mode === 'classical' && "Standard IP Network. No hardware changes required."}
                        {mode === 'pqc' && "Standard IP network. Requires post-quantum handshake upgrades."}
                        {mode === 'qkd' && "Dedicated dark fiber required. Highly secure physical bunkers (Trusted Nodes) required every ~100km."}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">Network Payload (Public Key)</div>
                      <div className={`font-mono ${currentTheme.textPrimary} ${currentTheme.bgLight} p-3 rounded-lg border ${currentTheme.borderLight} flex items-center justify-between font-bold transition-colors duration-500`}>
                        <span>
                          {mode === 'classical' && "Small (e.g., 32B for ECC)"}
                          {mode === 'pqc' && <span className="text-emerald-400">Massive public key metadata</span>}
                          {mode === 'qkd' && "N/A (Quantum light pulses)"}
                        </span>
                        {mode === 'pqc' && <Activity size={16} className="text-emerald-500 animate-pulse"/>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Security Analysis */}
              <div className="lg:w-1/2 w-full flex flex-col">
                <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 shadow-lg relative overflow-hidden h-full flex flex-col opacity-90 hover:opacity-100 transition-opacity overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className={`absolute left-0 top-0 w-1.5 h-full ${mode === 'classical' ? 'bg-[#E50000]' : 'bg-emerald-500'} transition-colors duration-500`}></div>
                  <h3 className="text-base font-black text-zinc-100 mb-4 uppercase tracking-widest flex items-center">
                    <Shield className="mr-2.5 w-5 h-5 text-zinc-400"/> Security Analysis
                  </h3>
                  
                  <div className="text-xs space-y-3 flex-grow">
                    <div className="flex items-start bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                      <div className="mt-0.5 mr-3 bg-zinc-800 p-1.5 rounded-md border border-zinc-700 shadow-sm flex-shrink-0">
                        {mode === 'qkd' ? <Unlock className="text-amber-500" size={16}/> : (mode === 'classical' ? <Unlock className="text-[#E50000]" size={16}/> : <Lock className="text-emerald-500" size={16}/>)}
                      </div>
                      <div>
                        <div className="font-black text-zinc-300 uppercase tracking-wider text-[10px] mb-1">Against Quantum Computers</div>
                        <div className={`leading-relaxed font-medium ${mode === 'classical' ? 'text-red-400' : (mode === 'qkd' ? 'text-amber-400' : 'text-emerald-400')}`}>
                          {mode === 'classical' && "Vulnerable (Shor's). Attacker saves packets now to decrypt later (HNDL)."}
                          {mode === 'pqc' && "Secure. Mathematically resistant to known quantum algorithms."}
                          {mode === 'qkd' && "Physics link secure, BUT breaks end-to-end encryption. The Trusted Node is a vulnerable classical vector."}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                      <div className="mt-0.5 mr-3 bg-zinc-800 p-1.5 rounded-md border border-zinc-700 shadow-sm flex-shrink-0">
                        {attackerActive && mode === 'qkd' ? <Activity className="text-blue-500" size={16}/> : <Wifi className="text-zinc-400" size={16}/>}
                      </div>
                      <div>
                        <div className="font-black text-zinc-300 uppercase tracking-wider text-[10px] mb-1">Eavesdropping Detection</div>
                        <div className="text-zinc-400 leading-relaxed font-medium">
                          {mode === 'classical' && "None. Attacker can copy IP packets passively without detection."}
                          {mode === 'pqc' && "None. Attacker can copy IP packets passively, but cannot read them."}
                          {mode === 'qkd' && <span className="text-blue-400 font-bold drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Immediate. Measuring a photon alters its state. Alice and Bob abort.</span>}
                        </div>
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