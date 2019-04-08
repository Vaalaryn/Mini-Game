/* Constantes */
const FACILE = 1;
const NORMAL = 2;
const DIFFICILE = 3;

/* Variables globales */
let game = setDifficulty(FACILE); //Options de la partie


/* Tableaux globaux */
let cardList = ["jquery", "angular", "c", "cs", "java", "node", "react", "html", "css", "python", "php", "swift"];
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
        nbCartes: nbLignes * nbCols
    };

}

function sliceList() {
    let nbLogos = (game.nbLignes * game.nbCols) / 2;

    return cardList.slice(0, nbLogos);
}


function setClass(elem) {

}

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

function setCardClass(x, y) {
    let name;
    do {
         name = listeLogo[Math.floor(Math.random() * listeLogo.length)];
    }
    while (countOccurences(currentListeLogo,name) > 1);

    currentListeLogo.push(name);
    return name;
}


function unflipAllCard() {
    $('.unflip').attr('class','verso');
    $('td').css('pointer-events', 'auto');
}
function delCartes() {
    $('.unflip').attr('class','hide');
    $('td').css('pointer-events', 'auto');

}


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
function verifWin() {
    if (game.nbCartes === 0)
    {
        alert('Vous avez gagné !');
    }

}

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

            indexCardClass[y][x] = setCardClass(x, y);


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
$(function () {
    construireTable();
});
