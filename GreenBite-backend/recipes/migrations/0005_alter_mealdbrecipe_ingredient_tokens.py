from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("recipes", "0004_remove_mealdbrecipe_mealdb_ing_norm_gin_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE recipes_mealdbrecipe
            ALTER COLUMN ingredient_tokens
            TYPE jsonb
            USING to_jsonb(ingredient_tokens);
            """,
            reverse_sql="""
            ALTER TABLE recipes_mealdbrecipe
            ALTER COLUMN ingredient_tokens
            TYPE varchar[]
            USING ARRAY(
              SELECT jsonb_array_elements_text(ingredient_tokens)
            );
            """
        ),
    ]
