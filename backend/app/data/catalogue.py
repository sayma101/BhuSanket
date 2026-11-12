from .sources import source_url

LOCATIONS = [
    {"id": "dhaka", "label": "Dhaka", "lat": 23.8103, "lon": 90.4125, "type": "point"},
    {"id": "rajshahi", "label": "Rajshahi", "lat": 24.3745, "lon": 88.6042, "type": "point"},
    {"id": "khulna", "label": "Khulna", "lat": 22.8456, "lon": 89.5403, "type": "point"},
    {"id": "sylhet", "label": "Sylhet", "lat": 24.8949, "lon": 91.8687, "type": "point"},
    {"id": "sunamganj", "label": "Sunamganj", "lat": 25.0658, "lon": 91.3950, "type": "point"},
    {"id": "kathmandu", "label": "Kathmandu, Nepal", "lat": 27.7172, "lon": 85.3240, "type": "point"},
]
VARIABLES = [
    {"id": "T2M", "label": "Air temperature at 2 m", "unit": "°C", "dataset": "POWER_DAILY", "status": "Available and validated", "rule": "mean"},
    {"id": "T2M_MAX", "label": "Mean daily maximum air temperature", "unit": "°C", "dataset": "POWER_DAILY", "status": "Available and validated", "rule": "mean"},
    {"id": "PRECTOTCORR", "label": "Precipitation accumulation", "unit": "mm", "dataset": "POWER_DAILY", "status": "Available and validated", "rule": "sum"},
    {"id": "RH2M", "label": "Relative humidity at 2 m", "unit": "%", "dataset": "POWER_DAILY", "status": "Available and validated", "rule": "mean"},
    {"id": "ALLSKY_SFC_SW_DWN", "label": "Surface shortwave solar irradiation", "unit": "MJ/m²/day", "dataset": "POWER_DAILY", "status": "Available and validated", "rule": "mean"},
]
CATALOGUE = [
    {"id": "POWER_DAILY", "name": "NASA POWER Daily", "version": "API response recorded per retrieval", "status": "Available and validated", "source_type": "Analysis-ready gridded model/reanalysis and satellite-derived solar product", "variables": [v["id"] for v in VARIABLES], "source_url": source_url("power"), "note": "Daily pipeline validated. Monthly metrics use daily observations; separate monthly API adapter planned."},
    {"id": "GPM_3IMERGDF", "name": "GPM IMERG V07B Final", "version": "V07B", "status": "Not yet validated", "source_type": "Multi-satellite precipitation estimate", "variables": ["precipitation"], "source_url": source_url("imerg"), "note": "Next satellite integration. Earthdata download, quality fields and accumulation handling must be validated."},
    {"id": "MOD11A2.061", "name": "Terra MODIS Land Surface Temperature", "version": "061", "status": "Not yet validated", "source_type": "Satellite retrieval", "variables": ["LST_Day_1km", "LST_Night_1km"], "source_url": source_url("mod11"), "note": "8-day / 1 km. QC and 0.02 K scale factor required. LST differs from 2-m air temperature."},
    {"id": "MOD13Q1.061", "name": "Terra MODIS Vegetation Indices", "version": "061", "status": "Planned", "source_type": "Satellite retrieval", "variables": ["NDVI", "EVI"], "source_url": source_url("mod13"), "note": "16-day / 250 m. Detailed QA and scale factors required."},
    {"id": "VIIRS", "name": "VIIRS land products", "version": "Exact collection not selected", "status": "Planned", "source_type": "Satellite retrieval", "variables": ["LST", "vegetation", "fire"], "source_url": source_url("viirs"), "note": "Select and verify collection/version before enabling."},
    {"id": "SMAP", "name": "SMAP", "version": "Collection selection pending", "status": "Planned", "source_type": "Satellite retrieval / assimilation", "variables": ["soil moisture"], "source_url": source_url("smap"), "note": "Surface/root-zone products have different support and QC; shorter record."},
    {"id": "GRACE", "name": "GRACE / GRACE-FO", "version": "Collection selection pending", "status": "Planned", "source_type": "Satellite-derived gravity / water-storage anomaly", "variables": ["terrestrial water storage anomaly"], "source_url": source_url("grace"), "note": "Coarse monthly basin-scale signal; not local well groundwater."},
    {"id": "MERRA2", "name": "MERRA-2", "version": "Collection selection pending", "status": "Planned", "source_type": "Reanalysis", "variables": ["temperature", "humidity", "wind", "aerosols"], "source_url": source_url("merra2"), "note": "Coarse grid and reanalysis provenance must be preserved."},
    {"id": "GLDAS", "name": "GLDAS", "version": "Model/version selection pending", "status": "Planned", "source_type": "Land-surface model", "variables": ["soil moisture", "evapotranspiration", "runoff"], "source_url": source_url("gldas"), "note": "Select model, forcing, version and temporal resolution."},
    {"id": "AIRS", "name": "AIRS / CLIMCAPS", "version": "Collection selection pending", "status": "Planned", "source_type": "Atmospheric profile retrieval", "variables": ["temperature profile", "water vapour profile"], "source_url": source_url("airs"), "note": "Pressure-level, vertical sensitivity and QC handling required."},
    {"id": "OMI", "name": "OMI / Aura", "version": "Collection selection pending", "status": "Planned", "source_type": "Atmospheric column / swath retrieval", "variables": ["ozone", "NO2", "SO2"], "source_url": source_url("omi"), "note": "Column measurements need explicit gridding, quality flags and coverage."},
]
CLAIMS = [
    {"id": "dhaka-summer", "text": "Dhaka's pre-monsoon summer air temperature is increasing.", "location_id": "dhaka", "variable": "T2M", "aggregation": "summer", "start_year": 1991, "end_year": 2024, "direction": "increase"},
    {"id": "rajshahi-rain", "text": "Rajshahi's annual rainfall total is decreasing.", "location_id": "rajshahi", "variable": "PRECTOTCORR", "aggregation": "annual", "start_year": 1991, "end_year": 2024, "direction": "decrease"},
    {"id": "khulna-monsoon", "text": "Khulna's June–September monsoon rainfall total is increasing.", "location_id": "khulna", "variable": "PRECTOTCORR", "aggregation": "monsoon", "start_year": 1991, "end_year": 2024, "direction": "increase"},
    {"id": "sylhet-rain", "text": "Sylhet's annual rainfall total is increasing.", "location_id": "sylhet", "variable": "PRECTOTCORR", "aggregation": "annual", "start_year": 1991, "end_year": 2024, "direction": "increase"},
]
