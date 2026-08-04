import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ContactLink } from "@/components/ui/ContactLink";
import { getContactInfo } from "@/features/contact/contact.action";

export const metadata: Metadata = {
	title: "Contact",
	description: "Hubungi Julio Chandra untuk berdiskusi tentang project Anda.",
};

export default async function ContactPage() {
	const contactInfoResult = await getContactInfo();
	const contactInfo = "data" in contactInfoResult ? contactInfoResult.data : [];

	return (
		<>
			<Section>
				<SectionHeader
					badge="Contact"
					title="Mari Bekerja Sama"
					description="Punya ide, peluang, atau project yang ingin didiskusikan? Saya akan senang mendengarnya."
				/>
				<section className="mt-10 flex flex-wrap justify-center gap-3" aria-label="Info kontak">
					{contactInfo.map((contactInfo) => (
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
