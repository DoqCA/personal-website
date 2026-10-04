import { MapPinIcon } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { contact } from "@/data/site";
import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <Section id="contact" className="pb-8 md:pb-12">
      <Reveal className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-muted uppercase">
            {contact.eyebrow}
          </p>
          <h2
            id="contact-heading"
            className="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl"
          >
            {contact.heading}
          </h2>
          <p className="mt-8 text-lg font-light text-body">{contact.intro}</p>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
              <MapPinIcon aria-hidden className="size-5 text-white" />
            </span>
            <div>
              <p className="font-medium text-muted">{contact.locationLabel}</p>
              <p className="text-body">{contact.location}</p>
            </div>
          </div>
        </div>

        <ContactForm form={contact.form} />
      </Reveal>
    </Section>
  );
}
