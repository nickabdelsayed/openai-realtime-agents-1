"use client";

import { ServerEvent, SessionStatus, AgentConfig } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useEstatePlan } from "@/app/contexts/EstatePlanContext";
import { useRef } from "react";
import { EstatePlanData } from "../agentConfigs/willAndTrustParalegal/types";

// Update AGENT_FLOW_ORDER and add a way to track agent completion
const AGENT_FLOW_ORDER = [
  "orchestratorAgent",         // Starting point
  "informationGatheringAgent", // Always first to gather basic info
  "minorChildrenAgent",        // Only if they have minor children
  "charitableGivingAgent",     // Only if they want charitable giving
  "assetInventoryAgent",       // Always needed to inventory assets
  "executorTrusteeAgent",      // Always needed for executors/trustees
  "specialProvisionsAgent"     // Always needed for special provisions
];

// Keep track of which agents have completed their work
const AGENT_COMPLETION_STATUS = {
  orchestratorAgent: false,
  informationGatheringAgent: false,
  minorChildrenAgent: false,
  charitableGivingAgent: false,
  assetInventoryAgent: false,
  executorTrusteeAgent: false,
  specialProvisionsAgent: false
};

// Add this right after the AGENT_FLOW_ORDER constant definition
const FORCE_AGENT_ORDER = true; // Toggle to strictly enforce agent ordering

// Add a custom type for our estatePlanData with transfer flags
type EnhancedEstatePlanData = EstatePlanData & {
  _justTransferred?: boolean;
  _transferTimestamp?: number;
  _lastActiveAgent?: string;
  _transferSequence?: string[];
};

export interface UseHandleServerEventParams {
  setSessionStatus: (status: SessionStatus) => void;
  selectedAgentName: string;
  selectedAgentConfigSet: AgentConfig[] | null;
  sendClientEvent: (eventObj: any, eventNameSuffix?: string) => void;
  setSelectedAgentName: (name: string) => void;
  shouldForceResponse?: boolean;
}

export function useHandleServerEvent({
  setSessionStatus,
  selectedAgentName,
  selectedAgentConfigSet,
  sendClientEvent,
  setSelectedAgentName,
}: UseHandleServerEventParams) {
  const {
    transcriptItems,
    addTranscriptBreadcrumb,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItemStatus,
  } = useTranscript();

  const { logServerEvent } = useEvent();
  const { updateEstatePlanData, estatePlanData } = useEstatePlan() as {
    updateEstatePlanData: (data: Partial<EnhancedEstatePlanData>) => void;
    estatePlanData: EnhancedEstatePlanData;
  };

  // Add a function to check if data channel is available
  const isDataChannelAvailable = () => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Check for dcRef which contains the data channel reference in App.tsx
      const anyWindow = window as any;
      if (anyWindow.dcRef && anyWindow.dcRef.current && anyWindow.dcRef.current.readyState === 'open') {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking data channel availability:", error);
      return false;
    }
  };

  // Update the safeSendClientEvent function to check data channel availability
  const safeSendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    try {
      // Check if sendClientEvent is available and ready
      if (typeof sendClientEvent === 'function') {
        // Check if the data channel is available
        if (isDataChannelAvailable()) {
          sendClientEvent(eventObj, eventNameSuffix);
        } else {
          console.warn("Data channel not available, messages queued for later sending");
          
          // Queue the message for later sending
          const queuedMessages = (window as any).queuedMessages || [];
          queuedMessages.push({ eventObj, eventNameSuffix });
          (window as any).queuedMessages = queuedMessages;
          
          // Set up a retry mechanism if not already running
          if (!(window as any).messageRetryInterval) {
            (window as any).messageRetryInterval = setInterval(() => {
              if (isDataChannelAvailable() && (window as any).queuedMessages?.length) {
                const msg = (window as any).queuedMessages.shift();
                if (msg) {
                  console.log("Sending queued message:", msg);
                  sendClientEvent(msg.eventObj, msg.eventNameSuffix);
                }
                
                // Clear interval if queue is empty
                if ((window as any).queuedMessages.length === 0) {
                  clearInterval((window as any).messageRetryInterval);
                  (window as any).messageRetryInterval = null;
                }
              }
            }, 1000); // Check every second
          }
        }
      } else {
        console.warn("sendClientEvent not available");
      }
    } catch (error) {
      console.error("Error in safeSendClientEvent:", error);
    }
  };

  // Update the handling of saveClientInformation to ensure transitions
  const handleSaveClientInformation = (args: any) => {
    console.log("Handling saveClientInformation with args:", args);
    
    // Extract data from the args
    try {
      if (args && typeof args === 'object') {
        // Check if there's client data to save
        if (args.clientData || args.data) {
          const dataToSave = args.clientData || args.data;
          console.log("Saving client data:", dataToSave);
          updateEstatePlanData(dataToSave);
          
          // After saving, ensure we trigger the appropriate transition
          if (selectedAgentName === "informationGatheringAgent") {
            // Schedule transfer to next agent
            console.log("Information gathering agent saved data, preparing for transition");
            setTimeout(() => {
              handleInformationGatheringCompleted();
            }, 1000);
          } else if (selectedAgentName === "minorChildrenAgent") {
            // Schedule transfer to next agent
            console.log("Minor children agent saved data, preparing for transition");
            setTimeout(() => {
              handleMinorChildrenCompleted();
            }, 1000);
          } else {
            // For other agents, determine next agent
            console.log(`${selectedAgentName} saved data, determining next agent`);
            setTimeout(() => {
              forceReturnToOrchestrator();
            }, 1000);
          }
          
          return { success: true, message: "Client information saved successfully" };
        }
      }
    } catch (error) {
      console.error("Error handling saveClientInformation:", error);
    }
    
    return { success: false, message: "Failed to save client information" };
  };

  // Enhance the ensureAgentContinuesConversation function with natural-sounding prompts
  const ensureAgentContinuesConversation = (agentName: string) => {
    console.log(`Ensuring ${agentName} continues conversation`);
    
    try {
      // Prepare agent-specific prompt to kickstart conversation after transfer
      let promptText = "";
      
      switch (agentName) {
        case "minorChildrenAgent":
          promptText = "Let's talk about arrangements for your minor children. Could you tell me their names and ages?";
          break;
        case "charitableGivingAgent":
          promptText = "I'd like to understand your charitable giving intentions. Are there specific organizations you'd like to include in your estate plan?";
          break;
        case "assetInventoryAgent":
          promptText = "Let's go through your assets in more detail. Besides what you've mentioned, do you have any investments, retirement accounts, or other valuable possessions?";
          break;
        case "executorTrusteeAgent":
          promptText = "I'd like to discuss who will be responsible for executing your will and managing your trust. Do you have someone in mind for these important roles?";
          break;
        case "specialProvisionsAgent":
          promptText = "Are there any special provisions or specific instructions you'd like to include in your estate plan?";
          break;
        case "orchestratorAgent":
          promptText = "Thank you for that information. Let's move on to the next important topic in your estate plan.";
          break;
        default:
          promptText = "Let's move on to another important aspect of your estate plan.";
      }
      
      // Set a flag to indicate we've just transferred
      const dataWithTransferFlag = {
        ...estatePlanData,
        _justTransferred: true,
        _transferTimestamp: Date.now()
      };
      
      // Update estate plan data with the flag
      updateEstatePlanData(dataWithTransferFlag);
      
      // Send a force response message after a delay
      setTimeout(() => {
        try {
          safeSendClientEvent({ 
            type: "response.create",
            data: {
              justTransferred: true,
              transferAgent: agentName,
              timestamp: Date.now()
            }
          }, `Forcing ${agentName} to respond`);
        } catch (error) {
          console.error("Error forcing agent response:", error);
        }
      }, 1500);
      
      // Set up a failsafe timer - if agent doesn't respond within timeout, inject our prompt
      const failsafeTimer = setTimeout(() => {
        console.log("Failsafe timer triggered - injecting prompt for agent");
        try {
          safeSendClientEvent({ 
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "assistant",
              content: [{ type: "input_text", text: promptText }],
            }
          }, "Injecting failsafe prompt");
          
          setTimeout(() => {
            safeSendClientEvent({ type: "response.create" }, "Failsafe response continuation");
          }, 500);
        } catch (error) {
          console.error("Error in failsafe message:", error);
        }
      }, 6000); // 6 second failsafe
      
      // Store the timer in window so we can clear it if the agent does respond
      (window as any).failsafeTimer = failsafeTimer;
    } catch (error) {
      console.error("Error ensuring agent continues conversation:", error);
    }
  };

  // Intercept transferAgents function calls to enforce ordering
  const handleFunctionCall = async (functionCallParams: {
    name: string;
    call_id?: string;
    arguments: string;
  }) => {
    const args = JSON.parse(functionCallParams.arguments);
    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );

    addTranscriptBreadcrumb(`function call: ${functionCallParams.name}`, args);

    // Intercept transferAgents calls to enforce proper order
    if (functionCallParams.name === "transferAgents" && FORCE_AGENT_ORDER) {
      const requestedDestination = args.destination_agent;
      
      // If this is the first transfer from orchestrator, always go to informationGatheringAgent first
      if (selectedAgentName === "orchestratorAgent" && 
          requestedDestination !== "informationGatheringAgent" && 
          requestedDestination !== "orchestratorAgent") {
        
        console.log(`Intercepting transfer to ${requestedDestination} and redirecting to informationGatheringAgent first`);
        
        // Override the destination to informationGatheringAgent
        args.destination_agent = "informationGatheringAgent";
        args.original_destination = requestedDestination; // Store original destination
        
        // Update the arguments string
        functionCallParams.arguments = JSON.stringify(args);
      }
      
      // Mark in the logs that we modified the transfer
      if (args.original_destination) {
        addTranscriptBreadcrumb(
          `Transfer intercepted: original destination was ${args.original_destination}`,
          { now_going_to: args.destination_agent }
        );
      }
    }

    // Handle updateEstatePlanData function call
    if (functionCallParams.name === "updateEstatePlanData" && args.data) {
      try {
        const estatePlanData = typeof args.data === 'string' 
          ? JSON.parse(args.data) 
          : args.data;
          
        updateEstatePlanData(estatePlanData);
        
        const functionCallOutput = {
          success: true,
          message: "Estate plan data updated successfully"
        };
        
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: functionCallParams.call_id,
            output: JSON.stringify(functionCallOutput),
          },
        });
        
        addTranscriptBreadcrumb(
          `function call: ${functionCallParams.name} response`,
          functionCallOutput
        );
        
        return;
      } catch (error) {
        console.error("Error updating estate plan data:", error);
        
        const functionCallOutput = {
          success: false,
          message: "Failed to update estate plan data"
        };
        
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: functionCallParams.call_id,
            output: JSON.stringify(functionCallOutput),
          },
        });
        
        addTranscriptBreadcrumb(
          `function call: ${functionCallParams.name} error`,
          { error: String(error) }
        );
        
        return;
      }
    }
    
    // Handle saveClientInformation function
    if (functionCallParams.name === "saveClientInformation") {
      try {
        const result = handleSaveClientInformation(args);
        
        // Create a response that doesn't mention transfers
        let responseMessage = "";
        if (selectedAgentName === "informationGatheringAgent") {
          responseMessage = "Thank you for providing this information. Let's discuss more specific aspects of your estate plan.";
        } else if (selectedAgentName === "minorChildrenAgent") {
          responseMessage = "Thank you for these details about your children. Let's address other important areas of your estate plan.";
        } else {
          responseMessage = "Thank you for sharing this information. Let's continue with your estate planning.";
        }
        
        // Inject a natural transition first
        safeSendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "assistant",
            content: [{ type: "input_text", text: responseMessage }],
          }
        }, "Natural transition after saveClientInformation");
        
        // Then send the function call output
        setTimeout(() => {
          safeSendClientEvent({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: functionCallParams.call_id,
              output: JSON.stringify(result),
            },
          });
        }, 500);
        
        // If this is the orchestrator agent after a transfer, continue the conversation
        setTimeout(() => {
          if (selectedAgentName === "orchestratorAgent") {
            safeSendClientEvent({ type: "response.create" }, "Continue conversation after save");
          }
        }, 1000);
        
        return;
      } catch (error) {
        console.error("Error in saveClientInformation:", error);
      }
    }
    
    if (currentAgent?.toolLogic?.[functionCallParams.name]) {
      const fn = currentAgent.toolLogic[functionCallParams.name];
      const fnResult = await fn(args, transcriptItems);
      addTranscriptBreadcrumb(
        `function call result: ${functionCallParams.name}`,
        fnResult
      );

      if (fnResult && fnResult.dataStore) {
        updateEstatePlanData(fnResult.dataStore as EstatePlanData);
      }

      if (fnResult && functionCallParams.name === "transferAgents") {
        const destinationAgent = args.destination_agent;
        const newAgentConfig =
          selectedAgentConfigSet?.find((a) => a.name === destinationAgent) || null;
          
        // Ensure we capture collected data during agent transfers
        if (args.collectedData) {
          try {
            const collectedData = typeof args.collectedData === 'string' 
              ? JSON.parse(args.collectedData) 
              : args.collectedData;
              
            if (collectedData) {
              updateEstatePlanData(collectedData as Partial<EstatePlanData>);
              console.log("Updated estate plan data during agent transfer:", collectedData);
            }
          } catch (error) {
            console.error("Error parsing collected data during agent transfer:", error);
          }
        }
        
        if (newAgentConfig) {
          setSelectedAgentName(destinationAgent);
        }
        const functionCallOutput = {
          destination_agent: destinationAgent,
          did_transfer: !!newAgentConfig,
        };
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: functionCallParams.call_id,
            output: JSON.stringify(functionCallOutput),
          },
        });
        addTranscriptBreadcrumb(
          `function call: ${functionCallParams.name} response`,
          functionCallOutput
        );

        if (selectedAgentName === "orchestratorAgent" && fnResult.dataStore) {
          updateEstatePlanData(fnResult.dataStore as EstatePlanData);
        }
      }

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(fnResult),
        },
      });
      sendClientEvent({ type: "response.create" });
    } else if (functionCallParams.name === "transferAgents") {
      const destinationAgent = args.destination_agent;
      const newAgentConfig =
        selectedAgentConfigSet?.find((a) => a.name === destinationAgent) || null;
        
      // Ensure we capture collected data during agent transfers even if no custom logic
      if (args.collectedData) {
        try {
          const collectedData = typeof args.collectedData === 'string' 
            ? JSON.parse(args.collectedData) 
            : args.collectedData;
            
          if (collectedData) {
            updateEstatePlanData(collectedData as Partial<EstatePlanData>);
            console.log("Updated estate plan data during basic agent transfer:", collectedData);
          }
        } catch (error) {
          console.error("Error parsing collected data during basic agent transfer:", error);
        }
      }
        
      if (newAgentConfig) {
        setSelectedAgentName(destinationAgent);
      }
      const functionCallOutput = {
        destination_agent: destinationAgent,
        did_transfer: !!newAgentConfig,
      };
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(functionCallOutput),
        },
      });
      addTranscriptBreadcrumb(
        `function call: ${functionCallParams.name} response`,
        functionCallOutput
      );
    } else {
      const simulatedResult = { result: true };
      addTranscriptBreadcrumb(
        `function call fallback: ${functionCallParams.name}`,
        simulatedResult
      );

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(simulatedResult),
        },
      });
      sendClientEvent({ type: "response.create" });
    }

    // Add this right before the transferAgents handling
    if (functionCallParams.name === "transferAgents") {
      const destinationAgent = args.destination_agent;
      console.log(`Transfer requested to ${destinationAgent}`);
      
      // Add this check here
      if (selectedAgentName === destinationAgent) {
        console.log("Already on the requested agent, forcing response creation");
        setTimeout(() => {
          safeSendClientEvent({ type: "response.create" }, "Continue conversation after transfer to same agent");
        }, 1000);
        return;
      }

      // Before performing the transfer, ensure the conversation will continue
      setTimeout(() => {
        ensureAgentContinuesConversation(destinationAgent);
      }, 2500);
      
      // Rest of the existing transferAgents handling...
      
      // Add this at the end of the transferAgents section to force continuation
      setTimeout(() => {
        safeSendClientEvent({ type: "response.create" }, "Continue conversation after transfer");
      }, 2000);
    }
  };

  // Update the determineNextAgent function to consider which agents have completed
  const determineNextAgent = () => {
    // Reset all completion statuses when we start from orchestrator
    if (selectedAgentName === "orchestratorAgent" && !AGENT_COMPLETION_STATUS.orchestratorAgent) {
      for (const key in AGENT_COMPLETION_STATUS) {
        AGENT_COMPLETION_STATUS[key as keyof typeof AGENT_COMPLETION_STATUS] = false;
      }
      AGENT_COMPLETION_STATUS.orchestratorAgent = true;
    }
    
    // Mark current agent as completed
    AGENT_COMPLETION_STATUS[selectedAgentName as keyof typeof AGENT_COMPLETION_STATUS] = true;
    
    console.log("Agent completion status:", AGENT_COMPLETION_STATUS);
    
    // If informationGatheringAgent has not completed, always go there first
    if (!AGENT_COMPLETION_STATUS.informationGatheringAgent && 
        selectedAgentName !== "informationGatheringAgent") {
      return "informationGatheringAgent";
    }
    
    // Find the current position in the flow
    const currentIndex = AGENT_FLOW_ORDER.indexOf(selectedAgentName);
    if (currentIndex < 0 || currentIndex >= AGENT_FLOW_ORDER.length - 1) {
      return "orchestratorAgent"; // Default to orchestrator if we can't determine
    }
    
    // Look for the next uncompleted agent in the flow
    for (let i = currentIndex + 1; i < AGENT_FLOW_ORDER.length; i++) {
      const nextAgent = AGENT_FLOW_ORDER[i];
      
      // Skip agents that aren't relevant based on current data
      if (nextAgent === "minorChildrenAgent" && 
          estatePlanData.basicInfo?.hasMinorChildren === false) {
        AGENT_COMPLETION_STATUS.minorChildrenAgent = true; // Mark as completed
        continue;
      }
      
      // Skip charitable giving agent if no charitable bequests
      if (nextAgent === "charitableGivingAgent" && 
          estatePlanData.basicInfo?.hasCharitableBequests === false) {
        AGENT_COMPLETION_STATUS.charitableGivingAgent = true; // Mark as completed  
        continue;
      }
      
      // Skip already completed agents
      if (AGENT_COMPLETION_STATUS[nextAgent as keyof typeof AGENT_COMPLETION_STATUS]) {
        continue;
      }
      
      // Make sure the agent exists in the current set
      if (selectedAgentConfigSet?.find(a => a.name === nextAgent)) {
        return nextAgent;
      }
    }
    
    // If all agents are complete or no valid next agent, return to orchestrator
    return "orchestratorAgent";
  };

  // Modify the forceReturnToOrchestrator function to be more robust
  const forceReturnToOrchestrator = () => {
    console.log("Determining next agent after completion");
    
    try {
      // Determine the next agent based on our flow logic
      const nextAgent = determineNextAgent();
      console.log(`Next agent in flow: ${nextAgent}`);
      
      // After a slight delay, transfer to the next agent
      setTimeout(() => {
        try {
          // Create the transfer call
          handleFunctionCall({
            name: "transferAgents",
            arguments: JSON.stringify({
              destination_agent: nextAgent,
              reason: "Subject completed, moving to next topic",
              collectedData: estatePlanData
            })
          });
          
          // Force a continuation after the transfer
          setTimeout(() => {
            safeSendClientEvent({ type: "response.create" }, "Continue conversation after transfer");
          }, 2000);
        } catch (error) {
          console.error("Error during agent transfer:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error in forceReturnToOrchestrator:", error);
    }
  };

  // Improve the checkAgentCompletionFromMessages function
  const checkAgentCompletionFromMessages = () => {
    if (selectedAgentName !== "orchestratorAgent") {
      // Get the most recent 3 messages
      const recentMessages = transcriptItems
        .filter(item => item.type === "MESSAGE")
        .slice(-3);
        
      if (recentMessages.length < 2) return false;
      
      // Get the most recent assistant and user messages
      const lastAssistantMsg = recentMessages.find(msg => msg.role === "assistant")?.title || "";
      const lastUserMsg = recentMessages.find(msg => msg.role === "user")?.title || "";
      
      // Check for completion patterns in the conversation
      const isComfortableResponse = lastUserMsg.toLowerCase().includes("comfortable") || 
                                 lastUserMsg.toLowerCase() === "ok" || 
                                 lastUserMsg.toLowerCase() === "yes" ||
                                 lastUserMsg.toLowerCase() === "whats next" ||
                                 lastUserMsg.toLowerCase() === "what's next" ||
                                 lastUserMsg.toLowerCase() === "that looks correct" ||
                                 lastUserMsg.toLowerCase() === "looks good";
                                 
      const isSummaryMessage = lastAssistantMsg.includes("we've gathered so far") || 
                            lastAssistantMsg.includes("Here's what we have") || 
                            lastAssistantMsg.includes("comfortable with the details") ||
                            lastAssistantMsg.includes("need further assistance") ||
                            lastAssistantMsg.includes("I'm glad we could") ||
                            lastAssistantMsg.includes("any other questions") ||
                            lastAssistantMsg.includes("further assistance") ||
                            lastAssistantMsg.includes("summarize what we've") ||
                            lastAssistantMsg.includes("summarize what we've collected") ||
                            lastAssistantMsg.includes("prepare draft") ||
                            lastAssistantMsg.includes("draft versions") ||
                            lastAssistantMsg.includes("draft documents") ||
                            lastAssistantMsg.includes("summary") ||
                            lastAssistantMsg.includes("based on this information");
      
      // Special handling per agent type
      if (selectedAgentName === "informationGatheringAgent") {
        // Check for information gathering completion
        const isInfoGatheringComplete = 
          (isSummaryMessage && isComfortableResponse) ||
          (lastAssistantMsg.includes("we'll proceed with preparing") && isComfortableResponse) ||
          (lastAssistantMsg.includes("thank you for confirming") && lastUserMsg) ||
          (lastAssistantMsg.includes("based on the information you've provided") && lastUserMsg);
        
        if (isInfoGatheringComplete) {
          console.log("Information gathering agent completed");
          if (typeof handleInformationGatheringCompleted === 'function') {
            handleInformationGatheringCompleted();
          } else {
            forceReturnToOrchestrator();
          }
          return true;
        }
      } 
      else if (selectedAgentName === "minorChildrenAgent") {
        // Check for minor children agent completion
        const isMinorChildrenComplete = 
          (lastAssistantMsg.includes("Thank you for providing") && lastUserMsg) ||
          (lastAssistantMsg.includes("comfortable with") && isComfortableResponse) ||
          (isSummaryMessage && isComfortableResponse);
        
        if (isMinorChildrenComplete) {
          console.log("Minor children agent completed");
          if (typeof handleMinorChildrenCompleted === 'function') {
            handleMinorChildrenCompleted();
          } else {
            forceReturnToOrchestrator();
          }
          return true;
        }
      }
      else {
        // Generic completion check for other agents
        const isAgentComplete = 
          (isSummaryMessage && isComfortableResponse) ||
          (lastAssistantMsg.includes("thank you for your time") && lastUserMsg) ||
          (lastAssistantMsg.includes("I'll proceed with") && lastUserMsg) ||
          (lastAssistantMsg.includes("thank you for confirming") && lastUserMsg);
        
        if (isAgentComplete) {
          console.log(`Generic completion detected for ${selectedAgentName}`);
          
          // Mark the agent as completed
          AGENT_COMPLETION_STATUS[selectedAgentName as keyof typeof AGENT_COMPLETION_STATUS] = true;
          
          forceReturnToOrchestrator();
          return true;
        }
      }
    }
    return false;
  };

  const handleServerEvent = (serverEvent: ServerEvent) => {
    logServerEvent(serverEvent);

    switch (serverEvent.type) {
      case "session.created": {
        if (serverEvent.session?.id) {
          setSessionStatus("CONNECTED");
          addTranscriptBreadcrumb(
            `session.id: ${
              serverEvent.session.id
            }\nStarted at: ${new Date().toLocaleString()}`
          );
        }
        break;
      }

      case "conversation.item.created": {
        let text =
          serverEvent.item?.content?.[0]?.text ||
          serverEvent.item?.content?.[0]?.transcript ||
          "";
        const role = serverEvent.item?.role as "user" | "assistant";
        const itemId = serverEvent.item?.id;

        if (itemId && transcriptItems.some((item) => item.itemId === itemId)) {
          break;
        }

        if (itemId && role) {
          if (role === "user" && !text) {
            text = "[Transcribing...]";
          }
          addTranscriptMessage(itemId, role, text);
          
          // Capture questions and answers to update the estate plan data
          if (role === "assistant" && text && !text.includes("[Transcribing...]")) {
            // Store the last question asked by the assistant with timestamp
            (window as any).lastAssistantQuestion = {
              text,
              timestamp: Date.now()
            };
            
            // Debug log to verify question capture
            console.log("Captured assistant question:", text);
          }
          
          // When user responds to a question, update the estate plan data
          if (role === "user" && text && (window as any).lastAssistantQuestion) {
            const lastQuestion = (window as any).lastAssistantQuestion.text;
            // Only process if the question is recent (within the last 10 seconds)
            if (Date.now() - (window as any).lastAssistantQuestion.timestamp < 10000) {
              console.log("Processing Q&A pair:", { question: lastQuestion, answer: text });
              processQuestionAnswer(lastQuestion, text);
            }
            (window as any).lastAssistantQuestion = null;
          }

          // After each new message, check if we've completed the current agent's task
          if (role === "user" && text && text !== "[Transcribing...]") {
            // Check with a slight delay to allow for any immediate followup
            setTimeout(() => {
              checkAgentCompletionFromMessages();
            }, 500);
          }
        }
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const itemId = serverEvent.item_id;
        const finalTranscript =
          !serverEvent.transcript || serverEvent.transcript === "\n"
            ? "[inaudible]"
            : serverEvent.transcript;
        if (itemId) {
          updateTranscriptMessage(itemId, finalTranscript, false);
        }
        break;
      }

      case "response.audio_transcript.delta": {
        const itemId = serverEvent.item_id;
        const deltaText = serverEvent.delta || "";
        if (itemId) {
          updateTranscriptMessage(itemId, deltaText, true);
        }
        break;
      }

      case "response.done": {
        // Clear any failsafe timer if we got a response
        if ((window as any).failsafeTimer) {
          clearTimeout((window as any).failsafeTimer);
          (window as any).failsafeTimer = null;
        }
        
        let dataUpdated = false;
        
        // If we're not with the orchestrator and there's no activity for 30 seconds, 
        // force a return to orchestrator
        if (selectedAgentName !== "orchestratorAgent") {
          // Clear any existing timeout
          if ((window as any).returnToOrchestratorTimeout) {
            clearTimeout((window as any).returnToOrchestratorTimeout);
          }
          
          // Set a new timeout
          (window as any).returnToOrchestratorTimeout = setTimeout(() => {
            forceReturnToOrchestrator();
          }, 30000); // 30 seconds timeout
        }

        if (serverEvent.response?.output) {
          serverEvent.response.output.forEach((outputItem) => {
            if (
              outputItem.type === "function_call" &&
              outputItem.name &&
              outputItem.arguments
            ) {
              handleFunctionCall({
                name: outputItem.name,
                call_id: outputItem.call_id,
                arguments: outputItem.arguments,
              });
              
              // Flag that we potentially updated data
              if (outputItem.name === "transferAgents" || outputItem.name === "updateEstatePlanData") {
                dataUpdated = true;
              }
            }
          });
        }

        // Check if the current agent has completed its portion and needs to transfer
        if (
          selectedAgentName !== "orchestratorAgent" && 
          serverEvent.response?.message?.content
        ) {
          // Look for completion phrases in the agent's response
          const content = serverEvent.response.message.content;
          const completionPhrases = [
            "we've completed",
            "we have completed",
            "we've covered everything",
            "we have covered everything",
            "that concludes",
            "thank you for providing",
            "thank you for confirming",
            "is there anything else you'd like to discuss",
            "is there anything else you would like to discuss",
            "great! let's move on",
            "let's proceed to",
            "perfect! now let's"
          ];
          
          const hasCompletionPhrase = completionPhrases.some(phrase => 
            content.toLowerCase().includes(phrase.toLowerCase())
          );
          
          if (hasCompletionPhrase) {
            console.log("Detected agent completion, determining next agent in flow");
            
            // Determine the next agent based on our flow logic
            const nextAgent = determineNextAgent();
            console.log(`Next agent in flow: ${nextAgent}`);
            
            // After a slight delay, transfer to the next agent
            setTimeout(() => {
              // Create the transfer call
              handleFunctionCall({
                name: "transferAgents",
                arguments: JSON.stringify({
                  destination_agent: nextAgent,
                  reason: "Subject completed, moving to next topic",
                  collectedData: estatePlanData
                })
              });
            }, 1000);
            
            // Flag that we're updating data
            dataUpdated = true;
          }
        }

        if (serverEvent.response?.data?.dataStore) {
          if (selectedAgentName === "orchestratorAgent" || !dataUpdated) {
            const dataStore = serverEvent.response.data.dataStore as EstatePlanData;
            
            // Detect if there are any new Q&A pairs that should be added to dynamicQA
            if (serverEvent.response.data.lastQuestion && serverEvent.response.data.lastAnswer) {
              const question = serverEvent.response.data.lastQuestion as string;
              const answer = serverEvent.response.data.lastAnswer as string;
              
              // Check if this is information that doesn't already fit in our predefined structure
              // Add it to dynamicQA if it's not already in our structure
              if (question && answer) {
                // Create or update the dynamicQA object with the new Q&A pair
                const updatedDataStore = {
                  ...dataStore,
                  dynamicQA: {
                    ...(dataStore.dynamicQA || {}),
                    [question]: answer
                  }
                };
                updateEstatePlanData(updatedDataStore);
                console.log("Updated estate plan with Q&A pair:", { question, answer });
              } else {
                updateEstatePlanData(dataStore);
              }
            } else {
              updateEstatePlanData(dataStore);
            }
            
            // Always log what data was updated to help with debugging
            console.log("Updated estate plan data from response.done:", dataStore);
          }
        } else if (!dataUpdated) {
          // If no direct data store updates, try harder to extract information
          processConversationHistory();
        }
        
        // Always check for the "I'm comfortable" type responses that often come at the end
        // of a section and should trigger a return to orchestrator
        if (selectedAgentName !== "orchestratorAgent" && 
            serverEvent.response?.message?.content) {
          
          const lastUserMessage = transcriptItems
            .filter(item => item.role === "user")
            .pop()?.title?.toLowerCase();
            
          if (lastUserMessage && 
              (lastUserMessage.includes("comfortable") || 
               lastUserMessage.includes("looks good") || 
               lastUserMessage.includes("ok") || 
               lastUserMessage.includes("sounds good") ||
               lastUserMessage === "yes")) {
            
            console.log("Detected confirmation message, will return to orchestrator soon");
            
            // Set a timeout to return to orchestrator
            setTimeout(() => {
              forceReturnToOrchestrator();
            }, 5000); // 5 second delay
          }
        }
        
        // Check for conversation-based agent completion
        if (checkAgentCompletionFromMessages()) {
          console.log("Agent completion detected from conversation patterns");
          setTimeout(() => {
            forceReturnToOrchestrator();
          }, 2000);
        }
        
        // Add this at the end of the case
        // Check if we've just transferred to a new agent and need to ensure the conversation continues
        if (serverEvent.response?.data?.justTransferred) {
          console.log("Just transferred to a new agent, ensuring conversation continues");
          setTimeout(() => {
            safeSendClientEvent({ type: "response.create" }, "Continue after transfer");
          }, 1000);
        }
        
        // Check if we need to inject content for a newly transferred agent that isn't speaking
        const hasJustTransferred = estatePlanData._justTransferred === true;
        const transferTimestamp = estatePlanData._transferTimestamp || 0;
        const isTransferRecent = Date.now() - transferTimestamp < 10000; // Within 10 seconds
        
        if (hasJustTransferred && isTransferRecent && 
            !serverEvent.response?.message?.content) {
          console.log("Agent transfer detected but no content in response");
          
          // Remove the transfer flags
          const dataWithoutTransferFlag = { ...estatePlanData };
          delete dataWithoutTransferFlag._justTransferred;
          delete dataWithoutTransferFlag._transferTimestamp;
          updateEstatePlanData(dataWithoutTransferFlag);
          
          // Force agent to speak
          setTimeout(() => {
            safeSendClientEvent({ 
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "assistant",
                content: [{ type: "input_text", text: "Let me continue gathering information for your estate plan. " }],
              }
            }, "Injecting prompt after transfer");
            
            setTimeout(() => {
              safeSendClientEvent({ type: "response.create" }, "Force continuation after transfer");
            }, 500);
          }, 1000);
        }
        
        break;
      }

      case "response.output_item.done": {
        const itemId = serverEvent.item?.id;
        if (itemId) {
          updateTranscriptItemStatus(itemId, "DONE");
        }
        break;
      }

      default:
        break;
    }
  };

  // Enhanced processQuestionAnswer function to extract and update more data types
  const processQuestionAnswer = (question: string, answer: string) => {
    // Skip if either question or answer is missing
    if (!question || !answer) {
      console.log("Skipping Q&A processing - missing question or answer");
      return;
    }
    
    // Create shallow copy of existing data to build upon
    let updatedData: Partial<EstatePlanData> = {};
    
    try {
      console.log(`Processing Q&A: Q: "${question}" A: "${answer}"`);
      
      // Basic information mapping with more patterns
      if (question.includes("tell me your full name") || 
          question.includes("your full name") || 
          question.includes("could you please tell me your full name")) {
        updatedData.basicInfo = { 
          ...estatePlanData.basicInfo, 
          fullName: answer 
        };
        console.log("Updated full name:", answer);
      }
      else if (question.includes("marital status") || 
               question.includes("are you single, married")) {
        updatedData.basicInfo = { 
          ...estatePlanData.basicInfo, 
          maritalStatus: answer 
        };
        console.log("Updated marital status:", answer);
      }
      else if ((question.includes("minor children") || question.includes("children under")) && 
                !question.includes("guardianship")) {
        const hasMinorChildren = !answer.toLowerCase().includes("no") && !answer.toLowerCase().includes("none");
        // Try to extract number of children if mentioned
        let childCount: number | undefined;
        const numberMatch = answer.match(/\d+/);
        if (numberMatch) {
          childCount = parseInt(numberMatch[0]);
        }
        
        updatedData.basicInfo = { 
          ...estatePlanData.basicInfo, 
          hasMinorChildren 
        };
        
        // Create placeholder for children if a count was mentioned
        if (childCount && childCount > 0) {
          const children = Array(childCount).fill(0).map((_, i) => ({
            name: `Child ${i+1}`,
            age: 0
          }));
          
          updatedData.minorChildren = {
            ...estatePlanData.minorChildren,
            children
          };
        }
        
        console.log("Updated minor children info:", { hasMinorChildren, childCount });
      }
      else if (question.includes("charitable") || question.includes("giving")) {
        const hasCharitableBequests = !answer.toLowerCase().includes("no") && !answer.toLowerCase().includes("none");
        updatedData.basicInfo = { 
          ...estatePlanData.basicInfo, 
          hasCharitableBequests 
        };
        
        updatedData.charitableGiving = {
          ...estatePlanData.charitableGiving,
          wantsCharity: hasCharitableBequests
        };
        
        console.log("Updated charitable giving info:", hasCharitableBequests);
      }
      
      // Fix for guardian name handling - don't override existing values
      else if (question.includes("guardianship") || 
              question.includes("guardian") || 
              question.includes("Do you have someone in mind whom you") || 
              question.includes("appoint as the guardian")) {
        // Extract name - look for specific patterns like "my sister X" or "my brother Y"
        let guardianName = "";
        
        if (answer.toLowerCase().includes("my sister") || answer.toLowerCase().includes("my brother")) {
          // Try to extract the name that follows "my sister" or "my brother"
          const match = answer.match(/my (sister|brother)\s+([a-zA-Z]+)/i);
          if (match && match[2]) {
            guardianName = match[2];
          } else {
            guardianName = answer; // Just use the whole answer if pattern doesn't match
          }
        } else if (!answer.toLowerCase().includes("not sure") && !answer.toLowerCase().includes("i don't know")) {
          guardianName = answer;
        }
        
        // Check if we already have a guardian name set
        const existingGuardian = estatePlanData.minorChildren?.guardianName;
        
        if (guardianName && (!existingGuardian || existingGuardian === "")) {
          updatedData.minorChildren = { 
            ...estatePlanData.minorChildren,
            guardianName
          };
          console.log("Updated guardian name:", guardianName);
        } else if (guardianName && existingGuardian && existingGuardian !== guardianName) {
          // If we have both, make a decision based on context
          // For "guardian" and "alternate guardian" confusion
          
          // If the current question explicitly mentions alternate, use that
          if (question.toLowerCase().includes("alternate")) {
            updatedData.minorChildren = { 
              ...estatePlanData.minorChildren,
              alternateGuardian: guardianName
            };
            console.log("Updated alternate guardian (from guardian question):", guardianName);
          } 
          // If we already have a guardian but no alternate, this might be the alternate
          else if (!estatePlanData.minorChildren?.alternateGuardian) {
            updatedData.minorChildren = { 
              ...estatePlanData.minorChildren,
              alternateGuardian: guardianName
            };
            console.log("Using as alternate guardian since primary exists:", guardianName);
          }
          // If both exist, make a judgment call based on timestamp or context
          else {
            console.log("Both guardian and alternate guardian already exist, not updating");
          }
        }
      }
      else if (question.includes("alternate guardian") || question.includes("would you like to name an alternate")) {
        // Similar extraction for alternate guardian
        let alternateGuardian = "";
        
        if (answer.toLowerCase().includes("my sister") || answer.toLowerCase().includes("my brother")) {
          // Try to extract the name that follows "my sister" or "my brother"
          const match = answer.match(/my (sister|brother)\s+([a-zA-Z]+)/i);
          if (match && match[2]) {
            alternateGuardian = match[2];
          } else {
            alternateGuardian = answer; // Just use the whole answer if pattern doesn't match
          }
        } else if (!answer.toLowerCase().includes("not sure") && !answer.toLowerCase().includes("i don't know")) {
          alternateGuardian = answer;
        }
        
        if (alternateGuardian) {
          // Check if the alternate guardian name is already the primary guardian
          if (estatePlanData.minorChildren?.guardianName === alternateGuardian) {
            console.log("Alternate guardian is the same as primary guardian, not updating");
          } else {
            updatedData.minorChildren = { 
              ...estatePlanData.minorChildren,
              alternateGuardian
            };
            console.log("Updated alternate guardian:", alternateGuardian);
          }
        }
      }
      else if (question.includes("set up a trust") || 
              question.includes("at what age") || 
              question.includes("inheritance") || 
              question.includes("control of their inheritance") ||
              question.includes("Common ages are 21, 25, or 30")) {
        // Try to extract the age number
        const ageMatch = answer.match(/\d+/);
        if (ageMatch) {
          updatedData.minorChildren = { 
            ...estatePlanData.minorChildren, 
            trustAge: parseInt(ageMatch[0]) 
          };
          console.log("Updated trust age:", parseInt(ageMatch[0]));
        }
      }
      else if (question.includes("specific instructions") || 
              question.includes("provisions you'd like to include") ||
              question.includes("provisions added to the trust") ||
              question.includes("such as funds for education")) {
        
        let trustDetails = "";
        
        if (answer.toLowerCase().includes("health care") || 
            answer.toLowerCase().includes("healthcare") || 
            answer.toLowerCase().includes("education")) {
          trustDetails = answer;
        } else if (answer.toLowerCase() !== "no" && 
                     answer.toLowerCase() !== "none" && 
                     !answer.toLowerCase().includes("not sure")) {
          trustDetails = answer;
        }
        
        if (trustDetails) {
          updatedData.minorChildren = { 
            ...estatePlanData.minorChildren, 
            trustDetails
          };
          console.log("Updated trust details:", trustDetails);
        }
      }
      
      // For any other Q&A that doesn't match predefined fields, add to dynamicQA
      else {
        const simplifiedQuestion = question
          .replace(/^(Could you|Would you|Can you|Please|Let's|I need to know|I'd like to know)\s+/i, '')
          .replace(/\?$/, '')
          .trim();
          
        updatedData.dynamicQA = {
          ...(estatePlanData.dynamicQA || {}),
          [simplifiedQuestion]: answer
        };
        
        console.log("Added dynamic Q&A:", { question: simplifiedQuestion, answer });
      }
      
      // Apply the updates if we have any
      if (Object.keys(updatedData).length > 0) {
        console.log("Applying estate plan updates:", updatedData);
        updateEstatePlanData(updatedData);
      }
    } catch (error) {
      console.error("Error processing question/answer:", error);
    }
  };

  // Add this function to automatically process recent conversation history
  const processConversationHistory = () => {
    // Get the recent conversation (last 20 items or so)
    const recentConversation = transcriptItems
      .filter(item => item.type === "MESSAGE" && !item.title.includes("[Transcribing...]"))
      .slice(-20);
      
    console.log("Processing recent conversation history:", recentConversation.length, "items");
    
    // Create assistant-user pairs to process
    for (let i = 0; i < recentConversation.length - 1; i++) {
      const current = recentConversation[i];
      const next = recentConversation[i+1];
      
      if (current.role === "assistant" && next.role === "user") {
        // We have a Q&A pair
        const question = current.title;
        const answer = next.title;
        
        if (question && answer) {
          console.log("Processing historical Q&A pair:", { question, answer });
          processQuestionAnswer(question, answer);
        }
      }
    }
  };

  // Update the handling for information gathering to make a special case for minorChildren
  // This ensures proper handling of guardianship questions
  const handleInformationGatheringCompleted = () => {
    console.log("Information gathering completed, determining next step");
    
    // Update transfer sequence
    const currentSequence = estatePlanData._transferSequence || [];
    const updatedSequence = [...currentSequence, "informationGatheringAgent"];
    
    // Mark the agent as completed
    AGENT_COMPLETION_STATUS.informationGatheringAgent = true;
    
    // Update the estate plan data with the sequence
    updateEstatePlanData({
      _transferSequence: updatedSequence,
      _lastActiveAgent: "informationGatheringAgent"
    });
    
    // Check if we should go to minorChildren next
    let nextAgent = "orchestratorAgent";
    
    if (estatePlanData.basicInfo?.hasMinorChildren && !AGENT_COMPLETION_STATUS.minorChildrenAgent) {
      nextAgent = "minorChildrenAgent";
      console.log("User has minor children, transferring to minorChildrenAgent");
    } else if (estatePlanData.basicInfo?.hasCharitableBequests && !AGENT_COMPLETION_STATUS.charitableGivingAgent) {
      nextAgent = "charitableGivingAgent";
      console.log("User has charitable bequests, transferring to charitableGivingAgent");
    } else {
      // Default to asset inventory if no special cases
      nextAgent = "assetInventoryAgent";
      console.log("Proceeding to assetInventoryAgent");
    }
    
    // Request the transfer after a delay
    setTimeout(() => {
      handleFunctionCall({
        name: "transferAgents",
        arguments: JSON.stringify({
          destination_agent: nextAgent,
          reason: "Information gathering completed",
          collectedData: estatePlanData
        })
      });
    }, 1000);
  };

  // Add special handling for minor children completion
  const handleMinorChildrenCompleted = () => {
    console.log("Minor children handling completed");
    
    // Update transfer sequence
    const currentSequence = estatePlanData._transferSequence || [];
    const updatedSequence = [...currentSequence, "minorChildrenAgent"];
    
    // Mark the agent as completed
    AGENT_COMPLETION_STATUS.minorChildrenAgent = true;
    
    // Update the estate plan data with the sequence
    updateEstatePlanData({
      _transferSequence: updatedSequence,
      _lastActiveAgent: "minorChildrenAgent"
    });
    
    // Determine the next agent (asset inventory if charitable giving not needed)
    const nextAgent = estatePlanData.basicInfo?.hasCharitableBequests ? 
      "charitableGivingAgent" : "assetInventoryAgent";
    
    console.log(`Proceeding to ${nextAgent} after minor children`);
    
    // Request the transfer after a delay
    setTimeout(() => {
      handleFunctionCall({
        name: "transferAgents",
        arguments: JSON.stringify({
          destination_agent: nextAgent,
          reason: "Minor children handling completed",
          collectedData: estatePlanData
        })
      });
    }, 1000);
  };

  const handleServerEventRef = useRef(handleServerEvent);
  handleServerEventRef.current = handleServerEvent;

  // Add direct code to the end of the handleServerEvent to check transcript on load
  handleServerEventRef.toString = function() {
    // Process initial conversation history when the handler is created
    setTimeout(() => {
      processConversationHistory();
    }, 1000);
    return "handleServerEvent function";
  };

  return handleServerEventRef;
}
