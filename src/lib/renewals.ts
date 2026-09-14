// Renewal helpers, commission calculation and mock data.

export type RenewalZone = "safe" | "green" | "orange" | "red" | "critical" | "overdue";

export interface RenewalPolicy {
  id: string;
  client: string;
  phone: string; // E.164 digits without '+'
  type: string;
  provider: string;
  premium: number;
  endDate: string; // ISO yyyy-mm-dd
  commissionRate?: number; // override per policy
}

export function daysUntil(dateISO: string, today: Date = new Date()): number {
  const end = new Date(dateISO + "T00:00:00");
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getZone(daysLeft: number): RenewalZone {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 5) return "critical";
  if (daysLeft <= 7) return "red";
  if (daysLeft <= 15) return "orange";
  if (daysLeft <= 30) return "orange";
  if (daysLeft <= 60) return "green";
  return "safe";
}

export function zoneLabel(z: RenewalZone): string {
  switch (z) {
    case "overdue": return "Overdue";
    case "critical": return "Critical (<5d)";
    case "red": return "Red (5-7d)";
    case "orange": return "Orange";
    case "green": return "Green";
    case "safe": return "Safe";
  }
}

export function zoneBadgeClass(z: RenewalZone): string {
  switch (z) {
    case "overdue": return "bg-destructive/20 text-destructive border-destructive/40";
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "red": return "bg-destructive/10 text-destructive border-destructive/20";
    case "orange": return "bg-warning/10 text-warning border-warning/20";
    case "green": return "bg-success/10 text-success border-success/20";
    case "safe": return "bg-success/5 text-success border-success/10";
  }
}

// Default commission percentages per insurance provider — user editable
export const DEFAULT_COMMISSION_RULES: Record<string, number> = {
  "Star Health": 12,
  "ICICI Lombard": 10,
  "LIC": 15,
  "Bajaj Allianz": 11,
  "Max Bupa": 12,
  "HDFC Life": 14,
  "Tata AIG": 10,
  "Reliance General": 9,
};

export function calcCommission(premium: number, rate: number): number {
  return Math.round((premium * rate) / 100);
}

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// Build mock renewals relative to today so status colors are always meaningful
const addDays = (d: number): string => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

export const MOCK_RENEWALS: RenewalPolicy[] = [
  { id: "POL-1042", client: "Amit Verma",    phone: "919876543210", type: "Health Insurance",  provider: "Star Health",     premium: 24000, endDate: addDays(3)   },
  { id: "POL-1039", client: "Sunita Agarwal",phone: "919812345678", type: "Motor Insurance",   provider: "ICICI Lombard",   premium:  8500, endDate: addDays(6)   },
  { id: "POL-1051", client: "Rahul Joshi",   phone: "919900112233", type: "Life Insurance",    provider: "LIC",             premium: 45000, endDate: addDays(12)  },
  { id: "POL-1055", client: "Kavita Nair",   phone: "919845098765", type: "Home Insurance",    provider: "Bajaj Allianz",   premium: 12000, endDate: addDays(20)  },
  { id: "POL-1061", client: "Priya Sharma",  phone: "919833445566", type: "Health Insurance",  provider: "Max Bupa",        premium: 32000, endDate: addDays(45)  },
  { id: "POL-1067", client: "Arjun Reddy",   phone: "919871122334", type: "Term Insurance",    provider: "HDFC Life",       premium: 18000, endDate: addDays(72)  },
  { id: "POL-1029", client: "Meera Patel",   phone: "919812009988", type: "Health Insurance",  provider: "Star Health",     premium: 28000, endDate: addDays(-4)  },
  { id: "POL-1072", client: "Vikram Singh",  phone: "919867788990", type: "Motor Insurance",   provider: "Tata AIG",        premium:  9500, endDate: addDays(28)  },
];

export function buildWhatsAppLink(p: RenewalPolicy, daysLeft: number): string {
  const status = daysLeft < 0
    ? `overdue by ${Math.abs(daysLeft)} days`
    : `expiring in ${daysLeft} days`;
  const msg =
    `Hello ${p.client}, this is a friendly reminder from InsureFlow.\n\n` +
    `Your ${p.type} policy (${p.id}) with ${p.provider} is ${status} on ${p.endDate}.\n` +
    `Renewal premium: ${formatINR(p.premium)}.\n\n` +
    `Please reply here to renew or reschedule. Thank you!`;
  return `https://wa.me/${p.phone}?text=${encodeURIComponent(msg)}`;
}
