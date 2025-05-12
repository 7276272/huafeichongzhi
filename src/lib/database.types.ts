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
      accounting_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          start_time: string
          end_time: string | null
          status: 'open' | 'closed' | null
          opened_by: string | null
          closed_by: string | null
          group_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          start_time: string
          end_time?: string | null
          status?: 'open' | 'closed' | null
          opened_by?: string | null
          closed_by?: string | null
          group_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          start_time?: string
          end_time?: string | null
          status?: 'open' | 'closed' | null
          opened_by?: string | null
          closed_by?: string | null
          group_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          is_admin: boolean
          admin_permissions: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          is_admin?: boolean
          admin_permissions?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          is_admin?: boolean
          admin_permissions?: string[] | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          status: 'active' | 'inactive'
          referral_code: string | null
          referral_link: string | null
          referral_count: number | null
          referral_amount: number | null
          parent_agent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          status?: 'active' | 'inactive'
          referral_code?: string | null
          referral_link?: string | null
          referral_count?: number | null
          referral_amount?: number | null
          parent_agent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          status?: 'active' | 'inactive'
          referral_code?: string | null
          referral_link?: string | null
          referral_count?: number | null
          referral_amount?: number | null
          parent_agent_id?: string | null
        }
        Relationships: []
      }
      agent_referrals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          agent_id: string
          referred_user_id: string
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id: string
          referred_user_id: string
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id?: string
          referred_user_id?: string
          status?: 'active' | 'inactive'
        }
        Relationships: []
      }
      agent_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          agent_id: string
          amount: number
          type: 'commission' | 'withdrawal'
          status: 'pending' | 'completed' | 'rejected'
          reference_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id: string
          amount: number
          type: 'commission' | 'withdrawal'
          status?: 'pending' | 'completed' | 'rejected'
          reference_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id?: string
          amount?: number
          type?: 'commission' | 'withdrawal'
          status?: 'pending' | 'completed' | 'rejected'
          reference_id?: string | null
          description?: string | null
        }
        Relationships: []
      }
      recharge_orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          amount: number
          status: 'pending' | 'completed' | 'rejected'
          payment_method: string | null
          payment_reference: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          amount: number
          status?: 'pending' | 'completed' | 'rejected'
          payment_method?: string | null
          payment_reference?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'completed' | 'rejected'
          payment_method?: string | null
          payment_reference?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          email: string | null
          phone: string | null
          balance: number
          referred_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          balance?: number
          referred_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          balance?: number
          referred_by?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          amount: number
          type: 'deposit' | 'withdrawal' | 'commission' | 'bonus'
          status: 'pending' | 'completed' | 'rejected'
          reference_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          amount: number
          type: 'deposit' | 'withdrawal' | 'commission' | 'bonus'
          status?: 'pending' | 'completed' | 'rejected'
          reference_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          amount?: number
          type?: 'deposit' | 'withdrawal' | 'commission' | 'bonus'
          status?: 'pending' | 'completed' | 'rejected'
          reference_id?: string | null
          description?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
