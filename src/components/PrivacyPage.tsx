import React from 'react';
import { RoadmapBackground } from './RoadmapBackground';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="relative w-full bg-[#08080a] text-[#f0f0f2] overflow-x-hidden selection:bg-[#ededed] selection:text-[#000000] min-h-screen font-sans antialiased">
      {/* Background styling to match landing page */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <RoadmapBackground tone="neutral" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 130% 120% at 50% 0%, rgba(255,255,255,0.018) 0%, rgba(8,8,10,0) 55%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-screen" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/[0.04] bg-[#000000]/60 backdrop-blur-md z-50 flex items-center px-6 sm:px-12">
        <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="w-6 h-6 shrink-0">
            <img src="/favicon.png" alt="AlgoGlyph brand logo" width={24} height={24} className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-lg tracking-[-0.03em] text-white">Algoglyph</span>
        </a>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 pt-36 pb-24">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-white mb-10">AlgoGlyph Privacy Policy</h1>
        
        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-[#a1a1a1]">
          <section>
            <h2 className="text-white text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p>
              When you use Algoglyph, we collect minimal information required to provide the service. We use PostHog for analytics to understand how visitors interact with our tools. If you choose to sign in with Google or purchase MCP access, Firebase processes your Google account identifier, display name, email address, profile photo, personal workspace membership, subscription status, and MCP entitlement records.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">2. How We Use Your Data</h2>
            <p>
              We use your data solely to operate and improve the Algoglyph platform, administer subscriptions, prevent payment and connector abuse, and authorize paid MCP sessions. We do not sell your personal data to third parties. Google account information is not linked to PostHog profiles. Your workspace content—including notes, code, and canvas drawings—remains in your browser's IndexedDB and is not uploaded to Firebase when you sign in or subscribe.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">3. Third-Party Services</h2>
            <p>
              Optional Google sign-in and server-owned subscription records use Google Firebase. Stripe processes international/USD subscription checkout, and Razorpay processes India/INR subscription checkout. Those processors receive payment and transaction information under their own privacy terms; Algoglyph does not receive complete card details. We also use Wandbox for code compilation. Code that you run in the Sandbox Compiler is sent to Wandbox to be executed and returned. Do not submit sensitive personal information or proprietary secrets through the code runner.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">4. Billing and Connector Records</h2>
            <p>
              We retain provider customer and subscription identifiers, verified payment-event identifiers, entitlement status, short-lived connector-grant hashes, and security audit records. Raw connector grants are not stored. These records do not include your notes, canvas, code, prompts, complete card number, or card security code.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">5. Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. Since Algoglyph primarily operates as a client-side sandbox, the vast majority of your data never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">6. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us via the form on our home page.
            </p>
          </section>
          
          <div className="pt-8 border-t border-white/[0.04] text-[13px] text-white/40">
            Last updated: August 2026
          </div>
        </div>
      </main>
      
      <footer className="py-10 border-t border-white/[0.04] bg-[#070709] relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Algoglyph. Workspace Sandbox client.</span>
          </div>
          <div className="flex gap-4">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/terms/" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
