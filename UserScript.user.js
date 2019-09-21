// ==UserScript==
// @name         OVERHAX MOO PLUS
// @namespace    Overhax.ml
// @version      1.0
// @description  Advanced moomoo hack
// @author       OVERHAX | THEGUY3ds
// @match        *://moomoo.io/*
// @match        *://45.77.0.81/*
// @match        *://dev.moomoo.io/*
// @match        *://sandbox.moomoo.io/*
// @require      http://code.jquery.com/jquery-1.12.4.min.js
// @grant        none
// @connect      moomoo.io
// @icon https://imgur.com/PKL7UfF[/img]
// ==/UserScript==
// Messege
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
