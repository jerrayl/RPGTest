import { deepCopy, pick } from "./Helpers";

export enum IconType {
    Book,
    Knife,
    Shield,
    Staff,
    Enemy1
}

export enum Element {
    Fire,
    Ice,
    Lightning
}

export enum Effect {
    Burn,
    FlameInfusion,
    Freeze,
    Accelerate,
    Electrify,
    Energize
}

export enum SkillTarget {
    Self,
    Ally,
    Enemy,
    Any,
    RandomAlly,
    RandomEnemy,
}

export enum CharacterType {
    Player,
    Enemy
}

export type Character = {
    maxHealth: number;
    speed: number;
    iconType: IconType;
    characterType: CharacterType;
}

export type Enemy = Character & {
    skills: EnemySkill[];
}

export type Player = Character & {
    skills: PlayerSkill[];
}

export type CharacterState = {
    health: number;
    initiative: number;
    element: Element;
    effects: { [key in Effect]: number };
}

export type EnemyState = Enemy & CharacterState & {
}

export type PlayerState = Player & CharacterState & {
}

export type BaseSkill = {
    name: string;
    target: SkillTarget;
    targetCount: number;
    potency: number;
    effectProcChance: number;
    tauntPercentage?: number;
}

export type WeaponSkill = BaseSkill & {
}

export type PlayerSkill = WeaponSkill & {
}

export type EnemySkill = BaseSkill & {
}

export type GameState = {
    characters: (PlayerState | EnemyState)[];
    currentCharacterIndex: number;
}

export type SkillActivation = {
    skillIndex: number;
    targets: number[];
}

export type EnemyBehaviorMap = {
    skillSelectionFunction: () => number;
    targetingFunctions: ((() => number[]) | null)[]
}

export const DEFAULT_EFFECTS = {
    [Effect.Burn]: 0,
    [Effect.FlameInfusion]: 0,
    [Effect.Freeze]: 0,
    [Effect.Accelerate]: 0,
    [Effect.Electrify]: 0,
    [Effect.Energize]: 0
}

export const TURN_THRESHOLD = 100;

export const getSkillDescription = (skill: BaseSkill) => {
    const singleTargetMap =
    {
        [SkillTarget.Self]: "self",
        [SkillTarget.Ally]: "an ally",
        [SkillTarget.Enemy]: "an enemy",
        [SkillTarget.Any]: "any target",
        [SkillTarget.RandomAlly]: "a random ally",
        [SkillTarget.RandomEnemy]: "a random enemy"
    };

    const multiTargetMap =
    {
        [SkillTarget.Self]: "self",
        [SkillTarget.Ally]: "allies",
        [SkillTarget.Enemy]: "enemies",
        [SkillTarget.Any]: "targets",
        [SkillTarget.RandomAlly]: "random allies",
        [SkillTarget.RandomEnemy]: "random enemies"
    }

    const potency = skill.potency > 0 ? `Heal ${skill.potency} to` : `Deal ${skill.potency * -1} damage to`;
    const target = skill.targetCount === 1 ? singleTargetMap[skill.target] : `${skill.targetCount}  ${multiTargetMap[skill.target]}`;
    return `${skill.name} - ${potency} ${target}`;
}

export const getCurrentCharacter = (gameState: GameState): PlayerState | EnemyState => {
    return gameState.characters[gameState.currentCharacterIndex];
}

export const getSelectedSkill = (gameState: GameState, skillIndex: number) => {
    return getCurrentCharacter(gameState).skills[skillIndex];
}

export const filterCharacters = (characters: (PlayerState | EnemyState)[], characterType: CharacterType) => {
    return characters
        .map((character, i) => character.characterType === characterType ? i : null)
        .filter(x => x !== null) as number[];
}

export const flipCharacterType = (characterType: CharacterType) => {
    return characterType === CharacterType.Player ? CharacterType.Enemy : CharacterType.Player;
}

export const getValidTargets = (gameState: GameState, skillIndex: number): number[] => {
    const currentCharacter = getCurrentCharacter(gameState);
    const skill = getSelectedSkill(gameState, skillIndex);

    if (skill.target === SkillTarget.Self) {
        return [gameState.currentCharacterIndex];
    }

    if (skillIsRandom(skill) || skill.target === SkillTarget.Any) {
        return gameState.characters.map((_, i) => i);
    }

    if (skill.target === SkillTarget.Ally) {
        return filterCharacters(gameState.characters, currentCharacter.characterType);
    }

    if (skill.target === SkillTarget.Enemy) {
        return filterCharacters(gameState.characters, flipCharacterType(currentCharacter.characterType));
    }

    throw Error("Invalid argument");
}

export const getEnemySkillActivation = (gameState: GameState): SkillActivation => {
    const behaviors = ENEMY_BEHAVIORS[getCurrentCharacter(gameState).iconType]!;
    const skillIndex = behaviors.skillSelectionFunction();
    const targetingFunction = behaviors.targetingFunctions[skillIndex];
    return { skillIndex: skillIndex, targets: targetingFunction ? targetingFunction() : [] };
}

export const advanceTurnOrder = (gameState: GameState): GameState => {
    const newState = deepCopy(gameState);
    while (newState.characters.filter(x => x.initiative > TURN_THRESHOLD).length === 0) {
        newState.characters.forEach(character => {
            character.initiative += character.speed;
            //Todo: Add effect modifiers
        });
    }

    const maxInitiativeCharacters = newState.characters.reduce((acc, char, index) => {
        if (acc.maxInitiative < char.initiative) {
            acc.maxInitiative = char.initiative;
            acc.indexes = [index];
        } else if (acc.maxInitiative === char.initiative) {
            acc.indexes.push(index);
        }
        return acc;
    }, { maxInitiative: Number.MIN_SAFE_INTEGER, indexes: [] as number[] });

    newState.currentCharacterIndex = pick(maxInitiativeCharacters.indexes);
    return newState;
}

export const skillIsRandom = (skill: BaseSkill) => {
    return [SkillTarget.RandomAlly, SkillTarget.RandomEnemy].includes(skill.target);
}

export const canTriggerSkill = (gameState: GameState, skillActivation: SkillActivation) => {
    const skill = getSelectedSkill(gameState, skillActivation.skillIndex);

    return skillIsRandom(skill) ||
        skill.targetCount === skillActivation.targets.length;
}

export const getRandomTargets = (gameState: GameState, skillActivation: SkillActivation): SkillActivation => {
    const newSkillActivation = deepCopy(skillActivation);
    const currentCharacter = getCurrentCharacter(gameState);
    const skill = getSelectedSkill(gameState, skillActivation.skillIndex);

    if (skillIsRandom(skill)) {
        const validTargets = filterCharacters(gameState.characters, skill.target === SkillTarget.RandomAlly
            ? currentCharacter.characterType
            : flipCharacterType(currentCharacter.characterType)
        );

        //Skew chance of picking targets based on taunt/electrify
        [...Array(skill.targetCount)].forEach(() => newSkillActivation.targets.push(pick(validTargets)));
    }   

    return newSkillActivation;
}

export const triggerSkill = (gameState: GameState, skillActivation: SkillActivation): GameState => {
    const newState = deepCopy(gameState);
    const skill = getSelectedSkill(gameState, skillActivation.skillIndex);

    skillActivation.targets.forEach(targetIndex => {
        const target = newState.characters[targetIndex];
        target.health += skill.potency;

        if (target.health > target.maxHealth) {
            target.health = target.maxHealth;
        }
        // Add triggers for life decreasing beyond total
    });

    newState.characters[gameState.currentCharacterIndex].initiative = 0;

    return newState;
}


export const ENEMY_BEHAVIORS: { [key in IconType]?: EnemyBehaviorMap } = {
    [IconType.Enemy1]: {
        skillSelectionFunction: () => pick([0, 1]),
        targetingFunctions: [null, () => [0, 1, 2, 3]]
    }
}

export const TEST_INITIAL_GAME_STATE: GameState = {
    characters: [
        {
            iconType: IconType.Book,
            characterType: CharacterType.Player,
            health: 25,
            maxHealth: 25,
            speed: 17,
            initiative: 17,
            element: Element.Lightning,
            skills: [{
                name: "Heal",
                target: SkillTarget.Ally,
                targetCount: 1,
                potency: 20,
                effectProcChance: 0.1,
            }],
            effects: DEFAULT_EFFECTS
        },
        {
            iconType: IconType.Knife,
            characterType: CharacterType.Player,
            health: 30,
            maxHealth: 30,
            speed: 20,
            initiative: 20,
            element: Element.Fire,
            skills: [{
                name: "Stab",
                target: SkillTarget.Enemy,
                targetCount: 1,
                potency: -30,
                effectProcChance: 0.4,
            }],
            effects: DEFAULT_EFFECTS
        },
        {
            iconType: IconType.Shield,
            characterType: CharacterType.Player,
            health: 50,
            maxHealth: 50,
            speed: 19,
            initiative: 19,
            element: Element.Fire,
            skills: [{
                name: "Taunt",
                target: SkillTarget.Enemy,
                targetCount: 1,
                potency: -10,
                effectProcChance: 0.1,
                tauntPercentage: 0.4,
            }],
            effects: DEFAULT_EFFECTS
        },
        {
            iconType: IconType.Staff,
            characterType: CharacterType.Player,
            health: 25,
            maxHealth: 25,
            speed: 18,
            initiative: 18,
            element: Element.Fire,
            skills: [{
                name: "Blast",
                target: SkillTarget.Enemy,
                targetCount: 5,
                potency: -15,
                effectProcChance: 0.3,
            }],
            effects: DEFAULT_EFFECTS
        },
        {
            iconType: IconType.Enemy1,
            characterType: CharacterType.Enemy,
            health: 100,
            maxHealth: 100,
            speed: 15,
            initiative: 15,
            element: Element.Fire,
            skills: [
                {
                    name: "Big bonk",
                    target: SkillTarget.RandomEnemy,
                    targetCount: 1,
                    potency: -20,
                    effectProcChance: 0.5
                },
                {
                    name: "Small bonks",
                    target: SkillTarget.Enemy,
                    targetCount: 4,
                    potency: -5,
                    effectProcChance: 0.1
                }
            ],
            effects: DEFAULT_EFFECTS
        }
    ],
    currentCharacterIndex: 1
}