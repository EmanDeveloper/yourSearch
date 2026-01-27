"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Smartphone, Laptop } from "lucide-react";

export default function ProductTypeSelect() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options = [
        { id: "phone", label: "Phone", icon: Smartphone },
        { id: "laptop", label: "Laptop", icon: Laptop },
    ];

    const selectedOption = options.find(opt => opt.id === selected);

    return (
        <div className="space-y-3 w-full" ref={dropdownRef}>
            <label className="text-xs font-semibold uppercase tracking-wider ml-1">
                Product Type
            </label>
            <div className="relative group">
                <input type="hidden" name="type" value={selected || ""} />

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full relative flex items-center justify-between border border-black/50 rounded-xl py-3.5 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all cursor-pointer text-left"
                >
                    <div className="flex items-center gap-3">
                        {selectedOption ? (
                            <>
                                <selectedOption.icon className="w-5 h-5 text-zinc-400" />
                                <span className="truncate">{selectedOption.label}</span>
                            </>
                        ) : (
                            <span className="text-zinc-500">Select type</span>
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full text-black border border-black/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        setSelected(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selected === option.id
                                        ? "bg-black/20 text-black"
                                        : "text-black hover:bg-black/5"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <option.icon className="w-4 h-4" />
                                        <span>{option.label}</span>
                                    </div>
                                    {selected === option.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
