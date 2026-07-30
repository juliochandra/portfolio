import { getContactInfo } from "@/features/contact/contact.action";
import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const contactInfoResult = await getContactInfo();

	return (
		<div id="top" className="min-h-screen">
			<Navbar />
			<main>{children}</main>
			{/* <div className="min-h-[200vh]"></div> */}
			<Footer contactInfo={contactInfoResult.data} />
		</div>
	);
}
