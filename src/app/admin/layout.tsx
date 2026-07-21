import { AdminNav } from "@/shared/components/AdminNav";
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen lg:flex">
			<AdminNav />
			<main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
		</div>
	);
}
