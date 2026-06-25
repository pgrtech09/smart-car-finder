export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Car {
  id: string;
  user_id: string;
  car_name: string;
  car_model: string;
  bluetooth_device_name: string;
  color?: string;
  license_plate?: string;
  created_at: string;
  updated_at: string;
}

export interface ParkingLocation {
  id: string;
  user_id: string;
  car_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  parked_at: string;
  retrieved_at?: string;
  created_at: string;
  car?: Car;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export type BluetoothStatus =
  | "idle"
  | "scanning"
  | "connected"
  | "disconnected"
  | "unsupported";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapMarker {
  position: [number, number];
  type: "car" | "user";
  label?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
      };
      cars: {
        Row: Car;
        Insert: Omit<Car, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Car, "id" | "user_id" | "created_at">>;
      };
      parking_locations: {
        Row: ParkingLocation;
        Insert: Omit<ParkingLocation, "id" | "created_at">;
        Update: Partial<Omit<ParkingLocation, "id" | "user_id" | "created_at">>;
      };
    };
  };
}
