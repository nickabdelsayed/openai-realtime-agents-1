import React from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import { EstatePlanProvider } from "@/app/contexts/EstatePlanContext";
import App from "./App";

export default function Page() {
  return (
    <TranscriptProvider>
      <EventProvider>
        <EstatePlanProvider>
          <App />
        </EstatePlanProvider>
      </EventProvider>
    </TranscriptProvider>
  );
}
