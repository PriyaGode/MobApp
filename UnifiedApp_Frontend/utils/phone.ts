import {
  AsYouType,
  CountryCode,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

export type CountryOption = {
  name: string;
  iso2: CountryCode;
  dialCode: string;
  sampleFormat: string;
};

type CountrySeed = { iso2: CountryCode; name: string };

const COUNTRY_SEED: CountrySeed[] = [
  { iso2: "US", name: "United States" },
  { iso2: "CA", name: "Canada" },
  { iso2: "MX", name: "Mexico" },
  { iso2: "GB", name: "United Kingdom" },
  { iso2: "IE", name: "Ireland" },
  { iso2: "FR", name: "France" },
  { iso2: "DE", name: "Germany" },
  { iso2: "ES", name: "Spain" },
  { iso2: "IT", name: "Italy" },
  { iso2: "PT", name: "Portugal" },
  { iso2: "NL", name: "Netherlands" },
  { iso2: "BE", name: "Belgium" },
  { iso2: "SE", name: "Sweden" },
  { iso2: "NO", name: "Norway" },
  { iso2: "DK", name: "Denmark" },
  { iso2: "FI", name: "Finland" },
  { iso2: "AU", name: "Australia" },
  { iso2: "NZ", name: "New Zealand" },
  { iso2: "IN", name: "India" },
  { iso2: "SG", name: "Singapore" },
  { iso2: "MY", name: "Malaysia" },
  { iso2: "PH", name: "Philippines" },
  { iso2: "VN", name: "Vietnam" },
  { iso2: "TH", name: "Thailand" },
  { iso2: "ID", name: "Indonesia" },
  { iso2: "JP", name: "Japan" },
  { iso2: "KR", name: "South Korea" },
  { iso2: "CN", name: "China" },
  { iso2: "HK", name: "Hong Kong" },
  { iso2: "TW", name: "Taiwan" },
  { iso2: "AE", name: "United Arab Emirates" },
  { iso2: "SA", name: "Saudi Arabia" },
  { iso2: "QA", name: "Qatar" },
  { iso2: "KW", name: "Kuwait" },
  { iso2: "OM", name: "Oman" },
  { iso2: "BH", name: "Bahrain" },
  { iso2: "EG", name: "Egypt" },
  { iso2: "ZA", name: "South Africa" },
  { iso2: "NG", name: "Nigeria" },
  { iso2: "KE", name: "Kenya" },
  { iso2: "GH", name: "Ghana" },
  { iso2: "TZ", name: "Tanzania" },
  { iso2: "UG", name: "Uganda" },
  { iso2: "PK", name: "Pakistan" },
  { iso2: "BD", name: "Bangladesh" },
  { iso2: "LK", name: "Sri Lanka" },
  { iso2: "NP", name: "Nepal" },
  { iso2: "AR", name: "Argentina" },
  { iso2: "CL", name: "Chile" },
  { iso2: "CO", name: "Colombia" },
  { iso2: "PE", name: "Peru" },
  { iso2: "BR", name: "Brazil" }
];

function getDialCode(iso2: CountryCode): string {
  return `+${getCountryCallingCode(iso2)}`;
}

function getSampleFormat(iso2: CountryCode): string {
  try {
    const example = getExampleNumber(iso2, examples);
    if (example) {
      return example.formatNational();
    }
  } catch {
    // Fallback below
  }
  return "1234567890";
}

export const COUNTRY_OPTIONS: CountryOption[] = COUNTRY_SEED.map(seed => ({
  ...seed,
  dialCode: getDialCode(seed.iso2),
  sampleFormat: getSampleFormat(seed.iso2)
}));

export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizePhoneNumber(dialCode: string, nationalNumber: string): string {
  const numeric = stripNonDigits(nationalNumber);
  return `${dialCode}${numeric}`;
}

export function formatNationalNumber(iso2: CountryCode, dialCode: string, input: string): string {
  const digits = stripNonDigits(input);
  if (!digits) {
    return dialCode;
  }
  const formatter = new AsYouType(iso2);
  const formatted = formatter.input(`${dialCode}${digits}`);
  if (formatted) {
    return formatted;
  }
  return `${dialCode} ${stripNonDigits(input)}`;
}

export function isValidForCountry(iso2: CountryCode, dialCode: string, nationalNumber: string): boolean {
  const rawDigits = stripNonDigits(nationalNumber);
  if (!rawDigits) {
    return false;
  }

  const parsed = parsePhoneNumberFromString(`${dialCode}${rawDigits}`);
  if (!parsed) {
    return false;
  }

  return parsed.isValid() && parsed.country === iso2;
}
