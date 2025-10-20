export type IngredientOption = {
  value: string
  label: string
  category: string
}

export const ingredientOptions: IngredientOption[] = [
  { value: "vodka", label: "Vodka", category: "Base Spirits" },
  { value: "london-dry-gin", label: "London Dry Gin", category: "Base Spirits" },
  { value: "old-tom-gin", label: "Old Tom Gin", category: "Base Spirits" },
  { value: "blanco-tequila", label: "Blanco Tequila", category: "Base Spirits" },
  { value: "reposado-tequila", label: "Reposado Tequila", category: "Base Spirits" },
  { value: "anejo-tequila", label: "Anejo Tequila", category: "Base Spirits" },
  { value: "mezcal", label: "Mezcal", category: "Base Spirits" },
  { value: "light-rum", label: "Light Rum", category: "Base Spirits" },
  { value: "aged-rum", label: "Aged Rum", category: "Base Spirits" },
  { value: "dark-rum", label: "Dark Rum", category: "Base Spirits" },
  { value: "jamaican-rum", label: "Jamaican Rum", category: "Base Spirits" },
  { value: "rhum-agricole", label: "Rhum Agricole", category: "Base Spirits" },
  { value: "cachaca", label: "Cachaca", category: "Base Spirits" },
  { value: "bourbon", label: "Bourbon", category: "Base Spirits" },
  { value: "rye-whiskey", label: "Rye Whiskey", category: "Base Spirits" },
  { value: "irish-whiskey", label: "Irish Whiskey", category: "Base Spirits" },
  { value: "scotch-whisky", label: "Scotch Whisky", category: "Base Spirits" },
  { value: "japanese-whisky", label: "Japanese Whisky", category: "Base Spirits" },
  { value: "canadian-whisky", label: "Canadian Whisky", category: "Base Spirits" },
  { value: "brandy", label: "Brandy", category: "Base Spirits" },
  { value: "cognac", label: "Cognac", category: "Base Spirits" },
  { value: "armagnac", label: "Armagnac", category: "Base Spirits" },
  { value: "pisco", label: "Pisco", category: "Base Spirits" },
  { value: "aperol", label: "Aperol", category: "Liqueurs & Cordials" },
  { value: "campari", label: "Campari", category: "Liqueurs & Cordials" },
  { value: "amaro-averna", label: "Amaro Averna", category: "Liqueurs & Cordials" },
  { value: "amaro-nonino", label: "Amaro Nonino", category: "Liqueurs & Cordials" },
  { value: "fernet-branca", label: "Fernet-Branca", category: "Liqueurs & Cordials" },
  { value: "cynar", label: "Cynar", category: "Liqueurs & Cordials" },
  { value: "green-chartreuse", label: "Green Chartreuse", category: "Liqueurs & Cordials" },
  { value: "yellow-chartreuse", label: "Yellow Chartreuse", category: "Liqueurs & Cordials" },
  { value: "benedictine", label: "Benedictine", category: "Liqueurs & Cordials" },
  { value: "maraschino-liqueur", label: "Maraschino Liqueur", category: "Liqueurs & Cordials" },
  { value: "velvet-falernum", label: "Velvet Falernum", category: "Liqueurs & Cordials" },
  { value: "elderflower-liqueur", label: "Elderflower Liqueur", category: "Liqueurs & Cordials" },
  { value: "orange-liqueur", label: "Orange Liqueur / Triple Sec", category: "Liqueurs & Cordials" },
  { value: "coffee-liqueur", label: "Coffee Liqueur", category: "Liqueurs & Cordials" },
  { value: "creme-de-cacao", label: "Creme de Cacao", category: "Liqueurs & Cordials" },
  { value: "creme-de-cassis", label: "Creme de Cassis", category: "Liqueurs & Cordials" },
  { value: "absinthe", label: "Absinthe / Pastis", category: "Liqueurs & Cordials" },
  { value: "amaretto", label: "Amaretto", category: "Liqueurs & Cordials" },
  { value: "limoncello", label: "Limoncello", category: "Liqueurs & Cordials" },
  { value: "sweet-vermouth", label: "Sweet Vermouth", category: "Fortified & Aperitifs" },
  { value: "dry-vermouth", label: "Dry Vermouth", category: "Fortified & Aperitifs" },
  { value: "blanc-vermouth", label: "Blanc Vermouth", category: "Fortified & Aperitifs" },
  { value: "lillet-blanc", label: "Lillet Blanc", category: "Fortified & Aperitifs" },
  { value: "cocchi-americano", label: "Cocchi Americano", category: "Fortified & Aperitifs" },
  { value: "fino-sherry", label: "Fino Sherry", category: "Fortified & Aperitifs" },
  { value: "amontillado-sherry", label: "Amontillado Sherry", category: "Fortified & Aperitifs" },
  { value: "oloroso-sherry", label: "Oloroso Sherry", category: "Fortified & Aperitifs" },
  { value: "px-sherry", label: "Pedro Ximenez Sherry", category: "Fortified & Aperitifs" },
  { value: "ruby-port", label: "Ruby Port", category: "Fortified & Aperitifs" },
  { value: "tawny-port", label: "Tawny Port", category: "Fortified & Aperitifs" },
  { value: "madeira", label: "Madeira", category: "Fortified & Aperitifs" },
  { value: "sweet-marsala", label: "Sweet Marsala", category: "Fortified & Aperitifs" },
  { value: "orgeat", label: "Orgeat Syrup", category: "Syrups & Shrubs" },
  { value: "demerara-syrup", label: "Demerara Syrup", category: "Syrups & Shrubs" },
  { value: "honey-syrup", label: "Honey Syrup", category: "Syrups & Shrubs" },
  { value: "ginger-syrup", label: "Ginger Syrup", category: "Syrups & Shrubs" },
  { value: "grenadine", label: "Grenadine", category: "Syrups & Shrubs" },
  { value: "pineapple-shrub", label: "Pineapple Shrub", category: "Syrups & Shrubs" },
  { value: "berry-shrub", label: "Seasonal Berry Shrub", category: "Syrups & Shrubs" },
  { value: "apple-cider-shrub", label: "Apple Cider Shrub", category: "Syrups & Shrubs" },
  { value: "chamomile-syrup", label: "Chamomile Syrup", category: "Syrups & Shrubs" },
  { value: "lavender-syrup", label: "Lavender Syrup", category: "Syrups & Shrubs" },
  { value: "cold-brew", label: "Cold Brew Concentrate", category: "Mixers & NA" },
  { value: "espresso", label: "Espresso Concentrate", category: "Mixers & NA" },
  { value: "matcha", label: "Matcha Elixir", category: "Mixers & NA" },
  { value: "chai-syrup", label: "Chai Syrup", category: "Mixers & NA" },
  { value: "coconut-water", label: "Coconut Water Reduction", category: "Mixers & NA" },
  { value: "kombucha", label: "House Kombucha", category: "Mixers & NA" },
  { value: "tonic-syrup", label: "Tonic Syrup", category: "Mixers & NA" },
  { value: "bitters-blend", label: "Bitters Blend / Tincture", category: "Mixers & NA" },
]

export const ingredientCategories = Array.from(
  new Set(ingredientOptions.map((option) => option.category)),
)

export const ingredientLabelMap = ingredientOptions.reduce<Record<string, string>>(
  (accumulator, option) => {
    accumulator[option.value] = option.label
    return accumulator
  },
  {},
)

export const OTHER_INGREDIENT_VALUE = "other"
