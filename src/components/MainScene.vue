<!--
//  MainScene.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <canvas id="renderCanvas"></canvas>
</template>

<script>
/* eslint-disable */
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

import Entities from '../modules/entities/entities.js';

var vue_this;

export default {
    name: 'MainScene',

    data: () => ({

    }),

    computed: {

    },

    methods: {
        resizeCanvas: function (canvas) {
            var height = window.innerHeight;
            var width = window.innerWidth;
            canvas.height = height;
            canvas.width = width;
        }
    },
    
    created: function () {

    },

    mounted: function () {
        vue_this = this;

        var canvas = document.getElementById("renderCanvas");
        this.resizeCanvas(canvas);
        
        // the canvas/window resize event handler
        window.addEventListener('resize', function() {
            vue_this.resizeCanvas(canvas);

            if (engine) {
                engine.resize();
            }
        });

        var engine = new BABYLON.Engine(canvas);
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);
        var light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);
        
        var item = BABYLON.Mesh.CreateBox('box', 2, scene);

        item.rotation.x = -0.2;
        item.rotation.y = -0.4;

        const boxMaterial = new BABYLON.StandardMaterial('material', scene);
        boxMaterial.emissiveColor = new BABYLON.Color3(0, 0.58, 0.86);
        item.material = boxMaterial;
    
        var renderLoop = function () {
            scene.render();
        };
        engine.runRenderLoop(renderLoop);
    }
}
</script>
