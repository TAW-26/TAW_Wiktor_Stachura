import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

export type UserInput = {
  email: string;
  passwordHash: string;
  role?: UserRole;
};

export const listUsers = async () =>
  prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, createdAt: true },
  });

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    throw new DomainError("User not found", 404);
  }

  return user;
};

export const createUser = async (input: UserInput) => {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new DomainError("Email is required", 400);
  }

  if (!input.passwordHash?.trim()) {
    throw new DomainError("Password hash is required", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new DomainError("User with this email already exists", 409);
  }

  return prisma.user.create({
    data: {
      email,
      passwordHash: input.passwordHash,
      role: input.role ?? "USER",
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });
};

export const updateUser = async (
  id: number,
  input: Partial<{ email: string; passwordHash: string; role: UserRole }>,
) => {
  await getUserById(id);

  const email = input.email?.trim().toLowerCase();

  if (email) {
    const exists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (exists) {
      throw new DomainError("Another user already uses this email", 409);
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      email,
      passwordHash: input.passwordHash,
      role: input.role,
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });
};

export const deleteUser = async (id: number) => {
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
};
