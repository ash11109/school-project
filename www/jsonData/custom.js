
 

$(function(){

var stateOptions;
	// alert("test custom")
	// $(function(){
			$.getJSON('./jsonData/indianStates.json',function(result){
			    
				stateOptions = "<option value=''></option>"
			$.each(result, function(stateCode,stateName) {
				//<option value=''>stateName</option>
				stateOptions+="<option value='"
				+stateName+
				"'>"
				+stateName+
				"</option>";
				 });
				 $('#state').html(stateOptions);
				 $('#edit_state').html(stateOptions);
			});
		
	// });

	$("#state").change(function(){
		
			$.getJSON('./jsonData/indianCities.json',function(result){
			    console.log(result);
				var stateChanged = document.getElementById("state").value;
				var districtOptions;
			$.each(result, function(i,district) {
				if(district.state  == stateChanged){
				    console.log(district.state);
					districtOptions+="<option value='"
					+district.name+
					"'>"
					+district.name+
					"</option>";
				}
				 });
				 $('#district').html(districtOptions);
			});
	});

	$("#edit_state").change(function(){
		
		$.getJSON('./jsonData/indianCities.json',function(result){
			var stateChanged = document.getElementById("edit_state").value;
			var districtOptions;
		$.each(result, function(i,district) {
			if(district.state  == stateChanged){
				districtOptions+="<option value='"
				+district.name+
				"'>"
				+district.name+
				"</option>";
			}
			 });
			 $('#edit_district').html(districtOptions);
		});
});



});
  