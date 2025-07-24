"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FormShimmer } from "@/components/ui/shimmer"
import { useToast } from "@/components/ui/use-toast"
import { getApiUrl } from "@/lib/utils";
import EditEntityForm from "@/components/edit-entity-form"
import { Entity } from "@/lib/types/entity"
import { Card, CardContent } from "@/components/ui/card"


export default function EditEntityPage() {

  const { toast } = useToast()

  const params = useParams()

  if (!params || !params.slug) {
    return <FormShimmer />; 
  }
  
  const slug = params.slug as string; 

  const [entity, setEntity] = useState<Entity | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEntityDetail() {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(getApiUrl(`/admin/entity?slug=${slug}`));
        
        if (!response.ok) {
          throw new Error(`Failed to fetch entity data: ${response.status}`);
        }
        
        const data = await response.json();
        setEntity(data.data);
      } catch (error) {
        console.error("Error fetching entity detail:", error);
        setError("Failed to load entity data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntityDetail();
  }, [slug]);

  return (
    <div className="min-h-screen via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
      </div>

      <div className="container px-4 mx-auto max-w-7xl py-6 sm:py-8 md:py-12">
        <div className="space-y-8 sm:space-y-12">
          {/* Hero Section */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-300/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full translate-y-16 -translate-x-16 sm:translate-y-32 sm:-translate-x-32 transition-transform duration-1000 group-hover:scale-110" />

            <CardContent className="relative p-6 sm:p-8 md:p-12">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent leading-tight">
                    Edit Entity
                  </h1>
                  <p className="mt-2 text-sm sm:text-xl text-muted-foreground/90 leading-relaxed">Update entity details and information</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {loading ? (
              <div className="col-span-full">
                <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-xl border border-orange-200/50 dark:border-orange-800/50">
                  <CardContent className="p-8">
                    <FormShimmer />
                  </CardContent>
                </Card>
              </div>
            ) : entity ? (
              <EditEntityForm initialData={entity} slug={slug} toast={toast} />
            ) : (
              <div className="col-span-full">
                <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-xl border border-red-200/50 dark:border-red-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border border-red-200 dark:border-red-800 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-400">Error Loading Entity</h3>
                        <p className="text-red-600 dark:text-red-400">{error || "Failed to load entity data"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}