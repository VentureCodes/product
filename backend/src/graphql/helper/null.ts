/**
 * Remove all null and undefined values from an object
 * @param args
 * @returns
 * @example
 * const args = {
 *  name: 'John',
 *  age: null,
 *  address: {
 *    street: '123 Main St',
 *    city: null,
 *  },
 * }
 * const result = removeEmpty(args)
 * // result = { name: 'John', address: { street: '123 Main St' } }
 */
export const removeEmpty = (args: Record<string, any>): Record<string, any> => {
  let notEmptyArgs = Object.entries(args || {})
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([k, v]) => [k, typeof v === 'object' ? removeEmpty(v) : v])

  return Object.fromEntries(notEmptyArgs)
}
