// Unit tests for dataset label definitions (systemLabels/userLabels).
import { systemLabels, userLabels } from "../../../src/library/dataset";

describe("dataset label definitions", () => {
  it("includes expected system labels with correct ids", () => {
    const ids = systemLabels.map((l) => l.id);
    expect(ids).toEqual([
      "inbox",
      "starred",
      "snoozed",
      "sent",
      "drafts",
      "archive",
      "spam",
      "trash",
      "important",
    ]);
  });

  it("includes expected user labels with correct ids", () => {
    const ids = userLabels.map((l) => l.id);
    expect(ids).toEqual(["work", "personal"]);
  });
});
