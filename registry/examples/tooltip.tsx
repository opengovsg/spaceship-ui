"use client";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ds/ui";

export default function TooltipExample() {
  return (
    <TooltipProvider>
      <div className="flex w-full max-w-md items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Share</Button>
          </TooltipTrigger>
          <TooltipContent>Create a link for your team</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Publish</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Publish after your agency approves
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
