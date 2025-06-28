import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <main 
      className="min-h-screen" 
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <Header />
      
      <div className="pt-20 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h1 
              className="mb-4"
              style={{
                fontSize: '8rem',
                fontWeight: '700',
                color: 'var(--color-gray-light)',
                fontFamily: 'var(--font-family-sans)',
                lineHeight: '1'
              }}
            >
              404
            </h1>
            <h2 
              className="mb-4"
              style={{
                fontSize: '2.5rem',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-sans)',
                lineHeight: '1.2'
              }}
            >
              Page Not Found
            </h2>
            <p 
              className="mb-8"
              style={{
                fontSize: '1.25rem',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-sans)',
                fontWeight: 'var(--font-weight-normal)',
                lineHeight: 'var(--line-height-base)'
              }}
            >
              Sorry, the page you are looking for doesn't exist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg transition-colors"
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-sans)',
                color: '#FFFFFF',
                backgroundColor: 'var(--color-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 
