import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase/client.js'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)

    // Call once at app startup to sync reactive state with the Supabase session
    function init() {
        supabase.auth.getSession().then(({ data }) => {
            user.value = data.session?.user ?? null
        })
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

    return { user, init, signIn, signUp, signInWithGoogle, signOut }
})
