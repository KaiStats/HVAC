import ChatWidget from "./components/ChatWidget";

const PHONE = "(702) 555-1234";
const PHONE_HREF = "tel:7025551234";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">

      {/* ── Dispatch Alert Bar ── */}
      <div className="bg-amber-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-70 pulse-dot" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span>Technicians currently dispatched in Henderson, NV</span>
          </div>
          <a
            href={PHONE_HREF}
            className="text-sm font-bold tracking-wide underline underline-offset-2 decoration-white/50 hover:decoration-white transition-all"
          >
            {PHONE}
          </a>
        </div>
      </div>

      {/* ── Site Header ── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* AC unit icon */}
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="9" rx="2" strokeLinecap="round" />
                <path strokeLinecap="round" d="M6 11h.01M9 11h.01M12 11h2m2.5 0h.01" />
                <path strokeLinecap="round" d="M7 16l-1 3M17 16l1 3" />
              </svg>
            </div>
            <div>
              <p className="text-white font-extrabold text-xl tracking-tight leading-none">Desert Air HVAC</p>
              <p className="text-slate-400 text-xs mt-0.5">Henderson&rsquo;s 24/7 AC &amp; Plumbing</p>
            </div>
          </div>
          <a
            href={PHONE_HREF}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span className="hidden sm:inline">Call </span>{PHONE}
          </a>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="flex-1 bg-stone-100 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-14 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left column: headline + copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-7">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Emergency Service Available Now
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Climate restored<br />
              <span className="text-amber-600">in hours, not days.</span>
            </h2>

            <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg">
              Henderson&rsquo;s most trusted source for emergency AC repair, heating service,
              and licensed plumbing since 2009. When your system fails in Nevada heat,
              we answer the call — day or night, weekends and holidays.
            </p>

            {/* Credentials */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                NV Lic. C-21A &amp; C-1 #0081447
              </span>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                BBB Accredited A+ Rating
              </span>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Serving Henderson since 2009
              </span>
            </div>
          </div>

          {/* Right column: Get Help Now card */}
          <div className="bg-slate-900 rounded-2xl p-7 sm:p-9 text-white shadow-2xl ring-1 ring-white/5">
            {/* Card header */}
            <div className="flex items-start justify-between mb-6 gap-3">
              <h3 className="text-2xl font-extrabold leading-tight">Get Help Now</h3>
              <div className="flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/30 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                3 Crews Available
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              A live Henderson technician is standing by right now.
              Call for same-hour response — no hold music, no call center.
            </p>

            {/* Big phone CTA */}
            <a
              href={PHONE_HREF}
              className="flex items-center justify-center gap-3 w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-extrabold text-xl sm:text-2xl py-5 rounded-xl mb-5 transition-colors"
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {PHONE}
            </a>

            {/* Mini trust bullets */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "No Hold Time" },
                { label: "No Service Fee" },
                { label: "Upfront Pricing" },
              ].map(({ label }) => (
                <div key={label} className="bg-slate-800 rounded-lg px-2 py-2.5 text-xs font-medium text-slate-300">
                  {label}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700 my-5" />

            {/* Services we cover */}
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">We cover</p>
            <div className="flex flex-wrap gap-2">
              {["AC Repair", "Heating", "Plumbing", "Air Quality", "Duct Work", "Water Heaters"].map((svc) => (
                <span key={svc} className="bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-full border border-slate-700">
                  {svc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-700">

          <TrustItem
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
            title="Licensed &amp; Bonded"
            desc="State-certified technicians, fully insured. NV Lic. C-21A &amp; C-1."
          />

          <TrustItem
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="24/7 Rapid Response"
            desc="We answer every call, every hour. Same-day service guaranteed."
          />

          <TrustItem
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
            title="5-Star Verified"
            desc="500+ reviews on Google &amp; Yelp. Henderson's top-rated contractor."
          />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} Desert Air HVAC, LLC. Henderson, NV. All rights reserved.</p>
          <p>
            NV Lic. C-21A &amp; C-1 #0081447&nbsp;&middot;&nbsp;BBB Accredited A+&nbsp;&middot;&nbsp;
            <a href={PHONE_HREF} className="text-amber-600 hover:text-amber-500 font-medium">
              {PHONE}
            </a>
          </p>
        </div>
      </footer>

      {/* ── Chat Widget ── */}
      <ChatWidget />
    </div>
  );
}

function TrustItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col sm:items-center sm:text-center px-4 sm:px-8 py-8 sm:py-0 gap-3">
      <div className="text-amber-500">{icon}</div>
      <div>
        <p
          className="text-white font-bold text-base mb-1"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p
          className="text-slate-400 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      </div>
    </div>
  );
}
