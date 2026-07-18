import { AdminNav } from "@/shared/components/AdminNav";
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen">
			<AdminNav />
			<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</main>
		</div>
	);
}
