import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactSectionId, formData, metadata } = body;

    // Validate required fields
    if (!contactSectionId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: contactSectionId, formData' },
        { status: 400 }
      );
    }

    // Check if contact section exists and is active
    const contactSection = await prisma.contactSection.findUnique({
      where: { id: contactSectionId },
      include: {
        fields: {
          where: { isRequired: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!contactSection) {
      return NextResponse.json({ error: 'Contact section not found' }, { status: 404 });
    }

    if (!contactSection.isActive) {
      return NextResponse.json({ error: 'Contact form is currently disabled' }, { status: 400 });
    }

    // Validate required fields
    const missingFields: string[] = [];
    contactSection.fields.forEach(field => {
      if (field.isRequired && (!formData[field.fieldName] || formData[field.fieldName].toString().trim() === '')) {
        missingFields.push(field.label);
      }
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the submission
    const submission = await prisma.contactSubmission.create({
      data: {
        contactSectionId,
        formData,
        metadata: metadata || {},
        status: 'new',
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      },
    });

    // TODO: Send email notification if email settings are configured
    // This would involve:
    // 1. Fetch email settings for this contact section
    // 2. Send notification email to admin
    // 3. Send auto-responder email to user (if configured)

    return NextResponse.json(
      { 
        message: 'Form submitted successfully',
        submissionId: submission.id
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
} 