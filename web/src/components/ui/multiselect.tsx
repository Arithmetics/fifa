import * as React from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface MultiselectOption {
  title: string;
  flag: string | null;
}

export interface MultiselectProps {
  options: MultiselectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
  maxSelection?: number;
}

export function Multiselect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  maxHeight = "max-h-64",
  maxSelection,
}: MultiselectProps) {
  const handleToggle = (optionTitle: string) => {
    if (selected.includes(optionTitle)) {
      onChange(selected.filter((item) => item !== optionTitle));
    } else {
      if (maxSelection && selected.length >= maxSelection) {
        return; // Don't allow selection if at max
      }
      onChange([...selected, optionTitle]);
    }
  };

  const isAtMax = maxSelection !== undefined && selected.length >= maxSelection;

  return (
    <div className="space-y-2">
      {maxSelection && (
        <div className="text-xs text-muted-foreground">
          {selected.length} / {maxSelection} selected
        </div>
      )}
      <div
        className={cn(
          "border rounded-md p-2 overflow-y-auto bg-background",
          maxHeight
        )}
        style={{
          backgroundColor: "rgb(22, 24, 28)",
          borderTopColor: "rgb(68, 68, 71)",
          borderTopWidth: "1px",
        }}
      >
        {options.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">{placeholder}</div>
        ) : (
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selected.includes(option.title);
              const isDisabled = !isSelected && isAtMax;

              return (
                <div key={option.title} className="flex items-center space-x-2">
                  <Checkbox
                    id={`multiselect-${option.title}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.title)}
                    disabled={isDisabled}
                  />
                  <Label
                    htmlFor={`multiselect-${option.title}`}
                    className={cn(
                      "text-sm font-normal cursor-pointer flex-1 flex items-center gap-2",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.flag && <span>{option.flag}</span>}
                    <span>{option.title}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

