import {
  DAR_ES_SALAAM_LOCATIONS,
  type DistrictInfo,
} from "@/data/dar-es-salaam-locations";

/**
 * Source of the district/ward picker shown in the onboarding flow.
 *
 * Deliberately isolated behind a hook rather than importing
 * DAR_ES_SALAAM_LOCATIONS directly from the onboarding UI: today this is a
 * static dataset, but the plan is to make it admin-editable from a Firestore
 * collection later. When that happens, only this file needs to change (swap
 * the static import for an onSnapshot subscription) — the onboarding
 * component's markup and logic stay untouched.
 */
export function useDistricts(): {
  districts: DistrictInfo[];
  loading: boolean;
} {
  return { districts: DAR_ES_SALAAM_LOCATIONS, loading: false };
}

export type { DistrictInfo };
