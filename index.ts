import { IDish, IKitchenSettingsPayloadParams, IRegenerateResponse, TDishSize, TKitchenData, TKitchenName, TKitchenSettings } from './types';
import { calcKitchenCapacity, calculateDishByTechCard, checkKitchenCanCookAllDishes, setDishForKitchen, sortBySize } from './fns';


// incoming payload
const kithcenPayloadParams: Record<TKitchenName, IKitchenSettingsPayloadParams> = {
  SFOOD: {isVege: false, revenue: 0.33, maxTotal: 1700, ignoredMeals: []},
  JLV: {isVege: false, revenue: 0.33, maxTotal: 3700, ignoredMeals: []},
  SkyPort: {isVege: false, revenue: 0.33, maxTotal: 3700, ignoredMeals: []},
  Trojanka: {isVege: true, revenue: 0.33, maxTotal: 3700, ignoredMeals: []},
};

const kitchens: TKitchenName[] = []; //['SFOOD', 'JLV', 'SkyPort', 'Trojanka'];
const veganKitchens: TKitchenName[] = []; // ['Trojanka'];

// @ts-ignore
const kitchenSettings: TKitchenSettings = {};

const kitchenData: TKitchenData = {}; // using for response
const dishes: IDish[] = [
  {
    techcardId: '5e4d49d2a6abc30069431d6d',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 3
  },
  {
    techcardId: '5e4d49d2a6abc30069431d6b',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6abc3006943',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6abc30069431d6d',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6abc30069431d6d',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6abc30069431d6d',
    dishSize: 1.5,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6',
    dishSize: 1.5,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6abc3006',
    dishSize: 2,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2a6abc30069431d',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: false,
    meal: 4
  },
  {
    techcardId: '5e4d49d2',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: true,
    meal: 4
  },
  {
    techcardId: '5e4d49d2',
    dishSize: 1,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: true,
    meal: 4
  },
  {
    techcardId: '5e4d49d2',
    dishSize: 1.5,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: true,
    meal: 4
  },
  {
    techcardId: '5e4d49',
    dishSize: 2,
    foodcost: 39.22,
    isSmallBox: false,
    isVege: true,
    meal: 4
  },
];

const dishByTechCard: Record<string, number> = {}; // calc amount by techcard

const veganDishes1: IDish[] = [];
const veganDishes1_5: IDish[] = [];
const veganDishes2: IDish[] = [];
const dishesSize1: IDish[] = [];
const dishesSize1_5: IDish[] = [];
const dishesSize2: IDish[] = [];

let kitchensVeganCapacity = 0;
let kitchensCapacity = 0;


Object.keys(kithcenPayloadParams).forEach((kitchenName) => {
  const {maxTotal, ignoredMeals, revenue, isVege} = kithcenPayloadParams[kitchenName as TKitchenName];

  kitchens.push(kitchenName as TKitchenName);
  isVege && veganKitchens.push(kitchenName as TKitchenName);
  isVege ? kitchensVeganCapacity += maxTotal : kitchensCapacity += maxTotal;

  kitchenSettings[kitchenName as TKitchenName] = {
    revenueInNumber: calcKitchenCapacity(dishes.length, revenue * 100), // calc from percent to number of dishes
    amountOfDishesTaken: 0,
    ignoredMeals,
    maxTotal,
    isVege,
}
});

dishes.forEach((dish) => {
  sortBySize(dish, veganDishes1, veganDishes1_5, veganDishes2, dishesSize1, dishesSize1_5, dishesSize2);
  calculateDishByTechCard(dish, dishByTechCard);
});

// we have limit - no more then 7 dishes to one kitchen.
const canCook = checkKitchenCanCookAllDishes(dishByTechCard, kitchens.length);
if (!canCook) throw new Error("Couldn't cook more then 7 dishes by kitchen");

if ([...veganDishes1, ...veganDishes1_5, ...veganDishes2].length > kitchensVeganCapacity) throw new Error("Not enough vegan kitchen capacity");
if ([...dishesSize1, ...dishesSize1_5, ...dishesSize2].length > kitchensVeganCapacity) throw new Error("Not enough kitchen capacity");

[...veganDishes1, ...veganDishes1_5, ...veganDishes2].forEach(setDishForKitchen(veganKitchens, kitchenSettings, kitchenData));
[...dishesSize1, ...dishesSize1_5, ...dishesSize2].forEach(setDishForKitchen(kitchens, kitchenSettings, kitchenData));

console.log(kitchenData);
// console.log(JSON.stringify(kitchenData));

const response: IRegenerateResponse[] = [];

Object.keys(kitchenData).map((kitchenName, kitchenIdx) => {
  const kitchen = kitchenData[kitchenName];
  if (!kitchen) return;
  Object.keys(kitchen).map((portionSizeKey) => {
    const portionSize = kitchen[portionSizeKey as unknown as TDishSize];
    Object.keys(portionSize).map((techCardIdKey) => {
      const techcardInTheKithen = portionSize[techCardIdKey];
      response.push({bin: String(kitchenIdx), ...techcardInTheKithen});
    });
  })
});

console.log(response);