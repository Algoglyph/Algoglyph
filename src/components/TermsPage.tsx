import React from 'react';
import { RoadmapBackground } from './RoadmapBackground';

export const TermsPage: React.FC = () => {
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
          <span className="font-display font-bold text-lg tracking-[-0.03em] text-white">AlgoGlyph</span>
        </a>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 pt-36 pb-24">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-white mb-10">AlgoGlyph Terms & Conditions</h1>
        
        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-[#a1a1a1]">
          <section>
            <h2 className="text-white text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AlgoGlyph ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">2. Description of Service</h2>
            <p>
              Algoglyph provides an interactive, spatial workspace for learning and experimenting with computer science concepts. The local-first workspace remains available without a paid plan. Access through the official local MCP connector is a paid, web-only subscription feature in this release and is not supported in the Electron app. We reserve the right to modify, suspend, or discontinue the Service as permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">3. User Responsibilities</h2>
            <p>
              You agree to use the Service only for lawful purposes. When using the Sandbox Compiler, you agree not to attempt to execute malicious code, exploit the compiler backend, or use the service for crypto mining, spam, or denial of service attacks.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">4. Subscriptions, Cancellation, and Payment Failures</h2>
            <p>
              Pro subscriptions are offered monthly or annually through Stripe for international/USD billing and Razorpay for India/INR billing. Prices and applicable taxes are shown in hosted checkout before purchase. A subscription renews automatically until you cancel. Self-service cancellation takes effect at the end of the paid billing period, so MCP access continues until that date. After a verified renewal failure, access may continue for a 72-hour recovery grace period. Access may be revoked immediately following a refund, payment dispute, fraud determination, security cancellation, or expiry of the paid or grace period.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">5. Refunds</h2>
            <p>
              Except where required by applicable law or expressly stated at checkout, subscription charges are non-refundable and cancellation stops future renewal rather than reversing the current charge. If you believe a charge is duplicated or unauthorized, contact us promptly with the processor receipt so it can be investigated. Any approved refund revokes the corresponding paid MCP entitlement.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p>
              The code you write and the diagrams you draw remain your intellectual property. However, the Algoglyph platform itself, including its design, architecture, and source code, is the property of the Algoglyph team.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is". Algoglyph makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
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
            <a href="/privacy/" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
