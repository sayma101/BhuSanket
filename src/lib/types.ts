export type Aggregation = 'annual' | 'summer' | 'monsoon' | 'monthly';
export type DataMode = 'cached' | 'live' | 'fixture';
export interface Location { id: string; label: string; lat: number; lon: number; type: string }
export interface Variable { id: string; label: string; unit: string; dataset: string; status: string }
export interface Claim { id: string; text: string; location_id: string; variable: string; aggregation: Aggregation; start_year: number; end_year: number; direction: 'increase' | 'decrease' }
export interface TrendRequest { location_id: string; variable: string; start_year: number; end_year: number; aggregation: Aggregation; month?: number; mode: DataMode; lat?: number; lon?: number; autocorrelation?: 'auto' | 'withhold' }
export interface TrendSummary {
  verdict: string;
  comparison_verdict?: string;
  trend: { direction: string; slope_per_year: number | null; slope_per_decade: number | null; ci_95: [number, number] | null; p_value: number | null; p_adjusted?: number | null; intercept: number | null; test_variant: string; autocorrelation: { lag1: number | null; decision: string } };
  period: { start_year: number; end_year: number };
  quality: { valid_observations: number; total_observations: number; missing_percent: number; warnings: string[]; valid_pixel_coverage: number | null };
}
export interface TrendResult extends TrendSummary {
  schema_version: string; analysis_id: string;
  dataset: { short_name: string; version: string; source_type: string };
  variable: { id: string; label: string; unit: string }; location: Location;
  aggregation: string; series: { year: number; value: number | null; coverage: number }[];
  interpretation: { en: string; bn: string };
  provenance: { source_url: string; retrieved_at: string; mode: 'LIVE' | 'CACHED' | 'FIXTURE'; software_version: string };
  passport: Record<string, unknown>; full_record?: TrendSummary; window_sensitive: boolean;
}
export interface CompareResult { left: TrendResult; right: TrendResult; divergence: string; adjustment: string }
