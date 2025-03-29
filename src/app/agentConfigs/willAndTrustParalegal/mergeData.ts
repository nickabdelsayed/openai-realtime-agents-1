import { EstatePlanData } from './types';

/**
 * Merges partial data from specialized agents into the main EstatePlanData store
 * Uses a deep merge approach that preserves existing data not present in the partialData
 * 
 * @param existingData The current global EstatePlanData store
 * @param partialData The new partial data to be merged in
 * @returns The merged EstatePlanData object
 */
export function mergeEstatePlanData(
  existingData: EstatePlanData = {},
  partialData: Partial<EstatePlanData> = {}
): EstatePlanData {
  // Create a deep copy of the existing data to avoid mutation
  const result: EstatePlanData = JSON.parse(JSON.stringify(existingData));
  
  // Loop through all keys in the partial data
  Object.keys(partialData).forEach((key) => {
    const typedKey = key as keyof EstatePlanData;
    const partialValue = partialData[typedKey];
    const existingValue = result[typedKey];
    
    // Handle undefined values
    if (partialValue === undefined) {
      return;
    }
    
    // If existing value doesn't exist, simply assign the partial value
    if (existingValue === undefined) {
      result[typedKey] = partialValue;
      return;
    }
    
    // If both values are objects, recursively merge them
    if (
      typeof partialValue === 'object' && 
      partialValue !== null && 
      !Array.isArray(partialValue) &&
      typeof existingValue === 'object' && 
      existingValue !== null && 
      !Array.isArray(existingValue)
    ) {
      result[typedKey] = {
        ...existingValue,
        ...partialValue
      };
      return;
    }
    
    // If partial value is an array, either replace or merge elements
    if (Array.isArray(partialValue)) {
      // If the existing value is also an array, we could decide to append
      // or replace based on business rules, but for simplicity, we'll replace
      result[typedKey] = partialValue;
      return;
    }
    
    // For primitive values, just replace with the partial value
    result[typedKey] = partialValue;
  });
  
  return result;
} 