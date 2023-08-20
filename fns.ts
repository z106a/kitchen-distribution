import _ from 'lodash';
import { IDish, IKitchenDataInfo, IKitchenSettings, MEAL_ENUM, TKitchenData, TKitchenName, TKitchenSettings } from "./types";

export const sortBySize = (dish: IDish, veganDishes1: IDish[], veganDishes1_5: IDish[], veganDishes2: IDish[], dishesSize1: IDish[], dishesSize1_5: IDish[], dishesSize2: IDish[]) => {
  switch (dish.dishSize) {
    case 1:
      dish.isVege ? veganDishes1.push(dish) : dishesSize1.push(dish);
      break;
    case 1.5:
      dish.isVege ? veganDishes1_5.push(dish) : dishesSize1_5.push(dish);
      break;
    case 2:
      dish.isVege ? veganDishes2.push(dish) :dishesSize2.push(dish);
      break;
    default:
      break;
  }
};

// we have limit - no more then 7 dishes to one kitchen.
export const checkKitchenCanCookAllDishes = (dishes: Record<string, number>, kitchensNumber: number) => {
  const techcardSum = Object.keys(dishes).reduce((acc, key) => acc + dishes[key], 0);
  return (7 * kitchensNumber) > techcardSum;
}

export const calculateDishByTechCard = (dish: IDish, dishByTechCard: Record<string, number>) => {
  dishByTechCard[dish.techcardId] = dishByTechCard[dish.techcardId] ? dishByTechCard[dish.techcardId] += 1 : 1;
};

export const calcKitchenCapacity = (dishesAmount: number, percent: number) => Math.ceil(dishesAmount / 100 * percent);

export const calcQuantity = (kitchenData: TKitchenData, currentKitchen: string, dish: IDish) => {
  const record = _.get(kitchenData, `[${currentKitchen}][${dish.dishSize}][${dish.techcardId}]`) as unknown as IKitchenDataInfo;

  const quantity = record?.quantity ? record.quantity += 1 : 1;
  _.setWith(
    kitchenData,
    `[${currentKitchen}][${dish.dishSize}][${dish.techcardId}]`,
    {...record, quantity},
    Object
  );
}


const checkKitchenRevenue = (kitchenName: TKitchenName, kitchenSettings: TKitchenSettings): boolean => {
  const kitchenSetting = kitchenSettings[kitchenName];

  return kitchenSetting.amountOfDishesTaken < kitchenSetting.revenueInNumber;
}

const hasIgnoredMeal = (kitchenName: TKitchenName, kitchenSettings: TKitchenSettings, dishMeal: MEAL_ENUM): boolean => {
  const kitchenSetting = kitchenSettings[kitchenName];

  return kitchenSetting.ignoredMeals.includes(dishMeal);
}

const findNextKitchen = (kitchens: TKitchenName[], kitchenSettings: TKitchenSettings, dish: IDish) => {
  if (!kitchens.length) throw new Error('No kitchen available');

  // try to find kitch with min 'amountOfDishesTaken'
  const amountOfDishesTakenArr = kitchens.map((kitchenName) => {
    const { amountOfDishesTaken } = kitchenSettings[kitchenName as TKitchenName] as IKitchenSettings;
    return amountOfDishesTaken;
  });

  /* keep from min to max in case the limit of the kitchen is full,
    then we have to take next min value
  */
  const amountOfDishesTakenArrSorted = [...amountOfDishesTakenArr].sort();

  // we always start to search the available kithen from min to max.
  const idxOfMin = amountOfDishesTakenArrSorted.findIndex((number) => {
    const idx = amountOfDishesTakenArr.indexOf(number);
    const kitchenName= kitchens[idx];

    // checking if kitchen has revenue capacity and can cook this type of meal
    return checkKitchenRevenue(kitchenName, kitchenSettings) && !hasIgnoredMeal(kitchenName, kitchenSettings, dish.meal);
  });

  // we couldn't find kitchen that can take another dish.
  if (idxOfMin === -1) throw new Error("Couldn't find next kitchen to cook");
  const idxOfKitchen = amountOfDishesTakenArr.indexOf(amountOfDishesTakenArrSorted[idxOfMin]);

  return idxOfKitchen;
}

const updateKitchenSettings = (kitchenSettings: TKitchenSettings, kitchenName: TKitchenName) => {
  // @ts-ignore
  kitchenSettings[kitchenName]?.amountOfDishesTaken += 1;
}

export const setDishForKitchen = (kitchens: TKitchenName[], kitchenSettings: TKitchenSettings, kitchenData: TKitchenData) => {
  let kitchenPointer = 0;

  return (dish: IDish) => {
    const currentKitchen = kitchens[kitchenPointer];

    _.updateWith(
      kitchenData,
      `[${currentKitchen}][${dish.dishSize}][${dish.techcardId}][dish]`,
      _.constant(dish),
      Object
    );

    calcQuantity(kitchenData, currentKitchen, dish);
    updateKitchenSettings(kitchenSettings, kitchens[kitchenPointer]);

    kitchenPointer = findNextKitchen(kitchens, kitchenSettings, dish);
  }
}