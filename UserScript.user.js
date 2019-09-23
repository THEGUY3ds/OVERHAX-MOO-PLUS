// ==UserScript==
// @name         OVERHAX MOO PLUS
// @namespace    Overhax.ml
// @namespace    https://github.com/THEGUY3ds/OVERHAX-MOO-PLUS/raw/master/UserScript.user.js
// @version      1.1
// @description  Advanced moomoo hack
// @author       OVERHAX | THEGUY3ds
// @match        *://moomoo.io/*
// @match        *://45.77.0.81/*
// @match        *://dev.moomoo.io/*
// @match        *://sandbox.moomoo.io/*
// @downloadURL  https://github.com/THEGUY3ds/OVERHAX-MOO-PLUS/raw/master/UserScript.user.js
// @require      http://code.jquery.com/jquery-1.12.4.min.js
// @grant        none
// @connect      moomoo.io
// @icon         https://www.google.com/s2/favicons?domain=moomoo.io
// ==/UserScript==
// Alert Messege
alert('OVERHAX MOO PLUS Injected');
// Change page title
document.title = "OVERHAX MOO PLUS";
// Custom game cursor
$("#gameCanvas").css('cursor', 'url(http://cur.cursors-4u.net/user/use-1/use153.cur), default');
// Mini map hack
	$('#mapDisplay').css({
		'background': 'url("http://wormax.org/chrome3kafa/moomooio-background.png")'
	});
// Chat cycler press home
var _msgs = ["Press ESC to", "toggle cycling", "and HOME to", "set messages!"];
var msgs = _msgs;
var msgCycleSwitch = false;
var shift = false;
var esc = false;
var home = false;
var chat;
var msgNum = 0;

var socket = null;

var scriptSetup = false;

WebSocket = class extends WebSocket {
    constructor(...arg) {
        super(...arg);
        if (!scriptSetup){
            scriptSetup = true;
            styleInit();
            ren_overlay();
            window.onbeforeunload = function (){
                return 'Are you sure you want to leave?';
            };
        }
        socket = this;
    }
};

if (storageAvailable('localStorage')){
   if (!localStorage.getItem("msgs")){
       localStorage.setItem("msgs", JSON.stringify(msgs));
   }else{
       let temp;
       try{
           temp = JSON.parse(localStorage.getItem("msgs"));
       }
       catch (e){
           alert("Invalid Array! Setting default...");
           saveData();
           temp = "";
       }
       if (temp !== ""){
           msgs = temp;
       }
   }
}

const overlay = {};
overlay.keyCode = 36;
overlay.toggle = false;
overlay.inputString = msgs.join("\n");
overlay.tempMsgs = _msgs;

function styleInit() {
    addGlobalStyle(`#chatCyclerUI{padding: 0.2em; margin:0.2em; position: absolute;top: 0;left: 0;width: 30%;
    background-color: rgba(0,200,200,0.75);display:none;}`);
    addGlobalStyle(".table{ display: table; text-align: center; width: 100%; height: 80%;}");
    addGlobalStyle(".row{ display: table-row; }");
    addGlobalStyle(`.cell{ display: table-cell; padding: 0px 0.3em;border: 1px solid black;}`);
    addGlobalStyle(`.backRed{background-color:#f14e54}`);
    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) {
            return;
        }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
}

function toggleOverlay(tf){
    if (tf){
        document.querySelector('#chatCyclerUI').style.display = "block";
    }else{
        document.querySelector('#chatCyclerUI').style.display = "none";
    }
};

function ren_overlay(){
    const title = `<div style="font-size:32px">Chat Cycle Menu</div>`;
    const descr = `<div>Press HOME to toggle this menu.</div>`;
    const body = `
            <div class="table">
                <div class="row">Message Cycle Settings
                </div>
                <div class="row">
                    <div class="cell" style="vertical-align:middle">Messages</div>
                    <div class="cell" style="vertical-align:middle"><textarea name="overlay_messages" rows=4 cols=32 style="resize:none"></textarea></div>
                </div>
                <div class="row">
                    <div class="cell" style="vertical-align:middle">Update Message Cycle</div>
                    <div class="cell" style="vertical-align:middle"><input type="button" name="overlay_update_cycle" value="Update"></div>
                </div>
                <br>
                <div class="row">Message Cycle Toggle
                </div>
                <div class="row">
                    <div class="cell" style="vertical-align:middle">Toggle<br><span class="overlay_cycle_toggle_value"><span style="font-size:24px;color:#FF0000";>off</span></span></div>
                    <div class="cell" style="vertical-align:middle"><input type="button" name="overlay_cycle_toggle" value="Toggle"></div>
                </div>
            </div>`;
    const footer = `<div style="font-size:24px;color:red">Made by Mega_Mewthree</div>`;
    const temp = `${title} ${body} ${descr} ${footer}`;
    const d = document.createElement("div");
    d.id = "chatCyclerUI";
    d.innerHTML = temp;
    d.style.zIndex = 999999;
    document.body.appendChild(d);
    const val = document.querySelector('textarea[name="overlay_messages"]');
    val.value = overlay.inputString;
    val.addEventListener('input', function(e) {
        overlay.inputString = e.target.value;
    });
    document.querySelector('input[name="overlay_update_cycle"]').addEventListener('click', function() {
        if (!overlay.inputString){
            overlay.tempMsgs = _msgs;
        }else{
            overlay.tempMsgs = overlay.inputString.split(/\r?\n/);
        }
        msgNum = 0;
        msgs = overlay.tempMsgs;
        saveData();
    });
    document.querySelector('input[name="overlay_cycle_toggle"]').addEventListener('click', function(e) {
        msgCycleSwitch = !msgCycleSwitch;
        if (msgCycleSwitch){
            chat = setInterval(autoChat, 2000);
            document.querySelector('.overlay_cycle_toggle_value').innerHTML = `<span style="font-size:24px;color:#00FF00";>on</span>`;
        }else{
            document.querySelector('.overlay_cycle_toggle_value').innerHTML = `<span style="font-size:24px;color:#FF0000";>off</span>`;
            clearInterval(chat);
            msgNum = 0;
        }
    });
}

function concatBuffers(buffer1, buffer2){
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

const four = Uint8Array.from([4]).buffer;

function autoChat(){
    socket && socket.send(msgpack.encode(["ch", [msgs[msgNum]]]));
    msgNum++;
    if (msgNum >= msgs.length) msgNum = 0;
}

function storageAvailable(type){
	try{
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e){
		return false;
	}
}

function saveData(){
    if (storageAvailable('localStorage')){
        localStorage.setItem("msgs", JSON.stringify(msgs));
    }
}

window.addEventListener('keydown', function (event){
    if (overlay.toggle) event.stopImmediatePropagation();
    if (!esc && event.keyCode === 27){ //ESC
        msgCycleSwitch = !msgCycleSwitch;
        if (msgCycleSwitch){
            chat = setInterval(autoChat, 2000);
        }else{
            clearInterval(chat);
            msgNum = 0;
        }
        esc = true;
    }
    if (!home && event.keyCode === overlay.keyCode){ //HOME
        overlay.toggle = !overlay.toggle;
        toggleOverlay(overlay.toggle);
        home = true;
    }
});

window.addEventListener('keypress', function (event){
    if (overlay.toggle) event.stopImmediatePropagation();
});

window.addEventListener('keyup', function (event){
    if (overlay.toggle) event.stopImmediatePropagation();
    if (event.keyCode == 27){
        esc = false;
    }else if (event.keyCode == 36){
        home = false;
    }
});
// Random Gold amount
var countr = 0;
var delay = 0;
var rand = Math.round(Math.random()*1500);

function reee(){
  if(1500+rand <= delay){
  countr += Math.max(1, Math.round(countr*1.01))
  document.getElementById("scoreDisplay").innerHTML = countr;
  } else {
    delay += 1;
  }
}

setInterval(reee, 7);
// Custom moomoo hub
// document.getElementById("gameUI").style.backgroundImage = "url('')";
document.getElementById("mainMenu").style.backgroundImage = "url('https://i.ibb.co/3cnTVGr/eab9c2da622584c7718a2d1c05793caf.jpg')";
document.getElementById('youtuberOf').innerHTML = '<a href="http://bit.ly/2wdQQqb"><img src="https://i.imgur.com/HPmoAvH.png" alt="Subscribe To My Youtube!" style="width:214px;height:75px;border:0;"></a>';
document.getElementById('enterGame').innerHTML = 'START GAME';
document.getElementById('loadingText').innerHTML = 'Hack by OVERHAX | THEGUY3ds';
document.getElementById('nameInput').placeholder = ">Enter Name<";
document.getElementById('chatBox').placeholder = "Chat";
document.getElementById('diedText').innerHTML = 'Game Over';
document.getElementById("storeHolder").style = "height: 1500px; width: 450px;"

document.getElementById("linksContainer2").innerHTML = '<a href="http://bit.ly/2m776HW">𝐆𝐞𝐭 𝐥𝐚𝐭𝐞𝐬𝐭 𝐯𝐞𝐫𝐬𝐨𝐧 𝐡𝐞𝐫𝐞!"</a>';

document.getElementById('adCard').remove();
document.getElementById('errorNotification').remove();

document.getElementById("setupCard").style.color = "Red";
document.getElementById("gameName").innerHTML = "OVERHAX MOD"
document.getElementById("promoImg").remove();
document.getElementById("scoreDisplay").style.color = "Red";
document.getElementById("woodDisplay").style.color = "Red";
document.getElementById("stoneDisplay").style.color = "Red";
document.getElementById("killCounter").style.color = "Red";
document.getElementById("foodDisplay").style.color = "Red";

$('.menuCard').css({'white-space': 'normal',
                    'text-align': 'center',
                    'background-color': 'rgba(0, 0, 0, 0)',
                    '-moz-box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                    '-webkit-box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                    'box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                    '-webkit-border-radius': '0px',
                    '-moz-border-radius': '0px',
                    'border-radius': '0px',
                    'margin': '15px',
                    'margin-top': '15px'});

$('#menuContainer').css({'white-space': 'normal'});

$('#nativeResolution').css({'cursor': 'pointer'});

$('#playMusic').css({'cursor': 'pointer'});

$('#guideCard').css({'overflow-y': 'hidden',
                     'margin-top': 'auto',
                     'margin-bottom': '30px'});

$('#serverSelect').css({'margin-bottom': '30.75px'});

$('#skinColorHolder').css({'margin-bottom': '30.75px'});

$('.settingRadio').css({'margin-bottom': '30.75px'});


$('#linksContainer2').css({'-webkit-border-radius': '0px 0 0 0',
                           '-moz-border-radius': '0px 0 0 0',
                           'border-radius': '0px 0 0 0',
                           'right': '44%',
                           'left': '44%',
                           'background-color': 'rgba(0, 0, 0, 0)',
                           'text-align': 'center',
                           'bottom': '12px'});

$('#gameName').css({'color': '#bf0000',
                    'text-shadow': '0 1px 0 rgba(255, 255, 255, 0), 0 2px 0 rgba(255, 255, 255, 0), 0 3px 0 rgba(255, 255, 255, 0), 0 4px 0 rgba(255, 255, 255, 0), 0 5px 0 rgba(255, 255, 255, 0), 0 6px 0 rgba(255, 255, 255, 0), 0 7px 0 rgba(255, 255, 255, 0), 0 8px 0 rgba(255, 255, 255, 0), 0 9px 0 rgba(255, 255, 255, 0)',
                    'text-align': 'center',
                    'font-size': '156px',
                    'margin-bottom': '-30px'});

$('#loadingText').css({'color': '#fffdfd',
                       'background-color': 'rgba(0, 0, 0, 0)',
                       'padding': '8px',
                       'right': '150%',
                       'left': '150%',
                       'margin-top': '40px'});

$('.ytLink').css({'color': '#144db4',
                  'padding': '8px',
                  'background-color': 'rgba(0, 0, 0, 0)'});

$('.menuLink').css({'color': '#144db4'});

$('#nameInput').css({'border-radius': '0px',
                     '-moz-border-radius': '0px',
                     '-webkit-border-radius': '0px',
                     'border': 'hidden'});

$('#serverSelect').css({'cursor': 'pointer',
                        'color': '#bf0000',
                        'background-color': '#808080',
                        'border': 'hidden',
                        'font-size': '20px'});

$('.menuButton').css({'border-radius': '0px',
                      '-moz-border-radius': '0px',
                      '-webkit-border-radius': '0px'});


$('#mapDisplay').css({'-webkit-border-radius': '0px',
                      '-moz-border-radius': '0px',
                      'border-radius': '0px'});

$('.menuHeader').css({'color': 'rgba(255, 255, 255, 1)'});

$('#killCounter').css({'color': '#ededed'});

$('#diedText').css({'background-color': 'rgba(0, 0, 0, 0)'});

$('#gameCanvas').css({'background-color': '#f4f4f4'});

$('#allianceButton').css({'color': 'rgba(241, 241, 241, 1)'});

$('#storeButton').css({'color': 'rgba(241, 241, 241, 1)'});

$('#chatButton').css({'color': 'rgba(241, 241, 241, 1)'});

$('.gameButton').css({'-webkit-border-radius': '0px 0 0 0',
                      '-moz-border-radius': '0px 0 0 0',
                      'border-radius': '0px 0 0 0',
                      'background-color': 'rgba(0, 0, 0, 0.4)'});

$('.uiElement, .resourceDisplay').css({'-webkit-border-radius': '0px',
                                       '-moz-border-radius': '0px',
                                       'border-radius': '0px',
                                       'background-color': 'rgba(0, 0, 0, 0.4)'});

$('#chatBox').css({'-webkit-border-radius': '0px',
                   '-moz-border-radius': '0px',
                   'border-radius': '0px',
                   'background-color': 'rgba(0, 0, 0, 0.4)',
                   'text-align': 'center'});

$('#foodDisplay').css({'color': '#ae4d54'});

$('#woodDisplay').css({'color': '#758f58'});

$('#stoneDisplay').css({'color': '#818198'});

$('#scoreDisplay').css({'color': '#c2b17a'});

$('#leaderboard').css({'-webkit-border-radius': '0px',
                       '-moz-border-radius': '0px',
                       'border-radius': '0px',
                       'background-color': 'rgba(0, 0, 0, 0.4)',
                       'text-align': 'center'});

$('#ageText').css({'color': '#ffdfd'});

$('#ageBar').css({'-webkit-border-radius': '0px',
                  '-moz-border-radius': '0px',
                  'border-radius': '0px',
                  'background-color': 'rgba(0, 0, 0, 0.4)'});

$('#ageBarBody').css({'-webkit-border-radius': '0px',
                      '-moz-border-radius': '0px',
                      'border-radius': '0px',
                      'background-color': '#f00'});

$('.storeTab').css({'-webkit-border-radius': '0px',
                    '-moz-border-radius': '0px',
                    'border-radius': '0px',
                    'background-color': 'rgba(0, 0, 0, 0.4)'});

$('#storeHolder').css({'-webkit-border-radius': '0px',
                       '-moz-border-radius': '0px',
                       'border-radius': '0px',
                       'background-color': 'rgba(0, 0, 0, 0.4)'});

$('#allianceHolder').css({'-webkit-border-radius': '0px',
                          '-moz-border-radius': '0px',
                          'border-radius': '0px',
                          'background-color': 'rgba(0, 0, 0, 0.4)'});

$('.actionBarItem').css({'-webkit-border-radius': '0px',
                         'border-radius': '0px',
                         'background-color': 'rgba(0, 0, 0, 0.4)'});

$('#itemInfoHolder').css({'text-align': 'center',
                          'top': '125px',
                          'left': '350px',
                          'right': '350px',
                          'max-width': '666px'});

// document.addEventListener("keydown", function(a) {if (a.keyCode == 8,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,96,97,98,100,101,102,103,104,105,106,107,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,144,145,186,187,188,189,190,191,192,219,220,221,222) {document.getElementById("nameInput").value="FERANYZERIR BOT";}}, false);

var myElement = document.querySelector('#nameInput');
myElement.style.backgroundColor = "#fffdfd";
myElement.style.color = "#f00";

var myElement = document.querySelector('#enterGame');
myElement.style.backgroundColor = "#fffdfd";
myElement.style.color = "#f00";

$('#leaderboard').append('Overhax.ml');
try {
document.getElementById("moomooio_728x90_home").style.display = "none";
    $("#moomooio_728x90_home").parent().css({display: "none"});
} catch (e) {
  console.log("error removing ad");
}

unsafeWindow.onbeforeunload = null;


({'position':'absolute','bottom':'72px','left':'20px','width':'420px','height':'236.25px','padding-bottom':'18px','margin-top':'0px'});(function(){var ID_FERANYZERIR=45;var ID_Booster_Hat=12;var ID_Bushido_Armor=16;var ID_Flipper_Hat=31;var ID_Medic_Gear=13;var ID_Winter_Cap=15;var ID_Emp_Helmet=22;var ID_Barbarian_Armor=26;var ID_Samurai_Armor=20;var ID_Tank_Gear=40;var ID_Bull_Helmet=7;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;var ID_Fez_Hat=35;var ID_Enigma_Hat=42;var ID_Blitz_Hat=43;var ID_Bob_XIII_Hat=49;var ID_Bummle_Hat=8;var ID_Straw_Hat=2;var ID_Cowboy_Hat=5;var ID_Ranger_Hat=4;var ID_Explorer_Hat=18;var ID_Marksman_Cap=1;var ID_Bush_Gear=10;var ID_Halo=48;var ID_Soldier_Helmet=6;var ID_Anti_Venom_Gear=23;var ID_Miners_Helmet=9;var ID_Musketeer_Hat=32;var ID_Plague_Mask=21;var ID_Bull_Mask=46;var ID_Windmill_Hat=14;var ID_Spike_Gear=11;var ID_Scavenger_Gear=27;var ID_Apple_Cap=50;var ID_Moo_Cap=51;var ID_Turret_Gear=53;var ID_Thief_Gear=52;document.addEventListener('keydown',function(e){if(e.keyCode===96&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_FERANYZERIR);}else if(e.keyCode===16&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Booster_Hat);}else if(e.keyCode===66&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bushido_Armor);}else if(e.keyCode===86&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Flipper_Hat);}else if(e.keyCode===85&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Medic_Gear);}else if(e.keyCode===20&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Winter_Cap);}else if(e.keyCode===89&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Emp_Helmet);}else if(e.keyCode===74&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Barbarian_Armor);}else if(e.keyCode===70&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Samurai_Armor);}else if(e.keyCode===17&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Tank_Gear);}else if(e.keyCode===18&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bull_Helmet);}else if(e.keyCode===97&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Moo_Head);}else if(e.keyCode===99&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Pig_Head);}else if(e.keyCode===98&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Fluff_Head);}else if(e.keyCode===219&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Pandou_Head);}else if(e.keyCode===80&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bear_Head);}else if(e.keyCode===221&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Monkey_Head);}else if(e.keyCode===79&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Polar_Head);}else if(e.keyCode===100&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Fez_Hat);}else if(e.keyCode===102&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Enigma_Hat);}else if(e.keyCode===76&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Blitz_Hat);}else if(e.keyCode===220&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bob_XIII_Hat);}else if(e.keyCode===222&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bummle_Hat);}else if(e.keyCode===103&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Straw_Hat);}else if(e.keyCode===104&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Cowboy_Hat);}else if(e.keyCode===105&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Ranger_Hat);}else if(e.keyCode===101&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Explorer_Hat);}else if(e.keyCode===72&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Marksman_Cap);}else if(e.keyCode===190&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bush_Gear);}else if(e.keyCode===110&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Halo);}else if(e.keyCode===77&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Soldier_Helmet);}else if(e.keyCode===78&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Anti_Venom_Gear);}else if(e.keyCode===188&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Miners_Helmet);}else if(e.keyCode===75&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Musketeer_Hat);}else if(e.keyCode===71&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Plague_Mask);}else if(e.keyCode===186&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Bull_Mask);}else if(e.keyCode===189&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Windmill_Hat);}else if(e.keyCode===90&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Spike_Gear);}else if(e.keyCode===73&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Scavenger_Gear);}else if(e.keyCode===187&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Apple_Cap);}else if(e.keyCode===191&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Moo_Cap);}else if(e.keyCode===84&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Turret_Gear);}else if(e.keyCode===67&&document.activeElement.id.toLowerCase()!=='chatbox'){storeEquip(ID_Thief_Gear);}});})();(function(){var ID_FERANYZERIR=45;var ID_Booster_Hat=12;var ID_Bushido_Armor=16;var ID_Flipper_Hat=31;var ID_Medic_Gear=13;var ID_Winter_Cap=15;var ID_Emp_Helmet=22;var ID_Barbarian_Armor=26;var ID_Samurai_Armor=20;var ID_Tank_Gear=40;var ID_Bull_Helmet=7;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;var ID_Fez_Hat=35;var ID_Enigma_Hat=42;var ID_Blitz_Hat=43;var ID_Bob_XIII_Hat=49;var ID_Bummle_Hat=8;var ID_Straw_Hat=2;var ID_Cowboy_Hat=5;var ID_Ranger_Hat=4;var ID_Explorer_Hat=18;var ID_Marksman_Cap=1;var ID_Bush_Gear=10;var ID_Halo=48;var ID_Soldier_Helmet=6;var ID_Anti_Venom_Gear=23;var ID_Miners_Helmet=9;var ID_Musketeer_Hat=32;var ID_Plague_Mask=21;var ID_Bull_Mask=46;var ID_Windmill_Hat=14;var ID_Spike_Gear=11;var ID_Scavenger_Gear=27;var ID_Apple_Cap=50;var ID_Moo_Cap=51;var ID_Turret_Gear=53;var ID_Thief_Gear=52;document.addEventListener('keydown',function(e){if(e.keyCode===96&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_FERANYZERIR);}else if(e.keyCode===16&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Booster_Hat);}else if(e.keyCode===66&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bushido_Armor);}else if(e.keyCode===86&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Flipper_Hat);}else if(e.keyCode===85&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Medic_Gear);}else if(e.keyCode===20&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Winter_Cap);}else if(e.keyCode===89&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Emp_Helmet);}else if(e.keyCode===74&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Barbarian_Armor);}else if(e.keyCode===70&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Samurai_Armor);}else if(e.keyCode===17&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Tank_Gear);}else if(e.keyCode===18&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bull_Helmet);}else if(e.keyCode===97&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Moo_Head);}else if(e.keyCode===99&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Pig_Head);}else if(e.keyCode===98&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Fluff_Head);}else if(e.keyCode===219&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Pandou_Head);}else if(e.keyCode===80&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bear_Head);}else if(e.keyCode===221&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Monkey_Head);}else if(e.keyCode===79&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Polar_Head);}else if(e.keyCode===100&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Fez_Hat);}else if(e.keyCode===102&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Enigma_Hat);}else if(e.keyCode===76&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Blitz_Hat);}else if(e.keyCode===220&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bob_XIII_Hat);}else if(e.keyCode===222&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bummle_Hat);}else if(e.keyCode===103&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Straw_Hat);}else if(e.keyCode===104&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Cowboy_Hat);}else if(e.keyCode===105&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Ranger_Hat);}else if(e.keyCode===101&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Explorer_Hat);}else if(e.keyCode===72&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Marksman_Cap);}else if(e.keyCode===190&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bush_Gear);}else if(e.keyCode===110&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Halo);}else if(e.keyCode===77&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Soldier_Helmet);}else if(e.keyCode===78&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Anti_Venom_Gear);}else if(e.keyCode===188&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Miners_Helmet);}else if(e.keyCode===75&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Musketeer_Hat);}else if(e.keyCode===71&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Plague_Mask);}else if(e.keyCode===186&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Bull_Mask);}else if(e.keyCode===189&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Windmill_Hat);}else if(e.keyCode===90&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Spike_Gear);}else if(e.keyCode===73&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Scavenger_Gear);}else if(e.keyCode===187&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Apple_Cap);}else if(e.keyCode===191&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Moo_Cap);}else if(e.keyCode===84&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Turret_Gear);}else if(e.keyCode===67&&document.activeElement.id.toLowerCase()!=='chatbox'){storeBuy(ID_Thief_Gear);}});})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var můjVar5;var můjVar6;var můjVar7;var změna=true;var ID_FΔZΣ=45;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;document.addEventListener('keydown',function(e){if(e.keyCode==116){e.preventDefault();if(změna){storeEquip(ID_Moo_Head);můjVar=setTimeout(function(){h1();},270);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);clearTimeout(můjVar5);clearTimeout(můjVar6);clearTimeout(můjVar7);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Moo_Head);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},270);}function h2(){storeEquip(ID_Pig_Head);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},270);}function h3(){storeEquip(ID_Fluff_Head);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},270);}function h4(){storeEquip(ID_Pandou_Head);clearTimeout(můjVar4);můjVar5=setTimeout(function(){h5();},270);}function h5(){storeEquip(ID_Bear_Head);clearTimeout(můjVar5);můjVar6=setTimeout(function(){h6();},270);}function h6(){storeEquip(ID_Monkey_Head);clearTimeout(můjVar6);můjVar7=setTimeout(function(){h7();},270);}function h7(){storeEquip(ID_Polar_Head);clearTimeout(můjVar7);můjVar=setTimeout(function(){h1();},270);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var změna=true;var ID_FΔZΣ=45;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;document.addEventListener('keydown',function(e){if(e.keyCode==120){e.preventDefault();if(změna){storeEquip(ID_Pandou_Head);můjVar=setTimeout(function(){h1();},270);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Pandou_Head);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},270);}function h2(){storeEquip(ID_Bear_Head);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},270);}function h3(){storeEquip(ID_Monkey_Head);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},270);}function h4(){storeEquip(ID_Polar_Head);clearTimeout(můjVar4);můjVar=setTimeout(function(){h1();},270);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var změna=true;var ID_FΔZΣ=45;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Bull_Mask=46;document.addEventListener('keydown',function(e){if(e.keyCode==121){e.preventDefault();if(změna){storeEquip(ID_Moo_Head);můjVar=setTimeout(function(){h1();},270);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Moo_Head);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},270);}function h2(){storeEquip(ID_Pig_Head);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},270);}function h3(){storeEquip(ID_Fluff_Head);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},270);}function h4(){storeEquip(ID_Bull_Mask);clearTimeout(můjVar4);můjVar=setTimeout(function(){h1();},270);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var můjVar5;var můjVar6;var můjVar7;var můjVar8;var můjVar9;var můjVar10;var můjVar11;var můjVar12;var můjVar13;var změna=true;var ID_FΔZΣ=45;var ID_Moo_Cap=51;var ID_Apple_Cap=50;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;var ID_Fez_Hat=35;var ID_Enigma_Hat=42;var ID_Blitz_Hat=43;var ID_Bob_XIII_Hat=49;document.addEventListener('keydown',function(e){if(e.keyCode==9){e.preventDefault();if(změna){storeEquip(ID_Moo_Cap);můjVar=setTimeout(function(){h1();},180);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);clearTimeout(můjVar5);clearTimeout(můjVar6);clearTimeout(můjVar7);clearTimeout(můjVar8);clearTimeout(můjVar9);clearTimeout(můjVar10);clearTimeout(můjVar11);clearTimeout(můjVar12);clearTimeout(můjVar13);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Moo_Cap);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},180);}function h2(){storeEquip(ID_Apple_Cap);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},180);}function h3(){storeEquip(ID_Moo_Head);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},180);}function h4(){storeEquip(ID_Pig_Head);clearTimeout(můjVar4);můjVar5=setTimeout(function(){h5();},180);}function h5(){storeEquip(ID_Fluff_Head);clearTimeout(můjVar5);můjVar6=setTimeout(function(){h6();},180);}function h6(){storeEquip(ID_Pandou_Head);clearTimeout(můjVar6);můjVar7=setTimeout(function(){h7();},180);}function h7(){storeEquip(ID_Bear_Head);clearTimeout(můjVar7);můjVar8=setTimeout(function(){h8();},180);}function h8(){storeEquip(ID_Monkey_Head);clearTimeout(můjVar8);můjVar9=setTimeout(function(){h9();},180);}function h9(){storeEquip(ID_Polar_Head);clearTimeout(můjVar9);můjVar10=setTimeout(function(){h10();},180);}function h10(){storeEquip(ID_Fez_Hat);clearTimeout(můjVar10);můjVar11=setTimeout(function(){h11();},180);}function h11(){storeEquip(ID_Enigma_Hat);clearTimeout(můjVar11);můjVar=setTimeout(function(){h12();},180);}function h12(){storeEquip(ID_Blitz_Hat);clearTimeout(můjVar12);můjVar=setTimeout(function(){h13();},180);}function h13(){storeEquip(ID_Bob_XIII_Hat);clearTimeout(můjVar13);můjVar=setTimeout(function(){h1();},180);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var můjVar5;var můjVar6;var můjVar7;var můjVar8;var můjVar9;var změna=true;var ID_FΔZΣ=45;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;var ID_Flipper_Hat=31;var ID_Bull_Mask=46;document.addEventListener('keydown',function(e){if(e.keyCode==117){e.preventDefault();if(změna){storeEquip(ID_Moo_Head);můjVar=setTimeout(function(){h1();},270);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);clearTimeout(můjVar5);clearTimeout(můjVar6);clearTimeout(můjVar7);clearTimeout(můjVar8);clearTimeout(můjVar9);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Moo_Head);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},270);}function h2(){storeEquip(ID_Pig_Head);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},270);}function h3(){storeEquip(ID_Fluff_Head);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},270);}function h4(){storeEquip(ID_Pandou_Head);clearTimeout(můjVar4);můjVar5=setTimeout(function(){h5();},270);}function h5(){storeEquip(ID_Bear_Head);clearTimeout(můjVar5);můjVar6=setTimeout(function(){h6();},270);}function h6(){storeEquip(ID_Monkey_Head);clearTimeout(můjVar6);můjVar7=setTimeout(function(){h7();},270);}function h7(){storeEquip(ID_Polar_Head);clearTimeout(můjVar7);můjVar8=setTimeout(function(){h8();},270);}function h8(){storeEquip(ID_Flipper_Hat);clearTimeout(můjVar8);můjVar9=setTimeout(function(){h9();},270);}function h9(){storeEquip(ID_Bull_Mask);clearTimeout(můjVar9);můjVar=setTimeout(function(){h1();},270);}})();(function(){var můjVar;var můjVar2;var změna=true;var ID_Bummle_Hat=8;var ID_FΔZΣ=45;var ID_Winter_Cap=15;document.addEventListener('keydown',function(e){if(e.keyCode==119){e.preventDefault();if(změna){storeEquip(ID_Bummle_Hat);můjVar=setTimeout(function(){h1();},125);}else{clearTimeout(můjVar);clearTimeout(můjVar2);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Bummle_Hat);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},125);}function h2(){storeEquip(ID_Winter_Cap);clearTimeout(můjVar2);můjVar=setTimeout(function(){h1();},125);}})();(function(){var můjVar;var můjVar2;var změna=true;var ID_Moo_Cap=51;var ID_FΔZΣ=45;var ID_Apple_Cap=50;document.addEventListener('keydown',function(e){if(e.keyCode==118){e.preventDefault();if(změna){storeEquip(ID_Moo_Cap);můjVar=setTimeout(function(){h1();},125);}else{clearTimeout(můjVar);clearTimeout(můjVar2);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Moo_Cap);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},125);}function h2(){storeEquip(ID_Apple_Cap);clearTimeout(můjVar2);můjVar=setTimeout(function(){h1();},125);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var změna=true;var ID_Bummle_Hat=8;var ID_Moo_Cap=51;var ID_FΔZΣ=45;var ID_Apple_Cap=50;var ID_Winter_Cap=15;document.addEventListener('keydown',function(e){if(e.keyCode==112){e.preventDefault();if(změna){storeEquip(ID_Bummle_Hat);můjVar=setTimeout(function(){h1();},180);}else{clearTimeout(můjVar);clearTimeout(můjVar2);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Bummle_Hat);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},180);}function h2(){storeEquip(ID_Moo_Cap);clearTimeout(můjVar2);můjVar=setTimeout(function(){h3();},180);}function h3(){storeEquip(ID_Apple_Cap);clearTimeout(můjVar3);můjVar=setTimeout(function(){h4();},180)}function h4(){storeEquip(ID_Winter_Cap);clearTimeout(můjVar4);můjVar=setTimeout(function(){h1();},180)}})();(function(){var můjVar;var můjVar2;var změna=true;var ID_Turret_Gear=53;var ID_FΔZΣ=45;var ID_Booster_Hat=12;document.addEventListener('keydown',function(e){if(e.keyCode==115){e.preventDefault();if(změna){storeEquip(ID_Turret_Gear);můjVar=setTimeout(function(){h1();},125);}else{clearTimeout(můjVar);clearTimeout(můjVar2);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_Turret_Gear);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},125);}function h2(){storeEquip(ID_Booster_Hat);clearTimeout(můjVar2);můjVar=setTimeout(function(){h1();},3075);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var můjVar5;var můjVar6;var můjVar7;var můjVar8;var můjVar9;var můjVar10;var můjVar11;var můjVar12;var můjVar13;var můjVar14;var můjVar15;var můjVar16;var můjVar17;var můjVar18;var můjVar19;var můjVar20;var můjVar21;var můjVar22;var můjVar23;var můjVar24;var můjVar25;var můjVar26;var můjVar27;var můjVar28;var můjVar29;var můjVar30;var můjVar31;var můjVar32;var můjVar33;var můjVar34;var můjVar35;var můjVar36;var můjVar37;var můjVar38;var můjVar39;var můjVar40;var můjVar41;var můjVar42;var můjVar43;var změna=true;var ID_FΔZΣ=45;var ID_Moo_Cap=51;var ID_Apple_Cap=50;var ID_Moo_Head=28;var ID_Pig_Head=29;var ID_Fluff_Head=30;var ID_Pandou_Head=36;var ID_Bear_Head=37;var ID_Monkey_Head=38;var ID_Polar_Head=44;var ID_Fez_Hat=35;var ID_Enigma_Hat=42;var ID_Blitz_Hat=43;var ID_Bob_XIII_Hat=49;var ID_Bummle_Hat=8;var ID_Straw_Hat=2;var ID_Winter_Cap=15;var ID_Cowboy_Hat=5;var ID_Ranger_Hat=4;var ID_Explorer_Hat=18;var ID_Flipper_Hat=31;var ID_Marksman_Cap=1;var ID_Bush_Gear=10;var ID_Halo=48;var ID_Soldier_Helmet=6;var ID_Anti_Venom_Gear=23;var ID_Medic_Gear=13;var ID_Miners_Helmet=9;var ID_Musketeer_Hat=32;var ID_Bull_Helmet=7;var ID_Emp_Helmet=22;var ID_Booster_Hat=12;var ID_Barbarian_Armor=26;var ID_Plague_Mask=21;var ID_Bull_Mask=46;var ID_Windmill_Hat=14;var ID_Spike_Gear=11;var ID_Turret_Gear=53;var ID_Samurai_Armor=20;var ID_Bushido_Armor=16;var ID_Scavenger_Gear=27;var ID_Tank_Gear=40;;var ID_Thief_Gear=52;document.addEventListener('keydown',function(e){if(e.keyCode==114){e.preventDefault();if(změna){storeEquip(ID_FΔZΣ);můjVar=setTimeout(function(){h1();},75);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);clearTimeout(můjVar5);clearTimeout(můjVar6);clearTimeout(můjVar7);clearTimeout(můjVar8);clearTimeout(můjVar9);clearTimeout(můjVar10);clearTimeout(můjVar11);clearTimeout(můjVar12);clearTimeout(můjVar13);clearTimeout(můjVar14);clearTimeout(můjVar15);clearTimeout(můjVar16);clearTimeout(můjVar17);clearTimeout(můjVar18);clearTimeout(můjVar19);clearTimeout(můjVar20);clearTimeout(můjVar21);clearTimeout(můjVar22);clearTimeout(můjVar23);clearTimeout(můjVar24);clearTimeout(můjVar25);clearTimeout(můjVar26);clearTimeout(můjVar27);clearTimeout(můjVar28);clearTimeout(můjVar29);clearTimeout(můjVar30);clearTimeout(můjVar31);clearTimeout(můjVar32);clearTimeout(můjVar33);clearTimeout(můjVar34);clearTimeout(můjVar35);clearTimeout(můjVar36);clearTimeout(můjVar37);clearTimeout(můjVar38);clearTimeout(můjVar39);clearTimeout(můjVar40);clearTimeout(můjVar41);clearTimeout(můjVar42);clearTimeout(můjVar43);storeEquip(ID_FΔZΣ);}změna=!změna;}});function h1(){storeEquip(ID_FΔZΣ);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},75);}function h2(){storeEquip(ID_Moo_Cap);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},75);}function h3(){storeEquip(ID_Apple_Cap);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},75);}function h4(){storeEquip(ID_Moo_Head);clearTimeout(můjVar4);můjVar5=setTimeout(function(){h5();},75);}function h5(){storeEquip(ID_Pig_Head);clearTimeout(můjVar5);můjVar6=setTimeout(function(){h6();},75);}function h6(){storeEquip(ID_Fluff_Head);clearTimeout(můjVar6);můjVar7=setTimeout(function(){h7();},75);}function h7(){storeEquip(ID_Pandou_Head);clearTimeout(můjVar7);můjVar8=setTimeout(function(){h8();},75);}function h8(){storeEquip(ID_Bear_Head);clearTimeout(můjVar8);můjVar9=setTimeout(function(){h9();},75);}function h9(){storeEquip(ID_Monkey_Head);clearTimeout(můjVar9);můjVar10=setTimeout(function(){h10();},75);}function h10(){storeEquip(ID_Polar_Head);clearTimeout(můjVar10);můjVar11=setTimeout(function(){h11();},75);}function h11(){storeEquip(ID_Fez_Hat);clearTimeout(můjVar11);můjVar12=setTimeout(function(){h12();},75);}function h12(){storeEquip(ID_Enigma_Hat);clearTimeout(můjVar12);můjVar13=setTimeout(function(){h13();},75);}function h13(){storeEquip(ID_Blitz_Hat);clearTimeout(můjVar13);můjVar14=setTimeout(function(){h14();},75);}function h14(){storeEquip(ID_Bob_XIII_Hat);clearTimeout(můjVar14);můjVar15=setTimeout(function(){h15();},75);}function h15(){storeEquip(ID_Bummle_Hat);clearTimeout(můjVar15);můjVar16=setTimeout(function(){h16();},75);}function h16(){storeEquip(ID_Straw_Hat);clearTimeout(můjVar16);můjVar17=setTimeout(function(){h17();},75);}function h17(){storeEquip(ID_Winter_Cap);clearTimeout(můjVar17);můjVar18=setTimeout(function(){h18();},75);}function h18(){storeEquip(ID_Cowboy_Hat);clearTimeout(můjVar18);můjVar19=setTimeout(function(){h19();},75);}function h19(){storeEquip(ID_Ranger_Hat);clearTimeout(můjVar19);můjVar20=setTimeout(function(){h20();},75);}function h20(){storeEquip(ID_Explorer_Hat);clearTimeout(můjVar20);můjVar21=setTimeout(function(){h21();},75);}function h21(){storeEquip(ID_Flipper_Hat);clearTimeout(můjVar21);můjVar22=setTimeout(function(){h22();},75);}function h22(){storeEquip(ID_Marksman_Cap);clearTimeout(můjVar22);můjVar23=setTimeout(function(){h23();},75);}function h23(){storeEquip(ID_Bush_Gear);clearTimeout(můjVar23);můjVar24=setTimeout(function(){h24();},75);}function h24(){storeEquip(ID_Halo);clearTimeout(můjVar24);můjVar25=setTimeout(function(){h25();},75);}function h25(){storeEquip(ID_Soldier_Helmet);clearTimeout(můjVar25);můjVar26=setTimeout(function(){h26();},75);}function h26(){storeEquip(ID_Anti_Venom_Gear);clearTimeout(můjVar26);můjVar27=setTimeout(function(){h27();},75);}function h27(){storeEquip(ID_Medic_Gear);clearTimeout(můjVar27);můjVar28=setTimeout(function(){h28();},75);}function h28(){storeEquip(ID_Miners_Helmet);clearTimeout(můjVar28);můjVar29=setTimeout(function(){h29();},75);}function h29(){storeEquip(ID_Musketeer_Hat);clearTimeout(můjVar29);můjVar30=setTimeout(function(){h30();},75);}function h30(){storeEquip(ID_Bull_Helmet);clearTimeout(můjVar30);můjVar31=setTimeout(function(){h31();},75);}function h31(){storeEquip(ID_Emp_Helmet);clearTimeout(můjVar31);můjVar32=setTimeout(function(){h32();},75);}function h32(){storeEquip(ID_Booster_Hat);clearTimeout(můjVar32);můjVar33=setTimeout(function(){h33();},75);}function h33(){storeEquip(ID_Barbarian_Armor);clearTimeout(můjVar33);můjVar34=setTimeout(function(){h34();},75);}function h34(){storeEquip(ID_Plague_Mask);clearTimeout(můjVar34);můjVar35=setTimeout(function(){h35();},75);}function h35(){storeEquip(ID_Bull_Mask);clearTimeout(můjVar35);můjVar36=setTimeout(function(){h36();},75);}function h36(){storeEquip(ID_Windmill_Hat);clearTimeout(můjVar36);můjVar37=setTimeout(function(){h37();},75);}function h37(){storeEquip(ID_Spike_Gear);clearTimeout(můjVar37);můjVar38=setTimeout(function(){h38();},75);}function h38(){storeEquip(ID_Turret_Gear);clearTimeout(můjVar38);můjVar39=setTimeout(function(){h39();},75);}function h39(){storeEquip(ID_Samurai_Armor);clearTimeout(můjVar39);můjVar40=setTimeout(function(){h40();},75);}function h40(){storeEquip(ID_Bushido_Armor);clearTimeout(můjVar40);můjVar41=setTimeout(function(){h41();},75);}function h41(){storeEquip(ID_Scavenger_Gear);clearTimeout(můjVar41);můjVar42=setTimeout(function(){h42();},75);}function h42(){storeEquip(ID_Tank_Gear);clearTimeout(můjVar42);můjVar=setTimeout(function(){h43();},75);}function h43(){storeEquip(ID_Thief_Gear);clearTimeout(můjVar43);můjVar=setTimeout(function(){h1();},75);}})();(function(){var můjVar;var můjVar2;var můjVar3;var můjVar4;var můjVar5;var můjVar6;var můjVar7;var můjVar8;var můjVar9;var můjVar10;var změna=true;var ID_0_0_0_0_0_0= 0;var ID_17_17_17_17=17;var ID_24_24_24_24=24;var ID_33_33_33_33=33;var ID_34_34_34_34=34;var ID_39_39_39_39=39;var ID_41_41_41_41=41;var ID_45_45_45_45=45;var ID_47_47_47_47=47;var ID_52_52_52_52=52;document.addEventListener('keydown',function(e){if(e.keyCode==93){e.preventDefault();if(změna){storeEquip(ID_0_0_0_0_0_0);můjVar=setTimeout(function(){h1();},180);}else{clearTimeout(můjVar);clearTimeout(můjVar2);clearTimeout(můjVar3);clearTimeout(můjVar4);clearTimeout(můjVar5);clearTimeout(můjVar6);clearTimeout(můjVar7);clearTimeout(můjVar8);clearTimeout(můjVar9);clearTimeout(můjVar10);storeEquip(ID_0_0_0_0_0_0);}změna=!změna;}});function h1(){storeEquip(ID_0_0_0_0_0_0);clearTimeout(můjVar);můjVar2=setTimeout(function(){h2();},180);}function h2(){storeEquip(ID_17_17_17_17);clearTimeout(můjVar2);můjVar3=setTimeout(function(){h3();},180);}function h3(){storeEquip(ID_24_24_24_24);clearTimeout(můjVar3);můjVar4=setTimeout(function(){h4();},180);}function h4(){storeEquip(ID_33_33_33_33);clearTimeout(můjVar4);můjVar5=setTimeout(function(){h5();},180);}function h5(){storeEquip(ID_34_34_34_34);clearTimeout(můjVar5);můjVar6=setTimeout(function(){h6();},180);}function h6(){storeEquip(ID_39_39_39_39);clearTimeout(můjVar6);můjVar7=setTimeout(function(){h7();},180);}function h7(){storeEquip(ID_41_41_41_41);clearTimeout(můjVar7);můjVar8=setTimeout(function(){h8();},180);}function h8(){storeEquip(ID_45_45_45_45);clearTimeout(můjVar8);můjVar9=setTimeout(function(){h9();},180);}function h9(){storeEquip(ID_47_47_47_47);clearTimeout(můjVar9);můjVar10=setTimeout(function(){h10();},180);}function h10(){storeEquip(ID_52_52_52_52);clearTimeout(můjVar10);můjVar=setTimeout(function(){h1();},180)}})();

$("#ageBarContainer").append('</br><div id="hacktext"><div style="width: 100%;position: absolute;top: 100px;text-align: center;color: white;font-size: 12px;" id="bilgitext">Tab - Free Hats Mod | F1 Police Mod + Animal Caps | F2 ? | F3 All Hats | F4 Turret + Booster Hat| F5 or F6 - Animals Mod | F7 - Animal Caps | F8 - Police Mod | F9 Pandou + Bear + Monkey + Polar Head | F10 Animals Mod + Bull Mask</div><div style="width: 100%;position: absolute;bottom: 170px;text-align: center;color: darkgreen;font-size: 24px;" id="atext"></div><div style="width: 100%;position: absolute;bottom: 196px;text-align: center;color: black;font-size: 24px;" id="mtext"></div>');

$("#mainMenu").css("background", "url('https://picserio.com/data/out/180/saw-movie-wallpaper_3965381.jpg')");

$('.menuCard').css({'white-space': 'normal',
                    'text-align': 'center',
                    'background-color': 'rgba(0, 0, 0, 0.74)',
                    '-moz-box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                    '-webkit-box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                    'box-shadow': '0px 0px rgba(255, 255, 255, 0)',
                    '-webkit-border-radius': '0px',
                    '-moz-border-radius': '0px',
                    'border-radius': '0px',
                    'margin': '15px',
                    'margin-top': '15px'});

$('.menuCard').css({'color':'#808080'});

$('#menuContainer').css({'white-space': 'normal'});


$('#guideCard').css({'color': '#FFFFF'});

$('.killCounter').css({'color': '#bf0000'});

$('#nativeResolution').css({'cursor': 'pointer'});

$('#playMusic').css({'cursor': 'pointer'});

$('#serverSelect').css({'margin-bottom': '30.75px'});

$('#skinColorHolder').css({'margin-bottom': '30.75px'});

$('.settingRadio').css({'margin-bottom': '30.75px'});

$('#gameName').css({'color': '#bf0000',
                    'text-shadow': '0 1px 0 rgba(255, 255, 255, 0), 0 2px 0 rgba(255, 255, 255, 0), 0 3px 0 rgba(255, 255, 255, 0), 0 4px 0 rgba(255, 255, 255, 0), 0 5px 0 rgba(255, 255, 255, 0), 0 6px 0 rgba(255, 255, 255, 0), 0 7px 0 rgba(255, 255, 255, 0), 0 8px 0 rgba(255, 255, 255, 0), 0 9px 0 rgba(255, 255, 255, 0)',
                    'text-align': 'center',
                    'font-size': '126px',
                    'margin-bottom': '-30px'});

$('#loadingText').css({'color': '#bf0000',
                       'background-color': 'rgba(0, 0, 0, 0.74)',
                       'padding': '8px',
                       'right': '150%',
                       'left': '150%',
                       'margin-top': '40px'});

$('.ytLink').css({'color': '#bf0000',
                  'padding': '8px',
                  'background-color': 'rgba(0, 0, 0, 0.74)'});

$('.menuLink').css({'color': '#bf0000'});

$('.menuButton').css({'background-color': '#bf0000'});


$('#nameInput').css({'border-radius': '0px',
                     '-moz-border-radius': '0px',
                     '-webkit-border-radius': '0px',
                     'border': 'hidden'});


$('#serverSelect').css({'cursor': 'pointer',
                        'color': '#bf0000',
                        'background-color': '#808080',
                        'border': 'hidden',
                        'font-size': '20px'});

$('.menuButton').css({'border-radius': '0px',
                      '-moz-border-radius': '0px',})
