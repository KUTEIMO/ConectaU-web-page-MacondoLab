export const DEFAULT_CITY = 'Cúcuta, Norte de Santander, Colombia';

export const VALID_UNIVERSITIES = ['UNISIMON', 'UFPS', 'UDES', 'UNIPAMPLONA'] as const;

export const DEFAULT_MODALITIES = ['remote', 'hybrid', 'on-site'] as const;

export const formatSalaryRange = (min?: string, max?: string) => {
  if (!min && !max) return undefined;
  if (min && max) {
    return `${min} - ${max}`;
  }
  return min || max;
};

