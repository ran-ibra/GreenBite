from dataclasses import dataclass
from typing import List

@dataclass
class PlannedRecipe:
    title: str
    ingredients: List[str]
    source: str  # "db" or "ai"
    