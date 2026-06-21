import type { CatalogEntry } from '@/lib/types';

export const junkCatalog: CatalogEntry[] = [
  { name: 'COSMOS 1408 fragment', year: '1982', flag: 'USSR' },
  { name: 'FENGYUN-1C fragment', year: '1999', flag: 'CHN' },
  { name: 'LONG MARCH 3B R/B', year: '1996', flag: 'CHN' },
  { name: 'IRIDIUM 33 debris', year: '1997', flag: 'USA' },
  { name: 'SL-16 R/B', year: '1991', flag: 'USSR' },
  { name: 'COSMOS 2251 fragment', year: '1993', flag: 'RUS' },
  { name: 'ENVISAT', year: '2002', flag: 'ESA' },
  { name: 'BREEZE-M tank', year: '2006', flag: 'RUS' },
  { name: 'SL-8 R/B', year: '1988', flag: 'USSR' },
  { name: 'ZENIT-2 fragment', year: '1995', flag: 'RUS' },
  { name: 'ARIANE 5 stage', year: '2003', flag: 'ESA' },
  { name: 'LONG MARCH 6A frag', year: '2024', flag: 'CHN' },
  { name: 'INTELSAT 33e frag', year: '2024', flag: 'USA' },
];

export const activeCatalog: string[] = [
  'STARLINK-30421',
  'STARLINK-29055',
  'KUIPER-178',
  'KUIPER-204',
  'ONEWEB-642',
  'QIANFAN-44',
  'GUOWANG-12',
  'ONEWEB-518',
];

export const rareCatalog: CatalogEntry[] = [
  { name: "VANGUARD 1", year: '1958', flag: 'USA' },
  { name: "ED WHITE's glove", year: '1965', flag: 'USA' },
  { name: "COLLINS' camera", year: '1966', flag: 'USA' },
  { name: 'WEST FORD needle', year: '1963', flag: 'USA' },
  { name: 'EXPLORER 1 stage', year: '1958', flag: 'USA' },
  { name: 'SPUTNIK 4 fragment', year: '1960', flag: 'USSR' },
];

export const l3FragmentLabel: CatalogEntry = {
  name: 'FY-1C fragment',
  year: '2007',
  flag: 'CHN',
};

export const l4CollisionFragment: CatalogEntry = {
  name: 'IRIDIUM/COSMOS fragment',
  year: '2009',
  flag: 'USA/RUS',
};
