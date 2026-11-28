import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

interface CustomSelectProps<T extends string = string> {
    value: T | "";
    options: SelectOption<T>[];
    placeholder?: string;
    onChange: (value: T) => void;
    ariaLabel?: string;
    className?: string;
}

export function CustomSelect<T extends string = string>({
    value,
    options,
    placeholder = "Select...",
    onChange,
    ariaLabel,
    className = "min-w-56",
}: CustomSelectProps<T>) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ left: 0, top: 0, width: 224 });

    const selectedOption = options.find((opt) => opt.value === value);

    const openMenu = () => {
        const trigger = triggerRef.current;
        const popover = popoverRef.current;
        if (!trigger || !popover) return;

        if (popover.matches(":popover-open")) {
            popover.hidePopover();
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const maxMenuHeight = 280;
        const openAbove = rect.bottom + maxMenuHeight + 8 > window.innerHeight && rect.top > maxMenuHeight;

        setCoords({
            left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 224) - 8)),
            top: openAbove ? Math.max(8, rect.top - maxMenuHeight - 6) : rect.bottom + 6,
            width: Math.max(rect.width, 224),
        });

        popover.showPopover();
    };

    useEffect(() => {
        if (!open) return;
        const popover = popoverRef.current;
        if (!popover) return;
        const activeBtn =
            popover.querySelector<HTMLButtonElement>('[aria-selected="true"]') ??
            popover.querySelector<HTMLButtonElement>("button");
        activeBtn?.focus({ preventScroll: true });
    }, [open]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
        const popover = popoverRef.current;
        if (!popover) return;
        const items = Array.from(popover.querySelectorAll<HTMLButtonElement>("button"));
        if (items.length === 0) return;

        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        let nextIndex = 0;
        if (e.key === "Home") nextIndex = 0;
        else if (e.key === "End") nextIndex = items.length - 1;
        else nextIndex = (current + (e.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;

        e.preventDefault();
        items[nextIndex]?.focus({ preventScroll: true });
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={openMenu}
                className={`flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/25 text-sm text-white focus:outline-none focus-visible:border-emerald-400 transition-colors cursor-pointer ${className}`}
            >
                <span className={`truncate ${selectedOption ? "text-white" : "text-neutral-400"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-150 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            <div
                ref={popoverRef}
                id={listboxId}
                role="listbox"
                popover="auto"
                aria-label={ariaLabel}
                onToggle={(e) => {
                    const isOpen = e.newState === "open";
                    setOpen(isOpen);
                    if (!isOpen) {
                        triggerRef.current?.focus({ preventScroll: true });
                    }
                }}
                onKeyDown={handleKeyDown}
                style={{
                    position: "fixed",
                    left: `${coords.left}px`,
                    top: `${coords.top}px`,
                    width: `${coords.width}px`,
                    inset: "unset",
                    margin: 0,
                }}
                className="max-h-72 overflow-y-auto rounded-xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 text-sm text-neutral-200"
            >
                <div className="flex flex-col gap-0.5">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    popoverRef.current?.hidePopover();
                                }}
                                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors focus:outline-none focus-visible:bg-white/10 cursor-pointer ${
                                    isSelected
                                        ? "bg-emerald-500/15 text-emerald-300 font-medium"
                                        : "hover:bg-white/10 text-neutral-200"
                                }`}
                            >
                                <span className="truncate">{option.label}</span>
                                {isSelected && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
