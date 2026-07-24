import { MediaManager } from "@/app/admin/media/_components/MediaManager";
import { getMediaFolders, getMediaGalleryPage } from "@/features/media/media.action";

export default async function MediaPage() {
	const [mediaResult, foldersResult] = await Promise.all([
		getMediaGalleryPage({ folderId: null, page: 1 }),
		getMediaFolders(),
	]);
	if ("error" in mediaResult || "error" in foldersResult) {
		return null;
	}

	return <MediaManager folders={foldersResult.data} gallery={mediaResult.data} />;
}
