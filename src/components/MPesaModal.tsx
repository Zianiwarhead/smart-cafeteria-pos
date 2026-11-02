import React, { useState } from "react";
import { CartItem, OrderRecord, OrderType, PhosphorProfile } from "../types";
import { sound } from "../utils/audio";
import { Smartphone, CheckCircle, ShieldCheck, X, ArrowRight, Loader2 } from "lucide-react";

interface MPesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: OrderType;
  pickupSlot: string;
  onPaymentSuccess: (order: OrderRecord) => void;
  activeTheme: PhosphorProfile;
}

// Generate realistic 10-character Safaricom M-Pesa transaction code (e.g. QFH38X92L)
function generateMpesaCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  let code = "";
  for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 2; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 2; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return code;
}

export const MPesaModal: React.FC<MPesaModalProps> = ({
  isOpen,
  onClose,
  cart,
  orderType,
  pickupSlot,
  onPaymentSuccess,
  activeTheme,
}) => {
  const [phone, setPhone] = useState("0722 000 123");
  const [customerName, setCustomerName] = useState("Brian Muchiri");
  const [step, setStep] = useState<"input" | "stk-push" | "pin" | "verified">("input");
  const [pin, setPin] = useState("");

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0);

  const handleSendStkPush = () => {
    sound.playKeyBeep(1200, 0.05);
    setStep("stk-push");
    setTimeout(() => {
      sound.playKeyBeep(880, 0.1);
      setStep("pin");
    }, 1200);
  };

  const handleConfirmPin = () => {
    sound.playKeyBeep(1500, 0.04);
    setStep("verified");

    const transactionCode = generateMpesaCode();
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const estimatedWait = Math.max(
      5,
      cart.reduce((acc, ci) => acc + ci.item.prepTimeMinutes * ci.quantity, 0)
    );

    const newOrder: OrderRecord = {
      orderId: `ORD-${orderNumber}`,
      transactionCode,
      type: orderType,
      customerName: customerName || "Campus Student",
      phone: phone || "0722 000 000",
      pickupSlot: orderType === "preorder" ? pickupSlot : "IMMEDIATE WALK-IN",
      items: [...cart],
      subtotal: total,
      tax: Math.round(total * 0.16),
      total: total,
      paymentMethod: "mpesa",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      estimatedWaitMinutes: estimatedWait,
      queueNumber: Math.floor(Math.random() * 8) + 1,
    };

    setTimeout(() => {
      onPaymentSuccess(newOrder);
      setStep("input");
      setPin("");
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-md bg-[#0a140a] border-2 border-[#2b572b] rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.9)] text-emerald-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b3d1b]">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-200">
              M-PESA EXPRESS (STK PUSH SIMULATOR)
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playKeyBeep(600);
              onClose();
            }}
            className="text-neutral-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Input details */}
        {step === "input" && (
          <div className="pt-4 space-y-4 text-xs">
            <div className="p-3 bg-[#0d1f0d] border border-[#234d23] rounded-lg">
              <div className="flex justify-between text-[#85b885]">
                <span>PAYABLE AMOUNT:</span>
                <span className="font-bold text-base text-emerald-300">
                  KES {total.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] text-[#558255] mt-1">
                TILL NUMBER: 884920 (SMART CAFETERIA)
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#7eb37e] uppercase mb-1 font-bold">
                STUDENT / CUSTOMER NAME:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Brian Murimi"
                className="w-full bg-[#050c05] border border-[#1b3d1b] rounded px-3 py-2 text-xs text-emerald-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#7eb37e] uppercase mb-1 font-bold">
                SAFARICOM M-PESA NUMBER:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-[#050c05] border border-[#1b3d1b] rounded px-3 py-2 text-xs text-emerald-200 focus:outline-none focus:border-emerald-400"
              />
              <p className="text-[10px] text-[#558255] mt-1">
                An instant STK Push prompt will be simulated for this number.
              </p>
            </div>

            <button
              onClick={handleSendStkPush}
              className="w-full py-2.5 rounded bg-[#164d16] hover:bg-[#1e631e] border border-emerald-400 text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all"
            >
              <span>SEND STK PUSH PROMPT</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Transmitting */}
        {step === "stk-push" && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <p className="text-xs font-bold tracking-widest uppercase">
              SENDING STK PUSH TO {phone}...
            </p>
            <p className="text-[11px] text-[#6d996d]">
              Please check your phone screen.
            </p>
          </div>
        )}

        {/* Step 3: Simulated phone STK PIN Prompt */}
        {step === "pin" && (
          <div className="pt-3 space-y-3">
            <div className="p-4 bg-[#061206] border-2 border-emerald-500 rounded-xl shadow-inner text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2">
                <ShieldCheck size={14} /> SIMULATED SAFARICOM STK DIALOG
              </div>
              <p className="text-xs text-emerald-200 font-bold mb-2">
                Do you want to pay KES {total.toLocaleString()} to SMART CAFETERIA?
              </p>
              <div className="my-3">
                <label className="text-[10px] text-[#699c69] block mb-1">
                  ENTER M-PESA 4-DIGIT PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  className="w-32 mx-auto text-center tracking-[0.4em] bg-[#020502] border border-emerald-400 rounded py-1.5 text-base text-emerald-300 focus:outline-none"
                />
              </div>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => setPin("1234")}
                  className="text-[10px] text-emerald-500 underline hover:text-emerald-300"
                >
                  Quick Demo: Fill 1234
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmPin}
              disabled={pin.length < 4}
              className="w-full py-2.5 rounded bg-[#164d16] hover:bg-[#1e631e] border border-emerald-400 text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.3)] disabled:opacity-40"
            >
              <CheckCircle size={14} />
              <span>CONFIRM PIN & COMPLETE ORDER</span>
            </button>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === "verified" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle size={36} className="text-emerald-400 animate-bounce" />
            <p className="text-sm font-bold tracking-wider uppercase text-emerald-200">
              PAYMENT AUTHORIZED!
            </p>
            <p className="text-xs text-[#7bb87b]">
              TRANSMITTING TO IBM PRINTER CUTTER...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
