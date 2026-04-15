import type { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";
import { assertRangeWithinOperatingHours, isAtLeastHoursBefore } from "./time";

export type ReservationInput = {
  userId: number;
  facilityId: number;
  startTime: Date;
  endTime: Date;
};

export const listUserReservations = async (userId: number) =>
  prisma.reservation.findMany({
    where: { userId },
    include: { facility: true },
    orderBy: { startTime: "asc" },
  });

export const listAllReservations = async () =>
  prisma.reservation.findMany({
    include: {
      user: {
        select: { id: true, email: true, role: true },
      },
      facility: true,
    },
    orderBy: { startTime: "asc" },
  });

const assertNoOverlap = async (facilityId: number, startTime: Date, endTime: Date) => {
  const overlap = await prisma.reservation.findFirst({
    where: {
      facilityId,
      status: "ACTIVE",
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (overlap) {
    throw new DomainError("Selected time slot overlaps with an existing reservation", 409);
  }
};

export const createReservation = async (input: ReservationInput) => {
  if (input.startTime >= input.endTime) {
    throw new DomainError("Reservation startTime must be earlier than endTime", 400);
  }

  const [user, facility] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.userId } }),
    prisma.facility.findUnique({ where: { id: input.facilityId } }),
  ]);

  if (!user) {
    throw new DomainError("User not found", 404);
  }

  if (!facility) {
    throw new DomainError("Facility not found", 404);
  }

  assertRangeWithinOperatingHours(
    input.startTime,
    input.endTime,
    facility.openTime,
    facility.closeTime,
  );

  await assertNoOverlap(input.facilityId, input.startTime, input.endTime);

  return prisma.reservation.create({
    data: {
      userId: input.userId,
      facilityId: input.facilityId,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "ACTIVE",
    },
    include: { facility: true },
  });
};

export const cancelReservation = async (
  reservationId: number,
  byRole: "USER" | "ADMIN",
  currentUserId?: number,
) => {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });

  if (!reservation) {
    throw new DomainError("Reservation not found", 404);
  }

  if (reservation.status !== "ACTIVE") {
    throw new DomainError("Reservation is already cancelled", 409);
  }

  if (byRole === "USER") {
    if (!currentUserId || reservation.userId !== currentUserId) {
      throw new DomainError("You can cancel only your own reservations", 403);
    }

    if (!isAtLeastHoursBefore(reservation.startTime, new Date(), 24)) {
      throw new DomainError("Reservation can be cancelled only at least 24h before start", 400);
    }
  }

  const nextStatus: ReservationStatus =
    byRole === "ADMIN" ? "CANCELLED_BY_ADMIN" : "CANCELLED_BY_USER";

  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status: nextStatus },
  });
};
