import AnimatedTitle from "@/components/common/AnimatedTitle";
import { handleTranslation } from "@/app/i18n/index";
import { Metadata } from "next";
// export const metadata: Metadata = {
//   title: "Home",
//   description: "A Website",
// };

type Params = Promise<{ lng: string }>;
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await handleTranslation(lng, "homepage");

  const image = {
    url: "/images/profile-image.jpg",
    alt: "My Website",
    width: 800,
    height: 600,
    type: "image/jpeg",
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || ""),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { lng } = await params;
  const { t } = await handleTranslation(lng, "homepage");

  return (
    <div className="h-screen flex justify-center items-center m-auto p-5 md:p-0 dark:text-white">
      Hello World!
    </div>
  );
}
