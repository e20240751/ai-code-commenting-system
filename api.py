from dotenv import load_dotenv
import os
import sys

def main():
    """Main function to check API key configuration."""
    try:
        # Load the .env file
        load_dotenv()
        
        # Access the API key
        api_key = os.getenv("OPENAI_API_KEY")
        
        if api_key:
            print("✅ API Key loaded successfully")
            print(f"🔑 Key length: {len(api_key)} characters")
            print("🚀 Ready to use OpenAI API")
            return True
        else:
            print("❌ API Key not found")
            print("💡 Please check your .env file or environment variables")
            print("📝 Make sure OPENAI_API_KEY is set")
            return False
            
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
