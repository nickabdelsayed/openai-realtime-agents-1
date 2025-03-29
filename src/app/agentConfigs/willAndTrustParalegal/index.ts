import orchestratorAgent from './orchestratorAgent';
import informationGatheringAgent from './informationGatheringAgent';
import minorChildrenAgent from './minorChildrenAgent';
import charitableGivingAgent from './charitableGivingAgent';
import assetInventoryAgent from './assetInventoryAgent';
import executorTrusteeAgent from './executorTrusteeAgent';
import specialProvisionsAgent from './specialProvisionsAgent';
import { injectTransferTools } from '../utils';

// In our new design, the orchestrator agent handles the flow internally
// using its step() method, which means we don't actually need to use
// the transfer tools for the specialized agents in most cases.
// 
// However, we keep the downstreamAgents structure for two reasons:
// 1. To maintain compatibility with the injectTransferTools utility
// 2. As a fallback for manual transfers if needed

// IMPORTANT: For seamless transitions, we're using the orchestrator's internal
// _processNextAgent method rather than the transferAgents tool. This allows us
// to completely control the transition messages without any mention of transfers.

orchestratorAgent.downstreamAgents = [
  minorChildrenAgent,
  charitableGivingAgent,
  assetInventoryAgent,
  executorTrusteeAgent,
  specialProvisionsAgent,
  informationGatheringAgent
];

minorChildrenAgent.downstreamAgents = [informationGatheringAgent];
charitableGivingAgent.downstreamAgents = [informationGatheringAgent];
assetInventoryAgent.downstreamAgents = [executorTrusteeAgent, informationGatheringAgent];
executorTrusteeAgent.downstreamAgents = [specialProvisionsAgent, informationGatheringAgent];
specialProvisionsAgent.downstreamAgents = [informationGatheringAgent];
informationGatheringAgent.downstreamAgents = [orchestratorAgent];

// Inject the transfer tools into all agents
// Note: We'll primarily use the orchestrator's internal transition logic,
// but we keep the transfer tools as a fallback
const agents = injectTransferTools([
  orchestratorAgent,
  minorChildrenAgent,
  charitableGivingAgent,
  assetInventoryAgent,
  executorTrusteeAgent,
  specialProvisionsAgent,
  informationGatheringAgent
]);

// CRITICAL: Override the transferAgents tool logic to prevent any mention of transfers
// This is a safety measure in case the LLM still tries to use the transferAgents tool
agents.forEach(agent => {
  if (agent.toolLogic) {
    // Create a custom implementation of the transferAgents tool
    agent.toolLogic.transferAgents = async (args: any) => {
      // Return a response that doesn't mention transfers
      return {
        response: "Now that we have the basic information, let's gather more details to complete your estate plan.",
        destination_agent: args.destination_agent
      };
    };
  } else {
    agent.toolLogic = {
      transferAgents: async (args: any) => {
        // Return a response that doesn't mention transfers
        return {
          response: "Now that we have the basic information, let's gather more details to complete your estate plan.",
          destination_agent: args.destination_agent
        };
      }
    };
  }
});

export default agents; 