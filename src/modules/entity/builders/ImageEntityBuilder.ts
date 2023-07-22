//
//  ImageEntityBuilder.ts
//
//  Created by Nolan Huang on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity, IImageEntity } from "../EntityInterfaces";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";
import { GameObject } from "@Base/modules/object";
import { ImageEntityController } from "../components";

export class ImageEntityBuilder extends AbstractEntityBuilder {
    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity): void {
        gameObject.addComponent(new ImageEntityController(entity as IImageEntity));
    }
}
