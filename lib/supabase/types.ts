// TypeScript types generated from Supabase database schema
// Based on: Zenith Project Management SQL.txt

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
      cost_codes: {
        Row: {
          id: string
          code: string
          name: string
          cost_type_id: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          cost_type_id: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          cost_type_id?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_codes_cost_type_id_fkey"
            columns: ["cost_type_id"]
            isOneToOne: false
            referencedRelation: "cost_types"
            referencedColumns: ["id"]
          }
        ]
      }
      cost_types: {
        Row: {
          id: string
          name: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_cost_entries: {
        Row: {
          id: string
          project_id: string | null
          work_order_id: string | null
          cost_type_id: string
          cost_code_id: string
          part_id: string | null
          txn_date: string
          qty: number
          unit_cost: number
          amount: number
          description: string | null
          receipt_id: string | null
          receipt_line_item_id: string | null
          source_type: string
          source_id: string | null
          idempotency_key: string | null
          external_source: string | null
          external_txn_id: string | null
          external_line_id: string | null
          sync_status: string
          synced_at: string | null
          sync_error: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          work_order_id?: string | null
          cost_type_id: string
          cost_code_id: string
          part_id?: string | null
          txn_date?: string
          qty?: number
          unit_cost?: number
          amount?: number
          description?: string | null
          receipt_id?: string | null
          receipt_line_item_id?: string | null
          source_type?: string
          source_id?: string | null
          idempotency_key?: string | null
          external_source?: string | null
          external_txn_id?: string | null
          external_line_id?: string | null
          sync_status?: string
          synced_at?: string | null
          sync_error?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          work_order_id?: string | null
          cost_type_id?: string
          cost_code_id?: string
          part_id?: string | null
          txn_date?: string
          qty?: number
          unit_cost?: number
          amount?: number
          description?: string | null
          receipt_id?: string | null
          receipt_line_item_id?: string | null
          source_type?: string
          source_id?: string | null
          idempotency_key?: string | null
          external_source?: string | null
          external_txn_id?: string | null
          external_line_id?: string | null
          sync_status?: string
          synced_at?: string | null
          sync_error?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_cost_entries_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_cost_entries_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_cost_entries_cost_type"
            columns: ["cost_type_id"]
            isOneToOne: false
            referencedRelation: "cost_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_cost_entries_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_cost_entries_part"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_cost_entries_receipt"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_cost_entries_receipt_line_item"
            columns: ["receipt_line_item_id"]
            isOneToOne: false
            referencedRelation: "receipt_line_items"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          customer_no: string
          name: string
          contact_name: string | null
          phone: string | null
          email: string | null
          billing_street: string | null
          billing_city: string | null
          billing_state: string | null
          billing_zip: string | null
          service_street: string | null
          service_city: string | null
          service_state: string | null
          service_zip: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          qbo_customer_ref: string | null
          qbo_last_synced_at: string | null
        }
        Insert: {
          id?: string
          customer_no: string
          name: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          billing_street?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          service_street?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          qbo_customer_ref?: string | null
          qbo_last_synced_at?: string | null
        }
        Update: {
          id?: string
          customer_no?: string
          name?: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          billing_street?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          service_street?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          qbo_customer_ref?: string | null
          qbo_last_synced_at?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          id: string
          name: string
          serial_no: string | null
          hourly_rate: number
          daily_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          serial_no?: string | null
          hourly_rate?: number
          daily_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          serial_no?: string | null
          hourly_rate?: number
          daily_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment_usage: {
        Row: {
          id: string
          work_order_id: string
          equipment_id: string
          start_at: string
          end_at: string | null
          billed_rate: number
          cost_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_order_id: string
          equipment_id: string
          start_at: string
          end_at?: string | null
          billed_rate?: number
          cost_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_order_id?: string
          equipment_id?: string
          start_at?: string
          end_at?: string | null
          billed_rate?: number
          cost_total?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_usage_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          id: string
          entity_type: Database["public"]["Enums"]["file_entity_type"]
          entity_id: string
          file_kind: Database["public"]["Enums"]["file_kind"]
          storage_path: string
          mime_type: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: Database["public"]["Enums"]["file_entity_type"]
          entity_id: string
          file_kind: Database["public"]["Enums"]["file_kind"]
          storage_path: string
          mime_type?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: Database["public"]["Enums"]["file_entity_type"]
          entity_id?: string
          file_kind?: Database["public"]["Enums"]["file_kind"]
          storage_path?: string
          mime_type?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      inventory_ledger: {
        Row: {
          id: string
          part_id: string
          txn_type: Database["public"]["Enums"]["inventory_txn_type"]
          qty_delta: number
          unit_cost: number
          txn_date: string
          reference_type: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          part_id: string
          txn_type: Database["public"]["Enums"]["inventory_txn_type"]
          qty_delta: number
          unit_cost?: number
          txn_date?: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          part_id?: string
          txn_type?: Database["public"]["Enums"]["inventory_txn_type"]
          qty_delta?: number
          unit_cost?: number
          txn_date?: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          }
        ]
      }
      part_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      parts: {
        Row: {
          id: string
          sku: string | null
          name: string
          description_default: string
          category_id: string | null
          uom: string
          is_taxable: boolean
          cost_type_id: string | null
          cost_code_id: string | null
          sell_price: number
          avg_cost: number
          last_cost: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku?: string | null
          name: string
          description_default?: string
          category_id?: string | null
          uom: string
          is_taxable?: boolean
          cost_type_id?: string | null
          cost_code_id?: string | null
          sell_price?: number
          avg_cost?: number
          last_cost?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string | null
          name?: string
          description_default?: string
          category_id?: string | null
          uom?: string
          is_taxable?: boolean
          cost_type_id?: string | null
          cost_code_id?: string | null
          sell_price?: number
          avg_cost?: number
          last_cost?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "part_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_cost_code_id_fkey"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_cost_type_id_fkey"
            columns: ["cost_type_id"]
            isOneToOne: false
            referencedRelation: "cost_types"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          project_no: string
          customer_id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          job_street: string | null
          job_city: string | null
          job_state: string | null
          job_zip: string | null
          base_contract_amount: number
          change_order_amount: number
          contract_amount: number
          budget_amount: number
          invoiced_amount: number
          paid_amount: number
          total_cost: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          qbo_job_ref: string | null
          qbo_last_synced_at: string | null
        }
        Insert: {
          id?: string
          project_no: string
          customer_id: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          job_street?: string | null
          job_city?: string | null
          job_state?: string | null
          job_zip?: string | null
          base_contract_amount?: number
          change_order_amount?: number
          contract_amount?: number
          budget_amount?: number
          invoiced_amount?: number
          paid_amount?: number
          total_cost?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          qbo_job_ref?: string | null
          qbo_last_synced_at?: string | null
        }
        Update: {
          id?: string
          project_no?: string
          customer_id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          job_street?: string | null
          job_city?: string | null
          job_state?: string | null
          job_zip?: string | null
          base_contract_amount?: number
          change_order_amount?: number
          contract_amount?: number
          budget_amount?: number
          invoiced_amount?: number
          paid_amount?: number
          total_cost?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          qbo_job_ref?: string | null
          qbo_last_synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      employees: {
        Row: {
          id: string
          user_id: string | null
          display_name: string
          email: string | null
          phone: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          display_name: string
          email?: string | null
          phone?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          display_name?: string
          email?: string | null
          phone?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          customer_id: string
          label: string | null
          street: string
          city: string
          state: string
          zip: string
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label?: string | null
          street: string
          city: string
          state: string
          zip: string
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string | null
          street?: string
          city?: string
          state?: string
          zip?: string
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      work_orders: {
        Row: {
          id: string
          customer_id: string
          location_id: string
          work_order_no: string | null
          status: Database["public"]["Enums"]["work_status"]
          priority: number
          summary: string
          description: string
          requested_window_start: string | null
          requested_window_end: string | null
          assigned_to: string | null
          opened_at: string
          completed_at: string | null
          closed_at: string | null
          contract_subtotal: number
          contract_tax: number
          contract_total: number
          qb_subcustomer_id: string | null
          qb_subcustomer_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          location_id: string
          work_order_no?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          priority?: number
          summary?: string
          description?: string
          requested_window_start?: string | null
          requested_window_end?: string | null
          assigned_to?: string | null
          opened_at?: string
          completed_at?: string | null
          closed_at?: string | null
          contract_subtotal?: number
          contract_tax?: number
          contract_total?: number
          qb_subcustomer_id?: string | null
          qb_subcustomer_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          location_id?: string
          work_order_no?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          priority?: number
          summary?: string
          description?: string
          requested_window_start?: string | null
          requested_window_end?: string | null
          assigned_to?: string | null
          opened_at?: string
          completed_at?: string | null
          closed_at?: string | null
          contract_subtotal?: number
          contract_tax?: number
          contract_total?: number
          qb_subcustomer_id?: string | null
          qb_subcustomer_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      work_order_schedule: {
        Row: {
          id: string
          work_order_id: string
          tech_user_id: string
          start_at: string
          end_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_order_id: string
          tech_user_id: string
          start_at: string
          end_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_order_id?: string
          tech_user_id?: string
          start_at?: string
          end_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_schedule_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_schedule_tech_user_id_fkey"
            columns: ["tech_user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      work_order_time_entries: {
        Row: {
          id: string
          work_order_id: string
          tech_user_id: string
          clock_in_at: string
          clock_out_at: string | null
          break_minutes: number
          notes: string | null
          qb_timeactivity_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_order_id: string
          tech_user_id: string
          clock_in_at: string
          clock_out_at?: string | null
          break_minutes?: number
          notes?: string | null
          qb_timeactivity_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_order_id?: string
          tech_user_id?: string
          clock_in_at?: string
          clock_out_at?: string | null
          break_minutes?: number
          notes?: string | null
          qb_timeactivity_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_time_entries_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_time_entries_tech_user_id_fkey"
            columns: ["tech_user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_lines: {
        Row: {
          id: string
          quote_id: string
          line_no: number
          part_id: string | null
          description: string
          uom: string
          qty: number
          unit_price: number
          is_taxable: boolean
          line_subtotal: number
          line_tax: number
          line_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          line_no?: number
          part_id?: string | null
          description: string
          uom: string
          qty?: number
          unit_price?: number
          is_taxable?: boolean
          line_subtotal?: number
          line_tax?: number
          line_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          line_no?: number
          part_id?: string | null
          description?: string
          uom?: string
          qty?: number
          unit_price?: number
          is_taxable?: boolean
          line_subtotal?: number
          line_tax?: number
          line_total?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_lines_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          }
        ]
      }
      quotes: {
        Row: {
          id: string
          quote_no: string
          project_id: string
          work_order_id: string | null
          quote_type: Database["public"]["Enums"]["quote_type"]
          parent_quote_id: string | null
          status: Database["public"]["Enums"]["quote_status"]
          quote_date: string
          valid_until: string | null
          tax_rule_id: string
          tax_rate_snapshot: number | null
          subtotal: number
          tax_total: number
          total_amount: number
          accepted_at: string | null
          pdf_file_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          qbo_estimate_ref: string | null
          qbo_last_synced_at: string | null
          qbo_push_status: string | null
        }
        Insert: {
          id?: string
          quote_no: string
          project_id: string
          work_order_id?: string | null
          quote_type?: Database["public"]["Enums"]["quote_type"]
          parent_quote_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          quote_date?: string
          valid_until?: string | null
          tax_rule_id: string
          tax_rate_snapshot?: number | null
          subtotal?: number
          tax_total?: number
          total_amount?: number
          accepted_at?: string | null
          pdf_file_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          qbo_estimate_ref?: string | null
          qbo_last_synced_at?: string | null
          qbo_push_status?: string | null
        }
        Update: {
          id?: string
          quote_no?: string
          project_id?: string
          work_order_id?: string | null
          quote_type?: Database["public"]["Enums"]["quote_type"]
          parent_quote_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          quote_date?: string
          valid_until?: string | null
          tax_rule_id?: string
          tax_rate_snapshot?: number | null
          subtotal?: number
          tax_total?: number
          total_amount?: number
          accepted_at?: string | null
          pdf_file_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          qbo_estimate_ref?: string | null
          qbo_last_synced_at?: string | null
          qbo_push_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_parent_quote_id_fkey"
            columns: ["parent_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_tax_rule_id_fkey"
            columns: ["tax_rule_id"]
            isOneToOne: false
            referencedRelation: "tax_rules"
            referencedColumns: ["id"]
          }
        ]
      }
      receipts: {
        Row: {
          id: string
          vendor_name: string | null
          receipt_date: string | null
          total_amount: number
          storage_path: string
          notes: string | null
          is_allocated: boolean
          allocated_to_work_order_id: string | null
          allocated_overhead_bucket: string | null
          qb_source_entity: string | null
          qb_source_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_name?: string | null
          receipt_date?: string | null
          total_amount?: number
          storage_path: string
          notes?: string | null
          is_allocated?: boolean
          allocated_to_work_order_id?: string | null
          allocated_overhead_bucket?: string | null
          qb_source_entity?: string | null
          qb_source_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_name?: string | null
          receipt_date?: string | null
          total_amount?: number
          storage_path?: string
          notes?: string | null
          is_allocated?: boolean
          allocated_to_work_order_id?: string | null
          allocated_overhead_bucket?: string | null
          qb_source_entity?: string | null
          qb_source_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_allocated_to_work_order_id_fkey"
            columns: ["allocated_to_work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          company_name: string
          company_phone: string | null
          company_email: string | null
          company_address: string | null
          default_quote_terms: string
          default_tax_rule_id: string | null
          default_labor_rate: number
          customer_number_prefix: string
          next_customer_seq: number
          project_number_prefix: string
          next_project_seq: number
          quote_number_prefix: string
          next_quote_seq: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          company_name?: string
          company_phone?: string | null
          company_email?: string | null
          company_address?: string | null
          default_quote_terms?: string
          default_tax_rule_id?: string | null
          default_labor_rate?: number
          customer_number_prefix?: string
          next_customer_seq?: number
          project_number_prefix?: string
          next_project_seq?: number
          quote_number_prefix?: string
          next_quote_seq?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          company_phone?: string | null
          company_email?: string | null
          company_address?: string | null
          default_quote_terms?: string
          default_tax_rule_id?: string | null
          default_labor_rate?: number
          customer_number_prefix?: string
          next_customer_seq?: number
          project_number_prefix?: string
          next_project_seq?: number
          quote_number_prefix?: string
          next_quote_seq?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_default_tax_rule_id_fkey"
            columns: ["default_tax_rule_id"]
            isOneToOne: false
            referencedRelation: "tax_rules"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_rules: {
        Row: {
          id: string
          name: string
          rate: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          rate: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      qbo_connections: {
        Row: {
          id: string
          realm_id: string
          access_token_enc: string
          refresh_token_enc: string
          expires_at: string
          scope: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          realm_id: string
          access_token_enc: string
          refresh_token_enc: string
          expires_at: string
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          realm_id?: string
          access_token_enc?: string
          refresh_token_enc?: string
          expires_at?: string
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      qbo_entity_map: {
        Row: {
          id: string
          entity_type: string
          local_table: string | null
          local_id: string
          qbo_id: string
          qbo_sync_token: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          local_table?: string | null
          local_id: string
          qbo_id: string
          qbo_sync_token?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          local_table?: string | null
          local_id?: string
          qbo_id?: string
          qbo_sync_token?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      qb_sync_logs: {
        Row: {
          id: string
          sync_type: string
          direction: string
          status: string
          entity_type: string | null
          entity_id: string | null
          qb_request: string | null
          qb_response: string | null
          error_message: string | null
          processed_count: number
          created_at: string
        }
        Insert: {
          id?: string
          sync_type: string
          direction: string
          status: string
          entity_type?: string | null
          entity_id?: string | null
          qb_request?: string | null
          qb_response?: string | null
          error_message?: string | null
          processed_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          sync_type?: string
          direction?: string
          status?: string
          entity_type?: string | null
          entity_id?: string | null
          qb_request?: string | null
          qb_response?: string | null
          error_message?: string | null
          processed_count?: number
          created_at?: string
        }
        Relationships: []
      }
      receipt_line_items: {
        Row: {
          id: string
          receipt_id: string
          line_no: number
          part_id: string | null
          description: string
          uom: string | null
          qty: number
          unit_cost: number
          amount: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          line_no?: number
          part_id?: string | null
          description: string
          uom?: string | null
          qty?: number
          unit_cost?: number
          amount?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          line_no?: number
          part_id?: string | null
          description?: string
          uom?: string | null
          qty?: number
          unit_cost?: number
          amount?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_receipt_line_items_receipt"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_receipt_line_items_part"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          }
        ]
      }
      job_queue: {
        Row: {
          id: string
          job_type: string
          payload: Json
          status: string
          attempts: number
          run_after: string
          locked_at: string | null
          locked_by: string | null
          last_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_type: string
          payload: Json
          status?: string
          attempts?: number
          run_after?: string
          locked_at?: string | null
          locked_by?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_type?: string
          payload?: Json
          status?: string
          attempts?: number
          run_after?: string
          locked_at?: string | null
          locked_by?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string | null
          action: string
          actor_user_id: string | null
          before_data: Json | null
          after_data: Json | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id?: string | null
          action: string
          actor_user_id?: string | null
          before_data?: Json | null
          after_data?: Json | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string | null
          action?: string
          actor_user_id?: string | null
          before_data?: Json | null
          after_data?: Json | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      qbo_webhook_events: {
        Row: {
          id: string
          realm_id: string
          idempotency_key: string
          payload: Json
          status: string
          attempts: number
          last_error: string | null
          received_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          realm_id: string
          idempotency_key: string
          payload: Json
          status?: string
          attempts?: number
          last_error?: string | null
          received_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          realm_id?: string
          idempotency_key?: string
          payload?: Json
          status?: string
          attempts?: number
          last_error?: string | null
          received_at?: string
          processed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_quote: {
        Args: {
          p_quote_id: string
        }
        Returns: undefined
      }
      get_next_number: {
        Args: {
          p_kind: string
        }
        Returns: string
      }
    }
    Enums: {
      file_entity_type: "settings" | "customer" | "project" | "quote"
      file_kind: "photo" | "pdf" | "logo" | "other"
      inventory_txn_type: "RECEIPT" | "ADJUSTMENT" | "USAGE" | "RETURN"
      project_status: "Planning" | "Quoted" | "Active" | "Completed" | "Closed"
      quote_status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
      quote_type: "BASE" | "CHANGE_ORDER"
      work_status: "UNSCHEDULED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED" | "CANCELED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
