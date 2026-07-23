import { MediaManager } from "@/app/admin/media/_components/MediaManager";
import { getMediaGallery } from "@/features/media/media.action";

export default async function MediaPage() {
	const mediaResult = await getMediaGallery();
	if ("error" in mediaResult) {
		return null;
	}

	return <MediaManager media={mediaResult.data} />;
}
