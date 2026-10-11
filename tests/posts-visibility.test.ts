import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    post: {
      findMany: mocks.findMany,
      count: mocks.count,
      findFirst: mocks.findFirst,
    },
  },
}));

import { publicPostWhere, listPublishedPosts, getPublishedPostBySlug } from "@/lib/services/posts";
import { PostStatus } from "@/lib/generated/prisma/enums";

type WhereArg = {
  where: {
    AND: Array<{ status?: { in: string[] }; OR?: unknown[] }>;
  };
};

describe("publicPostWhere", () => {
  it("nunca inclui rascunhos (DRAFT)", () => {
    const where = publicPostWhere();
    const statuses = where.AND[0]?.status?.in ?? [];
    expect(statuses).not.toContain(PostStatus.DRAFT);
    expect(statuses).toContain(PostStatus.PUBLISHED);
    expect(statuses).toContain(PostStatus.SCHEDULED);
  });

  it("restringe publicações agendadas a datas já alcançadas", () => {
    const where = publicPostWhere();
    const dateClause = where.AND[1] as {
      OR: Array<{ publishedAt?: { lte?: Date } }>;
    };
    const lte = dateClause.OR[1]?.publishedAt?.lte;
    expect(lte).toBeInstanceOf(Date);
    expect((lte as Date).getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe("listPublishedPosts", () => {
  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.count.mockReset();
  });

  it("consulta apenas conteúdo publicado, nunca rascunhos", async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);

    await listPublishedPosts({ page: 1, perPage: 10 });

    const arg = mocks.findMany.mock.calls[0]?.[0] as WhereArg | undefined;
    expect(arg?.where.AND[0]?.status?.in).toEqual([
      PostStatus.PUBLISHED,
      PostStatus.SCHEDULED,
    ]);
  });

  it("pagina com limite máximo defensivo", async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    await listPublishedPosts({ page: 1, perPage: 9999 });
    const arg = mocks.findMany.mock.calls[0]?.[0] as { take: number };
    expect(arg.take).toBeLessThanOrEqual(50);
  });
});

describe("getPublishedPostBySlug", () => {
  beforeEach(() => {
    mocks.findFirst.mockReset();
  });

  it("aplica o filtro de visibilidade ao buscar por slug", async () => {
    mocks.findFirst.mockResolvedValue(null);
    const result = await getPublishedPostBySlug("meu-post");

    expect(result).toBeNull();
    const arg = mocks.findFirst.mock.calls[0]?.[0] as WhereArg & {
      where: { slug: string };
    };
    expect(arg.where.slug).toBe("meu-post");
    expect(arg.where.AND[0]?.status?.in).not.toContain(PostStatus.DRAFT);
  });
});
