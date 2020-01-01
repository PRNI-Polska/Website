"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingBag, Loader2, AlertCircle, ArrowLeft, ShoppingCart, X, Minus, Plus, Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useMemberLang } from "@/lib/members/LangContext";
import type { MemberTranslationKey } from "@/lib/members/i18n";

interface ProductFile {
  type: string;
  preview_url: string;
  thumbnail_url: string;
  visible: boolean;
}

interface ProductVariant {
  id: number;
  name: string;
  retail_price: string;
  currency: string;
  size: string;
  color: string;
  availability_status: string;
  product: { image: string; name: string };
  files: ProductFile[];
}

interface Product {
  id: number;
  name: string;
  variants: number;
  thumbnail_url: string;
  preview_image?: string;
  price_from?: string | null;
  currency?: string;
}

interface ProductDetail {
  sync_product: Product;
  sync_variants: ProductVariant[];
}

interface CartItem {
  variantId: number;
  productName: string;
  variantName: string;
  size: string;
  color: string;
  price: string;
  currency: string;
  qty: number;
  image: string;
}

interface ShippingAddress {
  name: string;
  address1: string;
  address2: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
  phone: string;
  email: string;
}

const EMPTY_ADDRESS: ShippingAddress = {
  name: "", address1: "", address2: "", city: "",
  state_code: "", country_code: "PL", zip: "", phone: "", email: "",
};

const COUNTRIES = [
  { code: "PL", name: "Poland" }, { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" }, { code: "CH", name: "Switzerland" },
  { code: "CZ", name: "Czech Republic" }, { code: "SK", name: "Slovakia" },
  { code: "LT", name: "Lithuania" }, { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" }, { code: "HU", name: "Hungary" },
  { code: "FR", name: "France" }, { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" }, { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" }, { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" }, { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" }, { code: "PT", name: "Portugal" },
  { code: "GB", name: "United Kingdom" }, { code: "IE", name: "Ireland" },
  { code: "US", name: "United States" }, { code: "CA", name: "Canada" },
  { code: "RO", name: "Romania" }, { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" }, { code: "SI", name: "Slovenia" },
];

function getVariantImage(variant: ProductVariant): string {
  const preview = variant.files.find((f) => f.type === "preview");
  if (preview) return preview.preview_url;
  const def = variant.files.find((f) => f.type === "default");
  if (def) return def.preview_url;
  return variant.product.image;
}

const CURRENCY_LOCALES: Record<string, string> = {
  PLN: "pl-PL", EUR: "de-DE", USD: "en-US", GBP: "en-GB", CHF: "de-CH",
  CZK: "cs-CZ", SEK: "sv-SE", NOK: "nb-NO", DKK: "da-DK", HUF: "hu-HU",
};

const CURRENCY_OPTIONS = [
  { code: "PLN", label: "PLN (zł)" }, { code: "EUR", label: "EUR (€)" },
  { code: "USD", label: "USD ($)" }, { code: "GBP", label: "GBP (£)" },
  { code: "CHF", label: "CHF (Fr)" }, { code: "CZK", label: "CZK (Kč)" },
  { code: "SEK", label: "SEK (kr)" }, { code: "NOK", label: "NOK (kr)" },
  { code: "DKK", label: "DKK (kr)" }, { code: "HUF", label: "HUF (Ft)" },
];

function formatPrice(price: string | number, currency: string): string {
  const locale = CURRENCY_LOCALES[currency] || "en-US";
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat(locale, {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(num);
}

function convertPrice(
  price: string | number, fromCurrency: string, toCurrency: string,
  rates: Record<string, number> | null, baseCurrency: string
): number {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (!rates || fromCurrency === toCurrency) return num;
  if (fromCurrency === baseCurrency) return num * (rates[toCurrency] || 1);
  const inBase = num / (rates[fromCurrency] || 1);
  return inBase * (rates[toCurrency] || 1);
}

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-8 text-sm text-white hover:border-[#555] transition cursor-pointer focus:outline-none focus:border-[#555]"
      >
        {CURRENCY_OPTIONS.map((c) => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#666] pointer-events-none" />
    </div>
  );
}

export default function MembersMerchPage() {
  const { t } = useMemberLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderState, setOrderState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [orderError, setOrderError] = useState("");

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping">("cart");
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  const [displayCurrency, setDisplayCurrency] = useState<string>("PLN");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [baseCurrency, setBaseCurrency] = useState<string>("CHF");

  useEffect(() => {
    const saved = localStorage.getItem("merch-currency");
    if (saved && CURRENCY_OPTIONS.some((c) => c.code === saved)) {
      setDisplayCurrency(saved);
    }
    const savedAddr = localStorage.getItem("merch-address");
    if (savedAddr) {
      try { setAddress(JSON.parse(savedAddr)); } catch { /* ignore */ }
    }
  }, []);

  function handleCurrencyChange(code: string) {
    setDisplayCurrency(code);
    localStorage.setItem("merch-currency", code);
  }

  function displayPrice(price: string | number, fromCurrency: string): string {
    const converted = convertPrice(price, fromCurrency, displayCurrency, rates, baseCurrency);
    return formatPrice(converted, displayCurrency);
  }

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/members/merch");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products);
      const storeBase = data.products[0]?.currency || "CHF";
      setBaseCurrency(storeBase);
      const ratesRes = await fetch(`/api/members/merch/rates?base=${storeBase}`);
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        setRates(ratesData.rates);
      }
    } catch {
      setError(t("merch.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function openProduct(id: number) {
    setDetailLoading(true);
    setDetail(null);
    setSelectedVariant(null);
    try {
      const res = await fetch(`/api/members/merch/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetail(data.product);
      if (data.product.sync_variants.length > 0) {
        setSelectedVariant(data.product.sync_variants[0].id);
      }
    } catch {
      setError(t("merch.error"));
    } finally {
      setDetailLoading(false);
    }
  }

  function addToCart(variant: ProductVariant) {
    if (!detail) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.variantId === variant.id);
      if (existing) {
        return prev.map((c) =>
          c.variantId === variant.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, {
        variantId: variant.id,
        productName: detail.sync_product.name,
        variantName: variant.name,
        size: variant.size,
        color: variant.color,
        price: variant.retail_price,
        currency: variant.currency,
        qty: 1,
        image: getVariantImage(variant),
      }];
    });
    setCartOpen(true);
    setCheckoutStep("cart");
  }

  function updateQty(variantId: number, delta: number) {
    setCart((prev) =>
      prev.map((c) =>
        c.variantId === variantId ? { ...c, qty: Math.max(0, c.qty + delta) } : c
      ).filter((c) => c.qty > 0)
    );
  }

  function removeFromCart(variantId: number) {
    setCart((prev) => prev.filter((c) => c.variantId !== variantId));
  }

  const cartTotal = cart.reduce((sum, c) => sum + parseFloat(c.price) * c.qty, 0);
  const cartCurrency = cart[0]?.currency || "CHF";

  async function handlePlaceOrder() {
    if (!address.name || !address.address1 || !address.city || !address.zip || !address.country_code || !address.email) {
      setOrderError(t("merch.requiredField"));
      return;
    }

    setOrderState("loading");
    setOrderError("");

    localStorage.setItem("merch-address", JSON.stringify(address));

    try {
      const res = await fetch("/api/members/merch/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          recipient: {
            name: address.name,
            address1: address.address1,
            address2: address.address2 || undefined,
            city: address.city,
            state_code: address.state_code || undefined,
            country_code: address.country_code,
            zip: address.zip,
            phone: address.phone || undefined,
            email: address.email,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed");
      }
      setOrderState("success");
      setCart([]);
      setCheckoutStep("cart");
    } catch (err) {
      setOrderState("error");
      setOrderError(err instanceof Error ? err.message : t("merch.orderError"));
    }
  }

  const drawerProps = {
    cart, cartOpen, setCartOpen, updateQty, removeFromCart,
    cartTotal, cartCurrency, orderState, setOrderState,
    orderError, t, displayPrice,
    checkoutStep, setCheckoutStep, address, setAddress,
    handlePlaceOrder,
  };

  if (detail || detailLoading) {
    const currentVariant = detail?.sync_variants.find((v) => v.id === selectedVariant);
    const mainImage = currentVariant ? getVariantImage(currentVariant) : detail?.sync_product.thumbnail_url;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setDetail(null); setSelectedVariant(null); }}
            className="flex items-center gap-2 text-sm text-[#666] hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("merch.backToStore")}
          </button>
          <CurrencySelect value={displayCurrency} onChange={handleCurrencyChange} />
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#666]" />
          </div>
        ) : detail ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-square bg-[#111] rounded-lg overflow-hidden border border-[#1a1a1a]">
              {mainImage && (
                <Image src={mainImage} alt={detail.sync_product.name} fill
                  sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-4" />
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">{detail.sync_product.name}</h1>
              {currentVariant && (
                <p className="text-xl text-white font-medium mb-6">
                  {displayPrice(currentVariant.retail_price, currentVariant.currency)}
                </p>
              )}

              {detail.sync_variants.length > 1 && (
                <div className="mb-6">
                  <label className="text-sm text-[#888] mb-2 block">{t("merch.selectVariant")}</label>
                  <div className="flex flex-wrap gap-2">
                    {detail.sync_variants.map((v) => (
                      <button key={v.id} onClick={() => setSelectedVariant(v.id)}
                        className={`px-4 py-2 rounded-lg text-sm border transition ${
                          selectedVariant === v.id
                            ? "border-white bg-white text-black"
                            : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
                        }`}
                      >{v.size}</button>
                    ))}
                  </div>
                </div>
              )}

              {currentVariant && (
                <div className="space-y-2 mb-8 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                    <span className="text-[#888]">{t("merch.size")}</span>
                    <span>{currentVariant.size}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                    <span className="text-[#888]">{t("merch.color")}</span>
                    <span>{currentVariant.color}</span>
                  </div>
                </div>
              )}

              {currentVariant && (
                <button onClick={() => addToCart(currentVariant)}
                  className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-[#ddd] transition text-sm">
                  {t("merch.addToCart")}
                </button>
              )}

              {detail.sync_variants.length > 1 && (
                <div className="flex gap-2 mt-6">
                  {detail.sync_variants.map((v) => {
                    const img = getVariantImage(v);
                    return (
                      <button key={v.id} onClick={() => setSelectedVariant(v.id)}
                        className={`relative w-16 h-16 rounded border overflow-hidden ${
                          selectedVariant === v.id ? "border-white" : "border-[#333]"
                        }`}>
                        <Image src={img} alt={v.name} fill sizes="64px" className="object-contain p-1" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <CartDrawer {...drawerProps} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{t("merch.title")}</h1>
          <p className="text-[#888] text-sm">{t("merch.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencySelect value={displayCurrency} onChange={handleCurrencyChange} />
          {cart.length > 0 && (
            <button onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg border border-[#333] hover:border-[#555] transition">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.reduce((s, c) => s + c.qty, 0)}
              </span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#666]">
          <Loader2 className="h-6 w-6 animate-spin mb-3" />
          <p className="text-sm">{t("merch.loading")}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 text-center">
          <AlertCircle className="h-8 w-8 text-red-500/70 mb-3" />
          <p className="text-sm text-[#888] mb-4">{error}</p>
          <button onClick={loadProducts}
            className="px-4 py-2 bg-[#1a1a1a] text-sm rounded-lg hover:bg-[#222] transition">
            {t("merch.retry")}
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="border border-[#1a1a1a] rounded-lg p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#444] mb-4" />
          <p className="text-[#666] text-sm">{t("merch.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <button key={product.id} onClick={() => openProduct(product.id)}
              className="group text-left border border-[#1a1a1a] rounded-lg overflow-hidden hover:border-[#333] transition bg-[#0d0d0d]">
              <div className="relative aspect-square bg-[#111]">
                <Image src={product.preview_image || product.thumbnail_url} alt={product.name}
                  fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 border-t border-[#1a1a1a]">
                <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#666]">
                    {product.variants} {product.variants === 1 ? t("merch.variant") : t("merch.variants")}
                  </p>
                  {product.price_from && (
                    <p className="text-sm font-medium">
                      {t("merch.from")} {displayPrice(product.price_from, product.currency || "PLN")}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <CartDrawer {...drawerProps} />
    </div>
  );
}

function FormInput({ label, value, onChange, required, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[#888] mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#555] transition"
      />
    </div>
  );
}

function CartDrawer({
  cart, cartOpen, setCartOpen, updateQty, removeFromCart,
  cartTotal, cartCurrency, orderState, setOrderState,
  orderError, t, displayPrice,
  checkoutStep, setCheckoutStep, address, setAddress,
  handlePlaceOrder,
}: {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  updateQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  cartTotal: number;
  cartCurrency: string;
  orderState: "idle" | "loading" | "success" | "error";
  setOrderState: (v: "idle" | "loading" | "success" | "error") => void;
  orderError: string;
  t: (key: MemberTranslationKey) => string;
  displayPrice: (price: string | number, fromCurrency: string) => string;
  checkoutStep: "cart" | "shipping";
  setCheckoutStep: (v: "cart" | "shipping") => void;
  address: ShippingAddress;
  setAddress: (v: ShippingAddress) => void;
  handlePlaceOrder: () => void;
}) {
  if (!cartOpen) return null;

  function closeDrawer() {
    setCartOpen(false);
    if (orderState === "success") {
      setOrderState("idle");
      setCheckoutStep("cart");
    }
  }

  function updateAddr(field: keyof ShippingAddress, value: string) {
    setAddress({ ...address, [field]: value });
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={closeDrawer} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-[#1a1a1a] z-[100] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <h2 className="font-semibold">
            {checkoutStep === "shipping" ? t("merch.shippingInfo") : t("merch.cart")}
          </h2>
          <button onClick={closeDrawer} className="p-1 hover:bg-[#1a1a1a] rounded transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {orderState === "success" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Check className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("merch.orderPlaced")}</h3>
            <p className="text-sm text-[#888]">{t("merch.orderConfirmed")}</p>
          </div>
        ) : cart.length === 0 && checkoutStep === "cart" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#666]">
            <ShoppingCart className="h-8 w-8 mb-3" />
            <p className="text-sm">{t("merch.cartEmpty")}</p>
          </div>
        ) : checkoutStep === "shipping" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <button
                onClick={() => setCheckoutStep("cart")}
                className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition mb-2"
              >
                <ArrowLeft className="h-3 w-3" />
                {t("merch.backToCart")}
              </button>

              <FormInput label={t("merch.fullName")} value={address.name}
                onChange={(v) => updateAddr("name", v)} required placeholder="Jan Kowalski" />
              <FormInput label={t("merch.email")} value={address.email}
                onChange={(v) => updateAddr("email", v)} required type="email" placeholder="jan@email.com" />
              <FormInput label={t("merch.address")} value={address.address1}
                onChange={(v) => updateAddr("address1", v)} required placeholder="ul. Marszałkowska 1" />
              <FormInput label={t("merch.addressLine2")} value={address.address2}
                onChange={(v) => updateAddr("address2", v)} placeholder="m. 5" />

              <div className="grid grid-cols-2 gap-3">
                <FormInput label={t("merch.city")} value={address.city}
                  onChange={(v) => updateAddr("city", v)} required placeholder="Warszawa" />
                <FormInput label={t("merch.postalCode")} value={address.zip}
                  onChange={(v) => updateAddr("zip", v)} required placeholder="00-001" />
              </div>

              <FormInput label={t("merch.stateRegion")} value={address.state_code}
                onChange={(v) => updateAddr("state_code", v)} placeholder="mazowieckie" />

              <div>
                <label className="text-xs text-[#888] mb-1 block">
                  {t("merch.country")}<span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={address.country_code}
                    onChange={(e) => updateAddr("country_code", e.target.value)}
                    className="w-full appearance-none bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#555] transition"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#666] pointer-events-none" />
                </div>
              </div>

              <FormInput label={t("merch.phone")} value={address.phone}
                onChange={(v) => updateAddr("phone", v)} type="tel" placeholder="+48 123 456 789" />

              <div className="pt-3 border-t border-[#1a1a1a] space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-[#888]">
                    <span>{item.productName} ({item.size}) x{item.qty}</span>
                    <span className="text-white">{displayPrice(parseFloat(item.price) * item.qty, item.currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t border-[#1a1a1a]">
                  <span>{t("merch.total")}</span>
                  <span>{displayPrice(cartTotal, cartCurrency)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1a1a1a] space-y-3">
              {orderError && (
                <p className="text-red-400 text-xs text-center">{orderError}</p>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={orderState === "loading"}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-[#ddd] transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {orderState === "loading" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{t("merch.ordering")}</>
                ) : t("merch.placeOrder")}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-3 p-3 bg-[#111] rounded-lg border border-[#1a1a1a]">
                  <div className="relative w-16 h-16 bg-[#0a0a0a] rounded overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.variantName} fill sizes="64px" className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-[#666] truncate">{item.size} / {item.color}</p>
                    <p className="text-sm mt-1">{displayPrice(item.price, item.currency)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeFromCart(item.variantId)} className="text-[#555] hover:text-red-400 transition">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center gap-1 border border-[#333] rounded">
                      <button onClick={() => updateQty(item.variantId, -1)} className="p-1 hover:bg-[#1a1a1a] transition">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.variantId, 1)} className="p-1 hover:bg-[#1a1a1a] transition">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#1a1a1a] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">{t("merch.total")}</span>
                <span className="font-semibold">{displayPrice(cartTotal, cartCurrency)}</span>
              </div>
              <button
                onClick={() => setCheckoutStep("shipping")}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-[#ddd] transition text-sm"
              >
                {t("merch.checkout")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
