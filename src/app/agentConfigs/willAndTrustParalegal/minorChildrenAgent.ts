import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";

/**
 * Minor Children Agent for Will and Trust Paralegal
 * Specialized agent that handles guardianship for minor children, minor trusts, etc.
 */
const minorChildrenAgent: AgentConfig & {
  step: (userMessage: string, dataStore: EstatePlanData) => { 
    response: string;
    complete: boolean;
    partialData?: Partial<EstatePlanData>;
  }
} = {
  name: "minorChildrenAgent",
  publicDescription:
    "Specialized agent that handles guardianship for minor children and minor trusts.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER introduce yourself as a new or different agent. Do not say "Hello, I'm the guardianship specialist" or similar phrases. The user should never know they are talking to a different agent. Simply continue the conversation naturally as if you've been part of the conversation all along. Do not say "Let me continue where we left off" or make any reference to a transition having occurred.

# Personality and Tone
## Identity
You are a compassionate, understanding paralegal specializing in guardianship arrangements for minor children. You work for a reputable law firm and are responsible for gathering detailed information about minor children and guardianship wishes.

## Task
Your role is to gather specific information about the client's minor children, their desired guardianship arrangements, and any specific trust provisions for the children.

## Demeanor
You are gentle, patient, and understanding. You recognize that discussing guardianship arrangements for children can be emotionally challenging for parents, so you approach the topic with sensitivity.

## Tone
Your tone is warm, supportive, and clear. You use simple language to explain legal concepts related to guardianship and trusts for minors.

## Level of Enthusiasm
Calmly engaged - you show genuine concern for the client's children's well-being while maintaining professional composure.

## Level of Formality
Moderately informal - you use a conversational tone that puts parents at ease while discussing important legal matters.

## Level of Emotion
Empathetic but focused - you acknowledge the emotional nature of planning for children's futures while keeping the conversation productive.

# Instructions
- Gather information about each minor child (name, age).
- Ask about desired guardian arrangements, including primary and alternate guardians.
- Inquire about setting up trusts for minors and at what age they should receive full control of assets.
- Be sensitive to the emotional aspects of these decisions while ensuring all necessary information is collected.

# Conversation States
[
{
  "id": "1_intro_minors",
  "description": "Introduce the topic of guardianship for minor children.",
  "instructions": [
    "Briefly explain the importance of guardianship arrangements.",
    "Mention that this section will cover guardians and trusts for minor children."
  ],
  "transitions": [{
    "next_step": "2_gather_children_info",
    "condition": "After introduction is complete."
  }]
},
{
  "id": "2_gather_children_info",
  "description": "Gather information about each minor child.",
  "instructions": [
    "Ask for names and ages of each minor child.",
    "Request the information in a format that's easy to process (one child at a time)."
  ],
  "transitions": [{
    "next_step": "3_guardian_selection",
    "condition": "After information for all minor children is collected."
  }]
},
{
  "id": "3_guardian_selection",
  "description": "Ask about guardian preferences.",
  "instructions": [
    "Ask who they would like to name as the primary guardian for their minor children.",
    "Explain that this person would be responsible for raising their children if both parents are unable to do so.",
    "Ask for full name and relationship to the children."
  ],
  "transitions": [{
    "next_step": "4_alternate_guardian",
    "condition": "After primary guardian information is collected."
  }]
},
{
  "id": "4_alternate_guardian",
  "description": "Ask about alternate guardian preferences.",
  "instructions": [
    "Explain the importance of naming an alternate guardian in case the primary guardian is unable or unwilling to serve.",
    "Ask who they would like to name as the alternate guardian.",
    "Ask for full name and relationship to the children."
  ],
  "transitions": [{
    "next_step": "5_trust_setup",
    "condition": "After alternate guardian information is collected."
  }]
},
{
  "id": "5_trust_setup",
  "description": "Ask about trust setup for minors.",
  "instructions": [
    "Explain the concept of a trust for minor children.",
    "Ask if they want to set up a trust for their minor children.",
    "If yes, ask at what age they want their children to receive their inheritance (common ages are 21, 25, or 30)."
  ],
  "transitions": [{
    "next_step": "6_trust_details",
    "condition": "After trust decision and age is collected, if they want a trust."
  }, {
    "next_step": "7_summary",
    "condition": "If they don't want a trust."
  }]
},
{
  "id": "6_trust_details",
  "description": "Gather additional trust details.",
  "instructions": [
    "Ask if they have any specific instructions for the trust.",
    "For example, education expenses, health expenses, etc."
  ],
  "transitions": [{
    "next_step": "7_summary",
    "condition": "After trust details are collected."
  }]
},
{
  "id": "7_summary",
  "description": "Summarize the information collected.",
  "instructions": [
    "Summarize all the information collected about minor children, guardians, and trusts.",
    "Ask if everything is correct or if they'd like to make any changes."
  ],
  "transitions": [{
    "next_step": "8_complete",
    "condition": "After confirmation is received."
  }]
},
{
  "id": "8_complete",
  "description": "Complete the minor children section.",
  "instructions": [
    "Thank the client for providing this important information.",
    "Explain that you've captured all necessary details for the guardianship and trust arrangements.",
    "Mark the section as complete."
  ],
  "transitions": []
}
]`,
  tools: [],
  
  // The step method processes user messages and returns the next response
  step: function(userMessage: string, dataStore: EstatePlanData) {
    // This is a simplified implementation. In a real system, you would need to:
    // 1. Track the current state
    // 2. Process the user message based on the current state
    // 3. Determine the next state
    // 4. Generate a response based on the next state
    
    // For demonstration purposes, we'll use a very simple state machine
    // In a real implementation, you would maintain conversation state more robustly
    
    // Initialize or retrieve state from dataStore
    const minorChildrenData = dataStore.minorChildren || {};
    
    // Simple state tracking (would be more robust in real implementation)
    const hasChildren = Array.isArray(minorChildrenData.children) && minorChildrenData.children.length > 0;
    const hasGuardian = !!minorChildrenData.guardianName;
    const hasAlternateGuardian = !!minorChildrenData.alternateGuardian;
    const hasTrustAge = !!minorChildrenData.trustAge;
    const hasTrustDetails = !!minorChildrenData.trustDetails;
    
    // Determine current state and next response
    let response = "";
    let partialData: Partial<EstatePlanData> | undefined;
    let complete = false;
    
    // Process the message based on the current state
    if (!hasChildren) {
      // Parse the user message to see if they've provided child information
      if (userMessage.toLowerCase().includes("child") || userMessage.toLowerCase().includes("children")) {
        // Extract children info (simplified)
        const children = [{ name: "Child from user message", age: 10 }]; // This would actually parse the message
        
        partialData = {
          minorChildren: {
            ...minorChildrenData,
            children,
          }
        };
        
        response = "Thank you for sharing information about your children. Who would you like to name as the primary guardian for your children if you're unable to care for them? Please provide their full name.";
      } else {
        response = "Could you please share the names and ages of your minor children?";
      }
    } else if (!hasGuardian) {
      // Extract guardian info (simplified)
      const guardianName = userMessage; // This would actually parse the message
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          guardianName,
        }
      };
      
      response = "Thank you. It's also important to name an alternate guardian as a backup. Who would you like to name as the alternate guardian?";
    } else if (!hasAlternateGuardian) {
      // Extract alternate guardian info (simplified)
      const alternateGuardian = userMessage; // This would actually parse the message
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          alternateGuardian,
        }
      };
      
      response = "Would you like to appoint the same person as both guardian of your children (responsible for their care) and guardian of their estate (responsible for managing their money), or would you prefer to separate these roles?";
    } else if (!minorChildrenData.separatePropertyGuardian) {
      // Handle decision about separating guardian roles
      const wantsSeparatePropertyGuardian = 
        userMessage.toLowerCase().includes("separate") || 
        userMessage.toLowerCase().includes("different") ||
        userMessage.toLowerCase().includes("not the same");
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          separatePropertyGuardian: wantsSeparatePropertyGuardian
        }
      };
      
      if (wantsSeparatePropertyGuardian) {
        response = "Who would you like to name as the guardian of your children's property/finances?";
      } else {
        response = "Now let's talk about a trust for your children. A trust can hold assets for your children until they reach a certain age. Would you like to set up a trust, and if so, at what age should they receive their inheritance (common ages are 21, 25, or 30)?";
      }
    } else if (minorChildrenData.separatePropertyGuardian === true && !minorChildrenData.propertyGuardianName) {
      // Extract property guardian name
      const propertyGuardianName = userMessage;
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          propertyGuardianName,
        }
      };
      
      response = "Now let's talk about a trust for your children. A trust can hold assets for your children until they reach a certain age. Would you like to set up a trust, and if so, at what age should they receive their inheritance (common ages are 21, 25, or 30)?";
    } else if (!hasTrustAge) {
      // Extract trust age info (simplified)
      let trustAge: number | undefined;
      
      // Simple regex to extract numbers
      const ageMatch = userMessage.match(/\d+/);
      if (ageMatch) {
        trustAge = parseInt(ageMatch[0], 10);
      } else if (userMessage.toLowerCase().includes("no") || userMessage.toLowerCase().includes("not")) {
        // They don't want a trust
        trustAge = 18; // Default
      } else {
        trustAge = 25; // Default if they want a trust but didn't specify age
      }
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          trustAge,
        }
      };
      
      response = "Would you like to set up a staggered distribution? For example, your children could receive 1/3 at age 21, 1/3 at age 25, and the remainder at age 30.";
    } else if (!minorChildrenData.staggeredDistribution) {
      // Handle staggered distribution decision
      const wantsStaggeredDistribution = 
        userMessage.toLowerCase().includes("yes") || 
        userMessage.toLowerCase().includes("staggered") ||
        userMessage.toLowerCase().includes("stages");
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          staggeredDistribution: wantsStaggeredDistribution,
          staggeredSchedule: wantsStaggeredDistribution ? "To be determined" : "None"
        }
      };
      
      if (wantsStaggeredDistribution) {
        response = "Please specify the ages and percentages for the staggered distribution (e.g., '1/3 at 21, 1/3 at 25, remainder at 30').";
      } else {
        response = "Do you have any specific instructions for how the trust funds should be used before your children reach that age? For example, for education expenses, health expenses, etc.";
      }
    } else if (minorChildrenData.staggeredDistribution === true && minorChildrenData.staggeredSchedule === "To be determined") {
      // Extract staggered distribution schedule
      const staggeredSchedule = userMessage;
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          staggeredSchedule,
        }
      };
      
      response = "Do you have any specific instructions for how the trust funds should be used before your children reach distribution age? For example, for education expenses, health expenses, etc.";
    } else if (!hasTrustDetails) {
      // Extract trust details (simplified)
      const trustDetails = userMessage; // This would actually parse the message
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          trustDetails,
        }
      };
      
      response = "Do any of your children have special needs or require special considerations that should be addressed in your estate plan?";
    } else if (!minorChildrenData.specialNeeds) {
      // Handle special needs information
      const hasSpecialNeeds = 
        userMessage.toLowerCase().includes("yes") || 
        userMessage.toLowerCase().includes("special needs") ||
        userMessage.toLowerCase().includes("disability");
      
      if (hasSpecialNeeds) {
        partialData = {
          minorChildren: {
            ...minorChildrenData,
            specialNeeds: true,
            specialNeedsDetails: "Requires documentation"
          }
        };
        
        response = "Please provide details about the special needs or considerations so we can ensure appropriate provisions are included in your estate plan.";
      } else {
        partialData = {
          minorChildren: {
            ...minorChildrenData,
            specialNeeds: false,
            specialNeedsDetails: "None"
          }
        };
        
        // Construct a summary of the information gathered
        const childrenNames = minorChildrenData.children?.map(child => child.name).join(", ") || "your children";
        
        response = `Thank you for this important information. To summarize: you've named ${minorChildrenData.guardianName} as the primary guardian`;
        
        if (minorChildrenData.separatePropertyGuardian) {
          response += ` for personal care and ${minorChildrenData.propertyGuardianName} as guardian of property`;
        }
        
        response += ` and ${minorChildrenData.alternateGuardian} as the alternate guardian for your children. `;
        
        if (minorChildrenData.trustAge && minorChildrenData.trustAge > 18) {
          if (minorChildrenData.staggeredDistribution) {
            response += `You've chosen to set up a trust with staggered distributions: ${minorChildrenData.staggeredSchedule}. `;
          } else {
            response += `You've chosen to set up a trust that will hold their inheritance until they reach age ${minorChildrenData.trustAge}. `;
          }
          
          if (trustDetails) {
            response += `The trust funds can be used for: ${trustDetails}. `;
          }
        } else {
          response += "You've chosen not to set up a trust for your children. ";
        }
        
        response += "Is all of this information correct?";
      }
    } else if (minorChildrenData.specialNeeds === true && minorChildrenData.specialNeedsDetails === "Requires documentation") {
      // Extract special needs details
      const specialNeedsDetails = userMessage;
      
      partialData = {
        minorChildren: {
          ...minorChildrenData,
          specialNeedsDetails,
        }
      };
      
      // Construct a summary of the information gathered
      const childrenNames = minorChildrenData.children?.map(child => child.name).join(", ") || "your children";
      
      response = `Thank you for this important information. To summarize: you've named ${minorChildrenData.guardianName} as the primary guardian`;
      
      if (minorChildrenData.separatePropertyGuardian) {
        response += ` for personal care and ${minorChildrenData.propertyGuardianName} as guardian of property`;
      }
      
      response += ` and ${minorChildrenData.alternateGuardian} as the alternate guardian for your children. `;
      
      if (minorChildrenData.trustAge && minorChildrenData.trustAge > 18) {
        if (minorChildrenData.staggeredDistribution) {
          response += `You've chosen to set up a trust with staggered distributions: ${minorChildrenData.staggeredSchedule}. `;
        } else {
          response += `You've chosen to set up a trust that will hold their inheritance until they reach age ${minorChildrenData.trustAge}. `;
        }
        
        if (trustDetails) {
          response += `The trust funds can be used for: ${trustDetails}. `;
        }
      } else {
        response += "You've chosen not to set up a trust for your children. ";
      }
      
      response += `You've also specified special needs considerations: "${specialNeedsDetails}". Is all of this information correct?`;
    } else {
      // Confirmation and completion
      if (userMessage.toLowerCase().includes("yes") || userMessage.toLowerCase().includes("correct")) {
        response = "Thank you for confirming. I've recorded all the guardianship and trust arrangements for your children. Now, let's move on to discuss other important aspects of your estate plan.";
        complete = true;
      } else {
        // They want to make changes
        response = "I understand you want to make some changes. Let's start again with your children's information. Could you please share their names and ages?";
        partialData = {
          minorChildren: {} // Reset the data to start over
        };
      }
    }
    
    return {
      response,
      complete,
      partialData
    };
  }
};

export default minorChildrenAgent; 