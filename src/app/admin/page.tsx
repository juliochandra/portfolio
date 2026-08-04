import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview";
import { getDashboardSummary } from "@/features/dashboard/dashboard.action";

export default async function AdminPage() {
	const result = await getDashboardSummary();
	if ("error" in result) {
		return null;
	}

	return <DashboardOverview summary={result.data} />;
}
