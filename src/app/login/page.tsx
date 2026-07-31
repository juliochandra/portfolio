import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/_components/LoginForm";
import { getServerSession } from "@/shared/auth/server-session";

export default async function LoginPage() {
	if (await getServerSession()) {
		redirect("/admin");
	}

	return (
		<main className="grid min-h-screen place-items-center px-6 py-16">
			<div className="w-full max-w-xl">
				<header className="text-center">
					<p className="font-bold text-4xl tracking-[-0.08em]">
						JULIO<span className="text-accent">.</span>
					</p>
					<p className="mt-3 text-text-mute">Personal Dashboard</p>
				</header>
				<div className="mt-16">
					<LoginForm />
				</div>
				<p className="mt-12 text-center text-sm text-text-mute">© {new Date().getFullYear()} JULIO. All rights reserved.</p>
			</div>
		</main>
	);
}
