import "server-only";

import { prisma } from "@/lib/db";
import { deleteImage, type UploadedImage } from "@/lib/storage/cloudinary";

export async function listMedia(params: { page?: number; perPage?: number } = {}) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 24));

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.media.count(),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function createMediaRecord(
  image: UploadedImage,
  uploadedById?: string,
  alt?: string,
) {
  return prisma.media.create({
    data: {
      url: image.url,
      secureUrl: image.secureUrl,
      publicId: image.publicId,
      format: image.format,
      resourceType: image.resourceType,
      width: image.width,
      height: image.height,
      bytes: image.bytes,
      originalName: image.originalName,
      alt: alt ?? null,
      uploadedById: uploadedById ?? null,
    },
  });
}

export async function deleteMediaRecord(id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;

  await deleteImage(media.publicId);
  await prisma.media.delete({ where: { id } });
}
