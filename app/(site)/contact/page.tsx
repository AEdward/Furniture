import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="container-shop py-16">
      <div className="mb-10 text-center">
        <p className="section-label">Get in touch</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Contact us
        </h1>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="rounded-2xl border border-walnut-100 p-6 sm:p-8">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Visit the showroom
            </h2>
            {settings.address.map((line) => (
              <p key={line} className="text-ink/70">
                {line}
              </p>
            ))}
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Talk to us
            </h2>
            <p className="text-ink/70">{settings.email}</p>
            <p className="text-ink/70">{settings.phone}</p>
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Hours
            </h2>
            <p className="text-ink/70">Mon–Fri: 10am–6pm</p>
            <p className="text-ink/70">Sat–Sun: 11am–5pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
