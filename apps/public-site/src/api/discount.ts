export interface DiscountInfo {
  percentage: number; // e.g. 30, 20, 10, 0
  label: string;      // e.g. "30% Early Bird"
  expiresAt: Date;    // Target date for the countdown
  batchDate: Date;    // Oct 5, 2026
  hasBatchStarted: boolean;
}

export const BATCH_START_DATE = new Date('2026-10-05T00:00:00');

export const MILESTONES = [
  { date: new Date('2026-09-25T00:00:00'), percentage: 30, label: '30% Early Bird Discount' },
  { date: new Date('2026-09-28T00:00:00'), percentage: 20, label: '20% Early Bird Discount' },
  { date: new Date('2026-09-30T00:00:00'), percentage: 10, label: '10% Early Bird Discount' },
  { date: new Date('2026-10-05T00:00:00'), percentage: 0, label: 'Standard Enrollment' },
];

export function getActiveDiscount(now: Date = new Date()): DiscountInfo {
  const hasBatchStarted = now >= BATCH_START_DATE;
  
  if (hasBatchStarted) {
    return {
      percentage: 0,
      label: 'Batch Started',
      expiresAt: BATCH_START_DATE,
      batchDate: BATCH_START_DATE,
      hasBatchStarted: true
    };
  }

  // Find the first milestone in the future
  for (const m of MILESTONES) {
    if (now < m.date) {
      return {
        percentage: m.percentage,
        label: m.label,
        expiresAt: m.date,
        batchDate: BATCH_START_DATE,
        hasBatchStarted: false
      };
    }
  }

  return {
    percentage: 0,
    label: 'Standard Enrollment',
    expiresAt: BATCH_START_DATE,
    batchDate: BATCH_START_DATE,
    hasBatchStarted: false
  };
}

export function calculateDiscountedPrice(basePrice: number, percentage: number): number {
  if (percentage <= 0) return basePrice;
  const rawPrice = basePrice * (1 - percentage / 100);
  return Math.round(rawPrice);
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function getTimeRemaining(targetDate: Date, now: Date = new Date()): TimeLeft {
  const totalMs = targetDate.getTime() - now.getTime();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }
  
  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds, totalMs };
}
