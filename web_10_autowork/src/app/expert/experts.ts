import { experts } from "@/library/dataset";

export function getExpert(slug: string) {
  return experts.find((e) => e.slug === slug);
}
