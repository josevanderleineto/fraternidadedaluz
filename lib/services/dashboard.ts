import "server-only";

import { prisma } from "@/lib/db";
import { PostStatus } from "@/lib/generated/prisma/enums";

export type DashboardStats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalCategories: number;
  totalPages: number;
  unreadMessages: number;
  totalMessages: number;
  totalMedia: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalCategories,
    totalPages,
    unreadMessages,
    totalMessages,
    totalMedia,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: PostStatus.DRAFT } }),
    prisma.post.count({ where: { status: PostStatus.SCHEDULED } }),
    prisma.category.count(),
    prisma.page.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.count(),
    prisma.media.count(),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalCategories,
    totalPages,
    unreadMessages,
    totalMessages,
    totalMedia,
  };
}

export type RecentActivity = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
  userName: string | null;
};

export async function getRecentActivity(limit = 8): Promise<RecentActivity[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true } } },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      createdAt: log.createdAt,
      userName: log.user?.name ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getRecentPosts(limit = 5) {
  try {
    return await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getRecentMessages(limit = 5) {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        subject: true,
        isRead: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}
