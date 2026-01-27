"use client";

import CountrySelect from "../components/CountrySelect";
import ProductTypeSelect from "../components/ProductTypeSelect";
import PriceRange from "../components/PriceRange";
import SubmitButton from "../components/SubmitButton";
import { useState } from "react";
import { handleCountryChange } from "../utils/countrySelect";
import { toast } from "react-hot-toast";

export default function Home() {
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [country, setCountry] = useState<{ code: string; name: string } | null>(null);
  const [productType, setProductType] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const onCountryChange = (selectedCountry: { code: string; name: string }) => {
    setCountry(selectedCountry);
    handleCountryChange(selectedCountry, setCurrencySymbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!country || !productType || !minPrice || !maxPrice){
      toast.error("Please fill all the fields");
      return;
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8 ">

      <div className="relative mx-auto max-w-7xl">

        <div className="mb-10 text-center px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Find Your Tech
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Search for the best deals on phones and laptops worldwide.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:flex lg:flex-row lg:items-end
          "
        >
          <div className="w-full lg:w-64 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1">
              Region
            </label>
            <CountrySelect onChange={onCountryChange} />
          </div>

          <div className="w-full lg:w-48">
            <ProductTypeSelect onChange={setProductType} />
          </div>
          <div className="w-full sm:col-span-2 lg:flex-1">
            <PriceRange
              currencySymbol={currencySymbol}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
            />
          </div>

          <div className="w-full sm:col-span-2 lg:w-48">
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
