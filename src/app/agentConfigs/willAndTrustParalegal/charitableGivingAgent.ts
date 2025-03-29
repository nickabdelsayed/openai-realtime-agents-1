import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";

/**
 * Charitable Giving Agent for Will and Trust Paralegal
 * Specialized agent that handles charitable bequests and charitable remainder trusts.
 */
const charitableGivingAgent: AgentConfig & {
  step: (userMessage: string, dataStore: EstatePlanData) => { 
    response: string;
    complete: boolean;
    partialData?: Partial<EstatePlanData>;
  }
} = {
  name: "charitableGivingAgent",
  publicDescription:
    "Specialized agent that handles charitable bequests and giving options.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER introduce yourself as a new or different agent. Do not say "Hello, I'm the charitable giving specialist" or similar phrases. The user should never know they are talking to a different agent. Simply continue the conversation naturally as if you've been part of the conversation all along. Do not say "Let me continue where we left off" or make any reference to a transition having occurred.

# Personality and Tone
## Identity
You are a thoughtful, knowledgeable paralegal specializing in charitable giving options within estate planning. You work for a reputable law firm and are responsible for helping clients incorporate charitable giving into their estate plans.

## Task
Your role is to gather specific information about the client's charitable giving intentions, including which charities they wish to benefit, how much they want to give, and through what mechanisms.

## Demeanor
You are thoughtful, supportive, and non-judgmental. You recognize that charitable giving is often deeply personal and tied to a client's values and life experiences.

## Tone
Your tone is respectful, encouraging, and informative. You provide clear explanations of charitable giving options without overwhelming clients with technical details.

## Level of Enthusiasm
Moderately enthusiastic - you show genuine appreciation for a client's charitable intentions while maintaining professional composure.

## Level of Formality
Semi-formal - you use a professional but warm tone that acknowledges the meaningful nature of charitable giving decisions.

## Level of Emotion
Appreciative but objective - you acknowledge the personal significance of charitable giving while focusing on the practical aspects of implementing these wishes.

# Instructions
- Ask if the client wishes to include charitable bequests in their estate plan.
- For those who do, gather specific information about each charity (name, location).
- Determine the amount or percentage of assets they wish to donate to each charity.
- Inquire about any fallback instructions if the named charity no longer exists.
- Explore whether a Charitable Remainder Trust might be appropriate, if substantial assets are involved.

# Conversation States
[
{
  "id": "1_intro_charitable",
  "description": "Introduce the topic of charitable giving in estate planning.",
  "instructions": [
    "Briefly explain how charitable bequests can be included in a will or trust.",
    "Mention that you'll be gathering information about their charitable intentions."
  ],
  "transitions": [{
    "next_step": "2_confirm_charitable_intent",
    "condition": "After introduction is complete."
  }]
},
{
  "id": "2_confirm_charitable_intent",
  "description": "Confirm whether the client wants to include charitable giving in their estate plan.",
  "instructions": [
    "Ask if they want to include charitable giving in their estate plan.",
    "If yes, proceed to gathering details; if no, complete this section."
  ],
  "transitions": [{
    "next_step": "3_charity_details",
    "condition": "If they want to include charitable giving."
  }, {
    "next_step": "8_complete",
    "condition": "If they don't want to include charitable giving."
  }]
},
{
  "id": "3_charity_details",
  "description": "Gather details about the charities they wish to benefit.",
  "instructions": [
    "Ask for the name and location of each charity they wish to benefit.",
    "Process one charity at a time for clarity."
  ],
  "transitions": [{
    "next_step": "4_donation_amount",
    "condition": "After charity information is collected."
  }]
},
{
  "id": "4_donation_amount",
  "description": "Determine the amount or percentage they wish to donate.",
  "instructions": [
    "Ask how much they wish to donate to each charity.",
    "This can be a specific dollar amount, percentage of the estate, or specific assets."
  ],
  "transitions": [{
    "next_step": "5_fallback_instructions",
    "condition": "After donation amount is specified."
  }]
},
{
  "id": "5_fallback_instructions",
  "description": "Ask about fallback instructions if the charity no longer exists.",
  "instructions": [
    "Explain that sometimes charities merge, dissolve, or change their mission.",
    "Ask what they would like to happen if their named charity no longer exists at the time of distribution."
  ],
  "transitions": [{
    "next_step": "6_additional_charities",
    "condition": "After fallback instructions are collected."
  }]
},
{
  "id": "6_additional_charities",
  "description": "Ask if they wish to include additional charities.",
  "instructions": [
    "Ask if they wish to include any additional charities in their estate plan.",
    "If yes, loop back to gather details about the next charity."
  ],
  "transitions": [{
    "next_step": "3_charity_details",
    "condition": "If they want to include additional charities."
  }, {
    "next_step": "7_summary",
    "condition": "If they don't want to include additional charities."
  }]
},
{
  "id": "7_summary",
  "description": "Summarize the charitable giving information collected.",
  "instructions": [
    "Summarize all the information collected about charitable giving intentions.",
    "Ask if everything is correct or if they'd like to make any changes."
  ],
  "transitions": [{
    "next_step": "8_complete",
    "condition": "After confirmation is received."
  }]
},
{
  "id": "8_complete",
  "description": "Complete the charitable giving section.",
  "instructions": [
    "Thank the client for providing this information.",
    "If they chose to include charitable giving, acknowledge the positive impact of their decision.",
    "Mark the section as complete."
  ],
  "transitions": []
}
]`,
  tools: [],
  
  // The step method processes user messages and returns the next response
  step: function(userMessage: string, dataStore: EstatePlanData) {
    // Initialize or retrieve state from dataStore
    const charitableData = dataStore.charitableGiving || {};
    const charities = charitableData.charities || [];
    
    // Simple state tracking
    const hasConfirmedIntent = typeof charitableData.wantsCharity === 'boolean';
    const wantsCharity = charitableData.wantsCharity === true;
    const currentCharity = charities.length > 0 ? charities[charities.length - 1] : null;
    const hasCurrentCharityName = currentCharity && currentCharity.name;
    const hasCurrentCharityAmount = currentCharity && currentCharity.amount;
    const hasCurrentCharityFallback = currentCharity && currentCharity.fallbackInstructions;
    const askedAboutMoreCharities = charitableData.askedAboutMoreCharities === true;
    const isConfirmed = charitableData.isConfirmed === true;
    
    // Determine current state and next response
    let response = "";
    let partialData: Partial<EstatePlanData> | undefined;
    let complete = false;
    
    // Simplified decision tree
    if (!hasConfirmedIntent) {
      // Check if the user has indicated their charitable intent
      if (
        userMessage.toLowerCase().includes("yes") || 
        userMessage.toLowerCase().includes("charity") || 
        userMessage.toLowerCase().includes("donate")
      ) {
        partialData = {
          charitableGiving: {
            ...charitableData,
            wantsCharity: true,
            charities: []
          }
        };
        
        response = "Great! Could you please tell me the name of a charity you'd like to include in your estate plan?";
      } else if (
        userMessage.toLowerCase().includes("no") || 
        userMessage.toLowerCase().includes("not") || 
        userMessage.toLowerCase().includes("don't")
      ) {
        partialData = {
          charitableGiving: {
            ...charitableData,
            wantsCharity: false
          }
        };
        
        response = "That's perfectly fine. Let's move on to discussing your assets and how you'd like them distributed.";
        complete = true;
      } else {
        response = "Would you like to include any charitable donations in your estate plan?";
      }
    } else if (wantsCharity) {
      // Process charitable giving information
      if (!hasCurrentCharityName || (!currentCharity.name && charities.length === 0)) {
        // Extract charity name (simplified)
        const charityName = userMessage; // This would actually parse the message more intelligently
        
        // Create or update the current charity
        const updatedCharities = [...charities];
        if (updatedCharities.length === 0 || hasCurrentCharityFallback) {
          // Start a new charity record
          updatedCharities.push({ name: charityName, amount: "" });
        } else {
          // Update the current charity record
          updatedCharities[updatedCharities.length - 1].name = charityName;
        }
        
        partialData = {
          charitableGiving: {
            ...charitableData,
            charities: updatedCharities
          }
        };
        
        response = `How much would you like to donate to ${charityName}? This can be a specific dollar amount, a percentage of your estate, or specific assets.`;
      } else if (!hasCurrentCharityAmount) {
        // Extract donation amount (simplified)
        const donationAmount = userMessage; // This would actually parse the message more intelligently
        
        // Update the current charity
        const updatedCharities = [...charities];
        updatedCharities[updatedCharities.length - 1].amount = donationAmount;
        
        partialData = {
          charitableGiving: {
            ...charitableData,
            charities: updatedCharities
          }
        };
        
        response = "Is this donation intended to be for a specific purpose or program within the charity? If so, please specify any restrictions or designations.";
      } else if (!currentCharity.purposeRestriction) {
        // Extract purpose restriction
        const purposeRestriction = userMessage;
        
        // Update the current charity
        const updatedCharities = [...charities];
        updatedCharities[updatedCharities.length - 1].purposeRestriction = 
          userMessage.toLowerCase().includes("no") || 
          userMessage.toLowerCase().includes("none") || 
          userMessage.toLowerCase().includes("general") ? 
          "None/General" : purposeRestriction;
        
        partialData = {
          charitableGiving: {
            ...charitableData,
            charities: updatedCharities
          }
        };
        
        response = `Sometimes charities merge or dissolve over time. If ${currentCharity.name} no longer exists when your estate plan takes effect, what would you like to happen? For example, you might specify an alternate charity or allow your executor to select a similar organization.`;
      } else if (!hasCurrentCharityFallback) {
        // Extract fallback instructions (simplified)
        const fallbackInstructions = userMessage; // This would actually parse the message more intelligently
        
        // Update the current charity
        const updatedCharities = [...charities];
        updatedCharities[updatedCharities.length - 1].fallbackInstructions = fallbackInstructions;
        
        partialData = {
          charitableGiving: {
            ...charitableData,
            charities: updatedCharities
          }
        };
        
        response = "Are you interested in establishing a Charitable Remainder Trust that would provide income to you or your beneficiaries during their lifetime, with the remainder going to charity?";
      } else if (charitableData.charitableRemainderTrust === undefined) {
        // Extract charitable remainder trust preference
        const wantsCRT = 
          userMessage.toLowerCase().includes("yes") || 
          userMessage.toLowerCase().includes("interest") || 
          userMessage.toLowerCase().includes("establish");
        
        partialData = {
          charitableGiving: {
            ...charitableData,
            charitableRemainderTrust: wantsCRT
          }
        };
        
        if (wantsCRT) {
          response = "Establishing a Charitable Remainder Trust often requires specialized advice. We'll note your interest and provide additional information separately. Would you like to include any additional charities in your estate plan?";
        } else {
          response = "Would you like to include any additional charities in your estate plan?";
        }
      } else if (!askedAboutMoreCharities) {
        // Check if they want to add more charities
        if (
          userMessage.toLowerCase().includes("yes") || 
          userMessage.toLowerCase().includes("another") || 
          userMessage.toLowerCase().includes("more")
        ) {
          partialData = {
            charitableGiving: {
              ...charitableData,
              askedAboutMoreCharities: true
            }
          };
          
          response = "Please tell me the name of the next charity you'd like to include.";
        } else {
          partialData = {
            charitableGiving: {
              ...charitableData,
              askedAboutMoreCharities: true
            }
          };
          
          // Prepare a summary of all charities
          const charitySummary = charities.map(charity => {
            let summary = `${charity.name} (${charity.amount})`;
            
            if (charity.purposeRestriction && charity.purposeRestriction !== "None/General") {
              summary += ` for ${charity.purposeRestriction}`;
            }
            
            if (charity.fallbackInstructions) {
              summary += ` with fallback: ${charity.fallbackInstructions}`;
            }
            
            return summary;
          }).join("; ");
          
          let crtNote = "";
          if (charitableData.charitableRemainderTrust) {
            crtNote = " You've also expressed interest in a Charitable Remainder Trust.";
          }
          
          response = `To summarize: you've chosen to include ${charities.length} ${charities.length === 1 ? "charity" : "charities"} in your estate plan: ${charitySummary}.${crtNote} Is this information correct?`;
        }
      } else if (!isConfirmed) {
        // Check if they confirm the information
        if (
          userMessage.toLowerCase().includes("yes") || 
          userMessage.toLowerCase().includes("correct")
        ) {
          partialData = {
            charitableGiving: {
              ...charitableData,
              isConfirmed: true
            }
          };
          
          response = "Thank you. Your charitable giving intentions have been recorded.";
          complete = true;
        } else {
          // They want to make changes
          response = "I understand you'd like to make some changes. Let's start over. Would you like to include any charitable donations in your estate plan?";
          partialData = {
            charitableGiving: {
              wantsCharity: undefined,
              charities: [],
              askedAboutMoreCharities: false,
              isConfirmed: false
            }
          };
        }
      }
    } else {
      // They don't want to include charitable giving
      complete = true;
      response = "I've noted that you don't wish to include charitable giving in your estate plan.";
    }
    
    return {
      response,
      complete,
      partialData
    };
  }
};

export default charitableGivingAgent; 