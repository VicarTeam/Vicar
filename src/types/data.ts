﻿export interface IBook {
    id: number;
    clans: number[];
    merits: number[];
    backgrounds: number[];
    predatorTypes: number[];
}

export interface IEdition {
    languages: string[];
    books: IBook[];
}

export interface IClan {
    id: number;
    name: string;
    slogan: string;
    description: string;
    disciplines: number[];
}

export interface IDiscipline {
    id: number;
    name: string;
    nicknames: string[];
    summary?: string;
    properties: IDisciplineProperties;
    levels: { [key: number]: IDisciplineAbility[] };
    note?: string;
}

export interface IDisciplineProperties {
    summary?: string;
    type: "Geistig" | "Körperlich" | "Magie";
    threat: string;
    resonance: string;
}

export interface IRestrictionHolder {
    restriction?: IRestriction;
}

export interface IDisciplineCombo {
    id: number;
    level: number;
}

export interface IDisciplineAbility {
    id: number;
    name: string;
    combination?: IDisciplineCombo;
    requirement?: number;
    summary: string;
    costs: string;
    diceSupplies?: string;
    system: string;
    alternatives: string[];
    duration: string;
}

export interface IPredatorType extends IRestrictionHolder {
    id: number;
    name: string;
    description: string;
    actions: IPTAction[];
}

export interface IPTAction extends IRestrictionHolder {
    description: string;
    type: PTActionType;
    data: any;
}

export enum PTActionType {
    AdditionalSpecialization = "additional_specialization",
    DisciplinePoint = "discipline_point",
    HumanityChange = "humanity_change",
    AddMerit = "add_merit",
    AddBackground = "add_background",
    AddBackgroundPoints = "add_background_points",
    AddFlaw = "add_flaw",
    BloodPotencyChange = "blood_potency_change",
    SpendBackgroundPointsBetween = "spend_background_points_between",
    SpendFlawPointsBetween = "spend_flaw_points_between",
}

export interface IRestriction {
    type: RestrictionType;
    data: any;
}

export enum RestrictionType {
    SpecificClans = "only_clans", // data = [clanIds]
    ExcludeClans = "exclude_clans", // data = [clanIds]
    MinimumCharacterValue = "minimum_character_value", // data = {value: number, key: string}
    BookActivated = "book_activated", // data = [bookIds] (orX)
    MaxGeneration = "max_generation", // data = numeric generation (must have this generation or less)
    MaxBloodPotency = "max_blood_potency", // data = numeric blood potency (must have this potency or less)
}

export enum TraitSpecialRules {
    None = "none",
    Allies = "allies",
    Haven = "haven",
    Mask = "mask",
}

/**
 * The interface combining merits and backgrounds.
 */
export interface ITraitPack extends IRestrictionHolder {
    id: number;
    name: string;
    description: string;
    isCombinable: boolean;
    specialRules: TraitSpecialRules;
    advantages: ITrait[];
    disadvantages: ITrait[];
}

export interface IFlawChoice {
    type: "background" | "merit";
    id: number;
    flawId: number;
    customLevel?: number;
    suffix?: string;
}

export interface ITraitRequirement {
    type: "or";
    values: number[];
}

export interface ITraitRepeatRestriction {
    size?: number;
    amount: number;
}

export interface ITrait extends IRestrictionHolder {
    id: number;
    level: 1 | 2 | 3 | 4 | 5;
    name: string;
    description: string;
    isRepeatable: boolean;
    actions: ITraitAction[];
    requirement?: ITraitRequirement;
    restrictRepeats?: ITraitRepeatRestriction;
}

export const DefaultTrait: ITrait = {
    id: 0,
    level: 1,
    name: "",
    description: "",
    isRepeatable: false,
    actions: [],
    restriction: undefined
};

export interface ITraitAction {
    description: string;
    type: TraitActionType;
    data: any;
}

export enum TraitActionType {
    CapSkill = "cap_skill",
}

export interface ISkillSpread {
    amount: number;
    points: number;
}

export interface ISkillSpreadType {
    id: number;
    spreads: ISkillSpread[];
}

export const DefinedSpreadTypes: ISkillSpreadType[] = [
    {
        id: 1,
        spreads: [
            {
                amount: 1,
                points: 3
            },
            {
                amount: 8,
                points: 2
            },
            {
                amount: 10,
                points: 1
            }
        ]
    },
    {
        id: 2,
        spreads: [
            {
                amount: 3,
                points: 3
            },
            {
                amount: 5,
                points: 2
            },
            {
                amount: 7,
                points: 1
            }
        ]
    },
    {
        id: 3,
        spreads: [
            {
                amount: 1,
                points: 4
            },
            {
                amount: 3,
                points: 3
            },
            {
                amount: 3,
                points: 2
            },
            {
                amount: 3,
                points: 1
            }
        ]
    }
];
