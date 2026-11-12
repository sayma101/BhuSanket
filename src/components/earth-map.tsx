'use client';

import {sourceTemplates} from '@/lib/nasa-sources';
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup, GeoJSON, TileLayer } from 'leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { Location } from '@/lib/types';
import { Layers3, LocateFixed, Map, Satellite } from 'lucide-react';
import { pointColour, type PointEvidence } from './environment-discovery';
import 'leaflet/dist/leaflet.css';

const IMAGE_DATE = '2024-01-15';
const TILE_URL = sourceTemplates.gibs_satellite.replace('{date}',IMAGE_DATE);

const CONTEXT_URL = sourceTemplates.gibs_blue_marble;
const CONTEXT_LAYER = CONTEXT_URL.split('/best/')[1].split('/')[0];

type Props = { locations: Location[]; selected: string; global: boolean; onSelect: (id: string) => void; onPoint: (lat: number, lon: number, label?: string) => void; measurements?: PointEvidence[]; measurementUnit?: string; domain?: [number, number] | null; pending?: boolean; presentation?: 'standard' | 'immersive' };
export function EarthMap({ locations, selected, global, onSelect, onPoint, measurements = [], measurementUnit, domain = null, pending = false, presentation = 'standard' }: Props) {
  const immersive = presentation === 'immersive';
  const element = useRef<HTMLDivElement>(null);
  const cachedTiles = useRef(new Set<string>());
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<LayerGroup | null>(null);
  const countries = useRef<GeoJSON | null>(null);
  const satellite = useRef<TileLayer | null>(null);
  const callbacks = useRef({ onSelect, onPoint, locations });
  const [background, setBackground] = useState<'atlas' | 'satellite'>(immersive ? 'satellite' : 'atlas');
  const [error, setError] = useState('');
  const [tileError, setTileError] = useState('');
  const [ready, setReady] = useState(false);
  const [districts, setDistricts] = useState<Feature<Geometry>[]>([]);
  const [districtSelection, setDistrictSelection] = useState('');
  useEffect(() => { callbacks.current = { onSelect, onPoint, locations }; }, [onSelect, onPoint, locations]);

  async function chooseDistrict(name: string) {
    const feature = districts.find(item => item.properties?.shapeName === name);
    if (!feature) return;
    setDistrictSelection(name);
    const prepared = locations.find(item => item.label.toLowerCase() === name.toLowerCase());
    if (prepared) { onSelect(prepared.id); return; }
    const L = await import('leaflet');
    const centre = L.geoJSON(feature).getBounds().getCenter();
    onPoint(Number(centre.lat.toFixed(4)), Number(centre.lng.toFixed(4)), `${name} boundary-box centre`);
  }

  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    import('leaflet').then(async L => {
      if (!element.current || disposed) return;
      const instance = L.map(element.current, { zoomControl: false, minZoom: 2, maxZoom: 12, worldCopyJump: true, scrollWheelZoom: false, zoomSnap: immersive ? .25 : 1 }).setView([23.9, 90.1], 6);
      map.current = instance;
      L.control.zoom({ position: immersive ? 'topleft' : 'bottomright' }).addTo(instance);
      L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 130 }).addTo(instance);
      instance.attributionControl.addAttribution('Natural Earth · contextual boundaries');
      const grid = L.layerGroup().addTo(instance);
      for (let lon = -180; lon <= 180; lon += 5) L.polyline([[-80, lon], [85, lon]], { color: '#486771', weight: .5, opacity: immersive ? .12 : .3, interactive: false }).addTo(grid);
      for (let lat = -75; lat <= 75; lat += 5) L.polyline([[lat, -180], [lat, 180]], { color: '#486771', weight: .5, opacity: immersive ? .12 : .3, interactive: false }).addTo(grid);
      try {
        const response = await fetch('/maps/world.geojson');
        if (!response.ok) throw Error();
        const data = await response.json();
        if (!disposed) countries.current = L.geoJSON(data, { interactive: false, style: feature => ({ color: immersive && (feature?.properties?.ADMIN ?? feature?.properties?.name)?.trim() === 'Bangladesh' ? '#D59A39' : '#527982', weight: immersive && (feature?.properties?.ADMIN ?? feature?.properties?.name)?.trim() === 'Bangladesh' ? 1.8 : .8, fillColor: (feature?.properties?.ADMIN ?? feature?.properties?.name)?.trim() === 'Bangladesh' ? '#29655e' : '#173a43', fillOpacity: .92 }) }).addTo(instance);
      } catch { if (!disposed) setError('Country boundaries unavailable. Point locations remain geographically positioned.'); }
      if (disposed) return;
      try {
        const response = await fetch('/maps/bangladesh-districts.geojson');
        if (!response.ok) throw Error();
        const data: FeatureCollection = await response.json();
        if (!disposed) {
          setDistricts(data.features.sort((a, b) => String(a.properties?.shapeName).localeCompare(String(b.properties?.shapeName))));
          L.geoJSON(data, { bubblingMouseEvents: false, style: { color: immersive ? '#c2d6bd' : '#8ab8a7', weight: immersive ? .55 : .7, fillColor: '#50776a', fillOpacity: immersive ? .025 : .08 }, onEachFeature: (feature, layer) => {
            const name = String(feature.properties?.shapeName ?? 'District');
            layer.bindTooltip(`${name} · representative point`, { sticky: true, className: 'map-site-label' });
            layer.on('click', event => {
              L.DomEvent.stopPropagation(event.originalEvent); setDistrictSelection(name);
              const prepared = callbacks.current.locations.find(item => item.label.toLowerCase() === name.toLowerCase());
              if (prepared) callbacks.current.onSelect(prepared.id);
              else { const centre = L.geoJSON(feature).getBounds().getCenter(); callbacks.current.onPoint(Number(centre.lat.toFixed(4)), Number(centre.lng.toFixed(4)), `${name} boundary-box centre`); }
            });
          } }).addTo(instance);
          instance.attributionControl.addAttribution('Districts: geoBoundaries / BBS / OCHA · 2020 · CC BY 3.0 IGO');
        }
      } catch { if (!disposed) setError('District boundaries unavailable. Prepared points and coordinate selection remain available.'); }
      if (disposed) return;
      if (immersive) {
        try {
          const response = await fetch('/maps/blue-marble-context/manifest.json');
          const manifest = await response.json();
          if (manifest.layer === CONTEXT_LAYER && manifest.projection === 'EPSG:3857') cachedTiles.current = new Set((manifest.tiles as {key:string}[]).map(tile => tile.key));
        } catch { /* Online imagery remains optional; local geographic boundaries stay available. */ }
      }
      if (disposed) return;
      markers.current = L.layerGroup().addTo(instance);
      instance.on('click', event => { setDistrictSelection(''); callbacks.current.onPoint(Number(event.latlng.lat.toFixed(4)), Number(event.latlng.lng.toFixed(4))); });
      resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(element.current!);
      instance.invalidateSize(); setReady(true);
    }).catch(() => { if (!disposed) setError('The map could not initialize. Use the prepared-place controls to continue.'); });
    return () => { disposed = true; resize?.disconnect(); map.current?.remove(); map.current = null; markers.current = null; };
  }, [immersive]);

  useEffect(() => {
    if (!ready || !map.current) return;
    let disposed = false;
    if (background === 'atlas') {
      satellite.current?.remove(); satellite.current = null;
      countries.current?.setStyle({ fillOpacity: .92 });
      return;
    }
    import('leaflet').then(L => {
      if (disposed || !map.current) return;
      countries.current?.setStyle({ fillOpacity: .06 });
      const tiles = L.tileLayer(immersive ? CONTEXT_URL : TILE_URL, { maxNativeZoom: immersive ? 8 : 9, maxZoom: 12, attribution: immersive ? 'NASA Earth Observatory / GIBS · Blue Marble composite with shaded relief & bathymetry · 2004' : `NASA GIBS · Terra MODIS true colour · ${IMAGE_DATE}`, crossOrigin: true });
      if (immersive && cachedTiles.current.size) {
        const onlineURL = tiles.getTileUrl.bind(tiles);
        tiles.getTileUrl = coords => cachedTiles.current.has(`${coords.z}/${coords.y}/${coords.x}`) ? `/maps/blue-marble-context/${coords.z}/${coords.y}/${coords.x}.jpeg` : onlineURL(coords);
      }
      satellite.current = tiles;
      tiles.once('tileerror', () => { if (!disposed) { setTileError('NASA imagery could not load. The local atlas remains available.'); setBackground('atlas'); } });
      tiles.addTo(map.current);
    });
    return () => { disposed = true; satellite.current?.remove(); satellite.current = null; };
  }, [background, ready, immersive]);

  useEffect(() => {
    let disposed = false;
    if (!ready || !markers.current) return;
    import('leaflet').then(L => {
      if (disposed || !markers.current) return;
      markers.current.clearLayers();
      locations.forEach(location => {
        const active = location.id === selected;
        const evidence = measurements.find(row => row.id === location.id);
        const marker = L.circleMarker([location.lat, location.lon], { bubblingMouseEvents: false, className: active ? 'map-selected-signal' : '', radius: active ? immersive ? 12 : 10 : 6, color: active ? immersive ? '#D59A39' : '#f0e9cc' : '#d5e4d7', fillColor: pending ? '#77858a' : pointColour(evidence?.value, domain), fillOpacity: 1, weight: active ? 2.5 : 1 }).addTo(markers.current!);
        marker.bindTooltip(`${location.label}${!immersive && !pending && evidence ? ` · ${evidence.year}: ${evidence.value == null ? 'missing' : evidence.value.toFixed(2) + ' ' + measurementUnit} · ${(evidence.coverage * 100).toFixed(1)}% coverage` : ''}`, { permanent: immersive || active, direction: active && immersive ? 'right' : 'top', className: `map-site-label ${active && immersive ? 'selected-place-label' : ''}`, offset: immersive && active ? [14,0] : [0,-6] });
        marker.on('click', event => { L.DomEvent.stopPropagation(event.originalEvent); callbacks.current.onSelect(location.id); });
      });
    });
    return () => { disposed = true; };
  }, [locations, selected, ready, measurements, measurementUnit, domain, pending, immersive]);

  useEffect(() => {
    if (!ready) return;
    const location = locations.find(item => item.id === selected);
    const width = map.current?.getSize().x ?? 1200;
    map.current?.flyTo(global ? [22, 55] : location ? [location.lat, location.lon] : [23.8, 90.1], global ? 2 : immersive ? width > 1050 ? 7 : width > 700 ? 6.25 : 6 : 6, { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .85 });
  }, [global, selected, locations, ready, immersive]);
  const districtValue = selected === 'custom' ? districtSelection : districts.find(item => item.properties?.shapeName?.toLowerCase() === locations.find(place => place.id === selected)?.label.toLowerCase())?.properties?.shapeName ?? '';

  return <div className={`earth-map-wrap background-${background} ${immersive ? "immersive-map" : ""}`}><div ref={element} className="earth-map" aria-label="Earth atlas. Use prepared-place or district controls for keyboard location selection; select map coordinates with a pointer." />
    <div className="map-background-controls" aria-label="Map background"><span><Layers3 size={13} /> BACKGROUND</span><button aria-pressed={background === 'atlas'} onClick={() => setBackground('atlas')}><Map size={14} /> Atlas</button><button aria-pressed={background === 'satellite'} onClick={() => { setTileError(''); setBackground('satellite'); }}><Satellite size={14} /> Satellite</button></div>
    {immersive && <button className="map-fit-bangladesh" aria-label="Frame Bangladesh on the map" onClick={() => {
      const instance = map.current;
      if (!instance) return;
      const width = instance.getSize().x;
      instance.flyToBounds([[20.5, 88], [26.8, 92.8]], { paddingTopLeft: width > 1050 ? [280, 50] : width > 700 ? [240, 45] : [20, 45], paddingBottomRight: width > 1050 ? [420, 130] : [20, 140], duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .8 });
    }}><LocateFixed size={19}/></button>}
    {districts.length > 0 && <div className="district-map-selector"><label>District / representative point<select value={districtValue} onChange={event => void chooseDistrict(event.target.value)}><option value="">Choose from {districts.length} districts</option>{districts.map(feature => <option key={feature.properties?.shapeName} value={feature.properties?.shapeName}>{feature.properties?.shapeName}</option>)}</select></label><small>Prepared city point, or boundary-box centre. New points require live data.</small></div>}
    <div className="map-coordinate-caption">{background === 'satellite' ? immersive ? 'BLUE MARBLE / 2004 COMPOSITE / HISTORICAL CONTEXT' : `CONTEXT IMAGE / TERRA MODIS / ${IMAGE_DATE}` : 'LOCAL ATLAS / CONTEXTUAL BOUNDARIES'}<span>MEASUREMENTS ARE POINTS · NO INTERPOLATED RASTER</span></div>
    {(error || tileError) && <div className="map-error" role="status">{error || tileError}</div>}
  </div>;
}
