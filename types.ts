export enum MEAL_ENUM  {
  'Breakfast' = 0, // Breakfast
  'Snack1' = 1, // ‘1. Lunch’
  'Lunch' = 2, // Dinner
  'Snack2' = 3, // ‘2. Lunch’
  'Dinner' = 4, // Supper
  'SaladOfDiner' = 10,
  };

export type TDishSize = 1 | 1.5 | 2;

export interface IDish {
  techcardId: string;
  dishSize: TDishSize;
  foodcost: number,
  isSmallBox: boolean,
  isVege: boolean,
  meal: MEAL_ENUM;
}

export interface IKitchenDataInfo {
  dish: IDish;
  quantity: number;
};
export type TKitchenName = 'SFOOD' | 'JLV' | 'SkyPort' | 'Trojanka';

export interface IKitchenSettingsPayloadParams {
  isVege: boolean;
  ignoredMeals: MEAL_ENUM[];
  maxTotal: number; // 4500
  revenue: number; // float
}

export type TKitchenData = Partial<Record<string, TKithenDataAcc>>;
type TKithenDataAcc = Record<TDishSize, TKitchenTechcard>;
type TKitchenTechcard = Record<string, IKitchenDataInfo>;


export interface IKitchenSettings {
  maxTotal: number;
  revenueInNumber: number;
  amountOfDishesTaken: number;
  ignoredMeals: number[];
  isVege: boolean;
}

export type TKitchenSettings = Record<TKitchenName, IKitchenSettings>;

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export interface IRegenerateResponse {
  bin: string; // kitchenId as '5e8322442f054d003c083b04'
  dish: IDish;
  quantity: number;
}