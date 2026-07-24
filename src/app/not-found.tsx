import Link from "next/link";
import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";

export default function NotFoundPage() {
	return (
		<div>
			<Navbar />
			<main className="grid min-h-screen place-items-center px-6 py-16 text-center">
				<div className="max-w-xl">
					<p className="font-bold text-7xl text-accent tracking-[-0.08em] sm:text-8xl">404</p>
					<h1 className="mt-6 font-bold text-3xl tracking-tight sm:text-4xl">Halaman tidak ditemukan</h1>
					<p className="mt-4 text-text-mute leading-7">
						Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau alamatnya tidak tepat.
					</p>
					<Link
						href="/"
						className="mt-8 inline-flex rounded-lg bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-accent/90"
					>
						Kembali ke Beranda
					</Link>
				</div>
			</main>
			<Footer />
		</div>
	);
}
