export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accidents: {
        Row: {
          company_name: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          driver_name: string | null
          estimated_cost: number | null
          has_insurance: boolean | null
          id: string
          images: string | null
          location: string | null
          notes: string | null
          status: string | null
          third_party: boolean | null
          vehicle_plate: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          driver_name?: string | null
          estimated_cost?: number | null
          has_insurance?: boolean | null
          id?: string
          images?: string | null
          location?: string | null
          notes?: string | null
          status?: string | null
          third_party?: boolean | null
          vehicle_plate?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          driver_name?: string | null
          estimated_cost?: number | null
          has_insurance?: boolean | null
          id?: string
          images?: string | null
          location?: string | null
          notes?: string | null
          status?: string | null
          third_party?: boolean | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          company_name: string
          created_at: string | null
          id: string
          updated_at: string | null
          whatsapp_button_color: string | null
          whatsapp_button_text: string | null
          whatsapp_enabled: boolean | null
          whatsapp_phone: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_phone?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          agreement_amount_before_vat: number | null
          agreement_amount_with_vat: number | null
          agreement_description: string | null
          agreement_serial_number: string | null
          business_id: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          customer_number: string | null
          customer_type: string | null
          email: string | null
          fax: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agreement_amount_before_vat?: number | null
          agreement_amount_with_vat?: number | null
          agreement_description?: string | null
          agreement_serial_number?: string | null
          business_id?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_number?: string | null
          customer_type?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agreement_amount_before_vat?: number | null
          agreement_amount_with_vat?: number | null
          agreement_description?: string | null
          agreement_serial_number?: string | null
          business_id?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_number?: string | null
          customer_type?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_metadata: {
        Row: {
          category: string
          company_name: string | null
          created_at: string | null
          driver_name: string | null
          file_path: string
          id: string
          manufacturer: string | null
          model: string | null
          original_name: string | null
          uploaded_by: string | null
          vehicle_plate: string | null
        }
        Insert: {
          category?: string
          company_name?: string | null
          created_at?: string | null
          driver_name?: string | null
          file_path: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          original_name?: string | null
          uploaded_by?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          category?: string
          company_name?: string | null
          created_at?: string | null
          driver_name?: string | null
          file_path?: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          original_name?: string | null
          uploaded_by?: string | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      driver_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          city: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          license_expiry: string | null
          license_number: string | null
          license_types: string[] | null
          notes: string | null
          phone: string | null
          status: string | null
          street: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          license_types?: string[] | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          license_types?: string[] | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          driver_name: string | null
          id: string
          image_url: string | null
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          odometer: number | null
          vehicle_plate: string | null
          vendor: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          driver_name?: string | null
          id?: string
          image_url?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          odometer?: number | null
          vehicle_plate?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          driver_name?: string | null
          id?: string
          image_url?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          odometer?: number | null
          vehicle_plate?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      fault_messages: {
        Row: {
          company_name: string | null
          created_at: string
          fault_id: string
          id: string
          message: string
          user_id: string
          user_name: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          fault_id: string
          id?: string
          message?: string
          user_id: string
          user_name?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          fault_id?: string
          id?: string
          message?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fault_messages_fault_id_fkey"
            columns: ["fault_id"]
            isOneToOne: false
            referencedRelation: "faults"
            referencedColumns: ["id"]
          },
        ]
      }
      fault_referrals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string | null
          company_name: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          fault_id: string
          id: string
          notes: string | null
          provider_name: string
          provider_phone: string | null
          provider_type: string | null
          requested_by: string | null
          requested_by_name: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          company_name?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          fault_id: string
          id?: string
          notes?: string | null
          provider_name?: string
          provider_phone?: string | null
          provider_type?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          company_name?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          fault_id?: string
          id?: string
          notes?: string | null
          provider_name?: string
          provider_phone?: string | null
          provider_type?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fault_referrals_fault_id_fkey"
            columns: ["fault_id"]
            isOneToOne: false
            referencedRelation: "faults"
            referencedColumns: ["id"]
          },
        ]
      }
      fault_status_log: {
        Row: {
          changed_by: string | null
          changed_by_name: string | null
          company_name: string | null
          created_at: string
          fault_id: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_name?: string | null
          company_name?: string | null
          created_at?: string
          fault_id: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          changed_by?: string | null
          changed_by_name?: string | null
          company_name?: string | null
          created_at?: string
          fault_id?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fault_status_log_fault_id_fkey"
            columns: ["fault_id"]
            isOneToOne: false
            referencedRelation: "faults"
            referencedColumns: ["id"]
          },
        ]
      }
      faults: {
        Row: {
          company_name: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          driver_name: string | null
          fault_type: string | null
          id: string
          images: string | null
          notes: string | null
          serial_id: string | null
          status: string | null
          towing_approved: boolean | null
          towing_approved_at: string | null
          towing_approved_by: string | null
          towing_completed: boolean | null
          towing_completed_at: string | null
          towing_required: boolean | null
          urgency: string | null
          vehicle_plate: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          driver_name?: string | null
          fault_type?: string | null
          id?: string
          images?: string | null
          notes?: string | null
          serial_id?: string | null
          status?: string | null
          towing_approved?: boolean | null
          towing_approved_at?: string | null
          towing_approved_by?: string | null
          towing_completed?: boolean | null
          towing_completed_at?: string | null
          towing_required?: boolean | null
          urgency?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          driver_name?: string | null
          fault_type?: string | null
          id?: string
          images?: string | null
          notes?: string | null
          serial_id?: string | null
          status?: string | null
          towing_approved?: boolean | null
          towing_approved_at?: string | null
          towing_approved_by?: string | null
          towing_completed?: boolean | null
          towing_completed_at?: string | null
          towing_required?: boolean | null
          urgency?: string | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_number: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_number?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_number?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          company_name: string | null
          created_at: string | null
          created_by: string | null
          customer_name: string | null
          days_of_week: string[] | null
          destination: string | null
          distance_km: number | null
          driver_name: string | null
          end_time: string | null
          id: string
          name: string
          notes: string | null
          origin: string | null
          service_type: string | null
          start_time: string | null
          status: string | null
          stops: string[] | null
          updated_at: string | null
          vehicle_plate: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name?: string | null
          days_of_week?: string[] | null
          destination?: string | null
          distance_km?: number | null
          driver_name?: string | null
          end_time?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string | null
          stops?: string[] | null
          updated_at?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name?: string | null
          days_of_week?: string[] | null
          destination?: string | null
          distance_km?: number | null
          driver_name?: string | null
          end_time?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string | null
          stops?: string[] | null
          updated_at?: string | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          company_name: string | null
          created_at: string | null
          created_by: string | null
          date_time: string | null
          description: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          manager_approval: string | null
          manufacturer: string | null
          model: string | null
          notes: string | null
          odometer: number | null
          ordering_user: string | null
          reference_number: string | null
          service_category: string | null
          service_date: string | null
          service_time: string | null
          treatment_status: string | null
          vehicle_notes: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
          vendor_name: string | null
          vendor_phone: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string | null
          description?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          manager_approval?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          ordering_user?: string | null
          reference_number?: string | null
          service_category?: string | null
          service_date?: string | null
          service_time?: string | null
          treatment_status?: string | null
          vehicle_notes?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date_time?: string | null
          description?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          manager_approval?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          ordering_user?: string | null
          reference_number?: string | null
          service_category?: string | null
          service_date?: string | null
          service_time?: string | null
          treatment_status?: string | null
          vehicle_notes?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Relationships: []
      }
      temporary_drivers: {
        Row: {
          company_name: string | null
          created_at: string
          created_by: string | null
          full_name: string
          handover_id: string | null
          id: string
          id_number: string
          license_expiry: string | null
          license_number: string
          phone: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          handover_id?: string | null
          id?: string
          id_number?: string
          license_expiry?: string | null
          license_number?: string
          phone?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          handover_id?: string | null
          id?: string
          id_number?: string
          license_expiry?: string | null
          license_number?: string
          phone?: string | null
        }
        Relationships: []
      }
      trip_logs: {
        Row: {
          company_name: string | null
          created_at: string
          driver_id: string
          end_address: string | null
          end_lat: number | null
          end_lng: number | null
          ended_at: string | null
          id: string
          notes: string | null
          route_id: string
          start_address: string | null
          start_lat: number | null
          start_lng: number | null
          started_at: string | null
          trip_date: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          driver_id: string
          end_address?: string | null
          end_lat?: number | null
          end_lng?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          route_id: string
          start_address?: string | null
          start_lat?: number | null
          start_lng?: number | null
          started_at?: string | null
          trip_date?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          driver_id?: string
          end_address?: string | null
          end_lat?: number | null
          end_lng?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          route_id?: string
          start_address?: string | null
          start_lat?: number | null
          start_lng?: number | null
          started_at?: string | null
          trip_date?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_handovers: {
        Row: {
          action_type: string | null
          approval_updated_at: string | null
          company_name: string | null
          condition_checklist: Json | null
          created_at: string | null
          created_by: string | null
          damage_summary: string | null
          date_time: string | null
          driver_approval_status: string
          giving_driver_name: string | null
          giving_driver_phone: string | null
          id: string
          lat: number | null
          lng: number | null
          location_address: string | null
          location_name: string | null
          manufacturer: string | null
          model: string | null
          notes: string | null
          odometer: number | null
          pickup_date: string | null
          pickup_time: string | null
          receiving_driver_name: string | null
          receiving_driver_phone: string | null
          reference_number: string | null
          vehicle_notes: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          action_type?: string | null
          approval_updated_at?: string | null
          company_name?: string | null
          condition_checklist?: Json | null
          created_at?: string | null
          created_by?: string | null
          damage_summary?: string | null
          date_time?: string | null
          driver_approval_status?: string
          giving_driver_name?: string | null
          giving_driver_phone?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          location_name?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          pickup_date?: string | null
          pickup_time?: string | null
          receiving_driver_name?: string | null
          receiving_driver_phone?: string | null
          reference_number?: string | null
          vehicle_notes?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          action_type?: string | null
          approval_updated_at?: string | null
          company_name?: string | null
          condition_checklist?: Json | null
          created_at?: string | null
          created_by?: string | null
          damage_summary?: string | null
          date_time?: string | null
          driver_approval_status?: string
          giving_driver_name?: string | null
          giving_driver_phone?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          location_name?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          pickup_date?: string | null
          pickup_time?: string | null
          receiving_driver_name?: string | null
          receiving_driver_phone?: string | null
          reference_number?: string | null
          vehicle_notes?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          assigned_driver_id: string | null
          company_name: string | null
          comprehensive_insurance_expiry: string | null
          created_at: string | null
          created_by: string | null
          id: string
          insurance_expiry: string | null
          license_plate: string
          manufacturer: string | null
          model: string | null
          notes: string | null
          odometer: number | null
          status: string | null
          test_expiry: string | null
          updated_at: string | null
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          company_name?: string | null
          comprehensive_insurance_expiry?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insurance_expiry?: string | null
          license_plate: string
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          status?: string | null
          test_expiry?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          company_name?: string | null
          comprehensive_insurance_expiry?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insurance_expiry?: string | null
          license_plate?: string
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          odometer?: number | null
          status?: string | null
          test_expiry?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "driver" | "fleet_manager" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["driver", "fleet_manager", "super_admin"],
    },
  },
} as const
