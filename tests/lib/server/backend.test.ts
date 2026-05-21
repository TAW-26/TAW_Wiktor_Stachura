import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  facility: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  reservation: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const bcryptMock = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  default: bcryptMock,
}));

import {
  createJwtForUser,
  loginUser,
  registerUser,
  requireAdmin,
  requireAuth,
} from "@/lib/server/auth";
import { DomainError } from "@/lib/server/errors";
import {
  cancelReservation,
  createReservation,
  getReservationById,
  updateReservationTime,
} from "@/lib/server/reservation-service";
import {
  createFacility,
  getFacilityDailyAvailability,
  getFacilityById,
} from "@/lib/server/facility-service";

const createAuthRequest = (token: string) =>
  ({
    headers: {
      get: (name: string) => (name.toLowerCase() === "authorization" ? `Bearer ${token}` : null),
    },
  }) as Request;

describe("backend services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("auth service", () => {
    it("creates and validates JWT payloads", () => {
      const token = createJwtForUser({ id: 42, email: "admin@example.com", role: "ADMIN" });
      const request = createAuthRequest(token);

      expect(requireAuth(request)).toEqual({
        id: 42,
        email: "admin@example.com",
        role: "ADMIN",
      });
    });

    it("rejects non-admin users in requireAdmin", () => {
      const token = createJwtForUser({ id: 7, email: "user@example.com", role: "USER" });
      const request = createAuthRequest(token);

      expect(() => requireAdmin(request)).toThrow(DomainError);
      expect(() => requireAdmin(request)).toThrow("Admin privileges required");
    });

    it("registers a new user with normalized email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue("hashed-password");
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        role: "USER",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
      });

      const result = await registerUser({
        email: "  User@Example.com  ",
        password: "Secret123!",
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
      });
      expect(bcryptMock.hash).toHaveBeenCalledWith("Secret123!", 12);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "user@example.com",
          passwordHash: "hashed-password",
          role: "USER",
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      expect(result).toMatchObject({
        id: 1,
        email: "user@example.com",
        role: "USER",
      });
    });

    it("rejects duplicate email during registration", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        registerUser({ email: "user@example.com", password: "Secret123!" }),
      ).rejects.toMatchObject({
        message: "User with this email already exists",
        statusCode: 409,
      });
    });

    it("logs in valid users and returns a signed token", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 11,
        email: "user@example.com",
        passwordHash: "hashed-password",
        role: "USER",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
      });
      bcryptMock.compare.mockResolvedValue(true);

      const result = await loginUser(" user@example.com ", " Secret123! ");

      expect(bcryptMock.compare).toHaveBeenCalledWith("Secret123!", "hashed-password");
      expect(result.user).toMatchObject({
        id: 11,
        email: "user@example.com",
        role: "USER",
      });
      expect(jwt.verify(result.token, process.env.JWT_SECRET as string)).toMatchObject({
        sub: "11",
        email: "user@example.com",
        role: "USER",
      });
    });
  });

  describe("facility service", () => {
    it("creates facilities with normalized values", async () => {
      prismaMock.facility.create.mockResolvedValue({
        id: 3,
        name: "Boisko Centralne",
        description: null,
        openTime: "08:00",
        closeTime: "22:00",
      });

      const result = await createFacility({
        name: "  Boisko Centralne  ",
        description: "   ",
        openTime: "08:00",
        closeTime: "22:00",
      });

      expect(prismaMock.facility.create).toHaveBeenCalledWith({
        data: {
          name: "Boisko Centralne",
          description: null,
          openTime: "08:00",
          closeTime: "22:00",
        },
      });
      expect(result.name).toBe("Boisko Centralne");
    });

    it("rejects empty facility names", async () => {
      await expect(
        createFacility({
          name: "   ",
          openTime: "08:00",
          closeTime: "22:00",
        }),
      ).rejects.toMatchObject({
        message: "Facility name is required",
        statusCode: 400,
      });
    });

    it("returns facility availability for a given day", async () => {
      const requestedDate = new Date("2026-05-10T15:30:00.000Z");
      const expectedDayStart = new Date(requestedDate);
      expectedDayStart.setHours(0, 0, 0, 0);
      const expectedDayEnd = new Date(requestedDate);
      expectedDayEnd.setHours(23, 59, 59, 999);

      prismaMock.facility.findUnique.mockResolvedValue({
        id: 8,
        name: "Boisko Miejskie",
        openTime: "08:00",
        closeTime: "22:00",
      });
      prismaMock.reservation.findMany.mockResolvedValue([
        { id: 1, status: "ACTIVE", startTime: new Date("2026-05-10T10:00:00.000Z") },
      ]);

      const result = await getFacilityDailyAvailability(8, requestedDate);

      expect(result.date.getFullYear()).toBe(2026);
      expect(result.date.getMonth()).toBe(4);
      expect(result.date.getDate()).toBe(10);
      expect(prismaMock.reservation.findMany).toHaveBeenCalledWith({
        where: {
          facilityId: 8,
          status: "ACTIVE",
          OR: [
            {
              startTime: {
                gte: expectedDayStart,
                lte: expectedDayEnd,
              },
            },
            {
              endTime: {
                gte: expectedDayStart,
                lte: expectedDayEnd,
              },
            },
          ],
        },
        orderBy: { startTime: "asc" },
      });
      expect(result.reservations).toHaveLength(1);
    });

    it("returns a facility by id", async () => {
      prismaMock.facility.findUnique.mockResolvedValue({
        id: 12,
        name: "Korty",
        openTime: "09:00",
        closeTime: "21:00",
      });

      await expect(getFacilityById(12)).resolves.toMatchObject({
        id: 12,
        name: "Korty",
      });
    });
  });

  describe("reservation service", () => {
    it("creates a reservation when the slot is valid and available", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 5 });
      prismaMock.facility.findUnique.mockResolvedValue({
        id: 9,
        openTime: "08:00",
        closeTime: "22:00",
      });
      prismaMock.reservation.findFirst.mockResolvedValue(null);
      prismaMock.reservation.create.mockResolvedValue({
        id: 1,
        status: "ACTIVE",
        userId: 5,
        facilityId: 9,
      });

      const result = await createReservation({
        userId: 5,
        facilityId: 9,
        startTime: new Date("2026-05-10T10:00:00.000Z"),
        endTime: new Date("2026-05-10T11:00:00.000Z"),
      });

      expect(prismaMock.reservation.create).toHaveBeenCalledWith({
        data: {
          userId: 5,
          facilityId: 9,
          startTime: new Date("2026-05-10T10:00:00.000Z"),
          endTime: new Date("2026-05-10T11:00:00.000Z"),
          status: "ACTIVE",
        },
        include: { facility: true },
      });
      expect(result).toMatchObject({
        id: 1,
        status: "ACTIVE",
      });
    });

    it("blocks overlapping reservations", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 5 });
      prismaMock.facility.findUnique.mockResolvedValue({
        id: 9,
        openTime: "08:00",
        closeTime: "22:00",
      });
      prismaMock.reservation.findFirst.mockResolvedValue({ id: 12 });

      await expect(
        createReservation({
          userId: 5,
          facilityId: 9,
          startTime: new Date("2026-05-10T10:00:00.000Z"),
          endTime: new Date("2026-05-10T11:00:00.000Z"),
        }),
      ).rejects.toMatchObject({
        message: "Selected time slot overlaps with an existing reservation",
        statusCode: 409,
      });
    });

    it("allows users to cancel their own reservation only 24h before start", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        id: 44,
        userId: 5,
        status: "ACTIVE",
        startTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      });
      prismaMock.reservation.update.mockResolvedValue({
        id: 44,
        status: "CANCELLED_BY_USER",
      });

      const result = await cancelReservation(44, "USER", 5);

      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: 44 },
        data: { status: "CANCELLED_BY_USER" },
      });
      expect(result.status).toBe("CANCELLED_BY_USER");
    });

    it("denies user cancellation when the reservation is too close", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        id: 45,
        userId: 5,
        status: "ACTIVE",
        startTime: new Date(Date.now() + 23 * 60 * 60 * 1000),
      });

      await expect(cancelReservation(45, "USER", 5)).rejects.toMatchObject({
        message: "Reservation can be cancelled only at least 24h before start",
        statusCode: 400,
      });
    });

    it("lets admins cancel reservations immediately", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        id: 50,
        userId: 5,
        status: "ACTIVE",
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
      prismaMock.reservation.update.mockResolvedValue({
        id: 50,
        status: "CANCELLED_BY_ADMIN",
      });

      const result = await cancelReservation(50, "ADMIN");

      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: 50 },
        data: { status: "CANCELLED_BY_ADMIN" },
      });
      expect(result.status).toBe("CANCELLED_BY_ADMIN");
    });

    it("updates reservation time when the new slot is valid", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        id: 60,
        facilityId: 9,
        status: "ACTIVE",
        facility: {
          openTime: "08:00",
          closeTime: "22:00",
        },
      });
      prismaMock.reservation.findFirst.mockResolvedValue(null);
      prismaMock.reservation.update.mockResolvedValue({
        id: 60,
        status: "ACTIVE",
      });

      const result = await updateReservationTime(
        60,
        new Date("2026-05-10T12:00:00.000Z"),
        new Date("2026-05-10T13:00:00.000Z"),
      );

      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: 60 },
        data: {
          startTime: new Date("2026-05-10T12:00:00.000Z"),
          endTime: new Date("2026-05-10T13:00:00.000Z"),
        },
        include: { facility: true },
      });
      expect(result.status).toBe("ACTIVE");
    });

    it("returns a reservation with relation data by id", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        id: 70,
        userId: 5,
        facilityId: 9,
        status: "ACTIVE",
        user: { id: 5, email: "user@example.com", role: "USER" },
        facility: { id: 9, name: "Boisko" },
      });

      const result = await getReservationById(70);

      expect(result).toMatchObject({
        id: 70,
        user: { email: "user@example.com" },
        facility: { name: "Boisko" },
      });
    });
  });
});