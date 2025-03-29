"use client";

import React, { useState } from "react";
import Events from "./Events";
import EstatePlanViewer from "./EstatePlanViewer";
import { useEstatePlan } from "../contexts/EstatePlanContext";

export interface DebugPanelProps {
  isExpanded: boolean;
}

function DebugPanel({ isExpanded }: DebugPanelProps) {
  const [activeView, setActiveView] = useState<"estatePlan" | "logs" | "json">("estatePlan");
  const { estatePlanData } = useEstatePlan();

  if (!isExpanded) {
    return null;
  }

  // Format JSON with proper indentation for display
  const formattedJson = JSON.stringify(estatePlanData, null, 2);

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white overflow-hidden border border-gray-200 shadow-sm">
      <div className="flex border-b bg-gray-50 px-4 py-2 items-center">
        <div className="flex-grow font-semibold text-base">
          {activeView === "logs" ? "Debug Logs" : activeView === "json" ? "JSON Data" : ""}
        </div>
        <div className="flex rounded-lg overflow-hidden border">
          <button
            className={`px-3 py-1 text-sm ${
              activeView === "estatePlan"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("estatePlan")}
          >
            Estate Plan
          </button>
          <button
            className={`px-3 py-1 text-sm ${
              activeView === "json"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("json")}
          >
            JSON
          </button>
          <button
            className={`px-3 py-1 text-sm ${
              activeView === "logs"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("logs")}
          >
            Logs
          </button>
        </div>
      </div>
      
      <div className="flex-grow h-full overflow-hidden">
        {activeView === "estatePlan" ? (
          <EstatePlanViewer isExpanded={true} />
        ) : activeView === "json" ? (
          <div className="h-full overflow-auto p-4 bg-gray-50">
            <pre className="text-xs font-mono whitespace-pre-wrap bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              {formattedJson}
            </pre>
          </div>
        ) : (
          <Events isExpanded={true} />
        )}
      </div>
    </div>
  );
}

export default DebugPanel; 