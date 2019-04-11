/* Constantes */
const FACILE = 1;
const NORMAL = 2;
const DIFFICILE = 3;

/* Variables globales */
let game = setDifficulty(DIFFICILE); //Options de la partie
let chrono = {
    second : 0,
    minute : 0
}


/* Tableaux globaux */
let cardList = ["js", "angular", "c", "cs", "java", "node", "react", "html", "css", "python", "php", "swift"];
let listeLogo;
let indexCardClass = [];
let currentListeLogo = [];

/*Fonctions*/

function setDifficulty(difficulte) {
    let nbLignes = 0;
    let nbCols = 0;
    switch (difficulte) {
        case 1: {
            nbLignes = 3;
            nbCols = 4;
            break;
        }
        case 2: {
            nbLignes = 3;
            nbCols = 6;
            break;
        }
        case 3: {
            nbLignes = 3;
            nbCols = 8;
            break;
        }
    }
    return {
        difficulty: difficulte,
        nbLignes: nbLignes,
        nbCols: nbCols,
        nbCartes: nbLignes * nbCols,
        xp: 0,
        nbSecondes : 0
    };
}
function incChrono() {
    if (chrono.second === 60)
    {
        chrono.second = 0;
        chrono.minute += 1;
        game.nbSecondes += 1;
    }
    else
    {
        chrono.second += 1;
        game.nbSecondes += 1;
    }




    $('#chrono').text( chrono.minute + ' : ' + chrono.second );

}

/**
 * Coupe le tableau en longueur adapté à la difficulté
 * @returns {string[]}
 */
function sliceList() {
    let nbLogos = (game.nbLignes * game.nbCols) / 2;

    return cardList.slice(0, nbLogos);
}

/**
 * Retourne la carte cliquée
 * @param elem
 */
function flipCard(elem) {
    elem = $(elem);
    let x = elem.index();
    let y = elem.parent().index();

    if (elem.attr('class') === "verso") {
        elem.removeClass('verso');
        elem.addClass(indexCardClass[y][x]);
        elem.addClass('unflip');
    }
}

function setMenu(options) {
    $('.bar_menu').append('<em id="cartes">Cartes : '+ game.nbCartes +'</em>');
    $('.bar_menu').append('<em id="chrono">'+ chrono.minute + ' : ' + chrono.second +'</em>')
    $('.bar_menu').append('<em id="xp">xp : '+ game.xp +'</em>');
}

/**
 * Compte le nombre de chaine de caractère égale à search et retourne le nombre compté
 * @param tab
 * @param search
 * @returns {number}
 */
function countOccurences(tab,search) {
    let nb = 0;
    tab.forEach(function (elem) {
        if (elem === search)
        {
            nb++;
        }

    });

    return nb;
}

/**
 * Gère les classes d'affichage des cartes, et fait en sorte que les classes soient assignées par paire
 * @returns {*}
 */
function setCardClass() {
    let name;
    do {
        name = listeLogo[Math.floor(Math.random() * listeLogo.length)];
    }
    while (countOccurences(currentListeLogo,name) > 1);

    currentListeLogo.push(name);
    return name;
}

/**
 * Retourne toutes les cartes sur le verso
 */
function unflipAllCard() {
    $('.unflip').attr('class','verso');
    $('td').css('pointer-events', 'auto');
}

/**
 * Supprime les cartes trouvées
 */
function delCartes() {
    $('.unflip').attr('class','hide');
    $('td').css('pointer-events', 'auto');

    $('#cartes').text('Cartes : '+ game.nbCartes);

    if (game.nbSecondes < 30)
        game.xp += parseInt(5 * (game.difficulty/2));
    if (game.nbSecondes >= 30 && game.nbSecondes < 90  )
        game.xp += parseInt(2 * (game.difficulty/2));
    if (game.nbSecondes >= 90)
        game.xp += parseInt(1 * (game.difficulty/2));

    refreshXp();
}

function refreshXp() {
    $('#xp').text('xp : ' + game.xp);
}
/**
 * Vérifie qu'une paire a été trouvée
 * @param name
 */
function verifDouble(name) {
    let compt = 0;
    $('.unflip').each(function () {
        if ($(this).hasClass(name))
        {
            compt++;
        }


    });
    if (compt === 2){
        $('td').css('pointer-events', 'none');
        setTimeout(delCartes,500);
        game.nbCartes -= 2;
        setTimeout(verifWin,100);
    }
    if ( $('.verso').length === game.nbCartes - 2)
    {
        $('td').css('pointer-events', 'none');
        setTimeout(unflipAllCard,500);
    }
}

/**
 * Vérifie que la partie est gagnée
 */
function verifWin() {
    if (game.nbCartes === 0)
    {
        alert('Vous avez gagné !');
    }

}

/**
 * Construit la grille de carte
 */
function construireTable() {
    listeLogo = sliceList();
    let container = $('.pairGameContainer');
    let table = $('<table></table>');

    for (let y = 0; y < game.nbLignes; y++) {
        let ligne = $('<tr></tr>');
        indexCardClass[y] = [];
        for (let x = 0; x < game.nbCols; x++) {
            let gameCase = $('<td></td>');
            gameCase.addClass('verso');

            indexCardClass[y][x] = setCardClass();


            gameCase.bind('click',function f() {
                flipCard($(this));
                verifDouble(indexCardClass[y][x]);
            });
            ligne.append(gameCase);
        }
        table.append(ligne);
    }
    container.append(table);

}


/* -------------------------------------------------------------------------*/
/**
 * Appel de fonctions quand la page est chargée
 */
function startMemo() {
    construireTable();
    setMenu(game);
    setInterval(incChrono,1000,);
}
