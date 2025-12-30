import hashlib

def hash_key(*parts: str) -> str:
    joined = "|".join([p or "" for p in parts])
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()