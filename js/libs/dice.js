"use strict";

var random_storage = [];
this.frame_rate = 1 / 25;

function prepare_rnd(callback) {
    callback();
}

function rnd() {
    return random_storage.length ? random_storage.pop() : Math.random();
}

function create_shape(vertices, faces, radius) {
    var cv = new Array(vertices.length), cf = new Array(faces.length);
    for (var i = 0; i < vertices.length; ++i) {
        var v = vertices[i];
        cv[i] = new CANNON.Vec3(v.x * radius, v.y * radius, v.z * radius);
    }
    for (var i = 0; i < faces.length; ++i) {
        cf[i] = faces[i].slice(0, faces[i].length - 1);
    }
    return new CANNON.ConvexPolyhedron(cv, cf);
}

function make_geom(vertices, faces, radius, tab, af) {
    var geom = new THREE.Geometry();
    for (var i = 0; i < vertices.length; ++i) {
        var vertex = vertices[i].multiplyScalar(radius);
        vertex.index = geom.vertices.push(vertex) - 1;
    }
    for (var i = 0; i < faces.length; ++i) {
        var ii = faces[i], fl = ii.length - 1;
        var aa = Math.PI * 2 / fl;
        for (var j = 0; j < fl - 2; ++j) {
            geom.faces.push(new THREE.Face3(ii[0], ii[j + 1], ii[j + 2], [geom.vertices[ii[0]],
                        geom.vertices[ii[j + 1]], geom.vertices[ii[j + 2]]], 0, ii[fl] + 1));
            geom.faceVertexUvs[0].push([
                    new THREE.Vector2((Math.cos(af) + 1 + tab) / 2 / (1 + tab),
                        (Math.sin(af) + 1 + tab) / 2 / (1 + tab)),
                    new THREE.Vector2((Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
                        (Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)),
                    new THREE.Vector2((Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
                        (Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab))]);
        }
    }
    geom.computeFaceNormals();
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
    return geom;
}

function chamfer_geom(vectors, faces, chamfer) {
    var chamfer_vectors = [], chamfer_faces = [], corner_faces = new Array(vectors.length);
    for (var i = 0; i < vectors.length; ++i) corner_faces[i] = [];
    for (var i = 0; i < faces.length; ++i) {
        var ii = faces[i], fl = ii.length - 1;
        var center_point = new THREE.Vector3();
        var face = new Array(fl);
        for (var j = 0; j < fl; ++j) {
            var vv = vectors[ii[j]].clone();
            center_point.add(vv);
            corner_faces[ii[j]].push(face[j] = chamfer_vectors.push(vv) - 1);
        }
        center_point.divideScalar(fl);
        for (var j = 0; j < fl; ++j) {
            var vv = chamfer_vectors[face[j]];
            vv.subVectors(vv, center_point).multiplyScalar(chamfer).addVectors(vv, center_point);
        }
        face.push(ii[fl]);
        chamfer_faces.push(face);
    }
    for (var i = 0; i < faces.length - 1; ++i) {
        for (var j = i + 1; j < faces.length; ++j) {
            var pairs = [], lastm = -1;
            for (var m = 0; m < faces[i].length - 1; ++m) {
                var n = faces[j].indexOf(faces[i][m]);
                if (n >= 0 && n < faces[j].length - 1) {
                    if (lastm >= 0 && m != lastm + 1) pairs.unshift([i, m], [j, n]);
                    else pairs.push([i, m], [j, n]);
                    lastm = m;
                }
            }
            if (pairs.length != 4) continue;
            chamfer_faces.push([chamfer_faces[pairs[0][0]][pairs[0][1]],
                    chamfer_faces[pairs[1][0]][pairs[1][1]],
                    chamfer_faces[pairs[3][0]][pairs[3][1]],
                    chamfer_faces[pairs[2][0]][pairs[2][1]], -1]);
        }
    }
    for (var i = 0; i < corner_faces.length; ++i) {
        var cf = corner_faces[i], face = [cf[0]], count = cf.length - 1;
        while (count) {
            for (var m = faces.length; m < chamfer_faces.length; ++m) {
                var index = chamfer_faces[m].indexOf(face[face.length - 1]);
                if (index >= 0 && index < 4) {
                    if (--index == -1) index = 3;
                    var next_vertex = chamfer_faces[m][index];
                    if (cf.indexOf(next_vertex) >= 0) {
                        face.push(next_vertex);
                        break;
                    }
                }
            }
            --count;
        }
        face.push(-1);
        chamfer_faces.push(face);
    }
    return { vectors: chamfer_vectors, faces: chamfer_faces };
}

function create_geom(vertices, faces, radius, tab, af, chamfer) {
    var vectors = new Array(vertices.length);
    for (var i = 0; i < vertices.length; ++i) {
        vectors[i] = (new THREE.Vector3).fromArray(vertices[i]).normalize();
    }
    var cg = chamfer_geom(vectors, faces, chamfer);
    var geom = make_geom(cg.vectors, cg.faces, radius, tab, af);
    //var geom = make_geom(vectors, faces, radius, tab, af); // Without chamfer
    geom.cannon_shape = create_shape(vectors, faces, radius);
    return geom;
}

this.standart_d20_dice_face_labels = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
        '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

function calc_texture_size(approx) {
    return Math.pow(2, Math.floor(Math.log(approx) / Math.log(2)));
}

this.create_dice_materials = function(face_labels, size, margin, dice_color) {
    function create_text_texture(text, color, back_color) {
        if (text == undefined) return null;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var ts = calc_texture_size(size + size * 2 * margin) * 2;
        canvas.width = canvas.height = ts;
        context.font = ts / (1 + 2 * margin) + "pt Verdana";
        context.fillStyle = back_color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    var materials = [];
    for (var i = 0; i < face_labels.length; ++i)
        materials.push(new THREE.MeshPhongMaterial(copyto(this.material_options,
                    { map: create_text_texture(face_labels[i], this.label_color, dice_color) })));
    return materials;
}

this.create_d6_geometry = function(radius) {
    var vertices = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
    var faces = [[0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3],
            [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]];
    return create_geom(vertices, faces, radius, 0.1, Math.PI / 4, 0.96);
}

this.material_options = {
    specular: 0x172022,
    color: 0xf0f0f0,
    shininess: 40,
    flatShading: true,
};
this.label_color = '#aaaaaa';
this.ambient_light_color = 0xf0f5fb;
this.spot_light_color = 0xefdfd5;
this.desk_color = 0xb7b7b7;

this.dice_face_range = {'d6': [1, 6]};
this.dice_mass = {'d6': 300};
this.dice_inertia = {'d6': 13};

this.scale = 50;

this.create_d6 = function(dice_color) {
    if (!this.d6_geometry) this.d6_geometry = this.create_d6_geometry(this.scale * 1.9);
    this.dice_material = this.create_dice_materials(this.standart_d20_dice_face_labels, this.scale / 2, 1.0, dice_color)
    return new THREE.Mesh(this.d6_geometry, this.dice_material);
}

var that = this;

this.dice_box = function(container, dimentions, options) {
    this.use_adapvite_timestep = true;

    this.dice_color = '#000000';
    this.dice_color = options.dice_color ? options.dice_color : this.dice_color;

    this.dices = [];
    this.scene = new THREE.Scene();
    this.world = new CANNON.World();

    this.renderer = window.WebGLRenderingContext
        ? new THREE.WebGLRenderer({ antialias: true })
        : new THREE.CanvasRenderer({ antialias: true });
    container.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor( 0xffffff, 0);

    this.reinit(container, dimentions);

    this.world.gravity.set(0, 0, -20 * 800);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 16;

    var ambientLight = new THREE.AmbientLight(that.ambient_light_color);
    this.scene.add(ambientLight);

    this.dice_body_material = new CANNON.Material();
    var desk_body_material = new CANNON.Material();
    var barrier_body_material = new CANNON.Material();
    this.world.addContactMaterial(new CANNON.ContactMaterial(
                desk_body_material, this.dice_body_material, 0.01, 0.5));
    this.world.addContactMaterial(new CANNON.ContactMaterial(
                barrier_body_material, this.dice_body_material, 0, 1.0));
    this.world.addContactMaterial(new CANNON.ContactMaterial(
                this.dice_body_material, this.dice_body_material, 0, 0.5));

    this.world.add(new CANNON.RigidBody(0, new CANNON.Plane(), desk_body_material));
    var barrier;
    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    barrier.position.set(0, this.h * 0.93, 0);
    this.world.add(barrier);

    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    barrier.position.set(0, -this.h * 0.93, 0);
    this.world.add(barrier);

    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    barrier.position.set(this.w * 0.93, 0, 0);
    this.world.add(barrier);

    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    barrier.position.set(-this.w * 0.93, 0, 0);
    this.world.add(barrier);

    this.last_time = 0;
    this.running = false;

    this.renderer.render(this.scene, this.camera);
}

this.dice_box.prototype.reinit = function(container, dimentions) {
    this.cw = container.clientWidth / 2;
    this.ch = container.clientHeight / 2;
    if (dimentions) {
        this.w = dimentions.w;
        this.h = dimentions.h;
    }
    else {
        this.w = this.cw;
        this.h = this.ch;
    }
    this.aspect = Math.min(this.cw / this.w, this.ch / this.h);
    that.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 16;

    this.renderer.setSize(this.cw * 2, this.ch * 2);

    this.wh = this.ch / this.aspect / Math.tan(10 * Math.PI / 180);
    if (this.camera) this.scene.remove(this.camera);
    this.camera = new THREE.PerspectiveCamera(20, this.cw / this.ch, 1, this.wh * 1.3);
    this.camera.position.z = this.wh;

    var mw = Math.max(this.w, this.h);
    if (this.light) this.scene.remove(this.light);
    this.light = new THREE.SpotLight(that.spot_light_color, 2.0);
    this.light.position.set(-mw / 2, mw / 2, mw * 2);
    this.light.target.position.set(0, 0, 0);
    this.light.distance = mw * 5;
    this.light.castShadow = true;
    this.light.shadow.camera.near = mw / 10;
    this.light.shadow.camera.far = mw * 5;
    this.light.shadow.camera.fov = 50;
    this.light.shadow.bias = 0.001;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.scene.add(this.light);

    if (this.desk) this.scene.remove(this.desk);
    this.desk = new THREE.Mesh(new THREE.PlaneGeometry(this.w * 2, this.h * 2, 1, 1),
            new THREE.MeshBasicMaterial({ color: that.desk_color }));
    this.desk.receiveShadow = true;
    this.scene.add(this.desk);

    this.renderer.render(this.scene, this.camera);
}

function make_random_vector(vector) {
    var random_angle = rnd() * Math.PI / 5 - Math.PI / 5 / 2;
    var vec = {
        x: vector.x * Math.cos(random_angle) - vector.y * Math.sin(random_angle),
        y: vector.x * Math.sin(random_angle) + vector.y * Math.cos(random_angle)
    };
    if (vec.x == 0) vec.x = 0.01;
    if (vec.y == 0) vec.y = 0.01;
    return vec;
}

this.dice_box.prototype.generate_vectors = function(vector, boost, diceRolls) {
    var vectors = [];
    for (var i in diceRolls) {
        var vec = make_random_vector(vector);
        var pos = {
            x: this.w * (vec.x > 0 ? -1 : 1) * 0.9,
            y: this.h * (vec.y > 0 ? -1 : 1) * 0.9,
            z: rnd() * 200 + 200
        };
        var projector = Math.abs(vec.x / vec.y);
        if (projector > 1.0) pos.y /= projector; else pos.x *= projector;
        var velvec = make_random_vector(vector);
        var velocity = { x: velvec.x * boost, y: velvec.y * boost, z: -10 };
        var inertia = that.dice_inertia['d6'];
        var angle = {
            x: -(rnd() * vec.y * 5 + inertia * vec.y),
            y: rnd() * vec.x * 5 + inertia * vec.x,
            z: 0
        };
        var axis = { x: rnd(), y: rnd(), z: rnd(), a: rnd() };
        vectors.push({ set: 'd6', pos: pos, velocity: velocity, angle: angle, axis: axis });
    }
    return vectors;
}

this.dice_box.prototype.create_dice = function(type, pos, velocity, angle, axis) {
    var dice = that['create_' + type](this.dice_color);
    dice.castShadow = true;
    dice.dice_type = type;
    dice.body = new CANNON.RigidBody(that.dice_mass[type],
            dice.geometry.cannon_shape, this.dice_body_material);
    dice.body.position.set(pos.x, pos.y, pos.z);
    dice.body.quaternion.setFromAxisAngle(new CANNON.Vec3(axis.x, axis.y, axis.z), axis.a * Math.PI * 2);
    dice.body.angularVelocity.set(angle.x, angle.y, angle.z);
    dice.body.velocity.set(velocity.x, velocity.y, velocity.z);
    dice.body.linearDamping = 0.1;
    dice.body.angularDamping = 0.1;
    this.scene.add(dice);
    this.dices.push(dice);
    this.world.add(dice.body);
}

this.dice_box.prototype.check_if_throw_finished = function() {
    var res = true;
    var e = 6;
    if (this.iteration < 10 / that.frame_rate) {
        for (var i = 0; i < this.dices.length; ++i) {
            var dice = this.dices[i];
            if (dice.dice_stopped === true) continue;
            var a = dice.body.angularVelocity, v = dice.body.velocity;
            if (Math.abs(a.x) < e && Math.abs(a.y) < e && Math.abs(a.z) < e &&
                    Math.abs(v.x) < e && Math.abs(v.y) < e && Math.abs(v.z) < e) {
                if (dice.dice_stopped) {
                    if (this.iteration - dice.dice_stopped > 3) {
                        dice.dice_stopped = true;
                        continue;
                    }
                }
                else dice.dice_stopped = this.iteration;
                res = false;
            }
            else {
                dice.dice_stopped = undefined;
                res = false;
            }
        }
    }
    return res;
}

function get_dice_value(dice) {
    var vector = new THREE.Vector3(0, 0, dice.dice_type == 'd4' ? -1 : 1);
    var closest_face, closest_angle = Math.PI * 2;
    for (var i = 0, l = dice.geometry.faces.length; i < l; ++i) {
        var face = dice.geometry.faces[i];
        if (face.materialIndex == 0) continue;
        var angle = face.normal.clone().applyQuaternion(dice.body.quaternion).angleTo(vector);
        if (angle < closest_angle) {
            closest_angle = angle;
            closest_face = face;
        }
    }
    var matindex = closest_face.materialIndex - 1;
    if (dice.dice_type == 'd100') matindex *= 10;
    return matindex;
}

function get_dice_values(dices) {
    var values = [];
    for (var i = 0, l = dices.length; i < l; ++i) {
        values.push(get_dice_value(dices[i]));
    }
    return values;
}

this.dice_box.prototype.emulate_throw = function() {
    while (!this.check_if_throw_finished()) {
        ++this.iteration;
        this.world.step(that.frame_rate);
    }
    return get_dice_values(this.dices);
}

var direction_kek = new THREE.Vector3(0.3, 0.5, 0);

this.dice_box.prototype.__animate = function(threadid) {
    var time = (new Date()).getTime();
    var time_diff = (time - this.last_time) / 10;
    if (time_diff > 3) time_diff = that.frame_rate;
    ++this.iteration;
    if (this.use_adapvite_timestep) {
        while (time_diff > that.frame_rate * 0.5) {
            this.world.step(that.frame_rate);
            time_diff -= that.frame_rate;
        }
        this.world.step(time_diff);
    }
    else {
        this.world.step(that.frame_rate);
    }
    for (var i in this.scene.children) {
        var interact = this.scene.children[i];
        if (interact.body != undefined) {
            interact.position.copy(interact.body.position);
            interact.quaternion.copy(interact.body.quaternion);
        }
    }

    for (var i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].dice_type === 'd6') {

        }
    }

    this.renderer.render(this.scene, this.camera);
    this.last_time = this.last_time ? time : (new Date()).getTime();

    if (this.running == threadid && this.check_if_throw_finished()) {
        this.running = false;
        if (this.callback) {
            this.callback.call(this, get_dice_values(this.dices));
        }
    }
    if (this.running == threadid) {
        (function(t, tid, uat) {
            if (!uat && time_diff < that.frame_rate) {
                setTimeout(function() { requestAnimationFrame(function() { t.__animate(tid); }); },
                    (that.frame_rate - time_diff) * 10);
            }
            else requestAnimationFrame(function() { t.__animate(tid); });
        })(this, threadid, this.use_adapvite_timestep);
    }
}

this.dice_box.prototype.clear = function() {
    this.running = false;
    var dice;
    while (dice = this.dices.pop()) {
        this.scene.remove(dice);
        if (dice.body) this.world.remove(dice.body);
    }
    if (this.pane) this.scene.remove(this.pane);
    this.renderer.render(this.scene, this.camera);
    var box = this;
    setTimeout(function() { box.renderer.render(box.scene, box.camera); }, 10);
}

this.dice_box.prototype.prepare_dices_for_roll = function(vectors) {
    this.clear();
    this.iteration = 0;
    for (var i in vectors) {
        this.create_dice(vectors[i].set, vectors[i].pos, vectors[i].velocity,
                vectors[i].angle, vectors[i].axis);
    }
}

function shift_dice_faces(dice, value, res) {
    var r = that.dice_face_range[dice.dice_type];
    if (!(value >= r[0] && value <= r[1])) return;
    var num = value - res;
    var geom = dice.geometry.clone();
    for (var i = 0, l = geom.faces.length; i < l; ++i) {
        var matindex = geom.faces[i].materialIndex;
        if (matindex == 0) continue;
        matindex += num - 1;
        while (matindex > r[1]) matindex -= r[1];
        while (matindex < r[0]) matindex += r[1];
        geom.faces[i].materialIndex = matindex + 1;
    }
    dice.geometry = geom;
}

this.dice_box.prototype.roll = function(vectors, values, callback) {
    this.prepare_dices_for_roll(vectors);
    if (values != undefined && values.length) {
        this.use_adapvite_timestep = false;
        var res = this.emulate_throw();
        this.prepare_dices_for_roll(vectors);
        for (var i in res)
            shift_dice_faces(this.dices[i], values[i], res[i]);
    }
    this.callback = callback;
    this.running = (new Date()).getTime();
    this.last_time = 0;
    this.__animate(this.running);
}

this.dice_box.prototype.throw_dices = function(box, vector, boost, dist, diceRolls, after_roll, context) {
    var uat = this.use_adapvite_timestep;
    function roll(request_results) {
        box.clear();
        box.roll(vectors, request_results || notation.result, function(result) {
            if (after_roll) after_roll.call(box, result, context);
            box.rolling = false;
            this.use_adapvite_timestep = uat;
        });
    }
    vector.x /= dist; vector.y /= dist;
    var vectors = box.generate_vectors(vector, boost, diceRolls);
    box.rolling = true;
    roll(diceRolls);
}

function rotateAroundObjectAxis(object, axis, radians) {
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

// Rotate an object around an arbitrary axis in world space
function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

this.dice_box.prototype.throw = function(diceRolls, after_roll, context) {
    var box = this;
    box.start_throw(diceRolls, after_roll, context);
}

this.dice_box.prototype.bind_throw = function(button, diceRolls, after_roll) {
    var box = this;
    bind(button, ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        box.start_throw(diceRolls, after_roll);
    });
}

this.dice_box.prototype.start_throw = function(diceRolls, after_roll, context) {
    var box = this;
    if (box.rolling) return;
    prepare_rnd(function() {
        var vector = { x: (rnd() * 2 - 1) * box.w, y: -(rnd() * 2 - 1) * box.h };
        var dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        var boost = (rnd() + 3) * dist;
        box.throw_dices(box, vector, boost, dist, diceRolls, after_roll, context);
    });
}

function bind(sel, eventname, func, bubble) {
    if (eventname.constructor === Array) {
        for (var i in eventname)
            sel.addEventListener(eventname[i], func, bubble ? bubble : false);
    }
    else
        sel.addEventListener(eventname, func, bubble ? bubble : false);
}

function copyto(obj, res) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (obj instanceof Array) {
        for (var i = obj.length - 1; i >= 0; --i) {
            res[i] = copy(obj[i]);
        }
    }
    else {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                res[i] = copy(obj[i]);
            }
        }
    }
    return res;
}

function copy(obj) {
    if (!obj) return obj;
    return copyto(obj, new obj.constructor());
}