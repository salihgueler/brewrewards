import { SubdomainProvider } from '@/lib/subdomain-context';

export default function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  return (
    <SubdomainProvider subdomain={params.subdomain}>
      <div className="min-h-screen bg-background">
        {/* Shop-specific layout elements can go here */}
        {children}
      </div>
    </SubdomainProvider>
  );
}
