export default function SubmitButton() {
    return (
        <button
            type="submit"
            className="
                w-full h-[52px] 
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-semibold
                rounded-xl
                transition-all duration-300
                transform hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                cursor-pointer
            "
        >
            Search Products
        </button>
    );
}
