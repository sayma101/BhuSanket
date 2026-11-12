from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class TrendRequest(BaseModel):
    location_id: str = "dhaka"
    variable: str = "T2M"
    start_year: int = Field(default=1991, ge=1981, le=2025)
    end_year: int = Field(default=2024, ge=1981, le=2025)
    aggregation: Literal["annual", "summer", "monsoon", "monthly"] = "annual"
    month: int = Field(default=1, ge=1, le=12)
    mode: Literal["cached", "live", "fixture"] = "cached"
    lat: float | None = Field(default=None, ge=-90, le=90)
    lon: float | None = Field(default=None, ge=-180, le=180)
    autocorrelation: Literal["auto", "withhold"] = "auto"

    @model_validator(mode="after")
    def valid_range(self):
        if self.end_year < self.start_year:
            raise ValueError("End year must be on or after start year")
        if (self.lat is None) != (self.lon is None):
            raise ValueError("Both latitude and longitude are required")
        return self


class CompareRequest(BaseModel):
    left: TrendRequest
    right: TrendRequest


class CourtRequest(BaseModel):
    analysis_id: str
    claim_id: str = "dhaka-summer"
    prediction: str | None = None
    verdict: Literal["SUPPORTED", "WINDOW-DEPENDENT", "NOT SUPPORTED ON THIS RECORD", "NOT ENOUGH EVIDENCE"]
    confidence: int = Field(default=50, ge=0, le=100)
    tools: list[Literal["full-record", "season", "trend-test", "neighbour"]]


class ExplainRequest(BaseModel):
    analysis_id: str
    language: Literal["en", "bn"] = "en"


class OpenModel(BaseModel):
    model_config = ConfigDict(extra="allow")


class Location(OpenModel):
    id: str
    label: str
    lat: float
    lon: float
    type: str


class Dataset(OpenModel):
    short_name: str
    version: str
    source_type: str


class Variable(OpenModel):
    id: str
    label: str
    unit: str


class Period(BaseModel):
    start_year: int
    end_year: int


class SeriesPoint(BaseModel):
    year: int
    value: float | None
    coverage: float = Field(ge=0, le=1)


class Dependence(OpenModel):
    lag1: float | None
    decision: str


class Trend(OpenModel):
    direction: str
    slope_per_year: float | None
    slope_per_decade: float | None
    ci_95: tuple[float, float] | None
    p_value: float | None = Field(ge=0, le=1)
    intercept: float | None
    test_variant: str
    autocorrelation: Dependence


class Quality(OpenModel):
    valid_observations: int
    total_observations: int
    missing_percent: float = Field(ge=0, le=100)
    warnings: list[str]
    valid_pixel_coverage: float | None


class TrendSummary(OpenModel):
    period: Period
    trend: Trend
    quality: Quality
    verdict: Literal["Significant increase", "Significant decrease", "No significant trend detected", "Not enough evidence"]


class Provenance(BaseModel):
    source_url: str
    retrieved_at: str | None
    mode: Literal["LIVE", "CACHED", "FIXTURE"]
    software_version: str


class TrendResult(TrendSummary):
    schema_version: Literal["1.0"]
    analysis_id: str
    dataset: Dataset
    variable: Variable
    location: Location
    aggregation: str
    series: list[SeriesPoint]
    interpretation: dict[str, str]
    provenance: Provenance
    passport: dict
    full_record: TrendSummary
    window_sensitive: bool


class CompareResult(BaseModel):
    schema_version: Literal["1.0"]
    left: TrendResult
    right: TrendResult
    divergence: str
    adjustment: str
