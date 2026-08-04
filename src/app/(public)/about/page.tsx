/** biome-ignore-all lint/nursery/noSecrets: Naskah statis About bukan data sensitif. */
import type { Metadata } from "next";
import {
	FaBolt,
	FaBookOpen,
	FaCheck,
	FaCode,
	FaHeart,
	FaLayerGroup,
	FaLightbulb,
	FaQuoteLeft,
	FaRocket,
	FaUsers,
} from "react-icons/fa";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Callout } from "@/components/public/about/Callout";
import { InfoCard } from "@/components/public/about/InfoCard";
import { ProcessStep } from "@/components/public/about/ProcessStep";

export const metadata: Metadata = {
	title: "About",
	description: "Tentang Julio Chandra, pengembang web full-stack.",
};

const engineeringPrinciples = [
	{
		description: "Memulai dari kebutuhan pengguna dan tujuan produk sebelum memilih solusi teknis.",
		icon: FaLightbulb,
		title: "Berpikir dari Masalah",
	},
	{
		description: "Menulis kode yang sederhana, jelas, dan mudah dipahami oleh anggota tim berikutnya.",
		icon: FaCode,
		title: "Kode yang Jelas",
	},
	{
		description: "Mempertimbangkan kecepatan, aksesibilitas, dan pengalaman pengguna sejak awal proses.",
		icon: FaBolt,
		title: "Performa Sejak Awal",
	},
	{
		description: "Menguji alur penting agar perubahan dapat dirilis dengan lebih percaya diri.",
		icon: FaCheck,
		title: "Kualitas Teruji",
	},
	{
		description: "Menerima umpan balik sebagai bahan untuk menyempurnakan produk secara berkelanjutan.",
		icon: FaUsers,
		title: "Kolaborasi Terbuka",
	},
	{
		description: "Mendokumentasikan keputusan penting agar konteks teknis tetap mudah ditelusuri.",
		icon: FaBookOpen,
		title: "Dokumentasi Seperlunya",
	},
];

const workflowSteps = [
	{ description: "Memahami konteks, pengguna, dan hasil yang ingin dicapai.", icon: FaLightbulb, title: "Memahami" },
	{ description: "Menyusun ruang lingkup, prioritas, dan pendekatan teknis.", icon: FaLayerGroup, title: "Merencanakan" },
	{ description: "Membangun solusi bertahap dengan fondasi yang dapat dikembangkan.", icon: FaCode, title: "Membangun" },
	{
		description: "Memeriksa alur penting lalu memperbaiki detail yang masih menghambat.",
		icon: FaCheck,
		title: "Menguji & Menyempurnakan",
	},
	{ description: "Merilis dengan pemantauan agar produk tetap andal setelah digunakan.", icon: FaRocket, title: "Menerapkan" },
];

const currentFocus = [
	{
		description: "Membangun produk digital yang memberi manfaat nyata bagi penggunanya.",
		icon: FaLightbulb,
		title: "Produk Bermanfaat",
	},
	{
		description: "Merancang sistem yang dapat diandalkan, mudah dirawat, dan siap berkembang.",
		icon: FaLayerGroup,
		title: "Sistem Andal",
	},
	{
		description: "Menyederhanakan alur agar interaksi pengguna terasa jelas dan nyaman.",
		icon: FaUsers,
		title: "Pengalaman Pengguna",
	},
	{
		description: "Terus memperbarui pemahaman melalui praktik, evaluasi, dan eksplorasi teknologi.",
		icon: FaBookOpen,
		title: "Belajar Berkelanjutan",
	},
];

const beyondCode = [
	{
		description: "Menjaga rasa ingin tahu untuk memahami sudut pandang dan persoalan baru.",
		icon: FaLightbulb,
		title: "Rasa Ingin Tahu",
	},
	{ description: "Menikmati proses berbagi pengetahuan dan belajar bersama komunitas.", icon: FaUsers, title: "Berbagi" },
	{ description: "Menghargai kerja sama yang terbuka, jujur, dan saling mendukung.", icon: FaHeart, title: "Kolaborasi" },
	{
		description: "Meluangkan waktu untuk membaca, mencatat, dan memperluas cara berpikir.",
		icon: FaBookOpen,
		title: "Membaca",
	},
	{
		description: "Menjaga keseimbangan agar dapat bekerja dengan fokus dan berkelanjutan.",
		icon: FaBolt,
		title: "Keseimbangan",
	},
];

export default function AboutPage() {
	return (
		<>
			<Section>
				<div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
					<div>
						<SectionHeader
							align="left"
							badge="About"
							name="JULIO."
							title="Pengembang Web Full-stack"
							description="Saya membantu mengubah kebutuhan produk menjadi aplikasi web yang mudah digunakan dan siap berkembang."
						/>
						<div className="mt-8 max-w-2xl space-y-4 text-text-mute leading-8">
							<p>Saya percaya teknologi seharusnya mempermudah pekerjaan manusia, bukan menambah kerumitan baru.</p>
							<p>
								Saat membangun produk, saya memadukan pemahaman kebutuhan pengguna dengan fondasi teknis yang sederhana
								dan dapat dirawat.
							</p>
							<p>
								Tujuan saya adalah menghasilkan pengalaman yang terasa jelas bagi pengguna dan nyaman dikembangkan oleh
								tim.
							</p>
						</div>
					</div>
					<div className="mx-auto aspect-square w-full max-w-sm rounded-2xl border border-border bg-surface p-2">
						{/* biome-ignore lint/performance/noImgElement: Gambar profil memakai URL eksternal statis. */}
						<img
							src="https://picsum.photos/800/800"
							alt="Foto profil Julio Chandra"
							className="aspect-square w-full rounded-xl object-cover"
						/>
					</div>
				</div>
				<div className="mt-14 grid gap-8 md:grid-cols-3">
					<InfoCard
						icon={FaCode}
						title="Developer First"
						description="Memilih solusi yang memudahkan proses pengembangan dan perawatan."
					/>
					<InfoCard
						icon={FaBolt}
						title="Berorientasi Performa"
						description="Menjaga pengalaman tetap cepat sejak detail teknis paling awal."
					/>
					<InfoCard
						icon={FaUsers}
						title="Berpusat pada Pengguna"
						description="Menempatkan kebutuhan pengguna sebagai dasar setiap keputusan produk."
					/>
				</div>
			</Section>

			<Section>
				<SectionHeader
					align="left"
					badge="Engineering Principles"
					title="Prinsip yang Membimbing Cara Saya Membangun"
					description="Pendekatan teknis yang membantu saya menjaga kualitas produk dari keputusan kecil hingga rilis."
				/>
				<div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{engineeringPrinciples.map((principle) => (
						<InfoCard key={principle.title} {...principle} />
					))}
				</div>
			</Section>

			<Section>
				<SectionHeader
					align="left"
					badge="Development Workflow"
					title="Proses yang Terarah dari Ide hingga Rilis"
					description="Setiap tahap memberi ruang untuk memahami masalah, membuat keputusan, dan memperbaiki hasil."
				/>
				<ol className="mt-12 grid gap-8 lg:grid-cols-5">
					{workflowSteps.map((step, index) => (
						<ProcessStep key={step.title} number={index + 1} showConnector={index < workflowSteps.length - 1} {...step} />
					))}
				</ol>
				<Callout
					icon={FaLightbulb}
					title="Mulai dari konteks, bukan asumsi"
					description="Pemahaman yang baik di awal membantu mengurangi pekerjaan ulang dan membuat prioritas lebih jelas."
				/>
			</Section>

			<Section>
				<SectionHeader
					align="left"
					badge="Current Focus"
					title="Hal yang Sedang Saya Dalami"
					description="Fokus saat ini adalah membangun produk yang tetap sederhana bagi pengguna dan kuat di balik layar."
				/>
				<div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
					{currentFocus.map((focus) => (
						<InfoCard key={focus.title} {...focus} />
					))}
				</div>
				<Callout
					icon={FaRocket}
					title="Bertumbuh melalui praktik"
					description="Setiap project adalah kesempatan untuk memperdalam cara berpikir, keterampilan, dan cara bekerja bersama tim."
				/>
			</Section>

			<Section>
				<SectionHeader
					align="left"
					badge="Beyond Code"
					title="Lebih dari Sekadar Baris Kode"
					description="Cara saya bekerja juga dibentuk oleh rasa ingin tahu, kebiasaan belajar, dan hubungan dengan orang lain."
				/>
				<div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
					{beyondCode.map((item) => (
						<InfoCard key={item.title} {...item} />
					))}
				</div>
				<Callout
					variant="quote"
					icon={FaQuoteLeft}
					title="Teknologi adalah sarana"
					description="Produk yang baik bukan hanya berfungsi dengan benar, tetapi juga membantu manusia menyelesaikan pekerjaan dengan lebih baik."
				/>
			</Section>
		</>
	);
}
