import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";

/**
 * Executor and Trustee Agent for Will and Trust Paralegal
 * Specialized agent that handles gathering information about executors, trustees, and other fiduciaries
 */
const executorTrusteeAgent: AgentConfig & {
  step: (userMessage: string, dataStore: EstatePlanData) => { 
    response: string;
    complete: boolean;
    partialData?: Partial<EstatePlanData>;
  }
} = {
  name: "executorTrusteeAgent",
  publicDescription:
    "Specialized agent that gathers information about executors, trustees, and other fiduciaries for estate planning.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER introduce yourself as a new or different agent. Do not say "Hello, I'm the executor specialist" or similar phrases. The user should never know they are talking to a different agent. Simply continue the conversation naturally as if you've been part of the conversation all along. Do not say "Let me continue where we left off" or make any reference to a transition having occurred.

# Personality and Tone
## Identity
You are a thoughtful, detail-oriented paralegal specializing in fiduciary appointments for estate planning. You work for a reputable law firm and are responsible for helping clients select appropriate executors, trustees, and other representatives for their estate plans.

## Task
Your role is to guide clients through the selection of executors, trustees, guardians of estate, and agents for powers of attorney. You explain the roles and responsibilities of each position and gather the client's preferences.

## Demeanor
You are patient, informative, and supportive. You understand that selecting fiduciaries involves important and sometimes difficult decisions, so you provide clear information to help clients make informed choices.

## Tone
Your tone is professional and educational. You explain concepts clearly and help clients understand the importance of each role.

## Level of Enthusiasm
Moderate and thoughtful - you maintain a balanced approach that emphasizes the importance of these choices without creating anxiety.

## Level of Formality
Professional but accessible - you use proper legal terminology but explain terms clearly when needed.

## Level of Emotion
Sensitive but practical - you acknowledge the personal nature of these decisions while focusing on practical considerations.

# Instructions
- Explain the role and responsibilities of each fiduciary position when appropriate.
- Guide clients through the selection of executors, trustees, guardians of estate, and agents for powers of attorney.
- Ask about primary and alternate choices for each position.
- Explain important considerations for each role (e.g., trustworthiness, financial acumen, proximity).
- Be sensitive to family dynamics when discussing these choices.
- Clarify if the same person will serve in multiple roles or if different individuals will be selected.

# Conversation States
[
{
  "id": "1_explain_roles",
  "description": "Explain the roles of executors and trustees.",
  "instructions": [
    "Briefly explain the role of an executor/personal representative.",
    "Briefly explain the role of a trustee.",
    "Highlight the importance of selecting appropriate people for these roles."
  ],
  "transitions": [{
    "next_step": "2_executor_selection",
    "condition": "After explanation is complete."
  }]
},
{
  "id": "2_executor_selection",
  "description": "Guide the selection of an executor.",
  "instructions": [
    "Ask who they would like to name as their executor/personal representative.",
    "Explain that this person will be responsible for administering their estate after death."
  ],
  "transitions": [{
    "next_step": "3_alternate_executor",
    "condition": "After primary executor is selected."
  }]
},
{
  "id": "3_alternate_executor",
  "description": "Guide the selection of an alternate executor.",
  "instructions": [
    "Ask who they would like to name as an alternate executor.",
    "Explain the importance of having a backup in case the primary executor is unable or unwilling to serve."
  ],
  "transitions": [{
    "next_step": "4_trustee_selection",
    "condition": "After alternate executor is selected."
  }]
},
{
  "id": "4_trustee_selection",
  "description": "Guide the selection of a trustee.",
  "instructions": [
    "Ask if they want the same person as executor to serve as trustee or if they want to name someone else.",
    "If selecting someone different, ask who they would like to name as trustee."
  ],
  "transitions": [{
    "next_step": "5_alternate_trustee",
    "condition": "After primary trustee is selected."
  }]
},
{
  "id": "5_alternate_trustee",
  "description": "Guide the selection of an alternate trustee.",
  "instructions": [
    "Ask who they would like to name as an alternate trustee.",
    "If they've selected the same person for executor and trustee, suggest they might want to do the same for alternates."
  ],
  "transitions": [{
    "next_step": "6_financial_poa",
    "condition": "After alternate trustee is selected."
  }]
},
{
  "id": "6_financial_poa",
  "description": "Guide the selection of a financial power of attorney agent.",
  "instructions": [
    "Explain the role of a financial power of attorney.",
    "Ask who they would like to name as their agent for financial decisions if they become incapacitated."
  ],
  "transitions": [{
    "next_step": "7_healthcare_poa",
    "condition": "After financial power of attorney agent is selected."
  }]
},
{
  "id": "7_healthcare_poa",
  "description": "Guide the selection of a healthcare power of attorney agent.",
  "instructions": [
    "Explain the role of a healthcare power of attorney.",
    "Ask who they would like to name as their agent for healthcare decisions if they become incapacitated."
  ],
  "transitions": [{
    "next_step": "8_summary",
    "condition": "After healthcare power of attorney agent is selected."
  }]
},
{
  "id": "8_summary",
  "description": "Summarize the fiduciary selections.",
  "instructions": [
    "Summarize all the fiduciary selections made.",
    "Ask if everything is correct or if they'd like to make any changes."
  ],
  "transitions": [{
    "next_step": "9_complete",
    "condition": "After confirmation is received."
  }]
},
{
  "id": "9_complete",
  "description": "Complete the fiduciary selection process.",
  "instructions": [
    "Thank the client for making these important decisions.",
    "Explain that these selections will be incorporated into their estate planning documents.",
    "Mark the fiduciary selection process as complete."
  ],
  "transitions": []
}
]`,
  tools: [],
  
  // The step method processes user messages and returns the next response
  step: function(userMessage: string, dataStore: EstatePlanData) {
    // Initialize or retrieve state from dataStore
    const executorTrustee = dataStore.executorTrustee || {};
    
    // Keep track of the current state
    const currentState = dataStore._executorTrusteeState || "1_explain_roles";
    
    // Determine current state and next response
    let response = "";
    let partialData: Partial<EstatePlanData> | undefined;
    let complete = false;
    let nextState = currentState;
    
    // Process based on current state
    switch (currentState) {
      case "1_explain_roles":
        // Initial explanation of roles
        response = "Now let's discuss who you'd like to appoint to manage your estate and trust. An executor (also called a personal representative) is responsible for managing your estate after your passing, including filing your will with the court, paying debts, and distributing assets. A trustee manages any trusts you create, potentially for years afterward. Who would you like to name as your executor?";
        nextState = "2_executor_selection";
        break;
        
      case "2_executor_selection":
        // Process executor selection
        const executorName = userMessage;
        
        partialData = {
          executorTrustee: {
            ...executorTrustee,
            executorName
          },
          _executorTrusteeState: currentState
        };
        
        response = `Thank you for selecting ${executorName} as your executor. It's important to name an alternate executor in case ${executorName} is unable or unwilling to serve. Who would you like to name as your alternate executor?`;
        nextState = "3_alternate_executor";
        break;
        
      case "3_alternate_executor":
        // Process alternate executor selection
        const alternatExecutor = userMessage;
        
        partialData = {
          executorTrustee: {
            ...executorTrustee,
            alternatExecutor
          },
          _executorTrusteeState: currentState
        };
        
        response = `Would you like the same person, ${executorTrustee.executorName}, to serve as your trustee, or would you prefer to name someone else? You can say "same person" or provide a different name.`;
        nextState = "4_trustee_selection";
        break;
        
      case "4_trustee_selection":
        // Process trustee selection
        let trusteeName;
        
        if (userMessage.toLowerCase().includes("same") || userMessage.toLowerCase().includes(executorTrustee.executorName?.toLowerCase() || "")) {
          trusteeName = executorTrustee.executorName;
          response = `Thank you for selecting ${trusteeName} as both your executor and trustee. Would you like your alternate trustee to be the same as your alternate executor (${executorTrustee.alternatExecutor}), or would you prefer to name someone else?`;
        } else {
          trusteeName = userMessage;
          response = `Thank you for selecting ${trusteeName} as your trustee. Who would you like to name as your alternate trustee in case ${trusteeName} is unable or unwilling to serve?`;
        }
        
        partialData = {
          executorTrustee: {
            ...executorTrustee,
            trusteeName
          },
          _executorTrusteeState: currentState
        };
        
        nextState = "5_alternate_trustee";
        break;
        
      case "5_alternate_trustee":
        // Process alternate trustee selection
        let alternateTrustee;
        
        if (userMessage.toLowerCase().includes("same") || userMessage.toLowerCase().includes(executorTrustee.alternatExecutor?.toLowerCase() || "")) {
          alternateTrustee = executorTrustee.alternatExecutor;
        } else {
          alternateTrustee = userMessage;
        }
        
        partialData = {
          executorTrustee: {
            ...executorTrustee,
            alternateTrustee
          },
          _executorTrusteeState: currentState
        };
        
        response = "A financial power of attorney allows someone to make financial decisions for you if you become incapacitated. Who would you like to name as your agent for financial decisions?";
        nextState = "6_financial_poa";
        break;
        
      case "6_financial_poa":
        // Process financial POA selection
        const financialPOA = userMessage;
        
        partialData = {
          executorTrustee: {
            ...executorTrustee,
            powersOfAttorney: {
              ...executorTrustee.powersOfAttorney,
              financialPOA
            }
          },
          _executorTrusteeState: currentState
        };
        
        response = "A healthcare power of attorney allows someone to make medical decisions for you if you're unable to do so. Who would you like to name as your agent for healthcare decisions?";
        nextState = "7_healthcare_poa";
        break;
        
      case "7_healthcare_poa":
        // Process healthcare POA selection
        const healthcarePOA = userMessage;
        
        partialData = {
          executorTrustee: {
            ...executorTrustee,
            powersOfAttorney: {
              ...executorTrustee.powersOfAttorney,
              healthcarePOA
            }
          },
          _executorTrusteeState: currentState
        };
        
        // Prepare summary of selections
        response = "Thank you for making these important selections. Here's a summary of your choices:\n\n";
        response += `Executor: ${executorTrustee.executorName}\n`;
        response += `Alternate Executor: ${executorTrustee.alternatExecutor}\n`;
        response += `Trustee: ${executorTrustee.trusteeName}\n`;
        response += `Alternate Trustee: ${executorTrustee.alternateTrustee}\n`;
        response += `Financial Power of Attorney: ${financialPOA}\n`;
        response += `Healthcare Power of Attorney: ${healthcarePOA}\n\n`;
        response += "Is all of this information correct, or would you like to make any changes?";
        
        nextState = "8_summary";
        break;
        
      case "8_summary":
        // Process confirmation or changes
        if (userMessage.toLowerCase().includes("yes") || userMessage.toLowerCase().includes("correct")) {
          response = "Thank you for confirming these important selections. These individuals will be named in your estate planning documents with the responsibilities we've discussed. Their contact information will be collected separately.";
          nextState = "9_complete";
        } else {
          // They want to make changes - would implement a change process here
          response = "I understand you want to make some changes. Let's start again with your executor selection. Who would you like to name as your executor?";
          nextState = "2_executor_selection";
        }
        break;
        
      case "9_complete":
        // Complete the fiduciary selection process
        response = "Your fiduciary appointments have been recorded. These individuals will play important roles in carrying out your wishes according to your estate plan.";
        complete = true;
        break;
        
      default:
        // Default response if state is unknown
        response = "Let's discuss who you'd like to appoint to handle your affairs. Who would you like to name as your executor?";
        nextState = "2_executor_selection";
    }
    
    // If partialData wasn't set but the state changed, update the state
    if (!partialData && nextState !== currentState) {
      partialData = {
        _executorTrusteeState: nextState
      };
    }
    
    return {
      response,
      complete,
      partialData
    };
  }
};

export default executorTrusteeAgent; 