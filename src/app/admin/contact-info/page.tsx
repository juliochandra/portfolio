import { ContactInfoManager } from "@/components/admin/contact/ContactInfoManager";
import { getContactInfoAdmin } from "@/features/contact/contact.action";
import { getMediaFolders, getMediaGalleryPage } from "@/features/media/media.action";

export default async function ContactInfoPage() {
	const [contactInfoResult, foldersResult, mediaResult] = await Promise.all([
		getContactInfoAdmin(),
		getMediaFolders(),
		getMediaGalleryPage({ folderId: null, page: 1 }),
	]);
	if ("error" in contactInfoResult || "error" in foldersResult || "error" in mediaResult) {
		return null;
	}

	return (
		<ContactInfoManager
			folders={foldersResult.data}
			initialContacts={contactInfoResult.data}
			media={mediaResult.data.media}
			mediaCurrentPage={mediaResult.data.currentPage}
			mediaTotalPages={mediaResult.data.totalPages}
		/>
	);
}
