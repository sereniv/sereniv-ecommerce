import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Entity } from "@/lib/types/entity";
import { EntityType } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";

function BasicDetails({ formData, setFormData, formErrors }: { formData: Entity, setFormData: (formData: Entity) => void, formErrors: any }) {
    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="space-y-6">
                <div>
                    <label htmlFor="rank" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Rank <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="rank"
                        required
                        placeholder="Enter Entity Rank"
                        value={formData.rank || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, rank: e.target.value })
                        }
                        className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300", {
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20":
                                formData.rank !== "" && formData.rank?.length && formData.rank?.length < 1
                        })}
                    />
                    {formData.rank !== "" && formData.rank?.length && formData.rank?.length < 1 && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Rank must be at least 1 character.
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="name" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="name"
                        required
                        placeholder="Enter Entity Name"
                        value={formData.name || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300", {
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20":
                                formData.name !== "" && formData.name?.length && formData.name?.length < 1
                        })}
                    />
                    {formData.name !== "" && formData.name?.length && formData.name?.length < 1 && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Name must be at least 1 character.
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="ticker" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Ticker <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="ticker"
                        required
                        placeholder="Enter Entity Ticker"
                        value={formData.ticker || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, ticker: e.target.value })
                        }
                        className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300", {
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20":
                                formData.ticker !== "" && formData.ticker?.length && formData.ticker?.length < 1
                        })}
                    />
                    {formData.ticker !== "" && formData.ticker?.length && formData.ticker?.length < 1 && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Ticker must be at least 1 character.
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="slug" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="slug"
                        required
                        placeholder="Enter Entity Slug"
                        value={formData.slug || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                        }
                        className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300", {
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20":
                                formData.slug !== "" && formData.slug?.length && formData.slug?.length < 1
                        })}
                    />
                    {formData.slug !== "" && formData.slug?.length && formData.slug?.length < 1 && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Slug must be at least 1 character.
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.type || ""}
                        onValueChange={(value) => setFormData({ ...formData, type: value as EntityType })}
                    >
                        <SelectTrigger className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm">
                            <SelectItem value={EntityType.PUBLIC} className="hover:bg-orange-50 dark:hover:bg-orange-950/50 focus:bg-orange-50 dark:focus:bg-orange-950/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Public
                                </div>
                            </SelectItem>
                            <SelectItem value={EntityType.PRIVATE} className="hover:bg-orange-50 dark:hover:bg-orange-950/50 focus:bg-orange-50 dark:focus:bg-orange-950/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Private
                                </div>
                            </SelectItem>
                            <SelectItem value={EntityType.GOVERNMENT} className="hover:bg-orange-50 dark:hover:bg-orange-950/50 focus:bg-orange-50 dark:focus:bg-orange-950/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    Government
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        External Website Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formData.externalWebsiteSlug || ""}
                        onChange={(e) => setFormData({ ...formData, externalWebsiteSlug: e.target.value })}
                        className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300", {
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20":
                                formData.externalWebsiteSlug !== "" && formData.externalWebsiteSlug?.length && formData.externalWebsiteSlug?.length < 1
                        })}
                        placeholder="Enter external website slug"
                    />
                    {formData.externalWebsiteSlug !== "" && formData.externalWebsiteSlug?.length && formData.externalWebsiteSlug?.length < 1 && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            External Website Slug must be at least 1 character.
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Country Flag
                    </label>
                    <Input
                        value={formData.countryFlag || ""}
                        onChange={(e) => setFormData({ ...formData, countryFlag: e.target.value })}
                        className="h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                        placeholder="Enter country flag emoji or code"
                    />
                </div>

                <div>
                    <label htmlFor="countryName" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                        Country Name
                    </label>
                    <Input
                        value={formData.countryName || ""}
                        onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
                        className="h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                        placeholder="Enter country name"
                    />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                    Holding Since
                </label>
                <DatePicker
                    date={formData.holdingSince ? new Date(formData.holdingSince) : undefined}
                    setDate={(date: Date | undefined) => setFormData({ ...formData, holdingSince: date ? date.toISOString() : null })}
                    className="h-12 w-full text-base"
                />
            </div>
        </div>
    )
}

export default BasicDetails;
