#!/usr/bin/env python3
"""
Environment setup script for Speech-to-Text API
This script helps you create a .env file from the example template
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Set up the environment file for the project"""
    print("🔧 Setting up Speech-to-Text API environment...")
    
    current_dir = Path(__file__).parent
    env_example = current_dir / "env.example"
    env_file = current_dir / ".env"
    
    # Check if .env already exists
    if env_file.exists():
        response = input("⚠️  .env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("❌ Setup cancelled.")
            return
    
    # Copy example to .env
    try:
        shutil.copy(env_example, env_file)
        print(f"✅ Created .env file from template")
        
        print("\n📋 Next steps:")
        print("1. Open backend/.env file in your editor")
        print("2. Replace the following placeholders with your actual values:")
        print("   - ASSEMBLY_API_KEY=your_assemblyai_api_key_here")
        print("   - SUPABASE_URL=https://your-project.supabase.co")
        print("   - SUPABASE_KEY=your_supabase_anon_key_here")
        
        print("\n🔗 Get your API keys from:")
        print("   • AssemblyAI: https://www.assemblyai.com/dashboard")
        print("   • Supabase: https://supabase.com/dashboard")
        
        print("\n⚡ To start the server:")
        print("   cd backend")
        print("   python fast_start.py")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return
    
    print("\n🎉 Environment setup complete!")

if __name__ == "__main__":
    setup_environment() 