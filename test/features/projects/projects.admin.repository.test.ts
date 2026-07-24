import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	count: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		project: {
			create: mocks.create,
			count: mocks.count,
			delete: mocks.delete,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

import {
	countProjectsAdmin,
	createProjectRecord,
	findProjectDetailForAdmin,
	findProjectsAdmin,
	isProjectSlugAvailable,
	updateProjectRecord,
} from "@/features/projects/projects.repository";

const input = {
	content: "Isi project",
	demoUrl: null,
	description: "Deskripsi project",
	publishedAt: null,
	repositoryUrl: null,
	skillIds: ["skill-1"],
	slug: "project-baru",
	status: PublishStatus.DRAFT,
	tagIds: ["tag-1"],
	thumbnailImage: null,
	title: "Project Baru",
};

describe("project admin repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.count.mockResolvedValue(0);
		mocks.create.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.update.mockResolvedValue({ id: "project-1", slug: "project-baru" });
	});

	it("lists all statuses ordered by newest creation", async () => {
		await findProjectsAdmin();

		expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
	});

	it("counts projects for pagination", async () => {
		await countProjectsAdmin();

		expect(mocks.count).toHaveBeenCalledWith();
	});

	it("applies pagination to the admin project list", async () => {
		await findProjectsAdmin({ skip: 10, take: 10 });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ orderBy: { createdAt: "desc" }, skip: 10, take: 10 }),
		);
	});

	it("selects all fields and relations required by the edit form", async () => {
		mocks.findUnique.mockResolvedValue(null);
		await findProjectDetailForAdmin("project-1");

		expect(mocks.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				select: expect.objectContaining({ skills: { select: { id: true } }, tags: { select: { id: true } } }),
				where: { id: "project-1" },
			}),
		);
	});

	it("creates a project with connected tags and skills", async () => {
		await createProjectRecord(input);

		expect(mocks.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					skills: { connect: [{ id: "skill-1" }] },
					tags: { connect: [{ id: "tag-1" }] },
				}),
				select: { id: true, slug: true },
			}),
		);
	});

	it("replaces tags and skills during an update", async () => {
		await updateProjectRecord("project-1", input);

		expect(mocks.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					skills: { set: [{ id: "skill-1" }] },
					tags: { set: [{ id: "tag-1" }] },
				}),
				where: { id: "project-1" },
			}),
		);
	});

	it("checks slug availability", async () => {
		mocks.findUnique.mockResolvedValue({ id: "project-2" });
		await expect(isProjectSlugAvailable("project-baru")).resolves.toBe(false);
		await expect(isProjectSlugAvailable("project-baru", "project-2")).resolves.toBe(true);
	});
});
