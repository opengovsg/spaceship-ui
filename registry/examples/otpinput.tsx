"use client";

import { useState } from "react";
import { OTPInput } from "#/components/ds/ui";

export default function OTPInputExample() {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState("123456");

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-6">
      <OTPInput value={code} onValueChange={setCode} />
      <OTPInput
        value={wrong}
        onValueChange={setWrong}
        error
        errorMessage="That code is not correct. Check your email and try again."
      />
    </div>
  );
}
