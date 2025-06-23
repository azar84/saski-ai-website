import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-xl text-gray-600 mb-8">
              Sorry, the page you are looking for doesn't exist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#5243E9] hover:bg-[#4338CA] transition-colors"
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