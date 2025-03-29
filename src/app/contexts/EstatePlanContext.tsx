"use client";

import React, { createContext, useContext, useState, FC, PropsWithChildren, useEffect } from "react";
import { EstatePlanData } from "../agentConfigs/willAndTrustParalegal/types";

type EstatePlanContextValue = {
  estatePlanData: EstatePlanData;
  updateEstatePlanData: (data: Partial<EstatePlanData>) => void;
  updateFieldValue: (path: string, value: any) => void;
  resetEstatePlanData: () => void;
};

const EstatePlanContext = createContext<EstatePlanContextValue | undefined>(undefined);

// Storage key for persisting estate plan data
const STORAGE_KEY = "estatePlanData";

export const EstatePlanProvider: FC<PropsWithChildren> = ({ children }) => {
  const [estatePlanData, setEstatePlanData] = useState<EstatePlanData>(() => {
    // Try to load initial data from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          return JSON.parse(savedData);
        }
      } catch (error) {
        console.error("Error loading estate plan data from storage:", error);
      }
    }
    return {};
  });

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(estatePlanData).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estatePlanData));
        console.log("Estate plan data saved to localStorage", estatePlanData);
      } catch (error) {
        console.error("Error saving estate plan data to storage:", error);
      }
    }
  }, [estatePlanData]);

  const updateEstatePlanData = (data: Partial<EstatePlanData>) => {
    setEstatePlanData((prev) => {
      const merged = {
        ...prev,
        ...data,
      };
      
      // For each top-level key in data, merge the objects instead of replacing
      Object.keys(data).forEach(key => {
        if (typeof data[key as keyof EstatePlanData] === 'object' && 
            data[key as keyof EstatePlanData] !== null &&
            typeof prev[key as keyof EstatePlanData] === 'object' &&
            prev[key as keyof EstatePlanData] !== null) {
          
          merged[key as keyof EstatePlanData] = {
            ...prev[key as keyof EstatePlanData],
            ...data[key as keyof EstatePlanData]
          };
        }
      });
      
      console.log("Updated estate plan data:", merged);
      return merged;
    });
  };

  // Helper function to update a nested field by path (e.g., "basicInfo.fullName")
  const updateFieldValue = (path: string, value: any) => {
    setEstatePlanData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      // Navigate to the nested object that contains the field to update
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        
        // If the key points to an array index
        if (key.includes('[') && key.includes(']')) {
          const arrayKey = key.split('[')[0];
          const index = parseInt(key.split('[')[1].split(']')[0]);
          
          if (!current[arrayKey]) {
            current[arrayKey] = [];
          }
          
          if (!current[arrayKey][index]) {
            current[arrayKey][index] = {};
          }
          
          current = current[arrayKey][index];
        } else {
          // Regular object property
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }
      }
      
      // Set the value on the final key
      const finalKey = keys[keys.length - 1];
      current[finalKey] = value;
      
      console.log(`Updated field "${path}" to:`, value);
      console.log("New estate plan data:", newData);
      
      return newData;
    });
  };
  
  // Reset the estate plan data (useful for testing or starting over)
  const resetEstatePlanData = () => {
    setEstatePlanData({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Estate plan data reset");
    }
  };

  return (
    <EstatePlanContext.Provider value={{ estatePlanData, updateEstatePlanData, updateFieldValue, resetEstatePlanData }}>
      {children}
    </EstatePlanContext.Provider>
  );
};

export function useEstatePlan() {
  const context = useContext(EstatePlanContext);
  if (context === undefined) {
    throw new Error("useEstatePlan must be used within an EstatePlanProvider");
  }
  return context;
} 