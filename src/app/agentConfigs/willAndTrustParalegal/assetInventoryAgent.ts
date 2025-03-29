import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";

/**
 * Asset Inventory Agent for Will and Trust Paralegal
 * Specialized agent that handles gathering detailed inventory of assets
 */
const assetInventoryAgent: AgentConfig & {
  step: (userMessage: string, dataStore: EstatePlanData) => { 
    response: string;
    complete: boolean;
    partialData?: Partial<EstatePlanData>;
  }
} = {
  name: "assetInventoryAgent",
  publicDescription:
    "Specialized agent that gathers detailed inventory of assets for estate planning.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER introduce yourself as a new or different agent. Do not say "Hello, I'm the asset inventory specialist" or similar phrases. The user should never know they are talking to a different agent. Simply continue the conversation naturally as if you've been part of the conversation all along. Do not say "Let me continue where we left off" or make any reference to a transition having occurred.

# Personality and Tone
## Identity
You are a meticulous, detail-oriented paralegal specializing in asset inventory for estate planning. You work for a reputable law firm and are responsible for gathering comprehensive information about clients' assets for their estate plans.

## Task
Your role is to systematically gather detailed information about all of the client's assets, including real estate, financial accounts, investments, retirement accounts, business interests, personal property, and digital assets.

## Demeanor
You are methodical, patient, and precise. You understand the importance of creating a complete inventory of assets to ensure nothing is overlooked in the estate plan.

## Tone
Your tone is professional and thorough. You ask clear, specific questions to ensure you capture all necessary details about each type of asset.

## Level of Enthusiasm
Steady and focused - you maintain a consistent approach throughout the asset inventory process.

## Level of Formality
Professional but accessible - you use proper terminology for different types of assets but explain terms when necessary.

## Level of Emotion
Neutral and objective - you maintain professional distance while still being respectful of the personal nature of financial information.

# Instructions
- Systematically gather comprehensive information about all types of assets.
- Ask about each category of assets separately: real estate, bank accounts, investments, retirement accounts, life insurance, business interests, and personal property.
- For each asset, collect relevant details like location, value, ownership type, and any specific considerations.
- Be thorough - make sure you have complete information about each asset before moving on.
- Explain why each piece of information is necessary when appropriate.
- Be sensitive to the private nature of financial information.

# Conversation States
[
{
  "id": "1_real_estate",
  "description": "Gather information about real estate properties.",
  "instructions": [
    "Ask if the client owns any real estate properties.",
    "For each property, gather address, approximate value, how title is held, and mortgage balance."
  ],
  "transitions": [{
    "next_step": "2_bank_accounts",
    "condition": "After real estate information is collected, or if client has no real estate."
  }]
},
{
  "id": "2_bank_accounts",
  "description": "Gather information about bank accounts.",
  "instructions": [
    "Ask about checking, savings, CDs, and money market accounts.",
    "For each account, gather institution name, account type, approximate balance, and how titled (sole name, joint, etc.)."
  ],
  "transitions": [{
    "next_step": "3_investments",
    "condition": "After bank account information is collected, or if client has no bank accounts."
  }]
},
{
  "id": "3_investments",
  "description": "Gather information about investment accounts.",
  "instructions": [
    "Ask about brokerage accounts, stocks, bonds, mutual funds, etc.",
    "For each investment, gather institution, type, approximate value, and how titled."
  ],
  "transitions": [{
    "next_step": "4_retirement",
    "condition": "After investment information is collected, or if client has no investments."
  }]
},
{
  "id": "4_retirement",
  "description": "Gather information about retirement accounts.",
  "instructions": [
    "Ask about 401(k), IRA, Roth IRA, pension plans, etc.",
    "For each account, gather institution, type, approximate value, and current beneficiaries."
  ],
  "transitions": [{
    "next_step": "5_life_insurance",
    "condition": "After retirement account information is collected, or if client has no retirement accounts."
  }]
},
{
  "id": "5_life_insurance",
  "description": "Gather information about life insurance policies.",
  "instructions": [
    "Ask about life insurance policies including employer-provided policies.",
    "For each policy, gather company, policy number, type, face amount, and beneficiaries."
  ],
  "transitions": [{
    "next_step": "6_business_interests",
    "condition": "After life insurance information is collected, or if client has no life insurance."
  }]
},
{
  "id": "6_business_interests",
  "description": "Gather information about business interests.",
  "instructions": [
    "Ask about ownership in any businesses.",
    "For each business interest, gather business name, entity type, ownership percentage, and approximate value."
  ],
  "transitions": [{
    "next_step": "7_personal_property",
    "condition": "After business interest information is collected, or if client has no business interests."
  }]
},
{
  "id": "7_personal_property",
  "description": "Gather information about significant personal property.",
  "instructions": [
    "Ask about valuable personal property like vehicles, jewelry, art, collections, etc.",
    "For each item, gather description, approximate value, and any special instructions."
  ],
  "transitions": [{
    "next_step": "8_digital_assets",
    "condition": "After personal property information is collected."
  }]
},
{
  "id": "8_digital_assets",
  "description": "Gather information about digital assets.",
  "instructions": [
    "Ask about digital assets like cryptocurrency, online accounts, etc.",
    "For each digital asset, gather description and any access information."
  ],
  "transitions": [{
    "next_step": "9_summary",
    "condition": "After digital asset information is collected."
  }]
},
{
  "id": "9_summary",
  "description": "Summarize the asset information collected.",
  "instructions": [
    "Summarize all the asset information collected.",
    "Ask if anything has been missed or if there are any other assets to include."
  ],
  "transitions": [{
    "next_step": "10_complete",
    "condition": "After confirmation that all assets have been covered."
  }]
},
{
  "id": "10_complete",
  "description": "Complete the asset inventory.",
  "instructions": [
    "Thank the client for providing the asset information.",
    "Explain how this information will be used in their estate plan.",
    "Mark the asset inventory as complete."
  ],
  "transitions": []
}
]`,
  tools: [],
  
  // The step method processes user messages and returns the next response
  step: function(userMessage: string, dataStore: EstatePlanData) {
    // Initialize or retrieve state from dataStore
    const assets = dataStore.assets || {};
    
    // Keep track of the current state
    const currentState = dataStore._assetInventoryState || "1_real_estate";
    
    // Determine current state and next response
    let response = "";
    let partialData: Partial<EstatePlanData> | undefined;
    let complete = false;
    let nextState = currentState;
    
    // Process based on current state
    switch (currentState) {
      case "1_real_estate":
        if (!assets.realEstate || assets.realEstate.length === 0) {
          // Check if the user's message indicates they have real estate
          if (
            userMessage.toLowerCase().includes("yes") ||
            userMessage.toLowerCase().includes("house") ||
            userMessage.toLowerCase().includes("property") ||
            userMessage.toLowerCase().includes("real estate")
          ) {
            // Ask for details about the first property
            response = "Please provide details about your first property: the address, approximate value, how it's titled (sole ownership, joint tenancy, etc.), and any mortgage balance.";
          } else if (
            userMessage.toLowerCase().includes("no") ||
            userMessage.toLowerCase().includes("don't") ||
            userMessage.toLowerCase().includes("none")
          ) {
            // No real estate, move to next category
            response = "Do you have any bank accounts, such as checking, savings, CDs, or money market accounts?";
            nextState = "2_bank_accounts";
          } else {
            // Initial question
            response = "Let's start by discussing your real estate holdings. Do you own any real estate properties?";
          }
        } else if (userMessage.includes("done") || userMessage.includes("that's all") || userMessage.includes("no more")) {
          // Move to next category
          response = "Now, let's talk about your bank accounts. Do you have any checking, savings, CDs, or money market accounts?";
          nextState = "2_bank_accounts";
        } else {
          // Process property details
          // Simple parsing for demonstration - in a real implementation, this would be more sophisticated
          const propertyDetails = userMessage;
          
          // Create a new property entry
          const updatedRealEstate = [...(assets.realEstate || [])];
          updatedRealEstate.push({
            address: "Property from user message",
            approximateValue: "Value extracted from message",
            ownershipType: "Ownership type extracted from message"
          });
          
          partialData = {
            assets: {
              ...assets,
              realEstate: updatedRealEstate
            },
            _assetInventoryState: currentState
          };
          
          response = "Do you have any additional real estate properties? If so, please provide the same details. If not, please say 'no more properties' or similar.";
        }
        break;
        
      case "2_bank_accounts":
        if (!assets.bankAccounts || assets.bankAccounts.length === 0) {
          // Check if the user's message indicates they have bank accounts
          if (
            userMessage.toLowerCase().includes("yes") ||
            userMessage.toLowerCase().includes("bank") ||
            userMessage.toLowerCase().includes("account") ||
            userMessage.toLowerCase().includes("checking") ||
            userMessage.toLowerCase().includes("savings")
          ) {
            // Ask for details about the first account
            response = "Please provide details about your first bank account: the bank name, account type (checking, savings, etc.), approximate balance, and how it's titled (sole name, joint, etc.).";
          } else if (
            userMessage.toLowerCase().includes("no") ||
            userMessage.toLowerCase().includes("don't") ||
            userMessage.toLowerCase().includes("none")
          ) {
            // No bank accounts, move to next category
            response = "Let's move on to investments. Do you have any investment accounts, stocks, bonds, or mutual funds?";
            nextState = "3_investments";
          } else {
            // Initial question
            response = "Do you have any bank accounts, such as checking, savings, CDs, or money market accounts?";
          }
        } else if (userMessage.includes("done") || userMessage.includes("that's all") || userMessage.includes("no more")) {
          // Move to next category
          response = "Now, let's discuss your investments. Do you have any brokerage accounts, stocks, bonds, or mutual funds?";
          nextState = "3_investments";
        } else {
          // Process bank account details
          // Simple parsing for demonstration
          const accountDetails = userMessage;
          
          // Create a new account entry
          const updatedBankAccounts = [...(assets.bankAccounts || [])];
          updatedBankAccounts.push({
            institution: "Bank from user message",
            accountType: "Account type from message",
            approximateValue: "Balance from message"
          });
          
          partialData = {
            assets: {
              ...assets,
              bankAccounts: updatedBankAccounts
            },
            _assetInventoryState: currentState
          };
          
          response = "Do you have any additional bank accounts? If so, please provide the same details. If not, please say 'no more accounts' or similar.";
        }
        break;
        
      // Continue with similar patterns for each asset category...
      case "3_investments":
        // Similar pattern for investments
        nextState = "4_retirement";
        response = "Let's move on to retirement accounts. Do you have any 401(k), IRA, Roth IRA, or pension plans?";
        break;
        
      case "4_retirement":
        // Similar pattern for retirement accounts
        nextState = "5_life_insurance";
        response = "Next, let's talk about life insurance. Do you have any life insurance policies, including any provided by your employer?";
        break;
        
      case "5_life_insurance":
        // Similar pattern for life insurance
        nextState = "6_business_interests";
        response = "Do you have any ownership interests in businesses, such as LLCs, corporations, or partnerships?";
        break;
        
      case "6_business_interests":
        // Similar pattern for business interests
        nextState = "7_personal_property";
        response = "Let's discuss any significant personal property you own, such as vehicles, jewelry, art, collections, etc.";
        break;
        
      case "7_personal_property":
        // Similar pattern for personal property
        nextState = "8_digital_assets";
        response = "Do you have any digital assets, such as cryptocurrency, online accounts with monetary value, or other digital properties?";
        break;
        
      case "8_digital_assets":
        // Similar pattern for digital assets
        nextState = "9_summary";
        
        // Generate a summary of all assets collected
        let assetSummary = "Based on the information you've provided, here's a summary of your assets:\n\n";
        
        if (assets.realEstate && assets.realEstate.length > 0) {
          assetSummary += `Real Estate: ${assets.realEstate.length} properties\n`;
        }
        
        if (assets.bankAccounts && assets.bankAccounts.length > 0) {
          assetSummary += `Bank Accounts: ${assets.bankAccounts.length} accounts\n`;
        }
        
        // Add other asset categories to the summary
        
        assetSummary += "\nIs there anything else you'd like to add or any corrections you'd like to make to this inventory?";
        
        response = assetSummary;
        break;
        
      case "9_summary":
        // Complete the asset inventory
        nextState = "10_complete";
        response = "Thank you for providing this comprehensive inventory of your assets. This information will be used to ensure your estate plan properly accounts for all your assets and that they are distributed according to your wishes.";
        break;
        
      case "10_complete":
        // Asset inventory is complete
        complete = true;
        response = "Your asset inventory is now complete. Let's move on to discussing how you would like these assets distributed in your estate plan.";
        break;
        
      default:
        // Default response if state is unknown
        response = "Let's continue gathering information about your assets. What other assets would you like to discuss?";
    }
    
    // If partialData wasn't set but the state changed, update the state
    if (!partialData && nextState !== currentState) {
      partialData = {
        _assetInventoryState: nextState
      };
    }
    
    return {
      response,
      complete,
      partialData
    };
  }
};

export default assetInventoryAgent; 