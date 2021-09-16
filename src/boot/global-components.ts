//  global-components.js
//
//  Created by Kalila L. & Heather Anderson on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This file defines global Vue components.
//

import { boot } from "quasar/wrappers";

// Components -> Overlays
import Audio from "@Components/overlays/settings/Audio.vue";
import ChatWindow from "@Components/overlays/chat/ChatWindow.vue";
import Explore from "@Components/overlays/explore/Explore.vue";
import People from "@Components/overlays/people/People.vue";
// Components -> Dialogs
import Login from "@Components/dialogs/Login.vue";
// Components -> Components
import MetaverseLogin from "@Components/components/login/MetaverseLogin.vue";
import MetaverseRegister from "@Components/components/login/MetaverseRegister.vue";

export default boot(({ app }) => {
    // Components -> Overlays
    app.component("Audio", Audio);
    app.component("ChatWindow", ChatWindow);
    app.component("Explore", Explore);
    app.component("People", People);
    // Components -> Dialogs
    app.component("Login", Login);
    // Components -> Components
    app.component("MetaverseLogin", MetaverseLogin);
    app.component("MetaverseRegister", MetaverseRegister);
});
