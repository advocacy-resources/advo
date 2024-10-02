export interface Contact {
  phone: string;
  email: string;
  website: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
}

export interface OperatingHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string[];
  contact: Contact;
  address: Address;
  operatingHours: OperatingHours;
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
}
