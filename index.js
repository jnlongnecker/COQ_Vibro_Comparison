const fs = require('node:fs');

let vibroWeapons = [
    {
        damageDie: 10,
        dieAmount: 1,
        damageBonus: 0,
        name: "Vibro Blade"
    },
    {
        damageDie: 4,
        dieAmount: 1,
        damageBonus: 0,
        name: "Vibro Dagger"
    },
    {
        damageDie: 10,
        dieAmount: 1,
        damageBonus: 2,
        name: "Ceremonial Vibrokhopesh"
    }
];

let blades = [
    {
        damageDie: 3,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 5,
        penBonus: 0,
        name: "Bronze Long Sword",
    },
    {
        damageDie: 6,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 6,
        penBonus: 1,
        name: "Bronze Two-handed Sword",
    },
    {
        damageDie: 4,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 6,
        penBonus: 0,
        name: "Iron Long Sword",
    },
    {
        damageDie: 8,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 7,
        penBonus: 1,
        name: "Iron Two-handed Sword",
    },
    {
        damageDie: 6,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 7,
        penBonus: 0,
        name: "Steel Long Sword",
    },
    {
        damageDie: 10,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 8,
        penBonus: 1,
        name: "Two-handed Steel Long Sword",
    },
    {
        damageDie: 8,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 8,
        penBonus: 0,
        name: "Carbide Long Sword",
    },
    {
        damageDie: 12,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 9,
        penBonus: 1,
        name: "Two-handed Carbide Long Sword",
    },
    {
        damageDie: 10,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 9,
        penBonus: 0,
        name: "Folded Carbide Long Sword",
    },
    {
        damageDie: 6,
        dieAmount: 2,
        damageBonus: 0,
        penCap: 10,
        penBonus: 1,
        name: "Two-handed Folded Carbide Long Sword",
    },
    {
        damageDie: 12,
        dieAmount: 1,
        damageBonus: 0,
        penCap: 10,
        penBonus: 0,
        name: "Fullerite Long Sword",
    },
    {
        damageDie: 6,
        dieAmount: 2,
        damageBonus: 1,
        penCap: 11,
        penBonus: 1,
        name: "Two-handed Fullerite Long Sword",
    },
    {
        damageDie: 6,
        dieAmount: 2,
        damageBonus: 0,
        penCap: 11,
        penBonus: 0,
        name: "Crysteel Long Sword",
    },
    {
        damageDie: 8,
        dieAmount: 2,
        damageBonus: 0,
        penCap: 12,
        penBonus: 1,
        name: "Crysteel Great Sword",
    },
    {
        damageDie: 6,
        dieAmount: 2,
        damageBonus: 1,
        penCap: 12,
        penBonus: 0,
        name: "Flawless Crysteel Long Sword",
    },
    {
        damageDie: 10,
        dieAmount: 2,
        damageBonus: 0,
        penCap: 13,
        penBonus: 1,
        name: "Flawless Crysteel Great Sword",
    },
    {
        damageDie: 8,
        dieAmount: 2,
        damageBonus: 0,
        penCap: 13,
        penBonus: 0,
        name: "Zetachrome Long Sword",
    },
    {
        damageDie: 12,
        dieAmount: 2,
        damageBonus: 0,
        penCap: 14,
        penBonus: 1,
        name: "Two-handed Zetachrome Long Sword",
    }
];

let strengthModifiers = [0, 2, 5, 7, 10, 12, 15];

let enemies = JSON.parse(fs.readFileSync('enemies.json', 'utf8'));

let data = {};

const simulationIterations = 1000;

let penStrikes = false;

/**************** MAIN ****************/

runSimulation();
data = {};
penStrikes = true;
runSimulation();

/**************** FUNCTIONS ****************/

async function runSimulation() {
    for (let strMod of strengthModifiers) {
        for (let enemy of enemies) {

            if (!data[enemy.name]) {
                data[enemy.name] = {};
            }

            let modKey = "atMod" + strMod;
            if (!data[enemy.name][modKey]) {
                data[enemy.name][modKey] = {};
            }
            for (let i = 0; i < simulationIterations; i++) {
                runVibroSimulation(enemy);
                runBladeSimulation(enemy, strMod);
            }
        }
    }

    calculateAverages();
    calculateVibroStats();

    if (penStrikes) {
        fs.writeFile('data_ps.json', JSON.stringify(data, null, 4), err => {
            if (err) {
                console.error(err);
            }
        });
    } else {
        fs.writeFile('data.json', JSON.stringify(data, null, 4), err => {
            if (err) {
                console.error(err);
            }
        });
    }
}

function calculateVibroStats() {
    let vibroStats = {};
    for (let enemy in data) {
        let vw = [];
        let blades = [];
        for (let weapon in data[enemy]) {
            if (weapon.includes("atMod")) {
                let newData = data[enemy][weapon];
                newData.name = weapon;
                blades.push(newData);
            } else {
                let newData = data[enemy][weapon];
                newData.name = weapon;
                vw.push(newData);
            }
        }
        for (let vibWep of vw) {
            let bladeComparison = {};
            for (let modData of blades) {
                for (let weapon in modData) {
                    if (weapon == "name") continue;
                    if (!bladeComparison[weapon]) {
                        bladeComparison[weapon] = "Never";
                    }
                    if (modData[weapon].averageHitsToKill < vibWep.averageHitsToKill) {
                        if (bladeComparison[weapon] == "Never") {
                            let mod = modData.name.split("atMod")[1];
                            bladeComparison[weapon] = `At str mod ${mod}`;
                        }
                        if (modData.name == "atMod0") {
                            bladeComparison[weapon] = "Always";
                        }
                    }
                }
            }
            if (!vibroStats[vibWep.name]) {
                vibroStats[vibWep.name] = {
                    against: {}
                }
            }
            vibroStats[vibWep.name]["against"][enemy] = {
                "Average Simulated Damage": vibWep.simulatedAverageDamage,
                "Average Hits to Kill": vibWep.averageHitsToKill,
                "Average Penetrations per Hit": vibWep.averagePenetrationsPerHit,
                "Average Failed Penetrations per Kill": vibWep.averageFailedPensPerKill,
                "Loses to weapon": bladeComparison,
            }
        }
    }
    if (penStrikes) {
        fs.writeFile('weapon_comparisons_with_ps.json', JSON.stringify(vibroStats, null, 4), err => {
            if (err) {
                console.error(err);
            }
        });
    } else {
        fs.writeFile('weapon_comparisons.json', JSON.stringify(vibroStats, null, 4), err => {
            if (err) {
                console.error(err);
            }
        });
    }
}

function calculateAverages() {
    for (let enemy in data) {
        for (let weapon in data[enemy]) {
            if (weapon.includes("atMod")) {
                for (let enemyData in data[enemy][weapon]) {
                    let simulationsRun = data[enemy][weapon][enemyData].totalSimulationsRun;
                    let totalDamage = data[enemy][weapon][enemyData].totalSimulatedDamage;
                    let totalPens = data[enemy][weapon][enemyData].totalSimulatedPenetrations;
                    let totalHits = data[enemy][weapon][enemyData].totalSimulatedHitsToKill;
                    let totalFailed = data[enemy][weapon][enemyData].totalFailedPens;

                    data[enemy][weapon][enemyData]["simulatedAverageDamage"] = totalDamage / totalPens;
                    data[enemy][weapon][enemyData]["averageDamagePerHit"] = totalDamage / totalHits;
                    data[enemy][weapon][enemyData]["averageHitsToKill"] = totalHits / simulationsRun;
                    data[enemy][weapon][enemyData]["averagePenetrationsPerHit"] = totalPens / totalHits;
                    data[enemy][weapon][enemyData]["averageFailedPensPerKill"] = totalFailed / simulationsRun;
                }
            } else {
                let simulationsRun = data[enemy][weapon].totalSimulationsRun;
                let totalDamage = data[enemy][weapon].totalSimulatedDamage;
                let totalPens = data[enemy][weapon].totalSimulatedPenetrations;
                let totalHits = data[enemy][weapon].totalSimulatedHitsToKill;
                let totalFailed = data[enemy][weapon].totalFailedPens;

                data[enemy][weapon]["simulatedAverageDamage"] = totalDamage / totalPens;
                data[enemy][weapon]["averageDamagePerHit"] = totalDamage / totalHits;
                data[enemy][weapon]["averageHitsToKill"] = totalHits / simulationsRun;
                data[enemy][weapon]["averagePenetrationsPerHit"] = totalPens / totalHits;
                data[enemy][weapon]["averageFailedPensPerKill"] = totalFailed / simulationsRun;
            }
        }
    }
}

function runBladeSimulation(enemy, strMod) {
    for (let weapon of blades) {

        // Run kill simulation on this enemy for this weapon
        let avgDamage = weapon.damageBonus + weapon.dieAmount * dieAverage(weapon.damageDie);
        let hitsToKill = 0;
        let hp = enemy.hp;

        let totalDamage = 0;
        let totalPens = 0;
        let totalFailedPens = 0;
        while (hp > 0 && hitsToKill < 1000) {
            let isCrit = Random(1, 20) == 20;

            // Long blades get an additional +2 PV on crit on top of the normal +1 PV
            let critBonus = isCrit ? 3 : 0;
            let pens = RollDamagePenetrations(enemy.av, strMod + weapon.penBonus + critBonus, weapon.penCap + critBonus);
            if (isCrit) {
                pens += 1;
            }
            if (penStrikes) {
                pens += 1;
            }
            let damage = weapon.damageBonus;
            for (let i = 0; i < weapon.dieAmount; i++) {
                damage += rollDie(weapon.damageDie);
            }
            hp -= damage * pens;
            totalDamage += damage * pens;
            totalPens += pens;
            if (pens == 0) {
                totalFailedPens++;
            }
            hitsToKill++;
        }

        let modKey = "atMod" + strMod;

        // Store the data from this simulation
        if (!data[enemy.name][modKey][weapon.name]) {
            data[enemy.name][modKey][weapon.name] = {
                averageDamage: avgDamage,
                totalSimulatedHitsToKill: 0,
                totalSimulatedDamage: 0,
                totalSimulatedPenetrations: 0,
                totalSimulationsRun: 0,
                totalFailedPens: 0,
                totalFailedKills: 0,
            }
        }
        data[enemy.name][modKey][weapon.name].totalSimulatedHitsToKill += hitsToKill;
        data[enemy.name][modKey][weapon.name].totalSimulatedDamage += totalDamage;
        data[enemy.name][modKey][weapon.name].totalSimulatedPenetrations += totalPens;
        data[enemy.name][modKey][weapon.name].totalFailedPens += totalFailedPens;
        data[enemy.name][modKey][weapon.name].totalSimulationsRun += 1;
        if (hitsToKill >= 10000) {
            data[enemy.name][modKey][weapon.name].totalFailedKills += 1;
        }
    }
}

function runVibroSimulation(enemy) {
    for (let vibroWeapon of vibroWeapons) {

        // Run kill simulation on this enemy for this weapon
        let avgDamage = vibroWeapon.damageBonus + vibroWeapon.dieAmount * dieAverage(vibroWeapon.damageDie);
        let hitsToKill = 0;
        let hp = enemy.hp;

        let totalDamage = 0;
        let totalPens = 0;
        let totalFailedPens = 0;
        while (hp > 0) {
            let isCrit = Random(1, 20) == 20;

            // Long blades get an additional +2 PV on crit on top of the normal +1 PV
            let critBonus = isCrit ? 3 : 0;
            let pens = RollDamagePenetrations(enemy.av, enemy.av + critBonus, enemy.av + critBonus);
            if (isCrit) {
                pens += 1;
            }
            if (penStrikes) {
                pens += 1;
            }
            let damage = vibroWeapon.damageBonus;
            for (let i = 0; i < vibroWeapon.dieAmount; i++) {
                damage += rollDie(vibroWeapon.damageDie);
            }
            hp -= damage * pens;
            totalDamage += damage * pens;
            totalPens += pens;
            if (pens == 0) {
                totalFailedPens++;
            }
            hitsToKill++;
        }

        // Store the data from this simulation
        if (!data[enemy.name][vibroWeapon.name]) {
            data[enemy.name][vibroWeapon.name] = {
                averageDamage: avgDamage,
                totalSimulatedHitsToKill: 0,
                totalSimulatedDamage: 0,
                totalSimulatedPenetrations: 0,
                totalSimulationsRun: 0,
                totalFailedPens: 0,
            }
        }
        data[enemy.name][vibroWeapon.name].totalSimulatedHitsToKill += hitsToKill;
        data[enemy.name][vibroWeapon.name].totalSimulatedDamage += totalDamage;
        data[enemy.name][vibroWeapon.name].totalSimulatedPenetrations += totalPens;
        data[enemy.name][vibroWeapon.name].totalFailedPens += totalFailedPens;
        data[enemy.name][vibroWeapon.name].totalSimulationsRun += 1;
    }
}

function rollDie(die) {
    return Random(1, die);
}

function dieAverage(die) {
    return (die * 0.5) + 0.5;
}

function RollDamagePenetrations(TargetInclusive, Bonus, MaxBonus) {
    num = 0;
    num2 = 3;
    while (num2 == 3) {
        num2 = 0;
        for (i = 0; i < 3; i++) {
            num3 = Random(1, 10) - 2;
            num4 = 0;
            while (num3 == 8) {
                num4 += 8;
                num3 = Random(1, 10) - 2;
            }
            num4 += num3;
            num5 = num4 + ((Bonus > MaxBonus) ? MaxBonus : Bonus);
            if (num5 > TargetInclusive) {
                num2++;
            }
        }
        if (num2 >= 1) {
            num++;
        }
        Bonus -= 2;
    }
    return num;
}

function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}