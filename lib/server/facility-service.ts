import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

export type FacilityInput = {
  name: string;
  description?: string | null;
  openTime: string;
  closeTime: string;
};

export const listFacilities = async () =>
  prisma.facility.findMany({
    orderBy: { name: "asc" },
  });

export const getFacilityById = async (id: number) => {
  const facility = await prisma.facility.findUnique({ where: { id } });
  if (!facility) {
    throw new DomainError("Facility not found", 404);
  }
  return facility;
};

export const createFacility = async (input: FacilityInput) => {
  if (!input.name.trim()) {
    throw new DomainError("Facility name is required", 400);
  }

  return prisma.facility.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      openTime: input.openTime,
      closeTime: input.closeTime,
    },
  });
};

export const updateFacility = async (id: number, input: Partial<FacilityInput>) => {
  await getFacilityById(id);

  return prisma.facility.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      description: input.description?.trim(),
      openTime: input.openTime,
      closeTime: input.closeTime,
    },
  });
};

export const deleteFacility = async (id: number) => {
  await getFacilityById(id);

  await prisma.facility.delete({ where: { id } });
};

export const getFacilityDailyAvailability = async (facilityId: number, date: Date) => {
  const facility = await getFacilityById(facilityId);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const reservations = await prisma.reservation.findMany({
    where: {
      facilityId,
      status: "ACTIVE",
      OR: [
        { startTime: { gte: dayStart, lte: dayEnd } },
        { endTime: { gte: dayStart, lte: dayEnd } },
      ],
    },
    orderBy: { startTime: "asc" },
  });

  return {
    facility,
    date: dayStart,
    reservations,
  };
};
