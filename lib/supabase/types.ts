// TypeScript types generated from Supabase database schema
// Based on: Zenith Project Managemtn SQL.txt

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
        }
        Relationships: []
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
          quote_type: Database["public"]["Enums"]["quote_type"]
          parent_quote_id: string | null
          status: Database["public"]["Enums"]["quote_status"]
          quote_date: string
          valid_until: string | null
          tax_rule_id: string
          tax_rate_snapshot: number | null
          subtotal: number
          tax_total: number
          total: number
          accepted_at: string | null
          pdf_file_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          quote_no: string
          project_id: string
          quote_type?: Database["public"]["Enums"]["quote_type"]
          parent_quote_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          quote_date?: string
          valid_until?: string | null
          tax_rule_id: string
          tax_rate_snapshot?: number | null
          subtotal?: number
          tax_total?: number
          total?: number
          accepted_at?: string | null
          pdf_file_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          quote_no?: string
          project_id?: string
          quote_type?: Database["public"]["Enums"]["quote_type"]
          parent_quote_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          quote_date?: string
          valid_until?: string | null
          tax_rule_id?: string
          tax_rate_snapshot?: number | null
          subtotal?: number
          tax_total?: number
          total?: number
          accepted_at?: string | null
          pdf_file_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
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
            foreignKeyName: "quotes_tax_rule_id_fkey"
            columns: ["tax_rule_id"]
            isOneToOne: false
            referencedRelation: "tax_rules"
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
      quote_status: "Draft" | "Sent" | "Accepted" | "Rejected"
      quote_type: "BASE" | "CHANGE_ORDER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
