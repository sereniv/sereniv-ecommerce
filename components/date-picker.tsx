"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ date, setDate, className, placeholder = "Pick a date" }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 transition-all duration-300",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm shadow-xl">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="[&_.rdp-day_selected]:bg-orange-500 [&_.rdp-day_selected]:text-white [&_.rdp-day]:hover:bg-orange-50 dark:[&_.rdp-day]:hover:bg-orange-950/50 [&_.rdp-day]:hover:text-orange-700 dark:[&_.rdp-day]:hover:text-orange-300 [&_.rdp-nav_button]:hover:bg-orange-50 dark:[&_.rdp-nav_button]:hover:bg-orange-950/50 [&_.rdp-nav_button]:hover:text-orange-700 dark:[&_.rdp-nav_button]:hover:text-orange-300 [&_.rdp-head_cell]:text-orange-600 dark:[&_.rdp-head_cell]:text-orange-400 [&_.rdp-caption]:text-orange-800 dark:[&_.rdp-caption]:text-orange-200"
                />
            </PopoverContent>
        </Popover>
    );
}