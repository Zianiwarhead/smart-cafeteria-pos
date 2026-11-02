import React from "react";
import { PhosphorProfile } from "../types";
import { Users, Clock, AlertTriangle, Activity, BarChart3 } from "lucide-react";

interface QueueSimulationBannerProps {
  queueLength: number;
  currentTicket: number;
  onOpenAnalytics: () => void;
  activeTheme: PhosphorProfile;
}

export const QueueSimulationBanner: React.FC<QueueSimulationBannerProps> = ({
  queueLength,
  currentTicket,
  onOpenAnalytics,
  activeTheme,
}) => {
  const avgWaitMins = Math.max(3, queueLength * 2.5);
  const isPeakHour = queueLength >= 6;

  return (
    <div className="mb-4 bg-[#081008] border border-[#1d3d1d] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Live Queue Indicators */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <Activity size={15} className="animate-pulse text-emerald-400" />
          <span className="text-[#688f68] font-bold">NOW SERVING:</span>
          <span className="px-2 py-0.5 rounded bg-[#102410] border border-[#234d23] text-emerald-300 font-bold tracking-widest">
            #{currentTicket.toString().padStart(3, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={14} className="text-[#688f68]" />
          <span className="text-[#688f68]">PHYSICAL QUEUE:</span>
          <span className="text-emerald-300 font-bold">
            {queueLength} STUDENTS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#688f68]" />
          <span className="text-[#688f68]">EST. WAIT:</span>
          <span className="text-emerald-300 font-bold">
            ~{Math.round(avgWaitMins)} MINS
          </span>
        </div>

        {isPeakHour && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-600 text-amber-300 text-[10px] font-bold">
            <AlertTriangle size={11} />
            <span>LUNCH PEAK TRAFFIC (11:30AM - 2:00PM)</span>
          </div>
        )}
      </div>

      {/* Admin / Analytics Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAnalytics}
          className="px-2.5 py-1 rounded bg-[#122812] hover:bg-[#1c3d1c] border border-[#2d572d] text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
        >
          <BarChart3 size={13} />
          <span>[ADMIN / CSV LOGS]</span>
        </button>
      </div>
    </div>
  );
};
