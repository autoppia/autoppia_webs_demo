// Unit tests for universal-loader (loadData/useProjectData).
import { renderHook, waitFor } from "@testing-library/react";
import { loadData, useProjectData } from "../../../src/shared/universal-loader";

jest.mock("../../../src/shared/seeded-loader", () => ({
  fetchSeededSelection: jest
    .fn()
    .mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
}));

describe("loadData", () => {
  it("returns empty array when seedValue is undefined", async () => {
    const result = await loadData<{ id: number }>({
      projectKey: "proj",
      entityType: "entity",
      seedValue: undefined,
    });
    expect(result).toEqual([]);
  });

  it("delegates to fetchSeededSelection with normalized seed", async () => {
    const result = await loadData<{ id: number }>({
      projectKey: "proj",
      entityType: "entity",
      seedValue: 10,
    });
    expect(result.length).toBe(3);
  });
});

describe("useProjectData", () => {
  it("loads data and updates state", async () => {
    const { result } = renderHook(() =>
      useProjectData<{ id: number }>({
        projectKey: "proj",
        entityType: "entity",
        seedValue: 1,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data.length).toBe(3);
    expect(result.current.error).toBeNull();
  });
});
