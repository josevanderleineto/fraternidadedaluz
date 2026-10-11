"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MediaUploader({ disabled }: { disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");
  const router = useRouter();

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        if (alt) formData.append("alt", alt);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error || "Falha no upload.");
        }
      }
      toast.success("Imagem(ns) enviada(s) com sucesso.");
      setAlt("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha no upload.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-medium text-brand-950">Enviar imagens</p>
      <p className="mt-1 text-sm text-slate-500">
        Formatos aceitos: JPG, PNG, WEBP, GIF e AVIF (até 5 MB cada).
      </p>

      {disabled && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          O armazenamento de imagens não está configurado. Defina as variáveis
          <code className="mx-1">CLOUDINARY_*</code> no ambiente para habilitar
          o upload.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-slate-500" htmlFor="media-alt">
            Texto alternativo (opcional)
          </label>
          <Input
            id="media-alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Descreva a imagem para acessibilidade"
          />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
          }}
        />
        <Button
          type="button"
          disabled={uploading || disabled}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Enviando…" : "Selecionar imagens"}
        </Button>
      </div>
    </div>
  );
}

export function CopyUrlButton({ url }: { url: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Copiar URL"
      title="Copiar URL"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("URL copiada.");
        } catch {
          toast.error("Não foi possível copiar a URL.");
        }
      }}
    >
      <Copy className="size-4" />
    </Button>
  );
}
