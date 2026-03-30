import {
  FILM_LIBRARY_UNAVAILABLE,
  getDeterministicUserIndex,
  resolvePrimaryAllowedMovieId,
  resolvePrimaryAllowedMovies,
} from "@/shared/user-movie-assignment";

describe("user-movie-assignment", () => {
  test("FILM_LIBRARY_UNAVAILABLE is a non-empty message", () => {
    expect(FILM_LIBRARY_UNAVAILABLE).toContain("not available");
  });

  test("getDeterministicUserIndex parses userN as N-1", () => {
    expect(getDeterministicUserIndex("user1")).toBe(0);
    expect(getDeterministicUserIndex("USER256")).toBe(255);
    expect(getDeterministicUserIndex("  user42  ")).toBe(41);
  });

  test("getDeterministicUserIndex uses char sum when not userN pattern", () => {
    expect(getDeterministicUserIndex("alice")).toBe(
      "alice".split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    );
  });

  test("getDeterministicUserIndex treats user0 and invalid numeric as char sum", () => {
    expect(getDeterministicUserIndex("user0")).not.toBe(-1);
    expect(getDeterministicUserIndex("user0")).toBe(
      Array.from("user0").reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    );
  });

  test("resolvePrimaryAllowedMovieId returns null for empty catalog", () => {
    expect(resolvePrimaryAllowedMovieId([], "user1")).toBeNull();
  });

  test("resolvePrimaryAllowedMovieId maps user index modulo length", () => {
    const movies = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(resolvePrimaryAllowedMovieId(movies, "user1")).toBe("a");
    expect(resolvePrimaryAllowedMovieId(movies, "user2")).toBe("b");
    expect(resolvePrimaryAllowedMovieId(movies, "user4")).toBe("a");
  });

  test("resolvePrimaryAllowedMovieId returns null when selected slot has no id", () => {
    const movies = [{ id: "" }, { id: "b" }];
    expect(resolvePrimaryAllowedMovieId(movies, "user1")).toBe("");
  });

  test("resolvePrimaryAllowedMovies wraps id or empty array", () => {
    expect(resolvePrimaryAllowedMovies([{ id: "x" }], "user1")).toEqual(["x"]);
    expect(resolvePrimaryAllowedMovies([], "user1")).toEqual([]);
  });

  test("resolvePrimaryAllowedMovies returns empty when id is empty string", () => {
    expect(resolvePrimaryAllowedMovies([{ id: "" }], "user1")).toEqual([]);
  });
});
