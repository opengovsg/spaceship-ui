import HelpCircle from "#/components/ds/icons/help-circle.svg?react";
import MailSend from "#/components/ds/icons/mail-send.svg?react";
import LogOut from "#/components/ds/icons/log-out.svg?react";
import { Button } from "#/components/ds/ui";

const HELP_GUIDE_URL = "https://spaceship.guides.gov.sg/";
const CONTACT_US_URL = "https://go.gov.sg/spaceship-support";

interface SidebarFooterProps {
  email: string;
  /** Called when the user clicks Logout. The app wires its own logout here. */
  onLogout: () => void;
}

/**
 * Bottom-of-sidebar block for the /v2 shell: help/support links, the
 * signed-in user's email, and logout. `email` comes from the v1 session
 * slice — pass it down from a component that reads the v1 store.
 *
 * Logout is passed in as `onLogout` so the DS stays free of app hooks.
 * The help and contact URLs are product links, kept here on purpose.
 * Kept next to `Sidebar` because the two are always used together.
 */
export function SidebarFooter({ email, onLogout }: SidebarFooterProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4">
        <hr className="border-(--border-subtle) mb-2" />

        <Button asChild variant="tertiary" surface="shadow" className="w-full">
          <a href={HELP_GUIDE_URL} target="_blank" rel="noopener noreferrer">
            Help Guide
            <HelpCircle />
          </a>
        </Button>
        <Button asChild variant="tertiary" surface="shadow" className="w-full">
          <a href={CONTACT_US_URL} target="_blank" rel="noopener noreferrer">
            Contact Us
            <MailSend />
          </a>
        </Button>
      </div>

      <span className="truncate text-(--text-tertiary) text-caption normal-case font-bold text-center py-1">
        {email}
      </span>

      <Button variant="destructive" surface="ghost" onClick={onLogout}>
        Logout
        <LogOut />
      </Button>
    </div>
  );
}
