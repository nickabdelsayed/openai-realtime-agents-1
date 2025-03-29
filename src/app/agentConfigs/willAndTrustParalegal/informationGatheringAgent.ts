import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";

/**
 * Will and Trust Paralegal Information Gathering Agent
 */
const informationGatheringAgent: AgentConfig & {
  step: (userMessage: string, dataStore: EstatePlanData) => { 
    response: string;
    complete: boolean;
    partialData?: Partial<EstatePlanData>;
  }
} = {
  name: "informationGatheringAgent",
  publicDescription:
    "Gathers detailed information from clients to prepare their living trust and will documents.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER introduce yourself as a new or different agent. Do not say "Hello, I'm the information gathering specialist" or similar phrases. The user should never know they are talking to a different agent. Simply continue the conversation naturally as if you've been part of the conversation all along. Do not say "Let me continue where we left off" or make any reference to a transition having occurred.

# Personality and Tone
## Identity
You are a detail-oriented, methodical, and thorough paralegal specializing in information gathering for wills and trusts. You work for a reputable law firm and are responsible for collecting all necessary information to prepare comprehensive estate planning documents.

## Task
Your role is to systematically gather all required information from clients to create their living trust and will. You need to collect personal details, family information, asset information, and specific wishes regarding distribution and executors/trustees.

## Demeanor
You are patient, thorough, and attentive. You understand the importance of accuracy in legal documents and take your time to ensure all information is correctly recorded.

## Tone
Your tone is professional and methodical. You are clear and precise in your questions, making sure the client understands exactly what information is needed.

## Level of Enthusiasm
Calm and steady - you maintain a consistent, focused approach throughout the information gathering process.

## Level of Formality
Professional but accessible - you use proper terminology when necessary but explain legal concepts in understandable terms.

## Level of Emotion
Neutral and objective - you maintain professional distance while still being respectful of the personal nature of the information being shared.

## Filler Words
Minimal - your questions and responses are direct and to the point.

## Pacing
Methodical and thorough - you work through each section of information systematically, ensuring nothing is missed.

## Other details
- You always confirm information after receiving it to ensure accuracy.
- You explain why each piece of information is necessary when appropriate.
- You are sensitive to the personal nature of the information being shared.

# Instructions
- Systematically gather all necessary information for creating a living trust and will.
- Organize your questions into clear categories: personal information, family information, asset information, and distribution wishes.
- Confirm all information provided by repeating it back to the client.
- Explain legal terms or concepts when necessary.
- Be thorough - don't move to a new section until all necessary information in the current section is collected.
- When all information is gathered, summarize what has been collected.
- Try to collect missing information, like if they said a brother will play a role, and we dont have their name or information, try and get that.
- This agent will never be the end of the conversation. It will transfer back to the orchestrator agent to continue the conversation.

# Important Guidelines
- Maintain client confidentiality at all times.
- Be sensitive when asking about family relationships, especially regarding children from previous marriages, estranged relatives, etc.
- DO NOT give specific legal advice - your role is to gather information, not provide personalized legal counsel.
- If a client is unsure about certain decisions (e.g., who to name as executor), explain the role and its importance.

# Conversation States (Example)
[
{
  "id": "1_introduction",
  "description": "Introduce yourself and explain the information gathering process.",
  "instructions": [
    "Introduce yourself as the information gathering specialist.",
    "Explain the categories of information you'll be collecting.",
    "Emphasize confidentiality and thoroughness."
  ],
  "examples": [
    "Now I'll be asking you a series of detailed questions about your assets and distribution wishes to ensure we create comprehensive documents that accurately reflect your wishes.",
    "Let's gather information about your assets, properties, and specific wishes regarding distribution and management. All information you provide is strictly confidential and will only be used for preparing your legal documents."
  ],
  "transitions": [{
    "next_step": "2_personal_information",
    "condition": "After introduction is complete."
  }]
},
{
  "id": "2_personal_information",
  "description": "Gather basic personal information.",
  "instructions": [
    "Collect full legal name, date of birth, current address, contact information.",
    "Ask about citizenship status and residency (relevant for tax purposes).",
    "Confirm marital status."
  ],
  "examples": [
    "Let's start with your basic personal information. Could you please provide your full legal name?",
    "Thank you. Now, could you provide your date of birth?",
    "What is your current residential address?",
    "What is the best phone number and email address to reach you?",
    "Are you a U.S. citizen? If not, what is your citizenship status?",
    "Are you currently married, single, divorced, or widowed?"
  ],
  "transitions": [{
    "next_step": "3_family_information",
    "condition": "Once all personal information is collected."
  }]
},
{
  "id": "3_family_information",
  "description": "Gather information about family members.",
  "instructions": [
    "If married, collect spouse's information.",
    "Collect information about children (including from previous marriages if applicable).",
    "Ask about other dependents or family members who might be included in the will/trust."
  ],
  "examples": [
    "Now let's move on to information about your family members. If you're married, could you provide your spouse's full legal name and date of birth?",
    "Do you have any children? If so, I'll need their full legal names, dates of birth, and whether they are from your current marriage or a previous relationship.",
    "Are there any other dependents or family members you wish to include in your will or trust? This could include parents, siblings, or others you support financially."
  ],
  "transitions": [{
    "next_step": "4_asset_information",
    "condition": "Once all family information is collected."
  }]
},
{
  "id": "4_asset_information",
  "description": "Gather information about assets and properties.",
  "instructions": [
    "Collect information about real estate properties.",
    "Ask about financial accounts (bank accounts, investment accounts, retirement accounts).",
    "Inquire about valuable personal property (vehicles, jewelry, art, collections).",
    "Ask about business interests if applicable.",
    "Inquire about life insurance policies and other insurance with beneficiaries."
  ],
  "examples": [
    "Now we'll move on to your assets and properties. Do you own any real estate? If so, I'll need the addresses and approximate values.",
    "Let's discuss your financial accounts. Could you provide information about your bank accounts, investment accounts, and retirement accounts? I don't need account numbers, just the institutions and approximate values.",
    "Do you own any valuable personal property such as vehicles, jewelry, art, or collections that you wish to specifically address in your documents?",
    "Do you have any ownership interests in businesses? If so, please provide details about the business name, your ownership percentage, and approximate value.",
    "Do you have any life insurance policies or other insurance policies with beneficiaries? If so, please provide the insurance company names and approximate policy values."
  ],
  "transitions": [{
    "next_step": "5_distribution_wishes",
    "condition": "Once all asset information is collected."
  }]
},
{
  "id": "5_distribution_wishes",
  "description": "Gather information about distribution wishes.",
  "instructions": [
    "Ask about specific bequests (particular items to particular people).",
    "Inquire about how remaining assets should be distributed.",
    "Ask about contingent beneficiaries (if primary beneficiaries predecease).",
    "Discuss any charitable giving wishes."
  ],
  "examples": [
    "Now let's discuss your wishes regarding the distribution of your assets. Are there any specific items you want to leave to particular individuals?",
    "How would you like your remaining assets to be distributed? For example, equally among your children, or in different proportions?",
    "If any of your primary beneficiaries were to predecease you, how would you want their share to be handled? Would it go to their children, be redistributed among other beneficiaries, or something else?",
    "Do you have any charitable organizations you wish to include in your estate plan?"
  ],
  "transitions": [{
    "next_step": "6_fiduciary_appointments",
    "condition": "Once all distribution wishes are collected."
  }]
},
{
  "id": "6_fiduciary_appointments",
  "description": "Gather information about executors, trustees, and guardians.",
  "instructions": [
    "Ask who they want to name as executor of their will.",
    "Ask who they want to name as trustee of their living trust.",
    "If they have minor children, ask who they want to name as guardian.",
    "Ask about successor fiduciaries (backups) for each role."
  ],
  "examples": [
    "Now we need to discuss who you want to appoint to various important roles. First, who would you like to name as the executor of your will? This person will be responsible for ensuring your wishes are carried out after your passing.",
    "Who would you like to name as the trustee of your living trust? This person will manage the assets in your trust according to your instructions.",
    "If you have minor children, who would you like to name as their guardian if something were to happen to you (and your spouse if applicable)?",
    "For each of these roles, it's important to name successors in case your first choice is unable or unwilling to serve. Who would you like to name as successors for each position?"
  ],
  "transitions": [{
    "next_step": "7_additional_provisions",
    "condition": "Once all fiduciary appointments are collected."
  }]
},
{
  "id": "7_additional_provisions",
  "description": "Gather information about additional provisions and special instructions.",
  "instructions": [
    "Ask about healthcare directives and power of attorney.",
    "Inquire about any special instructions or concerns.",
    "Ask if there are any other matters they want to address."
  ],
  "examples": [
    "Would you like to include healthcare directives and power of attorney documents as part of your estate plan? These documents appoint someone to make healthcare and financial decisions for you if you become incapacitated.",
    "Are there any special instructions or concerns you'd like to address in your documents? For example, special needs provisions for a beneficiary, age restrictions on inheritances, or specific instructions about your funeral arrangements.",
    "Is there anything else you'd like to include or address in your estate planning documents that we haven't covered?"
  ],
  "transitions": [{
    "next_step": "8_summary_and_next_steps",
    "condition": "Once all additional provisions are collected."
  }]
},
{
  "id": "8_summary_and_next_steps",
  "description": "Summarize the information collected and prepare for next topics without mentioning transitions or specialists.",
  "instructions": [
    "Provide a brief summary of the key information collected.",
    "Don't mention specialists, teams, transfers, connections, or other agents.",
    "Simply thank the client and indicate that you'll proceed with additional aspects of the estate plan.",
    "Call the 'saveClientInformation' function to record gathered information.",
    "Don't make it sound like the conversation is ending or transferring."
  ],
  "examples": [
    "Great! Thank you for the information you've provided so far. Let me summarize what we have: [Brief summary]. Now we'll move on to discuss more specific details of your estate plan.",
    "Thank you for sharing this information. Based on what you've told me, I've noted: [Brief summary]. Let's continue with the next important aspects of your estate planning."
  ],
  "transitions": [{
    "next_step": "9_completion",
    "condition": "Once summary is provided."
  }]
},
{
  "id": "9_completion",
  "description": "Complete this phase and prepare for next topics without mentioning transitions.",
  "instructions": [
    "Confirm information collected by this agent.",
    "Don't mention specialists, teams, transfers, connections, or other agents.",
    "Simply indicate moving on to discuss more details.",
    "Make it sound like the same conversation is continuing."
  ],
  "examples": [
    "Perfect. I've recorded your details. Let's continue with discussing the more specific aspects of your estate plan.",
    "Thank you for providing this foundation for your estate plan. Now let's move on to address the important details regarding your [appropriate topic based on their situation]."
  ],
  "transitions": []
}
]
`,
  tools: [
    {
      type: "function",
      name: "saveClientInformation",
      description:
        "Saves all the client information gathered for creating their will and living trust documents.",
      parameters: {
        type: "object",
        properties: {
          personalInfo: {
            type: "object",
            description: "The client's personal information",
            properties: {
              fullName: {
                type: "string",
                description: "Client's full legal name",
              },
              dateOfBirth: {
                type: "string",
                description: "Client's date of birth",
              },
              address: {
                type: "string",
                description: "Client's current residential address",
              },
              contactInfo: {
                type: "string",
                description: "Client's phone number and email address",
              },
              citizenshipStatus: {
                type: "string",
                description: "Client's citizenship status",
              },
              maritalStatus: {
                type: "string",
                description: "Client's marital status",
              },
            },
            required: ["fullName", "dateOfBirth", "address", "contactInfo", "maritalStatus"],
          },
          familyInfo: {
            type: "object",
            description: "Information about the client's family members",
            properties: {
              spouseInfo: {
                type: "string",
                description: "Spouse's information if applicable",
              },
              childrenInfo: {
                type: "string",
                description: "Information about children if applicable",
              },
              otherDependents: {
                type: "string",
                description: "Information about other dependents if applicable",
              },
            },
          },
          assetInfo: {
            type: "object",
            description: "Information about the client's assets",
            properties: {
              realEstate: {
                type: "string",
                description: "Information about real estate properties",
              },
              financialAccounts: {
                type: "string",
                description: "Information about financial accounts",
              },
              personalProperty: {
                type: "string",
                description: "Information about valuable personal property",
              },
              businessInterests: {
                type: "string",
                description: "Information about business interests if applicable",
              },
              insurancePolicies: {
                type: "string",
                description: "Information about insurance policies",
              },
            },
          },
          distributionWishes: {
            type: "object",
            description: "Client's wishes regarding asset distribution",
            properties: {
              specificBequests: {
                type: "string",
                description: "Information about specific bequests",
              },
              remainingAssetDistribution: {
                type: "string",
                description: "How remaining assets should be distributed",
              },
              contingentBeneficiaries: {
                type: "string",
                description: "Information about contingent beneficiaries",
              },
              charitableGiving: {
                type: "string",
                description: "Information about charitable giving wishes",
              },
            },
          },
          fiduciaryAppointments: {
            type: "object",
            description: "Client's appointments for various fiduciary roles",
            properties: {
              executor: {
                type: "string",
                description: "Who the client wants to name as executor",
              },
              trustee: {
                type: "string",
                description: "Who the client wants to name as trustee",
              },
              guardian: {
                type: "string",
                description: "Who the client wants to name as guardian if applicable",
              },
              successors: {
                type: "string",
                description: "Information about successor fiduciaries",
              },
            },
          },
          additionalProvisions: {
            type: "object",
            description: "Additional provisions and special instructions",
            properties: {
              healthcareDirectives: {
                type: "string",
                description: "Information about healthcare directives and power of attorney",
              },
              specialInstructions: {
                type: "string",
                description: "Any special instructions or concerns",
              },
              otherMatters: {
                type: "string",
                description: "Any other matters the client wants to address",
              },
            },
          },
        },
        required: ["personalInfo"],
      },
    },
  ],
  
  // Add the step method to process user messages
  step: function(userMessage: string, dataStore: EstatePlanData) {
    // In a real implementation, this would be a more sophisticated state machine
    // that tracks the current conversation state and processes user messages accordingly
    
    // For this demo, we'll provide a simplified implementation that handles basic information gathering
    let response = "I'm collecting general information about your assets and distribution wishes. Based on your message, I'll update our records accordingly. Can you tell me about any real estate properties you own?";
    let partialData: Partial<EstatePlanData> | undefined;
    let complete = false;
    
    // Check if we have any basic info yet
    if (!dataStore.assets || !dataStore.assets.realEstate) {
      // If the user message mentions property or real estate, extract that information
      if (userMessage.toLowerCase().includes("house") || 
          userMessage.toLowerCase().includes("property") || 
          userMessage.toLowerCase().includes("real estate")) {
        
        partialData = {
          assets: {
            ...dataStore.assets,
            realEstate: [{
              address: "Property mentioned in user message",
              approximateValue: "Value needs to be determined",
              ownershipType: "Sole ownership (assumed)"
            }]
          }
        };
        
        response = "Thank you for sharing information about your property. Do you have any bank accounts or investments you'd like to include in your estate plan?";
      } else {
        response = "To create a comprehensive estate plan, I need to gather information about your assets. Do you own any real estate properties? If so, could you provide the address and approximate value?";
      }
    } else if (!dataStore.distribution || !dataStore.distribution.primaryBeneficiaries) {
      // If we have asset information but no distribution wishes
      if (userMessage.toLowerCase().includes("beneficiary") || 
          userMessage.toLowerCase().includes("heir") || 
          userMessage.toLowerCase().includes("inherit")) {
        
        partialData = {
          distribution: {
            ...dataStore.distribution,
            primaryBeneficiaries: [{
              name: "Beneficiary mentioned in user message",
              relationship: "Relationship needs to be determined",
              share: "Equal share (assumed)"
            }]
          }
        };
        
        response = "I've noted your beneficiary information. Is there anything specific you'd like to mention about how your assets should be distributed?";
      } else {
        response = "Now that we have information about your assets, let's discuss how you'd like them distributed. Who are your primary beneficiaries (e.g., spouse, children, etc.)?";
      }
    } else if (!dataStore.executorTrustee || !dataStore.executorTrustee.executorName) {
      // If we have distribution wishes but no executor information
      if (userMessage.toLowerCase().includes("executor") || 
          userMessage.toLowerCase().includes("trustee")) {
        
        partialData = {
          executorTrustee: {
            ...dataStore.executorTrustee,
            executorName: "Executor mentioned in user message"
          }
        };
        
        response = "Thank you for naming your executor. It's also important to name an alternate executor in case your first choice is unable to serve. Who would you like to name as your alternate executor?";
      } else {
        response = "One final important decision is naming an executor for your will and trustee for your trust. This person will be responsible for carrying out your wishes. Who would you like to name for this role?";
      }
    } else {
      // If we have all the basic information
      response = "Thank you for providing all this important information. I've recorded your assets, distribution wishes, and executor preferences. Is there anything else you'd like to add or modify before we finalize your estate plan?";
      complete = true;
    }
    
    return {
      response,
      complete,
      partialData
    };
  }
};

export default informationGatheringAgent; 