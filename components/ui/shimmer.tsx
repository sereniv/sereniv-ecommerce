import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded",
        className
      )}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
    />
  )
}

export function FormShimmer() {
  return (
    <div className="bg-white min-h-screen" aria-hidden="true">
      {/* Header */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between border-b py-4">
            <div>
              <Shimmer className="h-8 w-48 mb-2" />
              <Shimmer className="h-4 w-64" />
            </div>
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="flex items-center">
                  <Shimmer
                    className={cn(
                      "w-8 h-8 rounded-full",
                      index === 0
                        ? "bg-gray-900/20"
                        : index < 0
                        ? "bg-green-100/20"
                        : "bg-gray-100/20"
                    )}
                  />
                  {index < 3 && (
                    <Shimmer
                      className={cn(
                        "w-12 h-0.5 mx-1",
                        index < 0 ? "bg-green-200/20" : "bg-gray-200/20"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <Shimmer className="h-6 w-24" />
              </div>
              <div className="p-0">
                <div className="flex flex-col">
                  {Array(4).fill(0).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-l-4",
                        index === 0
                          ? "border-l-gray-900 bg-gray-50"
                          : index < 0
                          ? "border-l-green-500"
                          : "border-l-transparent"
                      )}
                    >
                      <Shimmer
                        className={cn(
                          "w-10 h-10 rounded-lg flex-shrink-0",
                          index === 0
                            ? "bg-gray-900/20"
                            : index < 0
                            ? "bg-green-100/20"
                            : "bg-gray-100/20"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <Shimmer className="h-4 w-28 mb-1" />
                        <Shimmer className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-9">
            <div className="rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
                <Shimmer className="w-10 h-10 rounded-lg" />
                <div>
                  <Shimmer className="h-6 w-36" />
                  <Shimmer className="h-4 w-48 mt-1" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Mimic ProductBasicDetails structure for step 0 */}
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/4" />
                    <Shimmer className="h-12 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/3" />
                    <Shimmer className="h-12 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/3" />
                    <Shimmer className="h-32 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/4" />
                    <Shimmer className="h-12 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/3" />
                    <div className="flex gap-2 flex-wrap">
                      {Array(3).fill(0).map((_, i) => (
                        <Shimmer key={i} className="h-6 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/3" />
                    <div className="flex gap-2 flex-wrap">
                      {Array(3).fill(0).map((_, i) => (
                        <Shimmer key={i} className="h-6 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/3" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Shimmer className="h-4 w-1/2" />
                          <Shimmer className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Shimmer className="h-5 w-1/4" />
                    <Shimmer className="h-6 w-20" />
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Shimmer className="h-12 w-24" />
                    <Shimmer className="h-12 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}