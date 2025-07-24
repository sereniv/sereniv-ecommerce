import { NextRequest, NextResponse } from 'next/server'
import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: 'bucket.droomdroom.online',
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'Gxf9Y8c5pJy3RY6vyS9n',
  secretKey: process.env.MINIO_SECRET_KEY || '8piyA69z7HVSgvGfp1wXIByIbcll7jOYKCQ6djB3',
});

const BUCKET_NAME = 'bitcointreasurybucket';

// Add CORS headers helper function
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://droomdroom.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const file = data.get('file') as File
    
    if (!file) {
      const response = NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const contentType = file.type;


    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket '${BUCKET_NAME}' created.`);
    }

    await minioClient.putObject(
      BUCKET_NAME,
      filename,
      buffer,
      buffer.length,
      { 'Content-Type': contentType }
    );

    const expiryInSeconds = 7 * 24 * 60 * 60;
    const presignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, filename, expiryInSeconds);

    const directUrl = `https://${BUCKET_NAME}.bucket.droomdroom.online/${filename}`;

    const response = NextResponse.json({
      success: true,
      url: presignedUrl,
      direct_url: directUrl,
      public_id: filename,
    });
    return addCorsHeaders(response);
  } catch (error: any) {
    console.error('Error uploading file:', error)
    const response = NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}