import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { insertRow } from "../supabase";

/**
 * Screen allowing clients to generate a recipe using the Spoonacular
 * API and submit it as a suggestion to the administrators. Clients
 * choose ingredients from a pre-defined list (in English) or type
 * their own.  The app queries Spoonacular's `findByIngredients`
 * endpoint to search for recipes that use the provided ingredients.
 * If no recipe is found, it falls back to a random recipe. Upon
 * approval the suggestion is stored in Supabase for the admin to
 * review.
 */
export default function SugerirReceita() {
  const router = useRouter();
  const { user } = useAuth();

  // Hard-coded list of popular ingredients in English.  These names
  // correspond directly to Spoonacular's ingredient database.  If
  // additional ingredients are needed, users can type them in the
  // custom field below.
  const ingredientsList = [
    "Chicken",
    "Beef",
    "Fish",
    "Rice",
    "Potato",
    "Vegetables",
    "Cheese",
    "Pasta",
    "Eggs",
    "Tomato",
  ];

  const [selected, setSelected] = useState<string[]>([]);
  // Additional ingredients typed by the user.  These are comma separated
  // values that allow the customer to enter any ingredient they wish
  // instead of being limited to the predefined chips.
  const [customIngredients, setCustomIngredients] = useState<string>("");
  const [recipeName, setRecipeName] = useState<string | null>(null);
  const [recipeContent, setRecipeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Additional parameters for the Spoonacular API.  Users can specify
  // dietary restrictions (e.g. vegetarian, vegan), cuisine (e.g. Italian,
  // Chinese) and meal type (e.g. breakfast, lunch, dinner).  Leave
  // fields empty to let the API choose defaults.
  const [dietary, setDietary] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");

  // Tracks whether a valid recipe has been generated.  When false the
  // submit button will be hidden to prevent submission of an invalid
  // suggestion.
  const [recipeGenerated, setRecipeGenerated] = useState(false);

  const toggleIngredient = (ing: string) => {
    setSelected((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  /**
   * Calls the Spoonacular API to find a recipe based on the provided
   * ingredients and optional filters.  This implementation uses the
   * `complexSearch` endpoint with the `includeIngredients` parameter
   * so that Spoonacular can intelligently match recipes that use
   * some or all of the ingredients.  We request that instructions
   * be included in the response and fallback to a random recipe if
   * no match is found.  After retrieving a recipe, the instructions
   * string (or analyzed steps) is normalised into plain text.
   */
  const generateRecipe = async () => {
    // Build a unified list of ingredients from selected chips and
    // any comma-separated custom ingredients the user has typed.
    const allIngredients: string[] = [
      ...selected,
      ...customIngredients
        .split(",")
        .map((ing) => ing.trim())
        .filter(Boolean),
    ];
    if (allIngredients.length === 0) {
      setError("Escolhe pelo menos um ingrediente.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiKey = "897d428c39094fe8822bad950d03aade";
      // Construct query parameters for the complex search.  We
      // explicitly require instructions and ask Spoonacular to
      // include recipe information and instructions in the response.
      const params = new URLSearchParams();
      params.append("apiKey", apiKey);
      params.append("includeIngredients", allIngredients.join(","));
      if (dietary.trim()) {
        // Use only the first diet restriction specified (comma separated).  The
        // complexSearch endpoint allows multiple diets separated by comma but
        // for simplicity we send just the first one.  Valid examples are
        // vegetarian, vegan, gluten free, ketogenic, pescetarian, etc.
        const diets = dietary
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
        if (diets.length > 0) {
          params.append("diet", diets[0]);
        }
      }
      if (cuisine.trim()) {
        params.append("cuisine", cuisine.trim());
      }
      if (mealType.trim()) {
        // In complexSearch the parameter name is `type` when specifying
        // the dish type (e.g. main course, side dish, dessert).  The
        // user should enter values recognised by Spoonacular.
        params.append("type", mealType.trim());
      }
      params.append("number", "1");
      params.append("instructionsRequired", "true");
      params.append("addRecipeInformation", "true");
      params.append("addRecipeInstructions", "true");

      // Perform the complex search request
      const searchResp = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
      );
      if (!searchResp.ok) {
        throw new Error(
          `Erro ao pesquisar receitas (${searchResp.status}: ${searchResp.statusText})`
        );
      }
      const searchData = await searchResp.json();
      let recipe: any | null = null;
      if (
        searchData &&
        Array.isArray(searchData.results) &&
        searchData.results.length > 0
      ) {
        recipe = searchData.results[0];
      }
      // If the search didn't return any recipes, fallback to a random one
      if (!recipe) {
        const randResp = await fetch(
          `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=1&tags=${cuisine.trim()}`
        );
        if (randResp.ok) {
          const randData = await randResp.json();
          if (randData && randData.recipes && randData.recipes.length > 0) {
            recipe = randData.recipes[0];
          }
        }
      }
      if (!recipe) {
        setRecipeName("Receita Sugerida");
        setRecipeContent(
          "Não foi possível obter instruções. Tente novamente mais tarde."
        );
        setRecipeGenerated(false);
      } else {
        // Extract the title and instructions from the recipe object.  The
        // complexSearch endpoint with `addRecipeInstructions` returns
        // analyzedInstructions as an array.  If that fails, fall
        // back to the plain `instructions` string.
        let title = recipe.title || recipe.name || "Receita Sugerida";
        let instructions: string | null = null;
        if (
          recipe.analyzedInstructions &&
          Array.isArray(recipe.analyzedInstructions) &&
          recipe.analyzedInstructions.length > 0
        ) {
          const steps = recipe.analyzedInstructions[0].steps;
          if (steps && Array.isArray(steps) && steps.length > 0) {
            instructions = steps
              .map((s: any) => s.step)
              .filter(Boolean)
              .join("\n");
          }
        }
        if (!instructions && recipe.instructions) {
          instructions = recipe.instructions;
        }
        if (instructions) {
          // Clean HTML tags and HTML entities from the instructions
          let cleaned = instructions
            .replace(/<\/?li>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/\n+/g, "\n")
            .trim();
          setRecipeName(title);
          setRecipeContent(cleaned);
          setRecipeGenerated(true);
        } else {
          setRecipeName(title);
          setRecipeContent(
            "Não foi possível obter instruções. Tente novamente mais tarde."
          );
          setRecipeGenerated(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao comunicar com a API de receitas.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Persists the generated recipe as a suggestion in the Supabase
   * database.  The suggestions table should contain at least the
   * following columns: name (string), clientEmail (string),
   * description (string), createdAt (timestamp).  Row level
   * security policies must allow the logged in user to insert rows.
   */
  const submitSuggestion = async () => {
    if (!recipeName || !recipeContent) return;
    if (!user) {
      setError("Necessário iniciar sessão para submeter uma sugestão.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await insertRow("suggestions", {
        name: recipeName,
        clientEmail: user.email,
        description: recipeContent,
        createdAt: new Date().toISOString(),
      });
      // Reset form
      setSelected([]);
      setRecipeName(null);
      setRecipeContent(null);
      setError(null);
      Alert.alert("Sucesso", "Sugestão submetida com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error(err);
      // Supabase returns a 404 with code PGRST205 if the table does not exist.
      // In this case, advise the user (or developer) to create the
      // `suggestions` table manually in Supabase.
      const msg = err?.message || "";
      if (
        msg.includes("PGRST205") ||
        msg.includes("table 'public.suggestions'") ||
        msg.includes("Could not find the table")
      ) {
        setError(
          "Tabela 'suggestions' não encontrada na base de dados Supabase. " +
            "Por favor crie-a no painel do Supabase para permitir o registo de sugestões."
        );
      } else {
        setError(
          msg ||
            "Erro ao submeter sugestão. Verifica a tua ligação ou tenta novamente."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sugerir Receita</Text>
      <Text style={styles.subtitle}>
        Indica os ingredientes que desejas utilizar em inglês, separados por
        vírgulas, ou selecciona alguns da lista abaixo. Podes ainda definir
        uma dieta, cozinha ou tipo de prato. A nossa IA irá gerar uma
        receita personalizada com base nesses critérios.
      </Text>
      {/* Input field for core ingredients.  Users should enter a
          comma-separated list of ingredients in English.  These
          ingredients will be combined with any selected chips. */}
      <TextInput
        style={styles.input}
        placeholder="Ingredients (comma separated, English)"
        value={customIngredients}
        onChangeText={setCustomIngredients}
      />
      {/* Chips for some popular ingredients.  Tapping a chip adds or
          removes it from the selection.  Ingredient names are in
          English to match Spoonacular's API requirements. */}
      <View style={styles.ingredientsContainer}>
        {ingredientsList.map((ing) => {
          const selectedBool = selected.includes(ing);
          return (
            <TouchableOpacity
              key={ing}
              style={[
                styles.ingredientChip,
                selectedBool && styles.ingredientChipSelected,
              ]}
              onPress={() => toggleIngredient(ing)}
            >
              <Text
                style={
                  selectedBool
                    ? styles.ingredientChipTextSelected
                    : styles.ingredientChipText
                }
              >
                {ing}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Optional filters: diet, cuisine and meal type.  Leave these
          fields empty if you do not wish to constrain the search.  Use
          English values (e.g. vegetarian, Italian, main course). */}
      <TextInput
        style={styles.input}
        placeholder="Diet (e.g. vegetarian, vegan, gluten free)"
        value={dietary}
        onChangeText={setDietary}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine (e.g. Italian, Chinese)"
        value={cuisine}
        onChangeText={setCuisine}
      />
      <TextInput
        style={styles.input}
        placeholder="Dish type (e.g. main course, appetizer, dessert)"
        value={mealType}
        onChangeText={setMealType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, styles.generateButton]}
        onPress={generateRecipe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gerar Receita</Text>
        )}
      </TouchableOpacity>
      {recipeName && recipeContent && (
        <View style={styles.recipeCard}>
          <Text style={styles.recipeTitle}>{recipeName}</Text>
          <Text style={styles.recipeContent}>{recipeContent}</Text>
          {/* Only show the submit button if a valid recipe was generated */}
          {recipeGenerated && (
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={submitSuggestion}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submeter Sugestão</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFF6E5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF6F59",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  ingredientChip: {
    borderWidth: 1,
    borderColor: "#FF9F1C",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  ingredientChipSelected: {
    backgroundColor: "#FF9F1C",
  },
  ingredientChipText: {
    color: "#FF9F1C",
    fontWeight: "bold",
  },
  ingredientChipTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  generateButton: {
    backgroundColor: "#FF9F1C",
  },
  submitButton: {
    backgroundColor: "#FF6F59",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  recipeContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },

  // Reusable text input style for additional parameters
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
});