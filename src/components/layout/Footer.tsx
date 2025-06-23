import React from 'react';
import { prisma } from '@/lib/db';
import ClientFooter from './ClientFooter';

interface Page {
  id: number;
  slug: string;
  title: string;
  showInFooter: boolean;
  sortOrder: number;
}

async function getFooterData() {
  try {
    // Fetch pages that should show in footer
    const pages = await prisma.page.findMany({
      where: {
        showInFooter: true
      },
      orderBy: {
        sortOrder: 'asc'
      },
      select: {
        id: true,
        slug: true,
        title: true,
        showInFooter: true,
        sortOrder: true
      }
    });

    console.log('Footer - Pages fetched:', pages);
    return { pages };
  } catch (error) {
    console.error('Failed to fetch footer data:', error);
    return { pages: [] };
  }
}

const Footer = async () => {
  const { pages } = await getFooterData();

  return <ClientFooter pages={pages} />;
};

export default Footer; 