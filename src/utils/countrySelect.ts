export const handleCountryChange = (country: { code: string; name: string } , setCurrencySymbol: (symbol: string) => void) => {
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