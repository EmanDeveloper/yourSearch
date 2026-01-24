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
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                Product Type
            </label>
            <div className="relative group">
                <input type="hidden" name="type" value={selected || ""} />

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full relative flex items-center justify-between bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all cursor-pointer text-left"
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
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                                        ? "bg-purple-500/20 text-purple-400"
                                        : "text-zinc-300 hover:bg-white/5"
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
