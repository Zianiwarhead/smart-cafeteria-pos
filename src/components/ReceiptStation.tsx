import React, { useState } from "react";
import { OrderRecord, PhosphorProfile } from "../types";
import { ReceiptPrinter, ReceiptPrinterStage, ReceiptFeedMotion } from "./ReceiptPrinter";
import { sound } from "../utils/audio";
import { Download, Scissors, RotateCcw, Printer, Check, Copy, FileDown } from "lucide-react";
import { generateReceiptPdf } from "../utils/pdfGenerator";

interface ReceiptStationProps {
  currentOrder: OrderRecord | null;
  stage: ReceiptPrinterStage;
  feedMotion: ReceiptFeedMotion;
  onSetStage: (stage: ReceiptPrinterStage) => void;
  onNewOrder: () => void;
  activeTheme: PhosphorProfile;
}

export const ReceiptStation: React.FC<ReceiptStationProps> = ({
  currentOrder,
  stage,
  feedMotion,
  onSetStage,
  onNewOrder,
  activeTheme,
}) => {
  const [copied, setCopied] = useState(false);
  const [torn, setTorn] = useState(false);

  // Generate plain text receipt for download matching proposal requirement:
  // "Formatted receipt_<transaction_id>.txt for budget tracking"
  const generateReceiptText = (order: OrderRecord): string => {
    const separator = "------------------------------------------\n";
    let text = "";
    text += "==========================================\n";
    text += "     SMART CAFETERIA PRE-ORDER SYSTEM     \n";
    text += "        UNIVERSITY DINING HALL 01        \n";
    text += "==========================================\n";
    text += `DATE: ${new Date().toLocaleDateString()}  TIME: ${order.timestamp}\n`;
    text += `ORDER REF: ${order.orderId}\n`;
    text += `M-PESA REF: ${order.transactionCode}\n`;
    text += `CUSTOMER: ${order.customerName} (${order.phone})\n`;
    text += `DISPATCH: ${order.type.toUpperCase()} [${order.pickupSlot}]\n`;
    text += `QUEUE CALL: TICKET #${order.queueNumber.toString().padStart(3, "0")}\n`;
    text += separator;
    text += "QTY  ITEM DESCRIPTION             PRICE (KES)\n";
    text += separator;
    order.items.forEach((item) => {
      const line = `${item.quantity.toString().padEnd(4)} ${(item.item.name).substring(0, 24).padEnd(25)} KES ${(item.quantity * item.item.price).toString().padStart(6)}\n`;
      text += line;
    });
    text += separator;
    text += `SUBTOTAL:                          KES ${order.subtotal.toString().padStart(6)}\n`;
    text += `VAT 16% (INCL):                    KES ${order.tax.toString().padStart(6)}\n`;
    text += `TOTAL PAID VIA M-PESA:             KES ${order.total.toString().padStart(6)}\n`;
    text += separator;
    text += `EST. PREPARATION TIME: ${order.estimatedWaitMinutes} MINUTES\n`;
    text += "STATUS: ORDER QUEUED IN KITCHEN DISPLAY\n";
    text += "==========================================\n";
    text += "     THANK YOU FOR DINING WITH US!       \n";
    text += "    PLEASE PRESENT AT DISPATCH COUNTER   \n";
    text += "==========================================\n";
    return text;
  };

  const handleDownloadPdf = () => {
    if (!currentOrder) return;
    sound.playKeyBeep(1400, 0.05);
    generateReceiptPdf(currentOrder);
  };

  const handleDownloadTxt = () => {
    if (!currentOrder) return;
    sound.playKeyBeep(1300, 0.04);
    const content = generateReceiptText(currentOrder);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt_${currentOrder.transactionCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!currentOrder) return;
    sound.playKeyBeep(1200, 0.03);
    const content = generateReceiptText(currentOrder);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTearOff = () => {
    sound.playKeyBeep(1600, 0.06);
    setTorn(true);
    setTimeout(() => {
      setTorn(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full font-mono text-neutral-100">
      {/* Top Station Header */}
      <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-[#1f3b1f] text-xs">
        <div className="flex items-center gap-2">
          <Printer size={15} style={{ color: activeTheme.primary }} />
          <span className="font-bold tracking-wider text-emerald-300">
            IBM 4610 THERMAL DISPENSER
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-500 font-bold">ONLINE</span>
        </div>
      </div>

      {/* The Receipt Printer Component Tree */}
      <ReceiptPrinter.Root
        animate={true}
        feedMotion={feedMotion}
        stage={stage}
        className="w-full max-w-sm drop-shadow-2xl"
      >
        <ReceiptPrinter.Machine className="border-[#283828] bg-[#0c140c]">
          <ReceiptPrinter.Header>
            <ReceiptPrinter.Status className="text-emerald-400 font-bold" />
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#162916] text-[10px] text-emerald-400 font-bold border border-[#234423]">
                FEED: {feedMotion.toUpperCase()}
              </span>
            </div>
          </ReceiptPrinter.Header>

          <ReceiptPrinter.Screen className="border-[#1e341e] bg-[#060c06]">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#85b885] text-[11px]">
                <span>TMT: IBM 4610-2CR</span>
                <span>BAUD: 19200</span>
              </div>
              <div className="font-bold tracking-wide" style={{ color: activeTheme.primary }}>
                {stage === "processing" && "&gt;&gt; WAITING FOR M-PESA STK CONFIRMATION"}
                {stage === "printing" && "&gt;&gt; STEPPED LINE FEED IN PROGRESS..."}
                {stage === "complete" && "&gt;&gt; TRANSACTION LOGGED - VOUCHER DISPENSED"}
              </div>
              <div className="text-[10px] text-[#558055]">
                {currentOrder
                  ? `ORDER: ${currentOrder.orderId} | REF: ${currentOrder.transactionCode}`
                  : "READY FOR INCOMING TICKET"}
              </div>
            </div>
          </ReceiptPrinter.Screen>

          <ReceiptPrinter.Output>
            {currentOrder ? (
              <ReceiptPrinter.Paper
                className={`transition-transform duration-300 ${
                  torn ? "rotate-2 translate-y-6 opacity-90 shadow-2xl" : ""
                }`}
              >
                {/* Authentic Receipt Header */}
                <div className="text-center pb-3 border-b-2 border-dashed border-neutral-800 text-xs">
                  <h1 className="font-bold tracking-wider text-sm uppercase">
                    SMART CAFETERIA
                  </h1>
                  <p className="text-[10px] text-neutral-600 font-sans tracking-tight">
                    STUDENT DINING PRE-ORDER SYSTEM
                  </p>
                  <p className="text-[10px] text-neutral-700 mt-1">
                    NAIROBI CAMPUS // STATION 04
                  </p>
                  <div className="mt-2 text-xs font-bold bg-neutral-900 text-white py-1 px-2 rounded inline-block">
                    QUEUE TICKET: #{currentOrder.queueNumber.toString().padStart(3, "0")}
                  </div>
                </div>

                {/* Metadata details */}
                <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">DATE:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">TIME:</span>
                    <span>{currentOrder.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">M-PESA REF:</span>
                    <span className="font-bold font-mono tracking-wider">{currentOrder.transactionCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">STUDENT:</span>
                    <span className="font-semibold">{currentOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">TYPE:</span>
                    <span className="font-bold uppercase text-[10px] px-1 bg-neutral-200 rounded">
                      {currentOrder.type}
                    </span>
                  </div>
                  {currentOrder.type === "preorder" && (
                    <div className="flex justify-between text-neutral-900 font-bold bg-amber-100 p-0.5 rounded text-[10px]">
                      <span>PICKUP SLOT:</span>
                      <span>{currentOrder.pickupSlot}</span>
                    </div>
                  )}
                </div>

                {/* Itemized breakdown table */}
                <div className="py-2.5 border-b-2 border-dashed border-neutral-800 text-[11px]">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-bold mb-1">
                    <span>QTY / ITEM</span>
                    <span>AMOUNT (KES)</span>
                  </div>

                  <div className="space-y-1.5">
                    {currentOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="pr-1 flex-1">
                          <span className="font-bold mr-1.5">{item.quantity}x</span>
                          <span>{item.item.name}</span>
                        </div>
                        <span className="font-bold shrink-0">
                          KES {item.quantity * item.item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="py-2 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>SUBTOTAL:</span>
                    <span>KES {currentOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[10px]">
                    <span>VAT 16% (INCL):</span>
                    <span>KES {currentOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-400">
                    <span>TOTAL PAID:</span>
                    <span>KES {currentOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Simulated Barcode / QR Section */}
                <div className="pt-3 text-center">
                  <div className="flex justify-center items-center gap-[2px] h-8 py-1 my-1 opacity-90 overflow-hidden">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-neutral-900 h-full"
                        style={{
                          width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-mono tracking-widest text-neutral-700">
                    *{currentOrder.transactionCode}*
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-2 italic">
                    ~ Wait approx. {currentOrder.estimatedWaitMinutes} mins ~
                  </p>
                  <p className="text-[8px] text-neutral-500 uppercase mt-0.5">
                    Present paper at pick-up counter
                  </p>
                </div>
              </ReceiptPrinter.Paper>
            ) : (
              <ReceiptPrinter.Paper className="flex flex-col items-center justify-center text-center py-16 opacity-40 text-neutral-500">
                <span className="text-xs uppercase tracking-widest">[ PRINTER IDLE ]</span>
                <span className="text-[10px] mt-1">Complete order to dispense ticket</span>
              </ReceiptPrinter.Paper>
            )}
          </ReceiptPrinter.Output>
        </ReceiptPrinter.Machine>
      </ReceiptPrinter.Root>

      {/* Control Actions beneath the Printer */}
      {currentOrder && stage === "complete" && (
        <div className="w-full max-w-sm mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-1.5 rounded bg-[#1e4d1e] hover:bg-[#286628] border-2 border-emerald-400 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(52,211,153,0.35)] active:scale-95"
            title="Download authentic thermal receipt as PDF document"
          >
            <FileDown size={14} className="text-emerald-300" />
            <span>DOWNLOAD PDF</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-2.5 py-1.5 rounded bg-[#163016] hover:bg-[#204720] border border-emerald-500/70 text-xs font-mono text-emerald-200 flex items-center gap-1.5 transition-all"
            title="Download plain text receipt (.txt)"
          >
            <Download size={13} />
            <span>TXT</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded bg-[#163016] hover:bg-[#204720] border border-emerald-500/70 text-xs font-mono text-emerald-200 flex items-center gap-1.5 transition-all"
            title="Copy plain receipt"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "COPIED" : "COPY"}</span>
          </button>

          <button
            onClick={handleTearOff}
            className="px-2.5 py-1.5 rounded bg-[#163016] hover:bg-[#204720] border border-emerald-500/70 text-xs font-mono text-emerald-200 flex items-center gap-1.5 transition-all"
            title="Tear off physical paper"
          >
            <Scissors size={13} />
            <span>TEAR</span>
          </button>

          <button
            onClick={() => {
              sound.playKeyBeep(1100, 0.04);
              onNewOrder();
            }}
            className="px-3 py-1.5 rounded bg-[#2a2616] hover:bg-[#3d361f] border border-amber-400 text-xs font-mono text-amber-200 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw size={13} />
            <span>NEXT [F5]</span>
          </button>
        </div>
      )}
    </div>
  );
};
