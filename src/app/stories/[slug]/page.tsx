import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StoriesDetailRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/legends/${slug}`);
}
