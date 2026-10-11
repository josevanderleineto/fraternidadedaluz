import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  createSession: vi.fn(),
  destroySession: vi.fn(),
  getCurrentUser: vi.fn(),
  getUserByEmail: vi.fn(),
  touchLastLogin: vi.fn(),
  verifyPassword: vi.fn(),
  recordAudit: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const error = new Error(`NEXT_REDIRECT:${url}`) as Error & {
      url?: string;
    };
    error.url = url;
    throw error;
  },
}));
vi.mock("@/lib/auth/session", () => ({
  createSession: mocks.createSession,
  destroySession: mocks.destroySession,
}));
vi.mock("@/lib/auth/dal", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/services/users", () => ({
  getUserByEmail: mocks.getUserByEmail,
  touchLastLogin: mocks.touchLastLogin,
}));
vi.mock("@/lib/security/security", () => ({
  verifyPassword: mocks.verifyPassword,
}));
vi.mock("@/lib/audit", () => ({ recordAudit: mocks.recordAudit }));

import { loginAction } from "@/lib/actions/auth";

let currentIp = "10.0.0.1";

function formData(email: string, password: string): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

const user = {
  id: "user-1",
  name: "Administrador",
  email: "admin@example.com",
  role: "ADMIN" as const,
  active: true,
  passwordHash: "$2b$12$hashfalso",
};

beforeEach(() => {
  mocks.headers.mockImplementation(async () => {
    return new Headers({ "x-forwarded-for": currentIp });
  });
  mocks.createSession.mockReset();
  mocks.destroySession.mockReset();
  mocks.getCurrentUser.mockReset();
  mocks.getUserByEmail.mockReset();
  mocks.touchLastLogin.mockReset();
  mocks.verifyPassword.mockReset();
  mocks.recordAudit.mockReset();
});

describe("loginAction", () => {
  it("autentica credenciais válidas e cria a sessão", async () => {
    currentIp = "10.10.0.1";
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.verifyPassword.mockResolvedValue(true);

    await expect(
      loginAction(undefined, formData("admin@example.com", "Senha12345")),
    ).rejects.toThrow("NEXT_REDIRECT:/admin");

    expect(mocks.createSession).toHaveBeenCalledWith({
      userId: "user-1",
      email: "admin@example.com",
      name: "Administrador",
      role: "ADMIN",
    });
    expect(mocks.touchLastLogin).toHaveBeenCalledWith("user-1");
    expect(mocks.recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "LOGIN" }),
    );
  });

  it("rejeita senha incorreta sem criar sessão", async () => {
    currentIp = "10.10.0.2";
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.verifyPassword.mockResolvedValue(false);

    const result = await loginAction(
      undefined,
      formData("admin@example.com", "SenhaErrada1"),
    );

    expect(result && result.success).toBe(false);
    expect(result && "message" in result && result.message).toBe(
      "E-mail ou senha inválidos.",
    );
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("não revela se o e-mail existe (mensagem genérica)", async () => {
    currentIp = "10.10.0.3";
    mocks.getUserByEmail.mockResolvedValue(null);

    const result = await loginAction(
      undefined,
      formData("naoexiste@example.com", "Senha12345"),
    );

    expect(result && result.success).toBe(false);
    expect(result && "message" in result && result.message).toBe(
      "E-mail ou senha inválidos.",
    );
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("bloqueia usuário desativado", async () => {
    currentIp = "10.10.0.4";
    mocks.getUserByEmail.mockResolvedValue({ ...user, active: false });

    const result = await loginAction(
      undefined,
      formData("admin@example.com", "Senha12345"),
    );
    expect(result && result.success).toBe(false);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("trata falha de conexão sem vazar detalhes internos", async () => {
    currentIp = "10.10.0.5";
    mocks.getUserByEmail.mockRejectedValue(
      new Error("PrismaClientKnownRequestError: SELECT * FROM users"),
    );

    const result = await loginAction(
      undefined,
      formData("admin@example.com", "Senha12345"),
    );

    const message = result && "message" in result ? result.message : "";
    expect(message).toBe(
      "Não foi possível conectar ao servidor. Tente novamente.",
    );
    expect(message).not.toMatch(/SELECT|Prisma|Error/i);
  });

  it("valida o formato antes de consultar o banco", async () => {
    currentIp = "10.10.0.6";
    const result = await loginAction(undefined, formData("invalido", "123"));
    expect(result && result.success).toBe(false);
    expect(mocks.getUserByEmail).not.toHaveBeenCalled();
  });

  it("limita tentativas repetidas por IP (anti força bruta)", async () => {
    currentIp = "203.0.113.77";
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.verifyPassword.mockResolvedValue(false);

    for (let i = 0; i < 8; i += 1) {
      await loginAction(undefined, formData("admin@example.com", "SenhaErrada1"));
    }

    const result = await loginAction(
      undefined,
      formData("admin@example.com", "SenhaErrada1"),
    );
    const message = result && "message" in result ? result.message : "";
    expect(message).toMatch(/Muitas tentativas/);
    // A nona tentativa sequer chega a consultar credenciais.
    expect(mocks.verifyPassword).toHaveBeenCalledTimes(8);
  });
});
