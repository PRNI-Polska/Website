"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Lock, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

type Step = "credentials" | "2fa";

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [step, setStep] = useState<Step>("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [challengeToken, setChallengeToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Step 1: Submit credentials and request 2FA code
  const onSubmitCredentials = async (data: LoginInput) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setLoginError(result.error || "Invalid email or password");
        return;
      }

      // Password verified, 2FA code sent
      setChallengeToken(result.challengeToken);
      setEmail(data.email);
      setPassword(data.password);
      setStep("2fa");
      setCodeDigits(["", "", "", "", "", ""]);

      // Focus first input after render
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setLoginError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newDigits.every((d) => d !== "")) {
      handleVerifyCode(newDigits.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setCodeDigits(digits);
      inputRefs.current[5]?.focus();
      handleVerifyCode(pasted);
    }
  };

  // Step 2: Verify 2FA code and complete login
  const handleVerifyCode = async (code: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // Verify the code
      const verifyRes = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          challengeToken,
          code,
        }),
      });

      const verifyResult = await verifyRes.json();

      if (!verifyRes.ok) {
        setLoginError(verifyResult.error || "Invalid code");
        setCodeDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        setIsLoading(false);
        return;
      }

      // Code verified! Now sign in via NextAuth with the challenge token
      const signInResult = await signIn("credentials", {
        email,
        password,
        challengeToken,
        redirect: false,
      });

      if (signInResult?.error) {
        setLoginError("Login failed. Please try again.");
        setStep("credentials");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setLoginError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            {step === "credentials" ? (
              <Lock className="h-6 w-6 text-primary-foreground" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === "credentials" ? "Admin Login" : "Verification Code"}
          </CardTitle>
          <CardDescription>
            {step === "credentials"
              ? "Sign in to access the admin dashboard"
              : "Enter the 6-digit code sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{loginError}</p>
            </div>
          )}

          {/* Step 1: Credentials */}
          {step === "credentials" && (
            <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  {...register("email")}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  className={cn(errors.password && "border-destructive")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {/* Step 2: 2FA Code */}
          {step === "2fa" && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-1 p-2 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Code sent to your email</span>
              </div>

              {/* 6-digit code input */}
              <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                {codeDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    disabled={isLoading}
                    className={cn(
                      "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-background",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none",
                      "transition-all",
                      digit ? "border-primary" : "border-muted-foreground/20"
                    )}
                  />
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying code...
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleVerifyCode(codeDigits.join(""))}
                  disabled={isLoading || codeDigits.some((d) => !d)}
                  className="w-full"
                >
                  Verify & Sign In
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("credentials");
                    setLoginError(null);
                    setChallengeToken("");
                    setCodeDigits(["", "", "", "", "", ""]);
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Code expires in 5 minutes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
