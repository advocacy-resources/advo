import React from "react";

interface GradientButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  highlighted?: boolean; // Prop to control the button's appearance
}

export default function GradientButton({
  onClick,
  children,
  highlighted = true, // Default to true for gradient appearance
}: GradientButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 font-bold rounded-full shadow-lg transition-transform ${
        highlighted
          ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white hover:scale-105"
          : "bg-gray-700 text-white hover:bg-gray-800 hover:scale-105"
      }`}
    >
      {children}
    </button>
  );
}
