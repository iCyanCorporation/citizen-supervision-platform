// Import the Providers
import { Providers } from "../providers";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Providers>{children}</Providers>
      <ScrollToTop />
    </main>
  );
}
