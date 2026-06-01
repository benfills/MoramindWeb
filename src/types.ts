import type {User} from '@supabase/supabase-js'

export interface Settings {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
}

export type { User }
