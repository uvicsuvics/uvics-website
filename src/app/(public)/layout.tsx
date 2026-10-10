import { SiteHeader } from "@/src/components/organism/Header/SiteHeader";
import { SiteFooter } from "@/src/components/organism/Footer/SiteFooter";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
