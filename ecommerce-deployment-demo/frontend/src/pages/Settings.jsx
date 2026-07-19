import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";

export default function Settings() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/seller" className="inline-flex items-center gap-2">
            <FaArrowLeft className="h-3 w-3" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          Account Settings
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-4 text-sm text-muted-foreground">
          Account settings are coming soon. For now, you can manage your profile
          and store information from the respective pages.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="mb-1 text-sm font-medium text-foreground">
              Profile Settings
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Update your personal information and shipping preferences.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile">Go to Profile</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="mb-1 text-sm font-medium text-foreground">
              Store Settings
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Manage your store details and seller information.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/seller/kyc">Go to Store Setup</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
