import { InstallmentResult } from "./types";

// نرخ سود ماهانه‌ی نمایشی برای نسخه‌ی آزمایشی (mock).
// در نسخه‌ی واقعی این نرخ و اعتبارسنجی مشتری باید از درگاه اقساطی/بانک
// (مثل درگاه‌های اعتباری بانکی فعال در ایران) دریافت شود، نه اینکه ثابت باشد.
const MONTHLY_INTEREST_RATE = 0.02; // ۲٪ در ماه، فقط برای نمایش
const MIN_MONTHS = 1;
const MAX_MONTHS = 12;

export function calculateInstallment(
  totalAmount: number,
  downPayment: number,
  months: number
): InstallmentResult {
  if (totalAmount <= 0) throw new Error("مبلغ کل باید بیشتر از صفر باشد.");
  if (downPayment < 0 || downPayment >= totalAmount)
    throw new Error("پیش‌پرداخت نامعتبر است.");
  if (months < MIN_MONTHS || months > MAX_MONTHS)
    throw new Error(`تعداد اقساط باید بین ${MIN_MONTHS} تا ${MAX_MONTHS} ماه باشد.`);

  const financedAmount = totalAmount - downPayment;
  const totalWithInterest = Math.round(
    financedAmount * (1 + MONTHLY_INTEREST_RATE * months)
  );
  const monthlyAmount = Math.round(totalWithInterest / months);

  const schedule = Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    amount: i === months - 1 ? totalWithInterest - monthlyAmount * (months - 1) : monthlyAmount,
  }));

  return {
    totalAmount,
    downPayment,
    months,
    interestRate: MONTHLY_INTEREST_RATE,
    monthlyAmount,
    totalPayable: downPayment + totalWithInterest,
    schedule,
  };
}
