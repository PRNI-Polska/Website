// file: app/(public)/wings/international/international-join-form.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type FormState = "idle" | "loading" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  country: string;
  languages: string;
  interest: string;
  message: string;
  consent: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  country?: string;
  interest?: string;
  consent?: string;
}

const COUNTRIES = [
  "Austria", "Belgium", "Czech Republic", "Denmark", "Finland", "France", 
  "Germany", "Hungary", "Ireland", "Italy", "Netherlands", "Norway", 
  "Portugal", "Romania", "Slovakia", "Spain", "Sweden", "Switzerland", 
  "Ukraine", "United Kingdom", "United States", "Canada", "Australia", "Other"
];

export function InternationalJoinForm() {
  const { t } = useI18n();
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    country: "",
    languages: "",
    interest: "",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("wings.international.form.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("wings.international.form.required");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("wings.international.form.invalidEmail");
    }

    if (!formData.country) {
      newErrors.country = t("wings.international.form.required");
    }

    if (!formData.interest) {
      newErrors.interest = t("wings.international.form.required");
    }

    if (!formData.consent) {
      newErrors.consent = t("wings.international.form.consentRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setFormState("loading");

    try {
      const response = await fetch("/api/international-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (formState === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t("wings.international.form.success.title")}
        </h3>
        <p className="text-muted-foreground">
          {t("wings.international.form.success.text")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {formState === "error" && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{t("wings.international.form.error")}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("wings.international.form.name")} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            aria-invalid={errors.name ? "true" : "false"}
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("wings.international.form.email")} *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            aria-invalid={errors.email ? "true" : "false"}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">{t("wings.international.form.country")} *</Label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            aria-invalid={errors.country ? "true" : "false"}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              errors.country && "border-destructive"
            )}
          >
            <option value="">{t("wings.international.form.countryPlaceholder")}</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country}</p>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label htmlFor="languages">{t("wings.international.form.languages")}</Label>
          <Input
            id="languages"
            value={formData.languages}
            onChange={(e) => handleChange("languages", e.target.value)}
            placeholder={t("wings.international.form.languagesPlaceholder")}
          />
        </div>
      </div>

      {/* Area of Interest */}
      <div className="space-y-2">
        <Label htmlFor="interest">{t("wings.international.form.interest")} *</Label>
        <select
          id="interest"
          value={formData.interest}
          onChange={(e) => handleChange("interest", e.target.value)}
          aria-invalid={errors.interest ? "true" : "false"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            errors.interest && "border-destructive"
          )}
        >
          <option value="">{t("wings.international.form.interestPlaceholder")}</option>
          <option value="translation">{t("wings.international.form.interestTranslation")}</option>
          <option value="outreach">{t("wings.international.form.interestOutreach")}</option>
          <option value="events">{t("wings.international.form.interestEvents")}</option>
          <option value="research">{t("wings.international.form.interestResearch")}</option>
          <option value="other">{t("wings.international.form.interestOther")}</option>
        </select>
        {errors.interest && (
          <p className="text-sm text-destructive">{errors.interest}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">{t("wings.international.form.message")}</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder={t("wings.international.form.messagePlaceholder")}
          rows={4}
        />
      </div>

      {/* Consent */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => handleChange("consent", checked === true)}
            aria-invalid={errors.consent ? "true" : "false"}
            className={cn(errors.consent && "border-destructive")}
          />
          <Label 
            htmlFor="consent" 
            className="text-sm leading-relaxed cursor-pointer font-normal"
          >
            {t("wings.international.form.consent")} *
          </Label>
        </div>
        {errors.consent && (
          <p className="text-sm text-destructive ml-7">{errors.consent}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={formState === "loading"}
        className="w-full"
      >
        {formState === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("wings.international.form.submitting")}
          </>
        ) : (
          t("wings.international.form.submit")
        )}
      </Button>
    </form>
  );
}
