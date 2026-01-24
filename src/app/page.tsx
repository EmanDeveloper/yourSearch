"use client"
import CountrySelect from '../components/CountrySelect';
import ProductTypeSelect from '../components/ProductTypeSelect';
import PriceRange from '../components/PriceRange';
import SubmitButton from '../components/SubmitButton';
import { useState } from 'react';


export default function Home() {
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const handleCountryChange = (country: { code: string; name: string }) => {
    const code = country.code.toLowerCase();
    let symbol = '$';

    switch (code) {
      case 'gb':
      case 'uk':
        symbol = '£';
        break;
      case 'pk':
        symbol = 'Rs';
        break;
      case 'in':
        symbol = '₹';
        break;
      case 'fr':
      case 'de':
      case 'it':
      case 'es':
      case 'nl':
      case 'be':
      case 'pt':
      case 'ie':
      case 'gr':
      case 'at':
      case 'fi':
      case 'sk':
      case 'lu':
      case 'si':
      case 'mt':
      case 'cy':
      case 'ee':
      case 'lv':
      case 'lt':
        symbol = '€';
        break;
      default:
        symbol = '$';
    }
    setCurrencySymbol(symbol);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-4 font-sans text-zinc-100 selection:bg-purple-500/30">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[#0a0a0a] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 shadow-2xl p-8">

          {/* Glow effects */}
          <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

          {/* Header */}
          <div className="relative mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
              Find Your Tech
            </h1>
            <p className="mt-2 text-zinc-400 text-sm">
              Search for the best deals on phones and laptops worldwide.
            </p>
          </div>

          <form className="relative space-y-8">
            {/* Country Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                Region
              </label>
              <CountrySelect onChange={handleCountryChange} />
            </div>

            {/* Product Type */}
            <ProductTypeSelect />

            {/* Price Range */}
            <PriceRange currencySymbol={currencySymbol} />

            {/* Submit Button */}
            <SubmitButton />

          </form>
        </div>
      </div>
    </main>
  );
}
