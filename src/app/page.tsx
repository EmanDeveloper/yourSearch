"use client";

import CountrySelect from "../components/CountrySelect";
import ProductTypeSelect from "../components/ProductTypeSelect";
import PriceRange from "../components/PriceRange";
import SubmitButton from "../components/SubmitButton";
import { useState } from "react";

export default function Home() {
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const handleCountryChange = (country: { code: string; name: string }) => {
    const code = country.code.toLowerCase();
    let symbol = "$";

    switch (code) {
      case "gb":
      case "uk":
        symbol = "£";
        break;
      case "pk":
        symbol = "Rs";
        break;
      case "in":
        symbol = "₹";
        break;
      case "fr":
      case "de":
      case "it":
      case "es":
      case "nl":
      case "be":
      case "pt":
      case "ie":
      case "gr":
      case "at":
      case "fi":
      case "sk":
      case "lu":
      case "si":
      case "mt":
      case "cy":
      case "ee":
      case "lv":
      case "lt":
        symbol = "€";
        break;
      default:
        symbol = "$";
    }

    setCurrencySymbol(symbol);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] px-4 py-8 text-zinc-100">

      {/* Glow effects */}
      <div className="absolute -top-24 -left-24 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Content Wrapper */}
      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 text-center px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            Find Your Tech
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Search for the best deals on phones and laptops worldwide.
          </p>
        </div>

        {/* Form */}
        <form
          className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:flex lg:flex-row lg:items-end
          "
        >
          {/* Country */}
          <div className="w-full lg:w-64 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
              Region
            </label>
            <CountrySelect onChange={handleCountryChange} />
          </div>

          {/* Product Type */}
          <div className="w-full lg:w-48">
            <ProductTypeSelect />
          </div>

          {/* Price Range */}
          <div className="w-full sm:col-span-2 lg:flex-1">
            <PriceRange currencySymbol={currencySymbol} />
          </div>

          {/* Submit Button */}
          <div className="w-full sm:col-span-2 lg:w-48">
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
