/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "@Base/(.*)": "<rootDir>/src/$1",
        "@Modules/(.*)": "<rootDir>/src/modules/$1",
        "@Components/(.*)": "<rootDir>/src/components/$1"
    }
};
