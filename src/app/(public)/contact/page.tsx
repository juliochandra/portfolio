import type { Metadata } from "next";
import { ContactForm } from "@/app/(public)/contact/_components/ContactForm";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getContactInfo } from "@/features/contact/contact.action";
import { ContactLink } from "@/shared/components/ContactLink";

export const metadata: Metadata = {
	title: "Contact",
	description: "Hubungi Julio Chandra untuk berdiskusi tentang project Anda.",
};

export default async function ContactPage() {
	const contactInfoResult = await getContactInfo();

	return (
		<>
			<Section>
				<SectionHeader
					badge="Contact"
					title="Mari Bekerja Sama"
					description="Punya ide, peluang, atau project yang ingin didiskusikan? Saya akan senang mendengarnya."
				/>
				<section className="mt-10 flex flex-wrap justify-center gap-3" aria-label="Info kontak">
					{contactInfoResult.data.map((contactInfo) => (
						<ContactLink key={contactInfo.id} {...contactInfo} />
					))}
				</section>
			</Section>

			<Section>
				<div className="mx-auto max-w-2xl">
					<ContactForm />
				</div>
			</Section>
		</>
	);
}
