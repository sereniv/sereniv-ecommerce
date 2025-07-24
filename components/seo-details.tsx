import { Input } from "@/components/ui/input";
import { cleanSEOIMAGEURL, cn } from "@/lib/utils";
import RichTextEditor from "@/components/rich-text-editor";
import { useEffect, useState } from "react";
import * as React from "react";
import { Pencil, Trash2, Plus, Save, ChevronUp, ChevronDown, Eye, EyeOff, PlusIcon, XIcon, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Entity, EntityAbout } from "@/lib/types/entity";
import { ImageUpload } from "@/components/image-uplaod";

function SeoDetails({
    formData,
    setFormData,
    formErrors
}: {
    formData: Entity,
    setFormData: (formData: Entity) => void,
    formErrors: any
}) {
    const [newKeyword, setNewKeyword] = useState("");

    useEffect(() => {
        if (!formData.seoKeywords) {
            setFormData({
                ...formData,
                seoKeywords: []
            });
        }
    }, []);

    const handleAddKeyword = () => {
        if (newKeyword.trim() && !formData.seoKeywords?.includes(newKeyword.trim())) {
            setFormData({
                ...formData,
                seoKeywords: [...(formData.seoKeywords || []), newKeyword.trim()]
            });
            setNewKeyword("");
        }
    };

    const handleRemoveKeyword = (index: number) => {
        const updatedKeywords = formData.seoKeywords?.filter((_, i) => i !== index) || [];
        setFormData({
            ...formData,
            seoKeywords: updatedKeywords
        });
    };

    const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddKeyword();
        }
    };

    const handleImageChange = (imageUrl: string) => {
        setFormData({
            ...formData,
            seoImage: cleanSEOIMAGEURL(imageUrl)
        });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm shadow-xl p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 transition-transform duration-700" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200/50 dark:from-orange-800 dark:to-orange-700/30 border border-orange-200 dark:border-orange-700 shadow-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-orange-800 dark:text-orange-200">SEO Optimization</h3>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mb-6">
                            Optimize your entity for search engines with title, description, keywords, and image.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="title" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                    SEO Title 
                                </label>
                                <Input
                                    id="title"
                                    placeholder="Enter SEO Title"
                                    value={formData.seoTitle || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            seoTitle: e.target.value,
                                        })
                                    }
                                    className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300")}
                                />
                            </div>

                            <div>
                                <label htmlFor="content" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                    SEO Description 
                                </label>
                                <RichTextEditor
                                    value={formData.seoDescription || ""}
                                    onChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            seoDescription: value,
                                        })
                                    }
                                />
                            </div>

                            {/* Keywords Section */}
                            <div>
                                <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                    SEO Keywords
                                </label>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a keyword..."
                                            value={newKeyword}
                                            onChange={(e) => setNewKeyword(e.target.value)}
                                            onKeyPress={handleKeywordKeyPress}
                                            className="flex-1 h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddKeyword}
                                            disabled={!newKeyword.trim()}
                                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    {formData.seoKeywords && formData.seoKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.seoKeywords.map((keyword, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gradient-to-r from-orange-100 to-orange-200/50 dark:from-orange-800/50 dark:to-orange-700/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700 shadow-sm transition-all duration-200 hover:shadow-md"
                                                >
                                                    {keyword}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveKeyword(index)}
                                                        className="ml-1 text-orange-600 dark:text-orange-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                    SEO Image
                                </label>
                                <p className="text-xs text-orange-500 dark:text-orange-500 mb-4">
                                    Recommended: 1200x630px for optimal social sharing
                                </p>
                                <ImageUpload
                                    value={formData.seoImage ? cleanSEOIMAGEURL(formData.seoImage)! : ""}
                                    onChange={handleImageChange}
                                    title="Upload SEO Image"
                                    description="Drag and drop an SEO image here, or click to select"
                                    maxSizeMB={5}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SeoDetails;