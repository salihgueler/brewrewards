// Mock S3 upload functionality for development

// Interface for the upload result
export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Mock function to simulate uploading a file to S3
 * 
 * @param file The file to upload
 * @param shopId The ID of the shop the file belongs to
 * @returns The key and URL of the uploaded file
 */
export async function uploadImageToS3(file: File, shopId: string): Promise<UploadResult> {
  // Create a local URL for the file
  const localUrl = URL.createObjectURL(file);
  
  // Generate a mock S3 key
  const timestamp = new Date().getTime();
  const key = `${shopId}/images/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    key,
    url: localUrl,
  };
}

/**
 * Gets the public URL for an S3 object
 * 
 * @param key The S3 object key
 * @returns The public URL for the object
 */
export function getImageUrl(key: string | null | undefined): string {
  if (!key) return '';
  
  // If the key is already a full URL, return it
  if (key.startsWith('http') || key.startsWith('blob:')) {
    return key;
  }
  
  // In a real app, we would construct the S3 URL here
  // For now, return a placeholder
  return `https://placehold.co/600x400?text=${encodeURIComponent(key)}`;
}
