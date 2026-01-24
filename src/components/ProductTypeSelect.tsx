export default function ProductTypeSelect() {
    return (
        <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                Product Type
            </label>
            <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer group">
                    <input type="radio" name="type" value="phone" className="peer sr-only" />
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/30 peer-checked:bg-purple-500/10 peer-checked:border-purple-500/50 transition-all duration-300">
                        <div className="mb-2 text-zinc-400 peer-checked:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-300 peer-checked:text-white">Phone</span>
                    </div>
                </label>

                <label className="relative cursor-pointer group">
                    <input type="radio" name="type" value="laptop" className="peer sr-only" />
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/30 peer-checked:bg-blue-500/10 peer-checked:border-blue-500/50 transition-all duration-300">
                        <div className="mb-2 text-zinc-400 peer-checked:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" /></svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-300 peer-checked:text-white">Laptop</span>
                    </div>
                </label>
            </div>
        </div>
    );
}
