import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div id="top" className="min-h-screen">
			<Navbar />
			<main>{children}</main>
			<div className="min-h-[200vh]"></div>
			<Footer />
		</div>
	);
}
