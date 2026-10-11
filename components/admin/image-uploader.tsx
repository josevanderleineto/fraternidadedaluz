"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Campo de imagem com upload para armazenamento externo.
 * Mantém inputs ocultos (url/alt) para funcionar com formulários comuns.
 */
export function ImageUploader({
  url,
  onUrlChange,
  urlName,
  alt,
  onAltChange,
  altName,
  label = "Imagem de capa",
  accept = "image/*",
  previewStyle = "cover",
}: {
  url: string;
  onUrlChange: (value: string) => void;
  urlName: string;
  alt?: string;
  onAltChange?: (value: string) => void;
  altName?: string;
  label?: string;
  accept?: string;
  /** Use a dark, contained preview for marks that may be light or transparent. */
  previewStyle?: "cover" | "contain-dark";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (alt) formData.append("alt", alt);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Falha no upload da imagem.");
      }

      onUrlChange(data.url);
      toast.success("Imagem enviada com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha no upload da imagem.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {url ? (
        <div
          className={
            previewStyle === "contain-dark"
              ? "relative flex aspect-video w-full max-w-sm items-center justify-center overflow-hidden rounded-md border border-brand-800 bg-brand-950 p-4"
              : "relative aspect-video w-full max-w-sm overflow-hidden rounded-md border border-slate-200 bg-slate-50"
          }
        >
          <Image
            src={url}
            alt={alt || "Pré-visualização"}
            fill
            sizes="384px"
            className={
              previewStyle === "contain-dark" ? "object-contain" : "object-cover"
            }
            unoptimized={!url.startsWith("http")}
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full max-w-sm items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          Nenhuma imagem selecionada
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Enviando…" : "Enviar imagem"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => onUrlChange("")}
          >
            <Trash2 className="size-4" />
            Remover
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={urlName} className="text-xs text-slate-500">
          ou informe a URL da imagem
        </Label>
        <Input
          id={urlName}
          type="url"
          value={url}
          placeholder="https://…"
          onChange={(e) => onUrlChange(e.target.value)}
        />
        <input type="hidden" name={urlName} value={url} />
      </div>

      {onAltChange && (
        <div className="space-y-1">
          <Label htmlFor={altName} className="text-xs text-slate-500">
            Texto alternativo (acessibilidade)
          </Label>
          <Input
            id={altName}
            value={alt ?? ""}
            placeholder="Descreva a imagem"
            onChange={(e) => onAltChange(e.target.value)}
          />
          {altName && <input type="hidden" name={altName} value={alt ?? ""} />}
        </div>
      )}
    </div>
  );
}
