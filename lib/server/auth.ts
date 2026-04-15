import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new DomainError("JWT_SECRET is not configured", 500);
  }
  return secret;
};

const getTokenFromRequest = (request: Request): string => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new DomainError("Missing Authorization header", 401);
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new DomainError("Invalid Authorization header format", 401);
  }

  return token;
};

export const createJwtForUser = (user: AuthUser): string =>
  jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    } satisfies JwtPayload,
    getJwtSecret(),
    { expiresIn: "7d" },
  );

export const requireAuth = (request: Request): AuthUser => {
  const token = getTokenFromRequest(request);

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    throw new DomainError("Invalid or expired token", 401);
  }

  const id = Number.parseInt(decoded.sub, 10);
  if (!id || Number.isNaN(id)) {
    throw new DomainError("Invalid token payload", 401);
  }

  return {
    id,
    email: decoded.email,
    role: decoded.role,
  };
};

export const requireAdmin = (request: Request): AuthUser => {
  const user = requireAuth(request);

  if (user.role !== "ADMIN") {
    throw new DomainError("Admin privileges required", 403);
  }

  return user;
};

export const registerUser = async (input: {
  email: string;
  password: string;
  role?: UserRole;
}) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (!email) {
    throw new DomainError("Email is required", 400);
  }

  if (password.length < 8) {
    throw new DomainError("Password must have at least 8 characters", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new DomainError("User with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: input.role ?? "USER",
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (emailRaw: string, passwordRaw: string) => {
  const email = emailRaw.trim().toLowerCase();
  const password = passwordRaw.trim();

  if (!email || !password) {
    throw new DomainError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new DomainError("Invalid credentials", 401);
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    throw new DomainError("Invalid credentials", 401);
  }

  const token = createJwtForUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};
