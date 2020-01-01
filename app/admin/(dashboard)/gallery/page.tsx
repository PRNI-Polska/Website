// file: app/admin/(dashboard)/gallery/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Save, Trash2, Upload, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { adminFetch } from "@/lib/admin-fetch";

interface GalleryItem {
  id: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  caption: string;
  captionEn: string | null;
  captionDe: string | null;
  location: string | null;
  eventDate: string | null;
  order: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
const MAX_FINAL_BYTES = 4 * 1024 * 1024;

async function fileToCompressedDataUrl(
  file: File
): Promise<{ dataUrl: string; width: number; height: number; bytes: number }> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  const dims = bitmap
    ? { w: bitmap.width, h: bitmap.height }
    : await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Cannot read image"));
        };
        img.src = url;
      });

  let targetW = dims.w;
  let targetH = dims.h;
  const longer = Math.max(targetW, targetH);
  if (longer > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / longer;
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  if (bitmap) {
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();
  } else {
    await new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetW, targetH);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Draw failed"));
      };
      img.src = url;
    });
  }

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  let approxBytes = Math.floor((dataUrl.length - "data:image/jpeg;base64,".length) * 0.75);
  while (approxBytes > MAX_FINAL_BYTES && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    approxBytes = Math.floor((dataUrl.length - "data:image/jpeg;base64,".length) * 0.75);
  }

  return { dataUrl, width: targetW, height: targetH, bytes: approxBytes };
}

function formatBytes(n: number | null | undefined): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: list.length });
    let successes = 0;
    let failures = 0;

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        const { dataUrl, width, height } = await fileToCompressedDataUrl(file);
        const res = await adminFetch("/api/admin/gallery", {
          method: "POST",
          body: JSON.stringify({ dataUrl, width, height, caption: "" }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => "upload failed"));
        successes++;
      } catch (err) {
        console.error("Upload failed:", err);
        failures++;
      }
      setProgress({ done: i + 1, total: list.length });
    }

    setUploading(false);
    setProgress(null);
    toast({
      title: failures === 0 ? "Uploaded" : "Partial upload",
      description: `${successes} added${failures ? `, ${failures} failed` : ""}.`,
      variant: failures === 0 ? "default" : "destructive",
    });
    if (fileRef.current) fileRef.current.value = "";
    refresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  async function updateItem(id: string, patch: Partial<GalleryItem>) {
    const res = await adminFetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast({ title: "Save failed", variant: "destructive" });
      return false;
    }
    return true;
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    const res = await adminFetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Deleted" });
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  async function toggleVisibility(item: GalleryItem) {
    const next = !item.isPublic;
    const ok = await updateItem(item.id, { isPublic: next });
    if (ok) setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isPublic: next } : x)));
  }

  async function move(item: GalleryItem, dir: "up" | "down") {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((x) => x.id === item.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const okA = await updateItem(a.id, { order: b.order });
    const okB = await updateItem(b.id, { order: a.order });
    if (okA && okB) refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground text-sm">
            Zdjęcia z akcji, wydarzeń i marszów. Dodaj podpis w PL / EN / DE (opcjonalnie).
            Zdjęcia są automatycznie kompresowane przed uploadem (max 1920 px, ~4 MB).
          </p>
        </div>
      </div>

      {/* Upload dropzone */}
      <Card
        className={
          "border-dashed transition-colors " +
          (dragOver ? "border-primary bg-primary/5" : "border-muted")
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-3">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">
            Przeciągnij i upuść zdjęcia tutaj, albo kliknij żeby wybrać.
          </p>
          <p className="text-xs text-muted-foreground">
            Obsługiwane: JPEG, PNG, WebP. Można wgrać wiele naraz.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-2"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wgrywanie{progress ? ` ${progress.done}/${progress.total}` : "…"}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Wybierz zdjęcia
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Gallery items */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            Brak zdjęć. Dodaj pierwsze powyżej.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <GalleryItemCard
                key={item.id}
                item={item}
                onSave={async (patch) => {
                  const ok = await updateItem(item.id, patch);
                  if (ok) {
                    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...patch } : x)));
                    toast({ title: "Zapisano" });
                  }
                }}
                onDelete={() => deleteItem(item.id)}
                onToggleVisibility={() => toggleVisibility(item)}
                onMoveUp={() => move(item, "up")}
                onMoveDown={() => move(item, "down")}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function GalleryItemCard({
  item,
  onSave,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
}: {
  item: GalleryItem;
  onSave: (patch: Partial<GalleryItem>) => void | Promise<void>;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [caption, setCaption] = useState(item.caption);
  const [captionEn, setCaptionEn] = useState(item.captionEn ?? "");
  const [captionDe, setCaptionDe] = useState(item.captionDe ?? "");
  const [location, setLocation] = useState(item.location ?? "");
  const [eventDate, setEventDate] = useState(item.eventDate ? item.eventDate.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  const dirty =
    caption !== item.caption ||
    captionEn !== (item.captionEn ?? "") ||
    captionDe !== (item.captionDe ?? "") ||
    location !== (item.location ?? "") ||
    eventDate !== (item.eventDate ? item.eventDate.slice(0, 10) : "");

  async function save() {
    setSaving(true);
    await onSave({
      caption,
      captionEn: captionEn || null,
      captionDe: captionDe || null,
      location: location || null,
      eventDate: eventDate || null,
    });
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader className="p-0">
        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden rounded-t-lg">
          <Image
            src={`/api/gallery/${item.id}/image`}
            alt={item.caption || "Gallery photo"}
            fill
            className="object-cover"
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {!item.isPublic && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Ukryte
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-between text-xs text-muted-foreground">
          <span>
            {item.width}×{item.height} · {formatBytes(item.sizeBytes)}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onMoveUp} title="Move up">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onMoveDown} title="Move down">
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleVisibility} title="Toggle visibility">
              {item.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <Label className="text-xs">Podpis (PL)</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="np. Marsz Niepodległości, 11.11.2024"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Podpis (EN)</Label>
              <Input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <Label className="text-xs">Podpis (DE)</Label>
              <Input value={captionDe} onChange={(e) => setCaptionDe(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Lokalizacja</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="np. Warszawa" />
            </div>
            <div>
              <Label className="text-xs">Data wydarzenia</Label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={save}
          disabled={!dirty || saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zapisywanie…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Zapisz
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
