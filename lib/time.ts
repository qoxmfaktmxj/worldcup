/**
 * KST (Asia/Seoul) time utilities for World Cup kickoff times.
 */

const KST_TIMEZONE = 'Asia/Seoul'

/**
 * Convert a UTC ISO string to a KST label: "M/D 요일 HH:mm"
 * e.g. '2026-06-19T01:00:00Z' → '6/19 금 10:00'
 */
export function toKstLabel(kickoffUtc: string): string {
  const date = new Date(kickoffUtc)

  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIMEZONE,
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''

  const month = get('month')
  const day = get('day')
  let weekday = get('weekday')
  // ko-KR short weekday is '금요일' — trim to single char '금'
  if (weekday.endsWith('요일')) {
    weekday = weekday.replace('요일', '')
  }
  let hour = get('hour')
  const minute = get('minute')

  // Intl may return '24' for midnight in some environments; normalize to '00'
  if (hour === '24') hour = '00'

  return `${month}/${day} ${weekday} ${hour}:${minute}`
}

/**
 * Return the KST calendar date string "YYYY-MM-DD" for a UTC ISO string.
 * e.g. '2026-06-17T17:00:00Z' → '2026-06-18'
 */
export function kstDateKey(kickoffUtc: string): string {
  const date = new Date(kickoffUtc)

  // 'en-CA' locale with numeric parts yields "YYYY-MM-DD" format
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(date)
}
