/**
 * SportBook API Client
 * Centralny wrapper do komunikacji z backendem.
 * Automatycznie dodaje token JWT z localStorage.
 */

const BASE_URL = "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sb_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new ApiError(401, "Brak autoryzacji. Zaloguj się.");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      (body as { error?: string })?.error ??
      httpStatusMessage(res.status);
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

function httpStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Nieprawidłowe dane wejściowe.",
    401: "Brak autoryzacji. Zaloguj się.",
    403: "Brak uprawnień do tej operacji.",
    404: "Zasób nie istnieje.",
    409: "Konflikt danych (np. termin zajęty).",
    500: "Błąd serwera. Spróbuj ponownie.",
  };
  return messages[status] ?? `Błąd HTTP ${status}.`;
}

/* ─── Auth ────────────────────────────────────────────────────── */

export type AuthResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
  };
};

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<{ id: number; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

/* ─── Facilities ──────────────────────────────────────────────── */

export type Facility = {
  id: number;
  name: string;
  description: string | null;
  openTime: string;
  closeTime: string;
  createdAt: string;
};

export type CreateFacilityDto = {
  name: string;
  description?: string;
  openTime: string;
  closeTime: string;
};

export type AvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
};

export const facilitiesApi = {
  list: () => request<Facility[]>("/facilities"),

  get: (id: number) => request<Facility>(`/facilities/${id}`),

  create: (dto: CreateFacilityDto) =>
    request<Facility>("/facilities", {
      method: "POST",
      body: JSON.stringify(dto),
    }, true),

  update: (id: number, dto: Partial<CreateFacilityDto>) =>
    request<Facility>(`/facilities/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }, true),

  delete: (id: number) =>
    request<void>(`/facilities/${id}`, { method: "DELETE" }, true),

  availability: (id: number, date: string) =>
    request<AvailabilitySlot[]>(`/facilities/${id}/availability?date=${date}`),
};

/* ─── Reservations ────────────────────────────────────────────── */

export type ReservationStatus =
  | "ACTIVE"
  | "CANCELLED_BY_USER"
  | "CANCELLED_BY_ADMIN";

export type Reservation = {
  id: number;
  facilityId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  createdAt: string;
  facility?: { name: string };
  user?: { email: string };
};

export type CreateReservationDto = {
  facilityId: number;
  startTime: string;
  endTime: string;
};

export const reservationsApi = {
  list: () => request<Reservation[]>("/reservations", {}, true),

  get: (id: number) => request<Reservation>(`/reservations/${id}`, {}, true),

  create: (dto: CreateReservationDto) =>
    request<Reservation>("/reservations", {
      method: "POST",
      body: JSON.stringify(dto),
    }, true),

  cancel: (id: number) =>
    request<Reservation>(`/reservations/${id}`, { method: "DELETE" }, true),

  hardDelete: (id: number) =>
    request<void>(`/reservations/${id}?mode=hard`, { method: "DELETE" }, true),
};

/* ─── Users ───────────────────────────────────────────────────── */

export type User = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export const usersApi = {
  list: () => request<User[]>("/users", {}, true),
  get: (id: number) => request<User>(`/users/${id}`, {}, true),
  delete: (id: number) => request<void>(`/users/${id}`, { method: "DELETE" }, true),
};
