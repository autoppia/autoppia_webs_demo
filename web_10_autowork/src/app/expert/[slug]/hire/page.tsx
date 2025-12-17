import HireFormWrapperClient from "./HireFormWrapperClient";

export const dynamicParams = true;

export default function HireExpertPage({ params }: { params: { slug: string } }) {
  return <HireFormWrapperClient slug={params.slug} />;
}
