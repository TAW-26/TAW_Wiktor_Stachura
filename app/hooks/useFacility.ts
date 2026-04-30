"use client";

import { useState, useEffect, useCallback } from "react";
import {
  facilitiesApi,
  type Facility,
  type AvailabilitySlot,
  type ApiError,
} from "@/app/lib/api-client";

type State = {
  facility: Facility | null;
  loadingFacility: boolean;
  facilityError: string | null;
  slots: AvailabilitySlot[];
  loadingSlots: boolean;
};

export function useFacility(id: number) {
  const [state, setState] = useState<State>({
    facility: null,
    loadingFacility: true,
    facilityError: null,
    slots: [],
    loadingSlots: false,
  });

  const fetchFacility = useCallback(async () => {
    setState((s) => ({ ...s, loadingFacility: true, facilityError: null }));
    try {
      const data = await facilitiesApi.get(id);
      setState((s) => ({ ...s, facility: data, loadingFacility: false }));
    } catch (err) {
      const msg = (err as ApiError).message ?? "Nie udało się załadować obiektu.";
      setState((s) => ({ ...s, loadingFacility: false, facilityError: msg }));
    }
  }, [id]);

  const fetchAvailability = useCallback(
    async (date: string) => {
      setState((s) => ({ ...s, loadingSlots: true }));
      try {
        const slots = await facilitiesApi.availability(id, date);
        setState((s) => ({ ...s, slots, loadingSlots: false }));
      } catch {
        // Availability endpoint may return empty — not a critical error
        setState((s) => ({ ...s, slots: [], loadingSlots: false }));
      }
    },
    [id]
  );

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  return {
    ...state,
    refetchFacility: fetchFacility,
    fetchAvailability,
  };
}
