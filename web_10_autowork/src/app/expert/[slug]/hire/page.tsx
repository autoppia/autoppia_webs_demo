import HireFormWrapperClient from "./HireFormWrapperClient";

export const dynamicParams = true;

export default async function HireExpertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HireFormWrapperClient slug={slug} />;
}
