export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

export interface RecentContact {
  phone: string;
  timestamp: number;
}

export interface ValidationResult {
  cleaned: string;
  valid: boolean;
  error?: string;
}
