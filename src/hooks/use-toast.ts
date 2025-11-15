"use client"

// Inspirado en la librería react-hot-toast, este hook implementa un sistema de notificaciones (toasts) personalizado.
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1; // Número máximo de notificaciones visibles a la vez.
const TOAST_REMOVE_DELAY = 10000; // Tiempo en ms antes de que una notificación se elimine del DOM después de cerrarse.

/**
 * Tipo que representa una notificación (toast) dentro del sistema, extendiendo las props del componente UI.
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/**
 * Tipos de acciones que se pueden despachar para manipular el estado de las notificaciones.
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

/**
 * Genera un ID único y secuencial para cada notificación.
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

/**
 * Define las acciones que pueden ser despachadas al reducer de notificaciones.
 */
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

/**
 * El estado global que contiene la lista de notificaciones activas.
 */
interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Añade una notificación a una cola de eliminación para que desaparezca de la UI después de un retardo.
 * Esto permite que las animaciones de salida se completen antes de eliminar el elemento del DOM.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer que gestiona las actualizaciones de estado de las notificaciones basándose en las acciones despachadas.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Añade una nueva notificación al principio del array y limita el número total de notificaciones visibles.
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Actualiza una notificación existente por su ID.
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      // Cierra una notificación (la pone en estado `open: false`) y la añade a la cola de eliminación.
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // Si no se proporciona un ID, cierra todas las notificaciones.
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // Elimina una notificación del estado, quitándola completamente del DOM.
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

/**
 * Despacha una acción para actualizar el estado de las notificaciones y notifica a todos los listeners (componentes `useToast`).
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

/**
 * Función principal para crear y mostrar una nueva notificación.
 * @param {Toast} props - Las propiedades de la notificación (título, descripción, etc.).
 * @returns Un objeto con el ID de la notificación y funciones para `update` o `dismiss` (cerrar).
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Hook `useToast` para acceder al estado de las notificaciones y a las funciones `toast` y `dismiss`.
 * Permite a los componentes suscribirse a los cambios en las notificaciones y despachar nuevas.
 * @returns Un objeto con la lista de notificaciones (`toasts`), la función `toast` y la función `dismiss`.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
