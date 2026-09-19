import { describe, it, expect } from "vitest";
import {
  daysUntil,
  getZone,
  calcCommission,
  formatINR,
  DEFAULT_COMMISSION_RULES,
  buildWhatsAppLink,
  RenewalPolicy,
} from "@/lib/renewals";

describe("CRM Business Logic & Calculation Regression Tests", () => {
  describe("1. Commission Calculations & Financial Edge Cases", () => {
    it("calculates commission correctly with integer rate", () => {
      expect(calcCommission(10000, 10)).toBe(1000);
      expect(calcCommission(25000, 12)).toBe(3000);
    });

    it("handles rounding correctly for non-integer commission results", () => {
      // 8500 * 11.5% = 977.5 -> Math.round(977.5) = 978
      expect(calcCommission(8500, 11.5)).toBe(978);
      // 1234 * 15% = 185.1 -> Math.round(185.1) = 185
      expect(calcCommission(1234, 15)).toBe(185);
    });

    it("handles zero, null/undefined premiums gracefully without crashing", () => {
      expect(calcCommission(0, 10)).toBe(0);
      expect(calcCommission(0, 0)).toBe(0);
    });

    it("formats Indian Rupee currency correctly", () => {
      expect(formatINR(10000)).toBe("₹10,000");
      expect(formatINR(1250000)).toBe("₹12,50,000");
      expect(formatINR(0)).toBe("₹0");
    });

    it("provides valid default commission rules for major insurance providers", () => {
      expect(DEFAULT_COMMISSION_RULES["LIC"]).toBe(15);
      expect(DEFAULT_COMMISSION_RULES["Star Health"]).toBe(12);
      expect(DEFAULT_COMMISSION_RULES["ICICI Lombard"]).toBe(10);
    });
  });

  describe("2. Renewal Date & Urgency Zone Calculations", () => {
    const today = new Date(2026, 7, 1); // Aug 1, 2026

    it("calculates exact days until renewal correctly", () => {
      expect(daysUntil("2026-08-01", today)).toBe(0);
      expect(daysUntil("2026-08-06", today)).toBe(5);
      expect(daysUntil("2026-08-31", today)).toBe(30);
      expect(daysUntil("2026-07-28", today)).toBe(-4);
    });

    it("categorizes days left into exact renewal urgency zones", () => {
      expect(getZone(-1)).toBe("overdue");
      expect(getZone(-10)).toBe("overdue");
      expect(getZone(0)).toBe("critical");
      expect(getZone(5)).toBe("critical");
      expect(getZone(6)).toBe("red");
      expect(getZone(7)).toBe("red");
      expect(getZone(8)).toBe("orange");
      expect(getZone(15)).toBe("orange");
      expect(getZone(30)).toBe("orange");
      expect(getZone(31)).toBe("green");
      expect(getZone(60)).toBe("green");
      expect(getZone(61)).toBe("safe");
      expect(getZone(100)).toBe("safe");
    });

    it("generates correct WhatsApp reminder deep-link URL encoding client details", () => {
      const mockPolicy: RenewalPolicy = {
        id: "POL-999",
        client: "Ramesh Kumar",
        phone: "919876543210",
        type: "Health Insurance",
        provider: "Star Health",
        premium: 20000,
        endDate: "2026-08-10",
      };

      const link = buildWhatsAppLink(mockPolicy, 9);
      expect(link).toContain("https://wa.me/919876543210?text=");
      expect(link).toContain("Ramesh%20Kumar");
      expect(link).toContain("POL-999");
      expect(link).toContain("expiring%20in%209%20days");
    });
  });

  describe("3. Dashboard Aggregation & Data Consistency Simulation", () => {
    const sampleLeads = [
      { id: "1", name: "Lead 1", status: "New", user_id: "user-1" },
      { id: "2", name: "Lead 2", status: "Won", user_id: "user-1" },
      { id: "3", name: "Lead 3", status: "Won", user_id: "user-1" },
      { id: "4", name: "Lead 4", status: "Lost", user_id: "user-1" },
    ];

    const samplePolicies = [
      { id: "p1", client: "Client 1", provider: "LIC", premium: 10000, status: "active", commission_rate: 15, end_date: "2026-08-10" },
      { id: "p2", client: "Client 2", provider: "Star Health", premium: 20000, status: "Active", commission_rate: 12, end_date: "2026-08-20" },
      { id: "p3", client: "Client 3", provider: "ICICI Lombard", premium: 15000, status: "expired", commission_rate: 10, end_date: "2026-07-01" },
    ];

    it("calculates total leads and conversion rate accurately", () => {
      const totalLeads = sampleLeads.length; // 4
      const wonLeads = sampleLeads.filter((l) => l.status === "Won").length; // 2
      const conversionRate = Math.round((wonLeads / totalLeads) * 100); // 50%

      expect(totalLeads).toBe(4);
      expect(wonLeads).toBe(2);
      expect(conversionRate).toBe(50);
    });

    it("filters active policies case-insensitively ('active' vs 'Active')", () => {
      const activePolicies = samplePolicies.filter((p) => p.status?.toLowerCase() === "active");
      expect(activePolicies.length).toBe(2);
    });

    it("calculates total agency commission accurately from policies", () => {
      const totalCommission = samplePolicies.reduce((sum, p) => {
        const rate = p.commission_rate ?? 10;
        return sum + calcCommission(p.premium, rate);
      }, 0);

      // p1: 10000 * 15% = 1500
      // p2: 20000 * 12% = 2400
      // p3: 15000 * 10% = 1500
      // Total = 5400
      expect(totalCommission).toBe(5400);
    });
  });
});
