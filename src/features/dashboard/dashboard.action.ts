"use server";

import { getDashboardSummary as getSummary } from "@/features/dashboard/dashboard.services";
import type { DashboardSummaryResponse } from "@/features/dashboard/dashboard.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getDashboardSummary(): Promise<DashboardSummaryResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getSummary() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
