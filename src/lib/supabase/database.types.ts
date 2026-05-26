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
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: { role_id: string; permission_id: string }
        Insert: { role_id: string; permission_id: string }
        Update: { role_id?: string; permission_id?: string }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          role_id: string | null
          full_name: string
          registration_number: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id?: string | null
          full_name: string
          registration_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string | null
          full_name?: string
          registration_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          id: string
          name: string
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_time?: string
          end_time?: string
          created_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          name: string
          registration_code: string
          sector_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          registration_code: string
          sector_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          registration_code?: string
          sector_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      machines: {
        Row: {
          id: string
          name: string
          sector_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sector_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sector_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      battery_models: {
        Row: {
          id: string
          code: string
          name: string
          weight_specification: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          weight_specification: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          weight_specification?: number
          created_at?: string
        }
        Relationships: []
      }
      lead_alloys: {
        Row: {
          id: string
          code: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      grid_casting_production: {
        Row: {
          id: string
          date: string
          shift_id: string
          machine_id: string
          operator_id: string
          alloy_id: string
          battery_model_id: string
          gross_weight: number
          net_weight: number
          produced_qty: number
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          date?: string
          shift_id: string
          machine_id: string
          operator_id: string
          alloy_id: string
          battery_model_id: string
          gross_weight: number
          net_weight: number
          produced_qty: number
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          date?: string
          shift_id?: string
          machine_id?: string
          operator_id?: string
          alloy_id?: string
          battery_model_id?: string
          gross_weight?: number
          net_weight?: number
          produced_qty?: number
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      grid_casting_downtime: {
        Row: {
          id: string
          production_id: string
          reason: string
          duration_minutes: number
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          production_id: string
          reason: string
          duration_minutes: number
          start_time: string
          end_time: string
        }
        Update: {
          id?: string
          production_id?: string
          reason?: string
          duration_minutes?: number
          start_time?: string
          end_time?: string
        }
        Relationships: []
      }
      lead_ball_production: {
        Row: {
          id: string
          date: string
          shift_id: string
          operator_id: string
          weight_produced: number
          silo_number: number
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          shift_id: string
          operator_id: string
          weight_produced: number
          silo_number: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          shift_id?: string
          operator_id?: string
          weight_produced?: number
          silo_number?: number
          created_at?: string
        }
        Relationships: []
      }
      oxide_mill_production: {
        Row: {
          id: string
          date: string
          shift_id: string
          operator_id: string
          oxide_weight: number
          oxidation_degree: number
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          shift_id: string
          operator_id: string
          oxide_weight: number
          oxidation_degree: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          shift_id?: string
          operator_id?: string
          oxide_weight?: number
          oxidation_degree?: number
          created_at?: string
        }
        Relationships: []
      }
      mixer_production: {
        Row: {
          id: string
          date: string
          shift_id: string
          operator_id: string
          batch_number: string
          lead_ball_weight: number
          oxide_weight: number
          water_volume: number
          acid_volume: number
          density: number
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          shift_id: string
          operator_id: string
          batch_number: string
          lead_ball_weight: number
          oxide_weight: number
          water_volume: number
          acid_volume: number
          density: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          shift_id?: string
          operator_id?: string
          batch_number?: string
          lead_ball_weight?: number
          oxide_weight?: number
          water_volume?: number
          acid_volume?: number
          density?: number
          created_at?: string
        }
        Relationships: []
      }
      lead_consumption: {
        Row: {
          id: string
          date: string
          alloy_id: string
          weight_consumed: number
          destination_sector_id: string
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          alloy_id: string
          weight_consumed: number
          destination_sector_id: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          alloy_id?: string
          weight_consumed?: number
          destination_sector_id?: string
          created_at?: string
        }
        Relationships: []
      }
      pasting_production: {
        Row: {
          id: string
          ep_code: string
          date: string
          shift_id: string
          machine_id: string
          operator_id: string
          battery_model_id: string
          plates_qty: number
          created_at: string
        }
        Insert: {
          id?: string
          ep_code: string
          date?: string
          shift_id: string
          machine_id: string
          operator_id: string
          battery_model_id: string
          plates_qty: number
          created_at?: string
        }
        Update: {
          id?: string
          ep_code?: string
          date?: string
          shift_id?: string
          machine_id?: string
          operator_id?: string
          battery_model_id?: string
          plates_qty?: number
          created_at?: string
        }
        Relationships: []
      }
      sanding_scrap: {
        Row: {
          id: string
          date: string
          operator_id: string
          scrap_weight: number
          plates_qty_lost: number
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          operator_id: string
          scrap_weight: number
          plates_qty_lost: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          operator_id?: string
          scrap_weight?: number
          plates_qty_lost?: number
          created_at?: string
        }
        Relationships: []
      }
      assembly_production: {
        Row: {
          id: string
          battery_lot_code: string
          pasting_production_id: string
          date: string
          shift_id: string
          machine_id: string
          operator_id: string
          produced_qty: number
          lot_characteristics: Json
          created_at: string
        }
        Insert: {
          id?: string
          battery_lot_code: string
          pasting_production_id: string
          date?: string
          shift_id: string
          machine_id: string
          operator_id: string
          produced_qty: number
          lot_characteristics?: Json
          created_at?: string
        }
        Update: {
          id?: string
          battery_lot_code?: string
          pasting_production_id?: string
          date?: string
          shift_id?: string
          machine_id?: string
          operator_id?: string
          produced_qty?: number
          lot_characteristics?: Json
          created_at?: string
        }
        Relationships: []
      }
      lab_quality_control: {
        Row: {
          id: string
          date: string
          technician_id: string
          sample_source: number | null
          source_id: string
          acid_concentration: number | null
          mass_density: number | null
          temperature: number | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          technician_id: string
          sample_source?: number | null
          source_id: string
          acid_concentration?: number | null
          mass_density?: number | null
          temperature?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          technician_id?: string
          sample_source?: number | null
          source_id?: string
          acid_concentration?: number | null
          mass_density?: number | null
          temperature?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      formation_records: {
        Row: {
          id: string
          formation_lot_code: string
          start_date: string
          end_date: string | null
          operator_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          formation_lot_code: string
          start_date: string
          end_date?: string | null
          operator_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          formation_lot_code?: string
          start_date?: string
          end_date?: string | null
          operator_id?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      formation_details: {
        Row: {
          id: string
          formation_id: string
          circuit_number: number
          battery_lot_code: string
          initial_voltage: number
          final_voltage: number | null
          current_ampere: number
          created_at: string
        }
        Insert: {
          id?: string
          formation_id: string
          circuit_number: number
          battery_lot_code: string
          initial_voltage: number
          final_voltage?: number | null
          current_ampere: number
          created_at?: string
        }
        Update: {
          id?: string
          formation_id?: string
          circuit_number?: number
          battery_lot_code?: string
          initial_voltage?: number
          final_voltage?: number | null
          current_ampere?: number
          created_at?: string
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
  }
}
