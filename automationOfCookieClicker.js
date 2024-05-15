// ==UserScript==
// @name         Automation of cookie clicker
// @namespace    http://tampermonkey.net/
// @version      2024-03-20
// @author       Axel Ström Eckerlid
// @description  Automates various actions of the game "cookie clicker" such as clicking the cookie, buying items and upgrades, collecting golden cookies and more.
// @match        https://orteil.dashnet.org/cookieclicker/
// @grant        none
// ==/UserScript==


//Clicks the big cookie
setInterval(() => {
    document.getElementById("bigCookie").click()
}, 100);


/*
  Clicks golden cookies
  return: void
*/
function clickShimmer() {
    const goldenCookie = document.getElementsByClassName("shimmer");
    if (goldenCookie) {
        for(var i =0; i < goldenCookie.length; i++) {
            goldenCookie[i].click();
        }
    }
}


/*
  Decides the item with the highest value by dividing it's cookie/second rate by it's price. Also finds the highest value item of which it can afford.
  return: void
*/
function buyItems() {
    let highestVal = 0;
    let highestAffordableVal = 0;
    let highestValItem = null;
    let highestAffordableItem = null;
    for (const [_, obj] of Object.entries(window.Game.Objects)) {
        const currentValue = obj.storedCps / obj.price;
        const canAfford = window.Game.cookies >= obj.price;
        if (currentValue > highestVal) {
            highestVal = currentValue;
            highestValItem = obj;
        }
        if (canAfford && currentValue > highestAffordableVal) {
            highestAffordableVal = currentValue;
            highestAffordableItem = obj;
        }
    }
    optimalPurchase(highestValItem, highestAffordableItem); //Calls on the function optimalPurchase
}


/*
  Buys the item with the highest value if it can afford it, otherwise buys the highest value item of the ones it can afford IF it will make it take less
  time to save up for the highest value item.
  Arguments:
    - Object highestValItem
    - Object highestAffordableItem
  return: void
*/
function optimalPurchase(highestValItem, highestAffordableItem) {
    const currentCps = window.Game.cookiesPs;
    var highestValTime = (highestValItem.price - window.Game.cookies) / currentCps;
    var newTime = (highestValItem.price - (window.Game.cookies - highestAffordableItem.price)) / (currentCps + highestAffordableItem.Cps);
    if (highestValItem.price < window.Game.cookies) {
        highestValItem.buy();
    }
    else if (newTime < highestValTime) {
        highestAffordableItem.buy();
    }
}


/*
  Buys the least expensive upgrade from the store if it can afford it.
  return: void
*/
function buyUpgrades() {
    const upgrades = document.getElementsByClassName("crate upgrade enabled");
    for (let i = 0; i < upgrades.length; i++) {
        upgrades[i].click();
    }
}


/*
  Clicks fully grown sugarlumps.
  return: void
*/
function harvestSugarLump() {
    var age = Date.now()-window.Game.lumpT;
    if (age>window.Game.lumpRipeAge) {
        window.Game.clickLump();
    }
}


/*
  Casts spell to summon a golden cookie if there is sufficient magic and an active multiplier buff.
  return: void
*/
function castSpell() {
    var M = window.Game.ObjectsById[7].minigame;
    var goldCost = M.getSpellCost(M.spellsById[1]);
    if (M.magic > goldCost) {
        if ((window.Game.hasBuff("Frenzy") != 0) || (window.Game.hasBuff("frenzy") != 0) || (window.Game.hasBuff("click frenzy") != 0)) {
            M.castSpell(M.spellsById[1]);
        }
    }
}


/*
  Sells items if the buff "Click frenzy" is active to activate click multiplier.
  return: void
*/
function clickBonus() {
    var templeGame = window.Game.ObjectsById[6].minigame;
    var i = 1
    if ((templeGame.slotNames[0] == "Diamond") && (window.Game.hasBuff("Click frenzy"))) {
        while (i < 6) {
            var tower = window.Game.ObjectsById[i];
            if (tower.amount > 1) {
                tower.sell(1);
            }
            else {
                i = i + 1
            }
        }
    }

}



//Loop which calls on all of the functions.
setInterval(() => {
    clickBonus();
    clickShimmer();
    buyUpgrades();
    buyItems();
    castSpell();
    harvestSugarLump();
}, 1000);