import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase/client.js'
import { useConnectionStore } from './connection.js'
import { isNetworkError } from '../net/network-error.js'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)

    // Reads the current session into reactive state. Also used as a recovery
    // task by the connection store once the backend is reachable again.
    async function syncSession() {
        try {
            const { data } = await supabase.auth.getSession()
            user.value = data.session?.user ?? null
            useConnectionStore().reportOnline()
        } catch (err) {
            if (isNetworkError(err)) useConnectionStore().reportOffline()
            else console.error(err)
        }
    }

    // Call once at app startup to sync reactive state with the Supabase session
    function init() {
        void syncSession()
        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user ?? null
        })
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    }

    async function signUp(email: string, password: string) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
    }

    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
        if (error) throw error
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    return { user, init, syncSession, signIn, signUp, signInWithGoogle, signOut }
})
