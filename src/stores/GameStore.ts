import React from "react";
import { computed, makeObservable, observable, action } from "mobx";
import { GameState, IconType, SkillActivation, TEST_INITIAL_GAME_STATE, advanceTurnOrder, canTriggerSkill, getCurrentCharacter, getSelectedSkill, getValidTargets, triggerSkill } from "../utils/GameLogic";

export class GameStore {
    constructor() {
        makeObservable(this);
    }

    @observable gameState: GameState = TEST_INITIAL_GAME_STATE;
    @observable selectedSkillActivation: SkillActivation | null = null;

    @computed
    get turnOrder() {
        //TODO: move to gamelogic
        const sortedState = [...this.gameState.characters];
        sortedState.sort((a, b) => b.initiative - a.initiative);
        return sortedState.map(x => x.iconType);
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
            ? this.selectedSkillActivation.targets.reduce((acc: { [key in IconType]?: number }, index) => {
                acc[this.characters[index].iconType] = (acc[this.characters[index].iconType] || 0) + 1;
                return acc;
            }, {})
            : null;
    }

    @action.bound
    onSkillSelected = (skillIndex: number) => {
        this.selectedSkillActivation = { skillIndex: skillIndex, targets: [] };
        this.triggerSkill();
    }

    @action.bound
    onTargetSelected = (targetIndex: number) => {
        this.selectedSkillActivation!.targets.push(targetIndex);
        this.triggerSkill();
    }

    @action.bound
    triggerSkill = () => {
        if (!this.selectedSkillActivation) {
            return;
        }

        if (canTriggerSkill(this.gameState, this.selectedSkillActivation)) {
            this.gameState = triggerSkill(this.gameState, this.selectedSkillActivation);
            this.advanceTurnOrder();
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