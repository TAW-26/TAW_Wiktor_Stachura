"use client";

import { useState, useEffect, useCallback } from "react";
import {
  reservationsApi,
  type Reservation,
  type CreateReservationDto,
  type ApiError,
} from "@/app/lib/api-client";

type State = {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
};

export function useReservations() {
  const [state, setState] = useState<State>({
    reservations: [],
    loading: true,
    error: null,
  });

  const fetchReservations = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await reservationsApi.list();
      setState({ reservations: data, loading: false, error: null });
    } catch (err) {
      const msg = (err as ApiError).message ?? "Nie udało się pobrać rezerwacji.";
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const createReservation = async (dto: CreateReservationDto): Promise<Reservation> => {
    const reservation = await reservationsApi.create(dto);
    // Optimistic: add to local state
    setState((s) => ({
      ...s,
      reservations: [reservation, ...s.reservations],
    }));
    return reservation;
  };

  const cancelReservation = async (id: number): Promise<void> => {
    const updated = await reservationsApi.cancel(id);
    setState((s) => ({
      ...s,
      reservations: s.reservations.map((r) =>
        r.id === id ? { ...r, status: updated.status } : r
      ),
    }));
  };

  const hardDeleteReservation = async (id: number): Promise<void> => {
    await reservationsApi.hardDelete(id);
    setState((s) => ({
      ...s,
      reservations: s.reservations.filter((r) => r.id !== id),
    }));
  };

  return {
    ...state,
    refetch: fetchReservations,
    createReservation,
    cancelReservation,
    hardDeleteReservation,
  };
}
