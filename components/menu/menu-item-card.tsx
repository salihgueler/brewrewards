'use client';

import { useState } from 'react';
import { Heart, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/s3-upload';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    imageKey?: string;
    isAvailable: boolean;
    allergens?: string[];
  };
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function MenuItemCard({
  item,
  isAdmin = false,
  onEdit,
  onDelete,
  onFavorite,
  isFavorite = false,
}: MenuItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  
  const imageUrl = item.imageKey 
    ? getImageUrl(item.imageKey)
    : item.image || '/placeholder-coffee.jpg';
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleFavorite = () => {
    if (!onFavorite) return;
    
    setIsFavorited(!isFavorited);
    onFavorite(item.id);
  };
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      !item.isAvailable && "opacity-60"
    )}>
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive" className="text-sm font-medium">
              Currently Unavailable
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <span className="font-medium">${item.price.toFixed(2)}</span>
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
          
          {item.allergens && item.allergens.length > 0 && item.allergens.map((allergen) => (
            <Badge key={allergen} variant="secondary" className="text-xs">
              {allergen}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        {isAdmin ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(item.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {onFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                className={cn(
                  isFavorited && "text-red-500"
                )}
              >
                <Heart className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
