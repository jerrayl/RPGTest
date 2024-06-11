import React from "react";
import { computed, makeObservable, observable, action, IObservableArray } from "mobx";
import { CharacterType, GameHistory, GameState, IconType, SkillActivation, TEST_INITIAL_GAME_STATE, advanceTurnOrder, canTriggerSkill, getCurrentCharacter, getEnemySkillActivation, getRandomTargets, getSelectedSkill, getTurnOrder, getValidTargets, triggerSkill } from "../utils/GameLogic";

export type TurnOrderCharacter = {
    iconType: IconType;
    turnOrderDescription: string;
}

export class GameStore {
    constructor() {
        makeObservable(this);
    }

    @observable gameState: GameState = TEST_INITIAL_GAME_STATE;
    @observable selectedSkillActivation: SkillActivation | null = null;
    @observable gameHistoryHovered = false;

    @computed
    get turnOrder() {
        return getTurnOrder(this.gameState);
    }

    @computed
    get currentCharacter() {
        return getCurrentCharacter(this.gameState);
    }

    @computed
    get selectedSkill() {
        return this.selectedSkillActivation ? getSelectedSkill(this.gameState, this.selectedSkillActivation.skillIndex) : null;
    }

    @computed
    get validTargets() {
        return this.selectedSkillActivation ? getValidTargets(this.gameState, this.selectedSkillActivation.skillIndex) : [];
    }

    @computed
    get characters() {
        return this.gameState.characters.map((x, i) => ({ ...x, index: i, isValidTarget: this.validTargets.includes(i) }));
    }

    @computed
    get selectedTargets() {
        return this.selectedSkillActivation
            ? this.selectedSkillActivation.targets
            : null;
    }

    @action.bound
    onSkillSelected = (skillIndex: number) => {
        this.selectedSkillActivation = { skillIndex: skillIndex, targets: {} };
        this.triggerSkill();
    }

    @action.bound
    onTargetSelected = (targetIndex: number) => {
        this.selectedSkillActivation!.targets[targetIndex] = (this.selectedSkillActivation!.targets[targetIndex] ?? 0) + 1;
        this.triggerSkill();
    }

    @action.bound
    triggerSkill = () => {
        if (!this.selectedSkillActivation) {
            return;
        }
        if (canTriggerSkill(this.gameState, this.selectedSkillActivation)) {
            this.selectedSkillActivation = getRandomTargets(this.gameState, this.selectedSkillActivation)
            this.gameState = triggerSkill(this.gameState, this.selectedSkillActivation);
            this.advanceTurnOrder();

            if (this.currentCharacter.characterType === CharacterType.Enemy) {
                this.selectedSkillActivation = getEnemySkillActivation(this.gameState);
                this.triggerSkill();
            }
        }
    }

    @action.bound
    advanceTurnOrder = () => {
        this.selectedSkillActivation = null;
        this.gameState = advanceTurnOrder(this.gameState);
    }
}

const storeContext = React.createContext(new GameStore());
export const useStores = () => React.useContext(storeContext);