# Visual asset credits

## Ganges River Delta — added in the visual refinement

- Source: https://science.nasa.gov/earth/earth-observatory/ganges-river-delta-1326/
- Original asset: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/1000/1326/modis_ganges_lrg.jpg
- Acquired: 28 December 2000. NASA Earth Observatory publication: 9 April 2001.
- Instrument: Terra / MODIS; true-color observation.
- Credit: Jacques Descloitres, MODIS Land Team, NASA Earth Observatory.
- Local file: `public/images/ganges-delta-2000.jpg`, 1502 × 2002, approximately 870 KB.
- Used as historical geographical context on Home and supporting workspace surfaces. Not live imagery, not a POWER measurement layer, and not a geometrically registered map overlay. Source-image border annotations are original; display crops are editorial.
- No video was added in the initial refinement; the later experience upgrade adds the film documented below. The image uses clearly decorative, schematic SVG signal trajectories and reduced-motion-aware parallax. No imagery-based scientific values are derived from it.

## Retained existing assets

- NASA Blue Marble Next Generation, December 2004: NASA Earth Observatory / Reto Stöckli and Robert Simmon. `earth-december-2004.jpg`. https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/
- Natural Earth country boundaries, public domain. Bangladesh district boundaries: geoBoundaries / BBS / OCHA ROAP, 2020 representation, CC BY 3.0 IGO; source metadata remains in `data/metadata/bangladesh-boundaries.json`.
- Manrope: SIL Open Font License, retained locally with license. Lucide icons: ISC.


## Earthrise: The 45th Anniversary — experience upgrade video

- Official source: https://svs.gsfc.nasa.gov/4129
- Released: 20 December 2013. Visualization: Ernie Wright / NASA Scientific Visualization Studio.
- Exact source segment: https://svs.gsfc.nasa.gov/vis/a000000/a004100/a004129/earthrise_720p30.mp4
- NASA describes this segment as an idealized telephoto view of Earth rising over lunar terrain. It is a visualization/reconstruction, not live imagery or Bangladesh footage.
- Local `public/images/nasa-earthrise.mp4`: 16-second extract from source seconds45–61, 1280×720,24fps, muted/no audio, H.264 with fast-start,436123bytes (approximately426KiB). A short fade softens the loop reset; it is not claimed to be a seamless source recording.
- Poster `nasa-earthrise-poster.jpg` is extracted from the actual compressed clip. Autoplay/muted/inline/loop; reduced-motion users receive the existing historical delta still without loading the video. Load/play failure also retains the delta image. Both scene choices are labeled.
- Reproduce media: run scripts/download_earthrise.py then scripts/compress_earthrise.py with imageio-ffmpeg available as a local authoring tool. No encoding library was added to application dependencies.
