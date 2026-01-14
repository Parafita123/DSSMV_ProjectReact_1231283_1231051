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


import { useAuthStore } from "../../src/react/hooks/useAuthStore";

import { insertRow } from "../supabase";

export default function SugerirReceita() {
  const router = useRouter();

  // ✅ vem do store (arquitetura nova)
  const { currentUser } = useAuthStore();
  const user = currentUser;

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
  const [customIngredients, setCustomIngredients] = useState<string>("");
  const [recipeName, setRecipeName] = useState<string | null>(null);
  const [recipeContent, setRecipeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dietary, setDietary] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [recipeGenerated, setRecipeGenerated] = useState(false);

  const toggleIngredient = (ing: string) => {
    setSelected((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const generateRecipe = async () => {
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

      const params = new URLSearchParams();
      params.append("apiKey", apiKey);
      params.append("includeIngredients", allIngredients.join(","));

      if (dietary.trim()) {
        const diets = dietary
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
        if (diets.length > 0) params.append("diet", diets[0]);
      }
      if (cuisine.trim()) params.append("cuisine", cuisine.trim());
      if (mealType.trim()) params.append("type", mealType.trim());

      params.append("number", "1");
      params.append("instructionsRequired", "true");
      params.append("addRecipeInformation", "true");
      params.append("addRecipeInstructions", "true");

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

      if (Array.isArray(searchData?.results) && searchData.results.length > 0) {
        recipe = searchData.results[0];
      }

      if (!recipe) {
        const randResp = await fetch(
          `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=1&tags=${cuisine.trim()}`
        );
        if (randResp.ok) {
          const randData = await randResp.json();
          if (randData?.recipes?.length > 0) recipe = randData.recipes[0];
        }
      }

      if (!recipe) {
        setRecipeName("Receita Sugerida");
        setRecipeContent("Não foi possível obter instruções. Tente novamente mais tarde.");
        setRecipeGenerated(false);
        return;
      }

      const title = recipe.title || recipe.name || "Receita Sugerida";

      let instructions: string | null = null;
      if (Array.isArray(recipe?.analyzedInstructions) && recipe.analyzedInstructions.length > 0) {
        const steps = recipe.analyzedInstructions[0]?.steps;
        if (Array.isArray(steps) && steps.length > 0) {
          instructions = steps
            .map((s: any) => s.step)
            .filter(Boolean)
            .join("\n");
        }
      }

      if (!instructions && recipe.instructions) instructions = recipe.instructions;

      if (!instructions) {
        setRecipeName(title);
        setRecipeContent("Não foi possível obter instruções. Tente novamente mais tarde.");
        setRecipeGenerated(false);
        return;
      }

      const cleaned = instructions
        .replace(/<\/?li>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\n+/g, "\n")
        .trim();

      setRecipeName(title);
      setRecipeContent(cleaned);
      setRecipeGenerated(true);
    } catch (err: any) {
      setError(err?.message || "Erro ao comunicar com a API de receitas.");
    } finally {
      setLoading(false);
    }
  };

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

      setSelected([]);
      setRecipeName(null);
      setRecipeContent(null);
      setError(null);

      Alert.alert("Sucesso", "Sugestão submetida com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
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
        setError(msg || "Erro ao submeter sugestão. Verifica a tua ligação ou tenta novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sugerir Receita</Text>
      <Text style={styles.subtitle}>
        Indica os ingredientes em inglês (vírgulas), ou selecciona na lista.
        Podes ainda definir dieta/cozinha/tipo. A IA gera uma receita.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ingredients (comma separated, English)"
        value={customIngredients}
        onChangeText={setCustomIngredients}
      />

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
              <Text style={selectedBool ? styles.ingredientChipTextSelected : styles.ingredientChipText}>
                {ing}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gerar Receita</Text>}
      </TouchableOpacity>

      {recipeName && recipeContent && (
        <View style={styles.recipeCard}>
          <Text style={styles.recipeTitle}>{recipeName}</Text>
          <Text style={styles.recipeContent}>{recipeContent}</Text>

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
