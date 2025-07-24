"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Unlink, 
  Strikethrough, 
  Paintbrush, 
  Type,
  MoreHorizontal
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWords?: number;
  minWords?: number;
  className?: string;
  required?: boolean;
  error?: string;
}

const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#4A4A4A' },
  { name: 'Medium Gray', value: '#9E9E9E' },
  { name: 'Light Gray', value: '#F5F5F5' },
  { name: 'Red', value: '#F44336' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Deep Purple', value: '#673AB7' },
  { name: 'Indigo', value: '#3F51B5' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Light Blue', value: '#03A9F4' },
  { name: 'Cyan', value: '#00BCD4' },
  { name: 'Teal', value: '#009688' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Light Green', value: '#8BC34A' },
  { name: 'Lime', value: '#CDDC39' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Amber', value: '#FFC107' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Deep Orange', value: '#FF5722' }
];

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter text...",
  maxWords = 10000,
  minWords = 0,
  className,
  required = false,
  error
}: RichTextEditorProps) {

  const [localContent, setLocalContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const selectedTextRef = useRef<string>("");
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (!initializedRef.current || value === "") {
        setLocalContent(value);
        editorRef.current.innerHTML = value;
        initializedRef.current = true;
      }
    }
    updateWordCount(value);
    updatePlaceholder(value);
  }, [value]);

  const updateWordCount = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const words = textContent ? textContent.split(/\s+/).length : 0;
    setWordCount(words);
  };

  const updatePlaceholder = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    setShowPlaceholder(!textContent && !isFocused);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdatingRef.current) return;
    
    const content = e.currentTarget.innerHTML;
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const words = textContent ? textContent.split(/\s+/).length : 0;
    
    if (words > maxWords) {
      return;
    }
    
    setLocalContent(content);
    onChange(content);
    updateWordCount(content);
    updatePlaceholder(content);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowPlaceholder(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    updatePlaceholder(localContent);
  };

  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      document.execCommand(command, false, value);
      const content = editorRef.current.innerHTML;
      setLocalContent(content);
      onChange(content);
      updateWordCount(content);
    } catch (error) {
      console.error('Error applying format:', error);
    }
  };

  const applyColor = (color: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      document.execCommand('foreColor', false, color);
      const content = editorRef.current.innerHTML;
      setLocalContent(content);
      onChange(content);
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error applying color:', error);
    }
  };

  const handleLinkClick = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      selectedTextRef.current = range.toString();
      savedSelectionRef.current = range.cloneRange();
      
      if (selectedTextRef.current) {
        setLinkText(selectedTextRef.current);
      }
      
      setShowLinkDialog(true);
    }
  };

  const insertLink = () => {
    if (!editorRef.current || !linkUrl.trim()) return;
    
    editorRef.current.focus();
    
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
    
    const finalText = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer">${finalText}</a>`;
    
    try {
      if (selectedTextRef.current) {
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        document.execCommand('insertHTML', false, linkHtml);
      }
      
      const content = editorRef.current.innerHTML;
      setLocalContent(content);
      onChange(content);
      
      setShowLinkDialog(false);
      setLinkUrl("");
      setLinkText("");
      selectedTextRef.current = "";
      savedSelectionRef.current = null;
    } catch (error) {
      console.error('Error inserting link:', error);
    }
  };

  const removeLink = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      document.execCommand('unlink', false);
      const content = editorRef.current.innerHTML;
      setLocalContent(content);
      onChange(content);
    } catch (error) {
      console.error('Error removing link:', error);
    }
  };

  return (
    <div className={cn("border border-orange-200/50 dark:border-orange-800/50 rounded-xl bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus-within:border-orange-500 dark:focus-within:border-orange-400 transition-all duration-300 overflow-hidden", 
      error ? "border-red-500" : "",
      className
    )}>
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 dark:to-orange-900/70 backdrop-blur-sm border-b border-orange-200/50 dark:border-orange-800/50 p-3 rounded-t-xl">
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('undo');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
            Undo
          </Button>
        
          <Button
            type="button"
            variant="ghost"
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('redo');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path></svg>
            Redo
          </Button>
        
          <div className="w-px h-6 bg-orange-200/50 dark:bg-orange-800/50 mx-1" />
        
          <Button
            type="button"
            variant="ghost"
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('bold');
            }}
          >
            <Bold className="h-3 w-3 mr-1" />
            Bold
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('italic');
            }}
          >
            <Italic className="h-3 w-3 mr-1" />
            Italic
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('underline');
            }}
          >
            <Underline className="h-3 w-3 mr-1" />
            Underline
          </Button>
        
          <div className="w-px h-6 bg-orange-200/50 dark:bg-orange-800/50 mx-1" />
        
          <Button
            type="button"
            variant="ghost"
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('insertUnorderedList');
            }}
          >
            <List className="h-3 w-3 mr-1" />
            List
          </Button>
        
          <Button
            type="button"
            variant="ghost"
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('insertOrderedList');
            }}
          >
            <ListOrdered className="h-3 w-3 mr-1" />
            Ordered
          </Button>
        
          <div className="w-px h-6 bg-orange-200/50 dark:bg-orange-800/50 mx-1" />

          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              handleLinkClick();
            }}
            title="Add Link"
          >
            <Link className="h-3 w-3 mr-1" />
            Link
          </Button>
        
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300" 
            onMouseDown={(e) => {
              e.preventDefault();
              removeLink();
            }}
            title="Remove Link"
            aria-label="Remove link"
          >
            <Unlink className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-orange-200/50 dark:border-orange-800/50 rounded-xl p-6 w-96 max-w-[90vw] shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-orange-800 dark:text-orange-200">Add Link</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText" className="text-orange-800 dark:text-orange-200">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="mt-1 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                />
              </div>
              
              <div>
                <Label htmlFor="linkUrl" className="text-orange-800 dark:text-orange-200">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl("");
                  setLinkText("");
                  selectedTextRef.current = "";
                  savedSelectionRef.current = null;
                  if (editorRef.current) {
                    editorRef.current.focus();
                  }
                }}
                className="border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Editor Area */}
      <div className="relative min-h-[200px]">
        {showPlaceholder && (
          <div className="absolute top-0 left-0 p-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="min-h-[200px] p-3 focus:outline-none [&_a]:underline [&_a]:bg-transparent hover:[&_a]:opacity-80 text-foreground prose prose-sm dark:prose-invert max-w-none"
          contentEditable={true}
          onInput={handleContentChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
          style={{
            wordBreak: 'break-word'
          }}
        />
      </div>
      
      {/* Word Count */}
      <div className="text-xs text-right p-2 text-muted-foreground border-t border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-950/50 dark:to-orange-900/30">
        {wordCount}/{maxWords} Words{minWords > 0 ? ` (Min ${minWords} Words)` : ''}
      </div>
    </div>
  );
}