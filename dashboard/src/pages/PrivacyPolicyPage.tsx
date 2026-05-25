import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, ShieldCheck, Zap } from 'lucide-react';

const supportEmail = 'mail.ReviewNest@gmail.com';
const businessAddress = 'Basistha Chariali, Basistha Road, Guwahati - 29, Assam, India';

const sections = [
  {
    title: 'Information we collect',
    text: [
      'Account information such as business name, email address, password credentials, and login activity.',
      'Business profile information such as business type, WhatsApp number, Google review link, address, and message templates.',
      'Customer information added by a business user, including customer name, phone number, review request status, click activity, selected rating, and feedback submitted through ReviewNest.',
      'Technical information such as device, browser, IP address, usage logs, and error data needed to keep the service secure and reliable.',
    ],
  },
  {
    title: 'How we use information',
    text: [
      'To create accounts, authenticate users, provide dashboards, and authenticate the owner account.',
      'To generate review request links, open WhatsApp with prefilled messages, track review request activity, and collect private feedback.',
      'To improve product reliability, prevent abuse, troubleshoot errors, and understand feature usage.',
      'To communicate service updates, account notices, and support responses.',
    ],
  },
  {
    title: 'Sharing of information',
    text: [
      'We share information with service providers only when needed to run ReviewNest, such as hosting, database, email, analytics, and support tools.',
      'When a customer chooses to continue to Google, the customer leaves ReviewNest and interacts with Google under Google terms and policies.',
      'When a business sends a WhatsApp message, WhatsApp handles the message delivery under its own terms and policies.',
      'We may disclose information if required by law, regulation, court order, or to protect the rights, safety, and security of ReviewNest, businesses, customers, or the public.',
    ],
  },
  {
    title: 'Data responsibilities',
    text: [
      'Businesses are responsible for having the right permission to add customer contact details and send review requests.',
      'Businesses should avoid uploading sensitive personal information that is not required for review collection.',
      'ReviewNest processes customer information to provide the review request and feedback workflow requested by the business account.',
    ],
  },
  {
    title: 'Retention and deletion',
    text: [
      'We keep account, business, customer, request, and feedback data while an account is active or as needed to provide the service.',
      'A business may request deletion or export of account data by contacting support. Some records may be retained where required for legal, fraud prevention, or security purposes.',
    ],
  },
  {
    title: 'Security',
    text: [
      'We use reasonable administrative, technical, and organizational safeguards designed to protect information from unauthorized access, misuse, loss, and alteration.',
      'No online service can guarantee absolute security. Businesses should use strong passwords, protect account access, and notify us promptly about suspected unauthorized use.',
    ],
  },
  {
    title: 'Your choices',
    text: [
      'Business users can update business profile details and message templates inside the ReviewNest dashboard.',
      'Customers who no longer want to receive review requests should contact the business that sent the request.',
      'You may contact us to request access, correction, deletion, or other support related to personal information handled through ReviewNest.',
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

export default function PrivacyPolicyPage() {
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
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-emerald-100 text-emerald-700">
              <ShieldCheck size={24} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-600">Last updated: May 21, 2026</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600">
                This Privacy Policy explains how ReviewNest collects, uses, stores, and shares information when businesses use our review request and feedback platform.
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
              <h2 className="text-xl font-bold text-slate-950">Children</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                ReviewNest is intended for business use and is not directed to children. Businesses should not use ReviewNest to knowingly collect information from children unless they have lawful authority and appropriate consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">Changes to this policy</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                We may update this Privacy Policy as our service, practices, or legal obligations change. The updated version will be posted on this page with a revised date.
              </p>
            </section>

            <section className="rounded-[8px] border border-slate-200 bg-slate-50 p-5">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <Mail size={20} className="text-blue-600" />
                Contact and business address
              </h2>
              <div className="mt-4 space-y-3 text-sm font-medium leading-6 text-slate-600">
                <p>
                  For privacy requests, account data requests, or support questions, contact ReviewNest at <a href={`mailto:${supportEmail}`} className="font-bold text-blue-700">{supportEmail}</a>.
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
