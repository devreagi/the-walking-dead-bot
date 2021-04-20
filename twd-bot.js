const magenta = new Color('magenta');
const irBtn = "templates/btns/btn_ir.png";
const explorarBtn = "templates/btns/btn_explorar.png";
const mapaGlobalBtn = "templates/state/mapa-global.png";
const entrenarBtn = "templates/btns/btn_entrenar.png";
const ayudaBtn = "templates/btns/btn_ayuda.png";
const mejorarBtn = "templates/btns/btn_mejorar.png";
const mejorarBtnDos = "templates/btns/btn_mejorar_dos.png";
const faltaRecursoBtn = "templates/btns/btn_falta_recurso.png";


// Puntos resolution 720 x 1280
const pointAyuda = new Point(667, 979);
const pointMiniMapa = new Point(69, 1201);
const pointCampamentoUno = new Point(296, 138);//
const pointCampamentoDos = new Point(365, 138);//
const pointCampamentoTres = new Point(433, 138);//
const pointSalir = new Point(29, 67);//

var usarTrabajador = Config.getValue("usarTrabajador");
var toTest = {
    trabajadorBtn: {
        tmplt: "templates/btns/btn_trabajador_libre.png",
        score: 0.96
    },
    investigacionBtn: {
        tmplt: "templates/btns/btn_investigacion_libre.png",
        score: 0.96
    },
    entrenamientobtn: {
        tmplt: "templates/btns/btn_entrenamiento_libre.png",
        score: 0.96
    },
    tropasBtn: {
        tmplt: "templates/btns/btn_tropa_libre.png",
        score: 0.96
    },
    exploracionBtn: {
        tmplt: "templates/btns/btn_explorador_libre.png",
        score: 0.95
    }
}

/**
 * Verifica que exista un dispositivo conectado por ADB
 */
try {
    Android.connected()
    Helper.log("Dispositivo encontrado, intentando iniciar el bot...");
    main();
} catch (e) {
    Helper.log("Error al inciar el bot: " + e);
}

/**
 * Funcion principal
 */
function main() {
    Helper.log("Bienvenido a The Walking Dead Survivors Bot v1");
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
        const scrn = Android.takeScreenshot();
        const results = matchesAll(scrn);
        //ayuda al clan
        ayudarClan();
        //Explora mapa
        if (Config.getValue("explorarMapa") && typeof (results.exploracionBtn) == "object" && Object.keys(results.exploracionBtn).length > 0) {
            explorarMapa(results);
        } else {
            Helper.log("Uso de exploradores OFF/Exploradores ocupados");
        }
        //ayuda al clan
        ayudarClan();
        //entrena tropas
        if (Config.getValue("entrenarTropas") && typeof (results.entrenamientobtn) == "object" && Object.keys(results.entrenamientobtn).length > 0) {
            entrenartropas(results);
        } else {
            Helper.log("entrenar tropas OFF/Campamentos ocupados");
        }
        //ayuda al clan
        ayudarClan();
        // Mejorar edificios
        if (usarTrabajador && typeof (results.trabajadorBtn) == "object" && Object.keys(results.trabajadorBtn).length > 0) {
            usarTrabajadores(results);
        } else {
            Helper.log("usar trabajadores OFF/trabajadores ocupados");
        }
        Helper.log("Ninguna accion a realizar, intentando de nuevo");
        Android.sendTap(pointMiniMapa);
        Helper.msleep(500);
        Android.sendTap(pointMiniMapa);
    }
}

function explorarMapa(results) {
    Helper.log("Explorar mapa...");
    AndroidRandomTap(results.exploracionBtn[0]);
    Helper.sleep(1);
    botonIr();
    Helper.sleep(3);
    botonExplorar();
    Android.sendTap(pointMiniMapa);
    Helper.msleep(500);
}

function entrenartropas(results) {
    Helper.log("Entrenar tropas...");
    AndroidRandomTap(results.entrenamientobtn[0]);
    Helper.msleep(500);
    botonIr();
    Helper.msleep(500);//wait ms

    //Verifica campamento 1
    Android.sendTap(pointCampamentoUno)
    Helper.log("llendo al campamento uno...");
    if (botonEntrenar()) {
        Helper.log("Entrenamiento 1");
    } else {
        Android.sendTap(pointCampamentoDos)
        Helper.log("llendo al campamento dos...");
    }

    //Verifica campamento 2
    Android.sendTap(pointCampamentoDos)
    Helper.log("llendo al campamento dos...");
    if (botonEntrenar()) {
        Helper.log("Entrenamiento 2");
    } else {
        Android.sendTap(pointCampamentoTres)
        Helper.log("llendo al campamento tres...");
    }

    //Verifica campamento 3
    Android.sendTap(pointCampamentoTres)
    Helper.log("llendo al campamento tres...");
    if (botonEntrenar()) {
        Helper.log("Entrenamiento 3");
    } else {
        Android.sendTap(pointSalir)
        Helper.log("Entrenamiento terminado, saliendo...");

    }
    Helper.msleep(500);
}

function usarTrabajadores(results) {
    Helper.log("Usar Trabajador...");
    AndroidRandomTap(results.trabajadorBtn[0]);
    Helper.msleep(200);
    botonAyuda();
    Helper.msleep(200);
    botonIr();
    Helper.sleep(1);
    botonMejorarEdificio();
    Helper.msleep(200);
    if (!faltaRecurso()) {
        botonMejorar();
        Helper.log("Mejorando edificio...");
    } else {
        Android.sendTap(pointSalir);
        Helper.log("No se puede mejorar");
        usarTrabajador = false;
    }
    Helper.msleep(500);
}

function ayudarClan() {
    if (Android.sendTap(pointAyuda)) {
        Helper.log("Ayudando...");
    } else {
        Helper.log("Nadie a quien ayudar");
    }
}

function botonIr() {
    Helper.log("tomando screenshot");
    const scrnBtn = Android.takeScreenshot();
    const score = 0.98;
    const botonIr = matches(scrnBtn, irBtn, score);
    if (botonIr.length > 0) {
        Helper.log("Clic en boton IR...");
        AndroidRandomTap(botonIr[0]);
    } else {
        Helper.log("Exploradores ocupados");
    }
}

function botonEntrenar() {
    Helper.log("tomando screenshot");
    const scrnBtn = Android.takeScreenshot();
    const score = 0.99;
    const botonEntrenar = matches(scrnBtn, entrenarBtn, score);
    if (botonEntrenar.length > 0) {
        AndroidRandomTap(botonEntrenar[0]);
        Helper.log("Clic en boton Entrenar...");
    } else {
        Helper.log("Ya en entrenamiento");
    }
}

function botonExplorar() {
    Helper.log("tomando screenshot");
    const scrn = Android.takeScreenshot();
    const score = 0.96;
    const botonExplorar = matches(scrn, explorarBtn, score);
    if (botonExplorar.length > 0) {
        Helper.log("Clic en boton EXPLORAR...");
        AndroidRandomTap(botonExplorar[0]);
    } else {
        Helper.log("Mapa no ha cargado");
    }
}

function botonMejorar() {
    Helper.log("tomando screenshot");
    const scrn = Android.takeScreenshot();
    const score = 0.99;
    const botonMejorar = matches(scrn, mejorarBtn, score);
    if (botonMejorar.length > 0) {
        Helper.log("Clic en boton MEJORAR...");
        AndroidRandomTap(botonMejorar[0]);
    } else {
        Helper.log("No se puede mejorar");
    }
}

function botonMejorarEdificio() {
    Helper.log("tomando screenshot");
    const scrn = Android.takeScreenshot();
    const score = 0.99;
    const botonMejorarDos = matches(scrn, mejorarBtnDos, score);
    if (botonMejorarDos.length > 0) {
        Helper.log("Clic en boton MEJORAR EDIFICIO...");
        AndroidRandomTap(botonMejorarDos[0]);
    } else {
        Helper.log("No se encontró MEJORAR EDIFICIO");
    }
}

function botonAyuda() {
    Helper.log("tomando screenshot");
    const scrn = Android.takeScreenshot();
    const score = 0.99;
    const botonAyuda = matches(scrn, ayudaBtn, score);
    if (botonAyuda.length > 0) {
        for (var i = 0; i < botonAyuda.length; i++) {
            Helper.log("Clic en boton AYUDA...");
            AndroidRandomTap(botonAyuda[i]);
        }
    } else {
        Helper.log("No hay que pedir ayuda");
    }
}

function faltaRecurso() {
    Helper.log("tomando screenshot");
    const scrn = Android.takeScreenshot();
    const score = 0.99;
    const botonFaltaRecurso = matches(scrn, faltaRecursoBtn, score);
    if (botonFaltaRecurso.length > 0) {
        Helper.log("Faltan recursos");
        return true;
    } else {
        return false;
    }
}

function botonIrDistrito() {
    Helper.log("tomando screenshot");
    const scrn = Android.takeScreenshot();
    const score = 0.99;
    const botonMapaGlobal = matches(scrn, mapaGlobalBtn, score);
    if (botonMapaGlobal.length > 0) {
        Helper.log("llendo al distritoL...");
        AndroidRandomTap(botonMapaGlobal[0]);
        return false;
    } else {
        Helper.log("En mapa del distrito");
        return true;
    }
}

function matches(scrn, tmplt, score) {
    //get matches to determine state:
    Helper.log("Comparando screenshot actual con " + tmplt + " Min Score: " + score);
    const template = new Image(tmplt);
    const matches = Vision.findMatches(scrn, template, score);
    //Set results
    var allMatches = [];
    if (matches.length > 0) {
        allMatches = allMatches.concat(matches);
    }
    Helper.log(matches.length + " Resultados encontrados para: " + tmplt);
    Helper.log(allMatches.length + " Coincidencias para la búsqueda actual.");
    if (Config.getValue("prntMatches")) {
        scrnmatches = Vision.markMatches(scrn, allMatches, magenta, 4);
        scrnmatches.save("scrnmatches.png");
    }
    return matches;
}

function matchesAll(scrn) {
    var allmatches = [];
    const results = {};
    //run checks:
    Object.keys(toTest).forEach(function (key) {
        const vals = toTest[key];
        Helper.log("Comparing current screenshot with " + vals.tmplt + " Min Score: " + vals.score);
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
        Helper.log(Object.keys(vals).length + " Results found for " + key);
    });
    Helper.log(allmatches.length + " Matches for various checks found.");
    if (Config.getValue("prntMatches")) {
        scrnmatches = Vision.markMatches(scrn, allmatches, magenta, 4);
        scrnmatches.save("scrnmatches.png");
    }
    return results;
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