import HudLayout from "@/components/hud/HudLayout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HudLayout>{children}</HudLayout>;
}
