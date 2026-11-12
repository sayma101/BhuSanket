# Observatory asset provenance

Acquired for the approved “From Orbit to Evidence” visual implementation on 12 November 2026. These files are historical contextual imagery. They are not the NASA POWER measurement series, registered analysis overlays, or current conditions. No measurements are derived from these display assets.

## Dhaka — Landsat 8 OLI

- Local file: `public/images/dhaka-landsat-2022.jpg`
- Dimensions: 1817 × 1747; source JPEG, 4,174,946 bytes.
- Acquisition: 20 March 2022.
- Instrument: Landsat 8 Operational Land Imager (OLI).
- Source article: https://science.nasa.gov/earth/earth-observatory/rising-flood-risks-in-bangladesh-150274/
- Original asset: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/150000/150274/dhaka_oli_202279_lrg.jpg
- Credit: NASA Earth Observatory image by Lauren Dauphin, using Landsat data from the U.S. Geological Survey.
- Suggested visible caption: `DHAKA · LANDSAT 8 / OLI · 20 MAR 2022 · CONTEXT IMAGE`.
- Use: urban and river context for a Dhaka mission. This image does not measure air temperature, heat exposure, or a statistical trend.

## Sundarbans — Landsat 7 composite

- Local file: `public/images/sundarbans-landsat-2000.jpg`
- Dimensions: 7200 × 4800; source JPEG, 4,191,929 bytes.
- Observations merged by NASA: 24 November 1999 and 17/26 November 2000.
- Instrument: Landsat 7.
- Source article: https://science.nasa.gov/earth/earth-observatory/sundarbans-bangladesh-7028/
- Original asset: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/7000/7028/sundarban_l7_2000331_lrg.jpg
- Credit: Jesse Allen / NASA Earth Observatory, using data obtained from the University of Maryland’s Global Land Cover Facility.
- Suggested visible caption: `SUNDARBANS · LANDSAT 7 · 1999–2000 COMPOSITE · CONTEXT IMAGE`.
- Use: delta/mangrove context for Khulna and monsoon investigations. It is a multi-date composite, not a single acquisition or rainfall map.

## Northeastern Bangladesh / Sylhet — MODIS seasonal comparison

- Local file: `public/images/sylhet-modis-2007.jpg`
- Dimensions: 540 × 709; source JPEG, 244,476 bytes.
- Source article: https://science.nasa.gov/earth/earth-observatory/floods-in-bangladesh-18490/
- Original asset: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/18000/18490/Bangladesh_AMO_2007171.jpg
- Credit: MODIS Rapid Response Team / NASA GSFC.
- IMPORTANT: the downloaded source is a paired figure. The top panel is Aqua MODIS, 20 June 2007; the bottom panel is Terra MODIS, 1 May 2007. Both are false-colour combinations of infrared and visible light. The figure contains original date captions.
- Suggested visible caption: `SYLHET REGION · TERRA / AQUA MODIS · MAY–JUN 2007 · FALSE-COLOUR CONTEXT`.
- Use: historical wetland/seasonal imagery for the Sylhet mission. It does not establish a long-term rainfall trend or imply that the POWER precipitation record is a flood measurement.
- Do not label the entire paired image as a single 20 June acquisition. Do not use it as a current flood layer or as a Rajshahi-specific image.

## Earth from the International Space Station — April 2016

- Local video: `public/images/nasa-iss-earth.mp4`, 1,549,225 bytes.
- Local poster: `public/images/nasa-iss-earth-poster.jpg`, 62,499 bytes.
- Official source: https://svs.gsfc.nasa.gov/30771/
- Source release: 29 April 2016. NASA describes footage as taken from the ISS in April 2016.
- Credit requested by NASA: NASA Johnson.
- Source file: https://svs.gsfc.nasa.gov/vis/a030000/a030700/a030771/ISS_View_of_Planet_Earth_720p.mp4
- Source downloaded to `tmp/nasa-iss-observation-source.mp4` (25,209,603 bytes, approximately 97 seconds, 1280 × 720). This authoring source is not needed at runtime.
- Runtime edit: source seconds 10–22; 12 seconds; 1280 × 720; 24 fps; no audio; H.264; CRF 25; fast-start metadata; a 0.35-second fade at each end softens the reset. It is not claimed to be a seamless continuous recording.
- Poster: extracted at second two of the edited runtime clip.
- Suggested visible caption: `EARTH FROM ISS · APR 2016 · NASA JOHNSON · HISTORICAL FOOTAGE`.
- Use: global Earth-observation atmosphere. Do not label the geography visible in this clip as Bangladesh, claim live footage, or connect an overlaid schematic orbit to an actual spacecraft ephemeris.
- Existing `nasa-earthrise.mp4` remains unchanged and is separately documented in `ASSET_CREDITS.md` as a reconstruction.

## Reproducible video authoring command

The existing local `.media-tools` installation supplies `imageio_ffmpeg`; no application dependency was added.

```python
import sys, subprocess
sys.path.insert(0, '.media-tools')
import imageio_ffmpeg
encoder = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([
    encoder, '-hide_banner', '-loglevel', 'error', '-ss', '10',
    '-i', 'tmp/nasa-iss-observation-source.mp4', '-t', '12', '-an',
    '-vf', 'fps=24,fade=t=in:st=0:d=0.35,fade=t=out:st=11.65:d=0.35',
    '-c:v', 'libx264', '-crf', '25', '-preset', 'fast',
    '-movflags', '+faststart', 'public/images/nasa-iss-earth.mp4'
], check=True)
```

## Verification and display requirements

All three new JPEGs and a representative video frame were visually inspected. Source photographs have not been recoloured or synthetically completed. Editorial `object-fit` crops should retain a source/date caption. Next image optimization may generate responsive renditions from the original files. No additional Rajshahi-specific NASA scene was verified during this bounded asset task; use a clearly labelled regional contextual image or geographical map for that mission.
