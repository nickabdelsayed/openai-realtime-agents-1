import { AllAgentConfigsType } from "@/app/types";
import frontDeskAuthentication from "./frontDeskAuthentication";
import customerServiceRetail from "./customerServiceRetail";
import simpleExample from "./simpleExample";
import willAndTrustParalegal from "./willAndTrustParalegal";

export const allAgentSets: AllAgentConfigsType = {
  frontDeskAuthentication,
  customerServiceRetail,
  simpleExample,
  willAndTrustParalegal,
};

export const defaultAgentSetKey = "simpleExample";
