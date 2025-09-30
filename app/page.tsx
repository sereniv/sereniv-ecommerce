'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/use-products';

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <Container>
      <div className="space-y-16 pb-16">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
            Skincare for the Sereniv
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Effective, transparent, and gentle formulations designed to simplify your routine.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-black rounded-full px-8 py-3 text-base">
              Shop All Products
            </Button>
          </Link>
        </div>

        {/* Featured Products Section */}
        <div>
          <h2 className="text-3xl font-light text-center mb-10">Featured Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-200 animate-pulse rounded-lg overflow-hidden mb-4 h-[200px] w-[200px] mx-auto" />
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products &&    products.length > 0 &&  products.slice(0, 3).map((product) => (
                <div key={product.id} className="text-center group w-[300px]">
                  <Link href={`/products/${product.slug}`}>
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-lg w-[300px] h-[300px] mx-auto">
                      <Image
                        src={product.thumbnail || "/images/placeholder.jpg"}
                        alt={product.name}
                        width={250}
                        height={320}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          )}
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