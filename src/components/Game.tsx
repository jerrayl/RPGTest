import { observer } from 'mobx-react';
import { ActionHistory, useStores } from '../stores/GameStore';
import { characterIcons } from '../icons/CharacterIcons';
import { BaseSkill, CharacterType, IconType, getSkillDescription } from '../utils/GameLogic';

interface CharacterPortrait {
    iconType: IconType;
    health: number;
    maxHealth: number;
    isValidTarget: boolean;
    onSelectTarget: () => void;
}

export const CharacterPortrait = observer(({ iconType, health, maxHealth, isValidTarget, onSelectTarget }: CharacterPortrait) => {
    return (
        <div>
            <div className={`${isValidTarget ? "border border-4 rounded border-gray-300 hover:border-gray-400" : ""}`} onClick={onSelectTarget}>
                <img className="w-24 h-24" src={characterIcons[iconType]} />
            </div>
            <div className="w-full bg-gray-200 rounded-full mt-1">
                <div className="bg-red-600 text-xs font-medium text-red-100 text-center p-0.5 leading-none rounded-full" style={{ width: health / maxHealth * 100 + "%" }}> {health}/{maxHealth}</div>
            </div >
        </div >
    )
});

interface TurnOrderProps {
    order: IconType[];
}

export const TurnOrder = observer(({ order }: TurnOrderProps) => {
    return (
        <div className='flex flex-col gap-2 [&>*:first-child]:bg-gray-50 [&>*:first-child]:border-2 ml-4 mt-4'>
            {order.map((x, i) =>
                <div
                    key={`turn-order-${i}`}
                    className="bg-gray-200 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 flex items-center">
                    <img className='w-12 h-12' src={characterIcons[x]} />
                </div>)}
        </div>
    )
});

interface PlayerSkillDisplayProps {
    skills: BaseSkill[];
    onSkillSelected: (skillIndex: number) => void;
}

export const PlayerSkillDisplay = observer(({ skills, onSkillSelected }: PlayerSkillDisplayProps) => {
    return (
        <div className='flex flex-col gap-2 mt-4 row-span-3'>
            {skills.map((skill, i) =>
                <div
                    key={`skill-${i}`}
                    onClick={() => onSkillSelected(i)}
                    className="bg-gray-100 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 flex items-center cursor-pointer hover:bg-gray-50 hover:border-gray-200">
                    <h2>{getSkillDescription(skill)}</h2>
                </div>)}
        </div>
    )
});

interface ActionHistoryRowProps {
    h: ActionHistory;
    i?: number;
}

export const ActionHistoryRow = observer(({ h, i = 0 }: ActionHistoryRowProps) => {
    return (
        <div
            className="bg-gray-100 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 flex justify-center items-center">
            <img className="w-8 h-8" src={characterIcons[h.characterIcon]} />
            <h2 className='ml-1'>used {h.skillName} on </h2>
            {h.targets && Object.keys(h.targets).map((x) =>
                <div
                    key={`actionHistoryTarget-${i}-${x}`}
                    className='flex items-center gap-2 ml-1'
                >
                    <img className="w-8 h-8" src={characterIcons[x as any as IconType]} />
                    <h2>{(h.targets[x as any as IconType] as number > 1) && h.targets[x as any as IconType]}</h2>
                </div>
            )}
        </div>
    )
});



interface ActionHistoryDisplayProps {
    actionHistoryHovered: boolean;
    toggleHistoryHovered: (hovered: boolean) => void;
    history: ActionHistory[];
}

export const ActionHistoryDisplay = observer(({ actionHistoryHovered, history, toggleHistoryHovered }: ActionHistoryDisplayProps) => {
    return (
        <div className='row-span-1 flex flex-col gap-2 mt-4 overflow-y-auto'
            onMouseOver={() => toggleHistoryHovered(true)}
            onMouseLeave={() => toggleHistoryHovered(false)}
        >
            {actionHistoryHovered && history.map((h, i) => <ActionHistoryRow key={`history-${i}`} h={h} i={i} />)}
            {!actionHistoryHovered && history.length > 0 && <ActionHistoryRow h={history[history.length - 1]} />}
        </div>
    )
});


interface SelectedSkillDisplayProps {
    skill: BaseSkill | null;
    targets: { [key in IconType]?: number } | null;
}

export const SelectedSkillDisplay = observer(({ skill, targets }: SelectedSkillDisplayProps) => {
    return (
        skill &&
        <div className='bg-gray-100 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 w-64 flex justify-center my-6'>
            <div className='flex flex-col items-center'>
                <h2 className='text-xl font-bold mb-4'>{skill.name}</h2>
                {targets && Object.keys(targets).map((x, i) =>
                    <div
                        key={`skill-target-${i}`}
                        className='flex items-center gap-6'
                    >
                        <img className="w-16 h-16" src={characterIcons[x as any as IconType]} />
                        <h2 className='text-lg'>{targets[x as any as IconType]}</h2>
                    </div>
                )}
            </div>
        </div>
    )
});


export const Game = observer(() => {
    const store = useStores();
    return (
        <div className='grid grid-cols-12 select-none'>
            <div className='col-span-3 flex'>
                <TurnOrder order={store.turnOrder} />
            </div>
            <div className='grid grid-rows-10 col-span-6 h-screen'>
                <ActionHistoryDisplay
                    history={store.actionHistory}
                    actionHistoryHovered={store.actionHistoryHovered}
                    toggleHistoryHovered={(hovered: boolean) => store.actionHistoryHovered = hovered}
                />
                <div className='flex justify-center gap-10 row-span-3'>
                    {store.characters.filter(x => x.characterType === CharacterType.Enemy).map(character =>
                        <CharacterPortrait
                            key={character.iconType}
                            iconType={character.iconType}
                            health={character.health}
                            maxHealth={character.maxHealth}
                            isValidTarget={character.isValidTarget}
                            onSelectTarget={() => { if (character.isValidTarget) store.onTargetSelected(character.index) }}
                        />
                    )}
                </div>
                <div>
                    <div className='flex justify-center gap-10 row-span-3'>
                        {store.characters.filter(x => x.characterType === CharacterType.Player).map(character =>
                            <CharacterPortrait
                                key={character.iconType}
                                iconType={character.iconType}
                                health={character.health}
                                maxHealth={character.maxHealth}
                                isValidTarget={character.isValidTarget}
                                onSelectTarget={() => { if (character.isValidTarget) store.onTargetSelected(character.index) }}
                            />
                        )}
                    </div>
                    {store.currentCharacter.characterType === CharacterType.Player &&
                        <PlayerSkillDisplay skills={store.currentCharacter.skills} onSkillSelected={store.onSkillSelected} />
                    }
                </div>
            </div>
            <div className='col-span-3 flex justify-center'>
                <SelectedSkillDisplay skill={store.selectedSkill} targets={store.selectedTargets} />
            </div>
        </div>
    );
});