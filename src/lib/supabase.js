import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gyamnnubkxlddbctvbxk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YW1ubnVia3hsZGRiY3R2YnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk1NjYsImV4cCI6MjA4ODI0NTU2Nn0.SCiVnDTAkgkuF6cYe8tG9FzeLuYdWfGj0D38gyKSnac"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)