export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      your_table: {
        Row: { [key: string]: Json | undefined };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
    };
  };
}
