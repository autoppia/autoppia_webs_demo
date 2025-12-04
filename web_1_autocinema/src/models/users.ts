import type { UserRecord } from "@/models";

const TOTAL_USERS = 256;
const MOVIE_POOL_SIZE = 120;

const padMovieId = (value: number): string => value.toString().padStart(3, "0");

export const USERS: UserRecord[] = Array.from({ length: TOTAL_USERS }, (_, index) => {
  const movieIndex = (index % MOVIE_POOL_SIZE) + 1;
  return {
    username: `user${index + 1}`,
    password: "PASSWORD",
    allowedMovies: [`movie-v2-${padMovieId(movieIndex)}`],
  };
});

export function findUser(username: string): UserRecord | undefined {
  return USERS.find((user) => user.username.toLowerCase() === username.toLowerCase());
}
