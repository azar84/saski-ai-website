import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  CreateMediaLibrarySchema, 
  UpdateMediaLibrarySchema, 
  MediaSearchSchema,
  MediaUrlImportSchema,
  validateAndTransform,
  type ApiResponse 
} from '@/lib/validations';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Fetch media library items with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const searchData = {
      query: searchParams.get('query') || undefined,
      fileType: searchParams.get('fileType') || undefined,
      folderId: searchParams.get('folderId') ? parseInt(searchParams.get('folderId')!) : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    // Validate search parameters
    const validatedSearch = validateAndTransform(MediaSearchSchema, searchData);

    // Build where clause
    const where: any = {};
    
    if (validatedSearch.query) {
      where.OR = [
        { filename: { contains: validatedSearch.query, mode: 'insensitive' } },
        { title: { contains: validatedSearch.query, mode: 'insensitive' } },
        { description: { contains: validatedSearch.query, mode: 'insensitive' } },
        { alt: { contains: validatedSearch.query, mode: 'insensitive' } }
      ];
    }
    
    if (validatedSearch.fileType) {
      where.fileType = validatedSearch.fileType;
    }
    
    if (validatedSearch.folderId !== undefined) {
      where.folderId = validatedSearch.folderId;
    }
    
    if (validatedSearch.isActive !== undefined) {
      where.isActive = validatedSearch.isActive;
    }
    
    if (validatedSearch.isPublic !== undefined) {
      where.isPublic = validatedSearch.isPublic;
    }

    if (validatedSearch.tags && validatedSearch.tags.length > 0) {
      // Search in JSON tags field
      where.tags = {
        contains: JSON.stringify(validatedSearch.tags[0])
      };
    }

    // Calculate pagination
    const skip = (validatedSearch.page - 1) * validatedSearch.limit;

    // Get total count
    const totalCount = await prisma.mediaLibrary.count({ where });

    // Fetch media items
    const mediaItems = await prisma.mediaLibrary.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        usages: {
          select: {
            entityType: true,
            entityId: true,
            fieldName: true
          }
        }
      },
      orderBy: {
        [validatedSearch.sortBy]: validatedSearch.sortOrder
      },
      skip,
      take: validatedSearch.limit
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / validatedSearch.limit);
    const hasNextPage = validatedSearch.page < totalPages;
    const hasPreviousPage = validatedSearch.page > 1;

    const response: ApiResponse = {
      success: true,
      data: {
        items: mediaItems,
        pagination: {
          page: validatedSearch.page,
          limit: validatedSearch.limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch media library:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch media library'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// POST - Create new media item (upload or URL import)
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      return handleFileUpload(request);
    } else {
      // Handle URL import
      return handleUrlImport(request);
    }
  } catch (error) {
    console.error('Failed to create media item:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create media item'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// Handle file upload
async function handleFileUpload(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    const response: ApiResponse = {
      success: false,
      message: 'No file provided'
    };
    return NextResponse.json(response, { status: 400 });
  }

  // Validate file
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    const response: ApiResponse = {
      success: false,
      message: 'File size exceeds 50MB limit'
    };
    return NextResponse.json(response, { status: 400 });
  }

  // Get file info
  const filename = file.name;
  const mimeType = file.type;
  const fileSize = file.size;
  
  // Determine file type
  let fileType = 'other';
  if (mimeType.startsWith('image/')) fileType = 'image';
  else if (mimeType.startsWith('video/')) fileType = 'video';
  else if (mimeType.startsWith('audio/')) fileType = 'audio';
  else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) fileType = 'document';

  // Generate unique filename
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
  
  // Create upload directory
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'media');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Save file
  const filepath = join(uploadDir, uniqueFilename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  // Generate URLs
  const publicUrl = `/uploads/media/${uniqueFilename}`;
  
  // Get optional metadata from form
  const title = formData.get('title')?.toString();
  const description = formData.get('description')?.toString();
  const alt = formData.get('alt')?.toString();
  const folderId = formData.get('folderId') ? parseInt(formData.get('folderId')!.toString()) : null;
  const tagsString = formData.get('tags')?.toString();
  const tags = tagsString ? JSON.stringify(tagsString.split(',').map(tag => tag.trim())) : null;

  // Get image/video dimensions if applicable
  let width, height, duration;
  if (fileType === 'image') {
    // For production, you'd use a library like sharp to get dimensions
    // For now, we'll leave these as null
  }

  // Create media record
  const mediaData = {
    filename,
    title: title || filename,
    description,
    alt,
    fileType,
    mimeType,
    fileSize,
    width,
    height,
    duration,
    originalUrl: publicUrl,
    localPath: filepath,
    publicUrl,
    folderId,
    tags,
    uploadSource: 'upload' as const,
    isActive: true,
    isPublic: true
  };

  const validatedData = validateAndTransform(CreateMediaLibrarySchema, mediaData);

  const mediaItem = await prisma.mediaLibrary.create({
    data: validatedData,
    include: {
      folder: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: mediaItem,
    message: 'File uploaded successfully'
  };

  return NextResponse.json(response);
}

// Handle URL import
async function handleUrlImport(request: NextRequest) {
  const body = await request.json();
  const validatedData = validateAndTransform(MediaUrlImportSchema, body);

  // Download file from URL
  const response = await fetch(validatedData.url);
  if (!response.ok) {
    const apiResponse: ApiResponse = {
      success: false,
      message: 'Failed to download file from URL'
    };
    return NextResponse.json(apiResponse, { status: 400 });
  }

  const contentType = response.headers.get('content-type') || '';
  const contentLength = parseInt(response.headers.get('content-length') || '0');

  // Validate file size
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (contentLength > maxSize) {
    const apiResponse: ApiResponse = {
      success: false,
      message: 'File size exceeds 50MB limit'
    };
    return NextResponse.json(apiResponse, { status: 400 });
  }

  // Determine file type and extension
  let fileType = 'other';
  let extension = 'bin';
  
  if (contentType.startsWith('image/')) {
    fileType = 'image';
    extension = contentType.split('/')[1];
  } else if (contentType.startsWith('video/')) {
    fileType = 'video';
    extension = contentType.split('/')[1];
  } else if (contentType.startsWith('audio/')) {
    fileType = 'audio';
    extension = contentType.split('/')[1];
  }

  // Generate unique filename
  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}-imported.${extension}`;
  
  // Create upload directory
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'media');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Save file
  const filepath = join(uploadDir, uniqueFilename);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(filepath, Buffer.from(arrayBuffer));

  // Generate URLs
  const publicUrl = `/uploads/media/${uniqueFilename}`;
  
  // Extract filename from URL
  const urlParts = validatedData.url.split('/');
  const originalFilename = urlParts[urlParts.length - 1] || uniqueFilename;

  const tags = validatedData.tags ? JSON.stringify(validatedData.tags) : null;

  // Create media record
  const mediaData = {
    filename: originalFilename,
    title: validatedData.title || originalFilename,
    description: validatedData.description,
    alt: validatedData.alt,
    fileType,
    mimeType: contentType,
    fileSize: contentLength,
    originalUrl: validatedData.url,
    localPath: filepath,
    publicUrl,
    folderId: validatedData.folderId,
    tags,
    uploadSource: 'url_import' as const,
    isActive: true,
    isPublic: true
  };

  const validatedMediaData = validateAndTransform(CreateMediaLibrarySchema, mediaData);

  const mediaItem = await prisma.mediaLibrary.create({
    data: validatedMediaData,
    include: {
      folder: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  });

  const apiResponse: ApiResponse = {
    success: true,
    data: mediaItem,
    message: 'File imported from URL successfully'
  };

  return NextResponse.json(apiResponse);
}

// PUT - Update media item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateAndTransform(UpdateMediaLibrarySchema, body);

    // Check if media item exists
    const existingItem = await prisma.mediaLibrary.findUnique({
      where: { id: validatedData.id }
    });

    if (!existingItem) {
      const response: ApiResponse = {
        success: false,
        message: 'Media item not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { id, ...updateData } = validatedData;

    const mediaItem = await prisma.mediaLibrary.update({
      where: { id },
      data: updateData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        usages: {
          select: {
            entityType: true,
            entityId: true,
            fieldName: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: mediaItem,
      message: 'Media item updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update media item:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update media item'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete media item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid media item ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if media item exists
    const existingItem = await prisma.mediaLibrary.findUnique({
      where: { id: parseInt(id) },
      include: {
        usages: true
      }
    });

    if (!existingItem) {
      const response: ApiResponse = {
        success: false,
        message: 'Media item not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if media is being used
    if (existingItem.usages.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: `Cannot delete media item. It is being used in ${existingItem.usages.length} place(s).`,
        data: { usages: existingItem.usages }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Delete the media item
    await prisma.mediaLibrary.delete({
      where: { id: parseInt(id) }
    });

    // TODO: Delete physical file from filesystem
    // For production, you might want to move files to a trash folder instead

    const response: ApiResponse = {
      success: true,
      message: 'Media item deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete media item:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete media item'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 