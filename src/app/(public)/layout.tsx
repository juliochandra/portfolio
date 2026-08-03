import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getContactInfo } from "@/features/contact/contact.action";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const contactInfoResult = await getContactInfo();
	const contactInfo = "data" in contactInfoResult ? contactInfoResult.data : [];

	return (
		<div id="top" className="min-h-screen">
			<Navbar />
			<main>{children}</main>
			{/* <div className="min-h-[200vh]"></div> */}
			<Footer contactInfo={contactInfo} />
		</div>
	);
}
