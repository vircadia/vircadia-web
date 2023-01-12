//
//  soundEffects.ts
//
//  Created by Giga on 12 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SFXMessageNotification from "@Base/assets/audio/bubblepop.ogg";

const SFX = {
    SFXMessageNotification
};

const DEFAULT_SFX_VOLUME = 0.5;

/**
 * Play a sound effect.
 * @param sound The sound effect to play.
 * @param loop Set `true` to loop the sound effect (optional).
 * @param volume The volume of the sound effect (optional).
 */
export async function playSound(sound: keyof typeof SFX, loop = false, volume = DEFAULT_SFX_VOLUME): Promise<void> {
    // Create the audio element for the sound effect.
    const newSoundEffect = new Audio(SFX[sound]);

    // Configure the audio element.
    newSoundEffect.loop = Boolean(loop);
    newSoundEffect.volume = Number(volume);

    // Play the sound effect.
    await newSoundEffect.play();
}
