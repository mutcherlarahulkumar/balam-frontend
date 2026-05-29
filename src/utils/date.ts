import { format, parseISO, differenceInDays, isValid } from 'date-fns';

export function formatDate(date: string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!date) return '—';
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? format(parsed, fmt) : '—';
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | null | undefined): string {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
}

export function daysFromNow(date: string | null | undefined): number {
  if (!date) return 0;
  try {
    return differenceInDays(parseISO(date), new Date());
  } catch {
    return 0;
  }
}

export function toInputDate(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return format(parseISO(date), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}
