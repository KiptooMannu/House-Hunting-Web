import { Link } from 'react-router-dom';

export default function TermsPrivacy() {
  return (
    <div className="bg-surface text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-bold tracking-tighter text-sky-900">Savanna Horizon</div>
        <Link 
          className="text-sky-900 text-sm font-semibold font-headline flex items-center gap-2 hover:bg-slate-100/50 transition-colors px-4 py-2 rounded-full" 
          to="/"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Portal
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 flex-1">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block lg:w-1/4">
          <nav className="sticky top-32 space-y-2">
            <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-6 px-4">Legal Directory</p>
            <a className="block px-4 py-3 text-sky-900 font-bold bg-white rounded-r-full shadow-sm transition-transform hover:translate-x-1" href="#introduction">
              Introduction
            </a>
            <a className="block px-4 py-3 text-slate-600 font-medium hover:bg-sky-50 transition-transform hover:translate-x-1" href="#data-handling">
              Data & M-Pesa Handling
            </a>
            <a className="block px-4 py-3 text-slate-600 font-medium hover:bg-sky-50 transition-transform hover:translate-x-1" href="#kra-compliance">
              KRA PIN & Tax Compliance
            </a>
            <a className="block px-4 py-3 text-slate-600 font-medium hover:bg-sky-50 transition-transform hover:translate-x-1" href="#user-responsibilities">
              User Responsibilities
            </a>
            <a className="block px-4 py-3 text-slate-600 font-medium hover:bg-sky-50 transition-transform hover:translate-x-1" href="#platform-rules">
              Platform Rules
            </a>
            <a className="block px-4 py-3 text-slate-600 font-medium hover:bg-sky-50 transition-transform hover:translate-x-1" href="#termination">
              Service Termination
            </a>
            <div className="mt-12 p-6 bg-surface-container-low rounded-xl">
              <p className="font-headline font-bold text-sm text-primary mb-2">Need legal help?</p>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Contact our compliance team regarding GavaConnect integrations.</p>
              <button className="w-full py-2 bg-primary text-white rounded-full text-xs font-bold hover:opacity-90 transition-opacity">Contact Legal</button>
            </div>
          </nav>
        </aside>

        {/* Editorial Content Canvas */}
        <article className="lg:w-3/4 space-y-24">
          {/* Hero Header Section */}
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary-container px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-on-secondary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-xs font-bold text-on-secondary-container tracking-wide uppercase">Effective August 2024</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-primary leading-[1.1]">
              Terms of Service & <br/><span className="text-sky-400">Privacy Protocols.</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl font-body leading-relaxed">
              Savanna Horizon is committed to the highest standards of transparency and digital integrity. This document outlines your rights and our obligations in the Kenyan real estate ecosystem.
            </p>
          </section>

          {/* Introduction Section */}
          <section className="space-y-8 scroll-mt-32" id="introduction">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-headline font-black text-slate-200">01</span>
              <h2 className="text-3xl font-bold text-primary tracking-tight">Introduction</h2>
            </div>
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 text-lg text-on-surface-variant font-body leading-[1.8] space-y-6">
                <p>Welcome to Savanna Horizon. By accessing our platform, you agree to be bound by these Terms of Service. Our services are specifically tailored for the Kenyan market, integrating modern financial tools and government portals to streamline property management.</p>
                <p>These terms govern your use of our website, mobile application, and concierge services. Please read them carefully, as they include important information regarding your legal rights and remedies.</p>
              </div>
            </div>
          </section>

          {/* Data & Financials Bento */}
          <section className="space-y-8 scroll-mt-32" id="data-handling">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-headline font-black text-slate-200">02</span>
              <h2 className="text-3xl font-bold text-primary tracking-tight">Data & Financial Integrity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* M-Pesa Info */}
              <div className="bg-surface-container-low p-8 rounded-xl border-l-4 border-secondary flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-on-secondary-container text-2xl">account_balance_wallet</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-4">M-Pesa Payouts & Collections</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">We utilize secure APIs for all transactions. Users are responsible for ensuring that the mobile number linked to their profile is active and verified by Safaricom.</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-xs font-bold text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">shield</span>
                    END-TO-END ENCRYPTED
                  </p>
                </div>
              </div>
              {/* GavaConnect Info */}
              <div className="bg-primary p-8 rounded-xl text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">hub</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">GavaConnect Synchronization</h3>
                  <p className="text-sky-100/80 leading-relaxed text-sm">Your data may be synchronized with national registries for property verification. This ensures that every listing on Savanna Horizon is legally sound and title-deed verified.</p>
                </div>
                <div className="mt-8">
                  <span className="text-xs font-bold bg-sky-400/20 px-3 py-1 rounded-full text-sky-200 uppercase tracking-wider">Real-time Verification</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tax Compliance Section */}
          <section className="space-y-8 scroll-mt-32" id="kra-compliance">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-headline font-black text-slate-200">03</span>
              <h2 className="text-3xl font-bold text-primary tracking-tight">Tax Compliance & KRA PIN</h2>
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="max-w-2xl space-y-6">
                  <h4 className="text-xl font-bold text-primary">Mandatory PIN Submission</h4>
                  <p className="text-on-surface-variant leading-relaxed">In accordance with the Finance Act, all landlords and commercial entities must provide a valid KRA PIN. Savanna Horizon acts as a reporting entity for rental income tax purposes where applicable by law.</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                      <span className="text-on-surface-variant">Automated generation of monthly rental income tax reports.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                      <span className="text-on-surface-variant">Secure storage of tax certificates and compliance documents.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                      <span className="text-on-surface-variant">Direct portal linkage for e-slip generation.</span>
                    </li>
                  </ul>
                </div>
              </div>
              {/* Decorative Graphic */}
              <div className="h-64 bg-slate-200 relative overflow-hidden">
                <img 
                  alt="Financial documents" 
                  className="w-full h-full object-cover mix-blend-multiply opacity-30" 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="space-y-8 scroll-mt-32" id="user-responsibilities">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-headline font-black text-slate-200">04</span>
              <h2 className="text-3xl font-bold text-primary tracking-tight">User Responsibilities</h2>
            </div>
            <div className="space-y-6 text-on-surface-variant leading-relaxed max-w-3xl">
              <p>As a user of the Savanna Horizon platform, you are solely responsible for the accuracy of the information provided in your profile. Misrepresentation of property ownership or tenant status is grounds for immediate permanent suspension.</p>
              <div className="grid sm:grid-cols-2 gap-8 mt-8">
                <div className="space-y-2">
                  <p className="font-headline font-bold text-primary">Account Security</p>
                  <p className="text-sm">You must maintain the confidentiality of your login credentials. We recommend two-factor authentication (2FA) via your registered mobile number.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-headline font-bold text-primary">Listing Accuracy</p>
                  <p className="text-sm">Images and descriptions must reflect the true state of the property. Digitally altered images that hide structural defects are strictly prohibited.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Rules Grid */}
          <section className="space-y-8 scroll-mt-32" id="platform-rules">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-headline font-black text-slate-200">05</span>
              <h2 className="text-3xl font-bold text-primary tracking-tight">Platform Rules</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-primary mb-4 text-2xl">no_accounts</span>
                <h5 className="font-bold text-primary mb-2">No Impersonation</h5>
                <p className="text-sm text-on-surface-variant">Registering as a landlord without proof of title or management mandate is prohibited.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-primary mb-4 text-2xl">monetization_on</span>
                <h5 className="font-bold text-primary mb-2">Fair Pricing</h5>
                <p className="text-sm text-on-surface-variant">Hidden fees outside of the agreed lease terms are not permitted through our payment systems.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-primary mb-4 text-2xl">gavel</span>
                <h5 className="font-bold text-primary mb-2">Legal Dispute</h5>
                <p className="text-sm text-on-surface-variant">All disputes between landlords and tenants should be mediated via the Rent Restriction Tribunal.</p>
              </div>
            </div>
          </section>

          {/* Termination Action */}
          <section className="p-12 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex flex-col md:flex-row items-center justify-between gap-8 scroll-mt-32" id="termination">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight">Service Termination</h2>
              <p className="max-w-md opacity-80 leading-relaxed font-medium">We reserve the right to suspend or terminate accounts that violate our community standards or fail to comply with KRA reporting mandates.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-tertiary text-on-tertiary rounded-full font-bold shadow-lg hover:brightness-110 transition-all">Download PDF</button>
              <button className="px-8 py-3 bg-white/20 border border-tertiary-container/30 text-on-tertiary-fixed rounded-full font-bold hover:bg-white/40 transition-all">I Agree</button>
            </div>
          </section>
        </article>
      </main>

      <footer className="w-full py-12 mt-auto bg-surface-container-low flex flex-col items-center justify-center space-y-4 px-8">
        <div className="flex flex-wrap justify-center gap-8 mb-4">
          <Link className="text-slate-500 text-xs font-inter leading-relaxed hover:text-sky-600 transition-colors" to="/privacy">Privacy Policy</Link>
          <Link className="text-slate-500 text-xs font-inter leading-relaxed hover:text-sky-600 transition-colors" to="/terms">Terms of Service</Link>
          <Link className="text-slate-500 text-xs font-inter leading-relaxed hover:text-sky-600 transition-colors" to="/compliance">Tax Compliance Guide</Link>
        </div>
        <p className="text-slate-500 text-xs font-inter leading-relaxed text-center opacity-80">
          © 2024 Savanna Horizon. Integrated with GavaConnect & M-Pesa.
        </p>
      </footer>
    </div>
  );
}
