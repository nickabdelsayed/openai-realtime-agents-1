import { AgentConfig } from "@/app/types";
import { EstatePlanData } from "./types";
import { mergeEstatePlanData } from "./mergeData";
import minorChildrenAgent from "./minorChildrenAgent";
import charitableGivingAgent from "./charitableGivingAgent";
import informationGatheringAgent from "./informationGatheringAgent";
import assetInventoryAgent from "./assetInventoryAgent";
import executorTrusteeAgent from "./executorTrusteeAgent";
import specialProvisionsAgent from "./specialProvisionsAgent";

/**
 * Will and Trust Paralegal Orchestrator Agent
 * Serves as the main coordinator that manages specialized agents
 */
const orchestratorAgent: AgentConfig & {
  step: (userMessage: string) => { 
    response: string;
    dataStore: EstatePlanData;
  }
} = {
  name: "orchestratorAgent",
  publicDescription:
    "Introduces the Will and Trust Paralegal service and coordinates the information gathering process.",
  instructions: `
# CRITICAL INSTRUCTION - READ FIRST
NEVER mention "transfers" or "specialized agents" to the user. The user should never know they are being transferred between different agents. Do not say phrases like "I'll transfer you" or "I'll connect you with a specialist." Simply transition naturally to the next topic without any meta-commentary about the conversation process itself.

DO NOT provide explanations about what wills and trusts are unless the user explicitly asks for this information. If they simply say they want to create a will, trust, or both, proceed directly to gathering information without explaining what these documents are.

NEVER use words like "lastly" or "finally" unless you are actually asking the last question. Do not say "I'll now proceed with preparing your documents" after just gathering basic information - there are many more questions to come.

# Personality and Tone
## Identity
You are a friendly, knowledgeable, and professional paralegal specializing in wills and trusts named Lia (Legal Intelligent Assistant). You work for a reputable law firm and are the first point of contact for clients seeking to create a living trust and will.

## Task
Your role is to welcome clients, explain the process of creating a living trust and will, and set expectations for the information gathering process. You'll introduce the overall service and coordinate the gathering of all necessary information.

## Demeanor
You are warm, patient, and reassuring. You understand that estate planning can be intimidating for many people, so you strive to make the process feel approachable and manageable.

## Tone
Your tone is professional yet conversational. You avoid excessive legal jargon and explain concepts in clear, accessible language.

## Level of Enthusiasm
Moderately enthusiastic - you show genuine interest in helping the client but maintain a professional demeanor appropriate for legal matters.

## Level of Formality
Semi-formal - professional but approachable. You use respectful language but avoid being overly stiff or formal.

## Level of Emotion
Empathetic but measured - you acknowledge the importance and sometimes sensitive nature of estate planning while maintaining professional boundaries.

## Filler Words
Minimal - your responses are clear and concise, though occasionally you might use thoughtful pauses or phrases like "Let me explain..." to emphasize important points.

## Pacing
Fast and deliberate - There is a lot of information to gather and you need to get through it efficiently.

## Other details
- You always ask if the client has any questions before moving on to the next topic.
- You emphasize that all information shared will be kept confidential.
- You reassure clients that they can take their time with the process.

# Instructions
- Begin by introducing yourself and explaining your role as a paralegal specializing in wills and trusts.
- Provide a brief overview of what a living trust and will are, and why they're important.
- Gather basic user information like name, marital status, whether they have minor children, and if they have charitable bequests.
- Based on their answers, determine which topics to cover in the conversation.
- Maintain a seamless conversation flow as you move between different topics.
- Maintain a global data store with all information collected.
- When all necessary information has been gathered, summarize what has been collected and explain next steps.

# Conversation States
[
{
  "id": "1_greeting",
  "description": "Greet the client and introduce yourself.",
  "instructions": [
    "Introduce yourself as a paralegal specializing in wills and trusts.",
    "Welcome them to the service."
  ],
  "examples": [
    "Hello and welcome! My name is Lia, and I'm here to help you begin the process of creating your living trust and will documents. Do you want to create a Trust, a Will, or both? If you need me to explain the difference, just ask.",
    "Thank you for choosing our services for your estate planning needs. My name is Lia, I'll be guiding you through the process of creating your estate planning documents. Would you like to create a Will, a Living Trust, or both today?"
  ],
  "transitions": [{
    "next_step": "2_explain_purpose",
    "condition": "After greeting is complete."
  }]
},
{
  "id": "2_explain_purpose",
  "description": "Explain the purpose and importance of wills and living trusts ONLY if asked.",
  "instructions": [
    "ONLY explain what wills and living trusts are if the client specifically asks.",
    "If they don't ask for an explanation, proceed directly to gathering information.",
    "Do not provide explanations unless explicitly requested."
  ],
  "examples": [
    "If client asks: A will is a legal document that outlines how you want your assets distributed after your passing. A living trust is a more comprehensive document that not only addresses asset distribution but also allows for management of your assets during your lifetime if you become incapacitated.",
    "If client doesn't ask: Great! Let's get started by gathering some basic information. Could you please tell me your full name?"
  ],
  "transitions": [{
    "next_step": "3_gather_basic_info",
    "condition": "Once explanation is provided (if requested) or immediately if no explanation is requested."
  }]
},
{
  "id": "3_gather_basic_info",
  "description": "Gather basic information to determine which specialized agents to use.",
  "instructions": [
    "Ask for the client's full name.",
    "Ask about marital status.",
    "Ask if they have minor children.",
    "Ask if they want to include charitable bequests."
  ],
  "examples": [
    "Now, I'd like to gather some basic information to get started. Could you please tell me your full name?",
    "Next, could you share your marital status? Are you single, married, divorced, or widowed?",
    "Do you have any minor children (under 18 years old)?",
    "Are you interested in including any charitable giving in your estate plan?"
  ],
  "transitions": [{
    "next_step": "4_process_specialized_agents",
    "condition": "Once basic information is gathered."
  }]
},
{
  "id": "4_process_specialized_agents",
  "description": "Process specialized agents based on the basic information.",
  "instructions": [
    "Determine which specialized agents to use based on the client's answers.",
    "Add them to a queue for processing.",
    "Begin processing the first agent in the queue."
  ],
  "transitions": [{
    "next_step": "5_finalize",
    "condition": "Once all specialized agents have been processed."
  }]
},
{
  "id": "5_finalize",
  "description": "Finalize the information gathering process.",
  "instructions": [
    "Summarize all the information collected.",
    "Explain the next steps in the process.",
    "Thank the client for their time and information."
  ],
  "examples": [
    "Thank you for providing all the necessary information for your estate plan. Based on what you've shared, we'll create a comprehensive will and living trust that reflects your wishes for your assets, your beneficiaries, and any special provisions you've requested.",
    "Our legal team will now draft your documents based on the information you've provided. Once completed, you'll have an opportunity to review them before they're finalized. If you have any questions or need to update any information, please don't hesitate to reach out."
  ],
  "transitions": []
}
]`,
  tools: [],

  // Global data store for estate planning information
  _estatePlanData: {} as EstatePlanData,
  
  // Queue of specialized agents to process
  _agentQueue: [] as Array<{
    agent: typeof minorChildrenAgent | typeof charitableGivingAgent | typeof informationGatheringAgent | typeof assetInventoryAgent | typeof executorTrusteeAgent | typeof specialProvisionsAgent,
    processed: boolean
  }>,
  
  // Current conversation state
  _currentState: "1_greeting" as string,
  
  // Current active agent (if any)
  _currentAgent: null as null | typeof minorChildrenAgent | typeof charitableGivingAgent | typeof informationGatheringAgent | typeof assetInventoryAgent | typeof executorTrusteeAgent | typeof specialProvisionsAgent,

  // The step method processes user messages and coordinates the agent flow
  step: function(userMessage: string) {
    console.log("OrchestratorAgent step called with message:", userMessage);
    console.log("Current state:", this._currentState);
    console.log("Current agent:", this._currentAgent ? this._currentAgent.name : "none");
    
    let response = "";
    
    // Process the message based on the current state
    if (this._currentAgent) {
      console.log("Delegating to specialized agent:", this._currentAgent.name);
      // If we have an active specialized agent, pass the message to it
      const result = this._currentAgent.step(userMessage, this._estatePlanData);
      
      // If the agent returns partial data, merge it into our global store
      if (result.partialData) {
        this._estatePlanData = mergeEstatePlanData(this._estatePlanData, result.partialData);
      }
      
      if (result.complete) {
        console.log("Specialized agent completed, moving to next agent");
        // Mark the current agent as processed
        this._agentQueue.find(a => a.agent === this._currentAgent)!.processed = true;
        
        // Move to the next agent in the queue or back to the orchestrator
        this._currentAgent = null;
        return this._processNextAgent();
      }
      
      // Return the agent's response
      return {
        response: result.response,
        dataStore: this._estatePlanData
      };
    }
    
    // Handle orchestrator states
    switch (this._currentState) {
      case "1_greeting":
        response = "Hello and welcome! I'm your Will and Trust Paralegal assistant. I'm here to help you begin the process of creating your living trust and will documents. Do you want to create a Trust, a Will, or both? If you need me to explain the difference, just ask.";
        this._currentState = "2_explain_purpose";
        break;
        
      case "2_explain_purpose":
        // Only provide explanations if they specifically ask
        if (userMessage.toLowerCase().includes("explain") || 
            userMessage.toLowerCase().includes("difference") ||
            userMessage.toLowerCase().includes("what is") ||
            userMessage.toLowerCase().includes("what are") ||
            userMessage.toLowerCase().includes("tell me more")) {
          
          response = "A Will is a legal document that outlines how you want your assets distributed after your passing. A Living Trust is a more comprehensive document that not only addresses asset distribution but also allows for management of your assets during your lifetime if you become incapacitated.";
          this._currentState = "3_gather_basic_info";
        } else if (userMessage.toLowerCase().includes("both")) {
          // If they want both, skip explanations and go directly to gathering info
          response = "Great! Let's get started by gathering some basic information. Could you please tell me your full name?";
          this._currentState = "3_gather_basic_info";
        } else if (userMessage.toLowerCase().includes("will") || 
                  userMessage.toLowerCase().includes("trust")) {
          // If they want one or the other, still skip explanations unless asked
          response = "Perfect. Let's get started by gathering some basic information. Could you please tell me your full name?";
          this._currentState = "3_gather_basic_info";
        } else {
          // If they don't specify or ask for an explanation, prompt them again
          response = "Would you like to create a Will, a Living Trust, or both? Or would you like me to explain the difference between them?";
          // Stay in the same state until we get a clear answer
        }
        break;
        
      case "3_gather_basic_info":
        // Process basic information based on the user message
        if (!this._estatePlanData.basicInfo?.fullName) {
          // Extract name from user message (simplified)
          const fullName = userMessage; // In a real implementation, this would actually parse the message
          
          this._estatePlanData.basicInfo = {
            ...this._estatePlanData.basicInfo,
            fullName
          };
          
          response = `Thank you, ${fullName}. Could you please share your marital status? Are you single, married, divorced, or widowed?`;
        } else if (!this._estatePlanData.basicInfo?.maritalStatus) {
          // Extract marital status from user message (simplified)
          const maritalStatus = userMessage.toLowerCase();
          
          this._estatePlanData.basicInfo = {
            ...this._estatePlanData.basicInfo,
            maritalStatus
          };
          
          response = "Do you have any minor children (under 18 years old)?";
        } else if (typeof this._estatePlanData.basicInfo?.hasMinorChildren !== 'boolean') {
          // Extract information about minor children
          const hasMinorChildren = 
            userMessage.toLowerCase().includes("yes") || 
            userMessage.toLowerCase().includes("have") ||
            userMessage.toLowerCase().includes("child") || 
            userMessage.toLowerCase().includes("children");
          
          this._estatePlanData.basicInfo = {
            ...this._estatePlanData.basicInfo,
            hasMinorChildren
          };
          
          response = "Are you interested in including any charitable giving in your estate plan?";
        } else if (typeof this._estatePlanData.basicInfo?.hasCharitableBequests !== 'boolean') {
          // Extract information about charitable bequests
          const hasCharitableBequests = 
            userMessage.toLowerCase().includes("yes") || 
            userMessage.toLowerCase().includes("charity") || 
            userMessage.toLowerCase().includes("donate");
          
          // Handle ambiguous responses like "Oh, thank you" as a "no"
          if (!hasCharitableBequests && 
              !userMessage.toLowerCase().includes("no") && 
              !userMessage.toLowerCase().includes("not")) {
            // If the response is ambiguous, assume "no" for charitable bequests
            this._estatePlanData.basicInfo = {
              ...this._estatePlanData.basicInfo,
              hasCharitableBequests: false
            };
          } else {
            this._estatePlanData.basicInfo = {
              ...this._estatePlanData.basicInfo,
              hasCharitableBequests
            };
          }
          
          // Transition to processing specialized agents with a clear message
          response = "Now that we have the basic information, let's gather more details to complete your estate plan.";
          this._currentState = "4_process_specialized_agents";
          
          // Return here to ensure we don't override the response
          const result = this._setupAgentQueue();
          return {
            response: response,
            dataStore: this._estatePlanData
          };
        }
        break;
        
      case "4_process_specialized_agents":
        // This state is handled by the _processNextAgent method
        return this._processNextAgent();
        
      case "5_finalize":
        response = "Thank you for providing all the necessary information for your estate plan. Based on what you've shared, we'll create a comprehensive will and living trust that reflects your wishes. Our legal team will now draft your documents based on the information you've provided. Once completed, you'll have an opportunity to review them before they're finalized.";
        break;
        
      default:
        response = "I'm not sure where we are in the process. Let's start over with some basic information. Could you please tell me your full name?";
        this._currentState = "3_gather_basic_info";
    }
    
    return {
      response,
      dataStore: this._estatePlanData
    };
  },
  
  // Setup the agent queue based on basic information
  _setupAgentQueue: function() {
    this._agentQueue = [];
    
    // Add specialized agents based on client information
    if (this._estatePlanData.basicInfo?.hasMinorChildren === true) {
      this._agentQueue.push({
        agent: minorChildrenAgent,
        processed: false
      });
      console.log("Added minorChildrenAgent to queue");
    }
    
    if (this._estatePlanData.basicInfo?.hasCharitableBequests === true) {
      this._agentQueue.push({
        agent: charitableGivingAgent,
        processed: false
      });
      console.log("Added charitableGivingAgent to queue");
    }
    
    // Add asset inventory agent for all clients
    this._agentQueue.push({
      agent: assetInventoryAgent,
      processed: false
    });
    console.log("Added assetInventoryAgent to queue");
    
    // Add executor/trustee agent for all clients
    this._agentQueue.push({
      agent: executorTrusteeAgent,
      processed: false
    });
    console.log("Added executorTrusteeAgent to queue");
    
    // Add special provisions agent for all clients
    this._agentQueue.push({
      agent: specialProvisionsAgent,
      processed: false
    });
    console.log("Added specialProvisionsAgent to queue");
    
    // Always add the general information gathering agent
    this._agentQueue.push({
      agent: informationGatheringAgent,
      processed: false
    });
    console.log("Added informationGatheringAgent to queue");
    console.log("Agent queue length:", this._agentQueue.length);
    
    // Process the first agent in the queue
    const nextAgentItem = this._agentQueue[0];
    if (nextAgentItem) {
      this._currentAgent = nextAgentItem.agent;
      console.log("Setting current agent to:", this._currentAgent.name);
      
      // Prepare the transition message
      let response = "";
      
      if (this._currentAgent === minorChildrenAgent) {
        response = "Now that we have the basic information, let's discuss guardianship for your minor children. Could you please tell me the names and ages of your minor children?";
      } else if (this._currentAgent === charitableGivingAgent) {
        response = "Would you like to include any charitable donations in your estate plan?";
      } else if (this._currentAgent === assetInventoryAgent) {
        response = "Now, let's gather information about your assets. Do you own any real estate properties?";
      } else if (this._currentAgent === executorTrusteeAgent) {
        response = "Let's discuss who you would like to name as your executor and trustee. An executor is responsible for managing your estate after your passing. Who would you like to name as your executor?";
      } else if (this._currentAgent === specialProvisionsAgent) {
        response = "Let's discuss any special provisions you might want in your estate plan. Do you have any pets that you'd like to make provisions for?";
      } else if (this._currentAgent === informationGatheringAgent) {
        // Customize based on what information we already have
        response = "Now that we have the basic information, let's gather more details to complete your estate plan. ";
        
        if (this._estatePlanData.basicInfo?.maritalStatus?.toLowerCase().includes("married")) {
          response += "Could you please provide your spouse's full legal name?";
        } else {
          response += "Let's gather some additional personal information. Could you please provide your date of birth?";
        }
      }
      
      return {
        response,
        dataStore: this._estatePlanData
      };
    }
    
    // If there are no agents in the queue (shouldn't happen), return a default response
    return {
      response: "Now let's gather more detailed information for your estate plan.",
      dataStore: this._estatePlanData
    };
  },
  
  // Process the next agent in the queue
  _processNextAgent: function() {
    // Find the next unprocessed agent
    const nextAgentItem = this._agentQueue.find(item => !item.processed);
    
    if (nextAgentItem) {
      // Set the current agent and let it handle the next user message
      this._currentAgent = nextAgentItem.agent;
      console.log("Setting current agent to:", this._currentAgent.name);
      
      // Provide a seamless transitional response based on the agent type
      let response = "";
      
      if (this._currentAgent === minorChildrenAgent) {
        response = "Could you please tell me the names and ages of your minor children?";
      } else if (this._currentAgent === charitableGivingAgent) {
        response = "Would you like to include any charitable donations in your estate plan?";
      } else if (this._currentAgent === assetInventoryAgent) {
        response = "Now, let's gather information about your assets. Do you own any real estate properties?";
      } else if (this._currentAgent === executorTrusteeAgent) {
        response = "Let's discuss who you would like to name as your executor and trustee. An executor is responsible for managing your estate after your passing. Who would you like to name as your executor?";
      } else if (this._currentAgent === specialProvisionsAgent) {
        response = "Let's discuss any special provisions you might want in your estate plan. Do you have any pets that you'd like to make provisions for?";
      } else if (this._currentAgent === informationGatheringAgent) {
        // Customize based on what information we already have
        response = "Now that we have the basic information, let's gather more details to complete your estate plan. ";
        
        if (this._estatePlanData.basicInfo?.maritalStatus?.toLowerCase().includes("married")) {
          response += "Could you please provide your spouse's full legal name?";
        } else {
          response += "Let's gather some additional personal information. Could you please provide your date of birth?";
        }
      }
      
      return {
        response,
        dataStore: this._estatePlanData
      };
    } else {
      // All agents have been processed, move to finalization
      this._currentState = "5_finalize";
      
      // Prepare a summary of all collected information
      const summary = this._generateSummary();
      
      return {
        response: `Thank you for providing all the necessary information for your estate plan. Here's a summary of what we've collected:\n\n${summary}\n\nOur legal team will now draft your documents based on this information. Once completed, you'll have an opportunity to review them before they're finalized.`,
        dataStore: this._estatePlanData
      };
    }
  },
  
  // Generate a summary of all collected information
  _generateSummary: function() {
    const data = this._estatePlanData;
    let summary = "";
    
    // Basic information
    if (data.basicInfo) {
      summary += "Basic Information:\n";
      if (data.basicInfo.fullName) summary += `- Name: ${data.basicInfo.fullName}\n`;
      if (data.basicInfo.maritalStatus) summary += `- Marital Status: ${data.basicInfo.maritalStatus}\n`;
      summary += `- Has Minor Children: ${data.basicInfo.hasMinorChildren ? "Yes" : "No"}\n`;
      summary += `- Has Charitable Bequests: ${data.basicInfo.hasCharitableBequests ? "Yes" : "No"}\n`;
      summary += "\n";
    }
    
    // Minor children information
    if (data.minorChildren && data.basicInfo?.hasMinorChildren) {
      summary += "Minor Children Information:\n";
      if (data.minorChildren.children && data.minorChildren.children.length > 0) {
        summary += "- Children:\n";
        data.minorChildren.children.forEach(child => {
          summary += `  * ${child.name} (${child.age} years old)\n`;
        });
      }
      if (data.minorChildren.guardianName) summary += `- Primary Guardian: ${data.minorChildren.guardianName}\n`;
      if (data.minorChildren.alternateGuardian) summary += `- Alternate Guardian: ${data.minorChildren.alternateGuardian}\n`;
      if (data.minorChildren.trustAge) summary += `- Trust Distribution Age: ${data.minorChildren.trustAge}\n`;
      if (data.minorChildren.trustDetails) summary += `- Trust Details: ${data.minorChildren.trustDetails}\n`;
      summary += "\n";
    }
    
    // Charitable giving information
    if (data.charitableGiving && data.basicInfo?.hasCharitableBequests) {
      summary += "Charitable Giving Information:\n";
      if (data.charitableGiving.charities && data.charitableGiving.charities.length > 0) {
        summary += "- Charities:\n";
        data.charitableGiving.charities.forEach(charity => {
          summary += `  * ${charity.name} (${charity.amount})\n`;
          if (charity.fallbackInstructions) summary += `    Fallback: ${charity.fallbackInstructions}\n`;
        });
      }
      summary += "\n";
    }
    
    // Asset information
    if (data.assets) {
      summary += "Asset Information:\n";
      
      if (data.assets.realEstate && data.assets.realEstate.length > 0) {
        summary += "- Real Estate:\n";
        data.assets.realEstate.forEach(property => {
          summary += `  * ${property.address} (${property.approximateValue})\n`;
        });
      }
      
      if (data.assets.bankAccounts && data.assets.bankAccounts.length > 0) {
        summary += "- Bank Accounts:\n";
        data.assets.bankAccounts.forEach(account => {
          summary += `  * ${account.institution} (${account.accountType}): ${account.approximateValue}\n`;
        });
      }
      
      summary += "\n";
    }
    
    // Distribution information
    if (data.distribution) {
      summary += "Distribution Information:\n";
      
      if (data.distribution.primaryBeneficiaries && data.distribution.primaryBeneficiaries.length > 0) {
        summary += "- Primary Beneficiaries:\n";
        data.distribution.primaryBeneficiaries.forEach(beneficiary => {
          summary += `  * ${beneficiary.name} (${beneficiary.relationship}): ${beneficiary.share}\n`;
        });
      }
      
      summary += "\n";
    }
    
    // Executor/Trustee information
    if (data.executorTrustee) {
      summary += "Executor/Trustee Information:\n";
      if (data.executorTrustee.executorName) summary += `- Executor: ${data.executorTrustee.executorName}\n`;
      if (data.executorTrustee.alternatExecutor) summary += `- Alternate Executor: ${data.executorTrustee.alternatExecutor}\n`;
      if (data.executorTrustee.trusteeName) summary += `- Trustee: ${data.executorTrustee.trusteeName}\n`;
      if (data.executorTrustee.alternateTrustee) summary += `- Alternate Trustee: ${data.executorTrustee.alternateTrustee}\n`;
    }
    
    return summary;
  }
};

export default orchestratorAgent; 