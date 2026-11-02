import React, { useState } from "react";
import { MenuItem, ItemCategory, CartItem, PhosphorProfile } from "../types";
import { MENU_ITEMS } from "../data/menu";
import { sound } from "../utils/audio";
import { Plus, Minus, Flame, Clock, Sparkles } from "lucide-react";

interface MenuSelectorProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  activeTheme: PhosphorProfile;
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  activeTheme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getQuantityInCart = (itemId: string): number => {
    return cart.find((ci) => ci.item.id === itemId)?.quantity || 0;
  };

  const handleCategoryClick = (cat: ItemCategory | "all") => {
    sound.playKeyBeep(1100, 0.04);
    setSelectedCategory(cat);
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Category Tabs in IBM 3270 Function Key Style */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b3d1b] pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`px-3 py-1 text-xs border rounded transition-colors ${
              selectedCategory === "all"
                ? "bg-[#1d471d] text-emerald-200 border-[#33FF33] font-bold shadow-[0_0_8px_rgba(51,255,51,0.3)]"
                : "border-[#1e381e] bg-[#0c160c] text-emerald-600 hover:text-emerald-300"
            }`}
          >
            [F1] ALL MENU ({MENU_ITEMS.length})
          </button>
          <button
            onClick={() => handleCategoryClick("combo")}
            className={`px-3 py-1 text-xs border rounded transition-colors ${
              selectedCategory === "combo"
                ? "bg-[#1d471d] text-emerald-200 border-[#33FF33] font-bold shadow-[0_0_8px_rgba(51,255,51,0.3)]"
                : "border-[#1e381e] bg-[#0c160c] text-emerald-600 hover:text-emerald-300"
            }`}
          >
            [F2] COMBO DEALS
          </button>
          <button
            onClick={() => handleCategoryClick("food")}
            className={`px-3 py-1 text-xs border rounded transition-colors ${
              selectedCategory === "food"
                ? "bg-[#1d471d] text-emerald-200 border-[#33FF33] font-bold shadow-[0_0_8px_rgba(51,255,51,0.3)]"
                : "border-[#1e381e] bg-[#0c160c] text-emerald-600 hover:text-emerald-300"
            }`}
          >
            [F3] FOOD ITEMS
          </button>
          <button
            onClick={() => handleCategoryClick("drink")}
            className={`px-3 py-1 text-xs border rounded transition-colors ${
              selectedCategory === "drink"
                ? "bg-[#1d471d] text-emerald-200 border-[#33FF33] font-bold shadow-[0_0_8px_rgba(51,255,51,0.3)]"
                : "border-[#1e381e] bg-[#0c160c] text-emerald-600 hover:text-emerald-300"
            }`}
          >
            [F4] BEVERAGES
          </button>
        </div>

        {/* Fast Quick-search Terminal Input */}
        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="FILTER [CODE / NAME]..."
            value={searchQuery}
            onChange={(e) => {
              sound.playKeyBeep(1400, 0.02);
              setSearchQuery(e.target.value);
            }}
            className="w-full bg-[#081008] border border-[#1b3d1b] rounded px-2.5 py-1 text-xs tracking-wider placeholder:text-[#2d522d] focus:outline-none focus:border-current"
            style={{ color: activeTheme.primary }}
          />
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const qty = getQuantityInCart(item.id);
          const isSelected = qty > 0;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? "bg-[#0f210f] border-current shadow-[0_0_10px_rgba(51,255,51,0.15)]"
                  : "bg-[#091109] border-[#182d18] hover:border-[#2d572d]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#102210] border border-[#234623] text-emerald-400 font-bold">
                      [{item.code}]
                    </span>
                    <h3 className="text-sm font-bold tracking-wide uppercase line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  {/* Price Tag in KES */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold tracking-tight">
                      KES {item.price}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6d916d] mt-1 line-clamp-2">
                  {item.description}
                </p>

                {/* Meta details: prep time, stock, tags */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-[#4d754d]">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> ~{item.prepTimeMinutes}m prep
                  </span>
                  <span>•</span>
                  <span>STOCK: {item.stock - qty}</span>
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-1 py-0.2 rounded bg-[#142814] text-[9px] text-emerald-300 font-semibold uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#162916]">
                <div className="text-xs">
                  {qty > 0 ? (
                    <span className="text-xs font-bold text-emerald-300">
                      IN TRAY: <span className="underline">{qty}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#3d603d]">CLICK TO SELECT</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {qty > 0 && (
                    <button
                      onClick={() => {
                        sound.playKeyBeep(700, 0.03);
                        onRemoveFromCart(item.id);
                      }}
                      className="size-7 rounded bg-[#1b2b1b] hover:bg-[#283d28] border border-[#2b4d2b] flex items-center justify-center text-emerald-300 transition-colors"
                      title="Remove 1"
                    >
                      <Minus size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      sound.playKeyBeep(1200, 0.03);
                      onAddToCart(item);
                    }}
                    disabled={item.stock - qty <= 0}
                    className="h-7 px-3 rounded bg-[#143314] hover:bg-[#1e4d1e] active:scale-95 border border-[#33FF33] flex items-center gap-1 text-xs font-bold transition-all shadow-[0_0_6px_rgba(51,255,51,0.2)] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Plus size={13} />
                    <span>{qty > 0 ? "ADD MORE" : "ADD TO ORDER"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
