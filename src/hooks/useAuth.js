import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, signIn, signUp, signOut, onAuthChange } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = onAuthChange((newUser) => {
      setUser(newUser)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    displayName: user?.user_metadata?.full_name ?? user?.email ?? null,

    login: async (email, password) => {
      setLoading(true)
      try { await signIn({ email, password }) }
      finally { setLoading(false) }
    },

    register: async (name, email, password) => {
      setLoading(true)
      try { await signUp({ name, email, password }) }
      finally { setLoading(false) }
    },

    logout: async () => {
      await signOut()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
  return ctx
}
