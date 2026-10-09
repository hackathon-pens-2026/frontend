import { apiFetch } from "./client";
import type {
  AvailabilityDto,
  ConfirmReservationResultDto,
  ReservationDto,
  RoomDto,
} from "./types";

export interface RoomBookingRequest {
  facilityResourceId: string;
  startsAt: string;
  endsAt: string;
  activityType: string;
}

export function listRooms(): Promise<RoomDto[]> {
  return apiFetch<RoomDto[]>("/rooms");
}

export function getRoomSchedule(
  roomId: string,
  from?: string,
  to?: string,
): Promise<AvailabilityDto> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return apiFetch<AvailabilityDto>(`/rooms/${roomId}/schedule${query}`);
}

export function checkAvailability(
  roomId: string,
  startsAt: string,
  endsAt: string,
): Promise<AvailabilityDto> {
  return apiFetch<AvailabilityDto>("/rooms/check-availability", {
    method: "POST",
    json: { roomId, startsAt, endsAt },
  });
}

export function createBooking(
  request: RoomBookingRequest,
): Promise<ReservationDto> {
  return apiFetch<ReservationDto>("/rooms/bookings", {
    method: "POST",
    json: request,
  });
}

export function confirmBooking(
  bookingId: string,
): Promise<ConfirmReservationResultDto> {
  return apiFetch<ConfirmReservationResultDto>(
    `/rooms/bookings/${bookingId}/confirm`,
    { method: "POST" },
  );
}

export function cancelBooking(bookingId: string): Promise<ReservationDto> {
  return apiFetch<ReservationDto>(`/rooms/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}
