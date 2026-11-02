import React, { useState } from "react";
import { PhosphorProfile } from "../types";
import { PHOSPHOR_THEMES } from "../data/menu";
import { sound } from "../utils/audio";
import { Volume2, VolumeX, Monitor, Power, Sparkles, RefreshCw } from "lucide-react";

interface CrtMonitorFrameProps {
  children: React.ReactNode;
  activeTheme: PhosphorProfile;
  onThemeChange: (theme: PhosphorProfile) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const CrtMonitorFrame: React.FC<CrtMonitorFrameProps> = ({
  children,
  activeTheme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
}) => {
  const [powerOn, setPowerOn] = useState<boolean>(true);
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [flickerEnabled, setFlickerEnabled] = useState<boolean>(false);

  const handlePowerToggle = () => {
    sound.playCrtDegauss();
    setPowerOn((prev) => !prev);
  };

  const handleThemeSelect = (themeKey: string) => {
    sound.playKeyBeep(1200, 0.05);
    onThemeChange(PHOSPHOR_THEMES[themeKey]);
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto p-3 sm:p-6 transition-colors duration-500"
      style={
        {
          "--primary-phosphor": activeTheme.primary,
          "--glow-color": activeTheme.glow,
        } as React.CSSProperties
      }
    >
      {/* Heavy 1980s IBM Beige/Charcoal Industrial Outer Casing */}
      <div className="relative rounded-3xl bg-[#1b211a] border-4 border-[#2c362a] p-4 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]">
        {/* Top Vent Grilles & IBM Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#293627] text-xs font-mono">
          <div className="flex items-center gap-3">
            {/* Retro 8-bar IBM-style Logo Badge */}
            <div className="px-3 py-1 bg-[#10150f] border border-[#3b4c37] rounded flex items-center gap-2">
              <span className="font-bold tracking-widest text-neutral-300 font-mono text-sm">
                IBM
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                3278-MOD2
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[#5b7a54]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SNA/SDLC COAX ATTACHED // SYS/370</span>
            </div>
          </div>

          {/* Monitor Control Deck */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                sound.playKeyBeep(800, 0.03);
                onToggleSound();
              }}
              title="Toggle Mechanical Audio"
              className={`px-2.5 py-1 rounded text-[11px] font-mono border flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? "bg-[#1f301d] text-emerald-300 border-[#3c5d38]"
                  : "bg-[#1e1e1e] text-neutral-500 border-neutral-700"
              }`}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="hidden sm:inline">AUDIO: {soundEnabled ? "ON" : "OFF"}</span>
            </button>

            {/* Scanlines Toggle */}
            <button
              onClick={() => {
                sound.playKeyBeep(900, 0.03);
                setScanlinesEnabled(!scanlinesEnabled);
              }}
              title="Toggle CRT Scanline Overlay"
              className={`px-2.5 py-1 rounded text-[11px] font-mono border flex items-center gap-1.5 transition-all ${
                scanlinesEnabled
                  ? "bg-[#1f301d] text-emerald-300 border-[#3c5d38]"
                  : "bg-[#1e1e1e] text-neutral-500 border-neutral-700"
              }`}
            >
              <Monitor size={13} />
              <span className="hidden sm:inline">CRT SCAN</span>
            </button>

            {/* CRT Power Button */}
            <button
              onClick={handlePowerToggle}
              title="CRT Master Power"
              className={`px-3 py-1 rounded text-[11px] font-mono border flex items-center gap-1.5 transition-all ${
                powerOn
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                  : "bg-red-950/60 text-red-400 border-red-700"
              }`}
            >
              <Power size={13} />
              <span>{powerOn ? "PWR: ON" : "PWR: OFF"}</span>
            </button>
          </div>
        </div>

        {/* Phosphor Profile Selector Switchboard */}
        <div className="pt-3 pb-3 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#657d60] flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold">
            <Sparkles size={12} /> PHOSPHOR PROFILE:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(PHOSPHOR_THEMES).map((theme) => {
              const isSelected = activeTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono tracking-tight transition-all border ${
                    isSelected
                      ? "border-current font-bold shadow-[0_0_8px_currentColor]"
                      : "border-transparent bg-[#141b13] text-neutral-400 hover:text-neutral-200"
                  }`}
                  style={{
                    color: isSelected ? theme.primary : undefined,
                    borderColor: isSelected ? theme.primary : undefined,
                  }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: theme.primary }}
                  />
                  {theme.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deep CRT Screen Well with Curved Bezel */}
        <div className="relative rounded-2xl bg-[#030603] border-4 border-[#121911] crt-bezel-inset overflow-hidden min-h-[640px] p-3 sm:p-6 transition-all duration-300">
          {powerOn ? (
            <div
              className={`relative z-10 ${
                flickerEnabled ? "animate-flicker" : ""
              }`}
              style={{ color: activeTheme.primary }}
            >
              {children}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-neutral-600 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-ping mb-3" />
              <p className="text-xs tracking-widest uppercase">
                CRT POWER OFF // TURN SWITCH ON TO RESTORE TUBE
              </p>
              <button
                onClick={handlePowerToggle}
                className="mt-4 px-4 py-1.5 bg-[#121a11] hover:bg-[#1b2b1a] text-neutral-300 border border-neutral-700 rounded text-xs font-mono flex items-center gap-2"
              >
                <RefreshCw size={13} /> POWER ON TERMINAL
              </button>
            </div>
          )}

          {/* CRT Overlay Effects */}
          {powerOn && scanlinesEnabled && (
            <>
              {/* Scanline pattern */}
              <div className="crt-screen-overlay absolute inset-0 z-20 pointer-events-none" />
              {/* Moving scanline beam */}
              <div className="crt-scanline-beam absolute inset-0 z-20 pointer-events-none animate-scanline" />
            </>
          )}

          {/* CRT Curved Glass Specular Highlight */}
          <div className="crt-glass-reflection absolute inset-0 z-20 pointer-events-none" />
        </div>

        {/* Bottom Chassis Details */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#52664e] font-mono px-2">
          <div>
            <span>SMART CAFETERIA PRE-ORDER SYSTEM // TUI CORE v2.4</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer" onClick={() => sound.playKeyBeep(1400)}>
              BRIGHTNESS: [========] 100%
            </span>
            <span className="hover:underline cursor-pointer" onClick={() => sound.playKeyBeep(1000)}>
              CONTRAST: [========] 85%
            </span>
            <span className="text-[#84a37f]">STATION READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
