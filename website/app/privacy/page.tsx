import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Tusk",
  description: "Privacy policy for Tusk, the modern PostgreSQL client.",
};

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <Image src="/icon.png" alt="Tusk" width={28} height={28} className="rounded" />
            Tusk
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted mb-6">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-muted leading-relaxed">
              Tusk is a desktop application that runs locally on your computer. We are committed to
              protecting your privacy and being transparent about our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-foreground">Local Data:</strong> Your database connections,
              queries, and credentials are stored locally on your device. We do not have access to
              this data.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-foreground">Pro/Team Features:</strong> If you use AI-powered
              features, queries are sent to our servers for processing. We do not store your query
              data beyond what is necessary to provide the service.
            </p>
            <p className="text-muted leading-relaxed">
              <strong className="text-foreground">License Validation:</strong> We validate license
              keys to verify your subscription status. This includes your license key and basic
              device information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted leading-relaxed">
              Database credentials are encrypted using your operating system&apos;s secure storage
              (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux). We use
              industry-standard encryption for all data transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-muted leading-relaxed">
              Pro and Team features use AI services to process natural language queries. These
              services have their own privacy policies. We do not share your data with third
              parties for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted leading-relaxed">
              If you have questions about this privacy policy, please contact us at{" "}
              <a href="mailto:privacy@tusk.dev" className="text-accent hover:underline">
                privacy@tusk.dev
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-6xl text-center text-muted text-sm">
          &copy; {new Date().getFullYear()} Tusk. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
