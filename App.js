const DIETS = {
  mediterranean: {
    name: "Mediterrânea",
    description: "Azeite de oliva, peixes, grãos integrais, legumes e frutas. Foco em saúde cardiovascular.",
    foods: {
      proteins: ["Salmão", "Atum", "Sardinha", "Frango"],
      carbs: ["Arroz integral", "Quinoa", "Pão integral", "Cuscuz"],
      vegetables: ["Berinjela", "Abobrinha", "Tomate", "Pepino"],
      greens: ["Espinafre", "Rúcula", "Alface", "Couve"]
    }
  },
  lowcarb: {
    name: "Low Carb",
    description: "Redução de carboidratos, aumento de proteínas e gorduras boas. Foco em emagrecimento.",
    foods: {
      proteins: ["Ovos", "Peito de frango", "Carne magra", "Peixe"],
      carbs: ["Batata doce", "Abóbora", "Inhame", "Aveia"],
      vegetables: ["Brócolis", "Couve-flor", "Abobrinha", "Chuchu"],
      greens: ["Alface", "Agrião", "Escarola", "Mostarda"]
    }
  },
  ketogenic: {
    name: "Cetogênica",
    description: "Ingestão muito baixa de carboidratos e alta em gorduras. Para perda de gordura rápida.",
    foods: {
      proteins: ["Bacon", "Carne gorda", "Peixe gordo", "Ovos"],
      carbs: ["Abacate", "Nozes", "Sementes", "Coco"],
      vegetables: ["Couve-flor", "Brócolis", "Abobrinha", "Pepino"],
      greens: ["Espinafre", "Rúcula", "Alface americana", "Endívia"]
    }
  },
  vegetarian: {
    name: "Vegetariana",
    description: "Sem carnes; inclui ovos, laticínios, grãos, vegetais e leguminosas.",
    foods: {
      proteins: ["Ovos", "Queijo", "Tofu", "Grão-de-bico"],
      carbs: ["Arroz", "Macarrão", "Batata", "Pão"],
      vegetables: ["Cenoura", "Beterraba", "Berinjela", "Abobrinha"],
      greens: ["Alface", "Agrião", "Couve", "Espinafre"]
    }
  }
};

const ALLERGENS = ["Lactose", "Glúten", "Ovo", "Frutos do mar", "Soja", "Nenhuma"];

let userData = {
  diet: null,
  weight: null,
  height: null,
  age: null,
  gender: null,
  goal: null,
  allergens: [],
  preferences: []
};

function calculateTMB() {
  const { weight, height, age, gender } = userData;
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

function calculateBMI() {
  const { weight, height } = userData;
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 24.9) return "Peso normal";
  if (bmi < 29.9) return "Sobrepeso";
  return "Obesidade";
}

function calculateWater() {
  return (35 * userData.weight).toFixed(0);
}

function filterAllergens(foods) {
  if (!userData.allergens || userData.allergens.length === 0) return foods;
  
  const allergenFreeFoods = {};
  const allergenMap = {
    "Lactose": ["Queijo", "Iogurte", "Leite"],
    "Glúten": ["Pão", "Macarrão", "Cuscuz"],
    "Ovo": ["Ovos"],
    "Frutos do mar": ["Salmão", "Atum", "Sardinha"],
    "Soja": ["Tofu"]
  };
  
  Object.keys(foods).forEach(category => {
    allergenFreeFoods[category] = foods[category].filter(food => {
      return !userData.allergens.some(allergen => {
        const forbidden = allergenMap[allergen] || [];
        return forbidden.includes(food);
      });
    });
  });
  
  return allergenFreeFoods;
}

function generateRecommendations() {
  const selectedDiet = DIETS[userData.diet];
  let foods = JSON.parse(JSON.stringify(selectedDiet.foods)); // Deep copy
  
  foods = filterAllergens(foods);
  
  let html = `
    <div class="recommendation-section">
      <h3>Recomendações para dieta ${selectedDiet.name}</h3>
      <div class="food-categories">
  `;
  
  Object.keys(foods).forEach(category => {
    html += `
      <div class="food-category">
        <h4>${translateCategory(category)}</h4>
        <ul>
          ${foods[category].map(food => `<li>${food}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  
  html += `</div></div>`;
  return html;
}

function translateCategory(category) {
  const translations = {
    proteins: "Proteínas",
    carbs: "Carboidratos",
    vegetables: "Legumes",
    greens: "Verduras"
  };
  return translations[category] || category;
}

function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

function renderDietSelection() {
  const dietGrid = document.querySelector('.diet-grid');
  dietGrid.innerHTML = '';
  
  Object.keys(DIETS).forEach(dietKey => {
    const diet = DIETS[dietKey];
    const dietCard = document.createElement('div');
    dietCard.className = 'diet-card';
    dietCard.dataset.diet = dietKey;
    dietCard.innerHTML = `
      <h3>${diet.name}</h3>
      <p>${diet.description}</p>
    `;
    dietCard.addEventListener('click', () => selectDiet(dietKey));
    dietGrid.appendChild(dietCard);
  });
}

function selectDiet(dietKey) {
  userData.diet = dietKey;
  showSection('form-section');
  document.getElementById('health-form').reset();
}

function renderAllergenOptions() {
  const container = document.getElementById('allergen-container');
  container.innerHTML = '';
  
  ALLERGENS.forEach(allergen => {
    const div = document.createElement('div');
    div.className = 'checkbox-option';
    div.innerHTML = `
      <input type="checkbox" id="allergen-${allergen}" name="allergens" value="${allergen}">
      <label for="allergen-${allergen}">${allergen}</label>
    `;
    container.appendChild(div);
  });
}

function renderResults() {
  const tmb = calculateTMB();
  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const water = calculateWater();
  
  document.getElementById('tmb-result').textContent = tmb.toFixed(0);
  document.getElementById('bmi-result').textContent = bmi;
  document.getElementById('bmi-category').textContent = bmiCategory;
  
  const recommendations = generateRecommendations();
  document.getElementById('food-recommendations').innerHTML = recommendations;
  
  const waterElement = document.createElement('div');
  waterElement.className = 'metric';
  waterElement.innerHTML = `
    <h3>Água: ${water} ml</h3>
    <p>Consumo diário recomendado</p>
  `;
  document.querySelector('.metrics').appendChild(waterElement);
}

document.getElementById('health-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  userData = {
    ...userData,
    weight: parseFloat(document.getElementById('weight').value),
    height: parseFloat(document.getElementById('height').value),
    age: parseInt(document.getElementById('age').value),
    gender: document.getElementById('gender').value,
    goal: document.getElementById('goal').value,
    allergens: Array.from(document.querySelectorAll('input[name="allergens"]:checked')).map(el => el.value)
  };
  
  renderResults();
  showSection('results-section');
});

document.getElementById('back-to-diet').addEventListener('click', () => {
  showSection('diet-section');
});

document.getElementById('back-to-form').addEventListener('click', () => {
  showSection('form-section');
});

document.addEventListener('DOMContentLoaded', function() {
  renderDietSelection();
  renderAllergenOptions();
  
  showSection('diet-section');
});
