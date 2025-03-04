/// <reference types="electron-vite/node" />
import {EditorStore} from './editor/store'
import {BaseRange, BaseSelection} from 'slate'

export interface IFileItem {
  id: string
  filePath: string
  ext?: string
  filename: string
  folder: boolean
  parent?: IFileItem
  children?: IFileItem[]
  expand?: boolean
  root?: boolean
  editName?: string
  independent?: boolean
  mode?: 'edit' | 'create' | 'copy'
  copyItem?: IFileItem
  changed?: boolean
  refresh?: boolean
  schema?: any[]
  history?: any
  sel?: BaseSelection
  hidden?: boolean
}

export interface Tab {
  get current(): IFileItem | undefined
  history: IFileItem[]
  index: number
  hasNext: boolean
  hasPrev: boolean
  range?: Range
  store: EditorStore
  id: string
}

export type GetFields<T extends object> = {
  [P in keyof T]: T[P] extends Function ? never : P
}[keyof T]
