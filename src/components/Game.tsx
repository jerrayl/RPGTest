import { observer } from 'mobx-react';
import { useStores } from '../stores/GameStore';
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
                <div className="bg-red-600 text-xs font-medium text-red-100 text-center p-0.5 leading-none rounded-full" style={{width: health / maxHealth * 100+"%"}}> {health}/{maxHealth}</div>
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
            {order.map(x =>
                <div className="bg-gray-200 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 flex items-center">
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
        <div className='flex flex-col gap-2 mt-4'>
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


interface SelectedSkilllDisplayProps {
    skill: BaseSkill | null;
    targets: { [key in IconType]?: number } | null;
}

export const SelectedSkilllDisplay = observer(({ skill, targets }: SelectedSkilllDisplayProps) => {
    return (
        skill &&
        <div className='bg-gray-100 rounded border border-gray-300 shadow shadow-lg rounded-b p-2 w-64 flex justify-center my-6'>
            <div className='flex flex-col items-center'>
                <h2 className='text-xl font-bold mb-4'>{skill.name}</h2>
                {targets && Object.keys(targets).map((x) =>
                    <div className='flex items-center gap-6'>
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
        <div className='grid grid-cols-12'>
            <div className='col-span-3 flex'>
                <TurnOrder order={store.turnOrder} />
            </div>
            <div className='flex flex-col justify-evenly col-span-6 h-screen'>
                <div className='flex justify-center gap-10'>
                    {store.characters.filter(x => x.characterType === CharacterType.Enemy).map(character =>
                        <CharacterPortrait
                            iconType={character.iconType}
                            health={character.health}
                            maxHealth={character.maxHealth}
                            isValidTarget={character.isValidTarget}
                            onSelectTarget={() => { if (character.isValidTarget) store.onTargetSelected(character.index) }}
                        />
                    )}
                </div>
                <div>
                    <div className='flex justify-center gap-10'>
                        {store.characters.filter(x => x.characterType === CharacterType.Player).map(character =>
                            <CharacterPortrait
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
                <SelectedSkilllDisplay skill={store.selectedSkill} targets={store.selectedTargets} />
            </div>
        </div>
    );
});