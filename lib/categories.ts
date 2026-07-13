export const MASTER_CATEGORY_NAMES = [
  'Buku Datun',
  'Materi Paparan Jamdatun',
  'Peraturan',
  'Pengetahuan penunjang',
  'Berkas perkara lengkap',
  'LO kebijakan dan legislasi',
  'LO korporasi',
  'LO litigasi',
  'LO pengadaan - pbj',
  'LO perjanjian',
  'Materi pelatihan',
  'Perjanjian kerja sama',
  'Laporan perkembangan THL',
  'Materi Rakernas',
] as const;

export type MasterCategoryName = (typeof MASTER_CATEGORY_NAMES)[number];

export function isMasterCategoryName(value: string | null | undefined): value is MasterCategoryName {
  return MASTER_CATEGORY_NAMES.some((category) => category === value);
}
