'use strict';
var gol = {};
gol.width = 200;
gol.height = 100;
gol.state = new Int8Array(gol.width * gol.height);
gol.prepareToChange = new Int8Array(gol.width * gol.height);
gol.placeMode = false;
gol.patternList = [];
gol.intervalList = [];

gol.getPoints = function (RLE) {
    var Points = [];
    var i;
    if (RLE.length === 0) {
        var n = gol.width * gol.height / 6;
        for (i = 0; i < n; i++) {
            var index = parseInt(Math.random() * gol.width * gol.height);
            var tr = parseInt(index / gol.width);
            var td = index % gol.width;
            Points.push([tr, td]);
        }
    }
    else {
        var x = 0;
        var y = 0;
        var j;
        var skip = 0;
        var len = RLE.length;
        for (i = 0; i < len; i++) {
            switch (RLE[i]) {
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9': {
                    skip *= 10;
                    skip += RLE[i] - '0';
                    break;
                }
                case 'b': {
                    y += skip === 0 ? 1 : skip;
                    skip = 0;
                    break;
                }
                case 'o': {
                    for (j = skip === 0 ? 1 : skip; j > 0; j--) {
                        Points.push([x, y]);
                        y++;
                    }
                    skip = 0;
                    break;
                }
                case '$': {
                    x += skip === 0 ? 1 : skip;
                    y = 0;
                    skip = 0;
                    break;
                }
                case '!': {
                    return Points;
                }
                default:
            }
        }
    }
    return Points;
};

gol.inverse = function (i, j) {
    var e = document.getElementById("tr" + i + "td" + j);
    if (gol.state[i * gol.width + j] === 1) {
        e.setAttribute('class', 'white');
        gol.state[i * gol.width + j] = 0;
    }
    else {
        e.setAttribute('class', 'gray');
        gol.state[i * gol.width + j] = 1;
    }
};

gol.placePattern = function (posX, posY, pattern) {
    var points = gol.getPoints(pattern);
    for (var i = 0; i < points.length; i++) {
        var x = points[i][0] + posX;
        var y = points[i][1] + posY;
        while (x < 0)
            x += gol.height;
        while (x >= gol.height)
            x -= gol.height;
        while (y < 0)
            y += gol.width;
        while (y >= gol.width)
            y -= gol.width;
        gol.state[x * gol.width + y] = 1;
        document.getElementById("tr" + x + "td" + y).setAttribute('class', 'gray');
    }
};

gol.click = function (i, j) {
    if (gol.placeMode) {
        var patternName = document.getElementById("pattern").value;
        var selectedPattern = gol[patternName];
        gol.placePattern(i, j, selectedPattern);
    }
    else {
        gol.inverse(i, j);
    }
};

gol.isAlive = function (i, j) {
    while (i < 0)
        i += gol.height;
    while (i >= gol.height)
        i -= gol.height;
    while (j < 0)
        j += gol.width;
    while (j >= gol.width)
        j -= gol.width;
    return gol.state[i * gol.width + j];
};

gol.getAroundCellsNumber = function (i, j) {
    var num = 0;
    if (gol.isAlive(i - 1, j - 1)) num++;
    if (gol.isAlive(i - 1, j)) num++;
    if (gol.isAlive(i - 1, j + 1)) num++;
    if (gol.isAlive(i, j - 1)) num++;
    if (gol.isAlive(i, j + 1)) num++;
    if (gol.isAlive(i + 1, j - 1)) num++;
    if (gol.isAlive(i + 1, j)) num++;
    if (gol.isAlive(i + 1, j + 1)) num++;
    return num;
};

gol.grow = function () {
    for (var i = 0; i < gol.height; i++) {
        for (var j = 0; j < gol.width; j++) {
            var n = gol.getAroundCellsNumber(i, j);
            if (n != 2) {
                if (n === 3) {
                    if (gol.state[i * gol.width + j] === 0) {
                        gol.prepareToChange[i * gol.width + j] = 1;
                    }
                }
                else {
                    if (gol.state[i * gol.width + j] === 1) {
                        gol.prepareToChange[i * gol.width + j] = -1;
                    }
                }
            }
        }
    }
    for (i = 0; i < gol.height; i++) {
        for (j = 0; j < gol.width; j++) {
            if (gol.prepareToChange[i * gol.width + j] === 1) {
                document.getElementById("tr" + i + "td" + j).setAttribute('class', 'gray');
                gol.state[i * gol.width + j] = 1;
                gol.prepareToChange[i * gol.width + j] = 0;
            }
            else if (gol.prepareToChange[i * gol.width + j] === -1) {
                document.getElementById("tr" + i + "td" + j).setAttribute('class', 'white');
                gol.state[i * gol.width + j] = 0;
                gol.prepareToChange[i * gol.width + j] = 0;
            }
        }
    }
};

gol.start = function () {
    gol.intervalList.push(setInterval(gol.grow, 100));
};

gol.stop = function () {
    while (gol.intervalList.length) {
        clearInterval(gol.intervalList.pop());
    }
};

gol.clear = function () {
    gol.stop();
    for (var i = 0; i < gol.height; i++)
        for (var j = 0; j < gol.width; j++)
            if (gol.state[i * gol.width + j]) {
                gol.state[i * gol.width + j] = 0;
                document.getElementById("tr" + i + "td" + j).setAttribute('class', 'white');
            }
};

gol.switchPlaceMode = function () {
    if (!gol.placeMode) {
        gol.placeMode = true;
        document.getElementById("mode").style.color = "#f60";
        document.getElementById("mode").innerText = "place mode on";
    }
    else {
        gol.placeMode = false;
        document.getElementById("mode").style.color = "";
        document.getElementById("mode").innerText = "place mode off";
    }
};

gol.patternRegister = function (name, RLE) {
    gol[name] = RLE;
    var name_ = name.replace('_', ' ');
    gol.patternList.push([name, name_]);
};

gol.patternRegister('random', "");
gol.patternRegister('Gosper_glider_gun', "24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$2o8bo3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!");
gol.patternRegister("New_gun_1", "25b2o5b2o$25b2o5b2o12$27b2ob2o2b$26bo5bob2$25bo7bo$25bo2bobo2bo$25b3o3b3o5$17bo16b$2o15b2o15b$2o16b2o14b$13b2o2b2o15b4$13b2o2b2o15b$2o16b2o7b2o5b$2o15b2o8b2o5b$17bo!");
gol.patternRegister("New_gun_2", "23b2o24b2o$23b2o24b2o$41b2o8b$40bo2bo7b$41b2o8b2$36b3o12b$36bobo12b$9b2o25b3o12b$9b2o25b2o13b$8bo2bo23b3o13b$8bo2bob2o20bobo13b$8bo4b2o20b3o13b$10b2ob2o36b$31b2o18b$21b2o7bo2bo17b$21b2o8b2o18b$49b2o$49b2o2$4b2o18bo26b$2o4b4o10b2o2b2ob3o21b$2o2b2ob3o10b2o4b4o21b$4bo19b2o!");
gol.patternRegister("Tagalong", "21bo3b$18b4o3b$13bo2bob2o5b$13bo11b$4o8bo3bob2o5b$o3bo5b2ob2obobob5o$o9b2obobobo2b5o$bo2bo2b2o2bo3b3o2bob2ob$6bo2bob2o12b$6bo4b2o12b$6bo2bob2o12b$bo2bo2b2o2bo3b3o2bob2ob$o9b2obobobo2b5o$o3bo5b2ob2obobob5o$4o8bo3bob2o5b$13bo11b$13bo2bob2o5b$18b4o3b$21bo!");
gol.patternRegister("_30P5H2V0", "4bo8b$3b3o7b$2b2ob2o6b2$bobobobo2bo2b$2o3bo3b3ob$2o3bo6bo$10bobo$8bobo2b$9bo2bo$12bo!");
gol.patternRegister("_44P5H2V0", "4bo5bo4b$3b3o3b3o3b$2bo2bo3bo2bo2b$b3o7b3ob$2bobo5bobo2b$4b2o3b2o4b$o4bo3bo4bo$5bo3bo5b$2o3bo3bo3b2o$2bo2bo3bo2bo2b$4bo5bo!");
gol.patternRegister("_60P5H2V0", "5bo7bo5b$3b2ob2o3b2ob2o3b$6b2o3b2o6b$8bobo8b$bo4bobobobo4bob$3o5bobo5b3o$o5bobobobo5bo$2bo2bo2bobo2bo2bo2b$2b2o3b2ob2o3b2o2b$o7bobo7bo$o6b2ob2o6bo!");
gol.patternRegister("_70P5H2V0", "2bo12bo2b$bobo10bobob$2ob2o8b2ob2o$2o14b2o$2bo12bo2b$2b4o6b4o2b$2bo2b2o4b2o2bo2b$3b2o2bo2bo2b2o3b$4b2ob4ob2o4b$5bobo2bobo5b$6bo4bo6b2$5bo6bo5b$3b2ob2o2b2ob2o3b$4bo8bo4b$4b2o6b2o!");