const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoEl = document.getElementById('meal-info');

const searchBtn = document.getElementById('search');
const searchTerm = document.getElementById('search-term');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);

    const respData = await resp.json();

    const meal = respData.meals[0];

    return meal
}

async function getMealsBySearch(term) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
    )

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `          
        <div class="meal-header">
            ${random ? `
            <span class="random">
                Random recipe
            </span>` : ''}
            <img 
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            >
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `
    const btn = meal.querySelector(".meal-body .fav-btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealsFromLocalStorage(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.add("active");
        }
        
        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function addMealToLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealsFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();
    //FILTERING OUT THE MEAL THAT WE WANT TO REMOVE FROM THE FAV LIST
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLocalStorage() {
    //going to Application => LocalStorage the id of the meal that we add can be seen!
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds ===null ? [] : mealIds;
}

function addMealToFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
        <img 
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        ><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');

    btn.addEventListener('click', () => {
        removeMealsFromLocalStorage(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener('click', () => {
        showMealInfo(mealData);
    })

    favoriteContainer.appendChild(favMeal);
}

async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = '';
    const mealIds = getMealsFromLocalStorage();

    const meals = [];

    for (let i=0; i< mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealToFav(meal);
    }

    console.log(meals);
    //add them to the screen
}

function showMealInfo(mealData) {
    //clean it up
    mealInfoEl.innerHTML = '';
    //update the meal info
    const mealEl = document.createElement('div');

    const ingredients = [];
    //get ingr and measures
    for(let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>${mealData.strInstructions}</p>
        <h3>List of ingredients</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    //update meal info + show
    mealInfoEl.appendChild(mealEl);
    //show the popup
    mealPopup.classList.remove('hidden');
}

searchBtn.addEventListener('click', async () => {
    //clean the container
    mealsEl.innerHTML = '';
    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);
    
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
})

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
});