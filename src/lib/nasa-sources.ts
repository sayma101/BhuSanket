import registry from '@/data/nasa-sources.json';
export type SourceRecord=typeof registry.sources[number];
export const NASA_SOURCES=registry.sources;
export const SOURCE_STATUS:Record<string,string>={LIVE_INTEGRATED:'Integrated · cached NASA / optional live retrieval',CONTEXTUAL_IMAGERY:'Contextual imagery / education',PLANNED_NOT_INTEGRATED:'Planned · not integrated',DOCUMENTATION_ONLY:'Documentation only'};
export function sourceRecord(id:string){const value=NASA_SOURCES.find(source=>source.id===id);if(!value)throw Error(`Unknown source: ${id}`);return value;}
export function sourceUrl(id:string,role:'documentation_url'|'data_access_url'='documentation_url'){return sourceRecord(id)[role];}
export const sourceTemplates=registry.templates;
export const DATASET_SOURCE_IDS:Record<string,string>={POWER_DAILY:'power',GPM_3IMERGDF:'imerg','MOD11A2.061':'mod11','MOD13Q1.061':'mod13',VIIRS:'viirs',SMAP:'smap',GRACE:'grace',MERRA2:'merra2',GLDAS:'gldas',AIRS:'airs',OMI:'omi'};
