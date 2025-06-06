export const calculateMatureDate = (
  period: 'Monthly' | 'Weekly' | 'Quarterly' | 'Yearly' | 'HalfYear',
) => {
  const currentDate = new Date()
  let endDate: Date

  switch (period) {
    case 'Weekly':
      endDate = new Date(currentDate)
      endDate.setDate(currentDate.getDate() + 7)
      break
    case 'Monthly':
      endDate = new Date(currentDate)
      endDate.setMonth(currentDate.getMonth() + 1)
      break
    case 'Quarterly':
      endDate = new Date(currentDate)
      endDate.setMonth(currentDate.getMonth() + 3)
      break
    case 'HalfYear':
      endDate = new Date(currentDate)
      endDate.setMonth(currentDate.getMonth() + 6)
      break
    case 'Yearly':
      endDate = new Date(currentDate)
      endDate.setFullYear(currentDate.getFullYear() + 1)
      break
    default:
      throw new Error('Invalid period')
  }
  return endDate
  // const durationInMilliseconds = endDate.getTime() - currentDate.getTime()
  //   const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24)
  // return Math.round(durationInDays)
}
