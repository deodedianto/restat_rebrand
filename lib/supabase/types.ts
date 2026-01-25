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
      users: {
        Row: {
          id: string
          name: string
          email: string
          whatsapp: string
          phone: string | null
          referral_code: string | null
          bank_name: string | null
          bank_account_number: string | null
          role: 'user' | 'admin' | 'analyst'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          whatsapp: string
          phone?: string | null
          referral_code?: string | null
          bank_name?: string | null
          bank_account_number?: string | null
          role?: 'user' | 'admin' | 'analyst'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          email?: string
          whatsapp?: string
          phone?: string | null
          referral_code?: string | null
          bank_name?: string | null
          bank_account_number?: string | null
          role?: 'user' | 'admin' | 'analyst'
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: number
          user_id: string
          analyst_id: string | null
          analysis_price_id: string | null
          research_title: string
          research_description: string
          order_date: string
          deadline_date: string
          price: number
          analyst_fee: number | null
          payment_status: string
          work_status: string
          is_record_deleted: boolean
          paid_at: string | null
          referral_code_used: string | null
          discount_referal: number | null
          referral_reward_amount: number | null
          voucher_code: string | null
          discount_voucher: number | null
          metode_analisis: string | null
          jenis_paket: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analyst_id?: string | null
          analysis_price_id?: string | null
          research_title: string
          research_description: string
          order_date?: string
          deadline_date: string
          price: number
          analyst_fee?: number | null
          payment_status?: string
          work_status?: string
          is_record_deleted?: boolean
          paid_at?: string | null
          referral_code_used?: string | null
          discount_referal?: number | null
          referral_reward_amount?: number | null
          voucher_code?: string | null
          discount_voucher?: number | null
          metode_analisis?: string | null
          jenis_paket?: string | null
        }
        Update: {
          analyst_id?: string | null
          analyst_fee?: number | null
          payment_status?: string
          work_status?: string
          is_record_deleted?: boolean
          paid_at?: string | null
          referral_code_used?: string | null
          discount_referal?: number | null
          referral_reward_amount?: number | null
          voucher_code?: string | null
          discount_voucher?: number | null
          metode_analisis?: string | null
          jenis_paket?: string | null
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string
          scheduled_date: string
          scheduled_time: string
          notes: string | null
          status: string
          contact_name: string
          contact_email: string
          is_record_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_date: string
          scheduled_time: string
          notes?: string | null
          status?: string
          contact_name: string
          contact_email: string
          is_record_deleted?: boolean
        }
        Update: {
          status?: string
          is_record_deleted?: boolean
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_user_id: string
          referral_code_used: string
          reward_amount: number
          reward_status: string
          is_reward_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_user_id: string
          referral_code_used: string
          reward_amount: number
          reward_status?: string
          is_reward_paid?: boolean
        }
        Update: {
          reward_status?: string
          is_reward_paid?: boolean
        }
      }
      analysis_prices: {
        Row: {
          id: string
          name: string
          package: string
          price: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      analysts: {
        Row: {
          id: string
          name: string
          whatsapp: string
          bank_name: string
          bank_account_number: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      expenses: {
        Row: {
          id: string
          date: string
          type: string
          name: string
          notes: string | null
          amount: number
          analyst_id: string | null
          user_id: string | null
          order_id: string | null
          referal_id: string | null
          created_at: string
          updated_at: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          rating: number
          comment: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rating: number
          comment: string
          is_published?: boolean
        }
        Update: {
          rating?: number
          comment?: string
          is_published?: boolean
        }
      }
      vouchers: {
        Row: {
          id: string
          voucher_code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_usage: number | null
          current_usage: number
          valid_from: string | null
          valid_until: string | null
          min_order_amount: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          voucher_code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_usage?: number | null
          current_usage?: number
          valid_from?: string | null
          valid_until?: string | null
          min_order_amount?: number | null
          is_active?: boolean
        }
        Update: {
          voucher_code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          max_usage?: number | null
          current_usage?: number
          valid_from?: string | null
          valid_until?: string | null
          min_order_amount?: number | null
          is_active?: boolean
        }
      }
    }
  }
}
