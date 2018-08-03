window.onload = function() {
  console.log("[*] Window loaded");
  // DRAGABLE CLI
  var cliDiv = document.getElementById("cliDiv");
  var terminalDiv = document.getElementById("terminalDiv");
  scriptCreatorDiv = document.getElementById("scriptCreatorDiv");
  scriptCreatorCancelButton = document.getElementById("scriptCreatorCancelButton");
  scriptCreatorSaveButton = document.getElementById("scriptCreatorSaveButton");
  scriptCreatorTextArea = document.getElementById("scriptCreatorTextArea");
  scriptCreatorTextArea.onkeydown = function(e){
    if(e.keyCode==9 || e.which==9){
      e.preventDefault();
      var s = this.selectionStart;
      this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
      this.selectionEnd = s+1;
    }
  }
  cliDiv.addEventListener("click", function(){
    cliFocused = true;
  });
  terminalDiv.addEventListener("mousewheel", function(e){
    e.preventDefault();
    e.stopPropagation();
  });
  if (typeof InstallTrigger !== 'undefined') {
    // M O Z I L L A
    terminalDiv.addEventListener("wheel", function(e){
      e.preventDefault();
      e.stopPropagation();
    });
  }
  dragElement(cliDiv);
  terminal.init();

  // SCRIPTING UTILITY FUNCTIONS
  ROYGBIV = new Roygbiv();
  var roygbivScriptingAPIMethodCount = (Object.keys(Roygbiv.prototype).length);
  if (roygbivScriptingAPIMethodCount != ROYGBIV.functionNames.length){
    console.error("[*] Scripting API error: Some methods are missing in functionNames list.");
  }
  for (var i = 0; i<ROYGBIV.functionNames.length; i++){
    if (!Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+ROYGBIV.functionNames[i].toUpperCase()]){
      console.error("[*] Scripting API error: "+ROYGBIV.functionNames[i]+" explanation is not present.");
    }
  }

  // COMMAND DESCRIPTOR
  commandDescriptor = new CommandDescriptor();
  commandDescriptor.test();

  // COLOR NAMES
  ColorNames = new ColorNames();

  // DAT GUI
  datGui = new dat.GUI();
  datGui.add(postprocessingParameters, "Scanlines_count").min(0).max(1000).step(1).onChange(function(val){
    adjustPostProcessing(0, val);
  });
  datGui.add(postprocessingParameters, "Scanlines_sIntensity").min(0.0).max(2.0).step(0.1).onChange(function(val){
    adjustPostProcessing(1, val);
  });
  datGui.add(postprocessingParameters, "Scanlines_nIntensity").min(0.0).max(2.0).step(0.1).onChange(function(val){
    adjustPostProcessing(2, val);
  });
  datGui.add(postprocessingParameters, "Static_amount").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(3, val);
  });
  datGui.add(postprocessingParameters, "Static_size").min(0.0).max(100.0).step(1.0).onChange(function(val){
    adjustPostProcessing(4, val);
  });
  datGui.add(postprocessingParameters, "RGBShift_amount").min(0.0).max(0.1).step(0.01).onChange(function(val){
    adjustPostProcessing(5, val);
  });
  datGui.add(postprocessingParameters, "RGBShift_angle").min(0.0).max(2.0).step(0.1).onChange(function(val){
    adjustPostProcessing(6, val);
  });
  datGui.add(postprocessingParameters, "BadTV_thickDistort").min(0.1).max(20).step(0.1).onChange(function(val){
    adjustPostProcessing(7, val);
  });
  datGui.add(postprocessingParameters, "BadTV_fineDistort").min(0.1).max(20).step(0.1).onChange(function(val){
    adjustPostProcessing(8, val);
  });
  datGui.add(postprocessingParameters, "BadTV_distortSpeed").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(9, val);
  });
  datGui.add(postprocessingParameters, "BadTV_rollSpeed").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(10, val);
  });
  datGui.add(postprocessingParameters, "Bloom_strength").min(0.0).max(3.0).step(0.01).onChange(function(val){
    adjustPostProcessing(11, val);
  });
  datGui.add(postprocessingParameters, "Bloom_radius").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(12, val);
  });
  datGui.add(postprocessingParameters, "Bloom_threshhold").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(13, val);
  });
  datGui.add(postprocessingParameters, "Bloom_resolution_scale").min(0.1).max(1.0).step(0.001).onChange(function(val){
    adjustPostProcessing(19, val);
  });
  datGui.add(postprocessingParameters, "Scanlines").onChange(function(val){
    adjustPostProcessing(14, val);
  });
  datGui.add(postprocessingParameters, "RGB").onChange(function(val){
    adjustPostProcessing(15, val);
  });
  datGui.add(postprocessingParameters, "Bad TV").onChange(function(val){
    adjustPostProcessing(16, val);
  });
  datGui.add(postprocessingParameters, "Bloom").onChange(function(val){
    adjustPostProcessing(17, val);
  });
  datGui.add(postprocessingParameters, "Static").onChange(function(val){
    adjustPostProcessing(18, val);
  });

  $(datGui.domElement).attr("hidden", true);

  // IMAGE UPLOADER
  imageUploaderInput = $("#imageUploaderInput");
  // LOAD
  loadInput = $("#loadInput");
  // 3D CANVAS
  canvas = document.getElementById("rendererCanvas");
  canvas.addEventListener("click", function(event){
    cliFocused = false;
    if (windowLoaded){
       var mouse = new THREE.Vector2();
       var raycaster = new THREE.Raycaster();
       var rect = renderer.domElement.getBoundingClientRect();
       mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
       mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
       raycaster.setFromCamera( mouse, camera );
       var intersects;
       if (mode == 0){
         intersects = raycaster.intersectObjects( scene.children, true );
       }else{
         intersects = raycaster.intersectObjects( previewScene.children, true );
       }
       if (intersects.length > 0){
         var object = intersects[0].object;
         if (object.addedObject || object.objectGroupName){
           terminal.clear();
           var point = intersects[0].point;
           var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
           if (object.addedObject){
             var faceName = object.addedObject.getFaceNameFromNormal(intersects[0].face.normal);
             //coordStr += " [face: "+faceName+"]";
             terminal.printInfo(Text.CLICKED_ON.replace(
               Text.PARAM1, object.addedObject.name + coordStr
             ));
             copyToClipboard(object.addedObject.name);
             selectedAddedObject = object.addedObject;
             objectSelectedByCommand = false;
             selectedObjectGroup = 0;
           }else if (object.objectGroupName){
             var faceName = objectGroups[object.objectGroupName].getFaceNameFromNormal(intersects[0].face.normal);
             //coordStr += " [face: "+faceName+"]";
             terminal.printInfo(Text.CLICKED_ON.replace(
               Text.PARAM1, object.objectGroupName+coordStr
             ));
             copyToClipboard(object.objectGroupName);
             selectedObjectGroup = objectGroups[object.objectGroupName];
             objectSelectedByCommand = false;
             selectedAddedObject = 0;
           }
         }else if (object.isPointLightRepresentation){
           selectedAddedObject = 0;
           selectedObjectGroup = 0;
           var lightName = object.lightName;
           if (lightName){
             selectedLightName = lightName;
             terminal.clear();
             terminal.printInfo(Text.SELECTED_LIGHT.replace(
               Text.PARAM1, lightName
             ));
           }
         }else if (object.gridSystemName){
           var gridSystem = gridSystems[object.gridSystemName];
           var point = intersects[0].point;
           var selectedGrid = gridSystem.getGridFromPoint(point);
           if (selectedGrid){
             if (!selectedGrid.sliced){
               if (selectedGrid.destroyedAddedObject){
                 var addedObject = addedObjects[selectedGrid.destroyedAddedObject];
                 terminal.clear();
                 var point = intersects[0].point;
                 var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                 if (intersects[0].face){
                   var faceName = addedObject.getFaceNameFromNormal(intersects[0].face.normal);
                   //coordStr += " [face: "+faceName+"]";
                 }
                 terminal.printInfo(Text.CLICKED_ON.replace(
                   Text.PARAM1, addedObject.name+coordStr
                 ));
                 copyToClipboard(addedObject.name)
                 selectedAddedObject = addedObject;
                 objectSelectedByCommand = false;
               }else if (selectedGrid.destroyedObjectGroup){
                 var objectGroup = objectGroups[selectedGrid.destroyedObjectGroup];
                 terminal.clear();
                 var point = intersects[0].point;
                 var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                 if (intersects[0].face && intersects[0].face.normal){
                    var faceName = objectGroup.getFaceNameFromNormal(intersects[0].face.normal);
                    //coordStr += " [face: "+faceName+"]";
                 }
                 terminal.printInfo(Text.CLICKED_ON.replace(
                   Text.PARAM1, objectGroup.name+coordStr
                 ));
                 copyToClipboard(objectGroup.name);
                 selectedAddedObject = 0;
                 selectedObjectGroup = objectGroup;
               }else{
                 selectedGrid.toggleSelect(false, true);
              }
            }else if (object.forDebugPurposes){
              if (intersects[1]){
                var object2 = intersects[1].object;
                if (object2.addedObject){
                  terminal.clear();
                  var point = intersects[1].point;
                  var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                  var faceName = object2.addedObject.getFaceNameFromNormal(intersects[1].face.normal);
                  //coordStr += " [face: "+faceName+"]";
                  terminal.printInfo(Text.CLICKED_ON.replace(
                    Text.PARAM1, object2.addedObject.name+coordStr
                  ));
                  copyToClipboard(object2.addedObject.name);
                  selectedAddedObject = object2.addedObject;
                  objectSelectedByCommand = false;
                }
              }
            }else{
               var i = 1;
               var recursiveName = selectedGrid.slicedGridSystemName;
               var found = false;
               while (intersects[i] && !found){
                 gridSystem = gridSystems[recursiveName];
                 point = intersects[i].point;
                 selectedGrid = gridSystem.getGridFromPoint(point);
                 if (selectedGrid){
                   if (!selectedGrid.sliced){
                     if (selectedGrid.destroyedAddedObject){
                       var addedObject = addedObjects[selectedGrid.destroyedAddedObject];
                       terminal.clear();
                       var point = intersects[0].point;
                       var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                       if (intersects[i].face){
                         var faceName = addedObject.getFaceNameFromNormal(intersects[i].face.normal);
                         //coordStr += " [face: "+faceName+"]";
                       }
                       terminal.printInfo(Text.CLICKED_ON.replace(
                         Text.PARAM1, addedObject.name+coordStr
                       ));
                       copyToClipboard(addedObject.name);
                       objectSelectedByCommand = false;
                       selectedAddedObject = addedObject;
                     }else if (selectedGrid.destroyedObjectGroup){
                       var objectGroup = objectGroups[selectedGrid.destroyedObjectGroup];
                       terminal.clear();
                       var point = intersects[0].point;
                       var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                       if (intersects[0].face && intersects[i].face.normal){
                          var faceName = objectGroup.getFaceNameFromNormal(intersects[i].face.normal);
                          //coordStr += " [face: "+faceName+"]";
                       }
                       terminal.printInfo(Text.CLICKED_ON.replace(
                         Text.PARAM1, objectGroup.name+coordStr
                       ));
                       copyToClipboard(objectGroup.name);
                       selectedAddedObject = 0;
                       selectedObjectGroup = objectGroup;
                     }else{
                       selectedGrid.toggleSelect(false, true);
                     }
                     found = true;
                   }else{
                     recursiveName = selectedGrid.slicedGridSystemName;
                     i++;
                   }
                 }
               }
             }
           }
         }
       }else{
         if (!objectSelectedByCommand){
           selectedAddedObject = 0;
         }
       }
    }
  });

  // STATE SAVE DECISION FUNCTIONS
  stateSaveDecisionFunctions = [
    textureOffsetAdjustmentStateSaveDecision,
    opacityAdjustmentStateSaveDecision,
    lightIntensityAdjustmentStateSaveDecision,
    lightPositionAdjustmentStateSaveDecision,
    objectShininessAdjustmentStateSaveDecision,
    heightMapScaleAdjustmentStateSaveDecision,
    heightMapBiasAdjustmentStateSaveDecision
  ];

  // INITIALIZE THREE.JS SCENE AND RENDERER
  scene = new THREE.Scene();
  previewScene = new THREE.Scene();
  debugRenderer = new THREE.CannonDebugRenderer(previewScene, physicsWorld);
  scene.background = new THREE.Color(sceneBackgroundColor);
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  camera.rotation.order = 'YXZ';
  renderer = new THREE.WebGLRenderer({ canvas: canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );
  initPhysics();
  initBadTV();
  render();
  fpsCounterIntervalID = setInterval(calculateFps, 1000);
  windowLoaded = true;
  previewScene.fog = new THREE.Fog("black", FOG_OFF_NEAR, FOG_OFF_FAR);
  undoRedoHandler.push();
  MAX_VERTEX_UNIFORM_VECTORS = renderer.context.getParameter(renderer.context.MAX_VERTEX_UNIFORM_VECTORS);
};

window.addEventListener("mousedown", function(e){
  mouseDown ++;
});
window.addEventListener("mouseup", function(e){
  mouseDown --;
});
window.addEventListener('mousemove', function (e) {
  if (cliIsBeingDragged){
    return;
  }
  if (!windowLoaded){
    return;
  }
  if (!mouseDown){
    return;
  }
  var movementX = e.movementX;
  var movementY = e.movementY;
  camera.rotation.y -= movementX / 400;
  camera.rotation.x -= movementY / 400;
});
window.addEventListener('mousewheel', mouseWheelEvent, false);
if (typeof InstallTrigger !== 'undefined') {
  // M O Z I L L A
  window.addEventListener('wheel', mouseWheelEvent, false);
}
window.addEventListener('resize', function() {
  if (renderer){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    console.log("[*] Renderer resized");
  }
});
window.addEventListener('keydown', function(event){
  if (!windowLoaded){
    return;
  }

  if (cliFocused){
    return;
  }

  switch(event.keyCode){
        case 190: //PERIOD
          keyboardBuffer["period"] = true;
        break;
        case 65: //A
          keyboardBuffer["a"] = true;
        break;
        case 68: //D
          keyboardBuffer["d"] = true;
        break;
        case 87: //W
          keyboardBuffer["w"] = true;
        break;
        case 83: //S
          keyboardBuffer["s"] = true;
        break;
        case 37: //LEFT ARROW
          keyboardBuffer["left"] = true;
        break;
        case 39: //RIGHT ARROW
          keyboardBuffer["right"] = true;
        break;
        case 38: //UP ARROW
          keyboardBuffer["up"] = true;
        break;
        case 40: //DOWN ARROW
          keyboardBuffer["down"] = true;
        break;
        case 81: //Q
          keyboardBuffer["q"] = true;
        break;
        case 69: //E
          keyboardBuffer["e"] = true;
        break;
        case 90: //Z
          keyboardBuffer["z"] = true;
        break;
        case 67: //C
          keyboardBuffer["c"] = true;
        break;
        case 84: //T
          keyboardBuffer["t"] = true;
        break;
        case 89: //Y
          keyboardBuffer["y"] = true;
        break;
        case 71: //G
          keyboardBuffer["g"] = true;
        break;
        case 72: //H
          keyboardBuffer["h"] = true;
        break;
        case 79: //O
          keyboardBuffer["o"] = true;
        break;
        case 80: //P
          keyboardBuffer["p"] = true;
        break;
        case 8: //BACKSPACE
          //FIREFOX GO BACK FIX
          if (selectedAddedObject && !cliFocused){
            event.preventDefault();
          }

          if (mode == 1){
            return;
          }
          if (selectedAddedObject){
            selectedAddedObject.destroy();
            delete addedObjects[selectedAddedObject.name];
            terminal.clear();
            terminal.printInfo(Text.OBJECT_DESTROYED);
            selectedAddedObject = 0;
            undoRedoHandler.push();
          }else if (selectedObjectGroup){
            selectedObjectGroup.destroy();
            delete objectGroups[selectedObjectGroup.name];
            selectedObjectGroup = 0;
            terminal.clear();
            terminal.printInfo(Text.OBJECT_DESTROYED);
            undoRedoHandler.push();
          }
        break;
        case 86: //V
          keyboardBuffer["v"] = true;
        break;
        case 66: //B
          keyboardBuffer["b"] = true;
        break;
        case 78: //N
          keyboardBuffer["n"] = true;
        break;
        case 77: //M
          keyboardBuffer["m"] = true;
        break;
        case 75: //K
          keyboardBuffer["k"] = true;
        break;
        case 76: //L
          keyboardBuffer["l"] = true;
        break;
        case 85: //U
          keyboardBuffer["u"] = true;
        break;
        case 73: //I
          keyboardBuffer["i"] = true;
        break;
        case 49: //1
          keyboardBuffer["1"] = true;
        break;
        case 50: //2
          keyboardBuffer["2"] = true;
        break;
        case 51: //3
          keyboardBuffer["3"] = true;
        break;
        case 52: //4
          keyboardBuffer["4"] = true;
        break;
        case 53: //5
          keyboardBuffer["5"] = true;
        break;
        case 54: //6
          keyboardBuffer["6"] = true;
        break;

  }

});
window.addEventListener('keyup', function(event){
  if (!windowLoaded){
    return;
  }

  if (cliFocused){
    return;
  }

  switch(event.keyCode){
        case 190: //PERIOD
          keyboardBuffer["period"] = false;
          for (var gridName in gridSelections){
            var grid = gridSelections[gridName];
            if (grid.divs){
              for (var i = 0; i<grid.divs.length; i++){
                grid.divs[i].style.visibility = "hidden";
              }
            }
          }
        break;
        case 65: //A
          keyboardBuffer["a"] = false;
        break;
        case 68: //D
          keyboardBuffer["d"] = false;
        break;
        case 87: //W
          keyboardBuffer["w"] = false;
        break;
        case 83: //S
          keyboardBuffer["s"] = false;
        break;
        case 37: //LEFT ARROW
          keyboardBuffer["left"] = false;
        break;
        case 39: //RIGHT ARROW
          keyboardBuffer["right"] = false;
        break;
        case 38: //UP ARROW
          keyboardBuffer["up"] = false;
        break;
        case 40: //DOWN ARROW
          keyboardBuffer["down"] = false;
        break;
        case 81: //Q
          keyboardBuffer["q"] = false;
        break;
        case 69: //E
          keyboardBuffer["e"] = false;
        break;
        case 90: //Z
          keyboardBuffer["z"] = false;
        break;
        case 67: //C
          keyboardBuffer["c"] = false;
        break;
        case 84: //T
          keyboardBuffer["t"] = false;
        break;
        case 89: //Y
          keyboardBuffer["y"] = false;
        break;
        case 71: //G
          keyboardBuffer["g"] = false;
        break;
        case 72: //H
          keyboardBuffer["h"] = false;
        break;
        case 79: //O
          keyboardBuffer["o"] = false;
        break;
        case 80: //P
          keyboardBuffer["p"] = false;
        break;
        case 86: //V
          keyboardBuffer["v"] = false;
        break;
        case 66: //B
          keyboardBuffer["b"] = false;
        break;
        case 78: //N
          keyboardBuffer["n"] = false;
        break;
        case 77: //M
          keyboardBuffer["m"] = false;
        break;
        case 75: //K
          keyboardBuffer["k"] = false;
        break;
        case 76: //L
          keyboardBuffer["l"] = false;
        break;
        case 85: //U
          keyboardBuffer["u"] = false;
        break;
        case 73: //I
          keyboardBuffer["i"] = false;
        break;
        case 49: //1
          keyboardBuffer["1"] = false;
        break;
        case 50: //2
          keyboardBuffer["2"] = false;
        break;
        case 51: //3
          keyboardBuffer["3"] = false;
        break;
        case 52: //4
          keyboardBuffer["4"] = false;
        break;
        case 53: //5
          keyboardBuffer["5"] = false;
        break;
        case 54: //6
          keyboardBuffer["6"] = false;
        break;
  }

});

 function initBadTV(){
   if (mode == 0){
     renderPass = new THREE.RenderPass( scene, camera );
   }else{
     renderPass = new THREE.RenderPass( previewScene, camera );
   }
   if (mode == 1){
    badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
    rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
    filmPass = new THREE.ShaderPass( THREE.FilmShader );
    staticPass = new THREE.ShaderPass( THREE.StaticShader );
    bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(
        window.innerWidth * bloomResolutionScale,
        window.innerHeight * bloomResolutionScale
      ),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
   }
   copyPass = new THREE.ShaderPass( THREE.CopyShader );
   if (mode == 1){
     filmPass.uniforms.grayscale.value = 0;
   }
   setBadTVParams();
   composer = new THREE.EffectComposer(renderer);
   composer.addPass( renderPass );
   if (mode == 1){
    if (scanlineOn){
      composer.addPass( filmPass );
    }
    if (badTvOn){
      composer.addPass( badTVPass );
    }
    if (rgbOn){
      composer.addPass( rgbPass );
    }
    if (staticOn){
      composer.addPass( staticPass );
    }
    if (bloomOn){
      composer.addPass( bloomPass );
    }
   }
	 composer.addPass( copyPass );
	 copyPass.renderToScreen = true;
   setBadTVParams();
 }

 function setBadTVParams(){
   if (mode == 1){
    if (badTvOn){
      badTVPass.uniforms[ 'distortion' ].value = badtvThick;
      badTVPass.uniforms[ 'distortion2' ].value = badtvFine;
      badTVPass.uniforms[ 'speed' ].value = badtvDistortSpeed
      badTVPass.uniforms[ 'rollSpeed' ].value = badtvRollSpeed;
    }
    if (staticOn){
      staticPass.uniforms[ 'amount' ].value = staticAmount;
      staticPass.uniforms[ 'size' ].value = staticSize;
    }
    if (rgbOn){
      rgbPass.uniforms[ 'angle' ].value = rgbAngle * Math.PI;
      rgbPass.uniforms[ 'amount' ].value = rgbAmount;
    }
    if (scanlineOn){
      filmPass.uniforms[ 'sCount' ].value = scanlineCount;
      filmPass.uniforms[ 'sIntensity' ].value = scanlineSIntensity;
      filmPass.uniforms[ 'nIntensity' ].value = scanlineNIntensity;
    }
    if (bloomOn){
      bloomPass.strength = bloomStrength;
      bloomPass.radius = bloomRadius;
      bloomPass.threshold = bloomThreshold;
      bloomPass.resolution = new THREE.Vector2(
        window.innerWidth * bloomResolutionScale,
        window.innerHeight * bloomResolutionScale
      );
    }
   }
 }

 function initPhysics(){
   physicsWorld.quatNormalizeSkip = quatNormalizeSkip;
   physicsWorld.quatNormalizeFast = quatNormalizeFast;
   physicsWorld.defaultContactMaterial.contactEquationStiffness = contactEquationStiffness;
   physicsWorld.defaultContactMaterial.contactEquationRelaxation = contactEquationRelaxation;
   physicsWorld.defaultContactMaterial.friction = friction;
   physicsSolver.iterations = physicsIterations;
   physicsSolver.tolerance = physicsTolerance;
   physicsWorld.solver = physicsSolver;
   physicsWorld.gravity.set(0, gravityY, 0);
   physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
 }

 function adjustPostProcessing(variableIndex, val){
   switch(variableIndex){
     case 0: //Scanlines_count
      scanlineCount = val;
     break;
     case 1: //Scanlines_sIntensity
      scanlineSIntensity = val;
     break;
     case 2: //Scanlines_nIntensity
      scanlineNIntensity = val;
     break;
     case 3: //Static_amount
      staticAmount = val;
     break;
     case 4: //Static_size
      staticSize = val;
     break;
     case 5: //RGBShift_amount
      rgbAmount = val;
     break;
     case 6: //RGBShift_angle
      rgbAngle = val;
     break;
     case 7: //BadTV_thickDistort
      badtvThick = val;
     break;
     case 8: //BadTV_fineDistort
      badtvFine = val;
     break;
     case 9: //BadTV_distortSpeed
      badtvDistortSpeed = val;
     break;
     case 10: //BadTV_rollSpeed
      badtvRollSpeed = val;
     break;
     case 11: //bloomStrength
      bloomStrength = val;
     break;
     case 12: //Bloom_radius
      bloomRadius = val;
     break;
     case 13: //Bloom_threshhold
      bloomThreshold = val;
     break;
     case 14: //Scanlines
      scanlineOn = val;
     break;
     case 15: //RGB
      rgbOn = val;
     break;
     case 16: //Bad TV
      badTvOn = val;
     break;
     case 17: //Bloom
      bloomOn = val;
     break;
     case 18: //Static
      staticOn = val;
     break;
     case 19: //Bloom_resolution_scale
      bloomResolutionScale = val;
      bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(
          window.innerWidth * bloomResolutionScale,
          window.innerHeight * bloomResolutionScale
        ),
        bloomStrength,
        bloomRadius,
        bloomThreshold
      );
     break;
   }
   composer = new THREE.EffectComposer( renderer );
   composer.addPass( renderPass );
   if (scanlineOn){
     composer.addPass( filmPass );
   }
   if (badTvOn){
     composer.addPass( badTVPass );
   }
   if (rgbOn){
     composer.addPass( rgbPass );
   }
   if (staticOn){
     composer.addPass( staticPass );
   }
   if (bloomOn){
   composer.addPass( bloomPass );
   }
   composer.addPass( copyPass );
	 copyPass.renderToScreen = true;
   setBadTVParams();
 }

function isPhysicsWorkerEnabled(){
  return (WORKERS_SUPPORTED && PHYSICS_WORKER_ENABLED);
}

function isCollisionWorkerEnabled(){
  return (WORKERS_SUPPORTED && COLLISION_WORKER_ENABLED);
}

function isPSCollisionWorkerEnabled(){
  return (WORKERS_SUPPORTED && PS_COLLISION_WORKER_ENABLED);
}

function textureOffsetAdjustmentStateSaveDecision(){
  if (selectedAddedObject){
    if (selectedAddedObject.material.map){
      var result = keyboardBuffer["t"] || keyboardBuffer["y"] || keyboardBuffer["g"] || keyboardBuffer["h"];
      if (result){
        if (!selectedAddedObject.textureOffsetAdjustmentInitiated){
          selectedAddedObject.textureOffsetAdjustmentInitiated = true;
        }
      }else{
        if (selectedAddedObject.textureOffsetAdjustmentInitiated){
          selectedAddedObject.textureOffsetAdjustmentInitiated = false;
          undoRedoHandler.push();
        }
      }
    }
  }
}

function opacityAdjustmentStateSaveDecision(){
  var result = keyboardBuffer["o"] || keyboardBuffer["p"];
  if (selectedAddedObject){
    if (result){
      if (!selectedAddedObject.opacityOffsetAdjustmentInitiated){
        selectedAddedObject.opacityOffsetAdjustmentInitiated = true;
      }
    }else{
      if (selectedAddedObject.opacityOffsetAdjustmentInitiated){
        selectedAddedObject.opacityOffsetAdjustmentInitiated = false;
        undoRedoHandler.push();
      }
    }
  }
  if (selectedObjectGroup){
    if (result){
      if(!selectedObjectGroup.opacityOffsetAdjustmentInitiated){
        selectedObjectGroup.opacityOffsetAdjustmentInitiated = true;
      }
    }else{
      if(selectedObjectGroup.opacityOffsetAdjustmentInitiated){
        selectedObjectGroup.opacityOffsetAdjustmentInitiated = false;
        undoRedoHandler.push();
      }
    }
  }
}

function lightIntensityAdjustmentStateSaveDecision(){
  if (selectedLightName){
    var light = lights[selectedLightName];
    if (!light){
      return;
    }
    var result = keyboardBuffer["v"] || keyboardBuffer["b"];
    if (result){
      if (!light.intensityAdjustmentInitiated){
        light.intensityAdjustmentInitiated = true;
      }
    }else{
      if (light.intensityAdjustmentInitiated){
        light.intensityAdjustmentInitiated = false;
        undoRedoHandler.push();
      }
    }
  }
}

function lightPositionAdjustmentStateSaveDecision(){
  if (selectedLightName){
    var light = lights[selectedLightName];
    if (!light){
      return;
    }
    if (light.isPointLight || light.isDirectionalLight){
      var result = keyboardBuffer["1"] || keyboardBuffer["2"] ||
                   keyboardBuffer["3"] || keyboardBuffer["4"] ||
                   keyboardBuffer["5"] || keyboardBuffer["6"];
      if (result){
        if (!light.positionAdjustmentInitiated){
          light.positionAdjustmentInitiated = true;
        }
      }else{
        if (light.positionAdjustmentInitiated){
          light.positionAdjustmentInitiated = false;
          undoRedoHandler.push();
        }
      }
    }
  }
}

function objectShininessAdjustmentStateSaveDecision(){
  if (selectedAddedObject){
    var material = selectedAddedObject.material;
    if (material.isMeshPhongMaterial){
      var result = keyboardBuffer["n"] || keyboardBuffer["m"];
      if (result){
        if (!material.shininessAdjustmentInitiated){
          material.shininessAdjustmentInitiated = true;
        }
      }else{
        if (material.shininessAdjustmentInitiated){
          material.shininessAdjustmentInitiated = false;
          undoRedoHandler.push();
        }
      }
    }
  }
}

function heightMapScaleAdjustmentStateSaveDecision(){
  if (selectedAddedObject){
    var material = selectedAddedObject.material;
    if (material.displacementMap){
      var result = keyboardBuffer["k"] || keyboardBuffer["l"];
      if (result){
        if (!material.heightMapScaleAdjustmentInitiated){
          material.heightMapScaleAdjustmentInitiated = true;
        }
      }else{
        if (material.heightMapScaleAdjustmentInitiated){
          material.heightMapScaleAdjustmentInitiated = false;
          undoRedoHandler.push();
        }
      }
    }
  }
}

function heightMapBiasAdjustmentStateSaveDecision(){
  if (selectedAddedObject){
    var material = selectedAddedObject.material;
    if (material.displacementMap){
      var result = keyboardBuffer["u"] || keyboardBuffer["i"];
      if (result){
        if (!material.heightMapBiasAdjustmentInitiated){
          material.heightMapBiasAdjustmentInitiated = true;
        }
      }else{
        if (material.heightMapBiasAdjustmentInitiated){
          material.heightMapBiasAdjustmentInitiated = false;
          undoRedoHandler.push();
        }
      }
    }
  }
}

function saveState(){
  for (var i = 0; i<stateSaveDecisionFunctions.length; i++){
    stateSaveDecisionFunctions[i]();
  }
}

function processKeyboardBuffer(){

  if (mode == 0){
    saveState();
  }

  if (keyboardBuffer["left"]){
    camera.rotation.y += rotationYDelta;
  }
  if (keyboardBuffer["right"]){
    camera.rotation.y -= rotationYDelta;
  }
  if (keyboardBuffer["up"]){
    camera.rotation.x += rotationXDelta;
  }
  if (keyboardBuffer["down"]){
    camera.rotation.x -= rotationXDelta;
  }
  if (keyboardBuffer["w"]){
    camera.translateZ(-1 * translateZAmount);
  }
  if (keyboardBuffer["s"]){
    camera.translateZ(translateZAmount);
  }
  if (keyboardBuffer["d"]){
    camera.translateX(translateXAmount);
  }
  if (keyboardBuffer["a"]){
    camera.translateX(-1 * translateXAmount);
  }
  if (keyboardBuffer["e"]){
    camera.translateY(-1 * translateYAmount);
  }
  if (keyboardBuffer["q"]){
    camera.translateY(translateYAmount);
  }
  if (keyboardBuffer["z"]){
    camera.rotation.z += rotationZDelta;
  }
  if (keyboardBuffer["c"]){
    camera.rotation.z -= rotationZDelta;
  }
  if (keyboardBuffer["t"]){
    if (mode != 0 ){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var texture = selectedAddedObject.material.map;
      if (texture){
        texture.offset.x = texture.offset.x - textureOffsetAdjustmentDX;
        texture.initOffsetXSet = false;
        for (var objectName in addedObjects){
          addedObjects[objectName].mesh.material.needsUpdate = true;
          addedObjects[objectName].previewMesh.material.needsUpdate = true;
        }
      }else{
        terminal.clear();
        terminal.printError(Text.NO_TEXTURE_MAPPED_TO_OBJECT);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECT_SELECTED_FOR_TEXTURE_ADJUSTMENT);
    }
  }
  if (keyboardBuffer["y"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var texture = selectedAddedObject.material.map;
      if (texture){
        texture.offset.x = texture.offset.x + textureOffsetAdjustmentDX;
        texture.initOffsetXSet = false;
        for (var objectName in addedObjects){
          addedObjects[objectName].mesh.material.needsUpdate = true;
          addedObjects[objectName].previewMesh.material.needsUpdate = true;
        }
      }else{
        terminal.clear();
        terminal.printError(Text.NO_TEXTURE_MAPPED_TO_OBJECT);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECT_SELECTED_FOR_TEXTURE_ADJUSTMENT);
    }
  }
  if (keyboardBuffer["g"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var texture = selectedAddedObject.material.map;
      if (texture){
        texture.offset.y = texture.offset.y - textureOffsetAdjustmentDY;
        texture.initOffsetYSet = false;
        for (var objectName in addedObjects){
          addedObjects[objectName].mesh.material.needsUpdate = true;
          addedObjects[objectName].previewMesh.material.needsUpdate = true;
        }
      }else{
        terminal.clear();
        terminal.printError(Text.NO_TEXTURE_MAPPED_TO_OBJECT);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECT_SELECTED_FOR_TEXTURE_ADJUSTMENT);
    }
  }
  if (keyboardBuffer["h"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var texture = selectedAddedObject.material.map;
      if (texture){
        texture.offset.y = texture.offset.y + textureOffsetAdjustmentDY;
        texture.initOffsetYSet = false;
        for (var objectName in addedObjects){
          addedObjects[objectName].mesh.material.needsUpdate = true;
          addedObjects[objectName].previewMesh.material.needsUpdate = true;
        }
      }else{
        terminal.clear();
        terminal.printError(Text.NO_TEXTURE_MAPPED_TO_OBJECT);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECT_SELECTED_FOR_TEXTURE_ADJUSTMENT);
    }
  }
  if (keyboardBuffer["p"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      for (var childObjName in selectedObjectGroup.group){
        var childObj = selectedObjectGroup.group[childObjName];
        childObj.material.transparent = true;
        if (childObj.material.opacity < 1){
          childObj.material.opacity += opacityDelta;
        }
        childObj.initOpacitySet = false;
        childObj.initOpacity = childObj.opacity;
      }
      terminal.clear();
      terminal.printInfo(Text.OPACITY_ADJUSTED);
      return;
    }
    if (!selectedAddedObject && !selectedObjectGroup){
      terminal.clear();
      terminal.printError(Text.NO_OBJECT_SELECTED_FOR_OPACITY_ADJUSTMENT);
      return;
    }

    var material = selectedAddedObject.material;
    material.transparent = true;
    if (material.opacity < 1){
      material.opacity += opacityDelta;
    }

    selectedAddedObject.initOpacitySet = false;
    selectedAddedObject.initOpacity = selectedAddedObject.opacity;

    terminal.clear();
    terminal.printInfo(Text.OPACITY_ADJUSTED);
  }
  if (keyboardBuffer["o"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      for (var childObjName in selectedObjectGroup.group){
        var childObj = selectedObjectGroup.group[childObjName];
        childObj.material.transparent = true;
        if (childObj.material.opacity > 0){
          childObj.material.opacity -= opacityDelta;
        }
        childObj.initOpacitySet = false;
        childObj.initOpacity = childObj.opacity;
      }
      terminal.clear();
      terminal.printInfo(Text.OPACITY_ADJUSTED);
      return;
    }
    if (!selectedAddedObject && !selectedObjectGroup){
      terminal.clear();
      terminal.printError(Text.NO_OBJECT_SELECTED_FOR_OPACITY_ADJUSTMENT);
      return;
    }

    var material = selectedAddedObject.material;
    material.transparent = true;
    if (material.opacity > 0){
      material.opacity -= opacityDelta;
    }

    selectedAddedObject.initOpacitySet = false;
    selectedAddedObject.initOpacity = selectedAddedObject.opacity;

    terminal.clear();
    terminal.printInfo(Text.OPACITY_ADJUSTED);
  }
  if (keyboardBuffer["v"]){
    if (mode != 0){
      return;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var light_preview = light_previewScene[selectedLightName];
      if (light.intensity > 0){
        light.intensity = light.intensity - lightIntensityDelta;
        light_preview.intensity = light.intensity;
        refreshMaterials();
        terminal.clear();
        terminal.printInfo(Text.LIGHT_INTENSITY_ADJUSTED);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["b"]){
    if (mode != 0){
      return;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var light_preview = light_previewScene[selectedLightName];
      if (light.intensity < 1){
        light.intensity = light.intensity + lightIntensityDelta;
        light_preview.intensity = light.intensity;
        refreshMaterials();
        terminal.clear();
        terminal.printInfo(Text.LIGHT_INTENSITY_ADJUSTED);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["n"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var material = selectedAddedObject.material;
      if (material.isMeshPhongMaterial){
        if (material.shininess > 0){
          material.shininess = material.shininess - shininessDelta;
          material.needsUpdate = true;
          selectedAddedObject.initShininessSet = false;
        }
        terminal.clear();
        terminal.printInfo(Text.SHININESS.replace(
          Text.PARAM1, material.shininess
        ));
      }else{
        terminal.clear();
        terminal.printError(Text.THIS_OPERATION_IS_SUPPORTED_BY_PHONG_MATERIALS);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECTS_SELECTED_TO_ADJUST_SHININESS);
    }
  }
  if (keyboardBuffer["m"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var material = selectedAddedObject.material;
      if (material.isMeshPhongMaterial){
        if (material.shininess < 100){
          material.shininess = material.shininess + shininessDelta;
          material.needsUpdate = true;
          selectedAddedObject.initShininessSet = false;
        }
        terminal.clear();
        terminal.printInfo(Text.SHININESS.replace(
          Text.PARAM1, material.shininess
        ));
      }else{
        terminal.clear();
        terminal.printError(Text.THIS_OPERATION_IS_SUPPORTED_BY_PHONG_MATERIALS);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECTS_SELECTED_TO_ADJUST_SHININESS);
    }
  }
  if (keyboardBuffer["k"]){
    if (mode != 0){
      return ;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var material = selectedAddedObject.material;
      if (material.isMeshPhongMaterial){
        if (material.displacementMap){
          if (material.displacementScale > -10000){
            material.displacementScale = material.displacementScale - heightMapScaleDelta;
            material.needsUpdate = true;
            selectedAddedObject.initDisplacementScaleSet = false;
          }
          terminal.clear();
          terminal.printInfo(Text.HEIGHT_MAP_SCALE.replace(
            Text.PARAM1, material.displacementScale
          ));
        }else{
          terminal.clear();
          terminal.printError(Text.NO_HEIGHT_TEXTURE_MAPPED_TO_THIS_OBJECT);
        }
      }else{
        terminal.clear();
        terminal.printError(Text.HEIGHT_MAP_SCALES_WORK_ONLY_FOR_PHONG_MATERIALS);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECTS_SELECTED_TO_ADJUST_HEIGHT_MAP_SCALE);
    }
  }
  if (keyboardBuffer["l"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var material = selectedAddedObject.material;
      if (material.isMeshPhongMaterial){
        if (material.displacementMap){
          if (material.displacementScale < 10000){
            material.displacementScale = material.displacementScale + heightMapScaleDelta;
            material.needsUpdate = true;
            selectedAddedObject.initDisplacementScaleSet = false;
          }
          terminal.clear();
          terminal.printInfo(Text.HEIGHT_MAP_SCALE.replace(
            Text.PARAM1, material.displacementScale
          ));
        }else{
          terminal.clear();
          terminal.printError(Text.NO_HEIGHT_TEXTURE_MAPPED_TO_THIS_OBJECT);
        }
      }else{
        terminal.clear();
        terminal.printError(Text.HEIGHT_MAP_SCALES_WORK_ONLY_FOR_PHONG_MATERIALS);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECTS_SELECTED_TO_ADJUST_HEIGHT_MAP_SCALE);
    }
  }
  if (keyboardBuffer["u"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var material = selectedAddedObject.material;
      if (material.isMeshPhongMaterial){
        if (material.displacementMap){
          if (material.displacementScale < 10000){
            material.displacementBias = material.displacementBias + heightMapBiasDelta;
            material.needsUpdate = true;
            selectedAddedObject.initDisplacementBiasSet = false;
          }
          terminal.clear();
          terminal.printInfo(Text.HEIGHT_MAP_BIAS.replace(
            Text.PARAM1, material.displacementBias
          ));
        }else{
          terminal.clear();
          terminal.printError(Text.NO_HEIGHT_TEXTURE_MAPPED_TO_THIS_OBJECT);
        }
      }else{
        terminal.clear();
        terminal.printError(Text.HEIGHT_MAP_SCALES_WORK_ONLY_FOR_PHONG_MATERIALS);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECTS_SELECTED_TO_ADJUST_HEIGHT_MAP_SCALE);
    }
  }
  if (keyboardBuffer["i"]){
    if (mode != 0){
      return;
    }
    if (selectedObjectGroup && !selectedAddedObject){
      terminal.clear();
      terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
      return;
    }
    if (selectedAddedObject){
      var material = selectedAddedObject.material;
      if (material.isMeshPhongMaterial){
        if (material.displacementMap){
          if (material.displacementBias > -10000){
            material.displacementBias = material.displacementBias - heightMapBiasDelta;
            material.needsUpdate = true;
            selectedAddedObject.initDisplacementBiasSet = false;
          }
          terminal.clear();
          terminal.printInfo(Text.HEIGHT_MAP_BIAS.replace(
            Text.PARAM1, material.displacementBias
          ));
        }else{
          terminal.clear();
          terminal.printError(Text.NO_HEIGHT_TEXTURE_MAPPED_TO_THIS_OBJECT);
        }
      }else{
        terminal.clear();
        terminal.printError(Text.HEIGHT_MAP_SCALES_WORK_ONLY_FOR_PHONG_MATERIALS);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_OBJECTS_SELECTED_TO_ADJUST_HEIGHT_MAP_SCALE);
    }
  }
  if (keyboardBuffer["1"]){
    if (mode != 0){
      return;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var previewLight = light_previewScene[selectedLightName];
      var lightRepresentation = pointLightRepresentations[selectedLightName];
      if (light.isPointLight || light.isDirectionalLight){
        light.position.x = light.position.x - lightPositionDeltaX;
        previewLight.position.x = light.position.x;
        lightRepresentation.position.x = light.position.x;
        terminal.clear();
        terminal.printInfo(Text.LIGHT_POSITION_ADJUSTED);
      }else{
        terminal.clear();
        terminal.printError(Text.AMBIENT_LIGHTS_HAVE_NO_POSITION);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["2"]){
    if (mode != 0){
      return;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var previewLight = light_previewScene[selectedLightName];
      var lightRepresentation = pointLightRepresentations[selectedLightName];
      if (light.isPointLight || light.isDirectionalLight){
        light.position.x = light.position.x + lightPositionDeltaX;
        previewLight.position.x = light.position.x;
        lightRepresentation.position.x = light.position.x;
        terminal.clear();
        terminal.printInfo(Text.LIGHT_POSITION_ADJUSTED);
      }else{
        terminal.clear();
        terminal.printError(Text.AMBIENT_LIGHTS_HAVE_NO_POSITION);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["3"]){
    if (mode != 0){
      return ;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var previewLight = light_previewScene[selectedLightName];
      var lightRepresentation = pointLightRepresentations[selectedLightName];
      if (light.isPointLight || light.isDirectionalLight){
        light.position.y = light.position.y - lightPositionDeltaY;
        previewLight.position.y = light.position.y;
        lightRepresentation.position.y = light.position.y;
        terminal.clear();
        terminal.printInfo(Text.LIGHT_POSITION_ADJUSTED);
      }else{
        terminal.clear();
        terminal.printError(Text.AMBIENT_LIGHTS_HAVE_NO_POSITION);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["4"]){
    if (mode != 0){
      return ;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var previewLight = light_previewScene[selectedLightName];
      var lightRepresentation = pointLightRepresentations[selectedLightName];
      if (light.isPointLight || light.isDirectionalLight){
        light.position.y = light.position.y + lightPositionDeltaY;
        previewLight.position.y = light.position.y;
        lightRepresentation.position.y = light.position.y;
        terminal.clear();
        terminal.printInfo(Text.LIGHT_POSITION_ADJUSTED);
      }else{
        terminal.clear();
        terminal.printError(Text.AMBIENT_LIGHTS_HAVE_NO_POSITION);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["5"]){
    if (mode != 0){
      return ;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var previewLight = light_previewScene[selectedLightName];
      var lightRepresentation = pointLightRepresentations[selectedLightName];
      if (light.isPointLight || light.isDirectionalLight){
        light.position.z = light.position.z - lightPositionDeltaZ;
        previewLight.position.z = light.position.z;
        lightRepresentation.position.z = light.position.z;
        terminal.clear();
        terminal.printInfo(Text.LIGHT_POSITION_ADJUSTED);
      }else{
        terminal.clear();
        terminal.printError(Text.AMBIENT_LIGHTS_HAVE_NO_POSITION);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }
  if (keyboardBuffer["6"]){
    if (mode != 0){
      return ;
    }
    if (selectedLightName){
      var light = lights[selectedLightName];
      var previewLight = light_previewScene[selectedLightName];
      var lightRepresentation = pointLightRepresentations[selectedLightName];
      if (light.isPointLight || light.isDirectionalLight){
        light.position.z = light.position.z + lightPositionDeltaZ;
        previewLight.position.z = light.position.z;
        lightRepresentation.position.z = light.position.z;
        terminal.clear();
        terminal.printInfo(Text.LIGHT_POSITION_ADJUSTED);
      }else{
        terminal.clear();
        terminal.printError(Text.AMBIENT_LIGHTS_HAVE_NO_POSITION);
      }
    }else{
      terminal.clear();
      terminal.printError(Text.NO_LIGHTS_SELECTED);
    }
  }

}

function copyToClipboard(str){
  try{
    var elem = document.createElement('textarea');
    elem.value = str;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
  }catch(err){
    // CLIPBOARD COPY NOT SUPPORTED
  }
}

function mouseWheelEvent(e) {
  e.preventDefault();
  if (!windowLoaded){
    return;
  }
  var deltaX = e.deltaX;
  var deltaY = e.deltaY;
  if((typeof deltaX == "undefined") || (typeof deltaY == "undefined")){
    return;
  }
  if (Math.abs(deltaX) < Math.abs(deltaY)){
    camera.translateZ(deltaY);
  }else{
    camera.translateX(deltaX);
  }
}

//******************************************************************
// WARNING: FOR TEST PURPOSES
function generateRandomBoxes(gridSystemName){
  var gridSystem = gridSystems[gridSystemName];
  for (var gridNumber in gridSystem.grids){
    var grid = gridSystem.grids[gridNumber];
    var height = Math.random() * 100;
    var name = "randomGeneratedBox_"+gridSystemName+"_"+gridNumber;
    var color = ColorNames.generateRandomColor();
    var material = new THREE.MeshBasicMaterial({color: color});
    gridSystem.newBox([grid], height, material, name);
  }
}

// WARNING: FOR TEST PURPOSES
function printParticleSystemPerformances(){
  for (var particleSystemName in particleSystems){
    var particleSystem = particleSystems[particleSystemName];
    var particles = particleSystem.particles;
    var lastParticle = particles[particles.length-1];
    console.log(particleSystemName+": "+lastParticle.performance/1000+" secs.");
  }
}
