import { DomainError } from "./errors";

export const parseTimeToMinutes = (time: string): number => {
  const match = /^(?:[01]\d|2[0-3]):[0-5]\d$/.exec(time);

  if (!match) {
    throw new DomainError("Time must match HH:mm format", 400);
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toMinutes = (date: Date): number => date.getHours() * 60 + date.getMinutes();

export const assertRangeWithinOperatingHours = (
  startTime: Date,
  endTime: Date,
  openTime: string,
  closeTime: string,
): void => {
  const openMinutes = parseTimeToMinutes(openTime);
  const closeMinutes = parseTimeToMinutes(closeTime);
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  if (closeMinutes <= openMinutes) {
    throw new DomainError("Facility operating hours are invalid", 500);
  }

  if (startMinutes < openMinutes || endMinutes > closeMinutes) {
    throw new DomainError("Reservation must fit within facility operating hours", 400);
  }
};

export const isAtLeastHoursBefore = (
  date: Date,
  reference: Date,
  hours: number,
): boolean => {
  const diffMs = date.getTime() - reference.getTime();
  const thresholdMs = hours * 60 * 60 * 1000;
  return diffMs >= thresholdMs;
};
