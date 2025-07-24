import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/rich-text-editor";
import { useEffect, useState } from "react";
import * as React from "react";
import { Pencil, Trash2, Plus, Save, ChevronUp, ChevronDown, Eye, EyeOff, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Entity, EntityAbout } from "@/lib/types/entity";

function AboutDetails({
    formData,
    setFormData,
    formErrors
}: {
    formData: Entity,
    setFormData: (formData: Entity) => void,
    formErrors: any
}) {
    const [contents, setContents] = useState<EntityAbout[]>(formData.entityAbout || []);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempContent, setTempContent] = useState<EntityAbout | null>(null);
    const [editingKeyPointIndex, setEditingKeyPointIndex] = useState<number | null>(null);
    const [tempKeyPoint, setTempKeyPoint] = useState<string>("");

    useEffect(() => {
        setContents(formData.entityAbout || []);
    }, [formData.entityAbout]);

    const handleContentChange = (index: number, field: keyof EntityAbout, value: string | boolean | number) => {
        if (editingIndex === index && tempContent) {
            setTempContent({
                ...tempContent,
                [field]: value
            });
        } else {
            const newContents = [...contents];
            if (!newContents[index]) {
                newContents[index] = {
                    title: "",
                    content: "",
                    headings: [],
                    keyPoints: [],
                };
            }
            newContents[index] = {
                ...newContents[index],
                [field]: value
            };
            setContents(newContents);
            setFormData({
                ...formData,
                entityAbout: newContents
            });
        }
    };

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setTempContent({ ...contents[index] });
    };

    const saveChanges = () => {
        if (editingIndex !== null && tempContent) {
            const newContents = [...contents];
            newContents[editingIndex] = tempContent;
            setContents(newContents);
            setFormData({
                ...formData,
                entityAbout: newContents
            });
            setEditingIndex(null);
            setTempContent(null);
        }
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setTempContent(null);
    };

    const addNewContentSection = () => {
        const newContent: EntityAbout = {
            title: "",
            content: "",
            headings: [],
            keyPoints: [],
        };
        const newContents = [...contents, newContent];
        setContents(newContents);
        setFormData({
            ...formData,
            entityAbout: newContents
        });
    };

    const removeContentSection = (index: number) => {
        const newContents = contents.filter((_, i) => i !== index);
        setContents(newContents);
        setFormData({
            ...formData,
            entityAbout: newContents
        });
    };

    // Key Points Functions
    const addNewKeyPoint = () => {
        if (!formData.entityAbout || !formData.entityAbout[0]) {
            // Initialize first content section if it doesn't exist
            const newEntityAbout = [{
                title: "",
                content: "",
                headings: [],
                keyPoints: [""] // Add empty key point
            }];
            setFormData({
                ...formData,
                entityAbout: newEntityAbout
            });
        } else {
            const newEntityAbout = [...formData.entityAbout];
            newEntityAbout[0] = {
                ...newEntityAbout[0],
                keyPoints: [...(newEntityAbout[0].keyPoints || []), ""]
            };
            setFormData({
                ...formData,
                entityAbout: newEntityAbout
            });
        }
    };

    const removeKeyPoint = (keyPointIndex: number) => {
        if (formData.entityAbout && formData.entityAbout[0]) {
            const newEntityAbout = [...formData.entityAbout];
            newEntityAbout[0] = {
                ...newEntityAbout[0],
                keyPoints: newEntityAbout[0].keyPoints?.filter((_, i) => i !== keyPointIndex) || []
            };
            setFormData({
                ...formData,
                entityAbout: newEntityAbout
            });
        }
    };

    const startEditingKeyPoint = (keyPointIndex: number) => {
        setEditingKeyPointIndex(keyPointIndex);
        setTempKeyPoint(formData.entityAbout?.[0]?.keyPoints?.[keyPointIndex] || "");
    };

    const saveKeyPointChanges = () => {
        if (editingKeyPointIndex !== null && formData.entityAbout && formData.entityAbout[0]) {
            const newEntityAbout = [...formData.entityAbout];
            const newKeyPoints = [...(newEntityAbout[0].keyPoints || [])];
            newKeyPoints[editingKeyPointIndex] = tempKeyPoint;
            newEntityAbout[0] = {
                ...newEntityAbout[0],
                keyPoints: newKeyPoints
            };
            setFormData({
                ...formData,
                entityAbout: newEntityAbout
            });
            setEditingKeyPointIndex(null);
            setTempKeyPoint("");
        }
    };

    const cancelKeyPointEditing = () => {
        setEditingKeyPointIndex(null);
        setTempKeyPoint("");
    };

    const updateKeyPoint = (keyPointIndex: number, value: string) => {
        if (formData.entityAbout && formData.entityAbout[0]) {
            const newEntityAbout = [...formData.entityAbout];
            const newKeyPoints = [...(newEntityAbout[0].keyPoints || [])];
            newKeyPoints[keyPointIndex] = value;
            newEntityAbout[0] = {
                ...newEntityAbout[0],
                keyPoints: newKeyPoints
            };
            setFormData({
                ...formData,
                entityAbout: newEntityAbout
            });
        }
    };

    const moveContent = (index: number, direction: 'up' | 'down') => {
        const newContents = [...contents];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newContents.length) {
            [newContents[index], newContents[targetIndex]] = [newContents[targetIndex], newContents[index]];
            setContents(newContents);
            setFormData({
                ...formData,
                entityAbout: newContents
            });
        }
    };

    const toggleVisibility = (index: number) => {
        const newContents = [...contents];
        newContents[index] = {
            ...newContents[index],
            headings: !newContents[index].headings[0] ? [index.toString()] : []
        };
        setContents(newContents);
        setFormData({
            ...formData,
            entityAbout: newContents
        });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="relative">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="title"
                                required
                                placeholder="Enter Entity Title"
                                value={formData.entityAbout?.[0]?.title || ""}
                                onChange={(e) =>
                                    setFormData({ 
                                        ...formData, 
                                        entityAbout: [{ 
                                            title: e.target.value, 
                                            content: formData.entityAbout?.[0]?.content || "", 
                                            headings: formData.entityAbout?.[0]?.headings || [], 
                                            keyPoints: formData.entityAbout?.[0]?.keyPoints || [] 
                                        }] 
                                    })
                                }
                                className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300")}
                            />
                            {formData.entityAbout?.[0]?.title !== "" && formData.entityAbout?.[0]?.title?.length && formData.entityAbout?.[0]?.title?.length < 1 && (
                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Title must be at least 1 character.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="content" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.entityAbout?.[0]?.content || ""}
                                onChange={(value) =>
                                    setFormData({ 
                                        ...formData, 
                                        entityAbout: [{ 
                                            title: formData.entityAbout?.[0]?.title || "", 
                                            content: value, 
                                            headings: formData.entityAbout?.[0]?.headings || [], 
                                            keyPoints: formData.entityAbout?.[0]?.keyPoints || [] 
                                        }] 
                                    })
                                }
                            />
                            {formData.entityAbout?.[0]?.content !== "" && formData.entityAbout?.[0]?.content?.length && formData.entityAbout?.[0]?.content?.length < 1 && (
                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Content must be at least 1 character.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="heading" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Heading <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="heading"
                                required
                                placeholder="Enter Entity Heading"
                                value={formData.entityAbout?.[0]?.headings[0] || ""}
                                onChange={(e) =>
                                    setFormData({ 
                                        ...formData, 
                                        entityAbout: [{ 
                                            title: formData.entityAbout?.[0]?.title || "", 
                                            content: formData.entityAbout?.[0]?.content || "", 
                                            headings: [e.target.value], 
                                            keyPoints: formData.entityAbout?.[0]?.keyPoints || [] 
                                        }] 
                                    })
                                }
                                className={cn("h-12 text-base border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300")}
                            />
                            {formData.entityAbout?.[0]?.headings[0] !== "" && formData.entityAbout?.[0]?.headings[0]?.length && formData.entityAbout?.[0]?.headings[0]?.length < 1 && (
                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Heading must be at least 1 character.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Points Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">Key Points</h3>
                    <Button
                        type="button"
                        onClick={addNewKeyPoint}
                        variant="outline"
                        size="sm"
                        className="border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Key Point
                    </Button>
                </div>

                {formData.entityAbout?.[0]?.keyPoints && formData.entityAbout[0].keyPoints.length > 0 ? (
                    <div className="space-y-4">
                        {formData.entityAbout[0].keyPoints.map((keyPoint: string, index: number) => (
                            <div key={index} className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg p-4">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-8 translate-x-8 transition-transform duration-700" />
                                <div className="relative flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        {editingKeyPointIndex === index ? (
                                            <div className="space-y-2">
                                                <RichTextEditor
                                                    value={tempKeyPoint}
                                                    onChange={setTempKeyPoint}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={saveKeyPointChanges}
                                                        size="sm"
                                                        variant="default"
                                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                                                    >
                                                        <Save className="h-4 w-4 mr-1" />
                                                        Save
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={cancelKeyPointEditing}
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {keyPoint ? (
                                                    <div
                                                        className="prose dark:prose-invert max-w-none text-muted-foreground"
                                                        dangerouslySetInnerHTML={{ __html: keyPoint }}
                                                    />
                                                ) : (
                                                    <p className="text-muted-foreground italic">Empty key point - click edit to add content</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {editingKeyPointIndex !== index && (
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditingKeyPoint(index)}
                                                className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                                                aria-label="Edit key point"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeKeyPoint(index)}
                                                className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                aria-label="Delete key point"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg text-center py-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-transform duration-700" />
                        <div className="relative text-muted-foreground">
                            <div className="p-4 rounded-full bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/50 dark:to-orange-900/30 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                                <PlusIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p>No Key Points added yet</p>
                            <p className="text-sm mt-1">Add key points about your entity</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AboutDetails;