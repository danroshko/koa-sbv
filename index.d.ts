export function middleware(ctx: any, next: () => Promise<void>): Promise<void>

export function validate(data: any, spec: any, options?: IValidateOptions, name?: string): any

interface IValidateOptions {
  notStrict?: boolean
  parseNumbers?: boolean
  makeArrays?: boolean
}

export function maybe(value: any, defaultValue?: any): Maybe

declare class Maybe {
  constructor(value: any, defaultValue?: any)
}

export function nullable(value: any): Nullable

declare class Nullable {
  constructor(value: any)
}

export function dict(keys: any, values: any): Dict

declare class Dict {
  constructor(keys: any, values: any)
}

export function assert(value: any, msg: string): void

export function define(name: string, func: ValidatorFunction): void

type ValidatorFunction = (val: any, name: string) => any

export function oneOf(...values: any[]): SbvEnum
export function string(options: ITypeOptions): SbvType
export function number(options: ITypeOptions): SbvType
export function int(options: ITypeOptions): SbvType

declare class SbvType {
  constructor(options: ITypeOptions)

  validate(data: any, name: string): any
}

declare class SbvEnum extends SbvType {
  constructor(...values: any[])
}

interface ITypeOptions {
  min?: number
  max?: number
}
