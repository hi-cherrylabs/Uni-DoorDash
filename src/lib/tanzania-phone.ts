/**
 * Tanzania Communications Regulatory Authority (TCRA) Numbering Plan Utility
 * Country Code: +255
 * National Significant Number (NSN) length: 9 digits
 * Supports all national and international dialing variations without blocking.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  operator?: string | undefined;
  formatted: string;
  nationalFormat: string;
  internationalFormat: string;
  rawDigits: string;
  error?: string | undefined;
}

export const TZ_OPERATOR_PREFIXES: Record<string, string> = {
  // Vodacom Tanzania
  "74": "Vodacom",
  "75": "Vodacom",
  "76": "Vodacom",
  // Airtel Tanzania
  "68": "Airtel",
  "69": "Airtel",
  "78": "Airtel",
  "79": "Airtel",
  // Tigo / Yas & Zantel (MIC Tanzania PLC)
  "65": "Tigo / Yas",
  "67": "Tigo / Yas",
  "71": "Tigo / Yas",
  "77": "Zantel / Tigo",
  // Halotel (Viettel Tanzania)
  "61": "Halotel",
  "62": "Halotel",
  // TTCL Corporation
  "73": "TTCL",
  // Smile Communications
  "66": "Smile 4G",
  // Wiafrica / Other allocations
  "64": "Wiafrica",
  "72": "Tanzania Mobile",
};

// Landline geographic area codes
export const TZ_LANDLINE_PREFIXES: Record<string, string> = {
  "22": "Dar es Salaam & Coast",
  "23": "Coast & Morogoro",
  "24": "Zanzibar & Pemba",
  "25": "Mbeya & Southern Highlands",
  "26": "Dodoma, Iringa & Singida",
  "27": "Arusha, Kilimanjaro, Tanga & Manyara",
  "28": "Mwanza, Shinyanga, Kagera, Mara & Tabora",
};

/**
 * Extracts normalized 9-digit Tanzanian National Significant Number (NSN)
 */
export function extractTanzaniaNSN(input: string): string {
  if (!input) return "";
  // Remove non-digit characters except leading +
  let cleaned = input.trim().replace(/[^\d+]/g, "");

  // Strip international prefixes (+255, 00255, 255)
  if (cleaned.startsWith("+255")) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith("00255")) {
    cleaned = cleaned.slice(5);
  } else if (cleaned.startsWith("255") && cleaned.length >= 12) {
    cleaned = cleaned.slice(3);
  }

  // Strip leading national trunk zero (0)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Validates and identifies any Tanzanian phone number comprehensively.
 * Guarantees zero false rejections for real Tanzanian phone numbers.
 */
export function validateTanzaniaPhone(input: string): PhoneValidationResult {
  const rawDigits = extractTanzaniaNSN(input);

  if (!rawDigits || rawDigits.length === 0) {
    return {
      isValid: false,
      formatted: "",
      nationalFormat: "",
      internationalFormat: "",
      rawDigits: "",
      error: "Please enter a phone number",
    };
  }

  // Identify operator based on 2-digit prefix
  const prefix2 = rawDigits.slice(0, 2);
  let operator: string | undefined = TZ_OPERATOR_PREFIXES[prefix2];

  if (!operator && TZ_LANDLINE_PREFIXES[prefix2]) {
    operator = `Fixed Line (${TZ_LANDLINE_PREFIXES[prefix2]})`;
  }

  // Tanzanian NSN is 9 digits (mobile starting with 6 or 7, landline starting with 2)
  const isNineDigits = rawDigits.length === 9;
  const isMobilePrefix = /^[67]/.test(rawDigits);
  const isLandlinePrefix = /^2/.test(rawDigits);

  // We are permissive: if user enters 9 digits (or 8-10 digits), we format and accept it
  const isValid =
    (isNineDigits && (isMobilePrefix || isLandlinePrefix)) ||
    (rawDigits.length >= 9 && rawDigits.length <= 10);

  const part1 = rawDigits.slice(0, 3);
  const part2 = rawDigits.slice(3, 6);
  const part3 = rawDigits.slice(6);

  const formatted =
    rawDigits.length >= 3
      ? `${part1} ${part2}${part3 ? " " + part3 : ""}`
      : rawDigits;
  const nationalFormat = `0${formatted}`;
  const internationalFormat = `+255 ${formatted}`;

  let error: string | undefined = undefined;
  if (!isValid && rawDigits.length < 9) {
    error = `Needs ${9 - rawDigits.length} more digit${9 - rawDigits.length > 1 ? "s" : ""}`;
  } else if (!isValid && !isMobilePrefix && !isLandlinePrefix) {
    error = "Please enter a valid Tanzanian number starting with 06, 07, or 02";
  }

  return {
    isValid,
    operator: operator || (isMobilePrefix ? "Tanzania Mobile" : undefined),
    formatted,
    nationalFormat,
    internationalFormat,
    rawDigits,
    error,
  };
}
