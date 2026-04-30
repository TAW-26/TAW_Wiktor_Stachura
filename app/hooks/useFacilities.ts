"use client";

import { useState, useEffect, useCallback } from "react";
import { facilitiesApi, type Facility, type ApiError } from "@/app/lib/api-client";

type State = {
  facilities: Facility[];
  loading: boolean;
  error: string | null;
};

export function useFacilities() {
  const [state, setState] = useState<State>({
    facilities: [],
    loading: true,
    error: null,
  });

  const fetchFacilities = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await facilitiesApi.list();
      setState({ facilities: data, loading: false, error: null });
    } catch (err) {
      const msg = (err as ApiError).message ?? "Nie udało się pobrać obiektów.";
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return { ...state, refetch: fetchFacilities };
}
