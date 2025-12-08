import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, type AuthUser } from '../config/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('[auth] Loading profile for', authUser.email)

      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      let profile = profileData

      if (error) {
        console.log('[auth] Profile not found, creating:', error.message)

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
            user_type: authUser.email === 'portobellofilmes@gmail.com' ? 'producer' : 'producer',
            company: authUser.user_metadata?.company || '',
            phone: authUser.user_metadata?.phone || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('[auth] Error creating profile:', createError)
        } else {
          console.log('[auth] Profile created:', newProfile)
          profile = newProfile
        }
      }

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        profile: profile || undefined
      }

      setUser(userData)
      return userData
    } catch (error) {
      console.error('[auth] Error loading profile:', error)
      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email!
      }
      setUser(userData)
      return userData
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (error || !authUser) {
        console.log('[auth] No authenticated user')
        setUser(null)
        return
      }
      await loadUserProfile(authUser)
    } catch (error) {
      console.error('[auth] Error refreshing user:', error)
      setUser(null)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[auth] Initializing auth...')
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error || !authUser) {
          console.log('[auth] No logged user')
          setUser(null)
        } else {
          console.log('[auth] User found:', authUser.email)
          await loadUserProfile(authUser)
        }
      } catch (error) {
        console.error('[auth] Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[auth] Auth state changed:', event, session?.user?.email)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[auth] User logged in:', session.user.email)
          await loadUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('[auth] User logged out')
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('[auth] Token refreshed for:', session.user.email)
          await loadUserProfile(session.user)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      console.log('[auth] Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[auth] Error signing out:', error)
      } else {
        console.log('[auth] Sign-out successful')
      }
      setUser(null)
    } catch (error) {
      console.error('[auth] Error signing out:', error)
    }
  }

  const value = {
    user,
    loading,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
