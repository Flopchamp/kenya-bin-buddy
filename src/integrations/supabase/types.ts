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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bins: {
        Row: {
          bin_code: string
          created_at: string | null
          fill_level: number | null
          id: string
          last_collection: string | null
          latitude: number
          location_name: string
          longitude: number
          next_scheduled_collection: string | null
          status: Database["public"]["Enums"]["bin_status"] | null
          updated_at: string | null
        }
        Insert: {
          bin_code: string
          created_at?: string | null
          fill_level?: number | null
          id?: string
          last_collection?: string | null
          latitude: number
          location_name: string
          longitude: number
          next_scheduled_collection?: string | null
          status?: Database["public"]["Enums"]["bin_status"] | null
          updated_at?: string | null
        }
        Update: {
          bin_code?: string
          created_at?: string | null
          fill_level?: number | null
          id?: string
          last_collection?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          next_scheduled_collection?: string | null
          status?: Database["public"]["Enums"]["bin_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      citizen_reports: {
        Row: {
          bin_id: string | null
          citizen_id: string
          created_at: string | null
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          report_type: string
          resolved_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bin_id?: string | null
          citizen_id: string
          created_at?: string | null
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          report_type: string
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bin_id?: string | null
          citizen_id?: string
          created_at?: string | null
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          report_type?: string
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_reports_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_history: {
        Row: {
          bin_id: string | null
          collected_at: string
          created_at: string | null
          driver_id: string | null
          fill_level_before: number | null
          id: string
          notes: string | null
          schedule_id: string | null
          truck_id: string | null
        }
        Insert: {
          bin_id?: string | null
          collected_at?: string
          created_at?: string | null
          driver_id?: string | null
          fill_level_before?: number | null
          id?: string
          notes?: string | null
          schedule_id?: string | null
          truck_id?: string | null
        }
        Update: {
          bin_id?: string | null
          collected_at?: string
          created_at?: string | null
          driver_id?: string | null
          fill_level_before?: number | null
          id?: string
          notes?: string | null
          schedule_id?: string | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_history_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "collection_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_history_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_schedules: {
        Row: {
          bin_id: string
          collected_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["collection_status"] | null
          truck_id: string
          updated_at: string | null
        }
        Insert: {
          bin_id: string
          collected_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["collection_status"] | null
          truck_id: string
          updated_at?: string | null
        }
        Update: {
          bin_id?: string
          collected_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: Database["public"]["Enums"]["collection_status"] | null
          truck_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_schedules_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_schedules_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_activity: {
        Row: {
          bins_collected: number | null
          created_at: string | null
          distance_km: number | null
          driver_id: string
          end_time: string | null
          fatigue_score: number | null
          hours_worked: number | null
          id: string
          notes: string | null
          route_assignment_id: string | null
          shift_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["driver_status"] | null
          updated_at: string | null
        }
        Insert: {
          bins_collected?: number | null
          created_at?: string | null
          distance_km?: number | null
          driver_id: string
          end_time?: string | null
          fatigue_score?: number | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          route_assignment_id?: string | null
          shift_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          updated_at?: string | null
        }
        Update: {
          bins_collected?: number | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string
          end_time?: string | null
          fatigue_score?: number | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          route_assignment_id?: string | null
          shift_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_activity_route_assignment_id_fkey"
            columns: ["route_assignment_id"]
            isOneToOne: false
            referencedRelation: "route_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route_assignment_bins: {
        Row: {
          bin_id: string
          created_at: string | null
          id: string
          route_assignment_id: string
        }
        Insert: {
          bin_id: string
          created_at?: string | null
          id?: string
          route_assignment_id: string
        }
        Update: {
          bin_id?: string
          created_at?: string | null
          id?: string
          route_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_assignment_bins_route_assignment_id_fkey"
            columns: ["route_assignment_id"]
            isOneToOne: false
            referencedRelation: "route_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_assignment_bins_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
        ]
      }
      route_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assignment_type: Database["public"]["Enums"]["assignment_mode"] | null
          completed_at: string | null
          created_at: string | null
          driver_id: string
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          id: string
          notes: string | null
          route_name: string
          started_at: string | null
          status: Database["public"]["Enums"]["route_status"] | null
          total_bins: number
          truck_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_type?: Database["public"]["Enums"]["assignment_mode"] | null
          completed_at?: string | null
          created_at?: string | null
          driver_id: string
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          route_name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_status"] | null
          total_bins?: number
          truck_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_type?: Database["public"]["Enums"]["assignment_mode"] | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          route_name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_status"] | null
          total_bins?: number
          truck_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_assignments_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          assignment_mode: Database["public"]["Enums"]["assignment_mode"] | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assignment_mode?:
            | Database["public"]["Enums"]["assignment_mode"]
            | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assignment_mode?:
            | Database["public"]["Enums"]["assignment_mode"]
            | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      trucks: {
        Row: {
          capacity: number
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          driver_id: string | null
          id: string
          is_active: boolean | null
          truck_number: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          driver_id?: string | null
          id?: string
          is_active?: boolean | null
          truck_number: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          driver_id?: string | null
          id?: string
          is_active?: boolean | null
          truck_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      driver_workload_today: {
        Row: {
          avg_fatigue_score: number | null
          bins_collected_today: number | null
          current_status: string | null
          distance_covered_today: number | null
          driver_id: string | null
          hours_worked_today: number | null
          routes_today: number | null
          shift_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_fatigue_score: {
        Args: {
          bins_collected: number
          distance_km: number
          hours_worked: number
          routes_completed: number
        }
        Returns: number
      }
      can_driver_accept_route: {
        Args: { driver_uuid: string }
        Returns: boolean
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
      app_role: "admin" | "driver" | "citizen"
      assignment_mode: "automatic" | "manual"
      bin_status: "empty" | "half" | "full" | "overflow"
      collection_status: "pending" | "in_progress" | "completed" | "cancelled"
      driver_status: "available" | "busy" | "overworked" | "offline"
      route_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      app_role: ["admin", "driver", "citizen"],
      assignment_mode: ["automatic", "manual"],
      bin_status: ["empty", "half", "full", "overflow"],
      collection_status: ["pending", "in_progress", "completed", "cancelled"],
      driver_status: ["available", "busy", "overworked", "offline"],
      route_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
