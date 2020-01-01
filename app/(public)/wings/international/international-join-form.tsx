// file: app/(public)/wings/international/international-join-form.tsx
"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

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

  // Success state with animation
  if (formState === "success") {
    return (
      <div 
        className={cn(
          "text-center py-12",
          !prefersReducedMotion && "animate-fade-in-up"
        )}
      >
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          {t("wings.international.form.success.title")}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {t("wings.international.form.success.text")}
        </p>
        <div className="mt-6 flex items-center justify-center gap-1 text-green-600 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Welcome to the International Wing</span>
        </div>
      </div>
    );
  }

  // Custom select styling
  const selectClassName = cn(
    "flex h-11 w-full rounded-lg border bg-background px-4 py-2 text-sm",
    "ring-offset-background transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "hover:border-slate-300"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {formState === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{t("wings.international.form.error")}</p>
        </div>
      )}

      {/* Name & Email Row */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            {t("wings.international.form.name")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "h-11 rounded-lg transition-all duration-200 hover:border-slate-300",
              errors.name && "border-red-400 focus:ring-red-400"
            )}
            placeholder="John Doe"
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            {t("wings.international.form.email")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(
              "h-11 rounded-lg transition-all duration-200 hover:border-slate-300",
              errors.email && "border-red-400 focus:ring-red-400"
            )}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Country & Languages Row */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium text-foreground">
            {t("wings.international.form.country")} <span className="text-red-500">*</span>
          </Label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            aria-invalid={errors.country ? "true" : "false"}
            aria-describedby={errors.country ? "country-error" : undefined}
            className={cn(
              selectClassName,
              "border-input",
              errors.country && "border-red-400 focus:ring-red-400"
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
            <p id="country-error" className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.country}
            </p>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label htmlFor="languages" className="text-sm font-medium text-foreground">
            {t("wings.international.form.languages")}
          </Label>
          <Input
            id="languages"
            value={formData.languages}
            onChange={(e) => handleChange("languages", e.target.value)}
            className="h-11 rounded-lg transition-all duration-200 hover:border-slate-300"
            placeholder={t("wings.international.form.languagesPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">Optional</p>
        </div>
      </div>

      {/* Area of Interest */}
      <div className="space-y-2">
        <Label htmlFor="interest" className="text-sm font-medium text-foreground">
          {t("wings.international.form.interest")} <span className="text-red-500">*</span>
        </Label>
        <select
          id="interest"
          value={formData.interest}
          onChange={(e) => handleChange("interest", e.target.value)}
          aria-invalid={errors.interest ? "true" : "false"}
          aria-describedby={errors.interest ? "interest-error" : undefined}
          className={cn(
            selectClassName,
            "border-input",
            errors.interest && "border-red-400 focus:ring-red-400"
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
          <p id="interest-error" className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.interest}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium text-foreground">
          {t("wings.international.form.message")}
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder={t("wings.international.form.messagePlaceholder")}
          rows={4}
          className="rounded-lg resize-none transition-all duration-200 hover:border-slate-300"
        />
        <p className="text-xs text-muted-foreground">Optional - max 500 characters</p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 pt-6" />

      {/* Consent */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => handleChange("consent", checked === true)}
            aria-invalid={errors.consent ? "true" : "false"}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className={cn(
              "mt-0.5 h-5 w-5 rounded border-2 transition-all duration-200",
              errors.consent && "border-red-400",
              formData.consent && "bg-primary border-primary"
            )}
          />
          <Label 
            htmlFor="consent" 
            className="text-sm leading-relaxed cursor-pointer font-normal text-foreground"
          >
            {t("wings.international.form.consent")} <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="text-sm text-red-500 flex items-center gap-1 ml-8">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.consent}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={formState === "loading"}
        className={cn(
          "w-full h-12 rounded-lg text-base font-medium",
          "shadow-md hover:shadow-lg transition-all duration-200",
          "disabled:opacity-70"
        )}
      >
        {formState === "loading" ? (
          <span className="flex items-center gap-2">
            <Loader2 
              className={cn(
                "h-5 w-5",
                !prefersReducedMotion && "animate-spin"
              )} 
            />
            {t("wings.international.form.submitting")}
          </span>
        ) : (
          t("wings.international.form.submit")
        )}
      </Button>
    </form>
  );
}
