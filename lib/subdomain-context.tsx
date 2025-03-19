'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Shop {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  subdomain: string;
  ownerId: string;
  // Add other shop properties as needed
}

interface SubdomainContextType {
  shop: Shop | null;
  isLoading: boolean;
  error: Error | null;
}

const SubdomainContext = createContext<SubdomainContextType>({
  shop: null,
  isLoading: true,
  error: null,
});

export const useSubdomain = () => useContext(SubdomainContext);

interface SubdomainProviderProps {
  children: ReactNode;
  subdomain?: string;
}

export const SubdomainProvider = ({ children, subdomain }: SubdomainProviderProps) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!subdomain) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, this would be a GraphQL query to AppSync
        // For now, we'll simulate the API call
        setIsLoading(true);
        
        // TODO: Replace with actual API call to fetch shop by subdomain
        // Example: const { data } = await API.graphql(graphqlOperation(getShopBySubdomain, { subdomain }));
        
        // Mock data for development
        setTimeout(() => {
          if (subdomain === 'demo') {
            setShop({
              id: 'demo-shop-id',
              name: 'Demo Coffee Shop',
              description: 'A demo coffee shop for testing',
              logo: '/demo-logo.png',
              subdomain: 'demo',
              ownerId: 'demo-owner-id',
            });
          } else {
            // Simulate shop not found
            setError(new Error(`Shop with subdomain "${subdomain}" not found`));
          }
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch shop data'));
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [subdomain]);

  return (
    <SubdomainContext.Provider value={{ shop, isLoading, error }}>
      {children}
    </SubdomainContext.Provider>
  );
};
