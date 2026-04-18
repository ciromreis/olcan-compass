#!/usr/bin/env python3
"""
SQLAlchemy Model Import Tester

Tests each model file individually to isolate import errors.
Useful for debugging when "from app.db.models import *" fails.

Usage:
    python scripts/test_model_imports.py
"""

import sys
import importlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))


def test_model_import(module_name: str) -> tuple[bool, str]:
    """
    Test importing a single model module.
    
    Returns:
        (success, error_message)
    """
    try:
        importlib.import_module(module_name)
        return True, ""
    except Exception as e:
        return False, str(e)


def main():
    # Model modules to test
    model_modules = [
        'app.db.models.user',
        'app.db.models.psychology',
        'app.db.models.route',
        'app.db.models.narrative',
        'app.db.models.interview',
        'app.db.models.application',
        'app.db.models.sprint',
        'app.db.models.prompt',
        'app.db.models.marketplace',
    ]
    
    print("Testing model imports...\n")
    print(f"{'Module':<40} {'Status':<10} {'Error'}")
    print("=" * 100)
    
    failed_modules = []
    
    for module in model_modules:
        success, error = test_model_import(module)
        
        if success:
            print(f"{module:<40} {'✅ PASS':<10}")
        else:
            print(f"{module:<40} {'❌ FAIL':<10} {error[:50]}...")
            failed_modules.append((module, error))
    
    print("=" * 100)
    
    if not failed_modules:
        print("\n✅ All model imports successful!")
        return 0
    
    print(f"\n❌ {len(failed_modules)} module(s) failed to import:\n")
    
    for module, error in failed_modules:
        print(f"\n{'='*80}")
        print(f"Module: {module}")
        print(f"{'='*80}")
        print(f"Error: {error}\n")
        
        # Extract file path from module name
        file_path = Path("apps/api") / f"{module.replace('.', '/')}.py"
        print(f"File: {file_path}")
        print(f"\nTo debug this specific file:")
        print(f"  docker compose run --rm api python -c \"from {module} import *\"")
        print()
    
    print(f"See docs/reference/troubleshooting-sqlalchemy.md for common issues and solutions.\n")
    
    return 1


if __name__ == '__main__':
    sys.exit(main())
