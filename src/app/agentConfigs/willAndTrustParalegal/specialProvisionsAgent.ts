import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";

/**
 * Special Provisions Agent for Will and Trust Paralegal
 * Specialized agent that handles gathering information about special provisions and unique circumstances
 */
const specialProvisionsAgent: AgentConfig & {
  step: (userMessage: string, dataStore: EstatePlanData) => { 
    response: string;
    complete: boolean;
    partialData?: Partial<EstatePlanData>;
  }
} = {
  name: "specialProvisionsAgent",
  publicDescription:
    "Specialized agent that gathers information about special provisions and unique circumstances for estate planning.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER introduce yourself as a new or different agent. Do not say "Hello, I'm the special provisions specialist" or similar phrases. The user should never know they are talking to a different agent. Simply continue the conversation naturally as if you've been part of the conversation all along. Do not say "Let me continue where we left off" or make any reference to a transition having occurred.

# Personality and Tone
## Identity
You are an attentive, thoughtful paralegal specializing in special provisions for estate planning. You work for a reputable law firm and are responsible for gathering information about unique circumstances and special considerations for estate plans.

## Task
Your role is to identify and address special considerations that might not be covered in standard estate planning, such as pet care, burial instructions, digital assets, and other unique circumstances.

## Demeanor
You are thoughtful, thorough, and sensitive. You understand that some of these topics may be emotionally charged or easily overlooked, so you approach them with care and attention to detail.

## Tone
Your tone is considerate and thorough. You ask questions carefully to ensure all special considerations are addressed.

## Level of Enthusiasm
Thoughtful and measured - you maintain a balanced approach that acknowledges the personal nature of these topics.

## Level of Formality
Personable but professional - you use a conversational tone while ensuring all necessary information is gathered.

## Level of Emotion
Empathetic and attentive - you acknowledge the personal significance of these special considerations.

# Instructions
- Ask about pet provisions, burial instructions, digital assets, and other special considerations.
- Be thorough in gathering details about each special provision.
- Be sensitive to the emotional nature of some of these topics.
- Provide clear explanations of how these special provisions can be incorporated into the estate plan.
- Reassure clients that these unique circumstances can be addressed in their estate plan.

# Conversation States
[
{
  "id": "1_pet_provisions",
  "description": "Gather information about pet provisions.",
  "instructions": [
    "Ask if the client has pets they want to provide for.",
    "If yes, gather information about the pets and who they want to care for them.",
    "Ask if they want to set up a pet trust with funds for the pet's care."
  ],
  "transitions": [{
    "next_step": "2_burial_instructions",
    "condition": "After pet provision information is collected, or if client has no pets."
  }]
},
{
  "id": "2_burial_instructions",
  "description": "Gather information about burial or funeral instructions.",
  "instructions": [
    "Ask if the client has specific burial or funeral wishes.",
    "If yes, gather details about those instructions.",
    "Ask if they have any prepaid funeral arrangements."
  ],
  "transitions": [{
    "next_step": "3_digital_assets",
    "condition": "After burial instruction information is collected, or if client has no specific instructions."
  }]
},
{
  "id": "3_digital_assets",
  "description": "Gather information about digital assets and accounts.",
  "instructions": [
    "Ask about digital assets like online accounts, social media, email, etc.",
    "Gather information about how they want these handled.",
    "Note if they have a password manager or other system for accessing these accounts."
  ],
  "transitions": [{
    "next_step": "4_other_provisions",
    "condition": "After digital asset information is collected."
  }]
},
{
  "id": "4_other_provisions",
  "description": "Ask about any other special provisions or considerations.",
  "instructions": [
    "Ask if there are any other special circumstances or considerations they want addressed.",
    "Gather details about any other special provisions."
  ],
  "transitions": [{
    "next_step": "5_summary",
    "condition": "After other special provision information is collected."
  }]
},
{
  "id": "5_summary",
  "description": "Summarize the special provisions information collected.",
  "instructions": [
    "Summarize all the special provisions information collected.",
    "Ask if anything has been missed or if there are any other special considerations."
  ],
  "transitions": [{
    "next_step": "6_complete",
    "condition": "After confirmation that all special provisions have been covered."
  }]
},
{
  "id": "6_complete",
  "description": "Complete the special provisions section.",
  "instructions": [
    "Thank the client for sharing this information.",
    "Explain how these special provisions will be incorporated into their estate plan.",
    "Mark the special provisions section as complete."
  ],
  "transitions": []
}
]`,
  tools: [],
  
  // The step method processes user messages and returns the next response
  step: function(userMessage: string, dataStore: EstatePlanData) {
    // Initialize or retrieve state from dataStore
    const specialProvisions = dataStore.specialProvisions || {};
    
    // Keep track of the current state
    const currentState = dataStore._specialProvisionsState || "1_pet_provisions";
    
    // Determine current state and next response
    let response = "";
    let partialData: Partial<EstatePlanData> | undefined;
    let complete = false;
    let nextState = currentState;
    
    // Process based on current state
    switch (currentState) {
      case "1_pet_provisions":
        if (specialProvisions.petProvisions?.hasPets === undefined) {
          // Check if the user's message indicates they have pets
          if (
            userMessage.toLowerCase().includes("yes") ||
            userMessage.toLowerCase().includes("dog") ||
            userMessage.toLowerCase().includes("cat") ||
            userMessage.toLowerCase().includes("pet")
          ) {
            partialData = {
              specialProvisions: {
                ...specialProvisions,
                petProvisions: {
                  ...specialProvisions.petProvisions,
                  hasPets: true
                }
              },
              _specialProvisionsState: currentState
            };
            
            response = "Please tell me about your pets (type, names, ages) and who you would like to care for them if you're unable to do so.";
          } else if (
            userMessage.toLowerCase().includes("no") ||
            userMessage.toLowerCase().includes("don't") ||
            userMessage.toLowerCase().includes("none")
          ) {
            partialData = {
              specialProvisions: {
                ...specialProvisions,
                petProvisions: {
                  hasPets: false
                }
              },
              _specialProvisionsState: currentState
            };
            
            response = "Do you have any specific burial or funeral wishes you'd like to document in your estate plan?";
            nextState = "2_burial_instructions";
          } else {
            response = "Do you have any pets that you'd like to make provisions for in your estate plan?";
          }
        } else if (specialProvisions.petProvisions.hasPets && !specialProvisions.petProvisions.petDetails) {
          // Gather pet details and caregiver
          const petDetails = userMessage;
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              petProvisions: {
                ...specialProvisions.petProvisions,
                petDetails
              }
            },
            _specialProvisionsState: currentState
          };
          
          response = "Would you like to set aside funds specifically for your pet's care? This could be through a formal pet trust or a simpler arrangement with the caregiver.";
        } else if (specialProvisions.petProvisions.hasPets && specialProvisions.petProvisions.petTrust === undefined) {
          // Determine if they want a pet trust
          const wantsPetTrust = 
            userMessage.toLowerCase().includes("yes") || 
            userMessage.toLowerCase().includes("fund") || 
            userMessage.toLowerCase().includes("money") || 
            userMessage.toLowerCase().includes("trust");
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              petProvisions: {
                ...specialProvisions.petProvisions,
                petTrust: wantsPetTrust
              }
            },
            _specialProvisionsState: currentState
          };
          
          if (wantsPetTrust) {
            response = "How much would you like to set aside for your pet's care?";
          } else {
            response = "Do you have any specific burial or funeral wishes you'd like to document in your estate plan?";
            nextState = "2_burial_instructions";
          }
        } else if (specialProvisions.petProvisions.hasPets && specialProvisions.petProvisions.petTrust && !specialProvisions.petProvisions.petTrustAmount) {
          // Gather pet trust amount
          const petTrustAmount = userMessage;
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              petProvisions: {
                ...specialProvisions.petProvisions,
                petTrustAmount
              }
            },
            _specialProvisionsState: currentState
          };
          
          response = "Do you have any specific burial or funeral wishes you'd like to document in your estate plan?";
          nextState = "2_burial_instructions";
        } else {
          response = "Do you have any specific burial or funeral wishes you'd like to document in your estate plan?";
          nextState = "2_burial_instructions";
        }
        break;
        
      case "2_burial_instructions":
        if (specialProvisions.burialInstructions?.hasBurialInstructions === undefined) {
          // Check if they have burial instructions
          if (
            userMessage.toLowerCase().includes("yes") ||
            userMessage.toLowerCase().includes("cremation") ||
            userMessage.toLowerCase().includes("burial") ||
            userMessage.toLowerCase().includes("funeral")
          ) {
            partialData = {
              specialProvisions: {
                ...specialProvisions,
                burialInstructions: {
                  ...specialProvisions.burialInstructions,
                  hasBurialInstructions: true
                }
              },
              _specialProvisionsState: currentState
            };
            
            response = "Please describe your burial or funeral wishes in as much detail as you'd like.";
          } else if (
            userMessage.toLowerCase().includes("no") ||
            userMessage.toLowerCase().includes("don't") ||
            userMessage.toLowerCase().includes("none")
          ) {
            partialData = {
              specialProvisions: {
                ...specialProvisions,
                burialInstructions: {
                  hasBurialInstructions: false
                }
              },
              _specialProvisionsState: currentState
            };
            
            response = "Do you have any digital assets or online accounts that need to be addressed in your estate plan? This might include email accounts, social media, digital currencies, or other digital property.";
            nextState = "3_digital_assets";
          } else {
            response = "Do you have any specific burial or funeral wishes you'd like to document in your estate plan?";
          }
        } else if (specialProvisions.burialInstructions.hasBurialInstructions && !specialProvisions.burialInstructions.instructions) {
          // Gather burial instructions
          const instructions = userMessage;
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              burialInstructions: {
                ...specialProvisions.burialInstructions,
                instructions
              }
            },
            _specialProvisionsState: currentState
          };
          
          response = "Have you made any prepaid funeral arrangements or purchased burial plots?";
        } else if (specialProvisions.burialInstructions.hasBurialInstructions && specialProvisions.burialInstructions.prepaidArrangements === undefined) {
          // Determine if they have prepaid arrangements
          const prepaidArrangements = 
            userMessage.toLowerCase().includes("yes") || 
            userMessage.toLowerCase().includes("prepaid") || 
            userMessage.toLowerCase().includes("purchased");
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              burialInstructions: {
                ...specialProvisions.burialInstructions,
                prepaidArrangements
              }
            },
            _specialProvisionsState: currentState
          };
          
          response = "Do you have any digital assets or online accounts that need to be addressed in your estate plan? This might include email accounts, social media, digital currencies, or other digital property.";
          nextState = "3_digital_assets";
        } else {
          response = "Do you have any digital assets or online accounts that need to be addressed in your estate plan? This might include email accounts, social media, digital currencies, or other digital property.";
          nextState = "3_digital_assets";
        }
        break;
        
      case "3_digital_assets":
        if (specialProvisions.digitalAssetInstructions === undefined) {
          // Check if they have digital assets
          if (
            userMessage.toLowerCase().includes("yes") ||
            userMessage.toLowerCase().includes("email") ||
            userMessage.toLowerCase().includes("account") ||
            userMessage.toLowerCase().includes("social") ||
            userMessage.toLowerCase().includes("crypto") ||
            userMessage.toLowerCase().includes("digital")
          ) {
            response = "Please tell me about your digital assets and how you'd like them handled. Also, do you have a password manager or other system for accessing these accounts?";
          } else if (
            userMessage.toLowerCase().includes("no") ||
            userMessage.toLowerCase().includes("don't") ||
            userMessage.toLowerCase().includes("none")
          ) {
            partialData = {
              specialProvisions: {
                ...specialProvisions,
                digitalAssetInstructions: "None"
              },
              _specialProvisionsState: currentState
            };
            
            response = "Are there any other special circumstances or considerations you'd like to address in your estate plan? For example, care for a family member with special needs, specific heirlooms with sentimental value, or other unique situations.";
            nextState = "4_other_provisions";
          } else {
            response = "Do you have any digital assets or online accounts that need to be addressed in your estate plan? This might include email accounts, social media, digital currencies, or other digital property.";
          }
        } else if (specialProvisions.digitalAssetInstructions === "Processing") {
          // Gather digital asset instructions
          const digitalAssetInstructions = userMessage;
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              digitalAssetInstructions
            },
            _specialProvisionsState: currentState
          };
          
          response = "Are there any other special circumstances or considerations you'd like to address in your estate plan? For example, care for a family member with special needs, specific heirlooms with sentimental value, or other unique situations.";
          nextState = "4_other_provisions";
        } else {
          // If they said yes but we didn't mark as processing
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              digitalAssetInstructions: "Processing"
            },
            _specialProvisionsState: currentState
          };
          
          response = "Please tell me about your digital assets and how you'd like them handled. Also, do you have a password manager or other system for accessing these accounts?";
        }
        break;
        
      case "4_other_provisions":
        if (specialProvisions.otherSpecialInstructions === undefined) {
          // Check if they have other special instructions
          if (
            userMessage.toLowerCase().includes("yes") ||
            userMessage.toLowerCase().includes("special") ||
            userMessage.toLowerCase().includes("need") ||
            userMessage.toLowerCase().includes("heirloom") ||
            userMessage.toLowerCase().includes("specific")
          ) {
            response = "Please describe any other special circumstances or considerations you'd like to address in your estate plan.";
          } else if (
            userMessage.toLowerCase().includes("no") ||
            userMessage.toLowerCase().includes("don't") ||
            userMessage.toLowerCase().includes("none")
          ) {
            partialData = {
              specialProvisions: {
                ...specialProvisions,
                otherSpecialInstructions: "None"
              },
              _specialProvisionsState: currentState
            };
            
            // Prepare summary of special provisions
            let summary = "Here's a summary of the special provisions we've discussed:\n\n";
            
            if (specialProvisions.petProvisions?.hasPets) {
              summary += "Pet Provisions: ";
              if (specialProvisions.petProvisions.petDetails) {
                summary += `${specialProvisions.petProvisions.petDetails}`;
              }
              if (specialProvisions.petProvisions.petTrust) {
                summary += ` with ${specialProvisions.petProvisions.petTrustAmount} set aside for their care`;
              }
              summary += "\n";
            }
            
            if (specialProvisions.burialInstructions?.hasBurialInstructions) {
              summary += "Burial Instructions: ";
              if (specialProvisions.burialInstructions.instructions) {
                summary += specialProvisions.burialInstructions.instructions;
              }
              if (specialProvisions.burialInstructions.prepaidArrangements) {
                summary += " (Prepaid arrangements in place)";
              }
              summary += "\n";
            }
            
            if (specialProvisions.digitalAssetInstructions && specialProvisions.digitalAssetInstructions !== "None") {
              summary += `Digital Assets: ${specialProvisions.digitalAssetInstructions}\n`;
            }
            
            summary += "\nIs this information correct, or would you like to make any changes or additions?";
            
            response = summary;
            nextState = "5_summary";
          } else {
            response = "Are there any other special circumstances or considerations you'd like to address in your estate plan? For example, care for a family member with special needs, specific heirlooms with sentimental value, or other unique situations.";
          }
        } else if (specialProvisions.otherSpecialInstructions === "Processing") {
          // Gather other special instructions
          const otherSpecialInstructions = userMessage;
          
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              otherSpecialInstructions
            },
            _specialProvisionsState: currentState
          };
          
          // Prepare summary of special provisions
          let summary = "Here's a summary of the special provisions we've discussed:\n\n";
          
          if (specialProvisions.petProvisions?.hasPets) {
            summary += "Pet Provisions: ";
            if (specialProvisions.petProvisions.petDetails) {
              summary += `${specialProvisions.petProvisions.petDetails}`;
            }
            if (specialProvisions.petProvisions.petTrust) {
              summary += ` with ${specialProvisions.petProvisions.petTrustAmount} set aside for their care`;
            }
            summary += "\n";
          }
          
          if (specialProvisions.burialInstructions?.hasBurialInstructions) {
            summary += "Burial Instructions: ";
            if (specialProvisions.burialInstructions.instructions) {
              summary += specialProvisions.burialInstructions.instructions;
            }
            if (specialProvisions.burialInstructions.prepaidArrangements) {
              summary += " (Prepaid arrangements in place)";
            }
            summary += "\n";
          }
          
          if (specialProvisions.digitalAssetInstructions && specialProvisions.digitalAssetInstructions !== "None") {
            summary += `Digital Assets: ${specialProvisions.digitalAssetInstructions}\n`;
          }
          
          if (otherSpecialInstructions && otherSpecialInstructions !== "None") {
            summary += `Other Special Instructions: ${otherSpecialInstructions}\n`;
          }
          
          summary += "\nIs this information correct, or would you like to make any changes or additions?";
          
          response = summary;
          nextState = "5_summary";
        } else {
          // If they said yes but we didn't mark as processing
          partialData = {
            specialProvisions: {
              ...specialProvisions,
              otherSpecialInstructions: "Processing"
            },
            _specialProvisionsState: currentState
          };
          
          response = "Please describe any other special circumstances or considerations you'd like to address in your estate plan.";
        }
        break;
        
      case "5_summary":
        // Process confirmation or changes
        if (userMessage.toLowerCase().includes("yes") || userMessage.toLowerCase().includes("correct")) {
          response = "Thank you for confirming. All of your special provisions have been recorded and will be incorporated into your estate planning documents as appropriate.";
          nextState = "6_complete";
        } else {
          // They want to make changes - would implement a change process here
          response = "I understand you want to make some changes. Let's start again. Do you have any pets that you'd like to make provisions for in your estate plan?";
          partialData = {
            specialProvisions: {},
            _specialProvisionsState: "1_pet_provisions"
          };
        }
        break;
        
      case "6_complete":
        // Complete the special provisions section
        response = "Your special provisions have been recorded and will be included in your estate planning documents. These details will help ensure your estate plan addresses all your unique circumstances and wishes.";
        complete = true;
        break;
        
      default:
        // Default response if state is unknown
        response = "Let's discuss any special provisions you'd like to include in your estate plan. Do you have any pets that you'd like to make provisions for?";
        nextState = "1_pet_provisions";
    }
    
    // If partialData wasn't set but the state changed, update the state
    if (!partialData && nextState !== currentState) {
      partialData = {
        _specialProvisionsState: nextState
      };
    }
    
    return {
      response,
      complete,
      partialData
    };
  }
};

export default specialProvisionsAgent; 