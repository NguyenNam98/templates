import { createSlice } from '@reduxjs/toolkit'
export interface TAppSlice {
  app: undefined
  isLoading: boolean
}

export const initialState: TAppSlice = {
  app: undefined,
  isLoading: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
})

export default appSlice.reducer
