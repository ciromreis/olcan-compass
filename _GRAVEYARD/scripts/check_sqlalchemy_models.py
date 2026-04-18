#!/usr/bin/env python3
"""
SQLAlchemy Model Consistency Checker

Scans all model files for common SQLAlchemy 2.0 issues:
- Boolean fields missing nullable parameter
- server_default with lambda functions
- Type hint / nullable parameter mismatches
- Mutable defaults without callables

Usage:
    python scripts/check_sqlalchemy_models.py
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple


class Issue:
    def __init__(self, file: Path, line_num: int, line: str, issue_type: str, message: str):
        self.file = file
        self.line_num = line_num
        self.line = line.strip()
        self.issue_type = issue_type
        self.message = message

    def __str__(self):
        return f"{self.file}:{self.line_num} [{self.issue_type}]\n  {self.line}\n  → {self.message}\n"


def check_boolean_nullable(file: Path, lines: List[str]) -> List[Issue]:
    """Check for boolean fields missing nullable parameter"""
    issues = []
    
    # Pattern: Mapped[bool] = mapped_column(Boolean, ...) without nullable=False
    pattern = re.compile(
        r':\s*Mapped\[bool\]\s*=\s*mapped_column\(Boolean,\s*(?:.*?)(?!.*nullable=)'
    )
    
    for i, line in enumerate(lines, 1):
        # Skip if line already has nullable parameter
        if 'nullable=' in line:
            continue
            
        # Check if it's a non-nullable boolean without nullable parameter
        if 'Mapped[bool]' in line and 'mapped_column(Boolean' in line:
            # Make sure it's not Mapped[bool | None]
            if 'bool | None' not in line and 'Optional[bool]' not in line:
                issues.append(Issue(
                    file, i, line,
                    "BOOLEAN_NULLABLE",
                    "Non-nullable boolean field missing 'nullable=False' parameter"
                ))
    
    return issues


def check_server_default_lambda(file: Path, lines: List[str]) -> List[Issue]:
    """Check for server_default with lambda functions"""
    issues = []
    
    for i, line in enumerate(lines, 1):
        if 'server_default=lambda' in line or 'server_default = lambda' in line:
            issues.append(Issue(
                file, i, line,
                "SERVER_DEFAULT_LAMBDA",
                "Use 'default=' instead of 'server_default=' for Python callables"
            ))
    
    return issues


def check_type_hint_mismatch(file: Path, lines: List[str]) -> List[Issue]:
    """Check for type hint / nullable parameter mismatches"""
    issues = []
    
    for i, line in enumerate(lines, 1):
        # Check for Mapped[T | None] with nullable=False
        if ('| None' in line or 'Optional[' in line) and 'nullable=False' in line:
            issues.append(Issue(
                file, i, line,
                "TYPE_HINT_MISMATCH",
                "Optional type hint with nullable=False - these should match"
            ))
        
        # Check for Mapped[T] (non-optional) with nullable=True
        # This is trickier - we need to ensure it's not | None
        if 'Mapped[' in line and 'nullable=True' in line:
            if '| None' not in line and 'Optional[' not in line:
                # Extract the type to see if it looks non-optional
                mapped_match = re.search(r'Mapped\[([^\]]+)\]', line)
                if mapped_match:
                    type_content = mapped_match.group(1)
                    # Simple heuristic: if no None-related keywords, likely non-optional
                    if 'None' not in type_content:
                        issues.append(Issue(
                            file, i, line,
                            "TYPE_HINT_MISMATCH",
                            "Non-optional type hint with nullable=True - these should match"
                        ))
    
    return issues


def check_mutable_defaults(file: Path, lines: List[str]) -> List[Issue]:
    """Check for mutable defaults without callables"""
    issues = []
    
    # Pattern: default=[] or default={}
    mutable_patterns = [
        (r'default=\[\]', 'list'),
        (r'default=\{\}', 'dict'),
        (r'default=set\(\)', 'set'),
    ]
    
    for i, line in enumerate(lines, 1):
        for pattern, type_name in mutable_patterns:
            if re.search(pattern, line):
                issues.append(Issue(
                    file, i, line,
                    "MUTABLE_DEFAULT",
                    f"Use 'default={type_name}' (callable) instead of 'default={pattern}' (mutable)"
                ))
    
    return issues


def check_file(file: Path) -> List[Issue]:
    """Check a single model file for issues"""
    try:
        with open(file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {file}: {e}", file=sys.stderr)
        return []
    
    issues = []
    issues.extend(check_boolean_nullable(file, lines))
    issues.extend(check_server_default_lambda(file, lines))
    issues.extend(check_type_hint_mismatch(file, lines))
    issues.extend(check_mutable_defaults(file, lines))
    
    return issues


def main():
    # Find all model files
    models_dir = Path('apps/api/app/db/models')
    
    if not models_dir.exists():
        print(f"Error: Models directory not found: {models_dir}", file=sys.stderr)
        print("Run this script from the repository root.", file=sys.stderr)
        sys.exit(1)
    
    model_files = list(models_dir.glob('*.py'))
    model_files = [f for f in model_files if f.name != '__init__.py']
    
    print(f"Checking {len(model_files)} model files...\n")
    
    all_issues = []
    for file in sorted(model_files):
        issues = check_file(file)
        all_issues.extend(issues)
    
    if not all_issues:
        print("✅ No issues found! All models look good.")
        return 0
    
    # Group issues by type
    issues_by_type = {}
    for issue in all_issues:
        if issue.issue_type not in issues_by_type:
            issues_by_type[issue.issue_type] = []
        issues_by_type[issue.issue_type].append(issue)
    
    # Print summary
    print(f"⚠️  Found {len(all_issues)} issue(s):\n")
    
    for issue_type, issues in sorted(issues_by_type.items()):
        print(f"{'='*80}")
        print(f"{issue_type} ({len(issues)} issue(s))")
        print(f"{'='*80}\n")
        
        for issue in issues:
            print(issue)
    
    # Print recommendations
    print(f"{'='*80}")
    print("RECOMMENDATIONS")
    print(f"{'='*80}\n")
    
    if 'BOOLEAN_NULLABLE' in issues_by_type:
        print("• BOOLEAN_NULLABLE: Add 'nullable=False' to all non-nullable boolean fields")
        print("  Example: mapped_column(Boolean, default=False, nullable=False)\n")
    
    if 'SERVER_DEFAULT_LAMBDA' in issues_by_type:
        print("• SERVER_DEFAULT_LAMBDA: Change 'server_default=' to 'default=' for Python callables")
        print("  Example: default=lambda: datetime.now(timezone.utc)\n")
    
    if 'TYPE_HINT_MISMATCH' in issues_by_type:
        print("• TYPE_HINT_MISMATCH: Ensure type hints match nullable parameters")
        print("  Mapped[T] → nullable=False")
        print("  Mapped[T | None] → nullable=True\n")
    
    if 'MUTABLE_DEFAULT' in issues_by_type:
        print("• MUTABLE_DEFAULT: Use callables for mutable defaults")
        print("  Example: default=list instead of default=[]\n")
    
    print(f"See docs/reference/troubleshooting-sqlalchemy.md for detailed guidance.\n")
    
    return 1


if __name__ == '__main__':
    sys.exit(main())
