import HireFormWrapperClient from "./HireFormWrapperClient";

export const dynamicParams = true;

export default function HireExpertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // @ts-expect-error Next passes Promise for params; treated as resolved at runtime
  const { slug } = params as { slug: string };
  return <HireFormWrapperClient slug={slug} />;
}
