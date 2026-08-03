import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layout/AdminNav";
import { getServerSession } from "@/lib/auth/server-session";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const session = await getServerSession();
	if (!session) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen lg:flex">
			<AdminNav />
			<main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
		</div>
	);
}
