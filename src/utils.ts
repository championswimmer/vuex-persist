import deepmerge from 'deepmerge'

export type MergeOptionType = 'replaceArrays' | 'concatArrays'

const options: {[k in MergeOptionType]: deepmerge.Options} = {
  replaceArrays: {
    arrayMerge: (destinationArray, sourceArray, options) => sourceArray
  },
  concatArrays: {
    arrayMerge: (target, source, options) => target.concat(...source)
  }
}

const defaultMergeOptions: deepmerge.Options = {
  // replacing arrays
  
}

export function merge<I, F>(into: Partial<I>, from: Partial<F>, mergeOption: MergeOptionType): I & F & {} {
  return deepmerge(into, from, options[mergeOption])
}
