"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import { Eye, EyeOff, Wallet } from "lucide-react";

const signupSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required.")
    .max(50, "Max 50 characters."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["dad", "mom"], {
    message: "Please select your role.",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      role: "dad",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            display_name: values.displayName,
            role: values.role,
          },
        },
      });

      if (error) {
        showToast(error.message, "error");
        return;
      }

      if (data.user) {
        showToast("Account created successfully ✓", "success");
        router.push("/join-household");
        router.refresh();
      }
    } catch (err) {
      showToast("Couldn't create account. Please try again.", "error");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          padding: "0 16px 32px",
        }}
      >
        {/* Header */}
        <header
          style={{
            marginTop: "24px",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "12px",
                backgroundColor: "#1a56db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              <Wallet size={32} />
            </div>
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            PaisaLog
          </h1>
          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.4,
              color: "#6b7280",
            }}
          >
            Simplify your family's shared expenses.
          </p>
        </header>

        {/* Hero Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "160px",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          }}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOteXYZ7YCkm9F06E5NlIx3sfCprsracInFup79MQ2tUi0Y2HsQYI00C4wukHd7qneKTmdMhKyOSi0RVTExuQvg7Qnfi-Yrwu1MqSg7qN_bnDSzlXOEYO-y9YuBZXUnvkhF7dUxISSo1fp3PZzzksLQaSAcQLayzvBRg0a0j2COkIBAdhi8-2Cj-5HyYBngoEIrJtywFS9C-Zbqhui1Wq8clSqeBO7h-25X0wGN7O01K2w9KBbmMDW_0PoQZDyGYtVV5zUy3zyV5M"
            alt="Clean workspace with laptop and financial notebook"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.20), transparent)",
            }}
          />
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Display Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="displayName"
              style={{
                fontSize: "13px",
                lineHeight: 1.4,
                fontWeight: 400,
                color: focusedField === "displayName" ? "#1a56db" : "#434654",
                paddingLeft: "4px",
                transition: "color 0.15s",
              }}
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="John Doe"
              {...form.register("displayName")}
              onFocus={() => setFocusedField("displayName")}
              onBlur={() => setFocusedField(null)}
              style={{
                height: "52px",
                width: "100%",
                padding: "0 16px",
                borderRadius: "12px",
                border: form.formState.errors.displayName
                  ? "1.5px solid #dc2626"
                  : focusedField === "displayName"
                  ? "1.5px solid #1a56db"
                  : "1.5px solid #e5e7eb",
                backgroundColor: "#ffffff",
                fontSize: "15px",
                color: "#111827",
                outline: "none",
                boxShadow:
                  focusedField === "displayName"
                    ? "0 0 0 2px rgba(26, 86, 219, 0.10)"
                    : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
            />
            {form.formState.errors.displayName && (
              <p style={{ fontSize: "13px", color: "#dc2626", paddingLeft: "4px" }}>
                ⚠ {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "13px",
                lineHeight: 1.4,
                fontWeight: 400,
                color: "#434654",
                paddingLeft: "4px",
              }}
            >
              Who are you?
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => form.setValue("role", "dad")}
                style={{
                  flex: 1,
                  height: "52px",
                  borderRadius: "12px",
                  border: form.watch("role") === "dad" ? "2px solid #1a56db" : "1.5px solid #e5e7eb",
                  backgroundColor: form.watch("role") === "dad" ? "#f0f7ff" : "#ffffff",
                  color: form.watch("role") === "dad" ? "#1a56db" : "#434654",
                  fontWeight: form.watch("role") === "dad" ? 600 : 400,
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Dad
              </button>
              <button
                type="button"
                onClick={() => form.setValue("role", "mom")}
                style={{
                  flex: 1,
                  height: "52px",
                  borderRadius: "12px",
                  border: form.watch("role") === "mom" ? "2px solid #1a56db" : "1.5px solid #e5e7eb",
                  backgroundColor: form.watch("role") === "mom" ? "#f0f7ff" : "#ffffff",
                  color: form.watch("role") === "mom" ? "#1a56db" : "#434654",
                  fontWeight: form.watch("role") === "mom" ? 600 : 400,
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Mom
              </button>
            </div>
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="email"
              style={{
                fontSize: "13px",
                lineHeight: 1.4,
                fontWeight: 400,
                color: focusedField === "email" ? "#1a56db" : "#434654",
                paddingLeft: "4px",
                transition: "color 0.15s",
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...form.register("email")}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={{
                height: "52px",
                width: "100%",
                padding: "0 16px",
                borderRadius: "12px",
                border: form.formState.errors.email
                  ? "1.5px solid #dc2626"
                  : focusedField === "email"
                  ? "1.5px solid #1a56db"
                  : "1.5px solid #e5e7eb",
                backgroundColor: "#ffffff",
                fontSize: "15px",
                color: "#111827",
                outline: "none",
                boxShadow:
                  focusedField === "email"
                    ? "0 0 0 2px rgba(26, 86, 219, 0.10)"
                    : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
            />
            {form.formState.errors.email && (
              <p style={{ fontSize: "13px", color: "#dc2626", paddingLeft: "4px" }}>
                ⚠ {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="password"
              style={{
                fontSize: "13px",
                lineHeight: 1.4,
                fontWeight: 400,
                color: focusedField === "password" ? "#1a56db" : "#434654",
                paddingLeft: "4px",
                transition: "color 0.15s",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                {...form.register("password")}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={{
                  height: "52px",
                  width: "100%",
                  padding: "0 48px 0 16px",
                  borderRadius: "12px",
                  border: form.formState.errors.password
                    ? "1.5px solid #dc2626"
                    : focusedField === "password"
                    ? "1.5px solid #1a56db"
                    : "1.5px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "15px",
                  color: "#111827",
                  outline: "none",
                  boxShadow:
                    focusedField === "password"
                      ? "0 0 0 2px rgba(26, 86, 219, 0.10)"
                      : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#434654",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p style={{ fontSize: "13px", color: "#dc2626", paddingLeft: "4px" }}>
                ⚠ {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            style={{
              marginTop: "12px",
              height: "52px",
              width: "100%",
              backgroundColor: form.formState.isSubmitting ? "#6b7280" : "#1a56db",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: 1.3,
              borderRadius: "12px",
              border: "none",
              cursor: form.formState.isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.10)",
              transition: "opacity 0.15s, transform 0.15s, background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!form.formState.isSubmitting)
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.90";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
            onMouseDown={(e) => {
              if (!form.formState.isSubmitting)
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Terms */}
        <p
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "#6b7280",
            padding: "0 24px",
          }}
        >
          By creating an account, you agree to our{" "}
          <a href="#" style={{ color: "#003fb1", fontWeight: 500 }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" style={{ color: "#003fb1", fontWeight: 500 }}>
            Privacy Policy
          </a>
          .
        </p>

        {/* Footer */}
        <footer
          style={{
            marginTop: "auto",
            paddingTop: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#434654" }}>
              Already have an account?
            </span>
            <Link
              href="/login"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#003fb1",
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
          </div>
          {/* Subtle branding dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.3, marginTop: "8px" }}>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#434654" }} />
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#434654" }} />
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#434654" }} />
          </div>
        </footer>
      </main>
    </div>
  );
}