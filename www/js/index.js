/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
// document.addEventListener('deviceready', onDeviceReady, false);
var myMedia1 = null;
function error() {
    console.warn('Camera or Accounts permission is not turned on');
  }

function onDeviceReady1() {
    // Cordova is now initialized. Have fun!
    // alert('test')
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    //document.getElementById('deviceready').classList.add('ready');
   /* cordova.plugins.CordovaCall.on('hangup', function() {
        alert("hangup")
    });
    cordova.plugins.CordovaCall.on('reject', function() {
        alert("reject")
    });
    cordova.plugins.CordovaCall.on('sendCall', function() {
        // alert("sendCall event")
        cordova.plugins.CordovaCall.connectCall();
    });*/
  
    var permissions = cordova.plugins.permissions;
    var list = [
        permissions.RECORD_AUDIO,
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_PHONE_STATE,
        permissions.MODIFY_AUDIO_SETTINGS
      ];
       
    
      permissions.checkPermission(list, function( status ) {
        if( !status.hasPermission ) {
        var permissions = cordova.plugins.permissions;
          permissions.requestPermissions(
            list,
            function(status) {
              if( !status.hasPermission ) error();
            },
            error);
        }
      },null);
    // alert("device ready end")    
     
    
}

function callNumber1(mno) {
    // alert("callNumber") "2125551212", 
    document.getElementById('id_stopRecording').style.display = 'none';
    document.getElementById('id_playAudio').style.display = 'none';
    var mobileno = mno;//document.getElementById("id_phoneNumber").value;
    
    if(mobileno!='') {
        recordAudio();
        //
        cordova.plugins.phonedialer.call(
            mobileno,
            function(success) { 
                // alert('Dialing succeeded'); 
            },
            function(err) {
              if (err == "empty") alert("Unknown phone number");
              else alert("Dialer Error:" + err);    
            },
            '',
            ''
           );
           //
           
        
        /*cordova.plugins.CordovaCall.callNumber(mobileno,function() {
            alert(" callNumber success")
           
        },function(error){
            alert("callNumber error",error)
        })
        */
        // alert(" callNumber end")
    } else {
        alert('phone number is required')
    }
    
}


function sendCall1() {
    alert("sendCall")
    /*
    cordova.plugins.CordovaCall.callNumber("9025717945",function() {
        alert(" sendCall success")
    },function(){
        alert("sendCall erroe")
    })
    */
    cordova.plugins.CordovaCall.sendCall("9025717945",1,function() {
        // alert(" sendCall success")
    },function(){
        // alert("sendCall erroe")
    })
    // cordova.plugins.CordovaCall.sendCall('Frd');
 
    //simulate your friend answering the call 5 seconds after you call
    // setTimeout(function(){
     
    // }, 5000);
}
function endCall1() {
    alert("endCall")
    cordova.plugins.CordovaCall.endCall(function() {
        alert(" endCall success")
    },function(){
        alert("endCall erroe")
    })
}

function recordAudio1() {
    // alert("recordAudio");
    myMedia = new Media("myrecording.mp3",function(media){
        alert("media",media)
    })
    // myMedia.play({ playAudioWhenScreenIsLocked : false })
    myMedia.startRecord();
    document.getElementById('id_stopRecording').style.display = 'block';
}
function stopRecord1() {
    alert("stopRecord");
    myMedia.stopRecord();
    document.getElementById('id_stopRecording').style.display = 'none';
    document.getElementById('id_playAudio').style.display = 'block';
    document.getElementById('id_help').style.display = 'none';
}
function playAudio1() {
    document.getElementById('id_help').style.display = 'block';
    // var myMedia = new Media("myrecording.mp3");
    var myMedia = new Media("myrecording.mp3",function(){
        alert("play success")
    },function(error){
        alert("play error",error)
    })
    myMedia.play({ playAudioWhenScreenIsLocked : false })
    // myMedia.startRecord();
}
