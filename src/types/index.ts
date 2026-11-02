export type ItemCategory = "food" | "drink" | "combo";

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number; // In KES
  category: ItemCategory;
  prepTimeMinutes: number;
  stock: number;
  tags?: string[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderType = "walkin" | "preorder";
export type PaymentMethod = "mpesa" | "cash";

export interface OrderRecord {
  orderId: string;
  transactionCode: string;
  type: OrderType;
  customerName: string;
  phone: string;
  pickupSlot: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  estimatedWaitMinutes: number;
  queueNumber: number;
}

export type PhosphorThemeId = "p1" | "p31" | "p39" | "p3" | "p12" | "ibm3279";

export interface PhosphorProfile {
  id: PhosphorThemeId;
  name: string;
  era: string;
  colorName: string;
  primary: string;
  dim: string;
  glow: string;
  bgDark: string;
  border: string;
  paperText: string;
  description: string;
}
