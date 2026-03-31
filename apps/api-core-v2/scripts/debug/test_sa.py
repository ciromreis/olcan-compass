import traceback
import sys

# Monkey patch dict scan
import sqlalchemy.orm.decl_base as decl_base
original_extract = decl_base._MapperConfig._extract_mappable_attributes
def print_keys(self):
    print(f"Scanning class: {self.cls.__name__}")
    try:
        dict_ = self.cls.__dict__
        for k, v in dict_.items():
            if type(v).__name__ == 'MappedColumn':
                print(f"  Column: {k}, type hint: {self.cls.__annotations__.get(k)}")
    except Exception as e:
        pass
    original_extract(self)
decl_base._MapperConfig._extract_mappable_attributes = print_keys

try:
    from app.db.models.marketplace import ServiceAvailability
except Exception as e:
    traceback.print_exc()
