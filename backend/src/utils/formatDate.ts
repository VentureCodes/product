export const formatDate = (
  isoDate: string,
  timeZone: string = 'EAT',
): string => {
  const date = new Date(isoDate)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }
  return date.toLocaleString('en-US', options)
}
