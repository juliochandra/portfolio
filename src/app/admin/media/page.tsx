import { MediaManager } from "@/app/admin/media/_components/MediaManager";
import { getMediaFolders, getMediaGallery } from "@/features/media/media.action";

export default async function MediaPage() {
	const [mediaResult, foldersResult] = await Promise.all([getMediaGallery(), getMediaFolders()]);
	if ("error" in mediaResult || "error" in foldersResult) {
		return null;
	}

	return <MediaManager media={mediaResult.data} folders={foldersResult.data} />;
}
