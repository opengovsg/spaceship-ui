"use client";

import { useState } from "react";
import { SortableList } from "#/components/ds/ui";

export default function SortableListExample() {
  const [items, setItems] = useState([
    "Save officer time",
    "Fewer errors",
    "Faster replies to the public",
  ]);

  return (
    <div className="w-full max-w-md">
      <SortableList items={items} onReorder={setItems} />
    </div>
  );
}
