// Advertisement configuration
export const adConfig = {
  phoneAd: {
    phoneNumber: "067205077",
    formattedPhoneNumber: "067205077",
    displayText: "Need Help?",
    description: "Call us for help or advertising opportunities!",
    availability: "Available for help and advertising inquiries",
    position: "bottom-left", // bottom-left, bottom-right, top-left, top-right
    backgroundColor: "from-green-500 to-green-600", // Tailwind gradient classes
    isEnabled: true,
  },
  // Add more ad configurations here
  bannerAd: {
    isEnabled: false,
    content: "Learn coding with our premium courses!",
    backgroundColor: "from-blue-500 to-blue-600",
  },
};

// Function to update phone number
export const updatePhoneNumber = (newNumber) => {
  adConfig.phoneAd.phoneNumber = newNumber;
  adConfig.phoneAd.formattedPhoneNumber = newNumber;
  localStorage.setItem("adConfig", JSON.stringify(adConfig));
};

// Function to load saved configuration
export const loadAdConfig = () => {
  const savedConfig = localStorage.getItem("adConfig");
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig);
    Object.assign(adConfig, parsed);
  }
  return adConfig;
};
