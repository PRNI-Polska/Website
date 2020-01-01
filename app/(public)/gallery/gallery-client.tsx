// file: app/(public)/gallery/gallery-client.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, MapPin, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Item {
  id: string;
  width: number | null;
  height: number | null;
  caption: string;
  captionEn: string | null;
  captionDe: string | null;
  location: string | null;
  eventDate: string | null;
}

interface Props {
  items: Item[];
}

export default function GalleryClient({ items }: Props) {
  const { t, locale } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const localized = useMemo(
    () =>
      items.map((i) => ({
        ...i,
        localizedCaption:
          locale === "en"
            ? i.captionEn || i.caption
            : locale === "de"
            ? i.captionDe || i.caption
            : i.caption,
      })),
    [items, locale]
  );

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(
    () => setOpenIdx((i) => (i == null ? null : (i + 1) % localized.length)),
    [localized.length]
  );
  const prev = useCallback(
    () => setOpenIdx((i) => (i == null ? null : (i - 1 + localized.length) % localized.length)),
    [localized.length]
  );

  useEffect(() => {
    if (openIdx == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIdx, close, next, prev]);

  const active = openIdx != null ? localized[openIdx] : null;

  return (
    <div className="container-custom py-12">
      <header className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {t("gallery.title")}
        </h1>
        <p className="text-xl text-muted-foreground">{t("gallery.subtitle")}</p>
      </header>

      {localized.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">{t("gallery.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {localized.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIdx(idx)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={item.localizedCaption || t("gallery.viewImage")}
            >
              <Image
                src={`/api/gallery/${item.id}/image`}
                alt={item.localizedCaption || "PRNI"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized
              />
              {(item.localizedCaption || item.location) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.localizedCaption && (
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {item.localizedCaption}
                    </p>
                  )}
                  {item.location && (
                    <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm text-white/70">
              {(openIdx ?? 0) + 1} / {localized.length}
            </span>
            <button
              type="button"
              onClick={close}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={t("gallery.close")}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center relative px-2 md:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 md:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t("gallery.prev")}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
              <div className="relative w-full max-h-[80vh]" style={{ aspectRatio: active.width && active.height ? `${active.width}/${active.height}` : "3/2" }}>
                <Image
                  src={`/api/gallery/${active.id}/image`}
                  alt={active.localizedCaption || "PRNI"}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                  priority
                />
              </div>
            </div>

            <button
              type="button"
              onClick={next}
              className="absolute right-2 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t("gallery.next")}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {(active.localizedCaption || active.location || active.eventDate) && (
            <div
              className="p-4 md:p-6 text-white bg-black/50 border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {active.localizedCaption && (
                <p className="text-base md:text-lg font-medium">{active.localizedCaption}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/70">
                {active.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {active.location}
                  </span>
                )}
                {active.eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(active.eventDate).toLocaleDateString(
                      locale === "en" ? "en-US" : locale === "de" ? "de-DE" : "pl-PL",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
