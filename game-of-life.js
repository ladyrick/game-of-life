'use strict';
var gol = {};
gol.width = 200;
gol.height = 160;
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
        gol.placePattern(i, j, gol[patternName]);
    }
    else {
        gol.inverse(i, j);
    }
};

gol.isAlive = function (i, j) {
    // {
    //     while (i < 0)
    //         i += gol.height;
    //     while (i >= gol.height)
    //         i -= gol.height;
    //     while (j < 0)
    //         j += gol.width;
    //     while (j >= gol.width)
    //         j -= gol.width;
    // }
    {
        if (i < 0)
            return false;
        if (i >= gol.height)
            return false;
        if (j < 0)
            return false;
        if (j >= gol.width)
            return false;
    }
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
    if (gol.hasOwnProperty(name))
        return;
    gol[name] = RLE;
    gol.patternList.push(name);
};

gol.patternRegister("random", "");
gol.patternRegister("Gosper glider gun", "24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$2o8bo3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!");
gol.patternRegister("AK-94", "7bo7bo7b2o$7b3o5b3o5b2o$10bo7bo$9b2o6b2o16b2o$30b2o2bo2bo$30bobo2b2o$33b2o$5bo28bo$5b3o26bob2o$8bo22b2obo2bo$7b2o22b2ob2o3$17bo$2b2ob2o9bobo10b2o$o2bob2o8bo3bo9bo$2obo11bo3bo10b3o$3bo11bo3bo12bo$3b2o11bobo$b2o2bobo9bo$o2bo2b2o$b2o16b2o$19bo$13b2o5b3o$13b2o7bo!");
gol.patternRegister("B-52 bomber", "b2o36b$b2o17bo18b$19bobo12bobo2b$20bo12bo5b$2o7b2o23bo2bob$2obo5b2o23bobobo$3bo23bo7bo2bo$3bo23b2o7b2ob$o2bo17b2o5bo10b$b2o18bo17b$21b3o15b$36b2ob$36b2ob$b2o36b$o2bo35b$obobo16bobo4b2o5b2o2b$bo2bo17b2o4b2o5b2obo$5bo12bo3bo15bo$2bobo12bobo18bo$18bo16bo2bo$36b2o!");
gol.patternRegister("Bi-gun", "11bo38b$10b2o38b$9b2o39b$10b2o2b2o34b$38bo11b$38b2o8b2o$39b2o7b2o$10b2o2b2o18b2o2b2o10b$2o7b2o39b$2o8b2o38b$11bo38b$34b2o2b2o10b$39b2o9b$38b2o10b$38bo!");
gol.patternRegister("Gunstar", "40b2o107b$40b2o107b$40b2o107b$40bo108b$39bobo107b$39bob2o106b2$46b2o101b$40b2o4b2o101b$40b2o107b2$60bo26b2o60b$50b2o8b3o24bo61b$50bobo10bo21bobo61b$50bo11b2o15bo5b2o4b2o56b$78b2o11b2o56b$51b2o25bobo68b$47bo3bo2bo37bo56b$46bo2bob3o37bobo55b$46b3obo39bo2bo55b$40b2o5bob3o37bo2bo56b$40b2o11bo95b$40b2o22b2o23bo2bo56b$41bo22b2o25b2o56b$40bobo106b$39b2obo12b3o91b$55bo93b$56bo92b$40b2o107b$40b2o57b3o47b2$73b2o20b3obo2bo46b$74bo7b2o9bob3o51b$71b3o8b2o8bo6b3o47b$71bo20b2o55b2$95b2o52b$87b2o9b2o49b$87b2o7bobo50b$43b2o52bo25bo19b2o4b$43b2o74b2o2b2ob3o10b2o4b4o$102b2o15b2o4b4o10b2o2b2ob3o$84b2o15b3o19b2o18bo5b$43b3o34b2o2b2o2b2o10bobo2bo2b2o39b$44b2o34bobo2bo2b2o10b2o2b2o2b2o39b$41b2o38b3o20b2o43b$31bo9b3o38b2o45b2o9b2o7b$29bo3bo8bobo83b2obo8b2o7b$29bo3bo9b2o84bo19b$29bobobo3bo90bobo18b$37b2o89b2o4b3o12b$31b2o6bo88bob3o3bo12b$31b2o3bobo91bobo2bo13b$31b2o3bo90bo2bo18b$131bo17b$18b2o12bobo26bo60b2o25b$14b2obo2bob2o9b2o26bobo57bobo25b$14b2o2bo4bo37b2o60bo25b$19bo129b$20bobo20b2o104b$11bo25b2o4b2o91b2o11b$11b3o23b2o52b3o42bo12b$14bo76bo42bobo12b$13b2o27b3o47bo41b2o13b$42b2o81b2o22b$32b2o11b2o78b2o22b$32b2o10b3o102b$43bobo103b$16bo26b2o104b$14b2o133b$15b2o132b$114b2o33b$115bo33b$115bobo31b$31b2o83b2o31b$31bobo115b$33bo115b$33b2o114b$132b2o15b$133b2o14b$104b2o26bo16b$103bobo43b$102b3o10b2o32b$22b2o78b2o11b2o32b$22b2o81b2o42b$13b2o41bo47b3o27b2o13b$12bobo42bo76bo14b$12bo42b3o52b2o23b3o11b$11b2o91b2o4b2o25bo11b$104b2o20bobo20b$129bo19b$25bo60b2o37bo4bo2b2o14b$25bobo57bobo26b2o9b2obo2bob2o14b$25b2o60bo26bobo12b2o18b$17bo131b$18bo2bo90bo3b2o31b$13bo2bobo91bobo3b2o31b$12bo3b3obo88bo6b2o31b$12b3o4b2o89b2o37b$18bobo90bo3bobobo29b$19bo84b2o9bo3bo29b$7b2o8bob2o83bobo8bo3bo29b$7b2o9b2o45b2o38b3o9bo31b$43b2o20b3o38b2o41b$39b2o2b2o2b2o10b2o2bo2bobo34b2o44b$39b2o2bo2bobo10b2o2b2o2b2o34b3o43b$5bo18b2o19b3o15b2o84b$3ob2o2b2o10b4o4b2o15b2o102b$4o4b2o10b3ob2o2b2o74b2o43b$4b2o19bo25bo52b2o43b$50bobo7b2o87b$49b2o9b2o87b$52b2o95b2$55b2o20bo71b$47b3o6bo8b2o8b3o71b$51b3obo9b2o7bo74b$46bo2bob3o20b2o73b2$47b3o57b2o40b$107b2o40b$92bo56b$93bo55b$91b3o12bob2o39b$106bobo40b$56b2o25b2o22bo41b$56bo2bo23b2o22b2o40b$95bo11b2o40b$56bo2bo37b3obo5b2o40b$55bo2bo39bob3o46b$55bobo37b3obo2bo46b$56bo37bo2bo3bo47b$68bobo25b2o51b$56b2o11b2o78b$56b2o4b2o5bo15b2o11bo50b$61bobo21bo10bobo50b$61bo24b3o8b2o50b$60b2o26bo60b2$107b2o40b$101b2o4b2o40b$101b2o46b2$106b2obo39b$107bobo39b$108bo40b$107b2o40b$107b2o40b$107b2o!");
gol.patternRegister("Gunstar 2", "75bo43b$73b3o43b$72bo46b$72b2o45b$77b2o40b$77bo41b$75bobo41b$44b2o29b2o42b$41bobo2bob2o69b$40b2o2bo4bo69b$45bo6b2o65b$46bo5bo66b2$77b2o40b$76bo2bo39b$76bo42b$76bo42b$76bobo40b$63b2o13b2o39b$64bo54b2$23b2o52b2o40b$23bo54bo13bo3bo22b$88b2o2b2o3bo21b$23bo2bo62bo7bo21b$22bo2bo43b3o21b4o22b$22bobo44bo49b$23bo44b3o48b2$23b2o94b$23bo95b9$17b2o100b$4bo8b2obo2bob2o86b2o8b$4b3o6bo4bo2bo5b2o18bo62bo8b$7bo9bo9bo9b3o6b2obo69b$2o4b2o8bo20bo2bo9bo68b$bo39bo5bo28b2o32bo8b$bobo34bo2bo6bob2o56bob2o7b$2b2o34b2o10bo24bo3bo28bo10b$38b2o34bo4bo28bo10b$36bob2o33bobobo30bo2bo7b$36b3o33bobobo32b2o8b$37bo32bo4bo43b$70bo3bo44b$107b2o10b$72b2o34bo10b8$106b2o11b$103b2o2bo11b$103bo2bo12b$104b3o12b$10bo108b$10b2o33bo73b$44bobo72b$43bo3bo71b$8bo33bo3bo72b$8b2o31bo3bo73b$40bo3bo22b3o49b$41bobo22bo48b2o2b$9bo32bo23bo3bo44bobob$7bob2o55bo2bobo45bob$7bo60bobo2bo37b2o4b2o$7bo61bo3bo26b2o9bo7b$7bo2bo14b2o3bo42bo22b2obo2bob2o6b3o4b$8b2o15b2ob2ob2o37b3o23bo4bo2bo9bo4b$25bo7bo66bo18b$24b2o6bo66bo19b$25b2o2b2o88b$25b2o3bo88b6$94b2o23b$94bo24b$41bo31bo45b$41b2o29b2o20bo2bo21b$93bo2bo22b$25bo3bo63bobo23b$21bo3b2o3bo63bo24b$21b2o7bo88b$26b4o10b2o52b2o23b$39bo2bo51bo24b$39bo35bo43b$39bo29bo4b2o43b$39bobo26b2o49b$41b2o24b2o50b$68b2o49b2$40bo78b$40b2o77b2$66bo52b$65b2o6b2o44b$70bobo2bob2o40b$69b2o2bo4bo40b$42b2o30bo44b$41bobo31bo43b$41bo77b$40b2o77b$45b2o72b$46bo72b$43b3o73b$43bo!");
gol.patternRegister("New Gun 1", "25b2o5b2o$25b2o5b2o12$27b2ob2o2b$26bo5bob2$25bo7bo$25bo2bobo2bo$25b3o3b3o5$17bo16b$2o15b2o15b$2o16b2o14b$13b2o2b2o15b4$13b2o2b2o15b$2o16b2o7b2o5b$2o15b2o8b2o5b$17bo!");
gol.patternRegister("New Gun 2", "23b2o24b2o$23b2o24b2o$41b2o8b$40bo2bo7b$41b2o8b2$36b3o12b$36bobo12b$9b2o25b3o12b$9b2o25b2o13b$8bo2bo23b3o13b$8bo2bob2o20bobo13b$8bo4b2o20b3o13b$10b2ob2o36b$31b2o18b$21b2o7bo2bo17b$21b2o8b2o18b$49b2o$49b2o2$4b2o18bo26b$2o4b4o10b2o2b2ob3o21b$2o2b2ob3o10b2o4b4o21b$4bo19b2o!");
gol.patternRegister("Period-20 glider gun", "25bo14bo$24bobo12bobob2o$23bo2bo2b2o7bo2bobobob2o$23bob2obobo8b3obobobo$22b2o4bo13b4obo2bo$24b2o2b2o9b3o5bobobo$24bo3b3o7bo4b2o2bobobo$21b2obo3b3o7b2o2bo3b2ob2o$22bob2o2b3o11b3o2bo$22bo5b3o12b2ob2o$23b3o2b2o15b2ob2o$25bo22bo2bo$29b2obo12bo2bob2o$29bo2bo7b2ob2o4bo$29bo2bo7bo4b3obo4bo6b2o$31b2o8bo6bo4bobo4bo2bo2bo4b2o$26b2o5b2o8bob3o4bo2bo4bobo3b3o2bobo2b2o$15b2o5b2obobo5bo7b5o6b4ob2obo2b3o3bobo2bo2bo$5b2o4bo2bo2bo3bobobobobobo8bobo14bobobobo2bo2bob2obobo$2o2bobo2b3o3bobo3bo3bo2b2o9b2obo11b3o3b2o4bo2bo4bob2o$o2bo2bobo3b3o2bob2ob4o4b2ob2o7b2o9bo6bo2bo3bo3b2obo$bobobo2bo2bo2bobobobo9bo4bo5b2o8b3o2bobo2b2o2bobobo4bo$2obo2bobo2b2obobo4bobo7bo6bobo10b2obobob2o2bobob2ob5o$3bob2ob2o2b2obo6bobo7bob2o3bo10bo4bo4b2o2bo3bo$3bo4bobo2bob2o3bobo26bo3b2obobobo3bo3bo2bo$4b5ob2obobo2bo6b2o15bo6bo3bo2b2obo2bob2o3b3o$9bo3bo2b2obobo3b2o13b2ob2o4bo4bo4bob2o$6bo2bo3bo3bobobobo2bo8bo6bo6bo3bo2b2obo2bob2o3b3o$6b3o3b2obo2bob2o4bo7b3o12bo3b2obobobo3bo3bo2bo$15b2obo3bobo2bo5b2ob2o12bo4bo4b2o2bo3bo$6b3o3b2obo2bob2o4bo7b3o14b2obobob2o2bobob2ob5o$6bo2bo3bo3bobobobo2bo8bo15b3o2bobo2b2o2bobobo4bo$9bo3bo2b2obobo3b2o26bo6bo2bo3bo3b2obo$4b5ob2obobo2bo6b2o27b3o3b2o4bo2bo4bob2o$3bo4bobo2bob2o3bobo34bobobobo2bo2bob2obobo$3bob2ob2o2b2obo6bobo8bo2bo15b4ob2obo2b3o3bobo2bo2bo$2obo2bobo2b2obobo4bobo7bo2b2o2bo13bo2bo4bobo3b3o2bobo2b2o$bobobo2bo2bo2bobobobo10bo2b2o2bo14bobo4bo2bo2bo4b2o$o2bo2bobo3b3o2bob2ob4o7b4o17bo6b2o$2o2bobo2b3o3bobo4bo2bo5bobo2bobo$5b2o4bo2bo2bo4bobo6b2o4b2o$15b2o6bo!");
gol.patternRegister("Period-50 glider gun", "32b2o6b2o60b2o6b2o$26bob2obobo6bobob2obo48bob2obobo6bobob2obo$26b2obobo10bobob2o48b2obobo10bobob2o$30b2o10b2o56b2o10b2o$31bo10bo58bo10bo$51b2o6b2o22b2o6b2o$33b2o4b2o10b2o6b2o22b2o6b2o10b2o4b2o$34bo4bo64bo4bo$30bo3bo4bo3bo56bo3bo4bo3bo$7b2o20bo4bo4bo4bo6b3o4b3o38bo4bo4bo4bo20b2o$6bo2bo19bo3bo2b2o2bo3bo8bo4bo40bo3bo2b2o2bo3bo19bo2bo$5bo4bo19bo3bob2obo3bo7b2o6b2o39bo3bob2obo3bo19bo4bo$4bo6bo21bo6bo62bo6bo21bo6bo$4bo6bo120bo6bo$5bo4bo122bo4bo$6bo2bo32b2o24b2o4b2o24b2o32bo2bo$7b2o4bo23bo4b2o24b2o4b2o24b2o7bo25b2o$13bo8bo14bo71bo8bo$2ob2o8bo8bo14bo46b2o4b2o17bo8bo20b2ob2o$o21bo21bo7b2o4b2o7bo14b2obo4bob2o24bo12bo11bo$b2o2bo3b3o3b3o15b3o3b5ob2o5b3o2b3o5b2ob5o9b2o8b2o11b3o3b3o15b2o7bo2b2o$2b3o13b3o3b3o17bo7b2o4b2o7bo14b2obo4bob2o20b3o3b3o8bo7b3o$2b3o8bo23bo46b2o4b2o17bo29b3o$b2o2bo7bo8bo14bo71bo8bo19bo2b2o$o12bo8bo14bo4b2o24b2o4b2o24b2o7bo8bo24bo$2ob2o17bo19b2o24b2o4b2o24b2o16bo20b2ob2o3$33bo6bo62bo6bo$30bo3bob2obo3bo15b3o38bo3bob2obo3bo$29bo3bo2b2o2bo3bo12b2o3bo36bo3bo2b2o2bo3bo$29bo4bo4bo4bo17bo36bo4bo4bo4bo$30bo3bo4bo3bo5b2o10b2o37bo3bo4bo3bo$34bo4bo10bo6bo2bo43bo4bo$33b2o4b2o6b3o8b3o22b2o6b2o10b2o4b2o$47bo20b2o13b2o6b2o$31bo10bo25bobo30bo10bo$30b2o10b2o8b2o16bo29b2o10b2o$26b2obobo10bobob2o4b2o16b2o24b2obobo10bobob2o$26bob2obobo6bobob2obo48bob2obobo6bobob2obo$32b2o6b2o60b2o6b2o2$54b2o$53bobo$53bo$52b2o!");
gol.patternRegister("Simkin glider gun", "2o5b2o$2o5b2o2$4b2o$4b2o5$22b2ob2o$21bo5bo$21bo6bo2b2o$21b3o3bo3b2o$26bo4$20b2o$20bo$21b3o$23bo!");
gol.patternRegister("True period 22 gun", "18b2o25b$19bo7bo17b$19bobo14b2o7b$20b2o12b2o2bo6b$24b3o7b2ob2o6b$24b2ob2o7b3o6b$24bo2b2o12b2o2b$25b2o14bobob$35bo7bob$43b2o2$2o23bo19b$bo21bobo19b$bobo13b3o4b2o19b$2b2o3bo8bo3bo24b$6bob2o6bo4bo23b$5bo4bo6b2obo9bo14b$6bo3bo8bo3b2o6bo13b$7b3o13bobo3b3o13b$25bo19b$25b2o!");
gol.patternRegister("A true period 24 glider gun", "23bo2bo$21b6o$17b2obo8bo$13b2obobobob8o2bo$11b3ob2o3bobo7b3o$10bo4b3o2bo3bo3b2o$11b3o3b2ob4obo3bob2o$12bobo3bo5bo4bo2bo4b2obo$10bo8bob2o2b2o2b2o5bob2obo$10b5ob4obo4b3o7bo4bo$15b2o4bo4bob3o2b2obob2ob2o$12b5ob3o4b2ob2o3bobobobobo$11bo5b2o4b2obob2o5bo5bo$12b5o6b2obo3bo3bobob2ob2o$2ob2o9b2o2bo5bobo4bo2b3obobo$bobobobob2o3b3obo6bo2bobo4b3o2bo$o2bo7bo6b2o3b3o8bobob2o$3o2bo4b2o11bo10bo$5b4obo17b2o4b2o$2b2obo6bo14bo3bo2b2o$bo4bo3bo16bo6b2o$b3obo4bo16bo3bo2bo$11bo2bo3bo9b2o4bobob2o$b3obo4bo8b2o3bo10b3o2bo$bo4bo3bo7bo6bo8b3obobo$2b2obo6bo10b3o8bobob2ob2o$5b4obo24bo5bo$3o2bo4b2o21bobobobobo$o2bo7bo9b2o10b2obob2ob2o$bobobobob2o10bo8bo5bo4bo$2ob2o17b3o6bo4bob2obo$24bo4b3o5b2obo!");
gol.patternRegister("Vacuum (gun)", "b2o23b2o21b$b2o23bo22b$24bobo22b$15b2o7b2o23b$2o13bobo31b$2o13bob2o30b$16b2o31b$16bo32b$44b2o3b$16bo27b2o3b$16b2o31b$2o13bob2o13bo3bo12b$2o13bobo13bo5bo7b2o2b$15b2o14bo13b2o2b$31b2o3bo12b$b2o30b3o13b$b2o46b$33b3o13b$31b2o3bo12b$31bo13b2o2b$31bo5bo7b2o2b$32bo3bo12b2$44b2o3b$44b2o3b5$37b2o10b$37bobo7b2o$39bo7b2o$37b3o9b$22bobo24b$21b3o25b$21b3o25b$21bo15b3o9b$25bobo11bo9b$21b2o4bo9bobo9b$16b2o4bo3b2o9b2o10b$15bobo6bo24b$15bo33b$14b2o!");
