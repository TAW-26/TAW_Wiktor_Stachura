import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  cancelReservation,
  deleteReservation,
  getReservationById,
  updateReservationTime,
} from "@/lib/server/reservation-service";
import { handleRouteError, parseJsonBody, toDate, toIntId } from "@/lib/server/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = requireAuth(_request);
    const { id } = await context.params;
    const reservation = await getReservationById(toIntId(id));

    if (auth.role !== "ADMIN" && reservation.userId !== auth.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/reservations/:id", method: "GET", params: { id: _id } });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = requireAuth(request);
    const { id } = await context.params;
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
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/reservations/:id", method: "PUT", params: { id: _id } });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const auth = requireAuth(request);
    const { id } = await context.params;
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
  } catch (error) {
    const { id: _id } = await context.params;
    return handleRouteError(error, { route: "/api/reservations/:id", method: "DELETE", params: { id: _id } });
  }
}
