import lodashMerge from 'lodash.merge'

export function merge(into: any, from: any) {
  return lodashMerge(into, from)
}
