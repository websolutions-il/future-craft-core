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
      approval_requests: {
        Row: {
          action_type: string
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string | null
          company_name: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          last_reminder_at: string | null
          notification_sent: boolean | null
          rejection_reason: string | null
          reminder_count: number | null
          requested_by: string | null
          requested_by_name: string | null
          status: string
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          action_type?: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          last_reminder_at?: string | null
          notification_sent?: boolean | null
          rejection_reason?: string | null
          reminder_count?: number | null
          requested_by?: string | null
          requested_by_name?: string | null
          status?: string
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          action_type?: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          last_reminder_at?: string | null
          notification_sent?: boolean | null
          rejection_reason?: string | null
          reminder_count?: number | null
          requested_by?: string | null
          requested_by_name?: string | null
          status?: string
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      companions: {
        Row: {
          company_name: string | null
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          id_number: string | null
          notes: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          alert_days_before: number | null
          company_name: string
          created_at: string | null
          id: string
          reminder_1_day: boolean | null
          reminder_30_days: boolean | null
          reminder_7_days: boolean | null
          updated_at: string | null
          vehicle_approval_required: boolean | null
          whatsapp_button_color: string | null
          whatsapp_button_text: string | null
          whatsapp_enabled: boolean | null
          whatsapp_phone: string | null
        }
        Insert: {
          alert_days_before?: number | null
          company_name: string
          created_at?: string | null
          id?: string
          reminder_1_day?: boolean | null
          reminder_30_days?: boolean | null
          reminder_7_days?: boolean | null
          updated_at?: string | null
          vehicle_approval_required?: boolean | null
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_phone?: string | null
        }
        Update: {
          alert_days_before?: number | null
          company_name?: string
          created_at?: string | null
          id?: string
          reminder_1_day?: boolean | null
          reminder_30_days?: boolean | null
          reminder_7_days?: boolean | null
          updated_at?: string | null
          vehicle_approval_required?: boolean | null
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      company_subscriptions: {
        Row: {
          billing_day: number | null
          company_name: string
          created_at: string | null
          id: string
          last_payment_date: string | null
          monthly_price: number | null
          next_payment_date: string | null
          notes: string | null
          payment_method: string | null
          plan_name: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          billing_day?: number | null
          company_name: string
          created_at?: string | null
          id?: string
          last_payment_date?: string | null
          monthly_price?: number | null
          next_payment_date?: string | null
          notes?: string | null
          payment_method?: string | null
          plan_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_day?: number | null
          company_name?: string
          created_at?: string | null
          id?: string
          last_payment_date?: string | null
          monthly_price?: number | null
          next_payment_date?: string | null
          notes?: string | null
          payment_method?: string | null
          plan_name?: string | null
          status?: string | null
          updated_at?: string | null
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
      emergency_categories: {
        Row: {
          auto_message_template: string
          category_icon: string
          category_key: string
          category_label: string
          company_name: string
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          target_type: string
          target_value: string
          updated_at: string
        }
        Insert: {
          auto_message_template?: string
          category_icon?: string
          category_key?: string
          category_label?: string
          company_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          target_type?: string
          target_value?: string
          updated_at?: string
        }
        Update: {
          auto_message_template?: string
          category_icon?: string
          category_key?: string
          category_label?: string
          company_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          target_type?: string
          target_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_logs: {
        Row: {
          category_key: string
          category_label: string
          company_name: string
          created_at: string
          id: string
          location: string | null
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_type: string
          target_value: string
          user_id: string
          user_name: string
          vehicle_plate: string | null
        }
        Insert: {
          category_key?: string
          category_label?: string
          company_name?: string
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_type?: string
          target_value?: string
          user_id: string
          user_name?: string
          vehicle_plate?: string | null
        }
        Update: {
          category_key?: string
          category_label?: string
          company_name?: string
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_type?: string
          target_value?: string
          user_id?: string
          user_name?: string
          vehicle_plate?: string | null
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
      internal_messages: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id: string
          sender_id: string
          sender_name?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          sender_id?: string
          sender_name?: string
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
      promotions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          start_date: string | null
          target_companies: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string | null
          target_companies?: string[] | null
          title?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string | null
          target_companies?: string[] | null
          title?: string
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
          execution_date: string | null
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
          execution_date?: string | null
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
          execution_date?: string | null
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
      service_order_messages: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          message: string
          order_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id?: string
          message?: string
          order_id: string
          user_id: string
          user_name?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
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
          images: string | null
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
          towing_address: string | null
          towing_contact: string | null
          towing_requested: boolean | null
          towing_time: string | null
          treatment_status: string | null
          urgency: string | null
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
          images?: string | null
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
          towing_address?: string | null
          towing_contact?: string | null
          towing_requested?: boolean | null
          towing_time?: string | null
          treatment_status?: string | null
          urgency?: string | null
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
          images?: string | null
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
          towing_address?: string | null
          towing_contact?: string | null
          towing_requested?: boolean | null
          towing_time?: string | null
          treatment_status?: string | null
          urgency?: string | null
          vehicle_notes?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          supplier_type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          supplier_type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          supplier_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action_type: string
          channel: string | null
          company_name: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string
          id: string
          new_status: string | null
          old_status: string | null
          user_id: string | null
          user_name: string
          vehicle_plate: string | null
        }
        Insert: {
          action_type?: string
          channel?: string | null
          company_name?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          user_id?: string | null
          user_name?: string
          vehicle_plate?: string | null
        }
        Update: {
          action_type?: string
          channel?: string | null
          company_name?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          user_id?: string | null
          user_name?: string
          vehicle_plate?: string | null
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
          approval_status: string | null
          assigned_driver_id: string | null
          company_name: string | null
          comprehensive_insurance_doc_url: string | null
          comprehensive_insurance_expiry: string | null
          comprehensive_insurance_start: string | null
          created_at: string | null
          created_by: string | null
          id: string
          insurance_doc_url: string | null
          insurance_expiry: string | null
          insurance_start: string | null
          last_service_date: string | null
          license_doc_url: string | null
          license_plate: string
          manufacturer: string | null
          model: string | null
          needs_transport: boolean | null
          next_service_date: string | null
          notes: string | null
          odometer: number | null
          status: string | null
          test_expiry: string | null
          updated_at: string | null
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          approval_status?: string | null
          assigned_driver_id?: string | null
          company_name?: string | null
          comprehensive_insurance_doc_url?: string | null
          comprehensive_insurance_expiry?: string | null
          comprehensive_insurance_start?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insurance_doc_url?: string | null
          insurance_expiry?: string | null
          insurance_start?: string | null
          last_service_date?: string | null
          license_doc_url?: string | null
          license_plate: string
          manufacturer?: string | null
          model?: string | null
          needs_transport?: boolean | null
          next_service_date?: string | null
          notes?: string | null
          odometer?: number | null
          status?: string | null
          test_expiry?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          approval_status?: string | null
          assigned_driver_id?: string | null
          company_name?: string | null
          comprehensive_insurance_doc_url?: string | null
          comprehensive_insurance_expiry?: string | null
          comprehensive_insurance_start?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insurance_doc_url?: string | null
          insurance_expiry?: string | null
          insurance_start?: string | null
          last_service_date?: string | null
          license_doc_url?: string | null
          license_plate?: string
          manufacturer?: string | null
          model?: string | null
          needs_transport?: boolean | null
          next_service_date?: string | null
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
      work_assignment_messages: {
        Row: {
          assignment_id: string
          company_name: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          user_id: string
          user_name: string
        }
        Insert: {
          assignment_id: string
          company_name?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          user_id: string
          user_name?: string
        }
        Update: {
          assignment_id?: string
          company_name?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_assignment_messages_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "work_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      work_assignment_status_log: {
        Row: {
          assignment_id: string
          changed_by: string | null
          changed_by_name: string | null
          company_name: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          assignment_id: string
          changed_by?: string | null
          changed_by_name?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          assignment_id?: string
          changed_by?: string | null
          changed_by_name?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_assignment_status_log_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "work_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      work_assignments: {
        Row: {
          approval_source_driver: string | null
          approval_source_manager: string | null
          companion_id: string | null
          companion_name: string | null
          companion_requested: boolean | null
          company_name: string | null
          created_at: string
          created_by: string | null
          customer_approved_at: string | null
          customer_id: string | null
          customer_name: string | null
          description: string | null
          driver_approved_at: string | null
          driver_id: string | null
          driver_name: string | null
          end_time: string | null
          id: string
          location: string | null
          manager_approved_at: string | null
          manager_approved_by: string | null
          manager_approved_name: string | null
          notes: string | null
          priority: string | null
          rejected_by: string | null
          rejection_reason: string | null
          route_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          title: string
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          approval_source_driver?: string | null
          approval_source_manager?: string | null
          companion_id?: string | null
          companion_name?: string | null
          companion_requested?: boolean | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_approved_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          driver_approved_at?: string | null
          driver_id?: string | null
          driver_name?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          manager_approved_name?: string | null
          notes?: string | null
          priority?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          route_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          title?: string
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          approval_source_driver?: string | null
          approval_source_manager?: string | null
          companion_id?: string | null
          companion_name?: string | null
          companion_requested?: boolean | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_approved_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          driver_approved_at?: string | null
          driver_id?: string | null
          driver_name?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          manager_approved_name?: string | null
          notes?: string | null
          priority?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          route_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          title?: string
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_assignments_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          },
        ]
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
