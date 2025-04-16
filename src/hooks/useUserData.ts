import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
  // Contact information
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Demographic information
  ageGroup?: string;
  raceEthnicity?: string;
  gender?: string;
  pronoun1?: string;
  pronoun2?: string;
  sexualOrientation?: string;
  incomeBracket?: string;
  livingSituation?: string;
  livingArrangement?: string;
  resourceInterests?: string[];
}

export const useUserData = (userId: string | undefined) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/v1/users/${userId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, toast]);

  const saveUserData = async (updatedData: UserData) => {
    try {
      console.log("useUserData.saveUserData - Saving data:", updatedData);

      // Only send the fields that can be updated
      const dataToSend = {
        id: updatedData.id,
        name: updatedData.name,
        phone: updatedData.phone,
        city: updatedData.city,
        state: updatedData.state,
        zipCode: updatedData.zipCode,
        // Demographic information
        ageGroup: updatedData.ageGroup,
        raceEthnicity: updatedData.raceEthnicity,
        gender: updatedData.gender,
        pronoun1: updatedData.pronoun1,
        pronoun2: updatedData.pronoun2,
        sexualOrientation: updatedData.sexualOrientation,
        incomeBracket: updatedData.incomeBracket,
        livingSituation: updatedData.livingSituation,
        livingArrangement: updatedData.livingArrangement,
        resourceInterests: updatedData.resourceInterests,
      };

      const response = await fetch(`/api/v1/users/${updatedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error("Failed to save user data");
      }

      const savedData = await response.json();
      console.log("useUserData.saveUserData - Received response:", savedData);

      // Update the local state with the data returned from the API
      setUserData(savedData);

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });

      return savedData;
    } catch (error) {
      console.error("Error saving user data:", error);
      toast({
        title: "Error",
        description: "Failed to save user data. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { userData, setUserData, isLoading, saveUserData };
};
