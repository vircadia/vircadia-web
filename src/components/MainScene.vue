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

            var engine = new BABYLON.Engine(canvas);
            var scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);
            var light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);
        
            var box = BABYLON.Mesh.CreateBox("box", 2, scene);
            box.rotation.x = -0.2;
            box.rotation.y = -0.4;
            
            var boxMaterial = new BABYLON.StandardMaterial("material", scene);
            boxMaterial.emissiveColor = new BABYLON.Color3(0, 0.58, 0.86);
            box.material = boxMaterial;
        
            var renderLoop = function () {
                scene.render();
            };
            engine.runRenderLoop(renderLoop);
            
            // the canvas/window resize event handler
            window.addEventListener('resize', function() {
                vue_this.resizeCanvas(canvas);
                engine.resize();
            });
    }
}
</script>
