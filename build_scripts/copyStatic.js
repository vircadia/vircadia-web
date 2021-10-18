/*
    copyStatic.js

    Created by Kalila L. on Dec 20 2020.
    Copyright 2020 Vircadia contributors.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

const fse = require('fs-extra');

const srcDir = `./src/static`;
const destDir = `./dist/static`;

try {
    fse.mkdirSync(destDir);
    fse.copySync(srcDir, destDir, { overwrite: true });
    console.log(`Successfully copied ${srcDir} to ${destDir}!`);
}
catch (err) {
    console.log(`Failed to copy copied ${srcDir} to ${destDir}!: ${err}`);
};