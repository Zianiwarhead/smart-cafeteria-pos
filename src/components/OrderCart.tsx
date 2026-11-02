import React from "react";
import { CartItem, OrderType, PhosphorProfile } from "../types";
import { sound } from "../utils/audio";
import { Trash2, Plus, Minus, ShoppingCart, Zap, Clock, Smartphone } from "lucide-react";

interface OrderCartProps {
  cart: CartItem[];
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  pickupSlot: string;
  onChangePickupSlot: (slot: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
  activeTheme: PhosphorProfile;
}

const PICKUP_SLOTS = [
  "12:15 PM (LUNCH RUSH)",
  "12:30 PM (SLOT A)",
  "12:45 PM (SLOT B)",
  "01:00 PM (SLOT C)",
  "01:15 PM (SLOT D)",
  "01:30 PM (POST-PEAK)",
];

export const OrderCart: React.FC<OrderCartProps> = ({
  cart,
  orderType,
  onChangeOrderType,
  pickupSlot,
  onChangePickupSlot,
  onUpdateQuantity,
  onClearCart,
  onProceedToPayment,
  activeTheme,
}) => {
  const subtotal = cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0);
  const vat = Math.round(subtotal * 0.16); // 16% Kenyan VAT
  const total = subtotal; // Cafeteria prices are VAT inclusive in Kenya
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const estimatedWait = Math.max(
    5,
    cart.reduce((acc, ci) => acc + ci.item.prepTimeMinutes * ci.quantity, 0)
  );

  return (
    <div className="flex flex-col h-full bg-[#0a120a] border border-[#1b3d1b] rounded-xl p-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#182f18]">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} />
          <h2 className="text-sm font-bold tracking-wider uppercase">
            ACTIVE TRAY ({totalItemsCount})
          </h2>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => {
              sound.playKeyBeep(600, 0.05);
              onClearCart();
            }}
            className="text-[11px] text-[#709c70] hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> CLEAR
          </button>
        )}
      </div>

      {/* Order Mode Toggle: Pre-order vs Walk-in (from Proposal!) */}
      <div className="pt-3 pb-3">
        <label className="text-[11px] text-[#6d916d] uppercase tracking-wider block mb-1.5 font-bold">
          DISPATCH METHOD:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playKeyBeep(1100, 0.03);
              onChangeOrderType("walkin");
            }}
            className={`p-2 rounded border text-xs text-left transition-all ${
              orderType === "walkin"
                ? "bg-[#163816] text-emerald-200 border-[#33FF33] font-bold shadow-[0_0_8px_rgba(51,255,51,0.25)]"
                : "bg-[#0c160c] border-[#182f18] text-[#557e55] hover:text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-1">
              <Zap size={13} />
              <span>[1] WALK-IN</span>
            </div>
            <p className="text-[10px] text-[#7d9b7d] mt-0.5">Live queue (~{estimatedWait}m)</p>
          </button>

          <button
            onClick={() => {
              sound.playKeyBeep(1100, 0.03);
              onChangeOrderType("preorder");
            }}
            className={`p-2 rounded border text-xs text-left transition-all ${
              orderType === "preorder"
                ? "bg-[#163816] text-emerald-200 border-[#33FF33] font-bold shadow-[0_0_8px_rgba(51,255,51,0.25)]"
                : "bg-[#0c160c] border-[#182f18] text-[#557e55] hover:text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>[2] PRE-ORDER</span>
            </div>
            <p className="text-[10px] text-[#7d9b7d] mt-0.5">Scheduled pickup</p>
          </button>
        </div>

        {/* Scheduled Slot Picker if Pre-order */}
        {orderType === "preorder" && (
          <div className="mt-2.5 p-2 bg-[#0d1c0d] border border-[#254d25] rounded text-xs">
            <label className="text-[10px] text-emerald-400 block mb-1 uppercase font-bold">
              SELECT PICKUP WINDOW:
            </label>
            <select
              value={pickupSlot}
              onChange={(e) => {
                sound.playKeyBeep(1300, 0.03);
                onChangePickupSlot(e.target.value);
              }}
              className="w-full bg-[#081208] border border-[#234d23] rounded px-2 py-1 text-xs text-emerald-300 focus:outline-none"
            >
              {PICKUP_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 border-y border-[#182f18] py-3 pr-1 min-h-[160px] max-h-[220px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#406840] py-6 text-xs">
            <span className="font-mono mb-1 text-sm">[ TRAY EMPTY ]</span>
            <span>Select delicious items from menu</span>
          </div>
        ) : (
          cart.map((ci) => (
            <div
              key={ci.item.id}
              className="p-2 rounded bg-[#0b180b] border border-[#1b361b] flex items-center justify-between text-xs"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1 font-bold truncate">
                  <span className="text-[10px] text-emerald-500">[{ci.item.code}]</span>
                  <span className="truncate">{ci.item.name}</span>
                </div>
                <div className="text-[10px] text-[#5d855d]">
                  {ci.quantity} × KES {ci.item.price} = KES {ci.quantity * ci.item.price}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    sound.playKeyBeep(700, 0.03);
                    onUpdateQuantity(ci.item.id, -1);
                  }}
                  className="size-5 rounded bg-[#162716] hover:bg-[#203620] border border-[#284828] flex items-center justify-center text-emerald-400"
                >
                  <Minus size={11} />
                </button>
                <span className="w-5 text-center font-bold text-xs">
                  {ci.quantity}
                </span>
                <button
                  onClick={() => {
                    sound.playKeyBeep(1200, 0.03);
                    onUpdateQuantity(ci.item.id, 1);
                  }}
                  className="size-5 rounded bg-[#162716] hover:bg-[#203620] border border-[#284828] flex items-center justify-center text-emerald-400"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Financial Breakdown */}
      <div className="pt-3 space-y-1 text-xs">
        <div className="flex justify-between text-[#5f875f]">
          <span>SUBTOTAL:</span>
          <span>KES {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[#4e744e] text-[11px]">
          <span>VAT (16% INCL):</span>
          <span>KES {vat.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-[#182f18]" style={{ color: activeTheme.primary }}>
          <span>TOTAL DUE:</span>
          <span>KES {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => {
          if (cart.length === 0) {
            sound.playError();
            return;
          }
          sound.playKeyBeep(1400, 0.06);
          onProceedToPayment();
        }}
        disabled={cart.length === 0}
        className="mt-3 w-full py-2.5 rounded bg-[#143d14] hover:bg-[#1d521d] active:scale-[0.98] border border-[#33FF33] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(51,255,51,0.25)] disabled:opacity-40 disabled:pointer-events-none"
      >
        <Smartphone size={14} />
        <span>PAY VIA M-PESA & PRINT [F9]</span>
      </button>
    </div>
  );
};
