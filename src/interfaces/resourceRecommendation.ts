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
  note: string;
  submittedBy?: string;
  email?: string;
}
