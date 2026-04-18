#!/usr/bin/env python3
"""
Script to add missing user relationships to all models with user_id foreign keys.
This ensures SQLAlchemy mapper initialization succeeds.
"""

import os
import re
from pathlib import Path

# Models that need user relationships added
MODELS_TO_FIX = {
    'application.py': [
        ('UserApplication', 'user = relationship("User", back_populates="applications")'),
        ('OpportunityWatchlist', 'user = relationship("User", back_populates="watchlist_items")'),
        ('ApplicationDocument', 'user = relationship("User", back_populates="application_documents")'),
        ('ApplicationDeadlineReminder', 'user = relationship("User", back_populates="deadline_reminders")'),
    ],
    'sprint.py': [
        ('UserSprint', 'user = relationship("User", back_populates="sprints")'),
        ('ReadinessAssessment', 'user = relationship("User", back_populates="readiness_assessments")'),
        ('GapAnalysis', 'user = relationship("User", back_populates="gap_analyses")'),
        ('SprintActivityLog', 'user = relationship("User", back_populates="sprint_activities")'),
    ],
    'document.py': [
        ('Document', 'user = relationship("User", back_populates="documents")'),
        ('PolishRequest', 'user = relationship("User", back_populates="polish_requests")'),
    ],
    'marketplace.py': [
        ('ProviderProfile', 'user = relationship("User", back_populates="provider_profile")'),
    ],
    'companion.py': [
        ('Companion', 'user = relationship("User", back_populates="companion")'),
    ],
}

def add_relationship_to_model(file_path: Path, model_name: str, relationship_line: str):
    """Add a relationship to a model class if it doesn't already exist."""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if relationship already exists
    if 'user = relationship' in content and model_name in content:
        print(f"  ✓ {model_name} already has user relationship")
        return False
    
    # Find the model class
    class_pattern = rf'class {model_name}\(Base\):.*?(?=\nclass |\Z)'
    match = re.search(class_pattern, content, re.DOTALL)
    
    if not match:
        print(f"  ✗ Could not find class {model_name}")
        return False
    
    class_content = match.group(0)
    class_start = match.start()
    class_end = match.end()
    
    # Find the last line before the next class or end of file
    # Look for the last mapped_column or Column definition
    lines = class_content.split('\n')
    
    # Find where to insert (after last field definition, before next class)
    insert_index = -1
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i].strip()
        if 'mapped_column' in line or 'Column(' in line or 'created_at' in line or 'updated_at' in line:
            insert_index = i + 1
            break
    
    if insert_index == -1:
        print(f"  ✗ Could not find insertion point for {model_name}")
        return False
    
    # Check if there's already a relationships comment
    has_relationships_comment = any('# Relationships' in line for line in lines)
    
    if not has_relationships_comment:
        lines.insert(insert_index, '')
        lines.insert(insert_index + 1, '    # Relationships')
        insert_index += 2
    else:
        # Find the relationships section
        for i, line in enumerate(lines):
            if '# Relationships' in line:
                insert_index = i + 1
                break
    
    lines.insert(insert_index, f'    {relationship_line}')
    
    # Reconstruct the class
    new_class_content = '\n'.join(lines)
    
    # Replace in original content
    new_content = content[:class_start] + new_class_content + content[class_end:]
    
    # Write back
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    print(f"  ✓ Added user relationship to {model_name}")
    return True

def main():
    models_dir = Path(__file__).parent.parent / 'app' / 'db' / 'models'
    
    print("Adding missing user relationships to models...")
    print("=" * 60)
    
    total_added = 0
    
    for filename, models in MODELS_TO_FIX.items():
        file_path = models_dir / filename
        
        if not file_path.exists():
            print(f"\n⚠️  {filename} not found")
            continue
        
        print(f"\n📄 {filename}")
        
        for model_name, relationship_line in models:
            if add_relationship_to_model(file_path, model_name, relationship_line):
                total_added += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Added {total_added} relationships")
    print("\nNext steps:")
    print("1. Update User model to add corresponding back_populates")
    print("2. Test mapper configuration")
    print("3. Run database seeds")

if __name__ == '__main__':
    main()
