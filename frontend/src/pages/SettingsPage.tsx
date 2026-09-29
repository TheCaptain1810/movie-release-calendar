import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMyFeedUrl, regenerateFeedUrl } from "@/api";
import type { FeedUrls } from "@/types";
import { Check, Copy, RefreshCw } from "lucide-react";

export function SettingsPage() {
  const [feed, setFeed] = React.useState<FeedUrls | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);

  React.useEffect(() => {
    fetchMyFeedUrl().then(setFeed).catch(() => {});
  }, []);

  async function handleCopy() {
    if (!feed) return;
    await navigator.clipboard.writeText(feed.webcalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const next = await regenerateFeedUrl();
      setFeed(next);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your calendar subscription</CardTitle>
          <CardDescription>
            Subscribe to this link from Google Calendar, Apple Calendar, or Outlook to see your tracked
            movies' release dates automatically — it updates whenever you add or remove a movie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {feed ? (
            <>
              <code className="break-all rounded-md bg-muted px-3 py-2 text-xs">{feed.webcalUrl}</code>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleRegenerate} disabled={regenerating}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {regenerating ? "Regenerating…" : "Regenerate link"}
                </Button>
              </div>

              <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                <p><strong>Google Calendar:</strong> Settings → Add calendar → From URL → paste the link above.</p>
                <p><strong>Apple Calendar:</strong> File → New Calendar Subscription → paste the link above.</p>
                <p><strong>Outlook:</strong> Add calendar → Subscribe from web → paste the link above.</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading your feed link…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
