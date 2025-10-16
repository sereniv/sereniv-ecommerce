"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Container } from './ui/container';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">


            {/* Column 2: About */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ingredients"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Ingredients
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Help */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Help</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-600 mb-4">
                Get the latest updates on new products and upcoming sales.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-black transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 py-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 Sereniv. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="#"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Twitter size={20} />
            </Link>
            <Link
              href="https://www.instagram.com/serenivskinscience"
              className="text-gray-500 hover:text-gray-900 transition-colors"
              target="_blank"
            >
              <Instagram size={20} />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
