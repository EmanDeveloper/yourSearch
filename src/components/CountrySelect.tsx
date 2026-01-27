"use client";

import { useState, useRef, useEffect } from "react";
import { getData } from "country-list";
import { Search, ChevronDown, Check } from "lucide-react";

interface Country {
    code: string;
    name: string;
}

interface CountrySelectProps {
    onChange?: (country: Country) => void;
}

export default function CountrySelect({ onChange }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Country | null>(null);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const countries = getData().sort((a, b) => a.name.localeCompare(b.name));

    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative group" ref={dropdownRef}>
            {/* Hidden input for form submission */}
            <input type="hidden" name="country" value={selected?.code || ""} />

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full relative flex items-center justify-between border border-black/50 rounded-xl py-3.5 pl-4 pr-4  focus:ring-2 focus:ring-blue/50 focus:border-transparent transition-all cursor-pointer text-left"
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {selected ? (
                        <>
                            <img
                                src={`https://flagcdn.com/w40/${selected.code.toLowerCase()}.png`}
                                width="24"
                                alt={selected.name}
                                className="rounded-sm flex-shrink-0"
                            />
                            <span className="truncate block flex-1">
                                {selected.name}
                            </span>
                        </>
                    ) : (
                        <span className="truncate">
                            Select your country
                        </span>
                    )}
                </div>

                <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>


            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full border border-black/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Search Input */}
                    <div className="p-2 border-b border-black/5 sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 " />
                            <input
                                type="text"
                                placeholder="Search country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}     
                                className="w-full border border-black/5 rounded-lg py-2 pl-9 pr-3 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Country List */}
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent p-1">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {    
                                        setSelected(country);
                                        setIsOpen(false);
                                        setSearch("");
                                        if (onChange) {
                                            onChange(country);
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selected?.code === country.code
                                        ? "bg-blue-500/20 text-black-400"
                                        : "text-black-300 hover:bg-white/5"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                            width="20"
                                            alt={country.name}
                                            className="rounded-sm opacity-80"
                                        />
                                        <span>{country.name}</span>
                                    </div>
                                    {selected?.code === country.code && <Check className="w-4 h-4" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm ">
                                No country found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
