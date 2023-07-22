//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Metaverse } from "@Modules/metaverse/metaverse";

export class MetaverseManager {
    /**
     * The currently connected Metaverse server.
     */
    public static activeMetaverse: Nullable<Metaverse>;

    /**
     * Create a new Metaverse server connection.
     * @param url `(Optional)` The URL of the Metaverse server.
     * @param setToActive `(Optional)` Set the new Metaverse connection to be the active connection for the application.
     * @returns A new Metaverse connection instance.
     */
    public static async metaverseFactory(url?: string, setToActive = false): Promise<Metaverse> {
        const metaverse = new Metaverse();
        if (typeof url === "string" && url.length > 0) {
            await metaverse.setMetaverseUrl(url);
        }
        if (setToActive) {
            this.activeMetaverse = metaverse;
        }
        return metaverse;
    }
}
