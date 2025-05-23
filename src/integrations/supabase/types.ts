export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          id: string
          invite_code: string | null
          is_active: boolean | null
          level: number | null
          parent_agent_id: string | null
          referral_amount: number | null
          referral_code: string | null
          referral_commission: number | null
          referral_count: number | null
          referral_link: string | null
          total_commission: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          id: string
          invite_code?: string | null
          is_active?: boolean | null
          level?: number | null
          parent_agent_id?: string | null
          referral_amount?: number | null
          referral_code?: string | null
          referral_commission?: number | null
          referral_count?: number | null
          referral_link?: string | null
          total_commission?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          level?: number | null
          parent_agent_id?: string | null
          referral_amount?: number | null
          referral_code?: string | null
          referral_commission?: number | null
          referral_count?: number | null
          referral_link?: string | null
          total_commission?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_commissions: {
        Row: {
          agent_id: string | null
          amount: number | null
          commission_amount: number | null
          created_at: string | null
          id: string
          order_id: string | null
        }
        Insert: {
          agent_id?: string | null
          amount?: number | null
          commission_amount?: number | null
          created_at?: string | null
          id: string
          order_id?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number | null
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "recharge_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_referrals: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_referrals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_relations: {
        Row: {
          ancestor_id: string
          descendant_id: string
          level: number | null
        }
        Insert: {
          ancestor_id: string
          descendant_id: string
          level?: number | null
        }
        Update: {
          ancestor_id?: string
          descendant_id?: string
          level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_relations_ancestor_id_fkey"
            columns: ["ancestor_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_relations_descendant_id_fkey"
            columns: ["descendant_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_transactions: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string | null
          id: string
          status: string | null
          type: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          status?: string | null
          type: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_line_count: number | null
          balance: number
          commission_rate: number
          completed_orders_count: number | null
          created_at: string
          email: string
          id: string
          is_online: boolean | null
          name: string
          parent_agent_id: string | null
          password: string | null
          phone: string | null
          processing_orders_count: number | null
          referral_amount: number | null
          referral_code: string | null
          referral_commission: number | null
          referral_count: number | null
          referral_link: string | null
          status: string
          today_orders_amount: number | null
          total_commission: number
          updated_at: string
        }
        Insert: {
          agent_line_count?: number | null
          balance?: number
          commission_rate?: number
          completed_orders_count?: number | null
          created_at?: string
          email: string
          id?: string
          is_online?: boolean | null
          name: string
          parent_agent_id?: string | null
          password?: string | null
          phone?: string | null
          processing_orders_count?: number | null
          referral_amount?: number | null
          referral_code?: string | null
          referral_commission?: number | null
          referral_count?: number | null
          referral_link?: string | null
          status?: string
          today_orders_amount?: number | null
          total_commission?: number
          updated_at?: string
        }
        Update: {
          agent_line_count?: number | null
          balance?: number
          commission_rate?: number
          completed_orders_count?: number | null
          created_at?: string
          email?: string
          id?: string
          is_online?: boolean | null
          name?: string
          parent_agent_id?: string | null
          password?: string | null
          phone?: string | null
          processing_orders_count?: number | null
          referral_amount?: number | null
          referral_code?: string | null
          referral_commission?: number | null
          referral_count?: number | null
          referral_link?: string | null
          status?: string
          today_orders_amount?: number | null
          total_commission?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_parent_agent_id_fkey1"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_order_status_history: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          new_status: string
          note: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "channel_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_orders: {
        Row: {
          amount: number
          channel_id: string
          created_at: string | null
          id: string
          note: string | null
          order_no: string
          status: string
          type: string | null
          updated_at: string | null
          usdt_amount: number
          user_id: string
        }
        Insert: {
          amount: number
          channel_id: string
          created_at?: string | null
          id?: string
          note?: string | null
          order_no: string
          status?: string
          type?: string | null
          updated_at?: string | null
          usdt_amount: number
          user_id: string
        }
        Update: {
          amount?: number
          channel_id?: string
          created_at?: string | null
          id?: string
          note?: string | null
          order_no?: string
          status?: string
          type?: string | null
          updated_at?: string | null
          usdt_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_orders_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "payment_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_service_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sent_by_user: boolean | null
          telegram_message_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sent_by_user?: boolean | null
          telegram_message_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sent_by_user?: boolean | null
          telegram_message_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_service_notices: {
        Row: {
          content: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      merchant_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          key_prefix: string
          key_suffix: string
          last_used: string | null
          merchant_id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_prefix: string
          key_suffix: string
          last_used?: string | null
          merchant_id: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_prefix?: string
          key_suffix?: string
          last_used?: string | null
          merchant_id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merchant_applications: {
        Row: {
          business_license: string
          company_name: string
          contact_name: string
          created_at: string | null
          id: string
          id_card_back: string
          id_card_front: string
          notes: string | null
          phone: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_license: string
          company_name: string
          contact_name: string
          created_at?: string | null
          id?: string
          id_card_back: string
          id_card_front: string
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_license?: string
          company_name?: string
          contact_name?: string
          created_at?: string | null
          id?: string
          id_card_back?: string
          id_card_front?: string
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      merchant_balance_history: {
        Row: {
          amount: number
          balance: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          merchant_id: string
          transaction_id: string | null
          type: string
        }
        Insert: {
          amount: number
          balance: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          merchant_id: string
          transaction_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          balance?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          merchant_id?: string
          transaction_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_balance_history_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_balance_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "user_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_profiles: {
        Row: {
          account_balance: number | null
          commission: Json | null
          created_at: string | null
          freeze_balance: number | null
          id: string
          ip: string | null
          nickname: string | null
          phone: string | null
          status: boolean | null
          team_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_balance?: number | null
          commission?: Json | null
          created_at?: string | null
          freeze_balance?: number | null
          id?: string
          ip?: string | null
          nickname?: string | null
          phone?: string | null
          status?: boolean | null
          team_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_balance?: number | null
          commission?: Json | null
          created_at?: string | null
          freeze_balance?: number | null
          id?: string
          ip?: string | null
          nickname?: string | null
          phone?: string | null
          status?: boolean | null
          team_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      merchant_settings: {
        Row: {
          commission_rates: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          commission_rates?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          commission_rates?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      new_orders: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          merchant_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          merchant_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          merchant_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "new_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_logs: {
        Row: {
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          operation: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          operation: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          operation?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          name: string | null
          phone_number: string | null
          status: string | null
          type: string
          updated_at: string | null
          usdt_amount: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          usdt_amount: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          usdt_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      payment_channels: {
        Row: {
          code: string
          created_at: string | null
          exchange_rate: number
          fee_rate: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          exchange_rate?: number
          fee_rate?: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          exchange_rate?: number
          fee_rate?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_payment_addresses: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_active: boolean | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recharge_order_submissions: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          attachments: string[] | null
          bank_branch: string | null
          bank_name: string | null
          contact_email: string | null
          contact_phone: string
          created_at: string | null
          id: string
          order_id: string
          purpose: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          attachments?: string[] | null
          bank_branch?: string | null
          bank_name?: string | null
          contact_email?: string | null
          contact_phone: string
          created_at?: string | null
          id?: string
          order_id: string
          purpose?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          attachments?: string[] | null
          bank_branch?: string | null
          bank_name?: string | null
          contact_email?: string | null
          contact_phone?: string
          created_at?: string | null
          id?: string
          order_id?: string
          purpose?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recharge_order_submissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      recharge_orders: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_no: string
          payment_address: string | null
          payment_method: string
          status: string
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_no: string
          payment_address?: string | null
          payment_method: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_no?: string
          payment_address?: string | null
          payment_method?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      service_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stats_business: {
        Row: {
          cancelled_orders: number | null
          completed_orders: number | null
          created_at: string | null
          date: string
          id: string
          pending_orders: number | null
          total_amount: number | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          cancelled_orders?: number | null
          completed_orders?: number | null
          created_at?: string | null
          date: string
          id?: string
          pending_orders?: number | null
          total_amount?: number | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          cancelled_orders?: number | null
          completed_orders?: number | null
          created_at?: string | null
          date?: string
          id?: string
          pending_orders?: number | null
          total_amount?: number | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stats_financial: {
        Row: {
          created_at: string | null
          date: string
          id: string
          total_commission: number | null
          total_profit: number | null
          total_recharge: number | null
          total_withdrawal: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          total_commission?: number | null
          total_profit?: number | null
          total_recharge?: number | null
          total_withdrawal?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          total_commission?: number | null
          total_profit?: number | null
          total_recharge?: number | null
          total_withdrawal?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stats_pending_items: {
        Row: {
          created_at: string | null
          date: string
          id: string
          pending_merchant_applications: number | null
          pending_orders: number | null
          pending_recharges: number | null
          pending_withdrawals: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          pending_merchant_applications?: number | null
          pending_orders?: number | null
          pending_recharges?: number | null
          pending_withdrawals?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          pending_merchant_applications?: number | null
          pending_orders?: number | null
          pending_recharges?: number | null
          pending_withdrawals?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stats_user: {
        Row: {
          active_merchants: number | null
          active_users: number | null
          created_at: string | null
          date: string
          id: string
          new_merchants: number | null
          new_users: number | null
          total_merchants: number | null
          total_users: number | null
          updated_at: string | null
        }
        Insert: {
          active_merchants?: number | null
          active_users?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_merchants?: number | null
          new_users?: number | null
          total_merchants?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Update: {
          active_merchants?: number | null
          active_users?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_merchants?: number | null
          new_users?: number | null
          total_merchants?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_payments: {
        Row: {
          account_name: string
          account_number: string
          bank_branch: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          qr_code_image: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          qr_code_image?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          qr_code_image?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string | null
          freeze_balance: number | null
          id: string
          is_merchant: boolean | null
          merchant_id: string | null
          nickname: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          freeze_balance?: number | null
          id?: string
          is_merchant?: boolean | null
          merchant_id?: string | null
          nickname?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          freeze_balance?: number | null
          id?: string
          is_merchant?: boolean | null
          merchant_id?: string | null
          nickname?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profiles_merchant_id"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profiles_referred_by"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          fee: number | null
          id: string
          reference_id: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          fee?: number | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          fee?: number | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
