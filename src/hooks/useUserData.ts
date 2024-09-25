import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface UserData {
  id: string;
  username: string | null;
  email: string;
  name: string | null;
  image: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  pronouns: string | null;
  primaryLanguage: string | null;
  secondaryLanguages: string[];
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  preferredCommunication: string | null;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export const useUserData = (userId: string | undefined) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`);
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
      const response = await fetch(`/api/users/${updatedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to save user data");

      setUserData(updatedData);

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      toast({
        title: "Error",
        description: "Failed to save user data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { userData, setUserData, isLoading, saveUserData };
};
