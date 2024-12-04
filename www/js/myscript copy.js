
   
  function login(){
      $('.loader').show();
                var mobileNo = document.getElementById("mobileNo").value;
                var password = document.getElementById("password").value;
                var warn_mobileNo;
                var warn_password;
                
                $.ajax({
                    url: "https://teamka.in/crm1/APIs/api_venkat.php",
                    data: {operation:"001",mobileNo:mobileNo,password:password},
                    success: function(response){
                        $('.loader').hide();
                        data = response.split("<-->");
                        if(data[0] == " 1"){
                            warn_mobileNo = document.getElementById('warn_mobileNo');
                            warn_mobileNo.innerHTML="";
                            warn_password = document.getElementById('warn_password');
                            warn_password.innerHTML="";
                            localStorage.setItem('MobileNo',mobileNo);
                            localStorage.setItem("userID",data[3]);
                            localStorage.setItem("userName",data[2]);
                            localStorage.setItem("userType",data[1]);
                            // getUserDetails();
                            window.location.href = "./dashboardNEW.html";
                        }else if(data[0] == " 2"){
                            warn_mobileNo = document.getElementById('warn_mobileNo');
                            warn_mobileNo.innerHTML="";
                            warn_password = document.getElementById('warn_password');
                            warn_password.innerHTML="";
                            localStorage.setItem('MobileNo',mobileNo);
                            localStorage.setItem("userID",data[3]);
                            localStorage.setItem("userName",data[2]);
                            localStorage.setItem("userType",data[1]);
                            // getUserDetails(); 
                            window.location.href = "./callerDashboardNEW.html";
                        }else if(data[0] == " 3"){
                            localStorage.setItem('MobileNo',mobileNo);
                            localStorage.setItem("userID",data[3]);
                            localStorage.setItem("userName",data[2]);
                            localStorage.setItem("userType",data[1]);
                            warn_mobileNo = document.getElementById('warn_mobileNo');
                            warn_mobileNo.innerHTML="";
                            warn_password = document.getElementById('warn_password');
                            warn_password.innerHTML="";
                            window.location.href = "./developerDashboardNEW.html";
                        }else if(data[0] == " 4"){
                            warn_mobileNo = document.getElementById('warn_mobileNo');
                            warn_mobileNo.innerHTML="";
                            warn_password = document.getElementById('warn_password');
                            warn_password.innerHTML="<b>password doesn't match</b>";
                        }else if(data[0] == " 5"){
                            warn_password = document.getElementById('warn_password');
                            warn_password.innerHTML="";
                            warn_mobileNo = document.getElementById('warn_mobileNo');
                            warn_mobileNo.innerHTML="<b>mobileNo not found</b>";
                        }else if(data[0] == " 6"){
                            localStorage.setItem('MobileNo',mobileNo);
                            localStorage.setItem("userID",data[3]);
                            localStorage.setItem("userName",data[2]);
                            localStorage.setItem("userType",data[1]);
                            warn_mobileNo = document.getElementById('warn_mobileNo');
                            warn_mobileNo.innerHTML="";
                            warn_password = document.getElementById('warn_password');
                            warn_password.innerHTML="";
                            window.location.href = "./supportExecutiveNEW.html";
                        }
                    }
                })                
               
  }

// Logout
function Logout(){
    localStorage.clear();
    localStorage.removeItem("MobileNo");
    localStorage.removeItem("userID");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");
    localStorage.removeItem("lead_id");
    window.location.href = "./index.html";
}



// Add Members
function addCaller(){
    var name = document.getElementById("nameCaller").value;
    var mobile = document.getElementById("mobileCaller").value;
    var password = document.getElementById("passwordCaller").value;
    var type = document.getElementById("type").value;
    if(name == '' || mobile == '' || password == ''){
        document.getElementById("errorDetailsCallerForm").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetailsCallerForm").innerHTML= "";
      $('.loader').show();
        $.ajax({
            url: "https://teamka.in/crm1/APIs/api_venkat.php",
            data: {operation : "002",name:name,mobile:mobile,password:password,type:type},
            success: function(response){
      $('.loader').hide();
                if(response==1){
                document.getElementById("nameCaller").value = "";
                document.getElementById("mobileCaller").value = "";
                document.getElementById("passwordCaller").value = "";
                document.getElementById("type").value = "Admin";
                alert("Member Entered");
                $('.close').click(); 
                allCaller();
            }else if(response == 2){
                 document.getElementById("errorDetailsCallerForm").innerHTML= "Account Already Exist";
            }else{
                alert("Server Error");
            }
            }
        })
    }
}
    
    
// Add Leads
function addLead(){
    var name = document.getElementById("name").value;
    var mobile = document.getElementById("mobile").value;
    var alternate_mobile = document.getElementById("alternate_mobile").value;
    var whatsapp = document.getElementById("whatsapp").value;
    var email = document.getElementById("email").value;
    email.trim();
    var interested_in = document.getElementById("interested_in").value;
    var source = document.getElementById("source").value;
    var status = document.getElementById("status").value;
    // changes
    var caller_id = document.getElementById("caller_id").value;
    var caller = $(`#caller_id option[value=${caller_id}]`).text();

    var state = document.getElementById("state").value;
    var city = document.getElementById("district").value;
    if(name == '' || mobile == ''){
        document.getElementById("errorDetails").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetails").innerHTML= "";
      $('.loader').show();
        $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation: "003",name:name,mobile:mobile,alternate_mobile:alternate_mobile,whatsapp:whatsapp,email:email,interested_in:interested_in,source:source,status:status,caller:caller,state:state,city:city,caller_id:caller_id},
        success : function (response){
            console.log(response)
      $('.loader').hide();
            if(response==1){
                window.location.href="./dashboardNEW.html";
                alert("Lead Entered");
                $('.close').click(); 
                if(localStorage.getItem("userType") == "Admin"){
                    allLeads();
                }else if(localStorage.getItem("userType") == "Caller"){
                    myLeads();
                }
            }else if(response==2){
                document.getElementById("errorDetails").innerHTML= "Lead already exist";
            }else if(response==3){
                document.getElementById("errorDetails").innerHTML= "You can not add more lead";
            }else{
                alert("Server Error");
            }
        }
    });
    }
}


// Show All Leads

function CheckDateWaiseStatus(){
  //  $('.loader').show();
    var chkforDate = document.getElementById("chkforDate").value;
    console.log(chkforDate);
    
     
      $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "071",chkforDate:chkforDate},
        success: function (res){
        $('.loader').hide();
        //console.log(res);
        
                				var data  = jQuery.parseJSON(res);	
							//console.log(data);
							var the_table = '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
								$.each(data, function (i, item) {
								
								the_table=the_table+'<tr><td>'+data[i][1]+'</td><td>'+data[i][8]+'<br>'+data[i][9]+'<br>'+data[i][10]+'</td><td>'+data[i][4]+'<br>'+data[i][5]+' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever='+data[i][1]+' onclick="getAllStatus('+data[i][1]+')">Previous Status</button></td><td>'+data[i][14]+'</td><td>'+data[i][13]+'</td><td>'+data[i][11]+'</td><td>'+data[i][12]+'</td><td>'+data[i][7]+' </td></tr>';
								 
							});
							the_table=the_table+"</tbody></table>"
						//	$("#dbData").html(the_table);
						//	$("#table1").DataTable();  

        
        
            document.getElementById("displayContent").innerHTML = "<h1>"+chkforDate+" Call</h1><div class='container mt-5' style='overflow-x:scroll;'>"+the_table+"</tbody></div>";
            $("#table1").DataTable({stateSave: true});  
        }
    })
     
     
     
     
}

// Show All Leads

function CheckCallWaiseStatus(startDate,endDate){
    //  $('.loader').show();
    //   var chkforDate = document.getElementById("chkforDate").value;
     // console.log(chkforDate);
      
       
        $.ajax({
          url: "https://teamka.in/crm1/APIs/api_venkat.php",
          data: {operation: "077",startDate:startDate,endDate:endDate},
          success: function (res){
          $('.loader').hide();
          //console.log(res);
          
                                  var data  = jQuery.parseJSON(res);	
                              //console.log(data);
                              var the_table = '<a href="https://teamka.in/crm1/APIs/export.php?startDate='+startDate+'&endDate'+endDate+'">Export</a><table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name</th><th>Last Status</th><th>Summary Note</th><th>Recording</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>'; 
                                  $.each(data, function (i, item) {
                                  
                                  //the_table=the_table+'<tr><td>'+data[i][1]+'</td><td>'+data[i][8]+'<br>'+data[i][9]+'<br>'+data[i][10]+'</td><td>'+data[i][4]+'<br>'+data[i][5]+' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever='+data[i][1]+' onclick="getAllStatus('+data[i][1]+')">Previous Status</button></td><td>'+data[i][14]+'</td><td>'+data[i][13]+'</td><td>'+data[i][11]+'</td><td>'+data[i][12]+'</td><td>'+data[i][7]+' </td></tr>';

                                  the_table=the_table+'<tr><td>'+data[i][0]+'</td><td>'+data[i][1]+'</td><td>'+data[i][2]+'</td><td>'+data[i][3]+'</td><td>'+getAudio(data[i][4])+'</td><td>'+data[i][5]+'</td><td>'+data[i][6]+'</td><td>'+data[i][7]+'</td><td>'+data[i][8]+'</td></tr>';
                                   
                              });
                              the_table=the_table+"</tbody></table>"
                          //	$("#dbData").html(the_table);
                          //	$("#table1").DataTable();  
  
          
          
              document.getElementById("statsDisplay3").innerHTML = "<div class='container mt-5' style='overflow-x:scroll;'>"+the_table+"</tbody></div>";
              $("#table1").DataTable({stateSave: true});  
          }
      })
       
       
       
       
  }

function LoadOrphanLeadsADMIN(){
    $('.loader').show();
  // var chkforDate = document.getElementById("chkforDate").value;
    //console.log(chkforDate);
    
    var AllUSERDROPDWN = localStorage.getItem("AllUSERDROPDWN"); 
      $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "072"},
        success: function (res){
        $('.loader').hide();
        //console.log(res);
        
                				var data  = jQuery.parseJSON(res);	
							//console.log(data);
							var the_table = '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th><input type="checkbox" onclick="checkUncheck()" id="th-main"></th><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
								$.each(data, function (i, item) {
								
								the_table=the_table+'<tr><td><input type="checkbox" class="sel" name="selected[]" value='+data[i][1]+' class="cb-element"></td><td>'+data[i][1]+'</td><td>'+data[i][8]+'<br><k id="hideShow'+data[i][1]+'"><button onclick="ShowprsnlDetails('+data[i][1]+',`'+data[i][9]+'`,`'+data[i][10]+'`,'+data[i][2]+')">***See Contact Details***</button></k></td><td>'+data[i][4]+'<br>'+data[i][5]+' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever='+data[i][1]+' onclick="getAllStatus('+data[i][1]+')">Previous Status</button></td><td>'+data[i][14]+'</td><td>'+data[i][13]+'</td><td>'+data[i][11]+'</td><td>'+data[i][12]+'</td><td>'+data[i][7]+' </td></tr>';
								 
							});
							the_table=the_table+"</tbody></table>"
						//	$("#dbData").html(the_table);
						//	$("#table1").DataTable();  

        
        
            document.getElementById("displayContent").innerHTML = " <select id='transferTOuserID'>"+AllUSERDROPDWN+"</select> <button onclick='TransferAllLeads()'>Transfer Lead </button> <div class='container mt-5' style='overflow-x:scroll;'>"+the_table+"</tbody></div>";
            $("#table1").DataTable({stateSave: true});  
        }
    })
     
     
     
     
}
function TransferAllLeads(){
     var favorite = new Array(); 
     var transferTOuserID = $("#transferTOuserID").val();
       var chk=0; var mno; 
                $.each($("input[name='selected[]']:checked"), function(){            
                    mno=$(this).val();   // favorite.push($(this).val());
                    if(mno.length == 0 || mno === "undefined"  || typeof(mno) === "undefined" || mno==''){chk=1;}
                    else if(mno.length>0){
                        chk=2;
                       	favorite.push(mno);
                    }
                });
            if(chk==0){alert("No Row Selected")}else{  
                var ab=confirm("Are you sure you want to transfer?");
    if(ab){
    var upt = prompt("Type YES to confirm", "");
    if(upt=="YES"){
      //  $("#hideShow"+Lid).html(+mobile+'<br>'+email);
    //    var userID = localStorage.getItem("userID");
        $('.loader').show();
        
        $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "074",'NewuserID':transferTOuserID,'Lids':favorite},
        success: function (response){
            $('.loader').hide();
            console.log(response);
            alert(response);    
        }
     });
    }          
                
    }
   }
}
function checkUncheck(){
 
 var rows = $('#table1').dataTable().fnGetNodes();
    const main_checked = $("#th-main").prop('checked');
    for(var i=0;i<rows.length;++i){
     $(rows[i]).find('.sel').prop("checked",main_checked);    
   } 
}
function LoadOrphanLeads(){
    $('.loader').show();
  // var chkforDate = document.getElementById("chkforDate").value;
    //console.log(chkforDate);
    
     
      $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "072"},
        success: function (res){
        $('.loader').hide();
        //console.log(res);
        
                				var data  = jQuery.parseJSON(res);	
							//console.log(data);
							var the_table = '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
								$.each(data, function (i, item) {
								
								the_table=the_table+'<tr><td>'+data[i][1]+'</td><td>'+data[i][8]+'<br><k id="hideShow'+data[i][1]+'"><button onclick="ShowprsnlDetails('+data[i][1]+',`'+data[i][9]+'`,`'+data[i][10]+'`,'+data[i][2]+')">***See Contact Details***</button></k></td><td>'+data[i][4]+'<br>'+data[i][5]+' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever='+data[i][1]+' onclick="getAllStatus('+data[i][1]+')">Previous Status</button></td><td>'+data[i][14]+'</td><td>'+data[i][13]+'</td><td>'+data[i][11]+'</td><td>'+data[i][12]+'</td><td>'+data[i][7]+' </td></tr>';
								 
							});
							the_table=the_table+"</tbody></table>"
						//	$("#dbData").html(the_table);
						//	$("#table1").DataTable();  

        
        
            document.getElementById("displayContent").innerHTML = "<h1> </h1><div class='container mt-5' style='overflow-x:scroll;'>"+the_table+"</tbody></div>";
            $("#table1").DataTable({stateSave: true});  
        }
    })
     
     
     
     
}
function ShowprsnlDetails(Lid,mobile,email,userID){
    var ab=confirm("You need to add this lead to your account to see details");
    if(ab){
        $("#hideShow"+Lid).html(+mobile+'<br>'+email);
        var userID = localStorage.getItem("userID");
        $('.loader').show();
        
        $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "073",'NewuserID':userID,'Lid':Lid},
        success: function (response){
            $('.loader').hide();
            alert(response);    
        }
     });
        
    }
}
var myMedia=null;
function recordAudio() {
    // alert("recordAudio");
    myMedia = new Media(cordova.file.externalRootDirectory+"myrecording.mp3",function(media){
        // alert("media",media)
    })
    // myMedia.play({ playAudioWhenScreenIsLocked : false })
    myMedia.startRecord();
}
function stopRecord(lead_id,index) {
    // alert("stopRecord");
    myMedia.stopRecord();
    getAllStatus(lead_id);
    document.getElementById("save-id-"+index).style.display="none";
      
}
function uploadSave() {
    if(myMedia!=null) {
        // myMedia.stopRecord();
        uploadPhoto(cordova.file.externalRootDirectory+"myrecording.mp3");  
    } else {
        addNewStatus();
    }
    
}
function uploadPhoto(imageURI) {
    
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    // options.mimeType="image/jpeg";

    //
    var leadId = document.getElementById("leadId").value;
    var next_call_date = document.getElementById("next_call_date").value;
    var time = document.getElementById("time").value;
    var summary_note = document.getElementById("summary_note").value;
    var call_status = document.getElementById("call_status").value;
    if(next_call_date == '' || summary_note == ''){
        document.getElementById("errorDetailsStatus").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetailsStatus").innerHTML= "";
        
        $('.loader').show();
        var params = {};
        params.leadId = leadId;
        params.next_call_date = next_call_date;
        params.time = time;
        params.summary_note = summary_note;
        params.call_status = call_status;

        options.params = params;
        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI("https://teamka.in/crm1/APIs/upload/upload.php"), win, fail, options);
       
    }

    
    
}
function win(r) {
    $('.loader').hide();
    myMedia = null;
    var leadId = document.getElementById("leadId").value;
    //document.getElementById("save-id-"+index).style.display="none";

    document.getElementById("leadId").value = "";
    document.getElementById("next_call_date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("summary_note").value = "";
    alert("Status Uploaded",JSON.stringify(r));

    getAllStatus(leadId);
    // alert("upload success");
}
function fail(error) {
    alert("upload failed")
}
function makeCall(mobileno,index) {
    //
    // alert("mobileno"+mobileno+"index"+index)
    
    //  mobileno = "9025717945";
    if(mobileno!=0) {
        recordAudio();
        if( document.getElementById("save-id-"+index)!=null) {
            document.getElementById("save-id-"+index).style.display="block";
        }
        
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
    } else {
        alert("Invalid Mobile Number..")
    }
    
}

function allLeads(){
    
      $('.loader').show();
    $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation : "004"},
        success : function (response){
      $('.loader').hide();
            var partialArranged = response.split("<END>");
            var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(part[8]=="New"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br><a href="https://api.whatsapp.com/send?phone=91'+part[4]+'">'+part[4]+'</a><br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Converted"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Proposail Mailed"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Pending"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else{
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }
                
            }
            content += '</tbody></table></div>';
            document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>"+content;
            $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });  
        }
        
    });
}
function showlddata(id,mobile,alternate,whatsapp,email){
    
    $('#alllddata'+id).html("<a href='tel:"+mobile+"'>"+mobile+"</a><br><a href='tel:"+alternate+"'>"+alternate+"</a><br><a href='https://api.whatsapp.com/send?phone=91"+whatsapp+"'>"+whatsapp+"</a><br>"+email+"");  
}

// Get Projects
function getProjects(){
    $('.loader').show();
     $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "063"},
        success: function (response){
      $('.loader').hide();
            var projects = response.split("<-->");
            var content = '<option value="0">General</option>';
            for(let i=0;i<projects.length-1;i++){
                var data = projects[i].split("/AND/"); 
                    content += '<option value='+parseInt(data[0])+' >'+data[1]+'</option>';
            }
        
            document.getElementById("projDetails").innerHTML = content;
        },
        async: false
    })
}

// Get Cities
function getCities(){
     $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "069"},
        success: function (response){
            var data = response.split("<-->");
            var content = '';
            for(var i=1;i<data.length - 1;i++){
                content += "<option value='"+data[i]+"'>"+data[i]+"</option>";
            }
            document.getElementById("statsForCity").innerHTML = content;
            console.log(content);
        }
     });
}

// Get Callers
function getCallers(){
    checkLeadStatus();
    statistics();
    getDevelopers();
    getProjects();
    getCities();
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "010"},
        success: function (response){
      $('.loader').hide();
            var callers = response.split("<-->");
            var content = '';
            for(let i=0;i<callers.length-1;i++){
                var data = callers[i].split("/AND/"); 
                if(data[2]=="Admin"){
                    content += '<option value='+parseInt(data[0])+' >'+data[1]+'(Admin)</option>';
                }else{
                    content += '<option value='+parseInt(data[0])+' >'+data[1]+'</option>';
                }
            }
            if(localStorage.getItem("userType")=="Admin"){
                document.getElementById("caller_id").innerHTML = content;
                document.getElementById("edit_caller_id").innerHTML = content;
            }
            
            document.getElementById("assignedTo").innerHTML = content;
            document.getElementById("edit_callerA").innerHTML = content;
            
            localStorage.setItem('AllUSERDROPDWN',content);
        },
        async: false
    })
}


    
// Fill Update Lead Form
function fillUpdateForm(id){
    localStorage.setItem("lead_id",id);
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "006",id:id},
        success: function (response){
      $('.loader').hide();
             var data = response.split("<-->");
            //  lol();  
             document.getElementById("edit_name").value = data[1];
            document.getElementById("edit_mobile").value = data[2];
            document.getElementById("edit_alternate_mobile").value = data[3];
            document.getElementById("edit_whatsapp").value = data[4];
            document.getElementById("edit_email").value = data[5];
            document.getElementById("edit_interested_in").value = data[6];
            document.getElementById("edit_source").value = data[7];
            document.getElementById("edit_status").value = data[8];
            document.getElementById("edit_state").value = data[10];
            document.getElementById("edit_district").innerHTML = "<option value='"+data[11]+"'>"+data[11]+"</option>";
            document.getElementById("edit_caller_id").value = parseInt(data[12]);
            // $(`#edit_caller_id option[value=${data[12]}]`).selected="true";
        }
    })
}

// Update Lead
function updateLeads(){
    var name = document.getElementById("edit_name").value;
    var mobile = document.getElementById("edit_mobile").value;
    var alternate_mobile = document.getElementById("edit_alternate_mobile").value;
    var whatsapp = document.getElementById("edit_whatsapp").value;
    var email = document.getElementById("edit_email").value;
    var interested_in = document.getElementById("edit_interested_in").value;
    var source = document.getElementById("edit_source").value;
    var status = document.getElementById("edit_status").value;
    var caller_id = document.getElementById("edit_caller_id").value;
    var caller =  $(`#edit_caller_id option[value=${caller_id}]`).text();
    var state = document.getElementById("edit_state").value;
    var city = document.getElementById("edit_district").value;
    var id = localStorage.getItem("lead_id");
    
    if(name == '' || mobile == ''){
        document.getElementById("editErrorDetails").innerHTML= "Fill the Form Correctly";
    }else{
      $('.loader').show();
        
        $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
          data : {operation: "007",id:id,name:name,mobile:mobile,alternate_mobile:alternate_mobile,whatsapp:whatsapp,email:email,interested_in:interested_in,source:source,status:status,caller_id:caller_id,caller:caller,state:state,city:city},
        success : function (response){
      $('.loader').hide();
            if(response==1){
                localStorage.removeItem("lead_id");
                $('.close').click(); 
                if(localStorage.getItem("userType") == "Admin"){
                  //  allLeads();
                }else if(localStorage.getItem("userType") == "Caller"){
                  //  myLeads();
                }
            }else if(response==2){
                document.getElementById("editErrorDetails").innerHTML= "Lead already exist";
            }else{
                localStorage.removeItem("lead_id");
                alert("Server Error");
            }
        }
    });
    }
}
// All Members
function allCaller(){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "005",extra:"mobile"},
        success: function (response){
      $('.loader').hide();
            var callers = response.split("<-->"); var sts;
            var content = '<table id="table2" class="table table-bordered table-striped"><thead><th>ID</th><th>Name</th><th>Mobile No</th><th>Type</th><th>DOR</th><th>Option</th></thead><tbody>';
            for(let i=0;i<callers.length-1;i++){
                var temp = callers[i].split("/AND/"); 
                // if(temp[5]=='Enable'){sts = 'Disable'}else{sts = 'Enable'}
                
                if(temp[5] == 1){
                    content += '<tr><td>'+temp[0]+'</td><td>'+temp[1]+'</td><td>'+temp[2]+'</td><td>'+temp[3]+'</td><td>'+temp[4].split(" ")[0]+'</td><td><button class="btn btn-danger" onclick="disableLead('+temp[0]+')">Disable</button></td></tr>'; 
                }else{
                    content += '<tr><td>'+temp[0]+'</td><td>'+temp[1]+'</td><td>'+temp[2]+'</td><td>'+temp[3]+'</td><td>'+temp[4].split(" ")[0]+'</td><td><button class="btn btn-success" onclick="enableLead('+temp[0]+')">Enable</button></td></tr>'; 
                }
                
            }
            document.getElementById("displayContent").innerHTML = "<h1>All Members</h1><div class='container mt-5' style='overflow-x:scroll;'>"+content+"</tbody></div>";
            $("#table2").DataTable({stateSave: true});  
        }
    })
}

function disableLead(id){
  $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "061",'id':id},
        success: function (response){
            $('.loader').hide();
            if(response == 1){
                alert("Disabled");
            }else{
                alert("Error Occured");
            }
            allCaller();
        }
    });
}

function enableLead(id){
  $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "062",'id':id},
        success: function (response){
            $('.loader').hide();
            if(response == 1){
                alert("Enabled");
            }else{
                alert("Error Occured");
            }
            allCaller();
        }
    });
}

// function disableLeadAdd(aid,sts){
//     var k=confirm(sts+" ?");
//     if(k){
//       $('.loader').show();
//     $.ajax({
//         url: "https://teamka.in/crm1/APIs/api_venkat.php",
//         data: {operation: "059",'aid':aid,'sts':sts},
//         success: function (response){
//             $('.loader').hide();
//             alert(response);
//             allCaller();
            
//         }
//     })
//   }
// }



// Add New Status
function addNewStatus(){
    var leadId = document.getElementById("leadId").value;
    var next_call_date = document.getElementById("next_call_date").value;
    var time = document.getElementById("time").value;
    var summary_note = document.getElementById("summary_note").value;
    var call_status = document.getElementById("call_status").value;
    if(next_call_date == '' || summary_note == ''){
        document.getElementById("errorDetailsStatus").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetailsStatus").innerHTML= "";
      $('.loader').show();
        $.ajax({
            url: "https://teamka.in/crm1/APIs/api_venkat.php",
            data: {operation: "008",leadId:leadId,next_call_date:next_call_date,time:time,summary_note:summary_note,call_status:call_status},
            success: function (response){
                    $('.loader').hide();
                    if(response==1){
                        document.getElementById("leadId").value = "";
                        document.getElementById("next_call_date").value = "";
                        document.getElementById("time").value = "";
                        document.getElementById("summary_note").value = "";
                        alert("Status Uploaded");
                     getAllStatus(leadId);
                    }else{
                        alert(response);
                    }
                }
        })
    }
}

document.addEventListener('play', function(e){
    var audios = document.getElementsByTagName('audio');
    for(var i = 0, len = audios.length; i < len;i++){
        if(audios[i] != e.target){
            audios[i].pause();
        }
    }
}, true);
//Get All Status
function getAudio(condition) {
    if(condition!='') {
        return "<audio controls><source src='"+condition+"' type='audio/mpeg'>Your browser does not support the html audio tag.</audio>"
    } else {
        return "";
    }
}
function getAllStatus(id){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "009",id:id},
        success: function (response){
      $('.loader').hide();
            var info = response.split("/END/");
            var content = "<table class='table table-bordered table-striped'><thead><th>Called By</th><th>On</th><th>Summary</th><th>Next Call</th><th>Audio</th></thead><tbody>";
            for(let i=0;i<info.length -1;i++){
                var element = info[i];
                var part = element.split("<-->");
                content += "<tr><td>"+part[0]+"</td><td>"+part[1].split(" ")[0]+"<br>"+part[1].split(" ")[1]+"</td><td>"+part[2]+"</td><td>"+part[3]+"</td><td>"+getAudio(part[5])+"</td></tr>";
            }
            showMailOption(id);
            if(localStorage.getItem("userType") == "Admin"){
            document.getElementById("allStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
            
                }else if(localStorage.getItem("userType") == "Caller"){
                    document.getElementById("allStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
                    document.getElementById("allStatusCallers").innerHTML = content+"</tbody></table>";
        
                }else if(localStorage.getItem("userType") == "Developer"){
                    document.getElementById("allStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
                    document.getElementById("allStatusCallers").innerHTML = content+"</tbody></table>";
        
        
                }
        }
    })
}

function showMailOption(id){
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data:{operation:"024",id:id},
        success: function(response){
      $('.loader').hide();
            if(response ==1){
                document.getElementById("mailOption").innerHTML = "<button class='btn btn-success' onclick='sendMail("+id+")'>Send Mail</button><p id='errorMail' style='text-align: right;color: crimson;'></p>";
            }else{
                document.getElementById("mailOption").innerHTML = "";
            }
        }
    });
}


//Get Name And Type of User
function getUserDetails(){
    
    var mobile = localStorage.getItem("MobileNo");
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"011",mobile:mobile},
        success: function(response){
      $('.loader').hide();
            data = response.split("<-->");
            localStorage.setItem("userID",data[0]);
            localStorage.setItem("userName",data[1]);
            localStorage.setItem("userType",data[2]);
            document.getElementById("mainUser").innerHTML = data[1];
        }
    })
}

//Leads to be contacted today
function allLeadsOnDate(date){
            // var today = new Date();
            // var dd = today.getDate();
            // var mm = today.getMonth()+1; 
            // var yyyy = today.getFullYear();
            // if(dd<10) dd='0'+dd;
            // if(mm<10) mm='0'+mm;
            // var date = yyyy+"-"+mm+"-"+dd;
            
      $('.loader').show();
            $.ajax({
                    url : "https://teamka.in/crm1/APIs/api_venkat.php",
                    data : {operation : "014",date:date},
                    success : function (response){
      $('.loader').hide();
                        var partialArranged = response.split("<END>");
                        var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
                        var totalUpdates = partialArranged.length - 1;
            
                        for (let index = 1; index <= totalUpdates; index++) {
                            var element = partialArranged[index-1];
                            var part = element.split("<-->");
                            if(part[8]=="New"){
                            content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                            }else if(part[8]=="Converted"){
                            content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                            }else if(part[8]=="Proposail Mailed"){
                            content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                            }else if(part[8]=="Pending"){
                            content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                            }else{
                            content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                            }
                            
                        }
                        content += '</tbody></table></div>';
                        document.getElementById("displayContent").innerHTML = "<h1>&#x2706; To be Contacted </h1><div style='overflow-x:scroll;'>"+content;
                        $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });  
                    }
                    
                });
}

// Statistics
function statistics(){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"015"},
        success: function(response){
      $('.loader').hide();
            // alert(response);
        }
    })
}

// Get Date
function getDate(){
    var date = document.getElementById("contactDate").value;
    if(date == ''){
        document.getElementById("errorDetailsDate").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetailsDate").innerHTML= "";
        document.getElementById("contactDate").value = "";
        $('.close').click(); 
        allLeadsOnDate(date);
        
    }
}




//////Functions for the Caller Page




// Show My Leads
function myLeads(){
      $('.loader').show();
    $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation : "004"},
        success : function (response){
      $('.loader').hide();
            var partialArranged = response.split("<END>");
           var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;
            var me = localStorage.getItem("userID");
            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(parseInt(part[13])==parseInt(me)){
                    if(part[8]=="New"){
                     content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br><a href="https://api.whatsapp.com/send?phone=91'+part[4]+'">'+part[4]+'</a><br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Converted"){
                     content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white;">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Proposail Mailed"){
                     content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black;">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Pending"){
                     content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white;">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else{
                     content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[2]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }
                }
            }
            content += '</tbody></table></div>';
            document.getElementById("displayContent").innerHTML = "<h1>My Leads</h1><div style='overflow-x:scroll;'>"+content;
            $("#table1").DataTable( {   "order": [[ 0, "desc" ]] ,stateSave: true  });  
        }
        
    });
}


// Add Leads as Caller
function addLeadAsCaller(){
    var name = document.getElementById("name").value;
    var mobile = document.getElementById("mobile").value;
    var alternate_mobile = document.getElementById("alternate_mobile").value;
    var whatsapp = document.getElementById("whatsapp").value;
    var email = document.getElementById("email").value;
    email.trim();
    var interested_in = document.getElementById("interested_in").value;
    var source = document.getElementById("source").value;
    var status = document.getElementById("status").value;
    var caller_id = localStorage.getItem("userID");
    var caller = localStorage.getItem("userName");
    var state = document.getElementById("state").value;
    var city = document.getElementById("district").value;
    
    if(name == '' || mobile == ''){
        document.getElementById("errorDetails").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetails").innerHTML= "";
      $('.loader').show();
        $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation: "003",name:name,mobile:mobile,alternate_mobile:alternate_mobile,whatsapp:whatsapp,email:email,interested_in:interested_in,source:source,status:status,caller_id:caller_id,caller:caller,state:state,city:city},
        success : function (response){
      $('.loader').hide();
            if(response==1){
                alert("Lead Entered");
                if(localStorage.getItem("userType") == "Caller"){
                       window.location.href="./callerDashboardNEW.html";
                }else if(localStorage.getItem("userType") == "Developer"){
                     window.location.href="./developerDashboardNEW.html";
                }
                $('.close').click(); 
                
            }else if(response==2){
                document.getElementById("errorDetails").innerHTML= "Lead already exist";
            }else{
                alert("Server Error");
            }
        }
    });
    }
}



// Update Lead
function updateLeadsAsCaller(){
    var name = document.getElementById("edit_name").value;
    var mobile = document.getElementById("edit_mobile").value;
    var alternate_mobile = document.getElementById("edit_alternate_mobile").value;
    var whatsapp = document.getElementById("edit_whatsapp").value;
    var email = document.getElementById("edit_email").value;
    var interested_in = document.getElementById("edit_interested_in").value;
    var source = document.getElementById("edit_source").value;
    var status = document.getElementById("edit_status").value;
    var state = document.getElementById("edit_state").value;
    var city = document.getElementById("edit_district").value;
    var caller_id = localStorage.getItem("userID");
    var caller = localStorage.getItem("userName");
    var id = localStorage.getItem("lead_id");
    
    if(name == '' || mobile == ''){
        document.getElementById("errorDetails").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetails").innerHTML= "";
      $('.loader').show();
        $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation: "007",id:id,name:name,mobile:mobile,alternate_mobile:alternate_mobile,whatsapp:whatsapp,email:email,interested_in:interested_in,source:source,status:status,caller_id:caller_id,caller:caller,state:state,city:city},
        success : function (response){
      $('.loader').hide();
            if(response==1){
                localStorage.removeItem("lead_id");
                $('.close').click(); 
                if(localStorage.getItem("userType") == "Admin"){
                    allLeads();
                }else if(localStorage.getItem("userType") == "Caller"){
                    myLeads();
                }else if(localStorage.getItem("userType") == "Developer"){
                    myLeads();
                }
            }else if(response==2){
                document.getElementById("editErrorDetails").innerHTML= "Lead already exist";
            }else{
                localStorage.removeItem("lead_id");
                alert("Server Error");
            }
        }
    });
    }
}

// Show All Leads for Callers
function allLeadsCallers(){
      $('.loader').show();
    $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation : "004"},
        success : function (response){
      $('.loader').hide();
            var partialArranged = response.split("<END>");
            var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(part[8]=="New"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white">'+part[8]+'</td><td>'+part[9]+'</td><td><br><button data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Converted"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white">'+part[8]+'</td><td>'+part[9]+'</td><td><br><button data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Proposail Mailed"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black">'+part[8]+'</td><td>'+part[9]+'</td><td><br><button data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Pending"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white">'+part[8]+'</td><td>'+part[9]+'</td><td><br><button data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                 }else{
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><br><button data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                 }
                
                
            }
            content += '</tbody></table></div>';
            document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>"+content;
            $("#table1").DataTable( {   "order": [[ 0, "desc" ]],stateSave: true});  
        }
        
    });
}

// Show My Leads
function allLeadsOnDateCaller(date){
      $('.loader').show();
   
    $.ajax({
                    url : "https://teamka.in/crm1/APIs/api_venkat.php",
                    data : {operation : "014",date:date},
                    success : function (response){
      $('.loader').hide();
                        var partialArranged = response.split("<END>");
                        var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
                        var totalUpdates = partialArranged.length - 1;
            
                        for (let index = 1; index <= totalUpdates; index++) {
                            var element = partialArranged[index-1];
                            var part = element.split("<-->");
                            if(parseInt(localStorage.getItem("userID")) == parseInt(part[11])){
                                  
                                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                            
                            }
                        }
                        content += '</tbody></table></div>';
                        document.getElementById("displayContent").innerHTML = "<h1>&#x2706; To be Contacted </h1><div style='overflow-x:scroll;'>"+content;
                        $("#table1").DataTable( {   "order": [[ 0, "desc" ]] ,stateSave: true  });  
                    }
                    
                });
}



// Get Date for Caller
function getDateCaller(){
    var date = document.getElementById("contactDate").value;
    if(date == ''){
        document.getElementById("errorDetailsDate").innerHTML= "Fill the Form Correctly";
    }else{
        document.getElementById("errorDetailsDate").innerHTML= "";
        document.getElementById("contactDate").value = "";
        $('.close').click(); 
        allLeadsOnDateCaller(date);
        
    }
}










// New Part


function fillProjectDetailsForm(){
      $('.loader').show();
    
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"016"},
        success: function(response){
      $('.loader').hide();

            var partialData = response.split("/END/");
            var content = "<option></option>";
            for(let i=0;i<(partialData.length - 1);i++){
                var element = partialData[i];
                var data = element.split("<-->");
                content += "<option value='"+parseInt(data[0])+"' id='option"+parseInt(data[0])+"'>"+data[1]+"</option>"
            }
            if(localStorage.getItem("userType")=="Admin"){
                document.getElementById("leadsA").innerHTML = content;
            }
            document.getElementById("edit_leadsA").innerHTML = content;
           
        }

    });
}


function fillProjectDetailsFormCaller(){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"016"},
        success: function(response){
           // alert(response);
      $('.loader').hide();

            var partialData = response.split("/END/");
            var content = "<option></option>";
            for(let i=0;i<(partialData.length - 1);i++){
                
                    var element = partialData[i];
                    var data = element.split("<-->");
                if(parseInt(data[2])==localStorage.getItem("userID")){
                    content += "<option value='"+parseInt(data[0])+"' id='option"+parseInt(data[0])+"'>"+data[1]+"</option>"    
                }
            }
            //console.log(content);
            document.getElementById("leadsA").innerHTML = content;
            document.getElementById("edit_leadsA").innerHTML = content;
        }

    });
}




function getDevelopers(){
     if(localStorage.getItem("userType")=="Admin"){
                document.getElementById("developerA").innerHTML = "";
            }
            if(localStorage.getItem("userType")!="Developer"){
               document.getElementById("edit_developerA").innerHTML = "";
            }
            var content = ""; 
      $('.loader').show();
            
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data:{operation:"018"},
        success: function(response){
      $('.loader').hide();
            var partialData = response.split("/END/");
            for(let i=0;i<(partialData.length - 1);i++){
                var element = partialData[i];
                var data = element.split("<-->");
                content += "<option value='"+parseInt(data[0])+"'>"+data[1]+"</option>"
            }
           // console.log(content);
        
                document.getElementById("developerA").innerHTML = content;
            if(localStorage.getItem("userType")!="Developer"){
               document.getElementById("edit_developerA").innerHTML = content;
            }
            
        }
    });
}

// Set Details To Add Project Details Form 
function setDetails(){

    var id = document.getElementById("leadsA").value;
    if(id == ''){
        id = document.getElementById("edit_leadsA").value;
    }
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"017",id:id},
        success: function(response){
      $('.loader').hide();
            var data = response.split("<-->");
            document.getElementById("callerA").innerHTML = "<option value='"+parseInt(data[3])+"' selected>"+data[0]+"</option>";
            document.getElementById("edit_callerA").innerHTML =  "<option value='"+parseInt(data[3])+"' selected>"+data[0]+"</option>";
            document.getElementById("projectTypeA").value = data[1];
            document.getElementById("edit_projectTypeA").value = data[1];
            document.getElementById("cityA").value = data[2];
            document.getElementById("edit_cityA").value = data[2];
        }
    });
    

}


// Add Project Details 
function addProjectDetails(){
    var lead = document.getElementById("leadsA").value;
    var caller = document.getElementById("callerA").value;
    var developer = document.getElementById("developerA").value;
    var projectName = document.getElementById("projectNameA").value;
    var projectType = document.getElementById("projectTypeA").value;
    var city = document.getElementById("cityA").value;
    var address = document.getElementById("addressA").value;
    var pincode = document.getElementById("PINCODE").value;
    var remarks = document.getElementById("remarksA").value;

    if(lead == '' || caller == ''||developer == ''||projectName == ''|| projectType == ''||address ==''||pincode==''){
        document.getElementById("errorDetailsAddProject").innerHTML = "Fill the Form Correctly";
    }else{
      $('.loader').show();
        $.ajax({
            url: "https://teamka.in/crm1/APIs/api_venkat.php",
            data: {operation:"019",lead:lead,caller:caller,developer:developer,projectName:projectName,projectType:projectType,address:address,pincode:pincode,city:city,remarks:remarks},
            success: function(response){
      $('.loader').hide();
                if(response==1){
                    alert("Project Details Entered");
                    if(localStorage.getItem("userType")=="Admin")
                        window.location.href="./dashboardNEW.html";
                    else if(localStorage.getItem("userType")=="Caller")
                        window.location.href="./callerDashboardNEW.html";
                    else if(localStorage.getItem("userType")=="Developer")
                        window.location.href="./developerDashboardNEW.html";
                }else if(response==3){
                    document.getElementById("errorDetailsAddProject").innerHTML = "Project Details Already Filled";
                }else{
                    alert(response);
                }
            }
        });
    }
}


// Get Project Details
function getProjectDetails(){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"020"},
        success: function(response){
      
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(part[14]=="No dues"){
                     content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal5" onclick="getAllProjectStatusSupport('+part[17]+')">Status</button></td></td></tr>'; 
                }else if(part[14]=="No payment details"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal5" onclick="getAllProjectStatusSupport('+part[17]+')">Status</button></td></td></tr>'; 
                }else{
                     content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal5" onclick="getAllProjectStatusSupport('+part[17]+')">Status</button></td></td></tr>'; 
                }
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 7, "desc" ]] , stateSave: true  });  
    },
    async:false
    });
    $('.loader').hide();
}


function fullDetails(id){
      $('.loader').show();
    
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"026",id:id},
        success: function(response){
      $('.loader').hide();
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjectsFullDetails" class="table table-bordered table-striped"><thead><th>Full Address:</th><th>State:</th><th>PinCode:</th><th>Remarks:</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'</td><td>'+part[2]+'</td><td>'+part[3]+'</td></tr>' 
            }
            document.getElementById("fullProjectDetails").innerHTML = "<div style='overflow-x:scroll;'>"+content+"</tbody></table>";
    }
    });
    
}

function fillUpdateProjectStatus(id){
    addStatusTitle(id);
    getProjectStatus(id);
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"027",id,id},
        success: function(response){
      $('.loader').hide();
            var data = response.split("<-->");
             document.getElementById("projectLead").value = parseInt(data[0]);
             document.getElementById("projectStatusID").value = id;
             document.getElementById("projectCaller").value = parseInt(data[1]);
        }
    });
}



function addStatusTitle(id){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"045",id:id},
        success: function(response){
            $('.loader').hide();
            var data = response.split("<-->");
            document.getElementById("statusTitle").innerHTML = "STATUS "+data[0]+"("+data[1]+")";
        }
    });
}


function addNewProjectStatus(){
     var leadID = document.getElementById("projectLead").value;
     var projectID = document.getElementById("projectStatusID").value;
     var callerID = document.getElementById("projectCaller").value;
     var summary = document.getElementById("projectSummaryNote").value;
     var remark = document.getElementById("projectStatusRemark").value;
     var updateBy = localStorage.getItem("userID");
     if(summary == ""||remark == ""){
         document.getElementById("errorProjectDetailsStatus").innerHTML = "Fill the Form Correctly";
     }else{
      $('.loader').show();
         $.ajax({
             url: "https://teamka.in/crm1/APIs/api_venkat.php",
             data: {operation:"028",leadID:leadID,projectID:projectID,callerID:callerID,summary:summary,remark:remark,updateBy:updateBy},
             success: function(response){
      $('.loader').hide();
                 if(response == 1){
                     alert("Status Uploaded");
                     getProjectStatus(projectID);
                     if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
                     document.getElementById("projectSummaryNote").value ="";
                     document.getElementById("projectStatusRemark").value ="";
                 }else{
                     alert("Server Error");
                 }
             }
         });
     }
}


function getProjectStatus(id){
     var content = '<table id="tableProjectStatus" class="table table-bordered table-striped"><thead><th>Summary</th><th>Remarks</th><th>Updated By</th><th>DOR</th></thead><tbody>';
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"029",id:id},
        success: function(response){
      $('.loader').hide();
            partialElement = response.split("/END/");
            total = partialElement.length - 1;
            for(let i=0;i<total;i++){
               var data = partialElement[i].split("<-->");
               content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td>"+data[2]+"</td><td>"+data[3]+"</td></tr>" 
            }
            document.getElementById("allProjectStatus").innerHTML = content;
            
        }
    });
}


function fillUpdateProjectForm(id){
    
    fillProjectDetailsForm();
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"021",id:id},
        success: function (response){
      $('.loader').hide();
            var part = response.split("<-->");
            // var x = "option"+ part[0].split(" ");
            // alert(x);
            // document.getElementById(x).selected = "true";
            
            document.getElementById("projectID").value = part[10];
            document.getElementById("leadID").value = part[9];
            document.getElementById("edit_leadsA").value = part[0];
            if(localStorage.getItem("userType")=="Developer"){
             getCallers();
            }
            document.getElementById("edit_callerA").value = parseInt(part[11]);
            if(localStorage.getItem("userType")!="Developer"){
                console.log(part[2]);
                document.getElementById("edit_developerA").value = parseInt(part[2]);
            }
            // $("#edit_developerA").val(part[2]);
            document.getElementById("edit_projectNameA").value = part[3];
            document.getElementById("edit_projectTypeA").value = part[4];
            document.getElementById("edit_cityA").value = part[5];
            document.getElementById("edit_addressA").value = part[6];
            document.getElementById("edit_PINCODE").value = part[7];
            document.getElementById("edit_remarksA").value = part[8];
            // setDetails();
            
        }
    });
}

function updateProjectDetails(){
    var id = document.getElementById("projectID").value;
    var lead = document.getElementById("leadID").value;
    var caller = document.getElementById("edit_callerA").value;
    var developer = document.getElementById("edit_developerA").value;
    var projectName = document.getElementById("edit_projectNameA").value;
    var projectType = document.getElementById("edit_projectTypeA").value;
    var city = document.getElementById("edit_cityA").value;
    var address = document.getElementById("edit_addressA").value;
    var pincode = document.getElementById("edit_PINCODE").value;
    var remarks = document.getElementById("edit_remarksA").value;
    
    if(lead ==""||caller ==""||developer ==""||projectName ==""||projectType ==""||address ==""||pincode ==""){
        document.getElementById("editErrorProjectDetails").innerHTML = "Fill Form Correctly";
    }else{
      $('.loader').show();
        $.ajax({
            url:"https://teamka.in/crm1/APIs/api_venkat.php",
            data:{operation:"022",id:id,lead:lead,caller:caller,developer:developer,projectName:projectName,projectType:projectType,address:address,pincode:pincode,city:city,remarks:remarks},
            success: function (response){
      $('.loader').hide();
                if(response==1){
                    alert("Project Details Updated");
                    $('.close').click(); 
                if(localStorage.getItem("userType") == "Admin"){
                    getProjectDetails();
                }else if(localStorage.getItem("userType") != "Admin"){
                    getProjectDetailsDeveloper();
                }
                    
                }else{
                    alert(response);
                }
            }
        })
    }
}


// Get Details for Developer 
function getProjectDetailsDeveloper(){
      $('.loader').show();
     $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"020"},
        success: function(response){
      $('.loader').hide();
            var partialArranged = response.split("/END/");
           var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status:</th><th>OPTIONS</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(localStorage.getItem("userID") == parseInt(part[3])||localStorage.getItem("userID") == parseInt(part[12])){
                    if(part[14]=="No payment details"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }else if(part[14]=="No dues"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }else{
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></tr>';
                }
                }
                
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });  
    }
    });
}


// Get Details for Caller 
function getProjectDetailsCaller(){
      $('.loader').show();
     $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"020"},
        success: function(response){
      $('.loader').hide();
            var partialArranged = response.split("/END/");
           var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status:</th><th>OPTIONS</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(localStorage.getItem("userID") == parseInt(part[3])||localStorage.getItem("userID") == parseInt(part[12])){
                    if(part[14]=="No payment details"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                }else if(part[14]=="No dues"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                }else{
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></tr>';
                }
                }
                
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });  
    }
    });
}


// Update project Details by Developer
function updateProjectDetailsDeveloper(){
    var id = document.getElementById("projectID").value;
    var lead = document.getElementById("leadID").value;
    var caller = document.getElementById("edit_callerA").value;
    var developer = localStorage.getItem("userID");
    var projectName = document.getElementById("edit_projectNameA").value;
    var projectType = document.getElementById("edit_projectTypeA").value;
    var city = document.getElementById("edit_cityA").value;
    var address = document.getElementById("edit_addressA").value;
    var pincode = document.getElementById("edit_PINCODE").value;
    var remarks = document.getElementById("edit_remarksA").value;
    
    if(lead ==""||caller ==""||developer ==""||projectName ==""||projectType ==""||address ==""||pincode ==""){
        document.getElementById("editErrorProjectDetails").innerHTML = "Fill Form Correctly";
    }else{
      $('.loader').show();
        $.ajax({
            url:"https://teamka.in/crm1/APIs/api_venkat.php",
            data:{operation:"022",id:id,lead:lead,caller:caller,developer:developer,projectName:projectName,projectType:projectType,address:address,pincode:pincode,city:city,remarks:remarks},
            success: function (response){
      $('.loader').hide();
                if(response==1){
                    alert("Project Details Updated");
                    $('.close').click(); 
                if(localStorage.getItem("userType") == "Admin"){
                    getProjectDetails();
                }else if(localStorage.getItem("userType") == "Developer" || localStorage.getItem("userType") == "Caller"){
                    getProjectDetailsDeveloper();
                }
                    
                }else{
                    alert("Server Error");
                }
            }
        })
    }
}


// function fillUpdateProjectStatus(id){
//     getProjectStatus(id);
//       $('.loader').show();
//     $.ajax({
//         url: "https://teamka.in/crm1/APIs/api_venkat.php",
//         data: {operation:"027",id,id},
//         success: function(response){
//       $('.loader').hide();
//             var data = response.split("<-->");
//              document.getElementById("projectLead").value = parseInt(data[0]);
//              document.getElementById("projectStatusID").value = id;
//              document.getElementById("projectCaller").value = parseInt(data[1]);
//         }
//     });
// }


function sendMail(id){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"023",id:id},
        success: function(response){
      $('.loader').hide();
            if(response == 0){
                alert("Email Not Provided");
            }else if(response==2){
                alert("Server Error");
            }else{
                afterMail(id);
                var data = response.split("<-->"); 
                if(parseInt(data[4]) == parseInt(2)){
                    serviceAppMail(data[0],data[1]);
                }else{
                    mailSend(data[0],data[1],data[2],data[3]);//replace 2nd parameter by data[1]
                }
            }
        }
    });
}


function serviceAppMail(client,to){

    var subject = "Service App Proposal From Kalam Academy";
    var message = "Hi "+client+","+"<p><br></p><p>We are pleased to inform you that after helping 400+ small scale businessmen to take there Grocery Business Online.</p><p>As discussed over the phone now we have launched our Service Application to bring servicemen and customer under one roof.</p><p>After running Grocery Application across India, Saudi Arabia, Dubai, Pakistan &amp; Australia. With the experience of 4+ years, we are ready to help you again with our Service Application.</p><p>I have attached the Updated PDF of our quotation &amp; services. Please go through this.</p><p>Here is the list of things that are included in the package -</p><p><br></p><ul><li> Service Mobile Application Package Rs &nbsp;18000/-</li><li>Application designing as in the Kalam Service app.</li><li>Application development as in the Kalam Service app.</li><li>Google Play Store publishing($25 paid to google).</li><li>Hosting and server for one year.</li><li>Maintenance for one year.</li><li>Multiple catalog upload.</li><li>Cash on the delivery payment method (COD).</li><li>Multiple banners to advertise.</li><li>Customer application.</li><li>Advance admin panel.</li><li>Automatic billing system.</li><li>Catalog image free.</li><li>Now you can change the password of your admin panel.</li></ul><p><br></p><p>One Time Payment Offer</p><p>1. 5% discount&nbsp;</p><p>2. Payment gateway free worth Rs 2000/-</p><p><br></p><p>CUSTOMISATION OR ADD-ON FEATURE WILL BE BILLED SEPARATELY</p><p>This is very unique low investment high return business opportunity. You can fill the form below and process the payment if you are interested.</p><p><br></p><p>Form Link</p><p><a href='https://docs.google.com/forms/d/e/1FAIpQLScKXVYz0FzwLBAFZGwxgjFHc_MlrHDpWz7x1bgVRkcijnF2rg/viewform'>https://docs.google.com/forms/d/e/1FAIpQLScKXVYz0FzwLBAFZGwxgjFHc_MlrHDpWz7x1bgVRkcijnF2rg/viewform</a></p><p><br></p><p>This is the bank account of our company. You may make payment here.</p><p>GreenTech India</p><p>481520110000299</p><p>BKID0004815</p><p>Bank of India</p><p><br></p><p>This is our google pay &amp; phonepe number (8092805068) , &nbsp;you may also make payment through it.&nbsp;</p><p><br></p><p><p>Feel free to reach us for any help at 8235529341</p><p><br></p><p>Firdaush</p><p>Marketing Head at Kalam Academy</p><p>Kalam Academy</p><br><br>Download Proposal Here :<a href=`https://drive.google.com/file/d/1iNHUtT0XcRxYEM6xxBr9A2IndGLfKnw1/view?usp=sharing`>Download here</a><br><br>Regards<br><font color='red'><b>We never ask you to pay in any individual account Only pay in <i><u>GreenTech India</u></i> account (A/C: 481520110000299 | IFSC: BKID0004815 GooglePay & Phone/Pay Number: 8092805068) </b></font>";
   // console.log(message);
      $('.loader').show();
    $.ajax({
        type : 'post',
        url: "https://kalamacademy.org/test/test.php",
        data: {operation:"00100",to:to,subject:subject,message:message},
        success: function(response){
            
      $('.loader').hide();
             //console.log(response)
      if(response>0){alert("Mail Sent");}
      else{alert("Error In Sending Mail");}
        }
        
    
    });
}



function afterMail(id){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"025",id:id},
        success: function(response){
      $('.loader').hide();
                
            if(response == 1){
                getAllStatus(id);
                if(localStorage.getItem("userType") == "Admin"){
                    allLeads();
                }else if(localStorage.getItem("userType") != "Admin"){
                    myLeads();
                }
                document.getElementById('summary_note').value = "Mail has been sent";
            }else{
                alert("Unexpected Error");
            }
        }
    });
}


function mailSend(client,to,caller,mobile){

    var subject = "Grocery Business Proposal From Kalam Academy";
    var message = "Hi "+client+",<br><br>As discussed over phone we are helping people to start their Grocery business from Last 4 years.<br>Our app is running in more than 300 cities+  in India, Austalia, Bangladesh, Dubai, Pakistan and many more places.<br>I have attached the Updated PDF of our quotation & services. Please go through this.<br>We are providing complete business solutions in just Rs 14000/- even that you can pay in 3 Installments.<br><br><b>First Installment: 6K Must Paid in Advance</b><br><b>Second Installment: 4k Must be paid within 24 hrs of app delivery</b><br><b>Third Installment: Remaining When your application will be live on Google Play Store.</b><br><br><br>We offer a large verity of customization options on our current app at very affordable price.<br>Our terms of payment are in three installments of the total bill.<br>(In case if you buy an application with extra features Then You will have to pay in 40%(Advance) 30%(2nd Installment) 30% (3rd Installment) of total amount.)<br><br>This is very unique low investment high return business opportunity. You can fill the form below and process the payment if you are interested.<br>Form Link: <a href = 'https://docs.google.com/forms/d/e/1FAIpQLScKXVYz0FzwLBAFZGwxgjFHc_MlrHDpWz7x1bgVRkcijnF2rg/viewform'>Click here</a><br><br>This is the bank account of our company. You may make payment here.<br><br>GreenTech India<br>481520110000299<br>BKID0004815<br>Bank of India<br> <p>This is our google pay &amp; phonepe number (8092805068) , &nbsp;you may also make payment through it.&nbsp;</p>   <br>Our prices may increase soon so this is the best time to Start Your Grocery Business. Don't miss the opportunity and start your business from today.<br>Feel Free to Reach me out on Whatsapp or call on  "+mobile+"<br><br>Download Proposal Here :<a href=`https://drive.google.com/file/d/1xw7cojreY8LbVJ6kbI_O2McjleeXCn5a/view`>Download here</a><br><br>Regards<br>"+caller+"<br>"+mobile+"<br><b>Kalam Academy</b><br><font color='red'><b>We never ask you to pay in any individual account Only pay in <i><u>GreenTech India</u></i> account (A/C: 481520110000299 | IFSC: BKID0004815 GooglePay & Phone/Pay Number: 8092805068) </b></font>";
    
      $('.loader').show();
      //console.log(message);
    $.ajax({
        type : 'post',
        url: "https://kalamacademy.org/test/test.php",
        data: {operation:"00100",to:to,subject:subject,message:message},
        success: function(response){
            
      $('.loader').hide();
      console.log(response)
      if(response>0){alert("Mail Sent");}
      else{alert("Error In Sending Mail");}
        }
    
    });
}


function addBillingTitle(id){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"045",id:id},
        success: function(response){
            $('.loader').hide();
            var data = response.split("<-->");
            document.getElementById("billingTitle").innerHTML = "BILLING "+data[0]+"("+data[1]+")";
        }
    });
}



function addPaymentTitle(id){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"045",id:id},
        success: function(response){
            $('.loader').hide();
            var data = response.split("<-->");
            document.getElementById("paymentTitle").innerHTML = "PAYMENT "+data[0]+"("+data[1]+")";
        }
    });
}


function getProjectBilling(id){
    localStorage.setItem("Billing_PD_ID",id);
    addBillingTitle(id);
    checkDiscountPayment(id);
    document.getElementById("projectIDBilling").value = id;
    var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Addon Name</th><th>Addon Price</th><th>DOR:</th><th>DELETE</th></thead><tbody>'; 
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"031",id:id},
        success: function(response){
      $('.loader').hide();
            var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var amount = partial[totalElement];
            for(let index=0;index<totalElement;index++){
                var data = partial[index].split("<-->");
                var addon = getAddonName(data[0]);
                content += "<tr><td>"+addon+"</td><td>"+data[1]+"</td><td>"+data[2]+"</td><td><button onclick='deleteProjectBilling("+data[3]+","+data[4]+")'>REMOVE</button></td></tr>";
            }
            document.getElementById("allProjectBilling").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>"+amount+"</div><br><button onclick='billingMail("+id+")' >SEND BILL</button>&nbsp<button type='button' onclick='manualMail("+id+")'>MANUAL MAIL</button>";
        }
    });
}

function getAddonName(code){
             
 
      
if(parseInt(code) == parseInt("000")){
            return "Grocery App" ;
        }else if(parseInt(code) == parseInt("001")){
            return "Product Image FREE" ;
        }else if(parseInt(code) == parseInt("002")){
            return "Payment Gateway(Razorpay) Rs 2000/- " ;
        }else if(parseInt(code) == parseInt("003")){
            return "Logo (Advance) Rs 1000/-" ;
        }else if(parseInt(code) == parseInt("004")){
            return "Logo (Normal) FREE" ;
        }else if(parseInt(code) == parseInt("005")){
            return "SMS Notification** FREE integration" ;
        }else if(parseInt(code) == parseInt("006")){
            return "Simple Location Tracking as Rs 3000/-" ;
        }else if(parseInt(code) == parseInt("007")){
            return "Delivery Boy Admin Panel (NORMAL) FREE" ;
        }else if(parseInt(code) == parseInt("008")){
            return "Delivery Boy Admin Panel Rs 4000/-" ;
        }else if(parseInt(code) == parseInt("009")){
            return "Play store publishing on our Google account FREE" ;
        }else if(parseInt(code) == parseInt("010")){
            return "Play store publishing on personal Google account $25+$15" ;
        }else if(parseInt(code) == parseInt("011")){
            return "Automatic bill generation FREE" ;
        }else if(parseInt(code) == parseInt("012")){
            return "wallet Rs 5000/-" ;
        }else if(parseInt(code) == parseInt("013")){
            return "Coupon code Rs 3000/-" ;
        }else if(parseInt(code) == parseInt("014")){
            return "Ios publishing $100/year + $50" ;
        }else if(parseInt(code) == parseInt("015")){
            return "GPS tracking Rs 20000 + google fee" ;
        }else if(parseInt(code) == parseInt("016")){
            return "Interface Rs 13000/- " ;
        }else if(parseInt(code) == parseInt("017")){
            return "OTP Rs 3000/- " ;
        }else if(parseInt(code) == parseInt("018")){
            return "Export to Excel 1500/- " ;
        }else if(parseInt(code) == parseInt("019")){
            return "Share my app 1000/- " ;
        }else if(parseInt(code) == parseInt("020")){
            return "One page Website 5000/- " ;
        }else if(parseInt(code) == parseInt("021")){
            return "Sub Category 3000/-  " ;
        }else if(parseInt(code) == parseInt("022")){
            return "Push Notification 3000/- " ;
        }else if(parseInt(code) == parseInt("023")){
            return "Analytical Graph 3000/- " ;
        }else if(parseInt(code) == parseInt("024")){
            return "Application upgrade 6000/- " ;
        }else if(parseInt(code) == parseInt("025")){
            return "Refer and earn 8000/- " ;
        }else if(parseInt(code) == parseInt("026")){
            return "Renewal 8000/- " ;
        }else if(parseInt(code) == parseInt("027")){
            return "Service App" ;
        }else{
            return code;
        }

}


function deleteProjectBilling(id,projectId){
    if(confirm("Remove Addon?")){
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"032",id:id},
        success: function(response){
      $('.loader').hide();
            if(response==1){
                alert("Addon Removed");
                getProjectBilling(projectId);
                if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
            }else{
                alert("Server Error");
            }
        }
    });  
        
    }  
}



function addProjectBilling(){
var projectIDBilling = document.getElementById("projectIDBilling").value;
var Billing_PD_ID = localStorage.getItem("Billing_PD_ID");
if(projectIDBilling == Billing_PD_ID){

var addon = document.getElementById("projectBillingAddon").value;
var cost = 0;
    switch(addon){
        case "000":
            cost=14000;
            break;
        case "001":
            cost=0;
            break;
        case "002":
            cost=2000;
            break;
        case "003":
            cost=1000;
            break;
        case "004":
            cost=0;
            break;
        case "005":
            cost=0;
            break;
        case "006":
            cost=3000;
            break;
        case "007":
            cost=0;
            break;
        case "008":
            cost=4000;
            break;
        case "009":
            cost=0;
            break;
        case "010":
            cost=3050;
            break;
        case "011":
            cost=0;
            break;
        case "012":
            cost=5000;
            break;
        case "013":
            cost=3000;
            break;
        case "014":
            cost=11410;
            break;
        case "015":
            cost=20000;
            break;
        case "016":
            cost=13000;
            break;
        case "017":
            cost=3000;
            break;
        case "018":
            cost=1500;
            break;
        case "019":
            cost=1000;
            break;
        case "020":
            cost=5000;
            break;
        case "021":
            cost=3000;
            break;
        case "022":
            cost=3000;
            break;
        case "023":
            cost=3000;
            break;
        case "024":
            cost=6000;
            break;
        case "025":
            cost=8000;
            break;
        case "026":
            cost=8000;
            break;
        case "027":
            cost=14000;
            break;
        default:
            cost=0;
            break;
    }
    addonCustomName = document.getElementById("AddonName").value;
    addonCustomCost = document.getElementById("AddonAmount").value;
    if(addonCustomName != "" && addonCustomCost != ""){
        addon = addonCustomName;
        cost = addonCustomCost;
      $('.loader').show();
        console.log(addon);
         $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"030",id:projectIDBilling,addon:addon,cost:cost},
        success: function(response){
            console.log(response);
      $('.loader').hide();
            if(parseInt(response) == 1){
                document.getElementById("AddonName").value="";
                document.getElementById("AddonAmount").value="";
                document.getElementById("errorProjectBilling").innerHTML = "";
                alert("Billing Details Uploaded");
                     
                if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
                    getProjectBilling(projectIDBilling);
            }else if(parseInt(response)==2){
                document.getElementById("errorProjectBilling").innerHTML = "Similar details uploaded";
            }else{
                document.getElementById("errorProjectBilling").innerHTML = "";
                console.log(response);
                alert(response);
                alert("Error Occured");
            }
        },
        async:false
    });
    }else if(addonCustomName != "" && addonCustomCost == ""){
        document.getElementById("errorProjectBilling").innerHTML = "Fill Form Correctly";
        
    }else if(addonCustomName == "" && addonCustomCost != ""){
        document.getElementById("errorProjectBilling").innerHTML = "Fill Form Correctly";
        
    }else{
        console.log(addon);
      $('.loader').show();
         $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"030",id:projectIDBilling,addon:addon,cost:cost},
        success: function(response){
                    console.log(response);
      $('.loader').hide();
            if(parseInt(response) == 1){
                document.getElementById("errorProjectBilling").innerHTML = "";
                alert("Billing Details Uploaded");
                getProjectBilling(projectIDBilling);
                     if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
            }else if(parseInt(response)==2){
                document.getElementById("errorProjectBilling").innerHTML = "Similar details uploaded";
            }else{
                document.getElementById("errorProjectBilling").innerHTML = "";
                console.log(response);
                alert(response);
                alert("Error Occured");
            }
        },
        async:false
    });
    }
    
}else{
    alert("Gitch");
}
}


function checkDiscountPayment(id){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"037",id:id},
        success: function(response){
        $('.loader').hide();
        var partial = response.split("/END/");
        var totalElement = partial.length - 1;
        var amount = partial[totalElement];
        if(response == 0){
              document.getElementById("dicountDiv").style.display = "block";
              document.getElementById("ifDiscountAdded").innerHTML = "none";
        }else{
              document.getElementById("dicountDiv").style.display = "block";
        
            //   Changes
            var content = '<h3>Discounts Added</h3><table id="tableProjects" class="table table-bordered table-striped"><thead><th>Remark</th><th>Amount</th><th>DOR:</th></thead><tbody>'; 
        
            for(let index=0;index<totalElement;index++){
                var data = partial[index].split("<-->");
                var addon = getAddonName(data[0]);
                content += "<tr><td>"+addon+"</td><td>"+data[1]+"</td><td>"+data[2]+"</td></tr>";
            }
            
               document.getElementById("ifDiscountAdded").innerHTML = content + "</tbody></table>";
            // Changes End
            }
        }
    });
}

function removeDiscount(id){
      $('.loader').show();
   $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"038",id:id},
        success: function(response){
      $('.loader').hide();
            if(response==1){
                alert("Discount Removed");
              document.getElementById("ifDiscountAdded").innerHTML ="";
              document.getElementById("dicountDiv").style.display = "block";
              getProjectBilling(id);
              getProjectDetails();
            }else{
                alert("Server Error");
            }
            
        }
   });
}

function addProjectDiscount(){
    var id = document.getElementById("projectIDBilling").value;
    var discount = document.getElementById("discountAmount").value;
    var remark = document.getElementById("discountRemark").value;
    
      if(discount == ""){
          document.getElementById("errorProjectDiscount").innerHTML = "Enter Amount to Add";
      }else{
      $('.loader').show();
          $.ajax({
              url: "https://teamka.in/crm1/APIs/api_venkat.php",
              data: {operation:"036",id:id,discount:discount,remark:remark},
              success: function(response){
                  $('.loader').hide();
                  if(response == 1){
                      alert("Discount Added");
                        document.getElementById("discountAmount").value = "";
                       getProjectBilling(id);
                       getProjectDetails();
                  }else if(response==0){
                      alert("Server Error");
                  }else{
                      alert("Unxepected Error check console");
                      console.log(response);
                      alert(response);
                  }
              }
          });
      }
}

function manualMail(id){
     $('.close').click(); 
      $('.loader').show();
    $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation : "040",id:id},
        success: function (response){
      $('.loader').hide();
            var today = new Date();
            var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
             var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var restPart = partial[totalElement];
            var amount = restPart.split("<-->")[0];
            var discount = restPart.split("<-->")[1];
            var name = restPart.split("<-->")[2];
            var email = restPart.split("<-->")[3];
            var caller = restPart.split("<-->")[4];
            var contact = restPart.split("<-->")[5];
            var userCall = restPart.split("<-->")[6];
            var userId = restPart.split("<-->")[7];
            var paid = restPart.split("<-->")[8];
            var dues = restPart.split("<-->")[9];
            var projectName = restPart.split("<-->")[10];
            
            var content = "Hi "+name+"<br>Thanks to be part of <b>Kalam Academy</b>. We respect your time and money. You are our valuable customer. <br>Here is the final bill of services you availed.<br><br>"; 
            content += '<table style=" border: 1px solid black;padding:10px;border-spacing: 0px;" ><thead><tr><th colspan="4"><center><h1>Kalam Academy</h1></center></th></tr><tr><th colspan="2" style=" border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;">Date : '+date+'<br>Customer ID: '+userId+'<br>Product: '+projectName+'('+id+')<br>'+name+'<br>'+userCall+' | '+email+'</th><th colspan="2" style=" border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;">Kalam Academy <br>Rospa Tower<br>4th Floor<br>Main Road<br>Ranchi-834001</th></tr><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">S/N</th><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">Addon Name</th><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">Addon Price</th><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">Total</th></thead><tbody>'; 
            if(email == ""){
                alert("Mail Not Provided");
            }else{
                var noDisc = 0;
                for(let index=0;index<totalElement;index++){
                     var data = partial[index].split("<-->");
                    var addon = getAddonName(data[0]);
                    noDisc = noDisc + parseInt(data[1]);
                    content += "<tr><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>"+(index+1)+"</td><td style='text-align:left;border: 1px solid black;padding:10px;border-spacing: 0px;'>"+addon+"</td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>"+data[1]+"</td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>"+data[1]+"</td></tr>";
                }
              content += "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Total : "+noDisc+"</td></tr>";
            content += "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Discount : "+discount+"</td></tr>";
            content += "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Net : "+amount+"</td></tr>";
            content += "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Paid : "+paid+"</td></tr>";
            content += "<tr><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Dues : "+dues+"</td></tr>";

                content =  content+"<tr><th style=' border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3><a href='https://www.kalamacademy.org/terms-of-service/' target='_blank'>Terms & Condition</a> / <a href='https://www.kalamacademy.org/privacy-policy/' target='_blank'>Privacy Policy</a></h3></center></th></tr>";
                content =  content+"<tr><th style=' border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3>Thanks For Your Bill</h3></center></th></tr>";
                content =  content+"</tbody></table><br><br>Feel free to reach us out for any help.<br><br>Regards<br>"+caller+"<br>"+contact+"<br><b>Kalam Academy</b>";
                 var printContents = content;
                 var originalContents = document.body.innerHTML;
                 document.body.innerHTML = printContents;
                 document.title = projectName+"_Billing";
                 window.print();
                 window.location.reload();
                document.getElementById("mailCode").innerHTML = content;
            }
             
        }
    });
}  
 



function billingMail(id){
    $('.loader').show();
    $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation : "040",id:id},
        success: function (response){
      $('.loader').hide();
            var today = new Date();
            var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
             var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var restPart = partial[totalElement];
            var amount = restPart.split("<-->")[0];
            var discount = restPart.split("<-->")[1];
            var name = restPart.split("<-->")[2];
            var email = restPart.split("<-->")[3];
            var caller = restPart.split("<-->")[4];
            var contact = restPart.split("<-->")[5];
            var userCall = restPart.split("<-->")[6];
            var userId = restPart.split("<-->")[7];
            var paid = restPart.split("<-->")[8];
            var dues = restPart.split("<-->")[9];
            var projectName = restPart.split("<-->")[10];
            
                        
            var content = 'Hi '+name+'<br>Thanks to be part of <b>Kalam Academy</b>. We respect your time and money. You are our valuable customer. <br>Here is the final bill of services you availed.<br><br>'; 
            content += "<table style='border: 1px solid black;padding:10px;border-spacing: 0px;'><thead><tr><th colspan='4'><center><h1>Kalam Academy</h1></center></th></tr><tr><th colspan='2' style='border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;'>Date : "+date+"<br>Customer ID: "+userId+"<br>Product: "+projectName+"("+id+")<br>"+name+"<br>"+userCall+" | "+email+"</th><th colspan='2' style='border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;'>Kalam Academy <br>Rospa Tower<br>4th Floor<br>Main Road<br>Ranchi-834001</th></tr><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>S/N</th><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Addon Name</th><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Addon Price</th><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Total</th></thead><tbody>"; 
            if(email == ""){
                alert("Mail Not Provided");
            }else{
                var noDisc = 0;
                for(let index=0;index<totalElement;index++){
                     var data = partial[index].split("<-->");
                    var addon = getAddonName(data[0]);
                    noDisc = noDisc + parseInt(data[1]);
                    content += "<tr><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>"+(index+1)+"</td><td style='text-align:left;border: 1px solid black;padding:10px;border-spacing: 0px;'>"+addon+"</td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>"+data[1]+"</td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>"+data[1]+"</td></tr>";
                }
              content += "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Total : "+noDisc+"</td></tr>";
            content += "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Discount : "+discount+"</td></tr>";
            content += "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Net : "+amount+"</td></tr>";
            content += "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Paid : "+paid+"</td></tr>";
            content += "<tr><td style='border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Dues : "+dues+"</td></tr>";

                content =  content+"<tr><th style='border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3><a href='https://www.kalamacademy.org/terms-of-service/' target='_blank'>Terms & Condition</a> / <a href='https://www.kalamacademy.org/privacy-policy/' target='_blank'>Privacy Policy</a></h3></center></th></tr>";
                content =  content+"<tr><th style='border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3>Thanks For Your Bill</h3></center></th></tr>";
                content =  content+'</tbody></table><br><br>Feel free to reach us out for any help.<br><br>Regards<br>'+caller+'<br>'+contact+'<br><b>Kalam Academy</b>';
                // console.log(content);
                sendBillMail(content,email,projectName); 
                // document.getElementById("displayContent").innerHTML = content;
            }
             
        }
    });
}  
 



// testing start
function sendBillMail(content,email,projectName){
//     $.post('https://kalamacademy.org/test/test.php', {action:'sendBillMail'}).done(function(data){
// 		if(data==1){
// 		    alert('okay');
// 		}else{
// 		    alert('wrong');
// 		}
// 	})
    var subject = projectName + "Invoice From Kalam Academy";
      $('.loader').show();
     $.ajax({
        type : 'post',
        url: "https://kalamacademy.org/test/test.php",
        data: {operation:"00100",subject:subject, to:email, message:content},
        success: function(response){
      $('.loader').hide();
            alert("Mail Sent");
        },
        error: function(){
      $('.loader').hide();
            alert("Server Error. Get the PDF of the bill in Manual Bill");
        }
    
    });
}
// testing end



// Payment Part
function addProjectIDPayment(id){
    getAllProjectPayment(id);
    document.getElementById("projectIDPayment").value = id;
}


function addProjectPayment(){
    
    var id = document.getElementById("projectIDPayment").value;
    var amount = document.getElementById("paymentAmount").value;
    var remarks = document.getElementById("paymentRemark").value;
    var status = document.getElementById("paymentStatus").value;
    var updateBy = parseInt(localStorage.getItem("userID"));
    alert(updateBy);

      var file_data = $('.fileToUpload').prop('files')[0];    //Fetch the file
      var form_data = new FormData();
      
      form_data.append("operation","033");
      form_data.append("id",id);
      form_data.append("file",file_data);
      form_data.append("amount",amount);
      form_data.append("remarks",remarks);
      form_data.append("status",status);
      form_data.append("updateBy",updateBy);
      //Ajax to send file to upload
      if(amount == ""||status == ""){
          document.getElementById("errorProjectPayment").innerHTML = "Fill Form Correctly";
      }else{
      $('.loader').show();
          $.ajax({
              url: "https://teamka.in/crm1/APIs/api_venkat.php",                      //Server api to receive the file
                     type: "POST",
                     dataType: 'script',
                     cache: false,
                     contentType: false,
                     processData: false,
                     data: form_data,
        
                  success:function(response){
      $('.loader').hide();
                      
          document.getElementById("errorProjectPayment").innerHTML = "";
                    if(response ==1){
                        alert("Payment Uploaded");
                        getAllProjectPayment(id);
                        getProjectStatus(projectID);
                     if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
                        document.getElementById("paymentAmount").value = "";
                        document.getElementById("paymentRemark").value = "";
                        document.getElementById("paymentStatus").value = "0";
                        document.getElementById("paymentProof").value = "";
                    }else if(response ==2){
                        alert("Server Error");
                    }else if(response==3){
                          document.getElementById("errorProjectPayment").innerHTML = "File Error";
                    }else{
                        alert("Unexpected Error");
                        console.log(response);
                    }
                  }
            });
      }
    
    
}

function getAllProjectPayment(id){
    
    addPaymentTitle(id);
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data:{operation:"034",id:id},
        success:function(response){
      $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length-1;
            var amount = partial[len];
            var content = "<table class='table table-striped table-bordered'><thead><th>Amount</th><th>Proof</th><th>DOR</th><th>Remarks</th><th>Status</th><th>DELETE</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(parseInt(data[4])==1){
                    var status = "Verified"; 
                }else{
                    if(localStorage.getItem("userType")=="Admin")
                        var status = "Unverified<br><button onclick='verifyPayment("+parseInt(data[5])+","+id+")'>VERIFY</button>";
                    else{
                         var status = "Unverified";
                    }
                }
                content += "<tr><td>Rs."+data[0]+"</td><td><a href='"+data[1]+"' target='_blank'>Check Proof</a></td><td>"+data[3]+"</td><td><b>Updated By: </b>"+data[6]+"<hr>"+data[2]+"</td><td>"+status+"</td><td><button onclick='deletePayment("+parseInt(data[5])+","+id+")'>DELETE</button></td></tr>"
            }
            document.getElementById("allProjectPayment").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>"+amount+"</div>";
        }
    });
     
}

function verifyPayment(id,pd_id){
if(confirm("Verify Payment")){
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data:{operation:"035",id:id},
        success: function(response){
      $('.loader').hide();
            if(response==1){
                alert("Payment Verified");
                getAllProjectPayment(pd_id);
                if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
            }else{
                alert("Server Error");
            }
        }
    });
}
    
}


function deletePayment(id,pd_id){
    alert("Cannot Delete a Payment Info");
    /*
if(confirm("Delete Payment")){
    
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data:{operation:"039",id:id},
        success: function(response){
      $('.loader').hide();
            if(response==1){
                alert("Payment Deleted");
                getAllProjectPayment(pd_id);
                if(localStorage.getItem("userType")!="Admin"){
                         getProjectDetailsDeveloper();
                    }else{
                        getProjectDetails();
                    }
            }else{
                alert("Server Error");
            }
        }
    });
}
 */   
}

function rawDataCheck(){
    var content = "<div class='container'><center><h1>Raw Data Grocery Checked</h1></center><table id='rawDataTableChecked' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th><th>Status</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
                    data: {type:"0007"},
                    success: function(response){
                    $('.loader').hide();
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"
                            
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable'>"+data[2]+"<button class='ml-3' onclick='copyNo("+data[2]+")'>Copy</button></td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTableChecked").DataTable( { stateSave: true  });  
                    }
                });
}

function rawDataServiceCheck(){
    var content = "<div class='container'><center><h1>Raw Data Service</h1><button class='btn btn-secondary' onclick='rawDataServiceCheck()'>Check contact history</button></center><table id='rawDataTableChecked' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th><th>Status</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://softwarezsolution.com/app/KalamServices/admin/api/api_venkat.php",
                    data: {type:"0006"},
                    success: function(response){
                    $('.loader').hide();
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"
                            
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class=''>"+data[2]+"<button class='ml-3' onclick='copyNo("+data[2]+")'>Copy</button></td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTableChecked").DataTable( { stateSave: true  });  
                    }
                });
}

function getGroceryStatus(num,id){
    $('.loader').show();
    num.trim();
     var value = $.ajax({
                    url: "https://teamka.in/crm1/APIs/api_venkat.php",
                    data: {operation:"0058",num:num},
                    async:false
                    // success: function(response){
                    // $('.loader').hide();
                    //     var value = response;
                    //     document.getElementById('"'+id+'"').innerHTML = response;
                    //     value.push(response);
                    //     console.log(response);
                    // }
                }).responseText;
    console.log(value);    
     $('.loader').hide();
    if(value>0){
        return "<b style='color:green'>Lead</b>";
    }else{
        return "<b style='color:red;'>Not Leads</b>"
    }
}


function rawData(){
    var content = "<div class='container'><center><h1>Raw Data Grocery</h1><button class='btn btn-secondary' onclick='rawDataCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
                    data: {type:"0006"},
                    success: function(response){
                    $('.loader').hide();
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo("+data[2]+")'>Copy</button></td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}

function maildataGrocery(){
    var content = "<div class='container'><center><h1>Mail Data Grocery</h1><button class='btn btn-secondary' onclick='maildataGroceryCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00102",forq:"Grocery"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>n/a</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}

function maildataGroceryCheck(){
 
     var content = "<div class='container'><center><h1>Mail Data Grocery</h1><button class='btn btn-secondary' onclick='maildataGroceryCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th><th>Lead Status</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00103",forq:"Grocery"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>n/a</td><td>"+getGroceryStatus(data[3],data[0])+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
    
}

function maildataDMCourse(){
    var content = "<div class='container'><center><h1>Mail Data DM Course</h1><button class='btn btn-secondary' onclick='MailDataCheckDMCourse()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00102",forq:"DMCourse"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>n/a</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}

function MailDataCheckDMCourse(){
    var content = "<div class='container'><center><h1>Mail Data DM Course</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th><th>Status</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00102",forq:"DMCourse"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>n/a</td><td>"+getGroceryStatus(data[3],data[0])+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}





function maildataService(){
    var content = "<div class='container'><center><h1>Mail Data Service</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00102",forq:"Service"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>n/a</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}

function MailDataCheckService(){
    var content = "<div class='container'><center><h1>Mail Data Service</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th><th>Status</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00102",forq:"Service"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>n/a</td><td>"+getGroceryStatus(data[3],data[0])+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}


function maildataGroceryCaller(){
    var content = "<div class='container'><center><h1>Mail Data Grocery</h1><button class='btn btn-secondary' onclick='maildataGroceryCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00103",forq:"Grocery"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>"+data[4]+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}


function maildataServiceCaller(){
    //alert("Contact Admin");
    var content = "<div class='container'><center><h1>Mail Data Service</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://kalamacademy.org/test/test.php",
                    data: {operation:"00103",forq:"Service"},
                    success: function(response){
                    $('.loader').hide();
                  
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable' >"+data[3]+"<button class='ml-3' onclick='copyNo("+data[3]+")'>Copy</button></td><td class='unselectable' >"+data[2]+"<button class='ml-3' onclick='copyNo(`"+data[2]+"`)'>Copy</button></td><td>"+data[4]+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
                
}




function rawDataService(){
    var content = "<div class='container'><center><h1>Raw Data Service</h1><button class='btn btn-secondary' onclick='rawDataServiceCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://softwarezsolution.com/app/KalamServices/admin/api/api_venkat.php", 
                    data: {type:"0006"},
                    success: function(response){
                    $('.loader').hide();
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                            
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable'>"+data[2]+"<button class='ml-3' onclick='copyNo("+data[2]+")'>Copy</button></td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
}

function copyNo(no){
    // alert("Copy from here: " + no);
  const el = document.createElement('textarea');
  el.value = no;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert("Copied to clipboard");
}

function shownumber(num,id){
     $('#shwnum'+id).html(num);
}
function rawDataforCaller(){
   // rawData();
    var content = "<div class='container'><center><h1>Raw Data</h1> <button class='btn btn-secondary' onclick='rawDataCheck()'>Check contact history</button> </center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
                    data: {type:"0007"},
                    success: function(response){
                    $('.loader').hide();
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td>"+data[2]+"</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                        }
                        
                        document.getElementById("displayContent").innerHTML= content+"</tbody></table></div>";
                         $("#rawDataTable").DataTable( { stateSave: true  });  
                    }
                });
                
}

function rawDataforCallerService(){
   //alert("Contact Admin");
    rawDataService();
}

function getUnverifiedPayment(){
    $('.loader').show();
    $.ajax({
       url: "https://teamka.in/crm1/APIs/api_venkat.php",
       data: {operation:"041"},
       success: function (response){
            $('.loader').hide();
            console.log(response);
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content= "<table id='tableVerifyPayment' class='mt-5 table table-striped table-bordered'><thead><th>Project Name</th><th>Lead Name</th><th>Amount</th><th>Proof</th><th>Remark</th><th>DOR</th><th>VERIFY</th><th>DELETE</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var element = partial[i].split("<-->");
                var test = element[9];
                if(parseInt(element[8])==0){
                    
                 content += "<tr><td>"+element[2]+"</td><td>"+element[3]+"</td><td>"+element[4]+"</td><td><a href='"+element[5]+"' target='_blank'><b>Cilck here</b></a></td><td><b>Updated By: </b>"+test+"<hr>"+element[6]+"</td><td>"+element[7]+"</td><td><button onclick='unverifiedVerify("+element[0]+")'>VERIFY</button></td><td><button onclick='unverifiedDelete("+element[0]+")'>DELETE</button></td></tr>";
                }else if(parseInt(element[8])==1){
                    
                 content += "<tr><td>"+element[2]+"</td><td>"+element[3]+"</td><td>"+element[4]+"</td><td><a href='"+element[5]+"' target='_blank'><b>Cilck here</b></a></td><td><b>Updated By: </b>"+test+"<hr>"+element[6]+"</td><td>"+element[7]+"</td><td>Verified</td><td><button onclick='unverifiedDelete("+element[0]+")'>DELETE</button></td></tr>";
                }
               }
             document.getElementById("displayContent").innerHTML = "<h1>Payments</h1><div class='container' style='overflow-x:scroll;'>"+content+"</tbody></table></div>";
            $("#tableVerifyPayment").DataTable( { stateSave: true  });  
       }
    });
}
 function unverifiedVerify(id){
     if(confirm("Verify Payment ?")){
     $('.loader').show();
     $.ajax({
         url: "https://teamka.in/crm1/APIs/api_venkat.php",
         data: {operation:"042",id:id},
         success: function(response){
             $('.loader').hide();
             if(response==1){
                 alert("Payment Verified");
                 getUnverifiedPayment();
             }else{
                 alert("Server Error"); 
                 console.log(response);
                 getUnverifiedPayment();
             }
             
         }
     });
     }
 }
 
 function unverifiedDelete(id){
     alert("Button Disabled");
    // if(confirm("Delete Payment ?")){
    //  $('.loader').show();
    //  $.ajax({
    //      url: "https://teamka.in/crm1/APIs/api_venkat.php",
    //      data: {operation:"043",id:id},
    //      success: function(response){
    //          $('.loader').hide();
    //          if(response==1){
    //              alert("Payment Deleted");
    //              getUnverifiedPayment();
    //          }else{
    //              alert("Server Error");
    //              console.log(response);
    //              getUnverifiedPayment();
    //          }
             
    //      }
    //  });
    //  }
 }




function getSearchedLead(){
    var credential = document.getElementById("searchLeadBy").value;
     if(credential.length<3){
         alert("Enter Atleast 3 digit or email or mobile to search");
     }else{
     $('.loader').show();
     var content;
     var x=0; var y=0;
    // srch_sts;
    //$('#srch_sts').html("Searching..");
     $.ajax({
         url: "https://teamka.in/crm1/APIs/api_venkat.php",
         data: {operation:"044",credential:credential},
         success: function(response){
     $('.loader').hide();
     console.log(response);
      var partialArranged = response.split("<END>");
             content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;  
            
            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                // if(parseInt(part[13])==parseInt(localStorage.getItem("userID"))){
                // content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                // }else{
                 x=1;
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal5" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                // }
            }
            content += '</tbody></table></div><br>';
            document.getElementById("displayContent").innerHTML = "<h1>Search Results</h1><div style='overflow-x:scroll;'>"+content;
            $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });  
         }
     });
     
     
     
    var content1 = "<div class='container'><center><h1>Raw Data Grocery Search Result</h1></center><table id='rawDataTableChecked' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
      $('.loader').show();
     $.ajax({
                    type: "POST",
                    url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
                    data: {type:"0008",credential:credential},
                    success: function(response){
                    $('.loader').hide();
                        var element = JSON.parse(response);
                        for(let i = 0;i<element.length;i++){
                            var data = element[i];
                            // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"
                            y=1; //found in raw data
                            content1 += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td class='unselectable'>"+data[2]+"<button class='ml-3' onclick='copyNo("+data[2]+")'>Copy</button></td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                        }
                        
                       // document.getElementById("displayContent").outerHTML= content1+"</tbody></table></div>";
                       
                       var d1 = document.getElementById('displayContent');
                        d1.insertAdjacentHTML('beforeend', content1+"</tbody></table></div>");

                         $("#rawDataTableChecked").DataTable( { stateSave: true  });  
                     //    close_btn_srch
                        $('#close_btn_srch').click();
                    }
                });
       //document.getElementById("displayContent").innerHTML= content1+"</tbody></table></div>";
     //$("#rawDataTableChecked").DataTable( { stateSave: true  });  
       //  $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  }); 
     
    
     
     }
   
   /*  console.log(x);
     console.log(y);
      if(x>0 && y>0){
             $('#srch_sts').html("Found in Raw Data & All Leads");

     }else if(x==0 && y>0){
          $('#srch_sts').html("Not found in Leads Found in Raw data");

     }else if(y==0 && x>0){
          $('#srch_sts').html("Not found in raw data Found in Leads");
     }else if(x==0 && y==0){
          $('#srch_sts').html("Not found");
     }
     */
    
}


function projectRenewals(){
     var today = new Date();
     var year = today.getFullYear();
     var month = (today.getMonth()+1);
     $('.loader').show();
     $.ajax({
      url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"056"},
        success: function(response){
      $('.loader').hide();
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                var dor = part[10];
                var monthReal = parseInt(dor.split("-")[1]);
                var yearReal = parseInt(dor.split("-")[0]);
                if(((parseInt(year) == yearReal+1) && (monthReal <= parseInt(month)))||yearReal+1 < (parseInt(year))){
                        
                        if(part[14]=="No dues"){
                             content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button onclick="renewalMail('+part[0]+')">REQUEST RENEWAL</button></td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                        }else if(part[14]=="No payment details"){
                            content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button onclick="renewalMail('+part[0]+')">REQUEST RENEWAL</button></td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                        }else{
                             content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button onclick="renewalMail('+part[0]+')">REQUEST RENEWAL</button></td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                        }
                }
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>Renewal Required</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table><div class='container mt-5' id='renewedList'></div>";
            $("#tableProjects").DataTable( {   "order": [[ 7, "desc" ]] , stateSave: true  });  
            renewedList();
    }
    });
     
     
}

function renewalMail(id){
            var today = new Date();
            var yyyy = today.getFullYear();
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"057",id:id},
        success: function(response){
      $('.loader').hide();
            if(response == 0){
                alert("Email Not Provided");
            }else if(response==2){
                alert("Server Error");
            }else{
                var data = response.split("<-->"); 
                var expiry = data[5].split(",")[0];
                expiry += ", "+yyyy;
                
                var message = "Hi "+data[1]+",<br><b>Customer ID: "+data[3]+"</b><br><br>Your Project <b>"+data[2]+"</b> with Project ID: "+data[4]+" Dated: "+data[5]+" is up for Renewal. Please pay the remaining dues on or before the expiry date to continue uninterrupted service.<br><b>Expiry Date :"+expiry+"</b><br><br>Regards<br>"+data[6]+"<br>"+data[7]+"<br><b>Kalam Academy</b><br><font color='red'><b>We never ask you to pay in any individual account Only pay in <i><u>GreenTech India</u></i> account (A/C: 481520110000299 | IFSC: BKID0004815 GooglePay & Phone/Pay Number: 8092805068) </b></font>";
                sendRenewalMail(data[0],message);
                
            }
        }
    });
}


function sendRenewalMail(to,message){
    var subject = "Project Renewal Reminder";
   
      $('.loader').show();
    $.ajax({
        type : 'post',
        url: "https://kalamacademy.org/test/test.php",
        data: {operation:"00100",to:to,subject:subject,message:message},
        success: function(response){
            
      $('.loader').hide();
            alert("Mail Sent");
        }
    
    });
}

function renewedList(){
    var today = new Date();
     var year = today.getFullYear();
     var month = (today.getMonth()+1);
     $('.loader').show();
     $.ajax({
      url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"055"},
        success: function(response){
      $('.loader').hide();
             var partialArranged = response.split("/END/");
            var content = '<table id="renewalList" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                var dor = part[10];
                var monthReal = parseInt(dor.split("-")[1]);
                var yearReal = parseInt(dor.split("-")[0]);
                if((parseInt(year) == yearReal+1 && monthReal <= parseInt(month))||(parseInt(year) > yearReal+1)){
                        
                        if(part[14]=="No dues"){
                             content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                        }else if(part[14]=="No payment details"){
                            content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                        }else{
                             content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment('+part[0]+')">Payment</button></td></td></tr>'; 
                        }
                }
               
            }
            document.getElementById("renewedList").innerHTML = "<h1>Renewal Added</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table></div>";
            $("#renewalList").DataTable();  
        }
    });
}


function getStats(){
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;
    var statsFor = document.getElementById("statsFor").value;

     $('.loader').show();
     $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"046",startDate:startDate,endDate:endDate,statsFor:statsFor},
        success: function(response){
             $('.close').click(); 
     $('.loader').hide();
            if(response == "dateError"){
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            }else{
                var element = response.split("<-->");
                var billing = parseInt(element[0]);
                var payment = parseInt(element[1]);
                
                document.getElementById("displayContent").innerHTML = "<h1>STATISTICS</h1><div class='row'><div class='col-6'><h4>Start Date: "+startDate+"</h4></div><div class='col-6'><h4>End Date: "+endDate+"</h4></div></div><hr><div class='row'><div class='col-4'><h3 style='color:red;' >Billing Amount : "+billing+"</h3></div><div class='col-4'><h3 style='color:green;'>Payment Recieved : "+payment+"</h3></div><div class='col-4'><h3 style='color:red;'>Dues : "+(billing - payment)+"</h3></div></div><hr><div class='mt-5 row'><div class='col-lg-12'><div id='statsDisplayGraph1'></div><div id='statsDisplay1'></div></div><div class='col-lg-12'><h1>TEAM STATISTICS</h1><div id='statsDisplayGraph2'></div><div id='statsDisplay2' class='mt-5'></div></div></div> <div class='col-lg-12'><h1>CALL STATISTICS</h1><div id='statsDisplay3' class='mt-5'></div></div>";
                    getBusinessStats(startDate,endDate,statsFor);
                    getConvertedStats(startDate,endDate,statsFor);
                    CheckCallWaiseStatus(startDate,endDate);
                document.getElementById("errorDetailsStats").innerHTML = "";
            }
        }
     });
    
}

function getBusinessStats(startDate,endDate,statsFor){
     $('.loader').show();
     $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"047",startDate:startDate,endDate:endDate,statsFor:statsFor},
        success: function(response){
     $('.loader').hide();
            if(response == "dateError"){
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            }else{
                var content = "<h1>BUSINESS STATISTICS</h1><table id='statsTable1' class='table table-striped table-bordered'><thead><th>Project ID</th><th>User's Name</th><th>Billing</th><th>Payment</th><th>Dues</th><th>Caller Name</th><th>DOR</th><th>Project Type</th></thead><tbody>"
                var element = response.split("/END/");
                var length = element.length -1;
                var s1,s2,ticks;
                for(let i=0;i<length;i++){
                    var data = element[i].split("<-->");
                    
                    content += "<tr><td>"+data[1]+"</td><td>"+data[0]+"</td><td>"+data[2]+"</td><td>"+data[3]+"</td><td>"+data[4]+"</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                    
                }
                document.getElementById("errorDetailsStats").innerHTML = "";
                document.getElementById("statsDisplay1").innerHTML = content + "</tbody></table>";
                 $("#statsTable1").DataTable();
            }
        }
     });
    
}


function getConvertedStats(startDate,endDate,statsFor){
     $('.loader').show();
     $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"048",startDate:startDate,endDate:endDate,statsFor:statsFor},
        success: function(response){
     $('.loader').hide();
            if(response == "dateError"){
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            }else{
                var content = "<table id='statsTable2' class='table table-striped table-bordered'><thead><th>Name</th><th>Converted</th><th>Calls Made</th><th>Not Connected Calls</th><th>Connected Calls</th><th>Calls Duration</th><th>Billing</th><th>Dues</th></thead><tbody>"
                var element = response.split("/END/");
                var length = element.length -1;
                 var s1=[],s2=[],ticks=[];
                for(let i=0;i<length;i++){
                    var data = element[i].split("<-->");
                    s1[i] = parseInt(data[2]);
                    s2[i] = parseInt(data[3]);
                    ticks[i] = data[1];
                    content += "<tr><td>"+data[1]+"</td><td>"+data[2]+"</td><td>"+data[3]+"</td><td>"+data[4]+"</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td>"+data[8]+"</td></tr>";
                    
                    
                }
                console.log(s1);
                console.log(s2);
                console.log(ticks);
                        plot2 = $.jqplot('statsDisplayGraph2', [s1, s2], {
        	animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                renderer:$.jqplot.BarRenderer,
                pointLabels: { show: true }
            },
            legend: {
                show: true,
                location: 'ne',
                labels: ['Converted','Calls'],
                placement: 'inside'
            },      
            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks
                }
            }
        });
     
        $('#statsDisplayGraph2').bind('jqplotDataHighlight', 
            function (ev, seriesIndex, pointIndex, data) {
                $('#info2').html('series: '+seriesIndex+', point: '+pointIndex+', data: '+data);
            }
        );
             
        $('#statsDisplayGraph2').bind('jqplotDataUnhighlight', 
            function (ev) {
                $('#info2').html('Nothing');
            }
        );
                
                document.getElementById("errorDetailsStats").innerHTML = "";
                document.getElementById("statsDisplay2").innerHTML = content + "</tbody></table>";
                $("#statsTable2").DataTable();
            }
        }
     });
    
}


// Notification

function notificationAdmin(){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "049"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<div class='container'><h1>CALLER NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='noBillPaymentNotify'></div><div class='col-xl-6 mt-5' id='withDuesNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                content += "<tr><td>("+data[0]+") "+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[7]+"<br>"+data[8]+"<br>"+data[9]+"</td></tr>";
            }
            content += "</tbody></table></div></div></div>";
             document.getElementById("displayContent").innerHTML = content;
                $("#callerNotification1").DataTable();
            noBillingNotification();
        }
    });
}

function noBillingNotification(){
  $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "050"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >No Billing and Payment</h1></center><table class='table table-striped table-bordered' id='callerNotification2'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                content += "<tr><td>("+data[0]+")"+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[6]+"<br>"+data[7]+"</td></tr>";
            }
            content += "</tbody></table>";
             document.getElementById("noBillPaymentNotify").innerHTML = content;
                $("#callerNotification2").DataTable();
            noDuesNotification();
        }
    });   
}


function noDuesNotification(){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "051"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >Pending Dues</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                content += "<tr><td>("+data[0]+")"+data[1]+"<br>("+data[2]+")<br>Dues: "+data[8]+"</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[6]+"<br>"+data[7]+"</td></tr>";
            }
            content += "</tbody></table>";
             document.getElementById("withDuesNotify").innerHTML = content;
                $("#callerNotification3").DataTable();
        }
    });   
}



// Notification as Caller

function notificationCaller(){
     var caller_id = parseInt(localStorage.getItem("userID"));
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "049"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<div class='container'><h1> NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='noBillPaymentNotify'></div><div class='col-xl-6 mt-5' id='withDuesNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(caller_id == parseInt(data[5]) || caller_id == parseInt(data[6])){
                content += "<tr><td>("+data[0]+") "+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[7]+"<br>"+data[8]+"<br>"+data[9]+"</td></tr>";
                }
            }
            content += "</tbody></table></div></div></div>";
             document.getElementById("displayContent").innerHTML = content;
                $("#callerNotification1").DataTable();
            noBillingNotificationCaller();
        }
    });
}

function noBillingNotificationCaller(){
     var caller_id = parseInt(localStorage.getItem("userID"));
  $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "050"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >No Billing and Payment</h1></center><table class='table table-striped table-bordered' id='callerNotification2'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(caller_id == parseInt(data[5])){
                    content += "<tr><td>("+data[0]+")"+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[6]+"<br>"+data[7]+"</td></tr>";
                }
            }
            content += "</tbody></table>";
             document.getElementById("noBillPaymentNotify").innerHTML = content;
                $("#callerNotification2").DataTable();
            noDuesNotificationCaller();
        }
    });   
}


function noDuesNotificationCaller(){ 
     var caller_id = parseInt(localStorage.getItem("userID"));
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "051"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >Pending Dues</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(caller_id == parseInt(data[5])){
                    content += "<tr><td>("+data[0]+")"+data[1]+"<br>("+data[2]+")<br>Dues : "+data[8]+"</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[6]+"<br>"+data[7]+"</td></tr>";
                }
            }
            content += "</tbody></table>";
             document.getElementById("withDuesNotify").innerHTML = content;
                $("#callerNotification3").DataTable();
        }
    });   
}



// Developer Notification

function notifyDeveloperAdmin(){
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "052"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<div class='container'><h1>DEVELOPER NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='UploadPlaystoreNotify'></div><div class='col-xl-6 mt-5' id='newProjNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                content += "<tr><td>("+data[0]+") "+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[7]+"<br>"+data[8]+"<br>"+data[9]+"</td></tr>";
            }
            content += "</tbody></table></div></div></div>";
             document.getElementById("displayContent").innerHTML = content;
                $("#callerNotification1").DataTable();
            uploadPlaystore();
        }
    });
}
function uploadPlaystore(){
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "053"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >Uploaded to Playstore</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                content += "<tr><td>("+data[0]+") "+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[7]+"<br>"+data[8]+"<br>"+data[9]+"</td></tr>";
            }
            content += "</tbody></table>";
             document.getElementById("UploadPlaystoreNotify").innerHTML = content;
                $("#callerNotification1").DataTable();
            newProjectNotification();
        }
    });
}


function newProjectNotification(){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "054"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >New Projects</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                content += "<tr><td>("+data[0]+")"+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[6]+"<br>"+data[7]+"</td></tr>";
            }
            content += "</tbody></table>";
             document.getElementById("newProjNotify").innerHTML = content;
                $("#callerNotification3").DataTable();
        }
    });   
}



function notifyDeveloper(){
    
     var dev_id = parseInt(localStorage.getItem("userID"));
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "052"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<div class='container'><h1>DEVELOPER NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='UploadPlaystoreNotify'></div><div class='col-xl-6 mt-5' id='newProjNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(dev_id == data[5]){
                     content += "<tr><td>("+data[0]+") "+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[7]+"<br>"+data[8]+"<br>"+data[9]+"</td></tr>";
                }
            }
            content += "</tbody></table></div></div></div>";
             document.getElementById("displayContent").innerHTML = content;
                $("#callerNotification1").DataTable();
            uploadPlaystoreDeveloper();
        }
    });
}
function uploadPlaystoreDeveloper(){
    
     var dev_id = parseInt(localStorage.getItem("userID"));
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "053"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >Uploaded to Playstore</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(dev_id == data[5]){
                content += "<tr><td>("+data[0]+") "+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[7]+"<br>"+data[8]+"<br>"+data[9]+"</td></tr>";
                }
            }
            content += "</tbody></table>";
             document.getElementById("UploadPlaystoreNotify").innerHTML = content;
                $("#callerNotification1").DataTable();
            newProjectNotificationDeveloper();
        }
    });
}


function newProjectNotificationDeveloper(){
    
     var dev_id = parseInt(localStorage.getItem("userID"));
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "054"},
        success: function(response){
            $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content = "<center><h1 style='color:red;' >New Projects</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(dev_id == data[5]){
                    content += "<tr><td>("+data[0]+")"+data[1]+"<br>("+data[2]+")</td><td>"+data[3]+"<br>"+data[4]+"</td><td>"+data[6]+"<br>"+data[7]+"</td></tr>";
                }
            }
            content += "</tbody></table>";
             document.getElementById("newProjNotify").innerHTML = content;
                $("#callerNotification3").DataTable();
        }
    });   
}


function supportTicket(){
     var id = parseInt(localStorage.getItem("userID"));
    localStorage.setItem("Admin_ID",id);
    window.location.href="./support/admin.html";
}



// Support Executive


// Show All Leads
function allLeadsSupport(){
    
      $('.loader').show();
    $.ajax({
        url : "https://teamka.in/crm1/APIs/api_venkat.php",
        data : {operation : "004"},
        success : function (response){
      $('.loader').hide();
            var partialArranged = response.split("<END>");
            var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(part[8]=="New"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatusSupport('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Converted"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatusSupport('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Proposail Mailed"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatusSupport('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else if(part[8]=="Pending"){
                content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatusSupport('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }else{
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td>'+part[2]+'<br>'+part[3]+'<br>'+part[4]+'<br>'+part[5]+'</td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatusSupport('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                }
                
            }
            content += '</tbody></table></div>';
            document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>"+content;
            $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });  
        }
        
    });
}



//Get All Status
function getAllStatusSupport(id){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation: "009",id:id},
        success: function (response){
      $('.loader').hide();
            var info = response.split("/END/");
            var content = "<table class='table table-bordered table-striped'><thead><th>Called By</th><th>On</th><th>Summary</th><th>Next Call</th></thead><tbody>";
            for(let i=0;i<info.length -1;i++){
                var element = info[i];
                var part = element.split("<-->");
                content += "<tr><td>"+part[0]+"</td><td>"+part[1].split(" ")[0]+"<br>"+part[1].split(" ")[1]+"</td><td>"+part[2]+"</td><td>"+part[3]+"</td></tr>";
            }
            if(localStorage.getItem("userType") == "Admin"){
            document.getElementById("allStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
            
                }else if(localStorage.getItem("userType") == "Caller"){
                    document.getElementById("allStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
                    document.getElementById("allStatusCallers").innerHTML = content+"</tbody></table>";
        
                }else if(localStorage.getItem("userType") == "Developer"){
                    document.getElementById("allStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
                    document.getElementById("allStatusCallers").innerHTML = content+"</tbody></table>";
        
        
                }
        }
    })
}

//Get All Project Status
function getAllProjectStatusSupport(id){
    $('.loader').show();
  $.ajax({
      url: "https://teamka.in/crm1/APIs/api_venkat.php",
      data: {operation: "009",id:id},
      success: function (response){
    $('.loader').hide();
          var info = response.split("/END/");
          var content = "<table class='table table-bordered table-striped'><thead><th>Called By</th><th>On</th><th>Summary</th><th>Next Call</th></thead><tbody>";
          for(let i=0;i<info.length -1;i++){
              var element = info[i];
              var part = element.split("<-->");
              content += "<tr><td>"+part[0]+"</td><td>"+part[1].split(" ")[0]+"<br>"+part[1].split(" ")[1]+"</td><td>"+part[2]+"</td><td>"+part[3]+"</td></tr>";
          }
          if(localStorage.getItem("userType") == "Admin"){
          document.getElementById("allMyStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
          
              }else if(localStorage.getItem("userType") == "Caller"){
                  document.getElementById("allMyStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
                  document.getElementById("allStatusCallers").innerHTML = content+"</tbody></table>";
      
              }else if(localStorage.getItem("userType") == "Developer"){
                  document.getElementById("allMyStatus").innerHTML = content+"</tbody></table><div class='container' id='mailOption'></div>";
                  document.getElementById("allStatusCallers").innerHTML = content+"</tbody></table>";
      
      
              }
      }
  })
}

function getSearchedProject(){
    var SearchText = $('#searchProjectBy').val();

if(SearchText.length<3){alert("Enter alteat 3 Charcter");}else{
      $('.loader').show(); //searchProjectBy

    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"076",'SearchText':SearchText},
        success: function(response){
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(part[14]=="No dues"){
                     content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }else if(part[14]=="No payment details"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }else{
                     content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 7, "desc" ]] , stateSave: true  });  
    },
    async:false
    });
    $('.loader').hide();
 }
}




// Get Project Details
function getProjectDetailsSupport(){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"020"},
        success: function(response){
      
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                if(part[14]=="No dues"){
                     content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:green;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }else if(part[14]=="No payment details"){
                    content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td style="background-color:red;color:white;" >'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }else{
                     content += '<tr><td>'+part[0]+'</td><td>'+part[1]+'<br>'+part[15]+'<br>'+part[16]+'</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask('+part[0]+')">Assign Task</button></td><td>'+part[6]+'</td><td>'+part[14]+'</td><td>'+part[10]+'</td><td>'+part[13]+'<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus('+part[0]+')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport('+part[0]+')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails('+part[0]+')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport('+part[0]+')">Payment</button></td></td></tr>'; 
                }
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 7, "desc" ]] , stateSave: true  });  
    },
    async:false
    });
    $('.loader').hide();
}



// Payment Part
function addProjectIDPaymentSupport(id){
   // getAllProjectPaymentSupport(id);
    //document.getElementById("projectIDPayment").value = id;
}


function getAllProjectPaymentSupport(id){
    
    addPaymentTitle(id);
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data:{operation:"034",id:id},
        success:function(response){
      $('.loader').hide();
            var partial = response.split("/END/");
            var len = partial.length-1;
            var amount = partial[len];
            var content = "<table class='table table-striped table-bordered'><thead><th>Amount</th><th>Proof</th><th>DOR</th><th>Remarks</th><th>Status</th></thead><tbody>";
            for(let i=0;i<len;i++){
                var data = partial[i].split("<-->");
                if(parseInt(data[4])==1){
                    var status = "Verified"; 
                }else{
                    if(localStorage.getItem("userType")=="Admin")
                        var status = "Unverified";
                    else{
                         var status = "Unverified";
                    }
                }
                content += "<tr><td>Rs."+data[0]+"</td><td><a href='"+data[1]+"' target='_blank'>Check Proof</a></td><td>"+data[3]+"</td><td><b>Updated By: </b>"+data[6]+"<hr>"+data[2]+"</td><td>"+status+"</td></tr>"
            }
            document.getElementById("allProjectPayment").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>"+amount+"</div>";
        }
    });
     
}



function getProjectBillingSupport(id){
    localStorage.setItem("Billing_PD_ID",id);
    addBillingTitle(id);
    checkDiscountPaymentSupport(id);
    document.getElementById("projectIDBilling").value = id;
    var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Addon Name</th><!--<th>Addon Price</th>--><th>DOR:</th></thead><tbody>'; 
      $('.loader').show();
    $.ajax({
        url:"https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"031",id:id},
        success: function(response){
      $('.loader').hide();
            var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var amount = partial[totalElement];
            for(let index=0;index<totalElement;index++){
                var data = partial[index].split("<-->");
                var addon = getAddonName(data[0]);
                content += "<tr><td>"+addon+"</td><!--<td>"+data[1]+"</td>--><td>"+data[2]+"</td></tr>";
            }
            //document.getElementById("allProjectBilling").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>"+amount+"</div>";
            document.getElementById("allProjectBilling").innerHTML = content + "</tbody></table><div class='container'><!--<b>Total : Rs </b>"+amount+"--></div><br><button onclick='billingMail("+id+")' >SEND BILL</button>&nbsp<button type='button' onclick='manualMail("+id+")'>MANUAL MAIL</button>";
        }
    });
}



function checkDiscountPaymentSupport(id){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"037",id:id},
        success: function(response){
            $('.loader').hide();
        var partial = response.split("/END/");
        var totalElement = partial.length - 1;
        var amount = partial[totalElement];
        if(response == 0){
              document.getElementById("dicountDiv").style.display = "block";
              document.getElementById("ifDiscountAdded").innerHTML = "none";
        }else{
              document.getElementById("dicountDiv").style.display = "block";
        
            //   Changes
            var content = '<h3>Discounts Added</h3><table id="tableProjects" class="table table-bordered table-striped"><thead><th>Remark</th><th>Amount</th><th>DOR:</th></thead><tbody>'; 
        
            for(let index=0;index<totalElement;index++){
                var data = partial[index].split("<-->");
                var addon = getAddonName(data[0]);
                content += "<tr><td>"+addon+"</td><td>"+data[1]+"</td><td>"+data[2]+"</td></tr>";
            }
            
               document.getElementById("ifDiscountAdded").innerHTML = content + "</tbody></table>";
            // Changes End
            }
        }
    //   $('.loader').hide();
    //       if(response!=0){
    //           document.getElementById("dicountDiv").style.display = "block";
    //           document.getElementById("ifDiscountAdded").innerHTML = "<h4>Discount of Rs. "+response+"/- applied</h4>";
    //       }else{
    //           document.getElementById("ifDiscountAdded").innerHTML ="";
    //           document.getElementById("dicountDiv").style.display = "block";
    //       }
    //     }
    });
}
function syncmail(){
      $('.loader').show();
    $.ajax({
        url: "./APIs/mail/index.php",
        success: function(response){
      $('.loader').hide();
            alert(response+ "Email Updated");  
        }
    });
}




  function checkLeadStatus(){
     var id = localStorage.getItem("userID");
     $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"060",id:id},
        success: function(response){
            if(response == 1){
                localStorage.setItem("leadStatus", 1);
            }else{
                localStorage.setItem("leadStatus", 0);
            }
          }
     });
  }
  
function assignProjectTask(){
     var pd_id = document.getElementById("projDetails").value;
     if(pd_id == ''){g
        document.getElementById("errorDetailsAssignTask").innerHTML = "Fill the Form Correctly";
     }else{
         $.ajax({
            url: "https://teamka.in/crm1/APIs/api_venkat.php",
            data: {operation: "067", pd_id: pd_id},
            success: function(response){
                if(response == 0){
                    addTask();
                }else{
                    var con = confirm("Task :"+response.trimEnd()+" already added to this project. Continue ?");
                    if(con){
                        addTask();
                    }else{
                        alert("Cancelled");
                    }
                }
            }
         });
     }
}

function addTask(){
     var id = localStorage.getItem("userID");
     var pd_id = document.getElementById("projDetails").value;
     var assignedTo = document.getElementById("assignedTo").value;
     var assignedWork = document.getElementById("assignedWork").value;
     var remarksProjAssign = document.getElementById("remarksProjAssign").value;
     var deadline = document.getElementById("deadline").value;
     var taskPriority = document.getElementById("taskPriority").value;
     
    if(pd_id == '' || assignedTo == ''||assignedWork == ''||deadline == ''|| taskPriority == ''){
        document.getElementById("errorDetailsAssignTask").innerHTML = "Fill the Form Correctly";
    }else{
         $('.loader').show();
         $.ajax({
            url: "https://teamka.in/crm1/APIs/api_venkat.php",
            data: {operation:"064",pd_id:pd_id, assignedTo:assignedTo, assignedBy:id, assignedWork:assignedWork, deadline:deadline, remarksProjAssign:remarksProjAssign, taskPriority:taskPriority},
            success: function(response){
              $('.loader').hide();
              console.log(response);
            //   redirect to assigned works
                if(response == 1){
                    alert("Task Assigned");
                   // assignedByMe();
                   // location.reload()
                }else{
                    alert("Error Occured");
                }
            }
         });
    }
}


// Get assigned task

// Get Project Details
function getAssignedTask(){
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"065"},
        success: function(response){
            console.log(response);
      
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By :</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                var d1 = new Date();
                var d2 = new Date(part[8]);
                var d3 = new Date(part[9]);
                var condition = d1.getTime()<=d2.getTime();
                var status = "Not Completed Yet";
                var special = part[9];
                var completed = false;
                if(part[9] != ''){
                    completed = true;
                    if(d3.getTime() < d2.getTime())status = "Completed Before Time";
                    if(d3.getTime() == d2.getTime())status = "Completed On Time";
                    if(d3.getTime() > d2.getTime())status = "Delayed Completed";
                }else{
                    if(!condition)status = "Delayed Not Completed";
                   // special = "<button onclick='markCompletion1("+part[13]+")'>Mark Complete</button>";
                   special = " <button onclick='markCompletion2("+part[13]+"); setTaskIdOnFeedback("+part[13]+")'>Mark Complete</button>";
                }
                if(condition || completed){
                    //part 3,4
                    //<a href="#" onclick=showfulltsk(`tskwrk`,`'+part[13]+'`,`'+part[5]+'`)>....</a>
                     content += '<tr><td>'+part[13]+'</td><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[3]+'<br>'+part[15]+'</td><td id=tskwrk'+part[13]+'>'+part[4].substring(0, 10)+' <a href="#/" onclick="showfulltsk(`tskwrk`,'+part[13]+',`'+part[4]+'`)">....</a> </td><td id=tskrmrk'+part[13]+'>'+part[5].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrmrk`,'+part[13]+',`'+part[5]+'`)">....</a></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td id=tskrtng'+part[13]+'>'+part[11].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrtng`,'+part[13]+',`'+part[11]+'`)">....</a></td></tr>'; 
               
                }else{
                     content += '<tr><td>'+part[13]+'</td><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[3]+'<br>'+part[15]+'</td><td id=tskwrk'+part[13]+'>'+part[4].substring(0, 10)+' <a href="#/" onclick="showfulltsk(`tskwrk`,'+part[13]+',`'+part[4]+'`)">....</a></td><td id=tskrmrk'+part[13]+'>'+part[5].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrmrk`,'+part[13]+',`'+part[5]+'`)">....</a></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;">'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td id=tskrtng'+part[13]+'>'+part[11].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrtng`,'+part[13]+',`'+part[11]+'`)">....</a></td></tr>'; 
               
                }
                    
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Task Assigned</h1><button class='btn btn-link' onclick='assignedByMe()'>Assigned By Me</button><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 7, "desc" ]] , stateSave: true  });  
    },
    async:false
    });
    $('.loader').hide();
}
function showfulltsk(tpe,id,dta){
    $('#'+tpe+''+id+'').html(dta); 
}
// Task Assigned by self
function assignedByMe(){
    var id = localStorage.getItem("userID");
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"065"},
        success: function(response){
            console.log(response);
      
            var partialArranged = response.split("/END/");
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To :</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                var d1 = new Date();
                var d2 = new Date(part[8]);
                var d3 = new Date(part[9]);
                var condition = d1.getTime()<=d2.getTime();
                var status = "Not Completed Yet";
                var special = part[9];
                var feedback = part[11];
                if(part[11].split("<br>")[0] == ''){
                    feedback = '<button data-toggle="modal" data-target="#exampleModalFeedbackTask" onclick="setTaskIdOnFeedback('+part[13]+')">Add Feedback</button>';
                }
                var completed = false;
                if(part[9] != ''){
                    completed = true;
                    if(d3.getTime() < d2.getTime())status = "Completed Before Time";
                    if(d3.getTime() == d2.getTime())status = "Completed On Time";
                    if(d3.getTime() > d2.getTime())status = "Delayed Completed";
                }else{
                    if(!condition)status = "Delayed Not Completed";
                    special = "<button onclick='markCompletion2("+part[13]+"); setTaskIdOnFeedback("+part[13]+")'>Mark Complete</button>";
                }
                if(parseInt(id) == parseInt(part[14])){
/*                    if(condition || completed){
                     content += '<tr><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[3]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td>'+feedback+'</td></tr>'; 
                   
                    }else{
                         content += '<tr><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[3]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;">'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td>'+feedback+'</td></tr>';
                        
                    }*/
                    if(condition || completed){
                    //part 3,4
                    //<a href="#" onclick=showfulltsk(`tskwrk`,`'+part[13]+'`,`'+part[5]+'`)>....</a>
                     content += '<tr><td>'+part[13]+'</td><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[3]+'</td><td id=tskwrk'+part[13]+'>'+part[4].substring(0, 10)+' <a href="#/" onclick="showfulltsk(`tskwrk`,'+part[13]+',`'+part[4]+'`)">....</a> </td><td id=tskrmrk'+part[13]+'>'+part[5].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrmrk`,'+part[13]+',`'+part[5]+'`)">....</a></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td id=tskrtng'+part[13]+'>'+part[11].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrtng`,'+part[13]+',`'+part[11]+'`)">....</a></td></tr>'; 
               
                }else{
                     content += '<tr><td>'+part[13]+'</td><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[3]+'</td><td id=tskwrk'+part[13]+'>'+part[4].substring(0, 10)+' <a href="#/" onclick="showfulltsk(`tskwrk`,'+part[13]+',`'+part[4]+'`)">....</a></td><td id=tskrmrk'+part[13]+'>'+part[5].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrmrk`,'+part[13]+',`'+part[5]+'`)">....</a></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;">'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td id=tskrtng'+part[13]+'>'+part[11].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrtng`,'+part[13]+',`'+part[11]+'`)">....</a></td></tr>'; 
               
                }
                }
                    
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>Tasks Assigned by me</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 5, "desc" ]] , stateSave: true  });  
    },
    async:false
    });
    $('.loader').hide();
}

function setTaskIdOnFeedback(id){
    document.getElementById("taskID").value = id;
}


function submitTaskFeedback(){
    var id = document.getElementById("taskID").value;
    var rating = document.getElementById("ratingTask").value;
    var feedback = document.getElementById("feedbackTask").value;
    
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"068",id:id,rating:rating,feedback:feedback},
        success: function(response){
                 $('.loader').hide();

            if(response == 1){
            alert("Added");

               // assignedByMe();
            }else{
                alert("Error Occured");
            }
        }
    });
}


// Get Project Details Individually
function myAssignedTask(){
    var id = localStorage.getItem("userID");
      $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"070", uid:id},
        success: function(response){
      //      console.log(response);
      //tableProjects
            var partialArranged = response.split("/END/"); //
            var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By:</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index-1];
                var part = element.split("<-->");
                var d1 = new Date();
                var d2 = new Date(part[8]);
                var d3 = new Date(part[9]);
                var condition = d1.getTime()<=d2.getTime();
                var status = "Not Completed Yet";
                var special = part[9];
                var completed = false;
                if(part[9] != ''){
                    completed = true;
                    if(d3.getTime() < d2.getTime())status = "Completed Before Time";
                    if(d3.getTime() == d2.getTime())status = "Completed On Time";
                    if(d3.getTime() > d2.getTime())status = "Delayed Completed";
                }else{
                    if(!condition)status = "Delayed Not Completed";
                   // special = "<button onclick='markCompletion("+part[13]+")'>Mark Complete</button>";
                  special = " <button onclick='markCompletion2("+part[13]+"); setTaskIdOnFeedback("+part[13]+")'>Mark Complete</button>";
                }
                if(condition || completed){
                    //part 3,4
                    //<a href="#" onclick=showfulltsk(`tskwrk`,`'+part[13]+'`,`'+part[5]+'`)>....</a>
                     content += '<tr><td>'+part[13]+'</td><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[3]+'<br>'+part[15]+'</td><td id=tskwrk'+part[13]+'>'+part[4].substring(0, 10)+' <a href="#/" onclick="showfulltsk(`tskwrk`,'+part[13]+',`'+part[4]+'`)">....</a> </td><td id=tskrmrk'+part[13]+'>'+part[5].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrmrk`,'+part[13]+',`'+part[5]+'`)">....</a></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td id=tskrtng'+part[13]+'>'+part[11].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrtng`,'+part[13]+',`'+part[11]+'`)">....</a></td></tr>'; 
               
                }else{
                     content += '<tr><td>'+part[13]+'</td><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[3]+'<br>'+part[15]+'</td><td id=tskwrk'+part[13]+'>'+part[4].substring(0, 10)+' <a href="#/" onclick="showfulltsk(`tskwrk`,'+part[13]+',`'+part[4]+'`)">....</a></td><td id=tskrmrk'+part[13]+'>'+part[5].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrmrk`,'+part[13]+',`'+part[5]+'`)">....</a></td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;">'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td id=tskrtng'+part[13]+'>'+part[11].substring(0, 20)+' <a href="#/" onclick="showfulltsk(`tskrtng`,'+part[13]+',`'+part[11]+'`)">....</a></td></tr>'; 
               
                }
               /* if(parseInt(id) == parseInt(part[12])){
                    if(condition || completed){
                     content += '<tr><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td>'+part[11]+'</td></tr>'; 
                   
                    }else{
                         content += '<tr><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;">'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td>'+part[11]+'</td></tr>';
                        
                    }
                }*/
                    
               
            }
            document.getElementById("displayContent").innerHTML = "<h1>My Tasks</h1><div style='overflow-x:scroll;'>"+content+"</tbody></table>";
            $("#tableProjects").DataTable( {   "order": [[ 5, "desc" ]] , stateSave: true  });  
    },
    async:false
    });
    $('.loader').hide();
}


function markCompletion(id){
  var cnf=confirm("Confirm Complete?");
  if(cnf){
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"066",id:id},
        success: function(response){
            if(response == 1){
                myAssignedTask();
            }else{
                alert("Error Occured");
            }
        }
    });
  }    
}

function markCompletion1(id){
  var cnf=confirm("Confirm Complete?");
  if(cnf){
     $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"066",id:id},
        success: function(response){
            if(response == 1){
                getAssignedTask();
            }else{
                alert("Error Occured");
            }
        }
    });
  }    
}


function markCompletion2(id){
  var cnf=confirm("Confirm Complete?");
      var caller_id = localStorage.getItem("userID");

  if(cnf){    
     $('.loader').show();
     $("#exampleModalFeedbackTask").modal();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"066",id:id,caller_id:caller_id},
        success: function(response){
            $('.loader').hide();
            if(response == 1){
             //   assignedByMe();
                alert("Please add rating and feedback");
            }else{
                alert("Error Occured");
            }
        }
    });
  }    
}


function addProjForTask(id){
    document.getElementById("projDetails").value = id;
}
function loadcallerstats(){
    var id = parseInt(localStorage.getItem("userID"));
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"075",id:id},
        success: function(response){
            $("#Call_Today_Count").html(response);
        }
    });    
}
//userID


document.addEventListener('deviceready', onDeviceReady, false);
function error() {
    console.warn('Camera or Accounts permission is not turned on');
  }

function onDeviceReady() {
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

function getDeviceUserAgent(){
    $('.loader').show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/api_venkat.php",
        data: {operation:"getuserAgent"},
        success: function(response){
            $('.loader').hide();
            $("#getuserAgent").html(response);
        }
    })    
}