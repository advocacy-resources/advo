import React from "react";
import RecommendationForm from "@/components/resources/RecommendationForm";

export const metadata = {
  title: "Recommend a Resource | myAdvo",
  description: "Recommend a resource to be added to the myAdvo platform",
};

export default function RecommendPage() {
  return (
    <div className="container mx-auto py-24 px-4 mt-[180px] md:mt-0">
      <h1 className="text-3xl font-bold text-center mb-8">
        Recommend a Resource
      </h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
        Know of a valuable resource that should be on myAdvo? Let us know about
        it! Our team will review your recommendation and consider adding it to
        our platform.
      </p>
      <RecommendationForm />
    </div>
  );
}
