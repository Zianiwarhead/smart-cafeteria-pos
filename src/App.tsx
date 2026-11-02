import React, { useState, useEffect } from "react";
import { CartItem, MenuItem, OrderRecord, OrderType, PhosphorProfile } from "./types";
import { PHOSPHOR_THEMES, MENU_ITEMS } from "./data/menu";
import { CrtMonitorFrame } from "./components/CrtMonitorFrame";
import { MenuSelector } from "./components/MenuSelector";
import { OrderCart } from "./components/OrderCart";
import { ReceiptStation } from "./components/ReceiptStation";
import { MPesaModal } from "./components/MPesaModal";
import { QueueSimulationBanner } from "./components/QueueSimulationBanner";
import { AdminAnalyticsModal } from "./components/AdminAnalyticsModal";
import { ReceiptPrinterStage, ReceiptFeedMotion } from "./components/ReceiptPrinter";
import { sound } from "./utils/audio";

// Initial sample seed orders to populate the admin log and make queue lively
const INITIAL_SEED_ORDERS: OrderRecord[] = [
  {
    orderId: "ORD-038",
    transactionCode: "QFH38X92L",
    type: "walkin",
    customerName: "Brian Murimi",
    phone: "0722 145 921",
    pickupSlot: "IMMEDIATE WALKIN",
    items: [
      { item: MENU_ITEMS[0], quantity: 1 },
      { item: MENU_ITEMS[9], quantity: 1 },
    ],
    subtotal: 195,
    tax: 31,
    total: 195,
    paymentMethod: "mpesa",
    timestamp: "12:14:02 PM",
    estimatedWaitMinutes: 5,
    queueNumber: 38,
  },
  {
    orderId: "ORD-039",
    transactionCode: "RKX72M10P",
    type: "preorder",
    customerName: "Amina Hassan",
    phone: "0711 889 023",
    pickupSlot: "12:30 PM (SLOT A)",
    items: [
      { item: MENU_ITEMS[1], quantity: 1 },
    ],
    subtotal: 270,
    tax: 43,
    total: 270,
    paymentMethod: "mpesa",
    timestamp: "12:18:45 PM",
    estimatedWaitMinutes: 4,
    queueNumber: 39,
  },
];

export function App() {
  const [activeTheme, setActiveTheme] = useState<PhosphorProfile>(PHOSPHOR_THEMES.p1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([
    { item: MENU_ITEMS[0], quantity: 1 }, // Default with 1 Combo to let user immediately test print!
  ]);
  const [orderType, setOrderType] = useState<OrderType>("preorder");
  const [pickupSlot, setPickupSlot] = useState<string>("12:30 PM (SLOT A)");
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Printer states
  const [printerStage, setPrinterStage] = useState<ReceiptPrinterStage>("processing");
  const [feedMotion, setFeedMotion] = useState<ReceiptFeedMotion>("stepped");
  const [currentOrder, setCurrentOrder] = useState<OrderRecord | null>(INITIAL_SEED_ORDERS[0]);
  const [ordersHistory, setOrdersHistory] = useState<OrderRecord[]>(INITIAL_SEED_ORDERS);

  // Queue simulation
  const [queueLength, setQueueLength] = useState<number>(7);
  const [servingTicket, setServingTicket] = useState<number>(38);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((ci) => ci.item.id !== itemId);
      }
      return prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
      );
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Payment completed via M-Pesa STK push
  const handlePaymentSuccess = (newOrder: OrderRecord) => {
    setIsMpesaModalOpen(false);
    setCurrentOrder(newOrder);
    setOrdersHistory((prev) => [newOrder, ...prev]);
    setCart([]); // Reset cart tray

    // Sequence printer from processing -> printing -> complete
    setPrinterStage("processing");
    setTimeout(() => {
      setPrinterStage("printing");
      setTimeout(() => {
        setPrinterStage("complete");
        setServingTicket(newOrder.queueNumber);
        setQueueLength((prev) => Math.max(1, prev - 1));
      }, 2400);
    }, 800);
  };

  // Keyboard shortcut support (classic IBM 3270 Function Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        sound.playKeyBeep(1100);
        setPrinterStage("processing");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  return (
    <div
      className="min-h-screen py-4 px-2 sm:px-6 flex flex-col justify-between"
      style={{
        backgroundColor: activeTheme.bgDark,
        transition: "background-color 0.5s ease",
      }}
    >
      <CrtMonitorFrame
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      >
        {/* Real-time Queue Simulation Status Bar */}
        <QueueSimulationBanner
          queueLength={queueLength}
          currentTicket={servingTicket}
          onOpenAnalytics={() => {
            sound.playKeyBeep(1100);
            setIsAdminModalOpen(true);
          }}
          activeTheme={activeTheme}
        />

        {/* Main Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Menu Item Selector (7 columns) */}
          <div className="lg:col-span-7 bg-[#060c06] border border-[#1b361b] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1b3d1b]">
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase" style={{ color: activeTheme.primary }}>
                  CAMPUS DINING MENU // SELECTION TERMINAL
                </h2>
                <p className="text-[11px] text-[#6b916b]">
                  PRICED IN KENYAN SHILLINGS (KES) • SELECT QUANTITY TO QUEUE
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 border border-[#234d23] px-2 py-0.5 rounded bg-[#0b1c0b]">
                KES CURRENCY
              </span>
            </div>

            <MenuSelector
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              activeTheme={activeTheme}
            />
          </div>

          {/* Right Column: Active Cart + Receipt Printer Dispenser (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Active Cart & Checkout */}
            <OrderCart
              cart={cart}
              orderType={orderType}
              onChangeOrderType={setOrderType}
              pickupSlot={pickupSlot}
              onChangePickupSlot={setPickupSlot}
              onUpdateQuantity={handleUpdateQuantity}
              onClearCart={handleClearCart}
              onProceedToPayment={() => setIsMpesaModalOpen(true)}
              activeTheme={activeTheme}
            />

            {/* Stepped Receipt Printer Dispenser Station */}
            <div className="bg-[#060c06] border border-[#1b361b] rounded-2xl p-4 shadow-xl">
              <ReceiptStation
                currentOrder={currentOrder}
                stage={printerStage}
                feedMotion={feedMotion}
                onSetStage={setPrinterStage}
                onNewOrder={() => {
                  setPrinterStage("processing");
                  setCurrentOrder(null);
                }}
                activeTheme={activeTheme}
              />
            </div>
          </div>
        </div>
      </CrtMonitorFrame>

      {/* Simulated M-Pesa STK Push Modal */}
      <MPesaModal
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        cart={cart}
        orderType={orderType}
        pickupSlot={pickupSlot}
        onPaymentSuccess={handlePaymentSuccess}
        activeTheme={activeTheme}
      />

      {/* Admin Analytics & CSV Export Modal */}
      <AdminAnalyticsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        orders={ordersHistory}
        activeTheme={activeTheme}
      />

      {/* Terminal Footer */}
      <footer className="text-center py-3 text-[11px] font-mono text-[#587355]">
        <span>IBM 3270 / SMART CAFETERIA TERMINAL • STUDENT: BRIAN MURIMI MUCHIRI • OOP WITH C++ SPECIFICATION</span>
      </footer>
    </div>
  );
}

export default App;
