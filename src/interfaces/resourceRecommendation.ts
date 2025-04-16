export interface ResourceRecommendation {
  id: string;
  name: string;
  type: "state" | "national";
  state?: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  submittedBy?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceRecommendationFormData {
  name: string;
  type: "state" | "national";
  state?: string;
  description: string;
  category: string[];
  note: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip?: string;
  };
  submittedBy?: string;
  email?: string;
}
