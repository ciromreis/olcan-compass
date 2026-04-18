import { redirect } from "next/navigation";

export default function LegacyMarketplaceProductPage({
  params,
}: {
  params: { handle: string };
}) {
  redirect(`/marketplace/products/${params.handle}`);
}
