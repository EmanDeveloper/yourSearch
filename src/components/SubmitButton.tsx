export default function SubmitButton() {
    return (
        <button
            type="submit"
            className="w-full group relative overflow-hidden rounded-xl bg-white text-black font-bold py-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                Search Products
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </span>
        </button>
    );
}
