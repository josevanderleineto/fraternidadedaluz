import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cachePassthrough: (fn: unknown) => fn,
  getSession: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT:${url}`) as Error & {
      url?: string;
    };
    error.url = url;
    throw error;
  }),
}));

vi.mock("react", () => ({ cache: mocks.cachePassthrough }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/session", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: mocks.findUnique } },
}));

import {
  getCurrentUser,
  requireRole,
  requireUser,
} from "@/lib/auth/dal";

const activeUser = {
  id: "user-1",
  name: "Administrador",
  email: "admin@example.com",
  role: "ADMIN" as const,
  active: true,
};

beforeEach(() => {
  mocks.getSession.mockReset();
  mocks.findUnique.mockReset();
  mocks.redirect.mockClear();
});

describe("getCurrentUser", () => {
  it("retorna null quando não há usuário na sessão", async () => {
    mocks.getSession.mockResolvedValue({});
    expect(await getCurrentUser()).toBeNull();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("retorna o usuário autenticado e ativo", async () => {
    mocks.getSession.mockResolvedValue({ userId: "user-1" });
    mocks.findUnique.mockResolvedValue(activeUser);

    const user = await getCurrentUser();
    expect(user).toEqual({
      id: "user-1",
      name: "Administrador",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("retorna null para usuário inexistente", async () => {
    mocks.getSession.mockResolvedValue({ userId: "sumiu" });
    mocks.findUnique.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
  });

  it("retorna null para usuário desativado", async () => {
    mocks.getSession.mockResolvedValue({ userId: "user-1" });
    mocks.findUnique.mockResolvedValue({ ...activeUser, active: false });
    expect(await getCurrentUser()).toBeNull();
  });

  it("trata falha de conexão como não autenticado (sem vazar detalhes)", async () => {
    mocks.getSession.mockResolvedValue({ userId: "user-1" });
    mocks.findUnique.mockRejectedValue(new Error("connection refused"));
    expect(await getCurrentUser()).toBeNull();
  });
});

describe("requireUser", () => {
  it("bloqueia acesso anônimo redirecionando para o login", async () => {
    mocks.getSession.mockResolvedValue({});
    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("libera o acesso para usuário autenticado", async () => {
    mocks.getSession.mockResolvedValue({ userId: "user-1" });
    mocks.findUnique.mockResolvedValue(activeUser);
    const user = await requireUser();
    expect(user.id).toBe("user-1");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("requireRole", () => {
  it("bloqueia editor ao exigir ADMIN", async () => {
    mocks.getSession.mockResolvedValue({ userId: "user-2" });
    mocks.findUnique.mockResolvedValue({
      id: "user-2",
      name: "Editor",
      email: "editor@example.com",
      role: "EDITOR",
      active: true,
    });

    await expect(requireRole("ADMIN")).rejects.toThrow(
      "NEXT_REDIRECT:/admin?erro=sem-permissao",
    );
  });

  it("permite administrador", async () => {
    mocks.getSession.mockResolvedValue({ userId: "user-1" });
    mocks.findUnique.mockResolvedValue(activeUser);
    const user = await requireRole("ADMIN");
    expect(user.role).toBe("ADMIN");
  });
});
