"use server";
import { getDashboardSummary as getSummary } from "@/features/dashboard/dashboard.services";
import { getServerSession } from "@/shared/auth/server-session";

const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;
export async function getDashboardSummary(): Promise<
	{ data: Awaited<ReturnType<typeof getSummary>> } | { error: { message: "UNAUTHORIZED" } }
> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	return { data: await getSummary() };
}
