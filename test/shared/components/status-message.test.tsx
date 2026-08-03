/** biome-ignore-all lint/nursery/noSecrets: Component names and test messages are not secrets. */
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusMessage } from "@/components/ui/StatusMessage";

const toastMocks = vi.hoisted(() => ({
	error: vi.fn(),
	info: vi.fn(),
	success: vi.fn(),
}));

vi.mock("react-toastify", () => ({ toast: toastMocks }));

describe("StatusMessage", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("shows an error toast", async () => {
		render(<StatusMessage message="Terjadi kesalahan." type="error" />);

		await waitFor(() => expect(toastMocks.error).toHaveBeenCalledOnce());
		expect(toastMocks.error).toHaveBeenCalledWith("Terjadi kesalahan.", { toastId: expect.any(String) });
	});

	it("shows a success toast", async () => {
		render(<StatusMessage message="Data tersimpan." type="success" />);

		await waitFor(() => expect(toastMocks.success).toHaveBeenCalledOnce());
		expect(toastMocks.success).toHaveBeenCalledWith("Data tersimpan.", { toastId: expect.any(String) });
	});
});
