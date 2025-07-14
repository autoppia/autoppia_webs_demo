import { expertsInWork } from "@/library/data";


export function getExpert(slug: string) {
  return expertsInWork.find((e) => e.slug === slug);
}
