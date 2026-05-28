import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  cancelReservation,
  deleteReservation,
  getReservationById,
  updateReservationTime,
} from "@/lib/server/reservation-service";
import { parseJsonBody, toDate, toIntId, instrument } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(_request, "/api/reservations/:id", async () => {
    const auth = requireAuth(_request);
    const reservation = await getReservationById(toIntId(id));

    if (auth.role !== "ADMIN" && reservation.userId !== auth.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(reservation, { status: 200 });
  }, { params: { id } });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(request, "/api/reservations/:id", async () => {
    const auth = requireAuth(request);
    const reservationId = toIntId(id);
    const existingReservation = await getReservationById(reservationId);

    if (auth.role !== "ADMIN" && existingReservation.userId !== auth.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await parseJsonBody<{ startTime: string; endTime: string }>(request);

    const reservation = await updateReservationTime(
      reservationId,
      toDate(body.startTime, "startTime"),
      toDate(body.endTime, "endTime"),
    );

    return NextResponse.json(reservation, { status: 200 });
  }, { params: { id } });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return instrument(request, "/api/reservations/:id", async () => {
    const auth = requireAuth(request);
    const reservationId = toIntId(id);
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "hard") {
      if (auth.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await deleteReservation(reservationId);
      return new NextResponse(null, { status: 204 });
    }

    const reservation = await cancelReservation(reservationId, auth.role, auth.id);
    return NextResponse.json(reservation, { status: 200 });
  }, { params: { id } });
}
