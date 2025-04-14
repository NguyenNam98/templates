import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit'
import appReducer from './app/slice'

const combinedReducer = combineReducers({
  appReducer,
})

const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: Action,
) => {
  let newState = state

  if (action.type === 'RESET') {
    newState = undefined
  }

  // @ts-ignore
  return combinedReducer(newState, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
