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

let strengthModifiers = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

let enemies = JSON.parse(fs.readFileSync('enemies.json', 'utf8'));

let data = {};

const simulationIterations = 1000;

let penStrikes = false;

/**************** MAIN ****************/

// Run normal simulation
runSimulation();

data = {};
penStrikes = true;

// Run simulation with penetrating strikes
runSimulation();

/**************** FUNCTIONS ****************/

async function runSimulation() {
    for (let strMod of strengthModifiers) {
        for (let enemy of enemies) {

            // Set up data storage
            if (!data[enemy.name]) {
                data[enemy.name] = {};
            }
            let modKey = "atMod" + strMod;
            if (!data[enemy.name][modKey]) {
                data[enemy.name][modKey] = {};
            }

            // Run combat simulation once per iteration
            for (let i = 0; i < simulationIterations; i++) {
                // Since strength mods do not affect vibro weapons, they end up getting simulated more often
                runVibroSimulation(enemy);
                runBladeSimulation(enemy, strMod);
            }
        }
    }

    // Calculate the averages
    calculateAverages();

    // Calculate the weapon comparison
    calculateVibroStats();

    // Write to file
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

// Calculates and writes the comparison of vibro to long blade
function calculateVibroStats() {
    let vibroStats = {};
    for (let enemy in data) {

        // Build data arrays of vibro weapons and normal weapons
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

        // Do the comparison for this enemy
        for (let vibWep of vw) {

            // Calculate the actual comparison
            let bladeComparison = {};
            for (let modData of blades) {
                for (let weapon in modData) {
                    if (weapon == "name") continue;

                    // Base case is that it never beats the weapon
                    if (!bladeComparison[weapon]) {
                        bladeComparison[weapon] = "Never";
                    }

                    // If the weapon has a lower average hits to kill, mark the strength mod this occurs at
                    if (modData[weapon].averageHitsToKill < vibWep.averageHitsToKill) {
                        if (bladeComparison[weapon] == "Never") {
                            let mod = modData.name.split("atMod")[1];
                            bladeComparison[weapon] = `At str mod ${mod}`;
                        }

                        // If it's the first one (mod 0), the weapon always beats the vibro weapon
                        if (modData.name == "atMod0") {
                            bladeComparison[weapon] = "Always";
                        }
                    }
                }
            }

            // Ensure data exists
            if (!vibroStats[vibWep.name]) {
                vibroStats[vibWep.name] = {
                    against: {}
                }
            }

            // Write the data to the object
            vibroStats[vibWep.name]["against"][enemy] = {
                "Average Simulated Damage": vibWep.simulatedAverageDamage,
                "Average Hits to Kill": vibWep.averageHitsToKill,
                "Average Penetrations per Hit": vibWep.averagePenetrationsPerHit,
                "Average Failed Penetrations per Kill": vibWep.averageFailedPensPerKill,
                "Loses to weapon": bladeComparison,
            }
        }
    }

    // Write the data to file
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

// Calculates some statistical averages for each weapon
function calculateAverages() {
    for (let enemy in data) {
        for (let weapon in data[enemy]) {

            // The long blade case
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
            }
            // The vibro weapon case
            else {
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

// Runs a complete simulation for all weapons, strength mods and enemies
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

// Runs a single to-death simulation for all vibro weapons
function runVibroSimulation(enemy) {
    for (let vibroWeapon of vibroWeapons) {

        // Write average damage; just to compare to the theoretical to statistical to ensure correctness
        let avgDamage = vibroWeapon.damageBonus + vibroWeapon.dieAmount * dieAverage(vibroWeapon.damageDie);
        let hitsToKill = 0;
        let hp = enemy.hp;

        let totalDamage = 0;
        let totalPens = 0;
        let totalFailedPens = 0;

        // Run simulation until creature death, tracking total damage dealt, total penetrations and failed penetrations
        while (hp > 0) {
            // 20 on a d20 is a crit
            let isCrit = Random(1, 20) == 20;

            // Long blades get an additional +2 PV on crit on top of the normal +1 PV
            // Turn on penetration debug stats to see this to be true
            let critBonus = isCrit ? 3 : 0;

            // Vibro weapon penetration calculation is the enemy AV plus any PV bonuses
            let pens = RollDamagePenetrations(enemy.av, enemy.av + critBonus, enemy.av + critBonus);

            // Crits simply add 1 to the penetration count
            if (isCrit) {
                pens += 1;
            }

            // Penetrating strikes simply adds 1 to the penetration count
            if (penStrikes) {
                pens += 1;
            }

            // Roll damage
            let damage = vibroWeapon.damageBonus;
            for (let i = 0; i < vibroWeapon.dieAmount; i++) {
                damage += rollDie(vibroWeapon.damageDie);
            }

            // Apply damage affects
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

// Returns a random die result
function rollDie(die) {
    return Random(1, die);
}

// Returns the statistical average for a given die
function dieAverage(die) {
    return (die * 0.5) + 0.5;
}

// Recreation of the RollDamagePenetrations() function from Caves of Qud
function RollDamagePenetrations(TargetInclusive, Bonus, MaxBonus) {

    // Comments are my comments added
    // Source code is from XRL.Rules.Stat.RollDamagePenetrations()

    // num represents the number of penetrations
    num = 0;

    // num2 represents the number of successful penetrations from last attempt
    num2 = 3;

    // All 3 attempts must penetrate for a subsequent penetration attempt to occur
    while (num2 == 3) {
        num2 = 0;

        // Roll penetration 3 times
        for (i = 0; i < 3; i++) {

            // Roll -1 to 8
            num3 = Random(1, 10) - 2;
            num4 = 0;

            // If the roll was an 8, add 8 and roll again for however many 8's we roll
            while (num3 == 8) {
                num4 += 8;
                num3 = Random(1, 10) - 2;
            }

            // num4 holds our cumulative dice roll total
            num4 += num3;

            // num5 holds the dice roll + the minimum of the maximum penetration bonus vs the creatures actual penetration bonus
            num5 = num4 + ((Bonus > MaxBonus) ? MaxBonus : Bonus);

            // If our roll + bonus exceeds the enemy AV, it's a penetration
            if (num5 > TargetInclusive) {
                num2++;
            }
        }

        // If a single roll penetrated, that's a successful penetration. Add it to the return value
        if (num2 >= 1) {
            num++;
        }

        // Reduce our actual penetration bonus by 2
        // Note this is not our capped bonus
        Bonus -= 2;
    }

    // Return the number of penetrations
    return num;
}

// Recreation of the Random() function from Caves of Qud
function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}