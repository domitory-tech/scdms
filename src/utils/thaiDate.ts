/**
 * Thai Date & Time formatting utilities
 * Formats dates in Thai Buddhist Era (พ.ศ.)
 */

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_DAYS = [
  'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
];

export function toThaiYear(gregorianYear: number): number {
  return gregorianYear > 2400 ? gregorianYear : gregorianYear + 543;
}

export function toGregorianYear(thaiYear: number): number {
  return thaiYear > 2400 ? thaiYear - 543 : thaiYear;
}

export function formatThaiDate(
  dateInput: string | number | Date | null | undefined,
  format: 'full' | 'medium' | 'short' | 'time' | 'full-with-time' = 'medium'
): string {
  if (!dateInput) return '-';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const dayOfWeek = THAI_DAYS[date.getDay()];

  switch (format) {
    case 'full':
      return `วัน${dayOfWeek}ที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${year}`;
    case 'full-with-time':
      return `${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${year} เวลา ${hours}:${minutes} น.`;
    case 'medium':
      return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${year}`;
    case 'short':
      return `${day.toString().padStart(2, '0')}/${(monthIdx + 1).toString().padStart(2, '0')}/${year}`;
    case 'time':
      return `${hours}:${minutes} น.`;
    default:
      return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${year}`;
  }
}

export function getCurrentThaiAcademicYear(): number {
  const now = new Date();
  const gregorianYear = now.getFullYear();
  // Thai academic year usually starts around May (month 4 in 0-indexed)
  // If before May, it's considered previous academic year
  const month = now.getMonth();
  let academicYearGregorian = gregorianYear;
  if (month < 4) {
    academicYearGregorian -= 1;
  }
  return academicYearGregorian + 543;
}
