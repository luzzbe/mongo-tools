"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildIndex = void 0;
var buildIndex = function (key, collection, name) { return ({
    name: name !== null && name !== void 0 ? name : Object.entries(key).flat().join("_"),
    collection: collection !== null && collection !== void 0 ? collection : "collection",
    details: {
        key: key,
    },
}); };
exports.buildIndex = buildIndex;
