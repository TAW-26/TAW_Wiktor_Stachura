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

export type AvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
};

export const getFacilityDailyAvailability = async (
  facilityId: number,
  date: Date,
): Promise<AvailabilitySlot[]> => {
  const facility = await getFacilityById(facilityId);

  // Build the day boundary in UTC, matching how the client sends dates
  const [openH, openM] = facility.openTime.split(":").map(Number);
  const [closeH, closeM] = facility.closeTime.split(":").map(Number);

  // Use the date as a UTC day so slot timestamps stay consistent with client ISO strings
  const dateStr = date.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd   = new Date(`${dateStr}T23:59:59.999Z`);

  const reservations = await prisma.reservation.findMany({
    where: {
      facilityId,
      status: "ACTIVE",
      OR: [
        { startTime: { gte: dayStart, lte: dayEnd } },
        { endTime:   { gte: dayStart, lte: dayEnd } },
      ],
    },
  });

  const slots: AvailabilitySlot[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");

  // Generate one slot per hour between open and close in LOCAL (wall-clock) hour numbers.
  // The client sends bookings as local-time → toISOString(), so we mirror that here:
  // slot start = the calendar date at that local hour, expressed as a UTC ISO string.
  for (let h = openH; h < closeH; h++) {
    const startMin = openM ?? 0;
    const endMin   = h + 1 === closeH ? (closeM ?? 0) : 0;

    // We encode the wall-clock time directly as a date-local ISO (no Z offset) so
    // it matches what the client builds with new Date(y, mo-1, d, h, 0).toISOString()
    // when the client's timezone also sees this as a local hour.
    // Simplest cross-timezone approach: store as date-only + HH:MM so both sides agree.
    const slotStart = `${dateStr}T${pad(h)}:${pad(startMin)}:00`;
    const slotEnd   = `${dateStr}T${pad(h + 1)}:${pad(endMin)}:00`;

    const slotStartDate = new Date(slotStart);
    const slotEndDate   = new Date(slotEnd);

    const taken = reservations.some(
      (r) => r.startTime < slotEndDate && r.endTime > slotStartDate,
    );

    slots.push({ start: slotStart, end: slotEnd, available: !taken });
  }

  return slots;
};

