"""
AI fallback for recipe generation using OpenAI.
Generates recipes when database doesn't have enough matches.
"""
import json
import re
import logging
from openai import OpenAI
from django.conf import settings
from project.utils.normalize import normalize_ingredient_name
from .types import PlannedRecipe

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_ai_recipes(food_logs, limit):
    """
    Generate recipes using OpenAI based on available ingredients.
    
    Args:
        food_logs: QuerySet of FoodLogSys objects
        limit: Number of recipes to generate
    
    Returns:
        List of PlannedRecipe objects
    """
    ingredients = [log.name for log in food_logs[:20]]
    
    if not ingredients:
        logger.warning("No ingredients provided for AI recipe generation")
        return []

    prompt = f"""Generate {limit} simple recipes using ONLY these available ingredients:
{', '.join(ingredients)}

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no explanations
2. Use ONLY ingredients from the list above
3. Basic pantry items allowed: salt, pepper, oil, water
4. Keep recipe titles SHORT (max 50 characters)
5. Keep ingredient names SHORT (max 30 characters each)

Return this exact JSON structure:
[
  {{"title": "Recipe Name", "ingredients": ["ingredient1", "ingredient2"]}},
  {{"title": "Another Recipe", "ingredients": ["ingredient3", "ingredient4"]}}
]"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a recipe generator. Return ONLY valid JSON arrays with no markdown, no code blocks, no explanations. Keep strings short."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=4500,
            response_format={"type": "json_object"}  # ✅ Force JSON mode (if supported)
        )
        
        content = response.choices[0].message.content.strip()
        logger.debug(f"AI raw response length: {len(content)} chars")
        
        # ✅ Clean and extract JSON
        content = clean_json_response(content)
        
        # Parse JSON
        data = json.loads(content)
        
        # Handle JSON object wrapper (if AI returns {"recipes": [...]})
        if isinstance(data, dict):
            if "recipes" in data:
                data = data["recipes"]
            elif len(data) == 1:
                # Single key dict, extract the value
                data = list(data.values())[0]
        
        # Validate it's a list
        if not isinstance(data, list):
            logger.error(f"AI returned non-list after unwrapping: {type(data)}")
            raise ValueError("AI response is not a list")
        
        # Convert to PlannedRecipe objects
        recipes = []
        for r in data:
            if not isinstance(r, dict):
                logger.warning(f"Skipping non-dict recipe: {r}")
                continue
            
            if "title" not in r or "ingredients" not in r:
                logger.warning(f"Skipping invalid recipe (missing fields): {r}")
                continue
            
            # Clean and normalize ingredients
            normalized_ingredients = []
            for ing in r.get("ingredients", []):
                if not ing or not isinstance(ing, str):
                    continue
                
                # Clean the ingredient string
                ing_clean = clean_ingredient_string(ing)
                if ing_clean:
                    normalized = normalize_ingredient_name(ing_clean)
                    if normalized:
                        normalized_ingredients.append(normalized)
            
            if normalized_ingredients:
                recipes.append(
                    PlannedRecipe(
                        title=clean_recipe_title(r["title"]),
                        ingredients=normalized_ingredients,
                        source="ai"
                    )
                )
        
        logger.info(f"Successfully generated {len(recipes)} AI recipes from {len(data)} responses")
        return recipes
        
    except json.JSONDecodeError as e:
        logger.error(f"AI returned invalid JSON: {e}")
        logger.error(f"Problematic content (first 500 chars): {content[:500]}")
        
        # Try to salvage partial recipes
        salvaged = try_salvage_json(content)
        if salvaged:
            logger.info(f"Salvaged {len(salvaged)} recipes from broken JSON")
            return salvaged
        
        return []  # Return empty instead of raising
    
    except Exception as e:
        logger.exception(f"AI recipe generation failed: {e}")
        return []  # Return empty instead of raising


def clean_json_response(content: str) -> str:
    """
    Clean AI response to extract valid JSON.
    Handles markdown, explanations, and malformed JSON.
    """
    # Remove markdown code blocks
    content = re.sub(r'```(?:json)?\s*', '', content)
    content = content.replace('```', '')
    
    # Extract JSON array or object
    json_match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', content)
    if json_match:
        content = json_match.group(1)
    
    # Fix common JSON issues
    content = content.replace('\n', ' ')  # Remove newlines inside strings
    content = re.sub(r',\s*([}\]])', r'\1', content)  # Remove trailing commas
    
    # Fix unescaped quotes in strings (simple heuristic)
    # This is risky but handles "It's delicious" → "It\'s delicious"
    content = fix_unescaped_quotes(content)
    
    return content.strip()


def fix_unescaped_quotes(json_str: str) -> str:
    """
    Attempt to fix unescaped quotes inside JSON strings.
    This is a heuristic and may not work for all cases.
    """
    # Pattern: find "text with ' apostrophe" and don't break it
    # But find "text with " broken quote" and fix it
    
    # Simple approach: replace ' with \' inside double-quoted strings
    # This won't fix all cases but helps with common issues
    
    parts = []
    in_string = False
    escape_next = False
    
    for i, char in enumerate(json_str):
        if escape_next:
            parts.append(char)
            escape_next = False
            continue
        
        if char == '\\':
            escape_next = True
            parts.append(char)
            continue
        
        if char == '"':
            in_string = not in_string
            parts.append(char)
        elif char == "'" and in_string:
            # Replace unescaped single quotes inside strings
            parts.append("\\'")
        else:
            parts.append(char)
    
    return ''.join(parts)


def clean_ingredient_string(ing: str) -> str:
    """Clean ingredient string from measurements and extra text."""
    if not isinstance(ing, str):
        return ""
    
    # Remove common measurements
    ing = re.sub(r'\b\d+(\.\d+)?\s*(g|kg|ml|l|oz|lb|cup|tbsp|tsp|piece|pieces)\b', '', ing, flags=re.IGNORECASE)
    
    # Remove extra whitespace
    ing = ' '.join(ing.split())
    
    return ing.strip()


def clean_recipe_title(title: str) -> str:
    """Clean recipe title."""
    if not isinstance(title, str):
        return "Untitled Recipe"
    
    # Remove extra whitespace
    title = ' '.join(title.split())
    
    # Truncate if too long
    if len(title) > 100:
        title = title[:97] + "..."
    
    return title.strip()


def try_salvage_json(content: str) -> list:
    """
    Attempt to salvage recipes from malformed JSON.
    Extracts individual recipe objects even if the array is broken.
    """
    recipes = []
    
    # Find all {"title": "...", "ingredients": [...]} patterns
    recipe_pattern = r'\{\s*"title"\s*:\s*"([^"]+)"\s*,\s*"ingredients"\s*:\s*\[(.*?)\]\s*\}'
    
    matches = re.finditer(recipe_pattern, content, re.DOTALL)
    
    for match in matches:
        title = match.group(1)
        ingredients_str = match.group(2)
        
        # Extract ingredients from the array string
        ing_pattern = r'"([^"]+)"'
        ingredients = re.findall(ing_pattern, ingredients_str)
        
        if title and ingredients:
            normalized_ingredients = [
                normalize_ingredient_name(clean_ingredient_string(ing))
                for ing in ingredients
                if ing
            ]
            
            if normalized_ingredients:
                recipes.append(
                    PlannedRecipe(
                        title=clean_recipe_title(title),
                        ingredients=[i for i in normalized_ingredients if i],
                        source="ai"
                    )
                )
                logger.debug(f"Salvaged recipe: {title}")
    
    return recipes


def extract_json_from_response(content: str) -> str:
    """
    Legacy function - kept for compatibility.
    Use clean_json_response instead.
    """
    return clean_json_response(content)


def validate_ai_recipe(recipe_data: dict, available_ingredients: set) -> bool:
    """
    Validate that an AI-generated recipe only uses available ingredients.
    """
    recipe_ingredients = set(
        normalize_ingredient_name(i) 
        for i in recipe_data.get("ingredients", [])
    )
    
    pantry_staples = {"salt", "pepper", "oil", "water", "olive oil", "vegetable oil"}
    
    unavailable = recipe_ingredients - available_ingredients - pantry_staples
    
    if unavailable:
        logger.warning(f"Recipe uses unavailable ingredients: {unavailable}")
        return False
    
    return True


def generate_ai_recipes_with_validation(food_logs, limit, strict=False):
    """
    Generate AI recipes with optional validation.
    
    Args:
        food_logs: QuerySet of FoodLogSys
        limit: Number of recipes
        strict: If True, only return recipes using available ingredients
    
    Returns:
        List of PlannedRecipe objects
    """
    recipes = generate_ai_recipes(food_logs, limit)
    
    if not strict:
        return recipes
    
    # Filter to only valid recipes
    available = set(
        normalize_ingredient_name(log.name) 
        for log in food_logs
    )
    
    valid_recipes = []
    for recipe in recipes:
        recipe_dict = {
            "title": recipe.title,
            "ingredients": recipe.ingredients
        }
        
        if validate_ai_recipe(recipe_dict, available):
            valid_recipes.append(recipe)
        else:
            logger.info(f"Filtered out invalid recipe: {recipe.title}")
    
    return valid_recipes