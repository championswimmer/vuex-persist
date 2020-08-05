import {merge as lodashMerge} from 'lodash'

export function merge(into: any, from: any) {
  return lodashMerge({}, into, from)
}
