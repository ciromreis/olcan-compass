"""Service package.

Keep package initialization lightweight.

Some runtime entrypoints import submodules from ``app.services`` directly
(``from app.services import credentials``). Eager imports here were pulling in
database-backed modules at package import time, which made unrelated services
fail before the application booted. Import concrete services from their
respective modules instead.
"""

__all__: list[str] = []
