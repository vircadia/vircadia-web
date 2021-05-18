//  global-components.js
//
//  Created by Kalila L. & Heather Anderson on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

// Components -> Overlays
import Audio from '../components/overlays/settings/Audio.vue';
import ChatWindow from '../components/overlays/chat/ChatWindow.vue';
import People from '../components/overlays/people/People.vue';
// Components -> Components
import MetaverseLogin from '../components/components/login/MetaverseLogin.vue';
import MetaverseRegister from '../components/components/login/MetaverseRegister.vue';

export default ({
    app, router, store, Vue, ssrContext
}) => {
    // Components -> Overlays
    app.component('Audio', Audio);
    app.component('ChatWindow', ChatWindow);
    app.component('People', People);
    // Components -> Components
    app.component('MetaverseLogin', MetaverseLogin);
    app.component('MetaverseRegister', MetaverseRegister);
};
