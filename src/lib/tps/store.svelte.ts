import { getContext, setContext } from "svelte"
import { browser } from "$app/environment"
import type { AppState, AppAction } from "./types"
import { appReducer } from "./reducer"
import { createInitialState } from "./seed-data"

const STORAGE_KEY = "tps-erp-state"
// Version del esquema de datos - incrementar cuando cambie la estructura
const DATA_VERSION = 5 // v5: LMAT 2.0 - specifications, ecns, supplyKits, cuttingKits

function loadState(): AppState | null {
  if (!browser) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)

    // Verificar si algun BOM tiene componentes sin el campo 'parentId'
    const hasOutdatedBOMs = parsed.boms?.some((bom: { components?: { parentId?: unknown }[] }) =>
      bom.components?.some((comp: { parentId?: unknown }) => comp.parentId === undefined)
    )

    // Verificar si tiene los arrays de LMAT 2.0
    const missingLMAT2 = !parsed.specifications || !parsed.ecns || !parsed.supplyKits

    if (hasOutdatedBOMs || missingLMAT2 || parsed._dataVersion !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsed as AppState
  } catch {
    return null
  }
}

function saveState(state: AppState) {
  if (!browser) return
  try {
    const stateWithVersion = { ...state, _dataVersion: DATA_VERSION }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithVersion))
  } catch {
    // storage full or unavailable
  }
}

export class TpsStore {
  state = $state<AppState>(createInitialState())

  constructor() {
    const saved = loadState()
    if (saved) this.state = saved
  }

  dispatch = (action: AppAction) => {
    this.state = appReducer(this.state, action)
    saveState(this.state)
  }

  resetData = () => {
    if (browser) localStorage.removeItem(STORAGE_KEY)
    this.state = createInitialState()
    saveState(this.state)
  }
}

const STORE_KEY = Symbol("tps-store")

export function setTpsStore(): TpsStore {
  const store = new TpsStore()
  setContext(STORE_KEY, store)
  return store
}

export function useStore(): TpsStore {
  const store = getContext<TpsStore>(STORE_KEY)
  if (!store) throw new Error("useStore must be used within a TPS layout that calls setTpsStore()")
  return store
}
