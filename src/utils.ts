import deepmerge from 'deepmerge'

export type MergeOptionType = 'replaceArrays' | 'concatArrays' | deepmerge.Options

export const replaceArrays = (destinationArray: any[], sourceArray: any[], options:deepmerge.Options) => sourceArray
export const concatArrays = (target: any[], source: any[], options:deepmerge.Options) => target.concat(...source)

const stringOptions = {
  replaceArrays: {
    arrayMerge: replaceArrays
  },
  concatArrays: {
    arrayMerge: concatArrays
  }
}

export function merge<I, F>(into: Partial<I>, from: Partial<F>, mergeOption: MergeOptionType): I & F & {} {
  if (typeof mergeOption == 'string') {
      return deepmerge(into, from, stringOptions[mergeOption])
  } else {
      return deepmerge(into, from, mergeOption)
  }
}
