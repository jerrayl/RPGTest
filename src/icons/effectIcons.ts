import { EffectType } from "../utils/GameLogic";
import accelerate from "./accelerate.png";
import burn from "./burn.png";
import channel from "./channel.png";
import electrify from "./electrify.png";
import energize from "./energize.png";
import flameInfuse from "./flameInfuse.png";
import freeze from "./freeze.png";
import guard from "./guard.png";
import punctured from "./punctured.png";
import taunt from "./taunt.png";
import unarmed from "./unarmed.png";


export const effectIcons = {
    [EffectType.Accelerate]: accelerate,
    [EffectType.Burn]: burn,
    [EffectType.Channel]: channel,
    [EffectType.Electrify]: electrify,
    [EffectType.Energize]: energize,
    [EffectType.FlameInfuse]: flameInfuse,
    [EffectType.Freeze]: freeze,
    [EffectType.Guard]: guard,
    [EffectType.Punctured]: punctured,
    [EffectType.Taunt]: taunt,
    [EffectType.Unarmed]: unarmed
}

