import deepmerge, {Options} from 'deepmerge'

export const merge = (dest: any, src: any) =>
  deepmerge(dest, src, {
    arrayMerge: (dest, src) => src
  })

