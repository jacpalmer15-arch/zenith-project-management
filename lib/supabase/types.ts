// This file contains TypeScript types for your Supabase database
// Generate actual types by running:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tables will be auto-generated here
      [key: string]: {
        Row: {}
        Insert: {}
        Update: {}
      }
    }
    Views: {
      [key: string]: {
        Row: {}
      }
    }
    Functions: {
      [key: string]: {
        Args: {}
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: string
    }
  }
}
