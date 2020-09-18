import deepmerge from 'deepmerge'

const mergeOptions: deepmerge.Options = {
  // replacing arrays
  arrayMerge: (destinationArray, sourceArray, options) => sourceArray
}

export function merge<I, F>(into: Partial<I>, from: Partial<F>): I & F & {} {
  return deepmerge(into, from)
}
