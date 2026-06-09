import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Copy, ExternalLink, Rocket, BookOpen } from "lucide-react";

// PLACEHOLDER: Replace with your actual Supabase credentials
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON = "YOUR_SUPABASE_ANON_KEY";
const SUPABASE_SERVICE_ROLE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY";
const PROJECT_ID = "your-project-id";

function CopyRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-muted/40 border">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div className="font-mono text-xs truncate">{secret ? "•".repeat(32) : value}</div>
      </div>
      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied`); }}>
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function DeploymentPanel() {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Rocket className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-semibold">Deploy to Vercel (GitHub)</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        This is a pure Vite SPA. Push your code to GitHub, import the repo in Vercel,
        then paste the environment variables below into <strong>Vercel → Project Settings → Environment Variables</strong>.
        Apply them to <em>Production, Preview, and Development</em>.
      </p>

      <div>
        <h3 className="font-semibold mb-2">Vercel environment variables (only these two)</h3>
        <div className="space-y-2">
          <CopyRow label="VITE_SUPABASE_URL" value={SUPABASE_URL} />
          <CopyRow label="VITE_SUPABASE_PUBLISHABLE_KEY" value={SUPABASE_ANON} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Vercel only hosts the static frontend — no server runtime. All sensitive logic (admin approve, email, signin)
          runs in Supabase Edge Functions, which already have <code>SUPABASE_SERVICE_ROLE_KEY</code> set automatically.
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Supabase Edge Function secrets</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Set these in <strong>Supabase Dashboard → Project Settings → Edge Functions → Secrets</strong>:
        </p>
        <div className="space-y-2">
          <CopyRow label="RESEND_API_KEY (optional — enables emailing access codes)" value="re_••••••••••••" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          For reference, the service-role key (used internally by edge functions, do NOT put in Vercel):
        </p>
        <div className="mt-2"><CopyRow label="SUPABASE_SERVICE_ROLE_KEY" value={SUPABASE_SERVICE_ROLE_KEY} /></div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Step-by-step</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Push your project to a GitHub repository.</li>
          <li>Go to <a className="text-secondary underline" href="https://vercel.com/new" target="_blank" rel="noreferrer">vercel.com/new <ExternalLink className="inline h-3 w-3" /></a> and import the repo.</li>
          <li>Framework Preset: <strong>Vite</strong>. Build command: <code>npm run build</code>. Output directory: <code>dist</code>.</li>
          <li>Paste the two <code>VITE_*</code> env vars above into Vercel.</li>
          <li>Click Deploy. Add your custom domain under Settings → Domains.</li>
          <li>In Supabase Dashboard → Authentication → URL Configuration, add your Vercel domain to <strong>Site URL</strong> and <strong>Redirect URLs</strong>.</li>
          <li>Deploy edge functions (one-time): <code>supabase functions deploy access-submit access-signin access-approve access-resend access-reject</code> — or the Lovable platform has already done this.</li>
        </ol>
      </div>

      <div className="rounded border border-secondary/30 bg-secondary/5 p-3 text-sm">
        <strong>Supabase Dashboard:</strong>{" "}
        <a className="text-secondary underline" href={`https://supabase.com/dashboard/project/${PROJECT_ID}`} target="_blank" rel="noreferrer">
          Open project <ExternalLink className="inline h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}

export function UserManualPanel() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-semibold">Admin user manual</h2>
      </div>
      <p className="text-sm text-muted-foreground">Complete guide for managing this app.</p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="overview">
          <AccordionTrigger>1. System overview</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>This is a flashcard revision platform for Research Methods. Users browse topic sets, revise cards, mark mastery, and bookmark content for exam preparation.</p>
            <p>Access is tiered: <strong>Free</strong> (first few cards per topic) and <strong>Full</strong> (all cards, unlocked by access code).</p>
            <p>Only authenticated users can read cards (enforced by RLS). Content includes 250+ professionally formatted cards from 5 past exam papers.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="requests">
          <AccordionTrigger>2. Access Requests</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Users who can't pay submit a request via the public Request Access page. You see them in the <strong>Access Requests</strong> tab.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Approve</strong> — generates an access code + synthetic email/password and emails it (if email config is set up).</li>
              <li><strong>Reject</strong> — marks the request denied.</li>
              <li><strong>Resend email</strong> — re-sends credentials if the user lost them.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="codes">
          <AccordionTrigger>3. Access Codes</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Generate codes manually for paying customers (solo = 1 seat, pair = 2 seats). Set agent name, assigned emails, expiry.</p>
            <p>Users redeem on the Profile page → access_level becomes <strong>full</strong>.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="content">
          <AccordionTrigger>4. Content (Topics & Cards)</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Create topic sets (title, description, free card limit, order). Inside each set add cards with question + answer.</p>
            <p><strong>Bulk import</strong>: paste Markdown using <code>Q:</code> / <code>A:</code> labels — asterisks and numbering are stripped automatically. Diagrams and tables preserved.</p>
            <p>Use fenced <code>```diagram closed-loop```</code> blocks to render real SVG diagrams in answers. Available: <code>closed-loop, dcs-pyramid, pneumatic-valve, butterfly-valve, bode, nyquist, root-locus, plc-architecture</code>.</p>
            <p>LaTeX math: wrap with <code>$inline$</code> or <code>$$block$$</code>.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="users">
          <AccordionTrigger>5. Users</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>View all users. Toggle <strong>full</strong>/<strong>free</strong> access. Grant or revoke admin role.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tickets">
          <AccordionTrigger>6. Messages (Support)</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Users send support messages from the Support page. Reply inline — replies are saved on the ticket.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payments">
          <AccordionTrigger>7. Payments</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Manual payment tracking. Log received payments, attach generated access codes, mark settled.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="agents">
          <AccordionTrigger>8. Agents</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Manage authorised agents (name + contact). The <strong>primary agent name</strong> shown on the landing/dashboard is set in Settings.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="settings">
          <AccordionTrigger>9. Settings</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>Set the displayed authorised agent name, solo amount, pair amount. Used across the landing page and request-access flow.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="install">
          <AccordionTrigger>10. Install (Android / iPhone)</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p><strong>Android (Chrome)</strong>: visitors see an "Install App" button. Or tap menu → "Install app" / "Add to Home screen".</p>
            <p><strong>iPhone (Safari)</strong>: Share → "Add to Home Screen". The app opens in standalone mode with the iOS splash.</p>
            <p>The app requires network to load fresh data; cards already viewed remain in browser cache.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deploy">
          <AccordionTrigger>11. Deployment (Vercel)</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <p>See the <strong>Deployment</strong> tab for exact env vars and step-by-step Vercel setup.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
