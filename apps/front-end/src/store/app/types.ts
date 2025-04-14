import { RootState } from '..'

type ThunkPayload<T> = {
  message?: string
  data: T
  error?: string
}

type ThunkState = {
  state: RootState
}

type Metadata = {
  title: string
  description: string
}

export type { ThunkPayload, ThunkState, Metadata }
