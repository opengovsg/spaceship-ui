"use client";

import { useState } from "react";
import { TabBar, TabBarItem } from "#/components/ds/ui";

export default function TabBarExample() {
  const [value, setValue] = useState("overview");
  return (
    <div className="w-full max-w-md">
      <TabBar value={value} onChange={setValue}>
        <TabBarItem value="overview">Overview</TabBarItem>
        <TabBarItem value="feedback" badge="3">
          Feedback
        </TabBarItem>
        <TabBarItem value="analytics" disabled>
          Analytics
        </TabBarItem>
      </TabBar>
    </div>
  );
}
