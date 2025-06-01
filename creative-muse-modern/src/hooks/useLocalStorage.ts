'use client'

import { useState, useEffect } from 'react'
import { type Idea } from '@/lib/api'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Stato per memorizzare il valore
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Funzione per leggere dal localStorage
  const getValue = (): T => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // Funzione per scrivere nel localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permette di passare una funzione come valore
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Salva nello stato
      setStoredValue(valueToStore)
      
      // Salva nel localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Carica il valore iniziale dal localStorage
  useEffect(() => {
    const value = getValue()
    setStoredValue(value)
  }, [])

  return [storedValue, setValue] as const
}

// Hook specifico per le idee
export function useIdeasStorage() {
  return useLocalStorage<Idea[]>('creativeMuseIdeas', [])
}

// Hook per le preferenze dell'app
export function useAppPreferences() {
  return useLocalStorage('creativeMusePreferences', {
    autoSave: true,
    showNotifications: true,
    defaultCategory: 'general'
  })
}