import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Tusk",
  description: "Terms of service for Tusk, the modern PostgreSQL client.",
};

export default function Terms() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted mb-6">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-muted leading-relaxed">
              By downloading, installing, or using Tusk, you agree to be bound by these Terms of
              Service. If you do not agree to these terms, do not use the software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">License</h2>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-foreground">Free Tier:</strong> Tusk Free is provided under a
              permissive license for personal and commercial use. You may use it on any number of
              devices.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              <strong className="text-foreground">Pro/Team Tiers:</strong> Paid features require a
              valid subscription. Licenses are per-user and may not be shared. Your subscription
              grants access to premium features for the duration of your billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
            <p className="text-muted leading-relaxed">
              You agree not to use Tusk to: violate any applicable laws; access databases without
              authorization; attempt to circumvent license restrictions; or reverse engineer the
              software beyond what is permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-muted leading-relaxed">
              Tusk is provided &quot;as is&quot; without warranty of any kind. We do not guarantee
              that the software will be error-free or uninterrupted. You are responsible for
              maintaining backups of your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of data or
              profits, arising from your use of Tusk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted leading-relaxed">
              We may update these terms from time to time. Continued use of Tusk after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted leading-relaxed">
              If you have questions about these terms, please contact us at{" "}
              <a href="mailto:legal@tusk.dev" className="text-accent hover:underline">
                legal@tusk.dev
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
