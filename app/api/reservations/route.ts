import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  createReservation,
  listAllReservations,
  listUserReservations,
} from "@/lib/server/reservation-service";
import { parseJsonBody, toDate, instrument } from "@/lib/server/http";
import { withTiming } from "@/lib/server/monitoring";

type CreateReservationDto = {
  facilityId: number;
  startTime: string;
  endTime: string;
};

export async function GET(request: Request) {
  return instrument(request, "/api/reservations", async () => {
    const auth = requireAuth(request);

    if (auth.role === "ADMIN") {
      const reservations = await listAllReservations();
      return NextResponse.json(reservations, { status: 200 });
    }

    const reservations = await listUserReservations(auth.id);
    return NextResponse.json(reservations, { status: 200 });
  });
}

export async function POST(request: Request) {
  return instrument(request, "/api/reservations", async () => {
    const auth = requireAuth(request);
    const body = await parseJsonBody<CreateReservationDto>(request);

    const reservation = await withTiming(
      "reservations.create",
      () =>
        createReservation({
          userId: auth.id,
          facilityId: body.facilityId,
          startTime: toDate(body.startTime, "startTime"),
          endTime: toDate(body.endTime, "endTime"),
        }),
      { userId: auth.id, facilityId: body.facilityId },
    );

    return NextResponse.json(reservation, { status: 201 });
  }, { user: true });
}
