// File: src/hooks/useUserData.ts
// Purpose: Custom hook for fetching, managing, and updating user profile data.
// Owner: Advo Team

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Interface defining the structure of user profile data.
 * Contains basic user information, contact details, and demographic information.
 */
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

/**
 * Custom hook for fetching and managing user profile data.
 * Provides functions to load, update, and save user information.
 *
 * @param userId - The ID of the user to fetch data for
 * @returns Object containing user data, loading state, and functions to update the data
 */
export const useUserData = (userId: string | undefined) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    /**
     * Fetches user data from the API when the component mounts or userId changes.
     * Updates local state with the fetched data and handles loading/error states.
     */
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

  /**
   * Saves updated user data to the API.
   * Only sends fields that can be updated and shows success/error notifications.
   *
   * @param updatedData - The complete user data object with updated fields
   * @returns The saved user data from the API response
   * @throws Error if the API request fails
   */
  const saveUserData = async (updatedData: UserData) => {
    try {
      console.log("useUserData.saveUserData - Saving data:", updatedData);

      // Extract only the fields that are allowed to be updated by the API
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

      // Update the local state with the data returned from the API to ensure consistency
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
