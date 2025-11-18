export interface UserRecord {
  username: string;
  password: string;
  allowedBooks: string[];
}

const TOTAL_USERS = 256;
const BOOK_POOL_SIZE = 256;

const buildBookId = (value: number): string => `book-${value}`;

export const USERS: UserRecord[] = Array.from({ length: TOTAL_USERS }, (_, index) => {
  const bookIndex = (index % BOOK_POOL_SIZE) + 1;
  return {
    username: `user${index + 1}`,
    password: "PASSWORD",
    allowedBooks: [buildBookId(bookIndex)],
  };
});

export function findUser(username: string): UserRecord | undefined {
  return USERS.find((user) => user.username.toLowerCase() === username.toLowerCase());
}
