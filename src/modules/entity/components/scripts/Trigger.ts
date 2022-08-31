//
//  Trigger.ts
//
//  Created by Nolan Huang on 30 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Domain Modules
import { Renderer } from "@Modules/scene";
import { EntityScriptComponent } from "./EntityScript";

export abstract class Trigger extends EntityScriptComponent {

    public onInitialize(): void {
        const vscene = Renderer.getScene();
        this.triggerTarget = vscene.getMyAvatar();
    }
}
