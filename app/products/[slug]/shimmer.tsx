"use client";

export default function Shimmer() {
  return (
    <div className="bg-white min-h-screen">
        aaaaaaaaa
      {/* Breadcrumb Shimmer */}
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Main Product Section Shimmer */}
      <div className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Shimmer */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Details Shimmer */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Rating */}
            {/* <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div> */}

            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Categories */}
            <div className="flex gap-2">
              <div className="h-7 w-32 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-7 w-28 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-7 w-36 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Size */}
            <div className="space-y-3">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section Shimmer */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="max-w-4xl space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Section Shimmer */}
      <div className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 rounded-lg p-6 space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section Shimmer */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
