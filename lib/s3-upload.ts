import { graphql } from './api';
import { awsConfig } from './aws-config';

// GraphQL mutation for generating a presigned URL
const generateUploadUrlMutation = `
  mutation GenerateUploadUrl($shopId: ID!, $fileName: String!, $contentType: String!) {
    generateUploadUrl(shopId: $shopId, fileName: $fileName, contentType: $contentType) {
      uploadUrl
      key
    }
  }
`;

// Interface for the response from the generateUploadUrl mutation
interface GenerateUploadUrlResponse {
  generateUploadUrl: {
    uploadUrl: string;
    key: string;
  };
}

// Interface for the upload result
export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Uploads a file to S3 using a presigned URL
 * 
 * @param file The file to upload
 * @param shopId The ID of the shop the file belongs to
 * @returns The key and URL of the uploaded file
 */
export async function uploadImageToS3(file: File, shopId: string): Promise<UploadResult> {
  try {
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    
    // Get a presigned URL from the API
    const response = await graphql.mutate<GenerateUploadUrlResponse>(
      generateUploadUrlMutation,
      {
        shopId,
        fileName,
        contentType: file.type,
      }
    );
    
    // If we're in development mode and the API isn't configured, return mock data
    if (!response.generateUploadUrl) {
      console.warn('S3 upload not configured, using mock data');
      return {
        key: `shops/${shopId}/${fileName}`,
        url: URL.createObjectURL(file), // Create a local object URL for development
      };
    }
    
    const { uploadUrl, key } = response.generateUploadUrl;
    
    // Upload the file to S3 using the presigned URL
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    // Construct the public URL for the uploaded file
    const publicUrl = `https://${awsConfig.imagesBucketDomainName}/${key}`;
    
    return {
      key,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw error;
  }
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
  if (key.startsWith('http')) {
    return key;
  }
  
  // If we're in development mode and the bucket domain isn't configured, return a placeholder
  if (!awsConfig.imagesBucketDomainName) {
    return '/placeholder-image.jpg';
  }
  
  return `https://${awsConfig.imagesBucketDomainName}/${key}`;
}
