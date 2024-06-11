import { observer } from 'mobx-react';
import { TurnOrderCharacter, useStores } from '../stores/GameStore';
import { ActorType, BaseSkill, CharacterType, EffectType, GameHistory, IconType, getSkillDescription } from '../utils/GameLogic';
import { characterIcons } from '../icons/characterIcons';
import { effectIcons } from '../icons/effectIcons';

interface CharacterPortraitProps {
    iconType: IconType;
    health: number;
    maxHealth: number;
    isValidTarget: boolean;
    effects: { [key in EffectType]?: number };
    onSelectTarget: () => void;
}

export const CharacterPortrait = observer(({ iconType, health, maxHealth, isValidTarget, effects, onSelectTarget }: CharacterPortraitProps) => {
    return (
        <div>
            <div className={`border border-4 flex justify-center items-center ${isValidTarget ? "rounded border-gray-300 hover:border-gray-400" : "border-transparent"}`} onClick={onSelectTarget}>
                <img className="w-24 h-24" src={characterIcons[iconType]} />
            </div>
            <div className="bg-gray-600 w-28 rounded-full mt-1">
                <div className="absolute w-28 flex justify-center">
                    <h2 className="text-xs font-medium text-gray-100 ">{health}/{maxHealth}</h2>
                </div>
                <div className="bg-red-600 h-4 p-0.5 leading-none rounded-full" style={{ width: health / maxHealth * 100 + "%" }} />
            </div >
            <div className="flex h-6 mt-1">
                {Object.keys(effects).map(x => {
                    const effectType = x as any as EffectType;
                    return !!effects[effectType] && <img key={`effects-${iconType}-${x}`} className="w-6 h-6 rounded-md" src={effectIcons[effectType]} title={`${EffectType[effectType]}: ${effects[effectType]}`} />
                })}
            </div>
        </div >
    )
});

interface TurnOrderProps {
    order: TurnOrderCharacter[];
}

export const TurnOrder = observer(({ order }: TurnOrderProps) => {
    return (
        <div className='flex flex-col gap-2 [&>*:first-child]:bg-gray-50 [&>*:first-child]:border-2 ml-4 mt-4'>
            {order.map((x, i) =>
                <div
                    key={`turn-order-${i}`}
                    className="bg-gray-200 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 flex items-center">
                    <img 
                        className='w-12 h-12' 
                        src={characterIcons[x.iconType]} 
                        title={x.turnOrderDescription} 
                    />
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

interface GameHistoryRowProps {
    h: GameHistory;
    i?: number;
}

export const GameHistoryRow = observer(({ h, i = 0 }: GameHistoryRowProps) => {
    return (
        <div
            className="bg-gray-100 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 flex justify-center items-center">
            <img className="w-8 h-8" src={h.actorType === ActorType.Character ? characterIcons[h.actor as CharacterType] : effectIcons[h.actor as EffectType]} />
            {h.actionName ? <h2 className='ml-1'>used {h.actionName} on </h2>: <h2 className='ml-1'>affected </h2>}
            {h.targets && Object.keys(h.targets).map((x) =>
                <div
                    key={`actionHistoryTarget-${i}-${x}`}
                    className='flex items-center gap-2 ml-1'
                >
                    <img className="w-8 h-8" src={characterIcons[x as any as IconType]} />
                    <h2>{(h.targets[x as any as IconType] as number > 1) && h.targets[x as any as IconType]}</h2>
                </div>
            )}
            <h2 className='ml-1'>for {Math.abs(h.potency)} </h2>
        </div>
    )
});



interface GameHistoryDisplayProps {
    gameHistoryHovered: boolean;
    toggleHistoryHovered: (hovered: boolean) => void;
    history: GameHistory[];
}

export const GameHistoryDisplay = observer(({ gameHistoryHovered, history, toggleHistoryHovered }: GameHistoryDisplayProps) => {
    return (
        <div className='mt-4 row-span-1'
            onMouseOver={() => toggleHistoryHovered(true)}
            onMouseLeave={() => toggleHistoryHovered(false)}
        >
            <div>
                {gameHistoryHovered &&
                    <div className="max-h-40 flex flex-col-reverse gap-2 overflow-y-auto">
                        <div>
                            {history.map((h, i) => <GameHistoryRow key={`history-${i}`} h={h} i={i} />)}
                        </div>
                    </div>
                }
                {!gameHistoryHovered &&
                    history.length > 0 && <GameHistoryRow h={history[history.length - 1]} />
                }
            </div>
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
                <GameHistoryDisplay
                    history={store.gameState.gameHistory}
                    gameHistoryHovered={store.gameHistoryHovered}
                    toggleHistoryHovered={(hovered: boolean) => store.gameHistoryHovered = hovered}
                />
                <div className='flex justify-center gap-10 items-start row-span-3'>
                    {store.characters.filter(x => x.characterType === CharacterType.Enemy).map(character =>
                        <CharacterPortrait
                            key={character.iconType}
                            iconType={character.iconType}
                            health={character.health}
                            maxHealth={character.maxHealth}
                            isValidTarget={character.isValidTarget}
                            effects={character.effects}
                            onSelectTarget={() => { if (character.isValidTarget) store.onTargetSelected(character.index) }}
                        />
                    )}
                </div>
                <div className='flex justify-center items-end gap-10 row-span-3'>
                    {store.characters.filter(x => x.characterType === CharacterType.Player).map(character =>
                        <CharacterPortrait
                            key={character.iconType}
                            iconType={character.iconType}
                            health={character.health}
                            maxHealth={character.maxHealth}
                            isValidTarget={character.isValidTarget}
                            effects={character.effects}
                            onSelectTarget={() => { if (character.isValidTarget) store.onTargetSelected(character.index) }}
                        />
                    )}
                </div>
                {store.currentCharacter.characterType === CharacterType.Player &&
                    <PlayerSkillDisplay skills={store.currentCharacter.skills} onSkillSelected={store.onSkillSelected} />
                }
            </div>
            <div className='col-span-3 flex justify-center'>
                <SelectedSkillDisplay skill={store.selectedSkill} targets={store.selectedTargets} />
            </div>
        </div>
    );
});