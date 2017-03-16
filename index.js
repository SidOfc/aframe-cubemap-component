/* global AFRAME, THREE */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Cubemap component for A-Frame.
 */
AFRAME.registerComponent('cubemap', {
  schema: {
    folder: {
      type: 'string'
    },
    edgeLength: {
      type: 'int',
      default: 5000
    },
		nameMap: {
			type: 'string'
		}
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) {
    // entity data
    var el = this.el;
    var data = this.data;

			if (data.nameMap) {
				// convert the nameMap string into an object
				name_map_array = data.nameMap.split(' ');
				for (var i = 0, j = name_map_array.length; i < j; i++) {
					name_map = name_map_array[i].split('=');
					placeholders[name_map[0]] = name_map[1];
				}
			}

			// Fill urls using placeholders which will be used instead of the static defaults
			for (var ii = 0, jj = cube_order.length; ii < jj; ii++) {
				urls[ii] = placeholders[cube_order[ii]] + ".jpg";
			}

	    // Code that follows is adapted from "Skybox and environment map in Three.js" by Roman Liutikov
	    // http://blog.romanliutikov.com/post/58705840698/skybox-and-environment-map-in-threejs

	    // Create loader, set folder path, and load cubemap textures
	    var loader = new THREE.CubeTextureLoader();
	    loader.setPath(srcPath);

	    var cubemap = loader.load(urls);
	    cubemap.format = THREE.RGBFormat;

	    var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib

	    // Create shader material
	    var skyBoxShader = new THREE.ShaderMaterial({
	      fragmentShader: shader.fragmentShader,
	      vertexShader: shader.vertexShader,
	      uniforms: shader.uniforms,
	      depthWrite: false,
	      side: THREE.BackSide
	    });

	    // Clone ShaderMaterial (necessary for multiple cubemaps)
	    var skyBoxMaterial = skyBoxShader.clone();
	    skyBoxMaterial.uniforms['tCube'].value = cubemap; // Apply cubemap textures to shader uniforms

	    // Set skybox dimensions
	    var edgeLength = data.edgeLength;
	    var skyBoxGeometry = new THREE.CubeGeometry(edgeLength, edgeLength, edgeLength);

    // Set entity's object3D
    el.setObject3D('cubemap', new THREE.Mesh(skyBoxGeometry, skyBoxMaterial));
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () {
    this.el.removeObject3D('cubemap');
  }
});
