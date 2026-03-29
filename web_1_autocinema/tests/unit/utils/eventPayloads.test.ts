// Unit tests for event payload utilities used by logEvent.
import {
  collectFilmChangeMetadata,
  editorDataToFilmPayload,
  movieToFilmPayload,
  resolveMovieNumericId,
} from "@/utils/eventPayloads";

describe("eventPayloads", () => {
  test("resolveMovieNumericId gets last numeric chunk", () => {
    expect(resolveMovieNumericId("movie-12-edition-98")).toBe(98);
    expect(resolveMovieNumericId("id-001")).toBe(1);
  });

  test("resolveMovieNumericId falls back to deterministic hash", () => {
    const a = resolveMovieNumericId("abc-no-number");
    const b = resolveMovieNumericId("abc-no-number");
    const c = resolveMovieNumericId("different");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  test("movieToFilmPayload normalizes number, genres and cast", () => {
    const movie = {
      id: "movie-7",
      title: "Arrival",
      director: "",
      year: "2016",
      genres: "Sci-Fi, Drama, sci-fi",
      rating: "8.5",
      duration: "116",
      cast: ["Amy Adams", " ", "Jeremy Renner"],
    };

    const payload = movieToFilmPayload(movie as never);
    expect(payload.id).toBe(7);
    expect(payload.name).toBe("Arrival");
    expect(payload.director).toBeNull();
    expect(payload.year).toBe(2016);
    expect(payload.rating).toBe(8.5);
    expect(payload.duration).toBe(116);
    expect(payload.genres).toEqual([{ name: "Sci-Fi" }, { name: "Drama" }]);
    expect(payload.cast).toBe("Amy Adams, , Jeremy Renner");
  });

  test("editorDataToFilmPayload applies defaults and trimming", () => {
    const data = {
      title: " ",
      director: " Denis Villeneuve ",
      year: "",
      genres: " Sci-Fi,  sci-fi ",
      rating: "NaN",
      duration: "150",
      cast: "  ",
    };

    const payload = editorDataToFilmPayload(999, data as never);
    expect(payload.id).toBe(999);
    expect(payload.name).toBe("Untitled Film");
    expect(payload.director).toBe("Denis Villeneuve");
    expect(payload.year).toBeNull();
    expect(payload.rating).toBeNull();
    expect(payload.duration).toBe(150);
    expect(payload.genres).toEqual([{ name: "Sci-Fi" }]);
    expect(payload.cast).toBeNull();
  });

  test("collectFilmChangeMetadata tracks changed fields", () => {
    const original = {
      id: 1,
      name: "A",
      director: "Dir 1",
      year: 2000,
      genres: [{ name: "Drama" }, { name: "Action" }],
      rating: 6,
      duration: 100,
      cast: "Actor 1",
    };
    const updated = {
      ...original,
      name: "B",
      genres: [{ name: "action" }, { name: "drama" }],
      rating: 7,
      cast: "Actor 2",
    };

    const metadata = collectFilmChangeMetadata(original, updated);
    expect(metadata.changed_fields).toEqual(["name", "rating", "cast"]);
    expect(metadata.previous_values.name).toBe("A");
    expect(metadata.previous_values.rating).toBe(6);
  });
});
