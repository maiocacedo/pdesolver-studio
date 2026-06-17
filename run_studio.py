"""Wrapper entry point to run the backend package from the root directory.

This allows PyInstaller to correctly resolve relative imports inside the backend package.
"""
import sys
from backend.main import main

if __name__ == "__main__":
    main()
