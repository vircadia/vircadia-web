//
//  AbstractEntityBuilder.ts
//
//  Created by Nolan Huang on 9 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { GameObject } from "@Modules/object";
import { IEntity } from "../EntityInterfaces";

export abstract class AbstractEntityBuilder {
    public abstract build(gameObject: GameObject, entity: IEntity): void;
}
