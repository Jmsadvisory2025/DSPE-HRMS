import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  description?: string;
}

export const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  multiple = false,
  selectedValues = [],
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  selectedValues?: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-1 ring-ring",
        )}
      >
        <span
          className={cn("truncate", !selectedOption && "text-muted-foreground")}
        >
          {loading
            ? "Loading..."
            : selectedOption
              ? selectedOption.label
              : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Search..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    if (!multiple) {
                      setIsOpen(false);
                      setSearchTerm("");
                    }
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    !multiple && value === opt.value && "bg-accent text-accent-foreground",
                    multiple && selectedValues.includes(opt.value) && "bg-accent/10"
                  )}
                >
                  {multiple && (
                    <div className={cn(
                      "mr-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                      selectedValues.includes(opt.value) 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-primary/50"
                    )}>
                      {selectedValues.includes(opt.value) && <Check className="h-3 w-3 font-bold" />}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate">{opt.label}</div>
                    {opt.description && (
                      <div className="truncate text-xs opacity-70 mt-0.5">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {!multiple && value === opt.value && (
                    <Check className="ml-2 h-4 w-4 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
