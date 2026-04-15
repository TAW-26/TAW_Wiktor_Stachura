import { NextResponse } from "next/server";
import {
  createReservation,
  listAllReservations,
  listUserReservations,
} from "@/lib/server/reservation-service";
import { handleRouteError, parseJsonBody, toIntId } from "@/lib/server/http";

type CreateReservationDto = {
  userId: number;
  facilityId: number;
  startTime: string;
  endTime: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const reservations = await listUserReservations(toIntId(userId));
      return NextResponse.json(reservations, { status: 200 });
    }

    const reservations = await listAllReservations();
    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<CreateReservationDto>(request);

    const reservation = await createReservation({
      userId: body.userId,
      facilityId: body.facilityId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
