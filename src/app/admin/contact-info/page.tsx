import { ContactInfoManager } from "@/app/admin/contact-info/_components/ContactInfoManager";
import { getContactInfoAdmin } from "@/features/contact/contact.action";

export default async function ContactInfoPage() {
	const contactInfoResult = await getContactInfoAdmin();
	if ("error" in contactInfoResult) {
		return null;
	}

	return <ContactInfoManager initialContacts={contactInfoResult.data} />;
}
