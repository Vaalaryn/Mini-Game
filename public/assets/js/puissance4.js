
let pion;
function addPion(elem) {
    elem.append(pion);
    if (pion === '<i class=" pionJaune fas fa-circle"></i>')
        pion = '<i class=" pionRouge fas fa-circle"></i>';
    else
        pion = '<i class=" pionJaune fas fa-circle"></i>';
}

function clickColumn(elem) {
    let column = elem.index();
    let taille = $('#grille tr').length;
    let flag = 0;
    console.log(column);

    for (let i = 0; i <= taille   ; i++)
    {
        if (flag !== 1)
        {
            if ($('#grille tr').eq(taille-i).find('td').eq(column).html() === '')
            {
                addPion($('#grille tr').eq(taille-i).find('td').eq(column));
                console.log('Pion ajouté');
                flag =1;
            }
            else
            {
                console.log('case pleine');
            }
        }

    }




}


function createGrid() {
    let table = $('<table></table>');
    table.attr('id', 'grille');

    for (let y = 0; y < 6; y++) {
        let ligne = $('<tr></tr>');
        for (let x = 0; x < 6; x++) {
            let cellule = $('<td></td>');
            cellule.click(function () {
                clickColumn($(this));
            });
            ligne.append(cellule);
        }
        table.append(ligne);
    }
    $('.grid').append(table);
}


function startPui4() {
    createGrid();

}
