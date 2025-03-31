import { Storage } from 'aws-amplify';
import { generateUploadUrl } from './graphql-client';
import { awsConfig } from './aws-config';

/**
 * Upload a file to S3 using a presigned URL
 * @param file The file to upload
 * @param shopId The shop ID
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(file: File, shopId: string): Promise<string> {
  try {
    // Generate a unique file name
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Get a presigned URL from AppSync
    const { uploadUrl, key } = await generateUploadUrl(shopId, uniqueFileName, file.type);
    
    // Upload the file using the presigned URL
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
    
    // Return the public URL of the file
    return `https://${awsConfig.s3BucketDomainName}/${key}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

/**
 * Upload a file to S3 using Amplify Storage
 * This is an alternative method that uses Amplify Storage directly
 * @param file The file to upload
 * @param shopId The shop ID
 * @returns The key of the uploaded file
 */
export async function uploadFileWithAmplify(file: File, shopId: string): Promise<string> {
  try {
    // Generate a unique file name
    const fileExtension = file.name.split('.').pop();
    const key = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Upload the file using Amplify Storage
    const result = await Storage.put(key, file, {
      contentType: file.type,
      level: 'public',
    });
    
    // Return the key of the uploaded file
    return result.key;
  } catch (error) {
    console.error('Error uploading file with Amplify Storage:', error);
    throw error;
  }
}

/**
 * Get the public URL of a file in S3
 * @param key The key of the file
 * @returns The public URL of the file
 */
export function getPublicUrl(key: string): string {
  return `https://${awsConfig.s3BucketDomainName}/${key}`;
}
