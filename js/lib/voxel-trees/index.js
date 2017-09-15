module.exports = function (opts) {
    if (!opts) opts = {};
    if (opts.bark === undefined) opts.bark = 1;
    if (opts.leaves === undefined) opts.leaves = 2;
    if (opts.random == undefined) opts.random = function() { return Math.random(); };
    if (!opts.height) opts.height = opts.random() * 16 + 4;
    if (opts.base === undefined) opts.base = opts.height / 3;
    if (opts.radius === undefined) opts.radius = opts.base;
    if (opts.treeType === undefined) opts.treeType = 'subspace';
    if (opts.position === undefined) throw "voxel-trees requires position option";
    if (opts.setBlock === undefined) throw "voxel-trees requires setBlock option";

    var set = opts.setBlock;

    var generators = {
    subspace: function() {
        var around = [
        [ 0, 1 ], [ 0, -1 ],
        [ 1, 1 ], [ 1, 0 ], [ 1, -1 ],
        [ -1, 1 ], [ -1, 0 ], [ -1, -1 ]
        ];
        for (var y = 0; y < opts.height - 1; y++) {
            var pos = {x:opts.position.x, y:opts.position.y, z:opts.position.z};
            pos.y += y
            if (set(pos, opts.bark)) break;
            if (y < opts.base) continue;
            around.forEach(function (offset) {
                if (opts.random() > 0.5) return;
                var x = offset[0]
                var z = offset[1]
                pos.x += x;
                pos.z += z;
                set(pos, opts.leaves);
                pos.x -= x;
                pos.z -= z;
            });
        }
    },

    guybrush: function() {
        var sphere = function(x,y,z, r) {
            return x*x + y*y + z*z <= r*r;
        }
        for (var y = 0; y < opts.height - 1; y++) {
            var pos = {x:opts.position.x, y:opts.position.y, z:opts.position.z};
            pos.y += y;
            if (set(pos, opts.bark)) break;
        }
        var radius = opts.radius;
        for (var xstep = -radius; xstep <= radius; xstep++) {
            for (var ystep = -radius; ystep <= radius; ystep++) {
                for (var zstep = -radius; zstep <= radius; zstep++) {
                    if (sphere(xstep,ystep,zstep, radius)) {
                        var leafpos = {
                            x: pos.x + xstep,
                            y: pos.y + ystep,
                            z: pos.z + zstep
                        }
                        set(leafpos, opts.leaves);
                    }
                }
            }
        }
    },

    fractal: function() {
        function drawAxiom(axiom, angle, unitsize, units) {
            var posstack = [];
            
            var penangle = 0;
            var pos = {x:opts.position.x, y:opts.position.y, z:opts.position.z};
            pos.y += unitsize * 30;
            function moveForward() {
                var ryaw = penangle * Math.PI/180;
                for (var i = 0; i < units; i++) {
                    pos.y += unitsize * Math.cos(ryaw);
                    pos.z += unitsize * Math.sin(ryaw);
                    set(pos,opts.leaves);
                }
            }

            function setPoint() {
                set(pos, opts.bark);
            }
            function setMaterial(value) {
                mindex = value;
            }
            function yaw(angle) {
                penangle += angle;
            }
            function pitch(angle) {
                //turtle.pitch += angle;
            }
            function roll(angle) {
                //turtle.roll += angle;
            }
            function PushState() {
                //penstack.push(turtle);
                posstack.push(pos);
            }
            function PopState() {
              //  turtle = penstack.pop();
                pos = posstack.pop();
            }
            
            //F  - move forward one unit with the pen down
            //G  - move forward one unit with the pen up
            //#  - Changes draw medium.

            // +  - yaw the turtle right by angle parameter
            // -  - yaw the turtle left by angle parameter
            // &  - pitch the turtle down by angle parameter
            // ^  - pitch the turtle up by angle parameter
            // /  - roll the turtle to the right by angle parameter
            // *  - roll the turtle to the left by angle parameter
            // [  - save in stack current state info
            // ]  - recover from stack state info
            for (var i = 0; i < axiom.length; i++) {
                var c = axiom.charAt(i);
                switch(c) {
                    case 'F':
                        moveForward();
                        setPoint();
                        break;
                    case '+':
                        yaw(+angle);
                        break;
                    case '-':
                        yaw(-angle);
                        break;
                    case '&':
                        pitch(+angle);
                        break;
                    case '^':
                        pitch(-angle);
                        break;
                    case '/':
                        roll(+angle);
                        break;
                    case '*':
                        roll(-angle);
                        break;
                    case 'G':
                        moveForward();
                        break;
                    case '[':
                        PushState();
                        break;
                    case ']':
                        PopState();
                        break;
                    case '0':
                        setMaterial(0);
                        break;
                    case '1':
                        setMaterial(1);
                        break;
                    case '2':
                        setMaterial(2);
                        break;
                    case '3':
                        setMaterial(3);
                        break;

                }
            }
        }

        var axiom = "FX";
        var rules = [ ["X", "X+YF+"], ["Y", "-FX-Y"]];
        axiom = applyRules(axiom,rules);
        axiom = applyRules(axiom,rules);
        axiom = applyRules(axiom,rules);
        axiom = applyRules(axiom,rules);
        axiom = applyRules(axiom,rules);
        axiom = applyRules(axiom,rules);
        drawAxiom(axiom, 90, 1, 5);
    }
    };
  
    if (!generators[opts.treeType]) throw 'voxel-trees invalid treeType: ' + opts.treeType;

    generators[opts.treeType]();
};

function regexRules(rules) {
    var regexrule = '';
    rules.forEach(function (rule) {
        if (regexrule != '') {
            regexrule = regexrule+ '|' ;
        }
        regexrule = regexrule+rule[0];
    });
    return new RegExp(regexrule, "g");
}

function applyRules(axiom, rules) {
    function matchRule(match)
    {
        for (var i=0;i<rules.length;i++)
        { 
            if (rules[i][0] == match) return rules[i][1];
        }
        return '';
    }
    return axiom.replace(regexRules(rules), matchRule);
}
