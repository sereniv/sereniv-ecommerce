import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Entity } from "@/lib/types/entity"; 
import { PlusIcon, XIcon, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { BalanceSheetRow } from "@/lib/types/entity";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "./ui/textarea";
import { useUserAgent } from "@/lib/hooks/use-user-agent";

function BalanceSheetDetails({ formData, setFormData, formErrors }: { 
  formData: Entity, 
  setFormData: (data: Entity) => void,
  formErrors: Record<string, string>
}) {
  const { toast } = useToast();
  // Get user agent info at component level
  const { isWindows } = useUserAgent();

  const [newBalanceSheet, setNewBalanceSheet] = useState<BalanceSheetRow>({
    date: "",
    btcBalance: 0,
    change: 0,
    costBasis: 0,
    marketPrice: 0,
    stockPrice: 0,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempBalanceSheet, setTempBalanceSheet] = useState<BalanceSheetRow>({
    date: "",
    btcBalance: 0,
    change: 0,
    costBasis: 0,
    marketPrice: 0,
    stockPrice: 0,
  });

  const [bulkImportText, setBulkImportText] = useState("");
  
  const validateBalanceSheet = (balanceSheet: BalanceSheetRow): string | null => {
    if (!balanceSheet.date.trim()) {
      return "Date is required";
    }
    if (balanceSheet.btcBalance <= 0) {
      return "BTC Balance must be greater than 0";
    }
    if (balanceSheet.costBasis < 0) {
      return "Cost Basis cannot be negative";
    }
    if (balanceSheet.marketPrice < 0) {
      return "Market Price cannot be negative";
    }
    if (balanceSheet.stockPrice < 0) {
      return "Stock Price cannot be negative";
    }
    return null;
  };

  const parseDate = (dateStr: string): string => {
    if (!dateStr || dateStr === '—' || dateStr.trim() === '' || dateStr === '—\n') return '';
    
    const cleanedDate = dateStr.trim().replace(/\n/g, '').replace(/—/g, '');
    if (!cleanedDate) return '';
    
    try {
      let date: Date;
      
      if (cleanedDate.includes(',')) {
        date = new Date(cleanedDate + ' 12:00:00'); 
      } else if (cleanedDate.includes('/')) {
        date = new Date(cleanedDate + ' 12:00:00');
      } else if (cleanedDate.includes('-')) {
        date = new Date(cleanedDate + 'T12:00:00'); 
      } else {
        date = new Date(cleanedDate + ' 12:00:00');
      }
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const parseNumber = (value: string): number => {
    if (!value || value === '—' || value.trim() === '' || value === '—\n' || value.trim() === '—') return 0;
    
    let cleaned = value.toString().trim()
      .replace(/\n/g, '') 
      .replace(/—/g, '') 
      .replace(/\$/g, '') 
      .replace(/,/g, '') 
      .replace(/\s+/g, '') 
      .replace(/^\+/, ''); 
    
    if (!cleaned || cleaned === '') return 0;
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Parser for macOS clipboard format (tab-separated values on single lines)
  const parseMacOSBulkData = (text: string): BalanceSheetRow[] => {
    if (!text || !text.trim()) return [];
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const entries: BalanceSheetRow[] = [];
    
    const headerKeywords = ['date', 'btc', 'balance', 'change', 'cost', 'basis', 'market', 'price', 'stock'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
        
      if (headerKeywords.some(keyword => lowerLine.includes(keyword)) && 
          !lowerLine.match(/^\w{3}\s+\d{1,2},\s+\d{4}/)) {
        continue;
      }
      
      if (!line || line.match(/^[—\-\s]*$/)) {
        continue;
      }
      
      let parts: string[] = [];
      
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim()).filter(p => p);
      }
      
      if (parts.length < 3) {
        parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p);
      }
      
      if (parts.length < 3) {
        const dateMatch = line.match(/^(\w{3}\s+\d{1,2},\s+\d{4})/);
        if (dateMatch) {
          const restOfLine = line.substring(dateMatch[0].length).trim();
          const restParts = restOfLine.split(/[\s\t]+/).filter(p => p.trim());
          parts = [dateMatch[0], ...restParts];
        } else {
          parts = line.split(/\s+/).filter(p => p.trim());
        }
      }
      
      if (parts.length >= 2) {
        const potentialDate = parseDate(parts[0]);
        const potentialBtcBalance = parseNumber(parts[1]);
        
        if (potentialDate && potentialBtcBalance > 0) {
          const entry: BalanceSheetRow = {
            date: potentialDate,
            btcBalance: potentialBtcBalance,
            change: parts[2] ? parseNumber(parts[2]) : 0,
            costBasis: parts[3] ? parseNumber(parts[3]) : 0,
            marketPrice: parts[4] ? parseNumber(parts[4]) : 0,
            stockPrice: parts[5] ? parseNumber(parts[5]) : 0,
          };
          
          entries.push(entry);
        }
      }
    }
    
    return entries;
  };

  // Parser for Windows clipboard format (values can be on separate lines)
  const parseWindowsBulkData = (text: string): BalanceSheetRow[] => {
    if (!text || !text.trim()) return [];
    
    // Normalize line breaks
    const normalizedText = text.replace(/\r\n/g, '\n');
    const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line);
    const entries: BalanceSheetRow[] = [];
    const headerKeywords = ['date', 'btc', 'balance', 'change', 'cost', 'basis', 'market', 'price', 'stock'];
    
    // Collect entries by looking for date patterns
    let currentValues: string[] = [];
    let valueCount = 0;
    // We now handle both 5-column (no cost basis) and 6-column formats
    const minValueCount = 5; // Date, BTC balance, change, market price, stock price
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Skip header lines
      if (headerKeywords.some(keyword => lowerLine.includes(keyword)) && 
          !lowerLine.match(/^\w{3}\s+\d{1,2},\s+\d{4}/)) {
        continue;
      }
      
      // Skip empty or separator lines that only contain dashes
      if (!line || line === '—' || line.match(/^[\-\s]*$/)) {
        continue;
      }
      
      // Check if this line starts with a date (beginning of new entry)
      const isDateLine = !!line.match(/^\w{3}\s+\d{1,2},\s+\d{4}/);
      
      // If we find a new date and already have values, process the previous entry
      if (isDateLine && currentValues.length > 0) {
        // Process the collected values
        processWindowsValues(currentValues, entries);
        currentValues = [];
        valueCount = 0;
      }
      
      // Add this line to our current values
      currentValues.push(line);
      valueCount++;
      
      // If we've collected enough values or if the next line is a date, process this entry
      if (valueCount >= minValueCount || 
          (i + 1 < lines.length && !!lines[i + 1].match(/^\w{3}\s+\d{1,2},\s+\d{4}/))) {
        processWindowsValues(currentValues, entries);
        currentValues = [];
        valueCount = 0;
      }
    }
    
    // Process any remaining values
    if (currentValues.length > 0) {
      processWindowsValues(currentValues, entries);
    }
    
    return entries;
  };
  
  // Helper function to process collected values for Windows format
  const processWindowsValues = (values: string[], entries: BalanceSheetRow[]) => {
    // First, find the date (should be the first value)
    let dateValue = '';
    let btcBalance = 0;
    let change = 0;
    let costBasis = 0;
    let marketPrice = 0;
    let stockPrice = 0;
    
    // Count how many dollar values we have to determine if we have cost basis
    let dollarValueCount = 0;
    let dollarValues: number[] = [];
    
    // First pass: collect all dollar values and count them
    for (const value of values) {
      if (value.includes('$')) {
        // Extract all dollar values from this line
        const matches = value.match(/\$[\d,]+/g) || [];
        for (const match of matches) {
          dollarValues.push(parseNumber(match));
        }
        dollarValueCount += matches.length;
      }
    }
    
    // Find the date (first value that matches date pattern)
    for (let i = 0; i < values.length; i++) {
      const dateMatch = values[i].match(/^(\w{3}\s+\d{1,2},\s+\d{4})/);
      if (dateMatch) {
        dateValue = dateMatch[0];
        
        // Extract BTC balance, change from the same line if they exist
        const restOfLine = values[i].substring(dateMatch[0].length).trim();
        if (restOfLine) {
          const parts = restOfLine.split(/\s+/).filter(p => p.trim());
          if (parts.length > 0) btcBalance = parseNumber(parts[0]);
          if (parts.length > 1) change = parseNumber(parts[1]);
        }
        break;
      }
    }
    
    if (!dateValue) return;
    
    const date = parseDate(dateValue);
    if (!date) return;
    
    // If no BTC balance found in the date line, look for it in other lines
    if (btcBalance === 0) {
      for (let i = 0; i < values.length; i++) {
        const line = values[i];
        if (!line.includes('$') && !line.match(/^\w{3}\s+\d{1,2},\s+\d{4}/) && !line.match(/^[\-\s\u2014]*$/)) {
          const num = parseNumber(line);
          if (num > 0) {
            if (btcBalance === 0) btcBalance = num;
            else if (change === 0) change = num;
            break;
          }
        }
      }
    }
    
    // If still no valid BTC balance, can't create an entry
    if (btcBalance <= 0) return;
    
    // Now assign the dollar values based on how many we found
    if (dollarValues.length === 0) {
      // No dollar values found
      costBasis = 0;
      marketPrice = 0;
      stockPrice = 0;
    } else if (dollarValues.length === 1) {
      // If only one dollar value, it's the market price
      costBasis = 0;
      marketPrice = dollarValues[0];
      stockPrice = 0;
    } else if (dollarValues.length === 2) {
      // If two dollar values, first is cost basis, second is market price
      costBasis = dollarValues[0];
      marketPrice = dollarValues[1];
      stockPrice = 0;
    } else if (dollarValues.length >= 3) {
      // If three or more dollar values, assign them in order
      costBasis = dollarValues[0];
      marketPrice = dollarValues[1];
      stockPrice = dollarValues[2];
    }
    
    // Special case: if one value is significantly larger (likely in millions), it's probably cost basis
    for (const value of dollarValues) {
      if (value > 1000000) {
        costBasis = value;
        // Remove this value from the array
        const index = dollarValues.indexOf(value);
        if (index > -1) {
          dollarValues.splice(index, 1);
        }
        // Reassign remaining values
        if (dollarValues.length > 0) {
          marketPrice = dollarValues[0];
        }
        if (dollarValues.length > 1) {
          stockPrice = dollarValues[1];
        }
        break;
      }
    }
    
    // Create and add the entry
    const entry: BalanceSheetRow = {
      date,
      btcBalance,
      change,
      costBasis,
      marketPrice,
      stockPrice
    };
    
    entries.push(entry);
  };
  
  // Main parser function that detects format and calls the appropriate parser
  const parseBulkData = (text: string): BalanceSheetRow[] => {
    // Use the platform detection that was done at component level
    return isWindows ? parseWindowsBulkData(text) : parseMacOSBulkData(text);
  };

  const importBulkData = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "No Data",
        description: "Please paste some data to import",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedEntries = parseBulkData(bulkImportText);
      
      if (parsedEntries.length === 0) {
        toast({
          title: "No Valid Entries",
          description: "Could not parse any valid entries from the pasted data",
          variant: "destructive",
        });
        return;
      }

      const validEntries: BalanceSheetRow[] = [];
      const errors: string[] = [];

      for (let i = 0; i < parsedEntries.length; i++) {
        const entry = parsedEntries[i];
        const validationError = validateBalanceSheet(entry);
        
        if (validationError) {
          errors.push(`Row ${i + 1}: ${validationError}`);
        } else {
          const isDuplicate = formData.balanceSheet?.some(existing => existing.date === entry.date) ||
                             validEntries.some(valid => valid.date === entry.date);
          
          if (isDuplicate) {
            errors.push(`Row ${i + 1}: Duplicate date ${entry.date}`);
          } else {
            validEntries.push(entry);
          }
        }
      }

      if (errors.length > 0 && validEntries.length === 0) {
        toast({
          title: "Import Failed",
          description: `All entries have errors:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`,
          variant: "destructive",
        });
        return;
      }

      if (validEntries.length > 0) {
        const allEntries = [...(formData.balanceSheet || []), ...validEntries];
        
        allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setFormData({
          ...formData,
          balanceSheet: allEntries,
        });

        setBulkImportText("");

        toast({
          title: "Import Successful",
          description: `${validEntries.length} entries imported successfully${errors.length > 0 ? `. ${errors.length} entries skipped due to errors.` : ''}`,
        });
      }

      if (errors.length > 0 && validEntries.length > 0) {
        console.warn("Import errors:", errors);
      }

    } catch (error) {
      
      toast({
        title: "Parse Error",
        description: `Failed to parse the pasted data. Please check the format. ${error}`,
        variant: "destructive",
      });
    }
  };

  const addBalanceSheet = () => {
    const validationError = validateBalanceSheet(newBalanceSheet);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = formData.balanceSheet?.some(balanceSheet => balanceSheet.date === newBalanceSheet.date);
    if (isDuplicate) {
      toast({
        title: "Duplicate Entry",
        description: "A balance sheet entry for this date already exists",
        variant: "destructive",
      });
      return;
    }

    const allEntries = [...(formData.balanceSheet || []), newBalanceSheet];
    
    allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setFormData({
      ...formData,
      balanceSheet: allEntries,
    });

    setNewBalanceSheet({
      date: "",
      btcBalance: 0,
      change: 0,
      costBasis: 0,
      marketPrice: 0,
      stockPrice: 0,
    });

    toast({
      title: "Balance Sheet Added",
      description: "Balance sheet entry has been added successfully",
    });
  };

  const removeBalanceSheet = (index: number) => {
    const balanceSheet = [...(formData.balanceSheet || [])];
    const removedBalanceSheet = balanceSheet[index];
    balanceSheet.splice(index, 1);
    setFormData({ ...formData, balanceSheet });

    toast({
      title: "Balance Sheet Removed",
      description: `Entry for "${removedBalanceSheet.date}" has been removed`,
    });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempBalanceSheet({ ...formData.balanceSheet![index] });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const validationError = validateBalanceSheet(tempBalanceSheet);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = formData.balanceSheet?.some((balanceSheet, index) => 
      balanceSheet.date === tempBalanceSheet.date && index !== editingIndex
    );
    if (isDuplicate) {
      toast({
        title: "Duplicate Entry",
        description: "A balance sheet entry for this date already exists",
        variant: "destructive",
      });
      return;
    }

    const balanceSheet = [...(formData.balanceSheet || [])];
    balanceSheet[editingIndex] = tempBalanceSheet;

    balanceSheet.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setFormData({ ...formData, balanceSheet });

    setEditingIndex(null);
    setTempBalanceSheet({ date: "", btcBalance: 0, change: 0, costBasis: 0, marketPrice: 0, stockPrice: 0 });

    toast({
      title: "Balance Sheet Updated",
      description: "Balance sheet entry has been updated successfully",
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setTempBalanceSheet({ date: "", btcBalance: 0, change: 0, costBasis: 0, marketPrice: 0, stockPrice: 0 });
  };

  const clearAllBalanceSheets = () => {
    const count = formData.balanceSheet?.length || 0;
    setFormData({ ...formData, balanceSheet: [] });
    
    toast({
      title: "All Balance Sheets Cleared",
      description: `${count} balance sheet entries have been removed`,
    });
  };

  const updateNewBalanceSheet = (field: keyof BalanceSheetRow, value: string | number) => {
    setNewBalanceSheet(prev => ({
      ...prev,
      [field]: field === 'date' ? value as string : Number(value)
    }));
  };

  const updateExistingBalanceSheet = (field: keyof BalanceSheetRow, value: string | number) => {
    setTempBalanceSheet(prev => ({
      ...prev,
      [field]: field === 'date' ? value as string : Number(value)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-orange-800 dark:text-orange-200">Add Balance Sheet Entry</h3>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mb-6">
                            Add balance sheet details for tracking financial data over time.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <DatePicker
                                    date={newBalanceSheet.date ? new Date(newBalanceSheet.date) : undefined}
                                    setDate={(date: Date | undefined) => updateNewBalanceSheet('date', date?.toISOString() || "")}
                                    className="h-12"
                                />
                            </div>
                
                            <div>
                              <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                BTC Balance <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="e.g. 1.5"
                                value={newBalanceSheet.btcBalance || ""}
                                onChange={(e) => updateNewBalanceSheet('btcBalance', e.target.value)}
                                className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                                type="number"
                                step="0.00000001"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Change
                              </label>
                              <Input
                                placeholder="e.g. 0.1"
                                value={newBalanceSheet.change || ""}
                                onChange={(e) => updateNewBalanceSheet('change', e.target.value)}
                                className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                                type="number"
                                step="0.00000001"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Cost Basis ($)
                              </label>
                              <Input
                                placeholder="e.g. 50000"
                                value={newBalanceSheet.costBasis || ""}
                                onChange={(e) => updateNewBalanceSheet('costBasis', e.target.value)}
                                className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                                type="number"
                                step="0.01"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Market Price ($)
                              </label>
                              <Input
                                placeholder="e.g. 65000"
                                value={newBalanceSheet.marketPrice || ""}
                                onChange={(e) => updateNewBalanceSheet('marketPrice', e.target.value)}
                                className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                                type="number"
                                step="0.01"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2 block">
                                Stock Price ($)
                              </label>
                              <Input
                                placeholder="e.g. 150"
                                value={newBalanceSheet.stockPrice || ""}
                                onChange={(e) => updateNewBalanceSheet('stockPrice', e.target.value)}
                                className="h-12 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                                type="number"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={addBalanceSheet}
                            className="w-full mt-6 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
                            disabled={!newBalanceSheet.date || !newBalanceSheet.btcBalance}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Balance Sheet Entry
                          </Button>
                    </div>
                </div>

                  {/* Bulk Import Section */}
                <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm shadow-xl p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 transition-transform duration-700" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200/50 dark:from-orange-800 dark:to-orange-700/30 border border-orange-200 dark:border-orange-700 shadow-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-orange-800 dark:text-orange-200">Bulk Import Balance Sheet Data</h3>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                            Copy and paste tabular data from spreadsheets. Expected format: Date, BTC Balance, Change, Cost Basis, Market Price, Stock Price (separated by tabs or spaces).
                        </p>

                        <Textarea
                            placeholder={`Paste your data here, for example:
Mar 27, 2025	198,012	-97	—	$87,230	—
Dec 04, 2024	198,109	+9,800	—	$96,503	—
Nov 05, 2024	208,109	+4,870	—	$68,984	—

Or tab-separated values from spreadsheets:
Jun 16, 2025	592,100	+10,100	$41,840,000,000	$105,465	$150`}
                            value={bulkImportText}
                            onChange={(e) => setBulkImportText(e.target.value)}
                            className="min-h-[120px] border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300 font-mono text-sm"
                        />

                        <div className="flex gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={importBulkData}
                                disabled={!bulkImportText.trim()}
                                className="border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                Import Data
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setBulkImportText("")}
                                disabled={!bulkImportText.trim()}
                                className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                            >
                                Clear
                            </Button>
                        </div>

                        <div className="mt-4 p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/30 dark:border-orange-800/30">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Supported formats:</p>
                            <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-0.5">
                                <li>• Tab-separated values (copy from Excel/Google Sheets)</li>
                                <li>• Space-separated values with multiple spaces</li>
                                <li>• Dates: "Mar 27, 2025", "06/16/2025", "2025-06-16"</li>
                                <li>• Numbers: Can include commas, $ signs, + symbols, or "—" for empty</li>
                                <li>• Missing values: Use "—" or leave empty</li>
                                <li>• Headers: Will be automatically skipped</li>
                                <li>• Minimum required: Date and BTC Balance</li>
                            </ul>
                        </div>
                    </div>
                </div>

        {formData.balanceSheet && formData.balanceSheet.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-foreground">Balance Sheet Entries ({formData.balanceSheet.length})</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllBalanceSheets}
                className="border-red-200/50 dark:border-red-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            {formData.balanceSheet.map((balanceSheet: BalanceSheetRow, index: number) => (
              <div key={index} className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg p-4">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-8 translate-x-8 transition-transform duration-700" />
                <div className="relative">
                  {editingIndex === index ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Date"
                          value={tempBalanceSheet.date}
                          onChange={(e) => updateExistingBalanceSheet('date', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="date"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          BTC Balance <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g. 1.5"
                          value={tempBalanceSheet.btcBalance || ""}
                          onChange={(e) => updateExistingBalanceSheet('btcBalance', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="number"
                          step="0.00000001"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Change
                        </label>
                        <Input
                          placeholder="e.g. 0.1"
                          value={tempBalanceSheet.change || ""}
                          onChange={(e) => updateExistingBalanceSheet('change', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="number"
                          step="0.00000001"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Cost Basis ($)
                        </label>
                        <Input
                          placeholder="e.g. 50000"
                          value={tempBalanceSheet.costBasis || ""}
                          onChange={(e) => updateExistingBalanceSheet('costBasis', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Market Price ($)
                        </label>
                        <Input
                          placeholder="e.g. 65000"
                          value={tempBalanceSheet.marketPrice || ""}
                          onChange={(e) => updateExistingBalanceSheet('marketPrice', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Stock Price ($)
                        </label>
                        <Input
                          placeholder="e.g. 150"
                          value={tempBalanceSheet.stockPrice || ""}
                          onChange={(e) => updateExistingBalanceSheet('stockPrice', e.target.value)}
                          className="h-10 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div className="md:col-span-2 flex gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={saveEdit}
                          size="sm"
                          variant="default"
                          disabled={!tempBalanceSheet.date || !tempBalanceSheet.btcBalance}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
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
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-medium text-foreground">{new Date(balanceSheet.date).toLocaleDateString()}</h4>
                          <span className="text-xs bg-orange-100/20 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded border border-orange-200/50 dark:border-orange-800/50">Balance Sheet</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">BTC Balance:</span>
                            <div className="font-medium">{balanceSheet.btcBalance} BTC</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Change:</span>
                            <div className={`font-medium ${balanceSheet.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {balanceSheet.change >= 0 ? '+' : ''}{balanceSheet.change} BTC
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost Basis:</span>
                            <div className="font-medium">{formatCurrency(balanceSheet.costBasis)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Market Price:</span>
                            <div className="font-medium">{formatCurrency(balanceSheet.marketPrice)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stock Price:</span>
                            <div className="font-medium">{formatCurrency(balanceSheet.stockPrice)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Market Value:</span>
                            <div className="font-medium text-green-600">
                              {formatCurrency(balanceSheet.btcBalance * balanceSheet.marketPrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(index)}
                          className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                          aria-label="Edit balance sheet entry"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBalanceSheet(index)}
                          className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                          aria-label="Delete balance sheet entry"
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
              <p>No Balance Sheet Entries added yet</p>
              <p className="text-sm mt-1">Add balance sheet details to track your financial data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BalanceSheetDetails;