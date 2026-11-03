import Link from "next/link"
import { LogoMark } from "@/components/ui/logo-mark"
import { SkipLink } from "@/components/layout/skip-link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SkipLink />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[68ch] px-5 py-12 md:py-16">
        <Link href="/" className="mb-10 inline-flex min-h-11 items-center gap-2.5 rounded-[var(--radius-control)]">
          <LogoMark size={26} />
          <span className="font-extrabold text-chalk">Dev Day One</span>
        </Link>

        <h1 className="mb-2 text-[2.4414rem] font-extrabold text-chalk">Privacy Policy</h1>
        <p className="mb-10 text-sm text-fog">Last updated: June 13, 2026</p>

        <div className="space-y-8 text-fog">
          <Section title="1. Information We Collect">
            We collect your email address and profile information when you sign in via GitHub, Google, or email. We also collect metadata about the repositories you connect, including file paths, code structure, and embeddings derived from your code.
          </Section>

          <Section title="2. How We Use Your Information">
            Your information is used solely to operate the Dev Day One service — to index your repositories, answer your questions, and personalise your experience. We do not sell or share your data with third parties for marketing purposes.
          </Section>

          <Section title="3. GitHub Data">
            When you connect a repository, we access it using your GitHub OAuth token. We read file contents to generate embeddings for search. Raw file contents are processed in memory and are not permanently stored. Embeddings and extracted metadata (file paths, structure) are stored to power the service.
          </Section>

          <Section title="4. Data Retention">
            Repository data is retained until you disconnect the repository from Dev Day One, at which point all associated embeddings and metadata are deleted. Account data is retained until you delete your account.
          </Section>

          <Section title="5. Security">
            We use industry-standard security practices including encrypted connections (HTTPS), secure authentication via Supabase, and access controls to protect your data.
          </Section>

          <Section title="6. Third-Party Services">
            Dev Day One uses the following third-party services: Supabase (authentication and database), GitHub (repository access), and Groq (AI inference). Each has their own privacy policies governing their use of data.
          </Section>

          <Section title="7. Cookies">
            We use cookies solely for authentication session management. We do not use tracking or advertising cookies.
          </Section>

          <Section title="8. Your Rights">
            You may request deletion of your account and all associated data at any time by contacting us. You may also disconnect any repository at any time to remove its data from our systems.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this policy from time to time. We will notify you of significant changes via email or an in-app notice.
          </Section>

          <Section title="10. Contact">
            For privacy-related questions or data deletion requests, contact us at <a href="mailto:ggtempestt@gmail.com" className="text-route underline underline-offset-4">ggtempestt@gmail.com</a>.
          </Section>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-[1.25rem] font-bold text-chalk">{title}</h2>
      <p>{children}</p>
    </div>
  )
}
