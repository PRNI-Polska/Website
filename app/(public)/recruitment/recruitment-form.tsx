"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { recruitmentFormSchema, type RecruitmentFormInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type FormState = "idle" | "loading" | "success" | "error";

export function RecruitmentForm() {
  const { t } = useI18n();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecruitmentFormInput>({
    resolver: zodResolver(recruitmentFormSchema),
  });

  const onSubmit = async (data: RecruitmentFormInput) => {
    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("recruitment.form.error"));
      }

      setFormState("success");
      reset();
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("recruitment.form.error")
      );
    }
  };

  if (formState === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("recruitment.form.success.title")}</h3>
        <p className="text-muted-foreground mb-4">{t("recruitment.form.success.text")}</p>
        <Button variant="outline" onClick={() => setFormState("idle")}>
          {t("recruitment.form.sendAnother")}
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
          <Label htmlFor="name">{t("recruitment.form.name")} *</Label>
          <Input
            id="name"
            placeholder={t("recruitment.form.namePlaceholder")}
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("recruitment.form.email")} *</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("recruitment.form.emailPlaceholder")}
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">{t("recruitment.form.location")}</Label>
        <Input
          id="location"
          placeholder={t("recruitment.form.locationPlaceholder")}
          {...register("location")}
          aria-invalid={errors.location ? "true" : "false"}
          className={cn(errors.location && "border-destructive")}
        />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">{t("recruitment.form.message")} *</Label>
        <Textarea
          id="message"
          placeholder={t("recruitment.form.messagePlaceholder")}
          rows={7}
          {...register("message")}
          aria-invalid={errors.message ? "true" : "false"}
          className={cn(errors.message && "border-destructive")}
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
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
            {t("recruitment.form.sending")}
          </>
        ) : (
          t("recruitment.form.send")
        )}
      </Button>

      <p className="text-xs text-muted-foreground">{t("recruitment.form.requiredHint")}</p>
    </form>
  );
}

