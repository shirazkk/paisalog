import { z } from "zod";

/**
 * Shared transaction validation schema used by both Client (Forms) and Server (API).
 * Ensures consistency between UI feedback and database constraints.
 */
export const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (numbers only)")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0")
    .refine((val) => parseFloat(val) <= 9999999.99, "Amount is too large"),

  direction: z.enum(["dad_to_mom", "mom_to_dad"], {
    message: "Please select who gave the money",
  }),

  category: z.enum(
    ["home_expenses", "grocery", "utility", "personal", "other"],
    {
      message: "Please select a category",
    }
  ),

  txn_date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
      // Manually parse YYYY-MM-DD to avoid timezone shifts
      const [year, month, day] = val.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      return selectedDate <= todayNoTime;
    }, "Date cannot be in the future"),

  note: z
    .string()
    .max(200, "Note must be 200 characters or less")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
