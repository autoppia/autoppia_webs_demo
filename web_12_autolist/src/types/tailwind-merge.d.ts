declare module 'tailwind-merge' {
  // Minimal type definitions used across the project. Adjust if you rely on
  // additional exports from the package.
  export function twMerge(...classNames: Array<string | false | null | undefined>): string;
}
