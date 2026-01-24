interface PriceRangeProps {
    currencySymbol: string;
}

export default function PriceRange({ currencySymbol }: PriceRangeProps) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                Price Range
            </label>
            <div className="flex items-center gap-4">
                <div className="relative flex-1 group">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                        <span className="text-lg font-mono">{currencySymbol}</span>
                    </div>
                    <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                </div>
                <div className="text-zinc-600 font-medium">-</div>
                <div className="relative flex-1 group">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                        <span className="text-lg font-mono">{currencySymbol}</span>
                    </div>
                    <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                </div>
            </div>
        </div>
    );
}
