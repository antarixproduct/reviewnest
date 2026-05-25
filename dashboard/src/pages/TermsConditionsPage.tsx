import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, MapPin, Zap } from 'lucide-react';

const supportEmail = 'mail.ReviewNest@gmail.com';
const businessAddress = 'Basistha Chariali, Basistha Road, Guwahati - 29, Assam, India';

const sections = [
  {
    title: 'Use of ReviewNest',
    text: [
      'ReviewNest provides tools for businesses to manage customer review requests, WhatsApp follow-ups, review links, feedback collection, and related reporting.',
      'You may use ReviewNest only for lawful business purposes and in accordance with these terms.',
      'You are responsible for all activity under your account and for keeping login credentials secure.',
    ],
  },
  {
    title: 'Business and customer data',
    text: [
      'You are responsible for the accuracy of business profile details, customer contact information, Google review links, and message templates added to ReviewNest.',
      'You must have appropriate permission or another lawful basis to contact customers and send review requests.',
      'You must not upload unlawful, harmful, abusive, misleading, confidential, or unnecessary sensitive information to ReviewNest.',
    ],
  },
  {
    title: 'WhatsApp, Google, and third-party services',
    text: [
      'ReviewNest may help open WhatsApp with a prefilled message, but message delivery and WhatsApp account use are governed by WhatsApp terms and policies.',
      'When customers continue to Google to leave a review, they use Google under Google terms and policies.',
      'ReviewNest is not responsible for decisions made by third-party platforms, including message delivery limits, account restrictions, review moderation, ranking changes, or display of Google reviews.',
    ],
  },
  {
    title: 'Account access',
    text: [
      'ReviewNest accounts are intended for authorized business users only.',
      'We may suspend or limit access if account activity creates legal, security, operational, or reputation risk.',
      'You are responsible for keeping your account information current and for contacting support if account access should be changed or removed.',
    ],
  },
  {
    title: 'Acceptable use',
    text: [
      'You must not use ReviewNest for spam, harassment, fake reviews, review gating that violates platform rules, unlawful marketing, scraping, reverse engineering, security testing without permission, or attempts to disrupt the service.',
      'You must not misrepresent customer sentiment, impersonate customers, or pressure customers to provide dishonest reviews.',
      'We may suspend or terminate access if we believe use of ReviewNest creates legal, security, operational, or reputation risk.',
    ],
  },
  {
    title: 'Service availability',
    text: [
      'We aim to keep ReviewNest reliable, but the service may be interrupted by maintenance, upgrades, outages, third-party failures, network issues, or events outside our control.',
      'We may modify, add, or remove features as the product evolves.',
    ],
  },
  {
    title: 'Intellectual property',
    text: [
      'ReviewNest, including its software, design, dashboard, branding, workflows, and documentation, is owned by ReviewNest or its licensors.',
      'You retain responsibility for business content and customer data you submit, while granting us the limited rights needed to provide and improve the service.',
    ],
  },
  {
    title: 'Disclaimers and limitation of liability',
    text: [
      'ReviewNest does not guarantee a specific number of reviews, Google ranking improvement, customer response rate, business growth, or revenue outcome.',
      'To the fullest extent permitted by law, ReviewNest is provided on an as-is and as-available basis.',
      'To the fullest extent permitted by law, ReviewNest will not be liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages arising from use of the service.',
    ],
  },
  {
    title: 'Termination',
    text: [
      'You may stop using ReviewNest at any time. We may suspend or terminate access if you breach these terms, misuse the service, or create risk for ReviewNest, customers, or other businesses.',
      'After termination, some information may be retained where required for legal, security, fraud prevention, or dispute purposes.',
    ],
  },
];

function LegalHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-slate-950 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Zap size={20} className="fill-white" />
          </span>
          <span className="font-display text-xl font-bold tracking-normal">ReviewNest</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:px-4"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-[8px] bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:px-4"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <LegalHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
          <ArrowLeft size={16} />
          Back to homepage
        </Link>

        <section className="rounded-[8px] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-8 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-amber-100 text-amber-700">
              <FileText size={24} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-600">Last updated: May 21, 2026</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Terms & Conditions
              </h1>
              <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600">
                These Terms & Conditions govern access to and use of ReviewNest. By creating an account or using the service, you agree to these terms.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.text.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-bold text-slate-950">Changes to these terms</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                We may update these Terms & Conditions from time to time. The updated version will be posted on this page with a revised date. Continued use of ReviewNest after changes means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">Governing law</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                These terms are governed by the laws of India. Courts and authorities with jurisdiction in Assam, India will have jurisdiction where legally applicable.
              </p>
            </section>

            <section className="rounded-[8px] border border-slate-200 bg-slate-50 p-5">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <Mail size={20} className="text-blue-600" />
                Contact and business address
              </h2>
              <div className="mt-4 space-y-3 text-sm font-medium leading-6 text-slate-600">
                <p>
                  For questions about these terms or account support, contact ReviewNest at <a href={`mailto:${supportEmail}`} className="font-bold text-blue-700">{supportEmail}</a>.
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={17} className="mt-1 shrink-0 text-blue-600" />
                  <span>{businessAddress}</span>
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
