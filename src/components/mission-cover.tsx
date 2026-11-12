import Image from 'next/image';

const covers: Record<string, { image: string; caption: string; alt: string; contain?: boolean }> = {
  dhaka: { image: '/images/dhaka-landsat-2022.jpg', caption: 'DHAKA / LANDSAT 8 OLI / 20 MAR 2022', alt: 'Historical Landsat view of Dhaka and its surrounding rivers' },
  khulna: { image: '/images/sundarbans-landsat-2000.jpg', caption: 'SUNDARBANS / LANDSAT 7 / 1999–2000 COMPOSITE', alt: 'Historical Landsat composite of the Sundarbans near the Khulna region' },
  sylhet: { image: '/images/sylhet-modis-2007.jpg', caption: 'SYLHET REGION / MODIS / MAY–JUN 2007 / FALSE COLOUR', alt: 'Paired MODIS comparison of northeastern Bangladesh in May and June 2007, in false colour', contain: true },
};
export function MissionCover({ location }: { location: string }) {
  const cover = covers[location] ?? { image: '/images/ganges-delta-2000.jpg', caption: 'REGIONAL CONTEXT / BENGAL DELTA / MODIS / 28 DEC 2000', alt: 'Regional Bengal delta context; this is not a local measurement of the mission location' };
  return <figure className={`mission-cover ${cover.contain ? 'mission-cover-paired' : ''}`}><Image src={cover.image} alt={cover.alt} fill sizes="(max-width:700px) 90vw, (max-width:1200px) 45vw, 30vw" /><figcaption>{cover.caption}<span>HISTORICAL CONTEXT · NOT THE MEASUREMENT RECORD</span></figcaption></figure>;
}
