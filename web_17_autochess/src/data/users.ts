export interface UserRecord {
  username: string;
  password: string;
  puzzleRating: number;
}

const TOTAL_USERS = 256;

export const USERS: UserRecord[] = Array.from({ length: TOTAL_USERS }, (_, index) => ({
  username: `user${index + 1}`,
  password: "Passw0rd!",
  puzzleRating: 1500,
}));

export function findUser(username: string): UserRecord | undefined {
  return USERS.find((user) => user.username.toLowerCase() === username.toLowerCase());
}
