const appPackage = "com.elex.twdsaw.gp";


/**
 * Verifica que exista un dispositivo conectado por ADB
 */
if (Android.connected()) {
    Helper.log("Dispositivo encontrado, intentando iniciar el bot...");
    try {
        mapaDistrito();
    } catch (e) {
        Helper.log("Error al inciar el bot: " + e);
    }
} else {
    Helper.log("Ningun dispositivo conectado!");
}

/**
 * Verifica si el juego esta instalado
 * y lo inicia
 */
function inicarJuego() {
    Helper.log("Verificando si el juego está instalado...");
    Helper.log("Intentando iniciar el juego...");
    try {
        Android.startApp(appPackage);
        Helper.log("Juego iniciado, por favor espere");
    } catch (e) {
        Helper.log("Error al inciar el juego: " + e);
    }
}

/**
 * Funcion principal
 */
function mapaDistrito() {
    Helper.log("Bienvenido a The Walking Dead Survivors Bot v1");
    inicarJuego();
    gameLoop();
}

/**
 * Ciclo del juego
 * @returns {number}
 */
function gameLoop() {
    const lastActionResult = true;
    while (true) {
        //Get Size:
        const size = Android.getSize();
        Helper.log(size);
        //Take Screenshot:
        const scrn = Android.takeScreenshot();
        //get matches to determine state:
        const results = matches(scrn);
        const state = detectState(results);
        Helper.log("Estado determinado: " + state);
        //act on detected state:
        if (stateAction(state, results)) {
            Helper.log("Ciclo actual finalizado!");
        } else {
            if (lastActionResult) {
                Helper.log("Se encontró un problema, intentando de nuevo!");
            } else {
                Helper.log("Se encontró un problema al realizar la acción!");
                return 1;
            }
        }
    }
}

/**
 * Encuientra coincidencias
 * @param scrn
 * @returns {{}}
 */
function matches(scrn) {
    //Copy scrn:
    /*if(Config.getValue("prntMatches")) {
        scrn.save("scrnmatches.png");
        var scrnmatches = new Image
        scrnmatches.load("scrnmatches.png");
    }*/
    //test:
    const toTest = {
        //states
        mapaDistrito: {
            tmplt: "templates/state/mapaDistrito.png",
            score: 0.99
        },
        booting: {
            tmplt: "templates/state/loadScreen.png",
            score: 0.99
        },
        //buttons
        dailyEvent: {
            tmplt: "templates/btns/btn_closeEvent.png",
            score: 0.99
        },
        eventCloseBtn: {
            tmplt: "templates/btns/btn_closeEvent.png",
            score: 0.99
        }
    };
    const allmatches = [];
    const results = {};
    //run checks:
    Object.keys(toTest).forEach(function (key) {
        const vals = toTest[key];
        Helper.log("Comparando screenshot actual con " + vals.tmplt + " Min Score: " + vals.score);
        //Try to find matches
        const template = new Image(vals.tmplt);
        const matches = Vision.findMatches(scrn, template, vals.score);
        //Set results
        if (matches.length > 0) {
            allmatches = allmatches.concat(matches);
            results[key] = matches;
        }
    });
    Object.keys(results).forEach(function (key) {
        const vals = results[key];
        Helper.log(Object.keys(vals).length + " Resultados encontrados para: " + key);
    });
    Helper.log(allmatches.length + " Coincidencias para varios checks found.");
    if (Config.getValue("prntMatches")) {
        scrnmatches = Vision.markMatches(scrn, allmatches, magenta, 4);
        scrnmatches.save("scrnmatches.png");
    }
    return results;
}

/**
 * Detecta el estado del juego
 * @param results
 * @returns {string}
 */
function detectState(results) {
    const resultKeys = Object.keys(results);
    Helper.log("Intentando determinar el estado para los siguientes: " + resultKeys);
    //check if game is still booting:
    if (typeof (results.booting) == "object" && Object.keys(results.booting).length > 0) {
        Helper.log("Detectado: El juego está cargando!");
        return "booting";
    }
    //Check overlays
    if (typeof (results.dailyEvent) == "object" && Object.keys(results.dailyEvent).length > 0) {
        Helper.log("Detectado: Evento Diario!");
        return "dailyEvent";
    }
    if (typeof (results.bossSelection) == "object" && Object.keys(results.bossSelection).length > 0) {
        Helper.log("Detectado: Boss Selection Screen");
        if (typeof (results.confirmBossBattleBtn) == "object" && Object.keys(results.confirmBossBattleBtn).length > 0) {
            return "bossBattleConfirmation";
        }
        return "bossSelection";
    }
    if ((typeof (results.bossLootScreen) == "object" && Object.keys(results.bossLootScreen).length > 0) ||
        (typeof (results.bossLootSellMatBtn) == "object" && Object.keys(results.bossLootSellMatBtn) > 0) ||
        (typeof (results.bossLootSellMoneyBtn) == "object" && Object.keys(results.bossLootSellMoneyBtn) > 0) ||
        (typeof (results.bossLootGetBtn) == "object" && Object.keys(results.bossLootGetBtn) > 0)) {
        Helper.log("Detectado: Boss Loot Screen");
        return "bossLootScreen";
    }
    if (typeof (results.bossTreasure) == "object" && Object.keys(results.bossTreasure).length > 0) {
        Helper.log("Detectado: Boss Treasure screen. nothing to do here but wait.");
        return "bossTreasureScreen";
    }
    //check if main screen:
    if (typeof (results.mapaDistrito) == "object" && Object.keys(results.mapaDistrito).length > 0) {
        Helper.log("Detectado: Mapa del distrito");
        return "mapaDistrito";
    }
    return "unknown";
}

/**
 * Actua de acuerdo al estado y el resultado
 * @param state
 * @param results
 * @returns {boolean|*}
 */
function stateAction(state, results) {
    if (state == "unknown") {
        Helper.log("El juego tiene un estado",state,"esperando otro ciclo.");
        return true;
    }
    if (state == "booting") {
        Helper.log("Game is still booting, waiting!");
        return true;
    }
    if (state == "dailyEvent") {
        //check if closebtn was detected
        if (typeof (results.eventCloseBtn) == "object" && Object.keys(results.eventCloseBtn).length > 0) {
            //Click the closebtn:
            return AndroidRandomTap(results.eventCloseBtn[0]);
        }
        return false;
    }
    if (state == "bossSelection") {
        if (Config.getValue("farmDragon")) {
            //start specified dragon:
            var drgn = Config.getValue("dragon");
            switch (drgn) {
                case "green":
                    AndroidRandomTap(results.greenDragonBtn[0]);
                    break;
                case "black":
                    AndroidRandomTap(results.blackDragonBtn[0]);
                    break;
                case "red":
                    AndroidRandomTap(results.redDragonBtn[0]);
                    break;
                case "sin":
                    AndroidRandomTap(results.sinDragonBtn[0]);
                    break;
                case "legendary":
                    AndroidRandomTap(results.legendaryDragonBtn[0]);
                    break;
                case "bone":
                    AndroidRandomTap(results.boneDragonBtn[0]);
                    break;
                default:
                    AndroidRandomTap(results.greenDragonBtn[0]);
                    break;
            }
            return true;
        } else {
            //close boss screen:
            Helper.log("Boss Selection screen detected, farming is not activated, closing.");
            return AndroidBottomRightTap(results.bossSelection[0]);
        }
    }
    if (state == "bossBattleConfirmation") {
        if (Config.getValue("farmDragon")) {
            //start specified dragon:
            return AndroidRandomTap(results.confirmBossBattleBtn[0]);
        }
        Helper.log("Boss Selection screen detected, boss farming is not activated! Closing boss Selection screen...");
        return AndroidBottomRightTap(results.bossSelection[0]);
    }
    if (state == "bossTreasureScreen") {
        Helper.log("Waiting for Treasure screen to go.");
        Helper.sleep(2);
        return true;
    }
    if (state == "bossLootScreen") {
        //get what to do with the loot:
        var wtd = Config.getValue("sellLoot");
        switch (wtd) {
            case "money":
                Helper.log("selling loot for money.");
                AndroidRandomTap(results.bossLootSellMoneyBtn[0]);
                Helper.sleep(1);
                AndroidRandomTap(results.bossLootSellMoneyBtn[0]);
                break;
            case "mat":
                Helper.log("selling loot for mats.");
                AndroidRandomTap(results.bossLootSellMatBtn[0]);
                Helper.sleep(1);
                AndroidRandomTap(results.bossLootSellMatBtn[0]);
                break;
            case "inventory":
            default:
                Helper.log("getting loot in inventory.");
                AndroidRandomTap(results.bossLootGetBtn[0]);
                Helper.sleep(1);
                AndroidRandomTap(results.bossLootGetBtn[0]);
                break;
        }
        return true;
    }
    if (state == "mapaDistrito") {
        if (Config.getValue("farmDragon")) {
            //try to start bossfight:
            if (typeof (results.dragonStatueBtn) == "object" && Object.keys(results.dragonStatueBtn).length > 0) {
                //dragonstatue button was detected, tap.
                return AndroidRandomTap(results.dragonStatueBtn[0]);
            }
        } else {
            Helper.log("Bot has nothing to do! stopping");
            return false;
        }
        return false;
    }
    return false;
}


function AndroidRandomTap(match) {
    if (Android.sendTap(match.getRect().randomPoint())) {
        return true;
    }
    return false;
}

function AndroidBottomRightTap(match) {
    if (Android.sendTap(match.getRect().getBottomRight())) {
        return true;
    }
    return false;
}