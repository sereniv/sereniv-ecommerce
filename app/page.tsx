import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <Container>
      <div className="space-y-16 pb-16">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
            Skincare for the Minimalist
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Effective, transparent, and gentle formulations designed to simplify your routine.
          </p>
          <Link href="/shop/all">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-black rounded-full px-8 py-3 text-base">
              Shop All Products
            </Button>
          </Link>
        </div>

        {/* Featured Products Section */}
        <div>
          <h2 className="text-3xl font-light text-center mb-10">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="text-center group">
              <Link href="/shop/product/serum-01">
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-lg">
                  <Image
                    src="/images/serum-placeholder.jpg" // Placeholder image
                    alt="Niacinamide Serum"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-lg">Niacinamide 10%</h3>
                <p className="text-gray-600">Clarifying Serum</p>
              </Link>
            </div>
            {/* Product 2 */}
            <div className="text-center group">
              <Link href="/shop/product/moisturizer-01">
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-lg">
                  <Image
                    src="/images/moisturizer-placeholder.jpg" // Placeholder image
                    alt="Vitamin C Moisturizer"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-lg">Vitamin C</h3>
                <p className="text-gray-600">Brightening Moisturizer</p>
              </Link>
            </div>
            {/* Product 3 */}
            <div className="text-center group">
              <Link href="/shop/product/cleanser-01">
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-lg">
                  <Image
                    src="/images/cleanser-placeholder.jpg" // Placeholder image
                    alt="Gentle Cleanser"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-lg">Oat Cleanser</h3>
                <p className="text-gray-600">Gentle Face Wash</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Value Propositions Section */}
        <div className="py-16 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-2">Clean Ingredients</h3>
              <p className="text-gray-600">
                Formulated without parabens, sulfates, or artificial fragrances.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Cruelty-Free</h3>
              <p className="text-gray-600">
                We never test on animals. All of our products are 100% vegan.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Transparent</h3>
              <p className="text-gray-600">
                We believe in full transparency, from our ingredients to our pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}