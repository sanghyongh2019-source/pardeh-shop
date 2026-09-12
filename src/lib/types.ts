export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  fabricType: string;
  lightBlock: string;
  colors: ColorOption[];
}

export interface OrderItemInput {
  productId: string;
  colorName: string;
  colorHex: string;
  seamType: "پرچین" | "پیلی‌دار" | "حلقه‌ای";
  widthCm: number;
  lightBlockPct: number;
  quantity?: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentType: "full" | "installment";
  items: OrderItemInput[];
  installment?: {
    downPayment: number;
    months: number;
  };
}

export interface InstallmentScheduleEntry {
  month: number;
  amount: number;
}

export interface InstallmentResult {
  totalAmount: number;
  downPayment: number;
  months: number;
  interestRate: number;
  monthlyAmount: number;
  totalPayable: number;
  schedule: InstallmentScheduleEntry[];
}
