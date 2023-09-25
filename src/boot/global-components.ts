//
//  global-components.js
//
//  Created by Kalila L. & Heather Anderson on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This file defines global Vue components.
//

import { boot } from "quasar/wrappers";

// Overlays:
import Audio from "@Components/overlays/settings/Audio.vue";
import Controls from "@Components/overlays/settings/Controls.vue";
import Graphics from "@Components/overlays/settings/Graphics.vue";
import ChatWindow from "@Components/overlays/chat/ChatWindow.vue";
import Explore from "@Components/overlays/explore/Explore.vue";
import People from "@Components/overlays/people/People.vue";
import Avatar from "@Components/overlays/avatar/Avatar.vue";
import ReadyPlayerMe from "@Components/overlays/rpm/ReadyPlayerMe.vue";
import Menu from "@Components/overlays/menu/Menu.vue";
import DebugWindow from "@Components/overlays/debug/DebugWindow.vue";
import Conference from "@Components/overlays/conference/Conference.vue";
import Jitsi from "@Components/overlays/jitsi/Jitsi.vue";
import JitsiContainer from "@Components/JitsiContainer.vue";
import jitsiSDK from "@jitsi/vue-sdk";

// Dialogs:
import Login from "@Components/dialogs/Login.vue";

// Other:
import AudioLevel from "@Components/AudioLevel.vue";
import MetaverseLogin from "@Components/components/login/MetaverseLogin.vue";
import MetaverseRegister from "@Components/components/login/MetaverseRegister.vue";

export default boot(({ app }) => {
    // Overlays:
    app.component("AudioOverlay", Audio);
    app.component("ControlsOverlay", Controls);
    app.component("GraphicsOverlay", Graphics);
    app.component("ChatOverlay", ChatWindow);
    app.component("ExploreOverlay", Explore);
    app.component("PeopleOverlay", People);
    app.component("AvatarOverlay", Avatar);
    app.component("ReadyPlayerMeOverlay", ReadyPlayerMe);
    app.component("MenuOverlay", Menu);
    app.component("DebugOverlay", DebugWindow);
    app.component("ConferenceOverlay", Conference);
    app.component("JitsiOverlay", Jitsi);
    app.component("JitsiContainer", JitsiContainer);
    jitsiSDK(app);

    // Dialogs:
    app.component("LoginDialog", Login);

    // Other:
    app.component("AudioLevel", AudioLevel);
    app.component("MetaverseLogin", MetaverseLogin);
    app.component("MetaverseRegister", MetaverseRegister);
});
