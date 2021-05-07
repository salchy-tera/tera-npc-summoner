module.exports = function SalchySummonerMaster(script) {	
	///
	const path = require('path');
	const fs = require('fs');
	let config = {};
	let settingTimeout = null;	
	let npcId;
	let zoned = false;
	let type;
	let value;
	script.dispatch.addDefinition('C_REQUEST_CONTRACT', 50, path.join(__dirname, 'C_REQUEST_CONTRACT.50.def'));
	try { config = require('./config.json'); }
	catch (e) {
		config = {};
		settingUpdate();
	}

	function settingUpdate() {
		clearTimeout(settingTimeout);
		settingTimeout = setTimeout(settingSave,1000);
	}	
	function settingSave() {
		fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config, undefined, '\t'), err => {
		});
	}
	let hw_zone = 7031
	if (("hw_zone" in config)) {
		hw_zone = config.hw_zone;
	}
	if (!("hw_zone" in config)) {
		config.hw_zone = 7031;
		settingUpdate();
	}
	let merchant_template = 2019
	if (("merchant_template" in config)) {
		merchant_template = config.merchant_template;
	}
	if (!("merchant_template" in config)) {
		config.merchant_template = 2019;
		settingUpdate();
	}
	let merchant_id = 3518437209224331
	if (("merchant_id" in config)) {
		merchant_id = config.merchant_id;
	}
	if (!("merchant_id" in config)) {
		config.merchant_id = 3518437209224331;
		settingUpdate();
	}
	let vg_template = 2058
	if (("vg_template" in config)) {
		vg_template = config.vg_template;
	}
	if (!("vg_template" in config)) {
		config.vg_template = 2058;
		settingUpdate();
	}
	let vg_id = 3518437209189246
	if (("vg_id" in config)) {
		vg_id = config.vg_id;
	}
	if (!("vg_id" in config)) {
		config.vg_id = 3518437209189246;
		settingUpdate();
	}
	let sp_template = 2109
	if (("sp_template" in config)) {
		sp_template = config.sp_template;
	}
	if (!("sp_template" in config)) {
		config.sp_template = 2109;
		settingUpdate();
	}
	let sp_id = 3518437209205338
	if (("sp_id" in config)) {
		sp_id = config.sp_id;
	}
	if (!("sp_id" in config)) {
		config.sp_id = 3518437209205338;
		settingUpdate();
	}	
	
	let summons = [
		{
			"name": "bank",
			"type": 26,
			"npcId": 0,
			"value": 1
		},
		{
			"name": "merchant",
			"type": 9,
			"npcId": merchant_id,
			"value": 70310
		},		
		{
			"name": "vg",
			"type": 49,
			"npcId": vg_id,
			"value": 609
		},
		{
			"name": "sp",
			"type": 9,
			"npcId": sp_id,
			"value": 250
		},
		{
			"name": "broker",
		}
		
	]
	
    script.command.add("sum", (arg) => {
        if (arg && arg.length > 0) arg = arg.toLowerCase();
        if (arg) {
			const summon = getSum(arg);
            if (!summon) {
                script.command.message(`Invalid argument idiot`);
                return;
            }
			if(summon && summon.name!="broker") {
				let buffer = Buffer.alloc(4);
				buffer.writeUInt32LE(Number(summon.value));
				script.send("C_REQUEST_CONTRACT", 50, {
					ContractType: summon.type,
					NpcCreatureId: summon.npcId,
					ValueParam: Number(summon.value),
					ContractRequestee: "",
					Param: buffer
				});	
			} else {
				script.toClient('S_NPC_MENU_SELECT', 1, {type:28});
			}				

        } else {
            sumMenu();
        }
    });
	
    const gui = {
        parse(array, title, d = '') {
            for (let i = 0; i < array.length; i++) {
                if (d.length >= 16000) {
                    d += `Gui data limit exceeded, some values may be missing.`;
                    break;
                }
                if (array[i].command) d += `<a href="admincommand:/@${array[i].command}">${array[i].text}</a>`;
                else if (!array[i].command) d += `${array[i].text}`;
                else continue;
            }
            script.toClient('S_ANNOUNCE_UPDATE_NOTIFICATION', 1, {
                id: 0,
                title: title,
                body: d,
            });
        },
    };	

    function sumMenu() {
        if (Object.keys(summons).length > 0) {
            let list = [];
            summons.forEach((x) => {
                list.push({
                    text: `<font size="+20">* ${x.name} </font><br>`,
                    command: `sum ${x.name}`,
                });
            });
            gui.parse(list, `<font color="#E0B0FF">Summoner Menu</font>`);
            list = [];
        }
    }

    function getSum(arg) {
        return summons.find((e) => e.name.toLowerCase().includes(arg));
    }	

	script.hook('S_LOAD_TOPO', 3, packet => {

		if (packet.zone == hw_zone) {
			zoned = true;
		}
		else {
			zoned = false;
		}
	});
	script.hook('S_SPAWN_NPC', 12, (packet) => {	
		if (zoned == true) {
			switch (packet.templateId) {
			case merchant_template:
				merchant_id = packet.gameId;
				config.merchant_id = Number(merchant_id);
				summons[1].npcId = merchant_id
				settingUpdate();				
				console.log("Merchant NPC identified, config updated: ", merchant_id);
				break;
			case vg_template:
				vg_id = packet.gameId;
				config.vg_id = Number(vg_id);
				summons[2].npcId = vg_id
				settingUpdate();				
				console.log("Merchant NPC identified, config updated: ", merchant_id);				
				console.log("VG NPC identified: ", vg_id);
				break;	
			case sp_template:
				sp_id = packet.gameId;
				config.sp_id = Number(sp_id);
				summons[3].npcId = sp_id
				settingUpdate();				
				console.log("SP NPC identified, config updated: ", sp_id);
				break;				
			default:
				break;
			}
		}
	});			
	
}
