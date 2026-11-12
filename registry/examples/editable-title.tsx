"use client";

import { useState } from "react";
import { EditableTitle } from "#/components/ds/patterns";

export default function EditableTitleExample() {
  const [title, setTitle] = useState("Grant eligibility checker");
  return (
    <div className="w-full max-w-md">
      <EditableTitle
        title={title}
        onTitleChange={setTitle}
        onDelete={() => {}}
      />
    </div>
  );
}
