"use client";

import { useEffect, useState } from "react";
import { Loader2, Pin, FileText } from "lucide-react";

interface MemberDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/members/documents");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDocuments(data.documents);
      } catch {
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const pinnedDocs = documents.filter((d) => d.pinned);
  const unpinnedDocs = documents.filter((d) => !d.pinned);
  const categories = Array.from(new Set(unpinnedDocs.map((d) => d.category))).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dokumenty</h1>
        <p className="text-[#888] text-sm mt-1">Prywatne dokumenty i materiały</p>
      </div>

      {documents.length === 0 && (
        <div className="text-center py-16 border border-[#1a1a1a] rounded-xl">
          <FileText className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-[#666] text-sm">Brak dokumentów.</p>
        </div>
      )}

      {pinnedDocs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider flex items-center gap-2">
            <Pin className="h-3.5 w-3.5" /> Przypięte
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pinnedDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}

      {categories.map((category) => {
        const categoryDocs = unpinnedDocs.filter((d) => d.category === category);
        if (categoryDocs.length === 0) return null;
        return (
          <div key={category} className="space-y-4">
            <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentCard({ document }: { document: { id: string; title: string; content: string; category: string; pinned: boolean; updatedAt: string } }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#1a1a1a] rounded-xl p-5 hover:border-[#333] transition bg-[#0d0d0d]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-[#e8e8e8] text-sm leading-tight">{document.title}</h3>
        {document.pinned && <Pin className="h-3.5 w-3.5 text-[#666] shrink-0 mt-0.5" />}
      </div>
      <div className={`text-[#999] text-sm leading-relaxed whitespace-pre-wrap ${!expanded && document.content.length > 300 ? "line-clamp-4" : ""}`}>
        {document.content}
      </div>
      {document.content.length > 300 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#666] hover:text-[#aaa] mt-2 transition">
          {expanded ? "Zwiń" : "Czytaj więcej"}
        </button>
      )}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1a1a1a]">
        <span className="text-xs text-[#555] font-medium uppercase tracking-wider">{document.category}</span>
        <span className="text-xs text-[#555]">
          {new Date(document.updatedAt).toLocaleDateString("pl-PL", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
