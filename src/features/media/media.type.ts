export type CreateMediaFolderInput = {
	name: string;
};

export type MediaGalleryPageInput = {
	folderId: string | null;
	page: number;
};

export type MediaUploadInput = {
	file: File;
	folderId: string | null;
};

export type MediaGalleryItem = {
	createdAt: string;
	fileName: string;
	folderId: string | null;
	id: string;
	mimeType: string;
	size: number;
	url: string;
};

export type MediaFolder = {
	id: string;
	mediaCount: number;
	name: string;
};

export type MediaGalleryPage = {
	currentPage: number;
	media: MediaGalleryItem[];
	totalPages: number;
};

export type MediaGalleryPageResponse = {
	data: MediaGalleryPage;
};

export type MediaFoldersResponse = {
	data: MediaFolder[];
};

export type CreateMediaFolderResponse = {
	data: {
		id: string;
		name: string;
	};
};

export type MediaUploadResponse = {
	data: {
		id: string;
		url: string;
	};
};

export type MediaMutationResponse = {
	data: {
		id: string;
	};
};
