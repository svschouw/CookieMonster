/**********
 * Golden *
 **********/

CM.Sim.Golden = {};

/**
 * boolean golden: true if normal, false if wrath
 * number cps: normal cookies per second
 * number cookies: current number of cookies in bank
 * integer mice: number of mouse upgrades
 * enum dur: duration factor: 1 = normal duration; 2 = double duration (Get Lucky)
 * number time: average number of seconds between cookies (7 at the beginning, 4.5 with Lucky Day; 2 with Serendipity)
 */
CM.Golden.GoldenCookieCps = function(golden, cps, cookies, mice, dur, time) {
	var result = {};
	result.raw = {};

	var chainDigit = golden ? 7 : 6;
	result.input = {golden: golden, cps: cps, cookies: cookies, mice: mice, dur: dur, time: time};
	result.raw.cps = cps;
	result.raw.cookies = cookies;
	result.raw.dur = dur;
	result.raw.time = time;
	result.raw.chainMoney = Math.min(cps * 3600 * 3, cookies / 4.0);
	result.raw.chainBase = CM.Cache.MaxChainMoni(chainDigit, result.raw.chainMoney);
	result.raw.clickFrenzyBase = 77700 * mice / 100.0 * cps * dur;
	result.raw.frenzyBase = 6 * 77 * cps * dur;
	result.raw.multiplyBase = Math.min(cookies*0.15, cps * 900);
	result.raw.ruinBase = -Math.min(cookies*0.05, cps * 600);
	result.raw.bloodFrenzyBase = 665 * 6 * cps * dur;
	result.raw.clotBase = -66 * cps/2.0 * dur;
	result.raw.superComboBase = Math.min(cookies*0.15, cps * 900 * 7);
	result.raw.doubleFrenzyBase = result.raw.clickFrenzyBase * 7;

	result.factor = {};
	if (golden) {
		result.factor.chain = 0.01 / 3 * result.raw.chainBase;
		result.factor.clickFrenzy = 0.05 / 3 * result.raw.clickFrenzyBase;
		result.factor.frenzy = 0.49 * result.raw.frenzyBase;
		result.factor.multiply = 0.49 * result.raw.multiplyBase;
		if (dur == 2 && time <= 150) {
			result.factor.superCombo = 0.49 * 0.6 * (result.raw.superComboBase - result.raw.multiplyBase);
			result.factor.doubleFrenzy = 0.05/3 * 0.49 * (result.raw.doubleFrenzyBase - result.raw.frenzyBase);
		}
	} else {
		result.factor.clickFrenzy = 0.011 * result.raw.clickFrenzyBase;
		result.factor.ruin = 0.29 * result.raw.ruinBase;
		result.factor.bloodFrenzy = 0.06 * result.raw.bloodFrenzyBase;
		result.factor.clot = 0.29 * result.raw.clotBase;
		result.factor.multiply = 0.29 * result.raw.multiplyBase;
		result.factor.chain = 0.06 * result.raw.chainBase;
	}
	var win = 0;
	for (factor in result.factor) {
		win += result.factor[factor];
	}
	result.win = win;
	result.cps = win / time;
	return result;
}

CM.Golden.CalcGoldenCpsRaw = function(params) {
	params = params || {};
	var golden = params.hasOwnProperty("golden") ? params.golden : Game.elderWrath == 0;
	var cookiesPs = 0;
	if (params.hasOwnProperty("cookiesPs"))
		cookiesPs = params.cookiesPs;
	else {
		cookiesPs = Game.cookiesPs;
		if (Game.frenzy > 0) {
			cookiesPs /= Game.frenzyPower;
		}
	}
	var cookies = params.hasOwnProperty("cookies") ? params.cookies : Game.cookies;
	var mice = 0;
	if (params.hasOwnProperty("mice"))
		mice = params.mice;
	else {
		if (Game.Has('Plastic mouse')) mice++;
		if (Game.Has('Iron mouse')) mice++;
		if (Game.Has('Titanium mouse')) mice++;
		if (Game.Has('Adamantium mouse')) mice++;
		if (Game.Has('Unobtainium mouse')) mice++;
		if (Game.Has('Eludium mouse')) mice++;
		if (Game.Has('Wishalloy mouse')) mice++;
		if (Game.Has('Fantasteel mouse')) mice++;
		if (Game.Has('Nevercrack mouse')) mice++;
		if (Game.Has('Cookie egg')) mice *= 1.1;
	}
	var dur = 0;
	if (params.hasOwnProperty("dur"))
		dur = params.dur;
	else
		dur = Game.Has("Get lucky") ? 2 : 1;
	var lucky = 0;
	if (params.hasOwnProperty("lucky"))
		lucky = params.lucky;
	else {
		lucky = 0;
		if (Game.Has("Lucky day")) lucky++;
		if (Game.Has("Serendipity")) lucky++;
	}	
	var time = [7, 4.5, 2][lucky] * 60;
	return CM.Golden.GoldenCookieCps(golden, cookiesPs, cookies, mice, dur, time);
}

CM.Golden.CalcGoldenCps = function(params) {
	params = params || {};
	return CM.Golden.CalcGoldenCpsRaw(params).cps;
}

eval('CM.Sim.Golden.CalcGoldenCpsRaw = ' + CM.Golden.CalcGoldenCpsRaw.toString().split('Game.Has').join('CM.Sim.Has').split('Game.cookies').join('CM.Sim.cookies'));

CM.Sim.Golden.CalcGoldenCps = function(params) {
	params = params || {};
	return CM.Sim.Golden.CalcGoldenCpsRaw(params).cps;
}
