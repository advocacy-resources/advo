"use client";

// BackgroundContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import Image from "next/image";

// Define the shape of your context value
interface BackgroundContextProps {
  background: JSX.Element;
  setBackground: (background: JSX.Element) => void;
}

// Create the context with a default value
const BackgroundContext = createContext<BackgroundContextProps | undefined>(
  undefined,
);

// Create a provider component
export const BackgroundContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [background, setBackground] = useState(
    <Image
      src="/AdvoHomeHeroBanner.png"
      alt="Sign In Image"
      className="h-full object-cover"
      width={1920}
      height={1080}
    />,
  );

  return (
    <BackgroundContext.Provider value={{ background, setBackground }}>
      <div className="relative flex flex-col grow">
        <div className="absolute -z-[100] w-full h-full">{background}</div>
        {children}
      </div>
    </BackgroundContext.Provider>
  );
};

// Create a custom hook for consuming the context
export const useBackgroundContext = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error(
      "useBackgroundContext must be used within a BackgroundContextProvider",
    );
  }
  return context;
};
