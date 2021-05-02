module.exports = function SalchySummonerMaster(script) {	
	const path = require('path');
	let config= reloadModule('./config.js');
	let hw_zone = config[0].hw_zone;
	let merchant_template = config[0].merchant_template;
	let npc_da = config[0].npc_da;
	let merchant_id = config[0].merchant_id;
	let npcId;
	let zoned = false;
	let type;
	let value;
	let vg_id = config[0].vg_id;
	let vg_template = config[0].vg_template;
	let sp_id = config[0].sp_id;
	let sp_template = config[0].sp_template;
	script.dispatch.addDefinition('C_REQUEST_CONTRACT', 50, path.join(__dirname, 'C_REQUEST_CONTRACT.50.def'));
	const summons = [
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
	

	script.command.add("sumrel", (arg1) => {
		config= reloadModule('./config.js');
		hw_zone = config[0].hw_zone;
		merchant_template = config[0].merchant_template;					
		npc_da = config[0].npc_da;					
		merchant_id = config[0].merchant_id;	
		vg_id = config[0].vg_id;
		vg_template = config[0].vg_template;	
		sp_id = config[0].sp_id;
		sp_template = config[0].sp_template;		
		script.command.message('Summon Script configuration reloaded');
	});	


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
				console.log("Merchant NPC identified: ", merchant_id);
				break;
			case vg_template:
				vg_id = packet.gameId;
				console.log("VG NPC identified: ", vg_id);
				break;	
			case sp_template:
				sp_id = packet.gameId;
				console.log("SP NPC identified: ", sp_id);
				break;				
			default:
				break;
			}
		}
	});		
	
	function reloadModule(mod_to_reload){
		delete require.cache[require.resolve(mod_to_reload)]
		console.log('Summon Script: Reloading ' + mod_to_reload + "...");
		return require(mod_to_reload)
	}	
	
}