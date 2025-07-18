import { expertsInWork } from "@/library/dataset";


export function getExpert(slug: string) {
  return expertsInWork.find((e) => e.slug === slug);
}
