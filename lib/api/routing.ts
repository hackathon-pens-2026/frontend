import { apiFetch } from "./client";
import type {
  RoutingCandidateDto,
  RoutingFacilityDto,
  RoutingInput,
  RoutingOrganizationDto,
  RoutingResourceDto,
  RoutingStageDto,
} from "./types";

export function listOrganizations(): Promise<RoutingOrganizationDto[]> {
  return apiFetch<RoutingOrganizationDto[]>("/routing/organizations");
}

export function listFacilities(): Promise<RoutingFacilityDto[]> {
  return apiFetch<RoutingFacilityDto[]>("/routing/facilities");
}

export function listResources(facilityId: string): Promise<RoutingResourceDto[]> {
  return apiFetch<RoutingResourceDto[]>(
    `/routing/resources?facilityId=${encodeURIComponent(facilityId)}`,
  );
}

export function listOrganizationCandidates(
  organizationId: string,
): Promise<RoutingCandidateDto[]> {
  return apiFetch<RoutingCandidateDto[]>(
    `/routing/organizations/${organizationId}/candidates`,
  );
}

export function resolveRouting(input: RoutingInput): Promise<RoutingStageDto[]> {
  return apiFetch<RoutingStageDto[]>("/letters/routing-preview", {
    method: "POST",
    json: input,
  });
}
