/*
    cleanDist.js

    Created by Kalila L. on Dec 20 2020.
    Copyright 2020 Vircadia contributors.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

const fs = require('fs').promises;

const directory = './dist';

fs.rmdir(directory, { recursive: true })
.then(() => console.log('Dist folder cleared!'));
  