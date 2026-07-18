import { Section } from "@/shared/components/Section";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Home", description: "Portfolio developer profesional." };
export default function Home() {
	return (
		<Section>
			<p className="text-text-mute">Portfolio Developer</p>
			<h1 className="mt-2 font-bold text-4xl">Membangun produk web yang jelas dan berguna.</h1>
		</Section>
	);
}
