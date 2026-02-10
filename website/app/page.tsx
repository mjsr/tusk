import Image from "next/image";
import {
  Zap,
  Sparkles,
  Database,
  History,
  Terminal,
  Brain,
  MessageSquare,
  FileSpreadsheet,
  BarChart3,
  Share2,
  Bell,
  Check,
  Download,
  ArrowRight,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-xl font-bold">
          <Image src="/icon.png" alt="Tusk" width={28} height={28} className="rounded" />
          Tusk
        </a>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-muted hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-muted hover:text-foreground transition-colors">
            Pricing
          </a>
          <a
            href="#download"
            className="bg-accent hover:bg-accent-hover text-background px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your data, at your{" "}
          <span className="text-accent">fingertips</span>.
        </h1>
        <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
          Tusk is a modern PostgreSQL client with AI-powered queries and
          built-in product analytics. Stop wondering what your users are
          doing — take action.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#download"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-background px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Free
          </a>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 border border-border hover:border-muted hover:bg-surface px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            See Pricing
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-muted transition-colors">
      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: Zap,
      title: "Lightning fast",
      description: "Native performance with instant query results. No lag, no waiting.",
    },
    {
      icon: Sparkles,
      title: "Modern interface",
      description: "Dark-first design with a keyboard-driven workflow that stays out of your way.",
    },
    {
      icon: Terminal,
      title: "Smart autocomplete",
      description: "Schema-aware suggestions as you type. Your tables, columns, and functions at your fingertips.",
    },
    {
      icon: Database,
      title: "Multiple connections",
      description: "Manage all your databases in one place. Switch between them instantly.",
    },
    {
      icon: History,
      title: "Query history",
      description: "Never lose a query again. Search and rerun past queries with one click.",
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-surface/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            A Postgres client that gets out of your way.
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Everything you need to work with your database, nothing you don't.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  const features = [
    {
      icon: MessageSquare,
      title: "Natural language to SQL",
      description:
        '"Show me users who signed up last week" → instant query. No SQL knowledge required.',
    },
    {
      icon: Brain,
      title: "Query optimization",
      description:
        "Get suggestions to make your queries faster. Tusk analyzes and improves your SQL.",
    },
    {
      icon: FileSpreadsheet,
      title: "Automated reports",
      description:
        "Schedule CSV exports delivered to any inbox. Keep stakeholders updated automatically.",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block bg-accent/10 text-accent px-4 py-1 rounded-full text-sm font-medium mb-4">
            Pro Feature
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let AI write your queries.
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Describe what you want in plain English. Tusk writes the SQL.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AnalyticsSection() {
  const features = [
    {
      icon: BarChart3,
      title: "On-demand visualizations",
      description:
        "Turn any query into charts and dashboards. Understand your data at a glance.",
    },
    {
      icon: Share2,
      title: "Shareable reports",
      description:
        "Keep your whole team in sync. Share insights with a link.",
    },
    {
      icon: Bell,
      title: "Action triggers",
      description:
        "Set alerts when metrics cross thresholds. Never miss critical changes.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-surface/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block bg-success/10 text-success px-4 py-1 rounded-full text-sm font-medium mb-4">
            Team Feature
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't wonder. Act.
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Turn your database into a product insights engine.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-8 border ${
        highlighted
          ? "border-accent bg-accent/5"
          : "border-border bg-surface"
      }`}
    >
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted ml-1">{period}</span>}
      </div>
      <p className="text-muted mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href="#download"
        className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
          highlighted
            ? "bg-accent hover:bg-accent-hover text-background"
            : "border border-border hover:border-muted hover:bg-surface-hover"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Everything you need to get started.",
      features: [
        "Full PostgreSQL GUI",
        "Multiple connections",
        "Query history",
        "Smart autocomplete",
        "Syntax highlighting",
      ],
      cta: "Download Free",
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      description: "AI-powered productivity for power users.",
      features: [
        "Everything in Free",
        "AI-powered queries",
        "Natural language to SQL",
        "Query optimization",
        "Automated CSV reports",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$29",
      period: "/user/month",
      description: "Insights and collaboration for teams.",
      features: [
        "Everything in Pro",
        "On-demand visualizations",
        "Shareable dashboards",
        "Team collaboration",
        "Action triggers & alerts",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Start free, upgrade when you need more power.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

// GitHub release URLs
const GITHUB_REPO = "mjsr/tusk";
const LATEST_VERSION = "1.0.1";
const DOWNLOAD_URLS = {
  macOS: `https://github.com/${GITHUB_REPO}/releases/download/v${LATEST_VERSION}/Tusk-${LATEST_VERSION}-arm64.dmg`,
  windows: `https://github.com/${GITHUB_REPO}/releases/latest`, // Coming soon - links to releases page
  linux: `https://github.com/${GITHUB_REPO}/releases/latest`, // Coming soon - links to releases page
  allReleases: `https://github.com/${GITHUB_REPO}/releases`,
};

function FinalCTA() {
  return (
    <section id="download" className="py-20 px-6 bg-surface/50">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to take control of your data?
        </h2>
        <p className="text-muted text-lg mb-8">
          Download Tusk and start querying in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={DOWNLOAD_URLS.macOS}
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-background px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download for macOS
          </a>
          <a
            href={DOWNLOAD_URLS.windows}
            className="inline-flex items-center justify-center gap-2 border border-border hover:border-muted hover:bg-surface px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download for Windows
          </a>
        </div>
        <p className="text-muted text-sm mt-4">
          Also available for{" "}
          <a href={DOWNLOAD_URLS.linux} className="text-accent hover:underline">
            Linux
          </a>
          . See{" "}
          <a href={DOWNLOAD_URLS.allReleases} className="text-accent hover:underline">
            all releases
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Image src="/icon.png" alt="Tusk" width={24} height={24} className="rounded" />
            Tusk
          </div>
          <div className="flex items-center gap-6 text-muted">
            <a href="https://twitter.com/mjsr" className="hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="https://github.com/mjsr/tusk" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://github.com/mjsr/tusk#readme" className="hover:text-foreground transition-colors">
              Docs
            </a>
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-muted text-sm">
          &copy; {new Date().getFullYear()} Tusk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AISection />
        <AnalyticsSection />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
