import React, { useState, useEffect } from "react";
import { Settings, Save, Phone, Eye, EyeOff } from "lucide-react";
import { adConfig, updatePhoneNumber, loadAdConfig } from "../config/ads";

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(adConfig);
  const [phoneNumber, setPhoneNumber] = useState("067205077");

  useEffect(() => {
    const savedConfig = loadAdConfig();
    setConfig(savedConfig);
    setPhoneNumber(savedConfig.phoneAd.phoneNumber);
  }, []);

  const handleSave = () => {
    const updatedConfig = {
      ...config,
      phoneAd: {
        ...config.phoneAd,
        phoneNumber: phoneNumber,
        formattedPhoneNumber: phoneNumber,
      },
    };

    updatePhoneNumber(phoneNumber);
    setConfig(updatedConfig);
    localStorage.setItem("adConfig", JSON.stringify(updatedConfig));

    // Reload the page to update the phone ad
    window.location.reload();
  };

  const togglePhoneAd = () => {
    const updatedConfig = {
      ...config,
      phoneAd: {
        ...config.phoneAd,
        isEnabled: !config.phoneAd.isEnabled,
      },
    };
    setConfig(updatedConfig);
    localStorage.setItem("adConfig", JSON.stringify(updatedConfig));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Admin Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Admin Panel</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Phone Ad Settings */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Advertisement
              </h4>
              <button
                onClick={togglePhoneAd}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                  config.phoneAd.isEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {config.phoneAd.isEnabled ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="067205077"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Text
                </label>
                <input
                  type="text"
                  value={config.phoneAd.displayText}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      phoneAd: {
                        ...config.phoneAd,
                        displayText: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={config.phoneAd.description}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      phoneAd: {
                        ...config.phoneAd,
                        description: e.target.value,
                      },
                    });
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={config.phoneAd.position}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      phoneAd: { ...config.phoneAd, position: e.target.value },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Changes will be applied immediately and saved locally.
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
