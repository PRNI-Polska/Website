// file: app/(public)/contact/contact-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Turnstile } from "@/components/turnstile";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const { t } = useI18n();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormInput) => {
    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setFormState("success");
      reset();
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setTurnstileResetKey((k) => k + 1);
    }
  };

  if (formState === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("contact.form.success")}</h3>
        <p className="text-muted-foreground mb-4">
          {t("contact.form.success.text")}
        </p>
        <Button
          variant="outline"
          onClick={() => setFormState("idle")}
        >
          {t("contact.form.sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {formState === "error" && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("contact.form.name")} *</Label>
          <Input
            id="name"
            placeholder={t("contact.form.name.placeholder")}
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("contact.form.email")} *</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("contact.form.email.placeholder")}
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">{t("contact.form.subject")} *</Label>
        <Input
          id="subject"
          placeholder={t("contact.form.subject.placeholder")}
          {...register("subject")}
          aria-invalid={errors.subject ? "true" : "false"}
          className={cn(errors.subject && "border-destructive")}
        />
        {errors.subject && (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">{t("contact.form.message")} *</Label>
        <Textarea
          id="message"
          placeholder={t("contact.form.message.placeholder")}
          rows={6}
          {...register("message")}
          aria-invalid={errors.message ? "true" : "false"}
          className={cn(errors.message && "border-destructive")}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {/* Honeypot field - hidden from users, catches bots */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {/* CAPTCHA */}
      <Turnstile
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
        resetKey={turnstileResetKey}
      />

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={formState === "loading"}
        className="w-full sm:w-auto"
      >
        {formState === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("contact.form.sending")}
          </>
        ) : (
          t("contact.form.send")
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        {t("contact.form.required")}
      </p>
    </form>
  );
}
