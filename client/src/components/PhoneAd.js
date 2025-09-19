import React, { useState, useEffect } from "react";
import { Phone, X } from "lucide-react";
import { loadAdConfig } from "../config/ads";

const PhoneAd = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [adConfig, setAdConfig] = useState(null);

  useEffect(() => {
    const config = loadAdConfig();
    setAdConfig(config.phoneAd);
  }, []);

  if (!isVisible || !adConfig || !adConfig.isEnabled) return null;

  const getPositionClasses = () => {
    switch (adConfig.position) {
      case "bottom-right":
        return "bottom-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      default:
        return "bottom-4 left-4";
    }
  };

  return (
    <div
      className={`fixed ${getPositionClasses()} bg-gradient-to-r ${
        adConfig.backgroundColor
      } text-white p-4 rounded-lg shadow-lg z-50 max-w-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span className="font-semibold">{adConfig.displayText}</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="text-sm">
        <p className="mb-1">{adConfig.description}</p>
        <a
          href={`tel:${adConfig.phoneNumber.replace(/[^\d+]/g, "")}`}
          className="font-bold text-lg hover:text-green-200 transition-colors"
        >
          📞 {adConfig.formattedPhoneNumber}
        </a>
      </div>
      <div className="mt-2 text-xs text-green-100">{adConfig.availability}</div>
    </div>
  );
};

export default PhoneAd;
