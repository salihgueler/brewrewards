'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { shopAPI } from './api';

interface Shop {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  subdomain: string;
  ownerId: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours?: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }>;
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
        setIsLoading(true);
        
        // Fetch shop data from API
        const shopData = await shopAPI.getShopBySubdomain(subdomain);
        
        if (shopData) {
          setShop(shopData);
        } else {
          // If API call returns null, use mock data for development
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
            // Shop not found
            setError(new Error(`Shop with subdomain "${subdomain}" not found`));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch shop data'));
      } finally {
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
