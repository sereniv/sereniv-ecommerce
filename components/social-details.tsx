import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Entity, EntityLink, LinkType } from "@/lib/types/entity"; 
import { PlusIcon, XIcon, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue   } from "./ui/select";

function SocialDetails({ formData, setFormData, formErrors }: { 
  formData: Entity, 
  setFormData: (formData: Entity) => void, 
  formErrors: any 
}) {
  const { toast } = useToast();

  const [newLink, setNewLink] = useState<EntityLink>({
    url: "",
    text: "",
    type: LinkType.UNOFFICIAL,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempLink, setTempLink] = useState<EntityLink>({
    url: "",
    text: "",
    type: LinkType.UNOFFICIAL,
  });
  
  const validateLink = (link: EntityLink): string | null => {
    if (!link.text.trim()) {
      return "Text is required";
    }
    if (!link.url.trim()) {
      return "URL is required";
    }
    try {
      new URL(link.url);
    } catch {
      return "Please enter a valid URL (e.g., https://example.com)";
    }
    return null;
  };

  const addLink = () => {
    const validationError = validateLink(newLink);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = formData.entityLinks?.some(link => link.url === newLink.url);
    if (isDuplicate) {
      toast({
        title: "Duplicate Link",
        description: "This URL has already been added",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      entityLinks: [...(formData.entityLinks || []), newLink],
    });

    setNewLink({
      url: "",
      text: "",
      type: LinkType.UNOFFICIAL,
    });

    toast({
      title: "Link Added",
      description: "Social link has been added successfully",
    });
  };

  const removeLink = (index: number) => {
    const entityLinks = [...(formData.entityLinks || [])];
    const removedLink = entityLinks[index];
    entityLinks.splice(index, 1);
    setFormData({ ...formData, entityLinks });

    toast({
      title: "Link Removed",
      description: `"${removedLink.text}" has been removed`,
    });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempLink({ ...formData.entityLinks![index] });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const validationError = validateLink(tempLink);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = formData.entityLinks?.some((link, index) => 
      link.url === tempLink.url && index !== editingIndex
    );
    if (isDuplicate) {
      toast({
        title: "Duplicate Link",
        description: "This URL has already been added",
        variant: "destructive",
      });
      return;
    }

    const entityLinks = [...(formData.entityLinks || [])];
    entityLinks[editingIndex] = tempLink;
    setFormData({ ...formData, entityLinks });

    setEditingIndex(null);
    setTempLink({ url: "", text: "", type: LinkType.UNOFFICIAL });

    toast({
      title: "Link Updated",
      description: "Social link has been updated successfully",
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setTempLink({ url: "", text: "", type: LinkType.UNOFFICIAL });
  };

  const updateExistingLink = (field: keyof EntityLink, value: string) => {
    setTempLink(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm shadow-xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200/50 dark:from-orange-800 dark:to-orange-700/30 border border-orange-200 dark:border-orange-700 shadow-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">Add Social Links</h3>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-6">
              Add social links to your entity. This helps visitors find information quickly.
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="text" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                  Text <span className="text-red-500">*</span>
                </label>
                <Input
                  id="text"
                  placeholder="e.g. Twitter, Facebook, LinkedIn"
                  value={newLink.text}
                  onChange={(e) => setNewLink({ ...newLink, text: e.target.value })}
                  className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                />
              </div>
              
              <div>
                <label htmlFor="link" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                  Link <span className="text-red-500">*</span>
                </label>
                <Input
                  id="link"
                  placeholder="e.g. https://www.facebook.com/your-page"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                  type="url"
                />
              </div>

              <div>
                <label htmlFor="type" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newLink.type.toString() || LinkType.UNOFFICIAL.toString()}
                  onValueChange={(value) => setNewLink({ ...newLink, type: value as LinkType })}
                >
                  <SelectTrigger className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LinkType.OFFICIAL.toString()}>Official</SelectItem>
                    <SelectItem value={LinkType.UNOFFICIAL.toString()}>Unofficial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addLink}
                className="w-full border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
                disabled={!newLink.text.trim() || !newLink.url.trim()}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>

        {formData.entityLinks && formData.entityLinks.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Added Links ({formData.entityLinks.length})</h3>

            {formData.entityLinks.map((link: EntityLink, index: number) => (
              <div key={index} className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg p-4">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-8 translate-x-8 transition-transform duration-700" />
                <div className="relative">
                  {editingIndex === index ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Text <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g. Twitter, Facebook, LinkedIn"
                          value={tempLink.text}
                          onChange={(e) => updateExistingLink('text', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          URL <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g. https://www.facebook.com/your-page"
                          value={tempLink.url}
                          onChange={(e) => updateExistingLink('url', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="url"
                        />
                      </div>


                      <div>
                        <label htmlFor="type" className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={tempLink?.type?.toString() || LinkType.UNOFFICIAL.toString()}
                          onValueChange={(value) => updateExistingLink('type', value as LinkType)}
                        >
                          <SelectTrigger className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={LinkType.OFFICIAL.toString()}>Official</SelectItem>
                            <SelectItem value={LinkType.UNOFFICIAL.toString()}>Unofficial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={saveEdit}
                          size="sm"
                          variant="default"
                          disabled={!tempLink.text.trim() || !tempLink.url.trim()}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                          className="border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground truncate">{link.text}</h4>
                          <span className="text-xs bg-orange-100/20 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded border border-orange-200/50 dark:border-orange-800/50">Social Link</span>
                          {link.type === LinkType.OFFICIAL && (
                            <span className="text-xs bg-emerald-100/20 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                              Official
                            </span>
                          )}
                          {link.type === LinkType.UNOFFICIAL && (
                            <span className="text-xs bg-orange-100/20 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded border border-orange-200/50 dark:border-orange-800/50">
                              Unofficial
                            </span>
                          )}
                        </div>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all transition-colors duration-300"
                        >
                          {link.url}
                        </a>
                      </div>
                      
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(index)}
                          className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                          aria-label="Edit social link"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLink(index)}
                          className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                          aria-label="Remove social link"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
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
              <p>No Links added yet</p>
              <p className="text-sm mt-1">Add social links to your entity</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialDetails;