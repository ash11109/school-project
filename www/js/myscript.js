//var api_url = "https://teamka.in/crm1/APIs/api.php";

var api_url = "https://teamka.in/crm1/APIs/api_development.php";

//new code starts Here 


// Function to fetch data from the API
function fetchData(id) {
    const todayDate = new Date().toISOString().split('T')[0]; // shorthand for today date
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1); // Subtract 1 day to get yesterday
    const yesterdayDateFormatted = yesterdayDate.toISOString().split('T')[0]; // formatted yesterday date

    const thirtyDaysBack = new Date();
    thirtyDaysBack.setDate(thirtyDaysBack.getDate() - 30); // Subtract 30 days
    const thirtyDaysBackDate = thirtyDaysBack.toISOString().split('T')[0];

    const sixtyDaysBack = new Date();
    sixtyDaysBack.setDate(sixtyDaysBack.getDate() - 60); // Subtract 60 days
    const sixtyDaysBackDate = sixtyDaysBack.toISOString().split('T')[0];

    // Fetch data for today, yesterday, 30 days back, and 60 days back
    Promise.all([
        fetchDataForDateRange(id, todayDate,todayDate),  // Today
        fetchDataForDateRange(id, yesterdayDateFormatted,yesterdayDateFormatted),  // Yesterday
        fetchDataForDateRange(id, thirtyDaysBackDate, todayDate),  // 30 days back vs today
        fetchDataForDateRange(id, sixtyDaysBackDate, thirtyDaysBackDate)  // 60 days back vs 30 days back
    ])
    .then(([todayData, yesterdayData, thirtyDaysBackData, sixtyDaysBackData]) => {
        // Compare and populate the data
        compareAndPopulateData(todayData, yesterdayData, thirtyDaysBackData, sixtyDaysBackData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}


// Function to fetch data for a date range (start and end date)
function fetchDataForDateRange(id, startDate, endDate) {
    const url = api_url; // API URL without query parameters
    const data = new URLSearchParams(); // Create URLSearchParams object to encode data

    // Append the parameters to the URLSearchParams object
    data.append('operation', 'test1');
    data.append('id', id);
    data.append('start_date', startDate); // Pass the start date
    data.append('end_date', endDate); // Pass the end date

    // Use fetch with POST method and URL-encoded data
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data.toString()
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        return filterAndCalculateData(result.data, result.breakTime);
    });
}

// Function to filter and calculate the data
function filterAndCalculateData(rawData, breakTime) {
    // Initialize variables for calculations
    const currentDate = new Date().toISOString().split('T')[0];

    let countNotConnected = 0;
    let countConnected = 0;
    let callToday = 0;
    let notrecoded = 0;
    let demoCount = 0;
    let monster = 0;
    let followup = 0;
    let totalCallDuration = 0;

    rawData.forEach(call => {
        // Count Connected / Not Connected
        if (['Switched Off', 'Not Received', 'Out Of Service', 'Incoming Off', 'Call Busy'].includes(call.Call_Status)) {
            countNotConnected++;
        } else {
            countConnected++;
        }

        // Count Not Recorded Calls
        if (call.Duration_Of_Call === 0) {
            notrecoded++;
        }

        // Count total calls today
        callToday++;

        // Count the total call duration
        totalCallDuration += parseInt(call.Duration_Of_Call);

        // Count demo done (check both Summary_Note and Call_Status)
        if (
            (call.Summary_Note && call.Summary_Note.toLowerCase().includes('demo done')) ||
            call.Call_Status === 'Demo Done'
        ) {
            demoCount++;
        }

        if (call.Next_Call_Date == '2020-01-01') {
            monster++;
        }

        // Count pending follow-ups (if Next_Call_Date matches current date)
        if (call.Next_Call_Date === currentDate) {
            followup++;
        }
    });

    // Convert total call duration to HH:MM:SS format
    const durationDisplay = new Date(totalCallDuration * 1000).toISOString().substr(11, 8);

    return {
        breakTime,
        callToday,
        countConnected,
        countNotConnected,
        durationDisplay,
        demoCount,
        followup,
        monster,
        notrecoded
    };
}
function compareAndPopulateData(todayData, yesterdayData, thirtyDaysBackData, sixtyDaysBackData) {
    // Helper function to validate numeric values or return 0 for invalid data
    function getValidValue(value, isTime = false) {
        // If value is a time string like "HH:MM:SS", try to convert to seconds
        if (isTime && typeof value === "string") {
            const timeParts = value.split(':');
            if (timeParts.length === 3) {
                return parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);
            }
        }
        // For non-time values, return number or 0 if invalid
        return (typeof value === 'number' && !isNaN(value)) ? value : 0;
    }

    // Compare and append the result for Today
    const elements = [
        { id: '#tot-dial .today', todayValue: todayData.callToday, yesterdayValue: yesterdayData.callToday },
        { id: '#tot-concted .today', todayValue: todayData.countConnected, yesterdayValue: yesterdayData.countConnected },
        { id: '#tot-not-concted .today', todayValue: todayData.countNotConnected, yesterdayValue: yesterdayData.countNotConnected },
        { id: '#call-durt .today', todayValue: todayData.durationDisplay, yesterdayValue: yesterdayData.durationDisplay, isTime: true },
        { id: '#demo .today', todayValue: todayData.demoCount, yesterdayValue: yesterdayData.demoCount },
        { id: '#follow .today', todayValue: todayData.followup, yesterdayValue: yesterdayData.followup },
        { id: '#monster .today', todayValue: todayData.monster, yesterdayValue: yesterdayData.monster },
        { id: '#nrced .today', todayValue: todayData.notrecoded, yesterdayValue: yesterdayData.notrecoded },
        { id: '#brk-time .today', todayValue: todayData.breakTime, yesterdayValue: yesterdayData.breakTime, isTime: true }, // Added #brk-time for today
    ];

    elements.forEach(item => {
        const todayValue = getValidValue(item.todayValue, item.isTime);
        const yesterdayValue = getValidValue(item.yesterdayValue, item.isTime);
        const diffTodayYesterday = todayValue - yesterdayValue;

        const arrowTodayYesterday = diffTodayYesterday > 0 ? '↑' : diffTodayYesterday < 0 ? '↓' : '';
        const diffTextTodayYesterday = diffTodayYesterday !== 0 ? `(${Math.abs(diffTodayYesterday)})` : '(no change)';

        // Populate today's data with difference and arrows
        $(item.id).html(`Today: ${item.todayValue} ${arrowTodayYesterday} ${diffTextTodayYesterday}`);
    });

    // Compare and append the result for 30 Days
    const elements30Days = [
        { id: '#tot-dial .month', thirtyValue: thirtyDaysBackData.callToday, sixtyValue: sixtyDaysBackData.callToday },
        { id: '#tot-concted .month', thirtyValue: thirtyDaysBackData.countConnected, sixtyValue: sixtyDaysBackData.countConnected },
        { id: '#tot-not-concted .month', thirtyValue: thirtyDaysBackData.countNotConnected, sixtyValue: sixtyDaysBackData.countNotConnected },
        { id: '#call-durt .month', thirtyValue: thirtyDaysBackData.durationDisplay, sixtyValue: sixtyDaysBackData.durationDisplay, isTime: true },
        { id: '#demo .month', thirtyValue: thirtyDaysBackData.demoCount, sixtyValue: sixtyDaysBackData.demoCount },
        { id: '#follow .month', thirtyValue: thirtyDaysBackData.followup, sixtyValue: sixtyDaysBackData.followup },
        { id: '#monster .month', thirtyValue: thirtyDaysBackData.monster, sixtyValue: sixtyDaysBackData.monster },
        { id: '#nrced .month', thirtyValue: thirtyDaysBackData.notrecoded, sixtyValue: sixtyDaysBackData.notrecoded },
        { id: '#brk-time .month', thirtyValue: thirtyDaysBackData.breakTime, sixtyValue: sixtyDaysBackData.breakTime, isTime: true }, // Added #brk-time for 30 days
    ];

    elements30Days.forEach(item => {
        const thirtyValue = getValidValue(item.thirtyValue, item.isTime);
        const sixtyValue = getValidValue(item.sixtyValue, item.isTime);
        const diff30vs30 = thirtyValue - sixtyValue;

        const arrow30vs30 = diff30vs30 > 0 ? '↑' : diff30vs30 < 0 ? '↓' : '';
        const diffText30vs30 = diff30vs30 !== 0 ? `(${Math.abs(diff30vs30)})` : '(no change)';

        // Populate 30 days data with difference and arrows
        $(item.id).html(`30 Days: ${item.thirtyValue} ${arrow30vs30} ${diffText30vs30}`);
    });
}

// Helper function to convert seconds to time format (hh:mm:ss)
function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}



function changeModalName(name){

    if(name == "Add"){

    $("#admin_name").val("");
    $("#joined_date").val("");
    $("#reporting_time").val("");
    $("#attendence_status").val("");
    $("#basic_salary").val("");
    $("#allowed_week_off").val("");
    $("#due_week_off").val("");
    $("#allowed_late").val("");
    $("#due_late").val("");
    $("#relieving_date").val("");
    $("#number_of_nodes").val("");
    $("#nodes_incentive").val("");
    $("#number_of_demos").val("");
    $("#demos_incentive").val("");
    $("#user_phone_number").val("");
    $("#user_email").val("");
    $("#address_present").val("");
    $("#address_permanent").val("");
    $("#alt_contact_person_1").val("");
    $("#alt_number_1").val("");
    $("#alt_contact_person_2").val("");
    $("#alt_number_2").val("");
    $("#alt_contact_person_3").val("");
    $("#alt_number_3").val("");
    $("#fileurl").val("");
    $("#user_ac").val("");
    $("#user_ifsc").val("");
    $("#user_upi").val("");
    clearFileInput();
    $("#lt-select option").prop("selected", false);
    $("#lt-select").selectpicker("refresh");


        document.getElementById("reuableModalLabel").innerHTML = "Add Employee";
        document.getElementById("resuableModalFooter").innerHTML = ` <button type="button" class="btn btn-secondary close" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" onclick="addAdminmeta()">Add</button>`;
    }else{
    document.getElementById("reuableModalLabel").innerHTML = "Update Employee";
    document.getElementById("resuableModalFooter").innerHTML = ` <button type="button" class="btn btn-secondary close" data-dismiss="modal">Close</button>
                                                          <button type="button" class="btn btn-primary" onclick="updateAdminmeta()">Update</button>`;
    }
}
async function checkinactivenumbers(id) {
    // Reset input fields
    

    // Prepare the data for the request
    const data = new URLSearchParams();
    data.append('operation', 'checkinactivenumbers');
    data.append('id', id);
    

    try {
        // Use fetch API with await
        const response = await fetch(api_url, {
            method: 'POST',
            body: data
        });

        // Check if the response is ok (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const responseData = await response.json();
        
        populateAdminSelect(responseData)
    
    } catch (error) {
        // Handle errors using displayerror function
         displayerror(error);
        
    }
}
function populateAdminSelect(response) {
    const selectBox = document.getElementById("edit_number");
    selectBox.innerHTML = "";
    console.log(response);
    // Check if the response is successful
    if (response.success === "true") {
        response.admins.forEach(admin => {
            const option = document.createElement("option");
            option.value = admin.Admin_ID;
            option.textContent = `${admin.Name} (${admin.Mobile}) ${admin.Type}`;

            // Select the option if it matches the selected Admin_ID
            if (admin.Admin_ID === response.selected) {
                option.selected = true;
            }

            selectBox.appendChild(option);
        });
        selectBox.addEventListener("change", function() {
            const selectedId = this.value;
            getAdminDetails(selectedId);  // Call getAdminDetails with the selected Admin_ID
            console.log("Changed");
            $("#selectBoxStatus").val(1);
        });
    } else {
        console.error("Failed to fetch admin data:", response.message);
    }
}
async function getAdminMeta(id, emp_id) {
    $("#selectBoxStatus").val(0);
    $("#admin_name").val("");
    $("#joined_date").val("");
    $("#reporting_time").val("");
    $("#relieving_date").val("");
    $("#attendence_status").val("");
    $("#basic_salary").val("");
    $("#allowed_week_off").val("");
    $("#due_week_off").val("");
    $("#allowed_late").val("");
    $("#due_late").val("");
    $("#number_of_nodes").val("");
    $("#nodes_incentive").val("");
    $("#number_of_demos").val("");
    $("#demos_incentive").val("");
    $("#user_phone_number").val("");
    $("#user_email").val("");
    $("#address_present").val("");
    $("#address_permanent").val("");
    $("#alt_contact_person_1").val("");
    $("#alt_number_1").val("");
    $("#alt_contact_person_2").val("");
    $("#alt_number_2").val("");
    $("#alt_contact_person_3").val("");
    $("#alt_number_3").val("");
    $("#fileurl").val("");
    $("#user_ac").val("");
    $("#user_ifsc").val("");
    $("#user_upi").val("");
    clearFileInput();
    $("#lt-select option").prop("selected", false);
    $("#lt-select").selectpicker("refresh");

    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "getAdminMeta",
                id: emp_id,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error fetching data");
        }

        console.log(data);

        if (data.success) {
            $("#adminEMP_id").val(emp_id);
            $("#admin_id").val(id);
            $("#admin_name").val(data.meta.username);
            $("#joined_date").val(data.data.Joining_Date);
            $("#relieving_date").val(data.data.Relieving_Date);
            $("#reporting_time").val(data.data.Reporting_Time);
            $("#attendence_status").val(data.data.Status);
            $("#basic_salary").val(data.meta.basicSalary);
            $("#allowed_week_off").val(data.meta.allowedWeekOff);
            $("#due_week_off").val(data.meta.dueWeekOff);
            $("#allowed_late").val(data.meta.allowedLate);
            $("#due_late").val(data.meta.dueLate);
            $("#number_of_nodes").val(data.meta.numberOfNodes);
            $("#nodes_incentive").val(data.meta.nodesIncentive);
            $("#number_of_demos").val(data.meta.numberOfDemos);
            $("#demos_incentive").val(data.meta.demosIncentive);
            $("#user_ac").val(data.meta.userac);
            $("#user_ifsc").val(data.meta.userifsc);
            $("#user_upi").val(data.meta.userupi);
            $("#user_phone_number").val(data.meta.userPhoneNumber);
            $("#user_email").val(data.meta.userEmail);
            $("#address_present").val(data.meta.addressPresent);
            $("#address_permanent").val(data.meta.addressPermanent);
            $("#alt_contact_person_1").val(data.meta.altContactPerson1);
            $("#alt_number_1").val(data.meta.altNumber1);
            $("#alt_contact_person_2").val(data.meta.altContactPerson2);
            $("#alt_number_2").val(data.meta.altNumber2);
            $("#alt_contact_person_3").val(data.meta.altContactPerson3);
            $("#alt_number_3").val(data.meta.altNumber3);
            $("#fileurl").val(data.meta.fileurl);

            if (data.meta.leadType) {
                data.meta.leadType.forEach(function (selectedOption) {
                    $("#lt-select option").each(function () {
                        if ($(this).val() === selectedOption.trim()) {
                            $(this).prop("selected", true);
                        }
                    });
                });
            }

            $("#lt-select").selectpicker("refresh");

            const urls = data.meta.fileurl.split(",");

            // Generate image previews
            generateImagePreviews(urls);
        } else {
            $("#admin_id").val(id);
            $("#admin_name").val(name);
        }
    } catch (error) {
        const msg = displayerror(error);
        alert(msg);
    }

    function generateImagePreviews(urls) {
        $("#image-preview-container").empty(); // Clear existing previews
        if (urls.length === 0) {
            $("#image-preview-container").html("<p>No images</p>");
        } else {
            urls.forEach(function (url, index) {
                const imagePreview = `
                    <div class="image-preview" style="display:inline-block; position:relative; margin:5px;">
                        <img src="${url}" alt="Image" style="width: 100px; height: 100px; object-fit: cover;">
                        <button class="remove-image" type="button" style="position: absolute; top: 0; right: 0; background: red; color: white; border: none; cursor: pointer;" data-index="${index}">&times;</button>
                    </div>
                `;
                $("#image-preview-container").append(imagePreview);
            });
        }
    }

    // Delegate the event to handle dynamically generated remove buttons
    $(document).on("click", ".remove-image", function (event) {
        event.preventDefault(); // Prevent the default action

        const indexToRemove = $(this).data("index");

        // Remove the corresponding URL from the array
        urls.splice(indexToRemove, 1);

        // Update the textarea value
        $("#fileurl").val(urls.join(","));

        // Regenerate the image previews
        generateImagePreviews(urls);
    });
}

async function allCaller() {
    // Create the table structure
    $(".loader").show();
    const content =`
        <h1>All Members</h1>
        
        <div class='container' style='overflow-x:scroll;'>
        <div class="d-flex justify-content-center">
            <div class="btn-item active" id="All">All <span id="noti1">0</span></div>
            <div class="btn-item" id="Active">Active <span id="noti2">0</span></div>
            <div class="btn-item" id="Fired">Fired <span id="noti3">0</span></div>
            <div class="btn-item" id="Suspended">Suspended <span id="noti4">0</span></div>
            <div class="btn-item" id="Absconded">Absconded <span id="noti5">0</span></div>
            <div class="btn-item" id="Resigned">Resigned <span id="noti6">0</span></div>
        </div>
        <div class="d-flex justify-content-between">
        <button class="btn btn-primary" id="add-user" data-toggle="modal" data-target="#exampleModal2">Add User</button>
        <button class="btn btn-primary" id="add-member" data-toggle="modal" data-target="#ModalAttendence" onclick="changeModalName('Add');checkinactivenumbers(0)">Add New Employee</button>
        </div>
        <table id="table2" class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile No</th>
                    <th>Type</th>
                    <th>DOR</th>
                    <th>Status</th>
                    <th>Lead Type</th>
                    <th>Lead Status</th>
                    <th>Employee</th>
                    <th>Show Attend..</th>
                </tr>
            </thead>
        </table>
        </div>`;

    document.getElementById("displayContent").innerHTML = content;

    // Function to initialize/reload DataTable
    async function loadtable2(option) {
        if ($.fn.DataTable.isDataTable("#table2")) {
            // Destroy existing DataTable
            $("#table2").DataTable().destroy();
        }
        await getempStatuscount();
        
        try {
            const response = await fetch(api_url, {
                method: "POST",
                body: new URLSearchParams({
                    operation: "005",
                    option: option // Pass the dynamic option value
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error fetching data');
            }
            $(".loader").hide();
            $("#table2").DataTable({
                data: data.data,
                columns: [
                    { data: "Admin_ID" },
                    { data: "Name" },
                    { data: "Mobile" },
                    { data: "Type" },
                    {
                        data: "Joining Date",
                        render: function (data, type, row) {
                            return row.Joining_Date;
                        },
                    },
                    { data: "Status" },
                    {
                        data: "Types",
                        render: function (data, type, row) {
                            return row.Types;
                        },
                    },
                    {
                        data: "leadStatus",
                        render: function (data, type, row) {
                            return data == 1
                                ? `<button class="btn btn-danger" onclick="disableLead(${row.Admin_ID})">Disable</button>`
                                : `<button class="btn btn-success" onclick="enableLead(${row.Admin_ID})">Enable</button>`;
                        },
                    },
                    {
                        data: "metaStatus",
                        render: function (data, type, row) {
                            return data == 1
                                ? `<button class="btn btn-success" data-toggle="modal" data-target="#ModalAttendence" onclick="changeModalName('update'); getAdminDetails(${row.Admin_ID});checkinactivenumbers(${row.Admin_ID});getAdminMeta(${row.Admin_ID},${row.EMP_ID})">Edit</button>`
                                : `<button class="btn btn-danger" data-toggle="modal" data-target="#ModalAttendence" onclick="getAdminMeta(${row.EMP_ID}, '${row.Name}')">Add</button>`;
                        },
                    },
                    {
                        data: "metaStatus",
                        render: function (data, type, row) {
                            return `<button class="btn btn-success" onclick="showAttendence(${row.Admin_ID})">Show</button>`;
                        },
                    },
                ],
                createdRow: function (row, data, index) {
                    if (data["Status"] === "Suspended") {
                        $("td:eq(5)", row).css({ "background-color": "red", color: "white" });
                    } else if (data["Status"] === "Active") {
                        $("td:eq(5)", row).css({ "background-color": "green", color: "white" });
                    }
                },
                stateSave: true,
            });
        } catch (error) {
            // Handle errors using displayerror function
            $(".loader").hide();
             displayerror(error);
            
        }
    }

    // Initial table load with "All"
    loadtable2("All");

    // Event listener for buttons
    $(".btn-item").on("click", function () {
        // Highlight the active button
        $(".btn-item").removeClass("active");
        $(this).addClass("active");

        // Get the selected option
        const option = $(this).attr("id");

        // Reload the table with the selected option
        loadtable2(option);
    });
}

async function getAdminDetails(id) {
    // Reset input fields
    document.getElementById("edit_mobileCaller").value = "";
    document.getElementById("edit_passwordCaller").value = "";
    document.getElementById("edit_type").value = "";
    document.getElementById("admin_name").value = "";

    // Prepare the data for the request
    const data = new URLSearchParams();
    data.append('operation', 'getAdminDetails');
    data.append('id', id);

    try {
        // Use fetch API with await
        const response = await fetch(api_url, {
            method: 'POST',
            body: data
        });

        // Check if the response is ok (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const responseData = await response.json();
        console.log(responseData);

        if (responseData.success === true) {
            // Populate fields with response data
            document.getElementById("edit_mobileCaller").value = responseData.data.Mobile;
            document.getElementById("edit_passwordCaller").value = responseData.data.Password;
            document.getElementById("edit_type").value = responseData.data.Type;
            document.getElementById("admin_name").value = responseData.data.Name;
        }
    } catch (error) {
        // Handle errors using displayerror function
         displayerror(error);
        
    }
}

async function getTHStats() {
    const startDate = document.getElementById("sDate").value;
    const endDate = document.getElementById("eDate").value;

    const content = `
        <table id="statsTable" class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Total Tasks</th>
                    <th>Total Delayed Tasks</th>
                    <th>Total Completed on Time</th>
                    <th>Total Completed Before Time</th>
                    <th>Total Open Tasks</th>
                    <th>Total Delayed Not Completed</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div id="plotContainer" class="plotContainer mt-3" style="width: 100%; height: 400px;"></div>
    `;
    document.getElementById("displayContent").innerHTML = content;

    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({ operation: "008-3", startDate, endDate }),
        });

        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        const data = await response.json();
        console.log(data);

        $("#statsTable").DataTable({
            data: data.data,
            order: [[1, "desc"]],
            columns: [
                { data: "Name" },
                { data: "total_tasks" },
                { data: "total_delayed_tasks" },
                { data: "total_completed_on_time" },
                { data: "total_completed_before_time" },
                { data: "total_open_tasks" },
                { data: "total_delayed_not_completed" },
            ],
        });
    } catch (error) {
        displayerror(error);
    }
}

async function getSupportStats() {
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = currentDate;

    // Format the dates as YYYY-MM-DD
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    console.log(formattedStartDate, formattedEndDate);

    const id = localStorage.getItem("userID");

    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "008-2",
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                id,
            }),
        });

        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        const data = await response.json();
        const stats = data[0];
        console.log(stats);

        document.getElementById("total-task").textContent = stats.total_tasks;
        document.getElementById("delayed-task").textContent = stats.total_delayed_tasks;
        document.getElementById("delayed-not-completed").textContent = stats.total_delayed_not_completed;
        document.getElementById("completed-before-time").textContent = `${stats.total_completed_on_time}/${stats.total_completed_before_time}`;
        document.getElementById("fake-task").textContent = `${stats.total_fake_completion_tasks}/${stats.total_incomplete_task_tasks}`;
    } catch (error) {
        displayerror(error);
    }
}

async function getSupport() {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({ operation: "008-1" }),
        });

        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        const data = await response.json();
        const selectElement = document.getElementById("support-agent");

        // Clear existing options
        selectElement.innerHTML = "";

        // Populate options based on the fetched data
        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.ADMIN_ID;
            option.textContent = item.Name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        displayerror(error);
    }
}

async function addNewProjMail(id) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "addNewProjMail",
                id: id,
            }),
        });

        const responseData = await response.json();
        sendMailNew(responseData);
        console.log(responseData);
    } catch (error) {
        const msg = displayerror(error);
        alert(msg);
    }
}

async function projStatusChange(id, description) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "projstatusmail",
                id: id,
                description: description,
            }),
        });

        const responseData = await response.json();
        sendMailNew(responseData);
        console.log(responseData);
    } catch (error) {
        const msg = displayerror(error);
        alert(msg);
    }
}

async function getComplaint() {
    const content = `
        <table id="complaintTable" class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Lead Id</th>
                    <th>PD Id</th>
                    <th>Lead Name</th>
                    <th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th>
                    <th>Project Name</th>
                    <th>Project Type</th>
                    <th>Caller</th>
                    <th>Developer</th>
                    <th>Issue</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Options</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    document.getElementById("displayContent").innerHTML = content;

    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({ operation: "008-4" }),
        });

        const result = await response.json();
        console.log(result);

        $("#complaintTable").DataTable({
            data: result.data,
            order: [[11, "desc"]],
            columns: [
                { data: "lead_id" },
                { data: "PD_ID" },
                { data: "lead_name" },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        const index = meta.row;
                        return `
                            <a href="javascript:void(0)" onclick="makeCall('${row["lead_name"]}', '${row["lead_id"]}', '${row["mobile"]}', ${index})">
                                ${row["mobile"]}
                            </a><br>
                            <a href="javascript:void(0)" onclick="makeCall('${row["lead_name"]}', '${row["lead_id"]}', '${row["Alternate_Mobile"]}', ${index})">
                                ${row["Alternate_Mobile"]}
                            </a><br>
                            <a href="https://api.whatsapp.com/send?phone=91${row["Whatsapp"]}">
                                ${row["Whatsapp"]}
                            </a><br>
                            ${row["email"]}<br>
                            <button style="display:none" data-toggle="modal" data-target="#exampleModal4" data-whatever="${row["lead_id"]}" id="save-id-${index}" onclick="stopRecord('${row["lead_id"]}', '${index}')">End Call</button>
                        `;
                    },
                },
                {
                    data: "Project_Name",
                    render: function (data, type, row) {
                        return `
                            ${data}
                            <br>
                            <button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjDetails(${row["PD_ID"]}, '${row["description"]}', '${row["issue"]}', '${row["fileName"]}')">Assign Task</button>
                            <br>
                            <button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(${row["PD_ID"]})">View Task</button>
                        `;
                    },
                },
                { data: "Project_Type" },
                { data: "caller" },
                { data: "developer" },
                { data: "issue" },
                {
                    data: "description",
                    render: function (data, type, row) {
                        let image = "";
                        if (row["fileName"] !== "0") {
                            image = `<br><button onclick="showImage('${row["fileName"]}')">View image</button>`;
                        }
                        return `${data}${image}`;
                    },
                },
                { data: "type" },
                { data: "date_added" },
                { data: "status" },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBilling(${row["PD_ID"]})">Billing</button><br>
                            <button data-toggle="modal" data-target="#exampleModalProjectPayment" onclick="addProjectIDPayment(${row["PD_ID"]})">Payment</button><br>
                            <button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(${row["lead_id"]})" data-whatever="${row["lead_id"]}">Status</button>
                        `;
                    },
                },
            ],
        });
    } catch (error) {
        console.error("Error fetching complaints:", error);
    }
}

async function sendMailNew(data) {
    try {
        const response = await fetch("https://kalamacademy.org/test/test.php", {
            method: "POST",
            body: new URLSearchParams({
                operation: "00100",
                to: data.to,
                subject: data.subject,
                message: data.message,
            }),
        });

        const result = await response.text();

        $(".loader").hide();

        if (result > 0) {
            alert("Mail Sent");
        } else {
            alert("Error In Sending Mail");
        }
    } catch (error) {
        $(".loader").hide();
        const msg = displayerror(error);
        alert(msg);
    }
}

async function paymentVerifyMail(pd_id, id) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "paymentVerifyMail",
                pd_id: pd_id,
                id: id,
            }),
        });

        const responseData = await response.json();
        sendMailNew(responseData);
    } catch (error) {
        const msg = displayerror(error);
        alert(msg);
    }
}

async function taskCompleteMail(id) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "taskCompleteMail",
                id: id,
            }),
        });

        const responseData = await response.json();
        sendMailNew(responseData);
    } catch (error) {
        const msg = displayerror(error);
        alert(msg);
    }
}

async function taskAssignMail(id, description) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "taskAssignMail",
                id: id,
                description: description,
            }),
        });

        const responseData = await response.json();
        sendMailNew(responseData);
    } catch (error) {
        const msg = displayerror(error);
        alert(msg);
    }
}


async function uploadImage() {
    if (!selectedFile) return; // If no file is selected, don't proceed

    $(".loader").show();

    try {
        // Resize and upload the image
        const resizedFile = await resizeAndUpload(selectedFile);
        console.log("Resized File:", resizedFile);

        const formData = new FormData();
        formData.append("image", resizedFile);
        formData.append("operation", "ImageUploadhr"); // Include operation

        // Using fetch to upload the image
        const response = await fetch(api_url, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        $(".loader").hide();

        if (responseData.success === true) {
            console.log(responseData.imageUrl);
            $("#fileurl").val((i, val) => val.trim() + (val.trim() ? " " : "") + responseData.imageUrl);
            $(".success-msg").text("Upload success").show();
        } else {
            // Handle error in response from server
            console.error("Upload error:", responseData.error);
            $(".error-msg").text("Upload failed").show();
            alert("Upload failed: " + responseData.error);
        }
    } catch (error) {
        $(".loader").hide();
        console.error("Error during image processing:", error);
        $(".error-msg").text("Image processing failed").show();
        // Using displayerror function to show the error
        displayerror(`An error occurred: ${error.message}`);
    }
}

async function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file.type.match("image.*")) {
        $(".loader").show();
        try {
            const resizedFile = await resizeAndUpload(file);
            console.log("Resized File:", resizedFile);

            const formData = new FormData();
            formData.append("image", resizedFile);
            formData.append("operation", "taskImageUpload");

            // Using fetch to upload the image
            const response = await fetch(api_url, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log(responseData);

            if (responseData.success) {
                $(".loader").hide();
                $("#remarksProjAssign").val($("#remarksProjAssign").val() + "\n \n" + responseData.imageUrl);
                $(".success-msg").text("Upload success").show();
            } else {
                // Handle error in response from server
                $(".loader").hide();
                $(".error-msg").text("Upload failed").show();
                console.error("Upload error:", responseData.error);
                alert("Upload failed: " + responseData.error);
            }
        } catch (error) {
            $(".loader").hide();
            console.error("Error during file upload:", error);
            $(".error-msg").text("Upload failed").show();
            // Using displayerror function to show the error
            displayerror(`An error occurred: ${error.message}`);
        }
    } else {
        // The selected file is not an image
        alert("Please select an image file.");
        $(this).val(""); // Reset the file input
    }
}



// async function callerDataToday() {
//     const id = localStorage.getItem("userID");

//     try {
//         const response = await fetch(api_url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//             },
//             body: new URLSearchParams({
//                 operation: "test1",
//                 id: id,
//             }),
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json(); // Assuming the response is JSON
//         console.log(result);

//         // Update HTML elements
//         $("#brk-time .today").html("Today: " + result.bt);
//         $("#tot-dial .today").html("Today: " + result.call_today);
//         $("#tot-concted .today").html("Today: " + result.countConnected);
//         $("#tot-not-concted .today").html("Today: " + result.countNotConnected);
//         $("#call-durt .today").html("Today: " + result.callDuration);
//         $("#demo .today").html("Today: " + result.demo);
//         $("#follow .today").html("Today: " + result.follow);
//         $("#monster .today").html("Today: " + result.call_count);
//         $("#nrced .today").html("Today: " + result.notRecorded);

//     } catch (error) {
//         console.error("Error fetching data:", error);
//         displayerror(`An error occurred: ${error.message}`);
//     }
// }

// async function callerDataMonth() {
//     const id = localStorage.getItem("userID");
//     const to = getToday();
//     const from = getLast30Days();

//     try {
//         const response = await fetch(api_url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//             },
//             body: new URLSearchParams({
//                 operation: "007-month",
//                 id: id,
//                 to: to,
//                 from: from,
//             }),
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json(); // Assuming the response is JSON
//         console.log(result);

//         // Update HTML elements
//         $("#brk-time .month").html("30 Days: " + result.bt);
//         $("#tot-dial .month").html("30 Days: " + result.call_today);
//         $("#tot-concted .month").html("30 Days: " + result.countConnected);
//         $("#tot-not-concted .month").html("30 Days: " + result.countNotConnected);
//         $("#call-durt .month").html("30 Days: " + result.callDuration);
//         $("#demo .month").html("30 Days: " + result.demo);
//         $("#follow .month").html("30 Days: " + result.follow);
//         $("#monster .month").html("30 Days: " + result.call_count);
//         $("#nrced .month").html("30 Days: " + result.notRecorded);
//         $("#fakedemo .month").html("30 Days: " + result.fakedemo + "/" + result.incomdemo);

//     } catch (error) {
//         console.error("Error fetching data:", error);
//         displayerror(`An error occurred: ${error.message}`);
//     }
// }

async function addMember() {
    const tl = $("#tl-select").val();
    const selectedValues = [];

    // Loop through each selected option
    $("#mb-select option:selected").each(function () {
        selectedValues.push($(this).val());
    });

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "addMembers",
                tl: tl,
                members: JSON.stringify(selectedValues),
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text(); // Assuming response is plain text ("1" on success)
        
        if (result === "1") {
            alert("Data Inserted successfully");
            $(".close").click();
        } else {
            displayerror("Failed to add members. Please try again.");
        }

    } catch (error) {
        console.error("Error adding members:", error);
        displayerror(`An error occurred: ${error.message}`);
    }
}

async function getMembers() {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ operation: "getMembers" }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        // Clear existing options
        $("#tl-select").empty();
        $("#mb-select").empty();

        // Add default option to TL select
        $("#tl-select").append(
            $("<option>", {
                value: "",
                text: "Please Select TL",
            })
        );

        // Populate TL options
        data.TL.forEach(function (option) {
            $("#tl-select").append(
                $("<option>", {
                    value: option.Admin_ID,
                    text: option.Name + " - " + option.Type,
                })
            );
        });

        // Refresh select picker
        $("#mb-select").selectpicker("refresh");
        $("#tl-select").selectpicker("refresh");

    } catch (error) {
        console.error("Error fetching team members:", error);
        displayerror(`An error occurred: ${error.message}`);
    }
}

async function showTeam() {
    $(".loader").show();
    const tl = localStorage.getItem("userID");

    const content = `
        <table id="membersTable" class="display" style="width:100%">
            <thead>
                <tr>
                    <th>Admin ID</th>
                    <th>Member Name</th>
                    <th>Attendance</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    document.getElementById("displayContent").innerHTML = "<h1>MY Team </h1><div style='overflow-x:scroll;'>" + content;

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ operation: "showMembers", tl: tl }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        const callers = data.data;

        $("#membersTable").DataTable({
            data: callers, // Initially empty data
            columns: [
                { data: "Admin_ID" },
                { data: "Name" },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `<button class="btn btn-success" onclick="showAttendence(${row["Admin_ID"]})">Show</button>`;
                    },
                },
            ],
        });

    } catch (error) {
        console.error("Error fetching team data:", error);
        displayerror(`An error occurred: ${error.message}`);
    } finally {
        $(".loader").hide();
    }
}

async function getTrancations(type) {
    const start = document.getElementById("reportStartDate").value;
    const end = document.getElementById("reportEndDate").value;

    // Show the loader
    $(".loader").show();

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "getTrancations",
                start: start,
                end: end,
                type: type,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text(); // Use text() since the response is in a custom format
        const partial = responseText.split("/END/");
        const len = partial.length - 1;

        let content = `
            <table id="tabletransPayment" class="mt-5 table table-striped table-bordered">
                <thead>
                    <th>Project Name</th>
                    <th>Lead Name</th>
                    <th>Amount</th>
                    <th>Proof</th>
                    <th>Remark</th>
                    <th>DOR</th>
                    <th>VERIFY</th>
                    <th>DELETE</th>
                </thead>
                <tbody>`;

        for (let i = 0; i < len; i++) {
            const element = partial[i].split("<-->");
            const test = element[9];
            const isVerified = parseInt(element[8]) === 1;
            const actionButton = isVerified
                ? `<td>Verified</td><td><button onclick='unverifiedDelete(${element[0]})'>DELETE</button></td>`
                : `<td><button onclick='unverifiedVerify(${element[0]})'>VERIFY</button></td><td><button onclick='unverifiedDelete(${element[0]})'>DELETE</button></td>`;

            content += `
                <tr>
                    <td>${element[2]}</td>
                    <td>${element[3]}</td>
                    <td>${element[4]}</td>
                    <td><a href="${element[5]}" target="_blank"><b>Click here</b></a></td>
                    <td><b>Updated By: </b>${test}<hr>${element[6]}</td>
                    <td>${element[7]}</td>
                    ${actionButton}
                </tr>`;
        }

        document.getElementById("tablereporttrans").innerHTML = content + "</tbody></table>";

        // Initialize DataTable
        $("#tabletransPayment").DataTable({ stateSave: true });

    } catch (error) {
        console.error("Error fetching transactions:", error);
        displayerror(`An error occurred: ${error.message}`);
    } finally {
        $(".loader").hide();
    }
}

async function getcpls(type) {
    const start = document.getElementById("reportStartDate").value;
    const end = document.getElementById("reportEndDate").value;

    // Show the loader
    $(".loader").show();

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "getcpls",
                start: start,
                end: end,
                type: type,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        if (jsonResponse.success) {
            const content = `
                <div class='container mt-5' style='overflow-x:auto;'>
                    <table id="expensetable" class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Amount</th>
                                <th>Expense For</th>
                                <th>Remarks</th>
                                <th>PD_ID</th>
                                <th>Proff</th>
                                <th>Date Of Expense</th>
                                <th>DOR</th>
                                <th>Expense For</th>
                                <th>Expense Purpose</th>
                                <th>Expense Account</th>
                                <th>Option</th>
                            </tr>
                        </thead>
                    </table>
                </div>`;

            document.getElementById("tablereportcpl").innerHTML = content;

            // Initialize DataTable
            $("#expensetable").DataTable({
                data: jsonResponse.data,
                order: [[0, "desc"]],
                columns: [
                    { data: "ET_ID" },
                    { data: "EXP_Amount" },
                    { data: "Expense_For" },
                    { data: "Remark" },
                    { data: "PD_ID" },
                    { data: "Proff" },
                    { data: "Date_Of_Expense" },
                    { data: "DOR" },
                    {
                        data: null,
                        render: (data, type, row) => {
                            switch (row["EXP_For"]) {
                                case "1": return "Academy";
                                case "2": return "Agency";
                                case "3": return "My Galla";
                                default: return row["EXP_For"] || "";
                            }
                        },
                    },
                    {
                        data: null,
                        render: (data, type, row) => {
                            switch (row["Expense_Purpose"]) {
                                case "1": return "Marketing";
                                case "2": return "Salary";
                                case "3": return "Rent";
                                case "4": return "Other";
                                default: return row["Expense_Purpose"] || "";
                            }
                        },
                    },
                    {
                        data: null,
                        render: (data, type, row) => {
                            switch (row["From_Account"]) {
                                case "1": return "GreenTech India";
                                case "2": return "Axis (Vikash)";
                                case "3": return "Kotak (Vikash)";
                                case "4": return "Other";
                                case "5": return "Cash";
                                case "6": return "My Galla HDFC";
                                case "7": return "Kalam Foundation Axis Bank";
                                default: return row["From_Account"] || "";
                            }
                        },
                    },
                    {
                        data: null,
                        render: (data, type, row) => `
                            <button class="btn btn-primary" 
                                    data-toggle="modal" 
                                    data-target="#exampleModalExpenseEdit" 
                                    onclick="editExpense(${row["ET_ID"]})">
                                Edit
                            </button>`,
                    },
                ],
            });
        } else {
            displayerror("Failed to fetch data. Please try again.");
        }
    } catch (error) {
        console.error("Error fetching options:", error);
        displayerror(`An error occurred while fetching data: ${error.message}`);
    } finally {
        // Hide the loader once the request completes
        $(".loader").hide();
    }
}

async function fetchExpenseReportcomb(start1, end1, start2, end2) {
    const loader = $(".loader");

    // Helper function to fetch reports for a specific date range
    async function fetchAllReports(start, end) {
        loader.show();

        const endpoints = [
            { operation: "expenseReport", start, end },
            { operation: "expenseReport-2", start, end },
            { operation: "expenseReport-3", start, end },
            { operation: "expenseReport-4", start, end },
        ];

        try {
            const promises = endpoints.map((endpoint) =>
                fetch(api_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(endpoint),
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error(`Failed to fetch ${endpoint.operation}: ${res.statusText}`);
                    }
                    return res.json();
                })
            );

            return await Promise.all(promises);
        } catch (error) {
            console.error(`Error fetching reports for range ${start} - ${end}:`, error);
            displayError(error); // Assuming a `displayError` function exists
            throw error; // Rethrow to propagate error handling
        } finally {
            loader.hide();
        }
    }

    try {
        // Fetch data for the first date range
        const responses1 = await fetchAllReports(start2, end2);
        const datamain1 = {
            data1: responses1[0],
            data2: responses1[1],
            data3: responses1[2],
            data4: responses1[3],
        };
        console.log("datamain1:", datamain1);

        // Fetch data for the second date range
        const responses2 = await fetchAllReports(start1, end1);
        const datamain2 = {
            data1: responses2[0],
            data2: responses2[1],
            data3: responses2[2],
            data4: responses2[3],
        };
        console.log("datamain2:", datamain2);

        // Generate the combined table
        generateCombinedTable(start2, end2, datamain1, datamain2);
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        displayError(error); // Handle the error for user feedback
    }
}

function addMissedCall() {
    console.log("Trying to add missed calls");
    const id = localStorage.getItem("userID");

    document.addEventListener(
        "deviceready",
        async function () {
            const days = 1; // Fetch logs from the last day

            try {
                // Fetch call logs using Cordova plugin
                cordova.plugins.callLog.list(
                    days,
                    async function (response) {
                        try {
                            const missedCalls = response.rows.filter((call) => call.type == 3);
                            const json = JSON.stringify(missedCalls);

                            const apiResponse = await fetch(api_url, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded",
                                },
                                body: new URLSearchParams({
                                    operation: "addmissedcall",
                                    calls: json,
                                    id: id,
                                }),
                            });

                            if (!apiResponse.ok) {
                                throw new Error(`Error submitting missed calls: ${apiResponse.statusText}`);
                            }

                            const responseData = await apiResponse.text();
                            console.log(responseData);
                        } catch (error) {
                            console.error("Error sending missed call data:", error);
                            displayError(error); // Assuming `displayError` is defined
                        }
                    },
                    function (error) {
                        console.error("Error fetching call logs:", error);
                        displayError(error); // Assuming `displayError` is defined
                    }
                );
            } catch (error) {
                console.error("Unexpected error while processing missed calls:", error);
                displayError(error); // Assuming `displayError` is defined
            }
        },
        false
    );
}

async function syncSheet() {
    try {
        // Show the loader
        $(".loader").show();

        const response = await fetch("https://teamka.in/crm1/APIs/ash_auto_lead_add.php", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error(`Error syncing sheet: ${response.statusText}`);
        }

        const responseData = await response.text(); // Assuming the response is plain text
        console.log(responseData);
        alert(responseData);
    } catch (error) {
        console.error("Error syncing sheet:", error);
        // Optionally, display the error to the user
        displayError(error); // Assuming `displayError` is defined elsewhere
    } finally {
        // Hide the loader regardless of success or error
        $(".loader").hide();
    }
}

function checkUserStatus(requiredUserType) {
    // Get the user details from localStorage
    let mobileNo = localStorage.getItem("MobileNo");
    let userType = localStorage.getItem("userType");

    // If no mobile number, user is not logged in
    if (mobileNo === null) {
        alert("Not Logged In");
        window.location.href = "./index.html";
        return; // Stop further execution
    }

    // Check if the user type matches the required user type (Admin or Caller)
    if (requiredUserType.includes(userType)) {
        return; // User is allowed to access the page, do nothing
    } else  {
        alert("Not Logged In");
        window.location.href = "./index.html";
        return; // Stop further execution
    }
}

async function login() {
    $(".loader").show();
    const mobileNo = document.getElementById("mobileNo").value;
    const password = document.getElementById("password").value;

    try {
        const formdata = new URLSearchParams({
            operation: "001",
            mobileNo: mobileNo,
            password: password,
        });

        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formdata.toString(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        $(".loader").hide();

        const id = parseInt(data.userID);
        checkAbsent(id);
        checkLate(id);

        if (data.status === "success") {
            localStorage.setItem("MobileNo", mobileNo);
            localStorage.setItem("userID", data.userID);
            localStorage.setItem("userName", data.userName);
            localStorage.setItem("userType", data.userType);

            window.location.href = data.dashboardURL;  // Redirect to the appropriate dashboard
        } else {
            alert(data.message);  // Display error message
        }

    } catch (error) {
        displayError(error);
    }
}

async function Logout() {
    const user_id = localStorage.getItem("userID");

    try {
        const response = await fetch(api_url, {
            method: "POST",
            body: new URLSearchParams({
                operation: "001-1",
                user_id: user_id,
            }),
        });

        // If response is not ok, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        localStorage.removeItem("userID");
        localStorage.removeItem("userName");
        localStorage.removeItem("userType");
        localStorage.removeItem("lead_id");
        window.location.href = "./index.html";
    } catch (error) {
        displayError(error);
    }
}

function displayError(error) {
    console.error("Error:", error);
    alert(`Error: ${error.message || error}`);
}

async function checkAbsent(id) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "checkAbsent",
                id: id,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success === true) {
            sendMailNew(data.data);
        }
    } catch (error) {
        console.error("Error fetching options:", error);
    }
}

async function checkLate(id) {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "checkLate",
                id: id,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success === true) {
            sendMailNew(data.data);
        }
    } catch (error) {
        console.error("Error fetching options:", error);
    }
}

async function addAdminmeta() {
    $(".loader").show();
    var id = $("#admin_id").val();
    var username = $("#admin_name").val();
    var password = $("#edit_passwordCaller").val();
    var mobile = $("#edit_mobileCaller").val();
    var type = $("#edit_type").val();
    var joined_date = $("#joined_date").val();
    var reporting_time = $("#reporting_time").val();
    var attendence_status = $("#attendence_status").val();
    var basicSalary = $("#basic_salary").val();
    var allowedWeekOff = $("#allowed_week_off").val();
    var dueWeekOff = $("#due_week_off").val();
    var allowedLate = $("#allowed_late").val();
    var dueLate = $("#due_late").val();
    var numberOfNodes = $("#number_of_nodes").val();
    var nodesIncentive = $("#nodes_incentive").val();
    var numberOfDemos = $("#number_of_demos").val();
    var demosIncentive = $("#demos_incentive").val();
    var userac = $("#user_ac").val();
    var userifsc = $("#user_ifsc").val();
    var userupi = $("#user_upi").val();
    var userPhoneNumber = $("#user_phone_number").val();
    var userEmail = $("#user_email").val();
    var addressPresent = $("#address_present").val();
    var addressPermanent = $("#address_permanent").val();
    var altContactPerson1 = $("#alt_contact_person_1").val();
    var altNumber1 = $("#alt_number_1").val();
    var altContactPerson2 = $("#alt_contact_person_2").val();
    var altNumber2 = $("#alt_number_2").val();
    var altContactPerson3 = $("#alt_contact_person_3").val();
    var altNumber3 = $("#alt_number_3").val();
    var fileurl = $("#fileurl").val();

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "addAdminmeta",
                id: id,
                username: username,
                password: password,
                mobile: mobile,
                type: type,
                joined_date: joined_date,
                reporting_time: reporting_time,
                attendence_status: attendence_status,
                basicSalary: basicSalary,
                allowedWeekOff: allowedWeekOff,
                dueWeekOff: dueWeekOff,
                allowedLate: allowedLate,
                dueLate: dueLate,
                numberOfNodes: numberOfNodes,
                nodesIncentive: nodesIncentive,
                numberOfDemos: numberOfDemos,
                demosIncentive: demosIncentive,
                // New fields
                userPhoneNumber: userPhoneNumber,
                userEmail: userEmail,
                addressPresent: addressPresent,
                addressPermanent: addressPermanent,
                altContactPerson1: altContactPerson1,
                altNumber1: altNumber1,
                altContactPerson2: altContactPerson2,
                altNumber2: altNumber2,
                altContactPerson3: altContactPerson3,
                altNumber3: altNumber3,
                fileurl: fileurl,
                userac: userac,
                userifsc: userifsc,
                userupi: userupi,
            }),
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle the success/failure based on the response
        alert(data.message);
        if (data.success === "true") {
            $(".loader").hide();
            allCaller();
            $(".close").click();
            // Clear the form fields
            $("#admin_name").val("");
            $("#joined_date").val("");
            $("#reporting_time").val("");
            $("#attendence_status").val("");
            // Clear new fields
            $("#user_phone_number").val("");
            $("#user_email").val("");
            $("#address_present").val("");
            $("#address_permanent").val("");
            $("#alt_contact_person_1").val("");
            $("#alt_number_1").val("");
            $("#alt_contact_person_2").val("");
            $("#alt_number_2").val("");
            $("#alt_contact_person_3").val("");
            $("#alt_number_3").val("");
            $("#fileurl").val("");
            $("#user_ac").val("");
            $("#user_ifsc").val("");
            $("#user_upi").val("");
        }
    } catch (error) {
        // Display error using the displayError function
        $(".loader").hide();
        displayError(error.message);
    }
}

async function updateAdminmeta() {
    $(".loader").show();
    var ischecked = $("#selectBoxStatus").val();
    var emp_id = $("#adminEMP_id").val();
    var id = $("#admin_id").val();
    var username = $("#admin_name").val();
    var mobile = $("#edit_mobileCaller").val();
    var password = $("#edit_passwordCaller").val();
    var joined_date = $("#joined_date").val();
    var reporting_time = $("#reporting_time").val();
    var relieving_date = $("#relieving_date").val();
    var attendence_status = $("#attendence_status").val();
    var basicSalary = $("#basic_salary").val();
    var allowedWeekOff = $("#allowed_week_off").val();
    var dueWeekOff = $("#due_week_off").val();
    var allowedLate = $("#allowed_late").val();
    var dueLate = $("#due_late").val();
    var numberOfNodes = $("#number_of_nodes").val();
    var nodesIncentive = $("#nodes_incentive").val();
    var numberOfDemos = $("#number_of_demos").val();
    var demosIncentive = $("#demos_incentive").val();

    // New fields
    var userac = $("#user_ac").val();
    var userifsc = $("#user_ifsc").val();
    var userupi = $("#user_upi").val();
    var userPhoneNumber = $("#user_phone_number").val();
    var userEmail = $("#user_email").val();
    var addressPresent = $("#address_present").val();
    var addressPermanent = $("#address_permanent").val();
    var altContactPerson1 = $("#alt_contact_person_1").val();
    var altNumber1 = $("#alt_number_1").val();
    var altContactPerson2 = $("#alt_contact_person_2").val();
    var altNumber2 = $("#alt_number_2").val();
    var altContactPerson3 = $("#alt_contact_person_3").val();
    var altNumber3 = $("#alt_number_3").val();
    var fileurl = $("#fileurl").val();

    var selectedLeadtype = [];
    // Loop through each selected option
    $("#lt-select option:selected").each(function () {
        selectedLeadtype.push($(this).val());
    });

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "updateAdminmeta",
                ischecked : ischecked,
                id: id,
                emp_id: emp_id,
                mobile: mobile,
                password: password,
                username: username,
                joined_date: joined_date,
                relieving_date : relieving_date,
                reporting_time: reporting_time,
                attendence_status: attendence_status,
                basicSalary: basicSalary,
                allowedWeekOff: allowedWeekOff,
                dueWeekOff: dueWeekOff,
                allowedLate: allowedLate,
                dueLate: dueLate,
                numberOfNodes: numberOfNodes,
                nodesIncentive: nodesIncentive,
                numberOfDemos: numberOfDemos,
                demosIncentive: demosIncentive,
                userPhoneNumber: userPhoneNumber,
                userEmail: userEmail,
                addressPresent: addressPresent,
                addressPermanent: addressPermanent,
                altContactPerson1: altContactPerson1,
                altNumber1: altNumber1,
                altContactPerson2: altContactPerson2,
                altNumber2: altNumber2,
                altContactPerson3: altContactPerson3,
                altNumber3: altNumber3,
                fileurl: fileurl,
                userac: userac,
                userifsc: userifsc,
                userupi: userupi,
                leadType: JSON.stringify(selectedLeadtype),
            }),
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle the success/failure based on the response
        alert(data.message);

        if (data.success == true) {
            $(".loader").hide();
            allCaller();
            $(".close").click();
            // Clear the form fields
            $("#admin_name").val("");
            $("#joined_date").val("");
            $("#reporting_time").val("");
            $("#attendence_status").val("");
           $("#relieving_date").val("");
            // Clear new fields
            $("#user_phone_number").val("");
            $("#user_email").val("");
            $("#address_present").val("");
            $("#address_permanent").val("");
            $("#alt_contact_person_1").val("");
            $("#alt_number_1").val("");
            $("#alt_contact_person_2").val("");
            $("#alt_number_2").val("");
            $("#alt_contact_person_3").val("");
            $("#alt_number_3").val("");
            $("#fileurl").val("");
            $("#user_ac").val("");
            $("#user_ifsc").val("");
            $("#user_upi").val("");
        }
    } catch (error) {
        // Display error using the displayError function
        $(".loader").hide();
        displayError(error.message);
    }
}

async function searchLeads(query, filename) {
    if (query.length < 3) {
        // Do not search if the query is less than 3 characters
        document.getElementById("searchResults").style.display = "none";
        document.getElementById("selectButtonContainer").innerHTML = ""; // Hide the button
        return;
    }

    console.log(query, filename);

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "leadSearch",
                query: query,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching results: ${response.statusText}`);
        }

        const results = await response.json();
        displayResults(results, filename);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("searchResults").innerHTML = "Error fetching results";
        document.getElementById("searchResults").style.display = "block";
        document.getElementById("selectButtonContainer").innerHTML = ""; // Hide the button

        // Call a function to display the error message if you have one
        displayError(error);
    }
}

async function fetchMissedCalls() {
    const content =
        '<table id="missedcallTable" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Caller</th><th scope="col">Missed Date</th><th scope="col">Option</th><th scope="col">Missed By</th></tr></thead><tbody></tbody></table>';

    document.getElementById("displayContent").innerHTML =
        `<h1>Missed Calls</h1><button class='btn btn-primary' onclick='addMissedCall()'>Sync</button><div style='overflow-x:scroll;'>${content}`;

    const user = localStorage.getItem("userID");
    const type = localStorage.getItem("userType");

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "fetchMissedCalls",
                user: user,
                type: type,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching missed calls: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        $("#missedcallTable").DataTable({
            data: data.data,
            order: [[9, "desc"]],
            columns: [
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["Lead_ID"];
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["Name"];
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        const index = meta.row;

                        function makeCallLink(number, displayText, name, leadid) {
                            if (row["status"] === 1) {
                                if (number === row["number"]) {
                                    return `<a href="javascript:void(0)" onclick="makeCall('${name}', '${leadid}', '${number}', '${index}')" style="color:red;">${displayText}</a>`;
                                } else {
                                    return `<a href="javascript:void(0)" onclick="makeCall('${name}', '${leadid}', '${number}', '${index}')">${displayText}</a>`;
                                }
                            } else {
                                if (number === row["number"]) {
                                    return `<a href="javascript:void(0)" onclick="makeCall('Missed Call', 'Lead Not Added', '${number}', '${index}')" style="color:red;">${displayText}</a>`;
                                } else {
                                    return `<a href="javascript:void(0)" onclick="makeCall('Missed Call', 'Lead Not Added', '${number}', '${index}')">${displayText}</a>`;
                                }
                            }
                        }

                        function makeWhatsAppLink(number, displayText) {
                            if (number === row["number"]) {
                                return `<a href="https://api.whatsapp.com/send?phone=91${number}" style="color: red;">${displayText}</a>`;
                            } else {
                                return `<a href="https://api.whatsapp.com/send?phone=91${number}">${displayText}</a>`;
                            }
                        }

                        if (row["status"] === 1) {
                            return `${makeCallLink(row["Mobile"], row["Mobile"], row["Name"], row["Lead_ID"])}<br>` +
                                `${makeCallLink(row["Alternate_Mobile"], row["Alternate_Mobile"], row["Name"], row["Lead_ID"])}<br>` +
                                `${makeWhatsAppLink(row["Whatsapp"], row["Whatsapp"])}<br>` +
                                `${row["Email"]}<br>` +
                                `<button style="display:none" data-toggle="modal" data-target="#exampleModal4" data-whatever="${row["Lead_ID"]}" id="save-id-${index}" onclick="stopRecord('${row["Lead_ID"]}', '${index}')">End Call</button>`;
                        } else {
                            return makeCallLink(row["number"], row["number"]);
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return `${row["State"]}<br>${row["City"]}`;
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["Interested_In"];
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["Source"];
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["status_lead"];
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["DOR"];
                        }
                    },
                },
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        if (row["status"] === 0) {
                            return "-";
                        } else if (row["status"] === 1) {
                            return row["Caller"];
                        }
                    },
                },
                { data: "date" },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (row["status"] === 0) {
                            return `<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onclick="addmissedlead(${row["number"]})">Add Lead</button>`;
                        } else if (row["status"] === 1) {
                            return `<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal4" data-whatever="${row["Lead_ID"]}" onclick="getAllStatus(${row["Lead_ID"]})">Status</button>`;
                        } else {
                            return ""; // Return empty string if status is neither 0 nor 1
                        }
                    },
                },
                { data: "Admin_ID" },
            ],
        });
    } catch (error) {
        console.error("Error fetching missed calls:", error);
        // Optionally, display the error to the user
        displayError(error); // Assuming displayError is defined elsewhere
    }
}

async function getusersnew() {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "getUsers-new-2",
                id: localStorage.getItem("userID"),
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching users: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        // Clear previous options (if needed)
        $("#team-select").empty();

        // Populate the select options
        data.forEach(function (option) {
            $("#team-select").append(
                $("<option>", {
                    value: option.Admin_ID,
                    text: `${option.Name} - ${option.Type}`,
                })
            );
        });

        // Refresh the select picker (if applicable)
        $("#team-select").selectpicker("refresh");

    } catch (error) {
        console.error("Error fetching options:", error);
        // Optionally, display the error to the user
        displayError(error); // Assuming displayError is defined elsewhere
    }
}

async function getAdmins() {
    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                operation: "getMembers",
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching admins: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        // Clear existing options (if needed)
        $("#admin_name").empty();

        // Populate the select options
        data.members.forEach(function (option) {
            $("#admin_name").append(
                $("<option>", {
                    value: option.Admin_ID,
                    text: option.Name,
                })
            );
        });

    } catch (error) {
        console.error("Error fetching options:", error);
        // Optionally, display the error to the user
        displayError(error); // Assuming displayError is defined elsewhere
    }
}










//<====================================================================================================================> 



document.addEventListener("DOMContentLoaded", function () {
    var leadButton = document.getElementById("leadButton");
    var leadButton2 = document.getElementById("leadButton2");

    if (leadButton || leadButton2) {
        if (localStorage.getItem("leadStatus") == 0) {
            leadButton.style.display = "none";
            leadButton2.style.display = "none";
        }
    }

    setInterval(loadcallerstats, 600000);
    setInterval(run15, 15 * 60 * 1000);

    $("#sidebarCollapse").on("click", function () {
        $("#sidebar").toggleClass("active");
    });

    $("#callDetailsoverlay").hide();

    $("#exampleModal4").on("show.bs.modal", function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var recipient = button.data("whatever"); // Extract info from data-* attributes
        console.log("Lead Id : " + recipient);

        var modal = $(this);
        modal.find(".modal-body #leadId").val(recipient);
    });

    var blink = document.getElementById("blink");

    if (blink) {
        setInterval(function () {
            blink.style.opacity = blink.style.opacity == 0 ? 1 : 0;
        }, 700);
    }

    $("#exampleModalAssignProj").on("hidden.bs.modal", function () {
        // Remove elements with class "success-msg", "error-msg", and "loader"
        $(".success-msg, .error-msg, .loader").remove();
        $("#newImageInputDiv").remove();
    });

    $("#exampleModalAssignProj").on("show.bs.modal", function () {
        addTaskImage();
    });

    //add admin name

    $("#sidebarCollapse").after('<a id="admin-name" onclick="redirectcal()" style="color:white">Hi, ' + localStorage.getItem("userName") + " <br>(Your Attendence)</a>");

    $("#tl-select").on("change", function () {
        var selectedTL = $(this).val();
        if (selectedTL) {
            // Make AJAX call to get data based on the selected TL
            $.ajax({
                url: api_url,
                method: "POST",
                data: { operation: "editMembers", tl: selectedTL },
                success: function (response) {
                    var data = JSON.parse(response);
                    // Process the data and update the UI as needed
                    // For example:
                    console.log(data);

                    data.members.forEach(function (option) {
                        var isSelected = false;
                        if (data.selected) {
                            isSelected = data.selected.some((selectedMember) => selectedMember.Admin_ID.trim() === option.Admin_ID.trim());
                        }
                        console.log(isSelected);
                        $("#mb-select").append(
                            $("<option>", {
                                value: option.Admin_ID,
                                text: option.Name + " - " + option.Type,
                                selected: isSelected,
                            })
                        );
                    });

                    $("#mb-select").selectpicker("refresh");
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching data for TL:", error);
                },
            });
        } else {
            // Handle case where no TL is selected (optional)
        }
    });
});


// function getusersnew() {
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "getUsers-new-2", id: localStorage.getItem("userID") },
//         success: function (response) {
//             const data = JSON.parse(response);
//             console.log(data);
//             data.forEach(function (option) {
//                 $("#team-select").append(
//                     $("<option>", {
//                         value: option.Admin_ID,
//                         text: option.Name + " - " + option.Type,
//                     })
//                 );
//             });

//             // Refresh the select picker (if applicable)
//             $("#team-select").selectpicker("refresh");
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }




function redirectcal() {
    var type = localStorage.getItem("userType");
    if (type == "Admin") {
    } else {
        window.location.href = "./CalenderDataUser.html";
    }
}

// function getAdmins() {
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "getMembers" },
//         success: function (response) {
//             data = JSON.parse(response);

//             data.members.forEach(function (option) {
//                 $("#admin_name").append(
//                     $("<option>", {
//                         value: option.Admin_ID,
//                         text: option.Name,
//                     })
//                 );
//             });
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }

// function checkAbsent(id) {
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "checkAbsent", id: id },
//         success: function (response) {
//             var data = JSON.parse(response);

//             if (data.success === true) {
//                 sendMailNew(data.data);
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }

// function checkLate(id) {
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "checkLate", id: id },
//         success: function (response) {
//             var data = JSON.parse(response);

//             if (data.success === true) {
//                 sendMailNew(data.data);
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }

function confirmDelete(){

    input = $("#confirmInput").val();

    //check if input is not null or empty
    if(input != null && input != ""){
        //check if input is Delete no matter case
        if(input.toLowerCase() == "add new"){
            //call delete function
            addAdminmeta();
            $("#cnfclose").click();

        }
        else{
            alert("Please Type Add New to confirm");
        }
    }
    else{
        alert("Please Type Add New to confirm");
    }

}

// function addAdminmeta() {
//     var id = $("#admin_id").val();
//     var emp_id = $("#adminEMP_id").val();
//     var username = $("#admin_name").val();
//     var joined_date = $("#joined_date").val();
//     var reporting_time = $("#reporting_time").val();
//     var attendence_status = $("#attendence_status").val();
//     var basicSalary = $("#basic_salary").val();
//     var allowedWeekOff = $("#allowed_week_off").val();
//     var dueWeekOff = $("#due_week_off").val();
//     var allowedLate = $("#allowed_late").val();
//     var dueLate = $("#due_late").val();
//     var numberOfNodes = $("#number_of_nodes").val();
//     var nodesIncentive = $("#nodes_incentive").val();
//     var numberOfDemos = $("#number_of_demos").val();
//     var demosIncentive = $("#demos_incentive").val();

//     // New fields
//     var userac = $("#user_ac").val();
//     var userifsc = $("#user_ifsc").val();
//     var userupi = $("#user_upi").val();
//     var userPhoneNumber = $("#user_phone_number").val();
//     var userEmail = $("#user_email").val();
//     var addressPresent = $("#address_present").val();
//     var addressPermanent = $("#address_permanent").val();
//     var altContactPerson1 = $("#alt_contact_person_1").val();
//     var altNumber1 = $("#alt_number_1").val();
//     var altContactPerson2 = $("#alt_contact_person_2").val();
//     var altNumber2 = $("#alt_number_2").val();
//     var altContactPerson3 = $("#alt_contact_person_3").val();
//     var altNumber3 = $("#alt_number_3").val();
//     var fileurl = $("#fileurl").val();

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: {
//             operation: "addAdminmeta",
//             id: emp_id,
//             username: username,
//             joined_date: joined_date,
//             reporting_time: reporting_time,
//             attendence_status: attendence_status,
//             basicSalary: basicSalary,
//             allowedWeekOff: allowedWeekOff,
//             dueWeekOff: dueWeekOff,
//             allowedLate: allowedLate,
//             dueLate: dueLate,
//             numberOfNodes: numberOfNodes,
//             nodesIncentive: nodesIncentive,
//             numberOfDemos: numberOfDemos,
//             demosIncentive: demosIncentive,

//             // New fields
//             userPhoneNumber: userPhoneNumber,
//             userEmail: userEmail,
//             addressPresent: addressPresent,
//             addressPermanent: addressPermanent,
//             altContactPerson1: altContactPerson1,
//             altNumber1: altNumber1,
//             altContactPerson2: altContactPerson2,
//             altNumber2: altNumber2,
//             altContactPerson3: altContactPerson3,
//             altNumber3: altNumber3,
//             fileurl: fileurl,
//             userac: userac,
//             userifsc: userifsc,
//             userupi: userupi,
//         },
//         success: function (data) {
//             data = JSON.parse(data);
//             alert(data.message);
//             if (data.success == "true") {
//                 $(".close").click();
//                 $("#admin_name").val("");
//                 $("#joined_date").val("");
//                 $("#reporting_time").val("");
//                 $("#attendence_status").val("");
//                 // Clear new fields
//                 $("#user_phone_number").val("");
//                 $("#user_email").val("");
//                 $("#address_present").val("");
//                 $("#address_permanent").val("");
//                 $("#alt_contact_person_1").val("");
//                 $("#alt_number_1").val("");
//                 $("#alt_contact_person_2").val("");
//                 $("#alt_number_2").val("");
//                 $("#alt_contact_person_3").val("");
//                 $("#alt_number_3").val("");
//                 $("#fileurl").val("");
//                 $("#user_ac").val("");
//                 $("#user_ifsc").val("");
//                 $("#user_upi").val("");
//             }
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

// function updateAdminmeta() {
//     var id = $("#admin_id").val();
//     var username = $("#admin_name").val();
//     var joined_date = $("#joined_date").val();
//     var reporting_time = $("#reporting_time").val();
//     var attendence_status = $("#attendence_status").val();
//     var basicSalary = $("#basic_salary").val();
//     var allowedWeekOff = $("#allowed_week_off").val();
//     var dueWeekOff = $("#due_week_off").val();
//     var allowedLate = $("#allowed_late").val();
//     var dueLate = $("#due_late").val();
//     var numberOfNodes = $("#number_of_nodes").val();
//     var nodesIncentive = $("#nodes_incentive").val();
//     var numberOfDemos = $("#number_of_demos").val();
//     var demosIncentive = $("#demos_incentive").val();

//     // New fields
//     var userac = $("#user_ac").val();
//     var userifsc = $("#user_ifsc").val();
//     var userupi = $("#user_upi").val();
//     var userPhoneNumber = $("#user_phone_number").val();
//     var userEmail = $("#user_email").val();
//     var addressPresent = $("#address_present").val();
//     var addressPermanent = $("#address_permanent").val();
//     var altContactPerson1 = $("#alt_contact_person_1").val();
//     var altNumber1 = $("#alt_number_1").val();
//     var altContactPerson2 = $("#alt_contact_person_2").val();
//     var altNumber2 = $("#alt_number_2").val();
//     var altContactPerson3 = $("#alt_contact_person_3").val();
//     var altNumber3 = $("#alt_number_3").val();
//     var fileurl = $("#fileurl").val();

//     var selectedLeadtype = [];
//     // Loop through each selected option
//     $("#lt-select option:selected").each(function () {
//         selectedLeadtype.push($(this).val());
//     });

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: {
//             operation: "updateAdminmeta",
//             id: id,
//             username: username,
//             joined_date: joined_date,
//             reporting_time: reporting_time,
//             attendence_status: attendence_status,
//             basicSalary: basicSalary,
//             allowedWeekOff: allowedWeekOff,
//             dueWeekOff: dueWeekOff,
//             allowedLate: allowedLate,
//             dueLate: dueLate,
//             numberOfNodes: numberOfNodes,
//             nodesIncentive: nodesIncentive,
//             numberOfDemos: numberOfDemos,
//             demosIncentive: demosIncentive,

//             // New fields
//             userPhoneNumber: userPhoneNumber,
//             userEmail: userEmail,
//             addressPresent: addressPresent,
//             addressPermanent: addressPermanent,
//             altContactPerson1: altContactPerson1,
//             altNumber1: altNumber1,
//             altContactPerson2: altContactPerson2,
//             altNumber2: altNumber2,
//             altContactPerson3: altContactPerson3,
//             altNumber3: altNumber3,
//             fileurl: fileurl,
//             userac: userac,
//             userifsc: userifsc,
//             userupi: userupi,
//             leadType: JSON.stringify(selectedLeadtype),
//         },
//         success: function (data) {
//             data = JSON.parse(data);
//             alert(data.message);
//             if (data.success == "true") {
//                 $(".close").click();
//                 $("#admin_name").val("");
//                 $("#joined_date").val("");
//                 $("#reporting_time").val("");
//                 $("#attendence_status").val("");
//                 // Clear new fields
//                 $("#user_phone_number").val("");
//                 $("#user_email").val("");
//                 $("#address_present").val("");
//                 $("#address_permanent").val("");
//                 $("#alt_contact_person_1").val("");
//                 $("#alt_number_1").val("");
//                 $("#alt_contact_person_2").val("");
//                 $("#alt_number_2").val("");
//                 $("#alt_contact_person_3").val("");
//                 $("#alt_number_3").val("");
//                 $("#fileurl").val("");
//                 $("#user_ac").val("");
//                 $("#user_ifsc").val("");
//                 $("#user_upi").val("");
//             }
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

// function fetchMissedCalls() {
//     var content =
//         '<table id="missedcallTable"  class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Caller</th><th scope="col">Missed Date</th><th scope="col">Option</th><th scope="col">Missed By</th></tr></thead><tbody></tbody> </table>';

//     document.getElementById("displayContent").innerHTML =
//         "<h1>Missed Calls</h1><button class='btn btn-primary' onclick=' addMissedCall()'>Sync</button><div style='overflow-x:scroll;'>" + content;

//     var user = localStorage.getItem("userID");
//     var type = localStorage.getItem("userType");

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "fetchMissedCalls", user: user, type: type },
//         success: function (data) {
//             console.log(data);

//             data = JSON.parse(data);
//             console.log(data);

//             $("#missedcallTable").DataTable({
//                 data: data.data,
//                 order: [[9, "desc"]],
//                 columns: [
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["Lead_ID"];
//                             }
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["Name"];
//                             }
//                         },
//                     },

//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             var index = meta.row;

//                             // Function to create a call link and apply red color if the number matches row['number']
//                             var makeCallLink = function (number, displayText, name, leadid) {
//                                 if (row["status"] == 1) {
//                                     if (number === row["number"]) {
//                                         return `<a href="javascript:void(0)" onclick="makeCall('${name}', '${leadid}', '${number}', '${index}')" style="color:red;">${displayText}</a>`;
//                                     } else {
//                                         return `<a href="javascript:void(0)" onclick="makeCall('${name}', '${leadid}', '${number}', '${index}')" >${displayText}</a>`;
//                                     }
//                                 } else {
//                                     if (number === row["number"]) {
//                                         return `<a href="javascript:void(0)" onclick="makeCall('Missed Call', 'Lead Not Added', '${number}', '${index}')" style="color:red;">${displayText}</a>`;
//                                     } else {
//                                         return `<a href="javascript:void(0)" onclick="makeCall('Missed Call', 'Lead Not Added', '${number}', '${index}')" >${displayText}</a>`;
//                                     }
//                                 }
//                             };

//                             // Function to create a WhatsApp link and apply red color if the number matches row['number']
//                             var makeWhatsAppLink = function (number, displayText) {
//                                 if (number === row["number"]) {
//                                     return '<a href="https://api.whatsapp.com/send?phone=91' + number + '" style="color: red;">' + displayText + "</a>";
//                                 } else {
//                                     return '<a href="https://api.whatsapp.com/send?phone=91' + number + '">' + displayText + "</a>";
//                                 }
//                             };

//                             if (row["status"] == 1) {
//                                 data =
//                                     makeCallLink(row["Mobile"], row["Mobile"], row["Name"], row["Lead_ID"]) +
//                                     "<br>" +
//                                     makeCallLink(row["Alternate_Mobile"], row["Alternate_Mobile"], row["Name"], row["Lead_ID"]) +
//                                     "<br>" +
//                                     makeWhatsAppLink(row["Whatsapp"], row["Whatsapp"]) +
//                                     "<br>" +
//                                     row["Email"] +
//                                     "<br>" +
//                                     '<button style="display:none" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
//                                     row["Lead_ID"] +
//                                     '" id="save-id-' +
//                                     index +
//                                     '" onclick="stopRecord(\'' +
//                                     row["Lead_ID"] +
//                                     "', '" +
//                                     index +
//                                     "')\">End Call</button>";
//                             } else {
//                                 data = makeCallLink(row["number"], row["number"]);
//                             }
//                             return data;
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["State"] + "<br>" + row["City"];
//                             }
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["Interested_In"];
//                             }
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["Source"];
//                             }
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["status_lead"];
//                             }
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["DOR"];
//                             }
//                         },
//                     },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             if (row["status"] == 0) {
//                                 return "-";
//                             } else if (row["status"] == 1) {
//                                 return row["Caller"];
//                             }
//                         },
//                     },
//                     { data: "date" },
//                     {
//                         data: null,
//                         render: function (data, type, row) {
//                             console.log(row);
//                             if (row["status"] == 0) {
//                                 return (
//                                     '<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onclick="addmissedlead(' +
//                                     row["number"] +
//                                     ')">Add Lead</button>'
//                                 );
//                             } else if (row["status"] == 1) {
//                                 return (
//                                     '<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
//                                     row["Lead_ID"] +
//                                     '" onclick="getAllStatus(' +
//                                     row["Lead_ID"] +
//                                     ')">Status</button>'
//                                 );
//                             } else {
//                                 return ""; // Return empty string if status is neither 0 nor 1
//                             }
//                         },
//                     },
//                     { data: "Admin_ID" },
//                 ],
//             });
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

function addmissedlead(mobile) {
    $("#mobile").val(mobile);
}

// function searchLeads(query, filename) {
//     if (query.length < 3) {
//         // Do not search if the query is less than 3 characters
//         document.getElementById("searchResults").style.display = "none";
//         document.getElementById("selectButtonContainer").innerHTML = ""; // Hide the button
//         return;
//     }
//     console.log(query, filename);
//     $.ajax({
//         url: api_url, // Your PHP endpoint
//         method: "POST",
//         data: {
//             operation: "leadSearch",
//             query: query,
//         },
//         success: function (response) {
//             try {
//                 const results = JSON.parse(response);
//                 displayResults(results, filename);
//             } catch (error) {
//                 console.error("Error parsing response:", error);
//                 document.getElementById("searchResults").innerHTML = "Error fetching results";
//                 document.getElementById("searchResults").style.display = "block";
//                 document.getElementById("selectButtonContainer").innerHTML = ""; // Hide the button
//             }
//         },
//         error: function (error) {
//             console.error("Error fetching results:", error);
//             document.getElementById("searchResults").innerHTML = "Error fetching results";
//             document.getElementById("searchResults").style.display = "block";
//             document.getElementById("selectButtonContainer").innerHTML = ""; // Hide the button
//         },
//     });
// }

function displayResults(results, filename) {
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    if (results.length > 0) {
        results.forEach((result) => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("result-item");
            resultItem.textContent = `${result.leadName} - ${result.phone}`;
            resultItem.onclick = () => selectLead(result, filename);
            resultsContainer.appendChild(resultItem);
        });
        resultsContainer.style.display = "block";
    } else {
        resultsContainer.innerHTML = "No results found";
        resultsContainer.style.display = "block";
    }
}

function selectLead(lead, filename) {
    console.log("Selected lead:", lead);
    document.getElementById("searchInput").value = `${lead.leadName} - ${lead.phone}`;
    document.getElementById("searchResults").innerHTML = "";
    document.getElementById("searchResults").style.display = "none";

    const selectButtonContainer = document.getElementById("selectButtonContainer");
    selectButtonContainer.innerHTML = `<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal4" onclick="prepareModal('${filename}', '${lead.Lead_ID}')"  data-whatever="${lead.Lead_ID}"> Upload</button>`;
    selectButtonContainer.style.display = "inline-block";
}

function handleSelection() {
    const selectButton = document.querySelector("#selectButtonContainer button");
    const leadId = selectButton.getAttribute("data-whatever");
    alert(`You selected lead ID: ${leadId}`);
    // Hide the button after the action is taken
    selectButtonContainer.style.display = "none";
}

// function addMissedCall() {
//     console.log("Tring adding Missed call");
//     var id = localStorage.getItem("userID");
//     document.addEventListener(
//         "deviceready",
//         function () {
//             const days = 1; // Fetch logs from the last 7 days

//             cordova.plugins.callLog.list(
//                 days,
//                 function (response) {
//                     const missedCalls = response.rows.filter((call) => call.type == 3);
//                     var json = JSON.stringify(missedCalls);

//                     $.ajax({
//                         url: api_url,
//                         method: "POST",
//                         data: { operation: "addmissedcall", calls: json, id: id },
//                         success: function (response) {
//                             console.log(response);
//                         },
//                         error: function (xhr, status, error) {
//                             console.error("Error fetching call logs:", error); // Debug log
//                         },
//                     });
//                 },
//                 function (error) {
//                     console.error("Error fetching call logs:", error); // Debug log
//                 }
//             );
//         },
//         false
//     );
// }

// function syncSheet() {
//     $(".loader").show();
//     $.ajax({
//         url: "https://teamka.in/crm1/APIs/ash_auto_lead_add.php",
//         method: "POST",
//         success: function (response) {
//             //var response = JSON.parse(responseout);
//             console.log(response);
//             alert(response);

//             $(".loader").hide();
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//             $(".loader").hide();
//         },
//     });
// }

function generateDateRanges(start2, end2) {
    const startDate2 = new Date(start2);
    const endDate2 = new Date(end2);

    // Calculate the interval length between start2 and end2
    const intervalDays = (endDate2 - startDate2) / (1000 * 60 * 60 * 24);

    // Calculate start1 as start2 minus the interval
    const start1 = new Date(startDate2);
    start1.setDate(start1.getDate() - intervalDays); // Move back by the interval

    // Calculate end1 as start1 plus the interval
    const end1 = new Date(start1);
    end1.setDate(end1.getDate() + intervalDays); // Maintain the same interval as start2 and end2

    // Format dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split("T")[0];

    return {
        start1: formatDate(start1),
        end1: formatDate(end1),
        start2: formatDate(startDate2), // Return original start2
        end2: formatDate(endDate2), // Return original end2
    };
}

function generateReport() {
    console.log("generateReport called");
    var start2 = $("#reportStartDate").val(); // Get the value of the input
    var end2 = $("#reportEndDate").val(); // Get the value of the input

    //fetchAllReports(start, end);
    //fetchExpenseReportcomb(start, end, start, end)
    if (start2 && end2) {
        // Generate date ranges using the retrieved dates
        const { start1, end1 } = generateDateRanges(start2, end2);
         console.log(start1, end1, start2, end2);
        // Call test23 with the returned dates
        fetchExpenseReportcomb(start1, end1, start2, end2);
    } else {
        console.error("start2 and end2 not found in local storage.");
    }
}
// function fetchExpenseReportcomb(start1, end1, start2, end2) {
//     // Helper function to fetch reports for a specific date range
//     function fetchAllReports(start, end) {
//         $(".loader").show();

//         return Promise.all([
//             $.ajax({
//                 url: api_url,
//                 method: "POST",
//                 data: { operation: "expenseReport", start: start, end: end },
//             }),
//             $.ajax({
//                 url: api_url,
//                 method: "POST",
//                 data: { operation: "expenseReport-2", start: start, end: end },
//             }),
//             $.ajax({
//                 url: api_url,
//                 method: "POST",
//                 data: { operation: "expenseReport-3", start: start, end: end },
//             }),
//             $.ajax({
//                 url: api_url,
//                 method: "POST",
//                 data: { operation: "expenseReport-4", start: start, end: end },
//             }),
//         ]);
//     }

//     let datamain1, datamain2;

//     // Fetch data for the first date range
//     fetchAllReports(start2, end2)
//         .then(function (responses1) {
//             console.log("responses1:", responses1);
//             // Parse the responses
//             const data1 = JSON.parse(responses1[0]);
//             const data2 = JSON.parse(responses1[1]);
//             const data3 = JSON.parse(responses1[2]);
//             const data4 = JSON.parse(responses1[3]);

//             // Structure datamain1 to allow access like datamain1.data1.totals.spend_mygalla
//             datamain1 = {
//                 data1: data1, // Replace 'data1' with the actual key based on your API response structure
//                 data2: data2, // Similarly replace 'data2' based on your API response
//                 data3: data3, // Replace 'data3' based on your API response
//                 data4: data4, // Replace 'data4' based on your API response
//             };

//             console.log("datamain1:", datamain1); // Log first set of processed data

//             // Fetch data for the second date range
//             return fetchAllReports(start1, end1);
//         })
//         .then(function (responses2) {
//             console.log("responses2:", responses2);
//             // Parse the second set of responses
//             const data1_2 = JSON.parse(responses2[0]);
//             const data2_2 = JSON.parse(responses2[1]);
//             const data3_2 = JSON.parse(responses2[2]);
//             const data4_2 = JSON.parse(responses2[3]);

//             // Structure datamain2 similarly
//             datamain2 = {
//                 data1: data1_2,
//                 data2: data2_2,
//                 data3: data3_2,
//                 data4: data4_2,
//             };

//             console.log("datamain2:", datamain2); // Log second set of processed data
//            generateCombinedTable(start2, end2, datamain1, datamain2)
//         })
//         .catch(function (error) {
//             console.error("Error fetching or processing data:", error);
//         });
// }
function generateCombinedTable(start, end, dataMain1, dataMain2) {

    $(".loader").hide();
    function getComparisonArrow(current, previous, type) {
        //parse int to avoid error
        current = parseInt(current);
        previous = parseInt(previous);
        let arrow;
        let difference = Math.abs(current - previous); // Calculate the absolute difference
        console.log(current, previous);
            
        if (type == 1) {
            if (current > previous) {
                arrow = `<i class="fa fa-arrow-up text-danger"></i> <span>(+${difference})</span>`; // Value increased
            } else if (current < previous) {
                arrow = `<i class="fa fa-arrow-down text-success"></i> <span>(-${difference})</span>`;// Value decreased
            } else if (current == previous) {
                arrow = '<i class="fa fa-circle text-muted"></i> <span>(0)</span>'; // No change
            } else {
                arrow = ""; // No change
            }
        } else {
            if (current > previous) {
                arrow = `<i class="fa fa-arrow-up text-success"></i> <span>(+${difference})</span>`;// Value increased
            } else if (current < previous) {
                arrow = `<i class="fa fa-arrow-down text-danger"></i> <span>(-${difference})</span>`;// Value decreased
            } else if (current == previous) {
                arrow = '<i class="fa fa-circle text-muted"></i> <span>(0)</span>'; // No change
            } else {
                console.log(current, previous);
                arrow = ""; // No change
            }
        }
    
        return arrow; // Return the arrow with the difference
    }
    

    // Function to safely parse data
const parseSafe = (value) => (value !== undefined ? value : 0);

// Fetching data safely
const spendMyGalla = parseSafe(dataMain1.data1.totals.spend_mygalla);
const leadMyGalla = parseSafe(dataMain1.data1.totals.lead_mygalla);
const spendDM = parseSafe(dataMain1.data1.totals.spend_DM);
const leadDM = parseSafe(dataMain1.data1.totals.lead_DM);
const spendOther = parseSafe(dataMain1.data1.totals.spend_other);
const leadOther = parseSafe(dataMain1.data1.totals.lead_other);

const noDuesMyGalla = parseSafe(dataMain1.data3.noDuesLeadCounts.noDues_mygalla);
const noDuesDM = parseSafe(dataMain1.data3.noDuesLeadCounts.noDues_dm);
const noDuesOther = parseSafe(dataMain1.data3.noDuesLeadCounts.noDues_other);

const totalExpenseMyGalla = parseSafe(dataMain1.data1.totals.total_expense_mygalla);
const totalExpenseDM = parseSafe(dataMain1.data1.totals.total_expense_DM);
const totalExpenseOther = parseSafe(dataMain1.data1.totals.total_expense_other);

const totalPaymentAmount1 = parseSafe(dataMain1.data3.totalPaymentAmount1);
const totalPaymentAmount2 = parseSafe(dataMain1.data3.totalPaymentAmount2);
const totalPaymentAmount3 = parseSafe(dataMain1.data3.totalPaymentAmount3);

const leadCountMyGalla = parseSafe(dataMain1.data4.leadCounts.mygalla);
const avgDaysDifferenceMyGalla = parseSafe(dataMain1.data4.averageDaysDifference.mygalla);

const leadCountDM = parseSafe(dataMain1.data4.leadCounts.dm_dmcourse_wdc);
const avgDaysDifferenceDM = parseSafe(dataMain1.data4.averageDaysDifference.dm_dmcourse_wdc);

const leadCountOther = parseSafe(dataMain1.data4.leadCounts.other);
const avgDaysDifferenceOther = parseSafe(dataMain1.data4.averageDaysDifference.other);

// Calculate percentage values and financials safely
const percentageNoDuesMyGalla = leadMyGalla > 0 ? Math.round((noDuesMyGalla / leadMyGalla) * 100) : 0;
const percentageNoDuesDM = leadDM > 0 ? Math.round((noDuesDM / leadDM) * 100) : 0;
const percentageNoDuesOther = leadOther > 0 ? Math.round((noDuesOther / leadOther) * 100) : 0;

const profitMyGalla = totalPaymentAmount1 - totalExpenseMyGalla;
const refProfitMyGalla = dataMain2.data3.totalPaymentAmount1 - dataMain2.data1.totals.total_expense_mygalla;
const patMyGalla = Math.round(profitMyGalla * 0.7);
const refPatMyGalla = Math.round(refProfitMyGalla * 0.7);

const profitDM = totalPaymentAmount2 - totalExpenseDM;
const refProfitDM = dataMain2.data3.totalPaymentAmount2 - dataMain2.data1.totals.total_expense_DM;
const patDM = Math.round(profitDM * 0.7);
const refPatDM = Math.round(refProfitDM * 0.7);

const profitOther = totalPaymentAmount3 - totalExpenseOther;
const refProfitOther = dataMain2.data3.totalPaymentAmount3 - dataMain2.data1.totals.total_expense_other;
const patOther = Math.round(profitOther * 0.7);
const refPatOther = Math.round(refProfitOther * 0.7);

const cplMygalla = Math.round(spendMyGalla / leadMyGalla) ;
const cplDM = Math.round(spendDM / leadDM) ;
const cplOther = Math.round(spendOther / leadOther) ;

const refcplMygalla = Math.round(dataMain2.data1.totals.spend_mygalla / dataMain2.data1.totals.lead_mygalla) ;
const refcplDM = Math.round(dataMain2.data1.totals.spend_DM / dataMain2.data1.totals.lead_DM) ;
const refcplOther = Math.round(dataMain2.data1.totals.spend_other / dataMain2.data1.totals.lead_other) ;

const cacMygalla = Math.round(spendMyGalla / noDuesMyGalla) ;
const cacDM = Math.round(spendDM / noDuesDM) ;
const cacOther = Math.round(spendOther / noDuesOther) ;

const refcacMygalla = Math.round(dataMain2.data1.totals.spend_mygalla / dataMain2.data3.noDuesLeadCounts.noDues_mygalla) ;
const refcacDM = Math.round(dataMain2.data1.totals.spend_DM / dataMain2.data3.noDuesLeadCounts.noDues_dm) ;
const refcacOther = Math.round(dataMain2.data1.totals.spend_other / dataMain2.data3.noDuesLeadCounts.noDues_other) ;

const cacmMygalla = Math.round(totalExpenseMyGalla / noDuesMyGalla) ;
const cacmDM = Math.round(totalExpenseDM / noDuesDM) ;
const cacmOther = Math.round(totalExpenseOther / noDuesOther) ;

const refcammMygalla = Math.round(dataMain2.data1.totals.total_expense_mygalla / dataMain2.data3.noDuesLeadCounts.noDues_mygalla) ;
const refcammDM = Math.round(dataMain2.data1.totals.total_expense_DM / dataMain2.data3.noDuesLeadCounts.noDues_dm) ;
const refcammOther = Math.round(dataMain2.data1.totals.total_expense_other / dataMain2.data3.noDuesLeadCounts.noDues_other) ;



// Creating the report content
var content = `
    <h3 class="text-center m-3">From ${start} to ${end}</h3>
    <table id="combinedReportTable" class="display table table-bordered table-striped" style="width:100%">
        <thead>
            <tr>
                <th>No Of Leads</th>
                <th>CPL</th>
                <th>Unanswered Lead</th>
                <th>Demo Done</th>
                <th>Conversion</th>
                <th>CAC (M)</th>
                <th>CAC (ALL)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>MY GALLA</td>
                <td><a href="" onclick="getcpls('mygalla')" data-toggle="modal" data-target="#exampleModalviewcpl">₹${spendMyGalla} </a> / ${leadMyGalla} = ₹${cplMygalla} ${getComparisonArrow(cplMygalla, refcplMygalla,1)}</td>
                <td>${parseSafe(dataMain1.data2.leadCounts.unassigned_mygalla)} ${getComparisonArrow(parseSafe(dataMain1.data2.leadCounts.unassigned_mygalla), parseSafe(dataMain2.data2.leadCounts.unassigned_mygalla),1)}</td>
                <td>${parseSafe(dataMain1.data2.demoCounts.demo_mygalla)} ${getComparisonArrow(parseSafe(dataMain1.data2.demoCounts.demo_mygalla), parseSafe(dataMain2.data2.demoCounts.demo_mygalla),2)}</td>
                <td>${noDuesMyGalla}/${percentageNoDuesMyGalla}% ${getComparisonArrow(noDuesMyGalla, dataMain2.data3.noDuesLeadCounts.noDues_mygalla,2)}</td>
                <td>₹${spendMyGalla} / ${noDuesMyGalla} = ₹${cacMygalla} ${getComparisonArrow(cacMygalla, refcacMygalla,2)}</td>
                <td>₹${totalExpenseMyGalla} / ${noDuesMyGalla} = ₹${cacmMygalla} ${getComparisonArrow(cacmMygalla, refcammMygalla,2)}</td>
            </tr>
            <tr>
                <td>DM, DM Course, WDC</td>
                <td><a href="" onclick="getcpls('dm')" data-toggle="modal" data-target="#exampleModalviewcpl">₹${spendDM}</a> / ${leadDM} = ₹${cplDM} ${getComparisonArrow(cplDM, refcplDM,1)}</td>
                <td>${parseSafe(dataMain1.data2.leadCounts.unassigned_dm)} ${getComparisonArrow(parseSafe(dataMain1.data2.leadCounts.unassigned_dm), parseSafe(dataMain2.data2.leadCounts.unassigned_dm),1)}</td>
                <td>${parseSafe(dataMain1.data2.demoCounts.demo_dm)} ${getComparisonArrow(parseSafe(dataMain1.data2.demoCounts.demo_dm), parseSafe(dataMain2.data2.demoCounts.demo_dm),2)}</td>
                <td>${noDuesDM}/${percentageNoDuesDM}% ${getComparisonArrow(noDuesDM, dataMain2.data3.noDuesLeadCounts.noDues_dm,2)}</td>
                <td>₹${spendDM} / ${noDuesDM} = ₹${cacDM} ${getComparisonArrow(cacDM, refcacDM,2)}</td>
                <td>₹${totalExpenseDM} / ${noDuesDM} = ₹${cacmDM} ${getComparisonArrow(cacmDM, refcammDM,2)}</td>
            </tr>
            <tr>
                <td>Other</td>
                <td><a href="" onclick="getcpls('other')" data-toggle="modal" data-target="#exampleModalviewcpl">₹${spendOther}</a> / ${leadOther} = ₹${cplOther} ${getComparisonArrow(cplOther, refcplOther,1)}</td>
                <td>${parseSafe(dataMain1.data2.leadCounts.unassigned_other)} ${getComparisonArrow(parseSafe(dataMain1.data2.leadCounts.unassigned_other), parseSafe(dataMain2.data2.leadCounts.unassigned_other),1)}</td>
                <td>${parseSafe(dataMain1.data2.demoCounts.demo_other)} ${getComparisonArrow(parseSafe(dataMain1.data2.demoCounts.demo_other), parseSafe(dataMain2.data2.demoCounts.demo_other),2)}</td>
                <td>${noDuesOther}/${percentageNoDuesOther}% ${getComparisonArrow(noDuesOther, dataMain2.data3.noDuesLeadCounts.noDues_other,2)}</td>
                <td>₹${spendOther} / ${noDuesOther} = ₹${cacOther} ${getComparisonArrow(cacOther, refcacOther,2)}</td>
                <td>₹${totalExpenseOther} / ${noDuesOther} = ₹${cacmOther} ${getComparisonArrow(cacmOther, refcammOther,2)}</td>
                
            </tr>
            <tr>
                <td colspan="7">Projects</td>
            </tr>
            <tr>
                <th>Projects</th>
                <th>Time To Live</th>
                <th>Avg Orders in 7 Days</th>
                <th>Transaction</th>
                <th>Profit</th>
                <th>PAT</th>
            </tr>
            <tr>
                <td>MY GALLA</td>
                <td>${leadCountMyGalla} / ${avgDaysDifferenceMyGalla}</td>
                <td>0</td>
                <td><a href="" onclick="getTrancations('mygalla')" data-toggle="modal" data-target="#exampleModalviewtranc">₹${totalPaymentAmount1} ${getComparisonArrow(totalPaymentAmount1,parseSafe(dataMain2.data3.totalPaymentAmount1) ,2)}</a></td>
                <td>₹${profitMyGalla} ${getComparisonArrow(profitMyGalla, refProfitMyGalla,2)}</td>
                <td>₹${patMyGalla} ${getComparisonArrow(patMyGalla, refPatMyGalla,2)}</td>
            </tr>
            <tr>
                <td>DM, DM Course, WDC</td>
                <td>${leadCountDM} / ${avgDaysDifferenceDM}</td>
                <td>0</td>
                <td><a href="" onclick="getTrancations('dm')" data-toggle="modal" data-target="#exampleModalviewtranc">₹${totalPaymentAmount2} ${getComparisonArrow(totalPaymentAmount2,parseSafe(dataMain2.data3.totalPaymentAmount2) ,2)}</a></td>
                <td>₹${profitDM} ${getComparisonArrow(profitDM, refProfitDM,2)}</td>
                <td>₹${patDM} ${getComparisonArrow(patDM, refPatDM,2)}</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>${leadCountOther} / ${avgDaysDifferenceOther}</td>
                <td>0</td>
                <td><a href="" onclick="getTrancations('other')" data-toggle="modal" data-target="#exampleModalviewtranc">₹${totalPaymentAmount3} ${getComparisonArrow(totalPaymentAmount3,parseSafe(dataMain2.data3.totalPaymentAmount3) ,2)}</a></td>
                <td>₹${profitOther} ${getComparisonArrow(profitOther, refProfitOther,2)}</td>
                <td>₹${patOther} ${getComparisonArrow(patOther, refPatOther,2)}</td>
            </tr>
        </tbody>
    </table>
    <br>
`;

    document.getElementById("displayContent").innerHTML = "<h1>Expense Report</h1><div style='overflow-x:scroll;'>" + content + "</div>";
}

// function getcpls(type) {
//     var start = $("#reportStartDate").val(); // Get the value of the input
//     var end = $("#reportEndDate").val(); // Get the value of the input

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "getcpls", start: start, end: end, type: type },
//         success: function (response) {
//              response = JSON.parse(response);
//             if (response.success) {
//                 var content = `
                        
//                          <div class='container mt-5' style='overflow-x:scroll;'>
//                              <table id="expensetable" class="table table-bordered table-striped">
//                                  <thead>
//                                      <tr>
//                                          <th>ID</th>
//                                          <th>Amount</th>
//                                          <th>Expense For</th>
//                                          <th>Remarks</th>
//                                          <th>PD_ID</th>
//                                          <th>Proff</th>
//                                          <th>Date Of Expense</th>
//                                          <th>DOR</th>
//                                          <th>Expense For</th>
//                                          <th>Expense Pourpose</th>
//                                          <th>Expense Account</th>
//                                          <th>Option</th>
//                                      </tr>
//                                  </thead>
//                              </table>
//                          </div>`;

                
//                 document.getElementById("tablereportcpl").innerHTML = content ;

//                 // Initialize DataTable with the JSON data
//                 $("#expensetable").DataTable({
//                     data: response.data,
//                     order: [[0, "desc"]],

//                     columns: [
//                         { data: "ET_ID" },
//                         { data: "EXP_Amount" },
//                         { data: "Expense_For" },
//                         { data: "Remark" },
//                         { data: "PD_ID" },
//                         { data: "Proff" },
//                         { data: "Date_Of_Expense" },
//                         { data: "DOR" },
//                         {
//                             data: null,
//                             render: function (data, type, row) {
//                                 if (row["EXP_For"]) {
//                                     switch (row["EXP_For"]) {
//                                         case "1":
//                                             return "Academy";
//                                         case "2":
//                                             return "Agency";
//                                         case "3":
//                                             return "My Galla";
//                                         default:
//                                             return row["EXP_For"];
//                                     }
//                                 }
//                                 return "";
//                             },
//                         },
//                         {
//                             data: null,
//                             render: function (data, type, row) {
//                                 console.log(row["Expense_Purpose"] == 1);
//                                 if (row["Expense_Purpose"]) {
//                                     switch (row["Expense_Purpose"]) {
//                                         case "1":
//                                             return "Marketing";
//                                         case "2":
//                                             return "Salary";
//                                         case "3":
//                                             return "Rent";
//                                         case "4":
//                                             return "Other";
//                                         default:
//                                             return row["Expense_Purpose"];
//                                     }
//                                 }
//                                 return "";
//                             },
//                         },
//                         {
//                             data: null,
//                             render: function (data, type, row) {
//                                 if (row["From_Account"]) {
//                                     switch (row["From_Account"]) {
//                                         case "1":
//                                             return "GreenTech India";
//                                         case "2":
//                                             return "Axis (Vikash)";
//                                         case "3":
//                                             return "Kotak (Vikash)";
//                                         case "4":
//                                             return "Other";
//                                         case "5":
//                                             return "Cash";
//                                         case "6":
//                                             return "My Galla HDFC";
//                                         case "7":
//                                             return "Kalam Foundation Axis Bank";
//                                         default:
//                                             return row["From_Account"];
//                                     }
//                                 }
//                                 return "";
//                             },
//                         },
//                         {
//                             data: null,
//                             render: function (data, type, row) {
//                                 return (
//                                     '<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModalExpenseEdit" onclick="editExpense(' +
//                                     row["ET_ID"] +
//                                     ')">Edit</button>'
//                                 );
//                             },
//                         },
//                     ],
//                 });
//             } else {
//                 alert("Failed to fetch data");
//             }
            
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//             $(".loader").hide();
//         },
//     });
// }

// function getTrancations(type) {
//     var start = $("#reportStartDate").val(); // Get the value of the input
//     var end = $("#reportEndDate").val(); // Get the value of the input

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "getTrancations", start: start, end: end, type: type },
//         success: function (response) {
//             //var response = JSON.parse(responseout);
//             console.log(response);
//             var partial = response.split("/END/");
//             var len = partial.length - 1;
//             var content =
//                 "<table id='tabletransPayment' class='mt-5 table table-striped table-bordered'><thead><th>Project Name</th><th>Lead Name</th><th>Amount</th><th>Proof</th><th>Remark</th><th>DOR</th><th>VERIFY</th><th>DELETE</th></thead><tbody>";
//             for (let i = 0; i < len; i++) {
//                 var element = partial[i].split("<-->");
//                 var test = element[9];
//                 if (parseInt(element[8]) == 0) {
//                     content +=
//                         "<tr><td>" +
//                         element[2] +
//                         "</td><td>" +
//                         element[3] +
//                         "</td><td>" +
//                         element[4] +
//                         "</td><td><a href='" +
//                         element[5] +
//                         "' target='_blank'><b>Cilck here</b></a></td><td><b>Updated By: </b>" +
//                         test +
//                         "<hr>" +
//                         element[6] +
//                         "</td><td>" +
//                         element[7] +
//                         "</td><td><button onclick='unverifiedVerify(" +
//                         element[0] +
//                         ")'>VERIFY</button></td><td><button onclick='unverifiedDelete(" +
//                         element[0] +
//                         ")'>DELETE</button></td></tr>";
//                 } else if (parseInt(element[8]) == 1) {
//                     content +=
//                         "<tr><td>" +
//                         element[2] +
//                         "</td><td>" +
//                         element[3] +
//                         "</td><td>" +
//                         element[4] +
//                         "</td><td><a href='" +
//                         element[5] +
//                         "' target='_blank'><b>Cilck here</b></a></td><td><b>Updated By: </b>" +
//                         test +
//                         "<hr>" +
//                         element[6] +
//                         "</td><td>" +
//                         element[7] +
//                         "</td><td>Verified</td><td><button onclick='unverifiedDelete(" +
//                         element[0] +
//                         ")'>DELETE</button></td></tr>";
//                 }
//             }
//             document.getElementById("tablereporttrans").innerHTML = content + "</tbody></table>";
//             $("#tabletransPayment").DataTable({ stateSave: true });
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//             $(".loader").hide();
//         },
//     });
// }

function expenseReportTable() {
    var content = `<table id="example" class="display  table table-bordered table-striped " style="width:100%">
        <thead>
            <tr>
                <th>No Of Leads</th>
                <th>CPL</th>
                <th>Unanswered Lead</th>
                <th>Demo Done</th>
                <th>Conversion</th>
                <th>CAC (M)</th>
                <th>CAC (ALL)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Row 1, Cell 1</td>
                <td>Row 1, Cell 2</td>
                <td>Row 1, Cell 3</td>
            </tr>
            <tr>
                <td>Row 2, Cell 1</td>
                <td>Row 2, Cell 2</td>
                <td>Row 2, Cell 3</td>
            </tr>
            <tr>
                <td>Row 3, Cell 1</td>
                <td>Row 3, Cell 2</td>
                <td>Row 3, Cell 3</td> 
            </tr>
            <tr> 
                <td>Row 4, Cell 1</td>
                <td>Row 4, Cell 2</td>
                <td>Row 4, Cell 3</td>
            </tr>
        </tbody>
    </table>`;

    document.getElementById("displayContent").innerHTML = "<h1>Expense Report </h1><div style='overflow-x:scroll;'>" + content;
}

function getStatstl() {
    var start = $("#startDatetl").val();
    var end = $("#endDatetl").val();
    var callers = $("#team-select").val();

    localStorage.setItem("start", start);
    localStorage.setItem("end", end);
    localStorage.setItem("teamMembers", JSON.stringify(callers));

    var newUrl = "https://teamka.in/Live/www/NewTLdata.html";

    // Open the new URL in a new window/tab
    window.open(newUrl, "_blank");
}

// function showTeam() {
//     $(".loader").show();
//     var tl = localStorage.getItem("userID");
//     var content =
//         '<table id="membersTable" class="display" style="width:100%"><thead><tr> <th>Admin ID</th> <th>Member Name</th><th>Attendence</th></tr></thead><tbody></tbody></table>';

//     document.getElementById("displayContent").innerHTML = "<h1>MY Team </h1><div style='overflow-x:scroll;'>" + content;
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "showMembers", tl: tl },
//         success: function (response) {
//             data = JSON.parse(response);
//             console.log(data);
//             var callers = data.data;

//             $("#membersTable").DataTable({
//                 data: callers, // Initially empty data
//                 columns: [
//                     { data: "Admin_ID" },
//                     { data: "Name" },
//                     {
//                         data: null,

//                         render: function (data, type, row) {
//                             console.log(row);
//                             return '<button class="btn btn-success" onclick="showAttendence(' + row["Admin_ID"] + ')">Show</button>';
//                         },
//                     },
//                 ],
//             });

//             $(".loader").hide();
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }

// function addMember() {
//     var tl = $("#tl-select").val();
//     var selectedValues = [];
//     // Loop through each selected option
//     $("#mb-select option:selected").each(function () {
//         selectedValues.push($(this).val());
//     });

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: {
//             operation: "addMembers",
//             tl: tl,
//             members: JSON.stringify(selectedValues),
//         },
//         success: function (response) {
//             if (response == 1) {
//                 alert("Data Inserted successfully");
//                 $(".close").click();
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }

// function getMembers() {
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "getMembers" },
//         success: function (response) {
//             data = JSON.parse(response);
//             console.log(data);
//             //Clear existing options
//             $("#tl-select").empty();
//             $("#mb-select").empty();

//             $("#tl-select").append(
//                 $("<option>", {
//                     value: "",
//                     text: "Please Select TL",
//                 })
//             );

//             // Populate options
//             data.TL.forEach(function (option) {
//                 $("#tl-select").append(
//                     $("<option>", {
//                         value: option.Admin_ID,
//                         text: option.Name + " - " + option.Type,
//                     })
//                 );
//             });
//             $("#mb-select").selectpicker("refresh");
//             $("#tl-select").selectpicker("refresh");
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching options:", error);
//         },
//     });
// }

function getToday() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0
    var day = String(today.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function getLast30Days() {
    // Get today's date
    var today = new Date();

    // Subtract 30 days from today's date
    var last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Format the date to yyyy-mm-dd format
    var year = last30Days.getFullYear();
    var month = String(last30Days.getMonth() + 1).padStart(2, "0");
    var day = String(last30Days.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function run15() {
    console.log("runned");
    callerDataMonth();
    callerDataToday();
    addMissedCall();
}

//     import from html

// function callerDataMonth() {
//     var id = localStorage.getItem("userID");
//     var to = getToday();
//     var from = getLast30Days();

//     //console.log(from,to);
//     $.ajax({
//         url: api_url,
//         method: "POST", // You can use "GET" if appropriate
//         data: { operation: "007-month", id: id, to: to, from: from },
//         success: function (response) {
//             let result = JSON.parse(response);
//             console.log(result);

//             $("#brk-time .month").html("30 Days: " + result.bt);
//             $("#tot-dial .month").html("30 Days: " + result.call_today);
//             $("#tot-concted .month").html("30 Days: " + result.countConnected);
//             $("#tot-not-concted .month").html("30 Days: " + result.countNotConnected);
//             $("#call-durt .month").html("30 Days: " + result.callDuration);
//             $("#demo .month").html("30 Days: " + result.demo);
//             $("#follow .month").html("30 Days: " + result.follow);
//             $("#monster .month").html("30 Days: " + result.call_count);
//             $("#nrced .month").html("30 Days: " + result.notRecorded);
//             $("#fakedemo .month").html("30 Days: " + result.fakedemo + "/" + result.incomdemo);
//         },
//         error: function (xhr, status, error) {
//             console.error("AJAX Error: " + status, error);
//         },
//     });
// }

// function callerDataToday() {
//     var id = localStorage.getItem("userID");

//     $.ajax({
//         url: api_url,
//         method: "POST", // You can use "GET" if appropriate
//         data: { operation: "test1", id: id },
//         success: function (response) {
//             let result = JSON.parse(response);
//             //console.log(result);

//             $("#brk-time .today").html("Today: " + result.bt);
//             $("#tot-dial .today").html("Today: " + result.call_today);
//             $("#tot-concted .today").html("Today: " + result.countConnected);
//             $("#tot-not-concted .today").html("Today: " + result.countNotConnected);
//             $("#call-durt .today").html("Today: " + result.callDuration);
//             $("#demo .today").html("Today: " + result.demo);
//             $("#follow .today").html("Today: " + result.follow);
//             $("#monster .today").html("Today: " + result.call_count);
//             $("#nrced .today").html("Today: " + result.notRecorded);
//         },
//         error: function (xhr, status, error) {
//             console.error("AJAX Error: " + status, error);
//         },
//     });
// }

//  image compression

async function resizeAndUpload(file, maxWidth = 600, maxHeight = 600) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const image = new Image();
            image.src = event.target.result;
            image.onload = async function () {
                const canvas = document.createElement("canvas");
                let width = image.width;
                let height = image.height;

                // Calculate new dimensions while preserving aspect ratio
                let aspectRatio = width / height;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob], file.name, {
                        type: "image/jpeg",
                    });
                    resolve(resizedFile);
                }, "image/jpeg");
            };
        };
        reader.readAsDataURL(file);
    });
}

// async function handleFileSelect(event) {
//     const file = event.target.files[0];

//     if (file.type.match("image.*")) {
//         $(".loader").show();
//         const resizedFile = await resizeAndUpload(file);
//         console.log("Resized File:", resizedFile);

//         var formData = new FormData();
//         formData.append("image", resizedFile);
//         formData.append("operation", "taskImageUpload"); // Include operation

//         // AJAX request to upload the image
//         $.ajax({
//             url: api_url,
//             type: "POST",
//             data: formData,
//             processData: false,
//             contentType: false,
//             success: function (response) {
//                 var responseData = JSON.parse(response);
//                 console.log(responseData);
//                 if (responseData.success == true) {
//                     console.log(responseData.imageUrl);
//                     $(".loader").hide();
//                     $("#remarksProjAssign").val($("#remarksProjAssign").val() + "\n \n" + responseData.imageUrl);
//                     $(".success-msg").text("Upload success").show();
//                 } else {
//                     // Handle error: log the error message
//                     console.error("Upload error:", responseData.error);
//                     // You can also display the error message to the user, for example:
//                     $(".loader").hide();
//                     $(".error-msg").text("Upload failed").show();
//                     alert("Upload failed: " + responseData.error);
//                 }
//             },
//             error: function (xhr, status, error) {
//                 // Handle AJAX error
//                 $(".loader").hide();
//                 console.error("AJAX error:", error);
//                 $(".error-msg").text("Upload failed").show();
//                 // You can display a generic error message to the user, for example:
//                 alert("An error occurred while processing your request. Please try again later.");
//             },
//         });
//     } else {
//         // The selected file is not an image, show an error message
//         alert("Please select an image file.");
//         // Clear the file input to reset it
//         $(this).val("");
//     }
// }

let selectedFile; // Global variable to store the selected file

async function handleFileSelecthr(event) {
    console.log(event);
    selectedFile = event.target.files[0];

    // Check if the file is an image using the MIME type
    const acceptedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (selectedFile && acceptedImageTypes.includes(selectedFile.type)) {
        // Show a preview of the image before uploading
        const reader = new FileReader();
        reader.onload = function (e) {
            const imagePreview = document.getElementById("imagePreview");
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block"; // Show the image preview

            document.getElementById("confirmUploadBtn").style.display = "inline-block";
            document.getElementById("removeImageBtn").style.display = "inline-block";
        };
        reader.readAsDataURL(selectedFile); // Read the file and generate a data URL for preview
    } else {
        // The selected file is not a valid image, show an error message
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP).");
        // Clear the file input to reset it
        $(this).val("");
    }
}

// async function uploadImage() {
//     if (!selectedFile) return; // If no file is selected, don't proceed

//     $(".loader").show();

//     try {
//         // Resize and upload the image
//         const resizedFile = await resizeAndUpload(selectedFile);
//         console.log("Resized File:", resizedFile);

//         var formData = new FormData();
//         formData.append("image", resizedFile);
//         formData.append("operation", "ImageUploadhr"); // Include operation

//         // AJAX request to upload the image
//         $.ajax({
//             url: api_url,
//             type: "POST",
//             data: formData,
//             processData: false,
//             contentType: false,
//             success: function (response) {
//                 var responseData = JSON.parse(response);
//                 console.log(responseData);
//                 $(".loader").hide();

//                 if (responseData.success === true) {
//                     console.log(responseData.imageUrl);
//                     $("#fileurl").val((i, val) => val.trim() + (val.trim() ? " " : "") + responseData.imageUrl);

//                     $(".success-msg").text("Upload success").show();
//                 } else {
//                     console.error("Upload error:", responseData.error);
//                     $(".error-msg").text("Upload failed").show();
//                     alert("Upload failed: " + responseData.error);
//                 }
//             },
//             error: function (xhr, status, error) {
//                 $(".loader").hide();
//                 console.error("AJAX error:", error);
//                 $(".error-msg").text("Upload failed").show();
//                 alert("An error occurred while processing your request. Please try again later.");
//             },
//         });
//     } catch (error) {
//         $(".loader").hide();
//         console.error("Error during image processing:", error);
//         $(".error-msg").text("Image processing failed").show();
//     }
// }

function addTaskImage() {
    var loader = $("<div>", {
        class: "loader",
        style: "display: none;",
    }).append(
        $("<div>", {
            class: "load",
        }).append(
            $("<i>", {
                class: "fa fa-spinner fa-spin",
            })
        )
    );

    var newImageInput = $("<div>", {
        class: "mt-3",
        id: "newImageInputDiv",
    }).append(
        $("<label>", {
            for: "formFile",
            class: "form-label",
            text: "Attachments",
        }),
        $("<input>", {
            class: "form-control",
            type: "file",
            accept: "image/*",
            id: "newImageInput",
            name: "newImageInput",
        })
    );
    var successMsg = $("<div>", {
        class: "success-msg",
        style: "display: none; color: green;",
    });

    // Create error message element
    var errorMsg = $("<div>", {
        class: "error-msg",
        style: "display: none; color: red;",
    });

    newImageInput.on("change", handleFileSelect);

    // Find the textarea element
    var textarea = $("#remarksProjAssign");

    // Insert the new input element after the textarea
    textarea.after(loader, newImageInput, successMsg, errorMsg);
}
// function sendMailNew(data) {
//     $.ajax({
//         type: "post",
//         url: "https://kalamacademy.org/test/test.php",
//         data: {
//             operation: "00100",
//             to: data.to,
//             subject: data.subject,
//             message: data.message,
//         },
//         success: function (response) {
//             $(".loader").hide();
//             //console.log(response)
//             if (response > 0) {
//                 alert("Mail Sent");
//             } else {
//                 alert("Error In Sending Mail");
//             }
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

// function paymentVerifyMail(pd_id, id) {
//     $.ajax({
//         type: "post",
//         url: api_url,
//         data: { operation: "paymentVerifyMail", pd_id: pd_id, id: id },
//         success: function (response) {
//             response = JSON.parse(response);
//             sendMailNew(response);
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

// function taskCompleteMail(id) {
//     $.ajax({
//         type: "post",
//         url: api_url,
//         data: { operation: "taskCompleteMail", id: id },
//         success: function (response) {
//             response = JSON.parse(response);
//             sendMailNew(response);
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

// function taskAssignMail(id, description) {
//     $.ajax({
//         type: "post",
//         url: api_url,
//         data: { operation: "taskAssignMail", id: id, description: description },
//         success: function (response) {
//             response = JSON.parse(response);
//             sendMailNew(response);
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

// function addNewProjMail(id) {
//     $.ajax({
//         type: "post",
//         url: api_url,
//         data: { operation: "addNewProjMail", id: id },
//         success: function (response) {
//             response = JSON.parse(response);
//             sendMailNew(response);
//             console.log(response);
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }
// function projStatusChange(id, description) {
//     $.ajax({
//         type: "post",
//         url: api_url,
//         data: { operation: "projstatusmail", id: id, description: description },
//         success: function (response) {
//             response = JSON.parse(response);
//             sendMailNew(response);
//             console.log(response);
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

// function getComplaint() {
//     var content =
//         '<table id="complaintTable" class="table table-bordered table-striped"> <thead> <tr> <th>Lead Id</th> <th>PD Id</th> <th>Lead Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th> <th>Project Name</th> <th>Project Type</th> <th>Caller</th> <th>Developer</th> <th>Issue</th> <th>Description</th> <th>Type</th> <th>Date</th> <th>Status</th> <th>Options</th></tr> </thead> <tbody></tbody> </table>';

//     document.getElementById("displayContent").innerHTML = content;

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "008-4" },
//         success: function (data) {
//             data = JSON.parse(data);
//             //console.log(data);

//             $("#complaintTable").DataTable({
//                 data: data.data,
//                 order: [[11, "desc"]],
//                 columns: [
//                     { data: "lead_id" },
//                     { data: "PD_ID" },
//                     { data: "lead_name" },
//                     {
//                         data: null,
//                         render: function (data, type, row, meta) {
//                             var index = meta.row;
//                             //console.log(row);

//                             return (
//                                 '<a href="javascript:void(0)" onclick="makeCall(\'' +
//                                 row["lead_name"] +
//                                 "', '" +
//                                 row["lead_id"] +
//                                 "', '" +
//                                 row["mobile"] +
//                                 "', " +
//                                 index +
//                                 ')">' +
//                                 row["mobile"] +
//                                 '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
//                                 row["lead_name"] +
//                                 "', '" +
//                                 row["lead_id"] +
//                                 "', '" +
//                                 row["Alternate_Mobile"] +
//                                 "', " +
//                                 index +
//                                 ')">' +
//                                 row["Alternate_Mobile"] +
//                                 '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
//                                 row["Whatsapp"] +
//                                 '">' +
//                                 row["Whatsapp"] +
//                                 "</a><br>" +
//                                 row["email"] +
//                                 '<br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
//                                 row["lead_id"] +
//                                 '" id="save-id-' +
//                                 index +
//                                 '" onclick=stopRecord("' +
//                                 row["lead_id"] +
//                                 '","' +
//                                 index +
//                                 '")>End Call</button>'
//                             );
//                         },
//                     },
//                     {
//                         data: "Project_Name",
//                         render: function (data, type, row) {
//                             return (
//                                 data +
//                                 '<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjDetails(' +
//                                 row["PD_ID"] +
//                                 ", '" +
//                                 row["description"] +
//                                 "', '" +
//                                 row["issue"] +
//                                 "', '" +
//                                 row["fileName"] +
//                                 '\')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(' +
//                                 row["PD_ID"] +
//                                 ')">View Task</button>'
//                             );
//                         },
//                     },
//                     { data: "Project_Type" },
//                     { data: "caller" },
//                     { data: "developer" },
//                     { data: "issue" },
//                     {
//                         data: "description",
//                         render: function (data, type, row) {
//                             var image = "";
//                             if (row["fileName"] != "0") {
//                                 image = "<br><button onclick=\"showImage('" + row["fileName"] + "')\">View image</button>";
//                             }

//                             return data + image;
//                         },
//                     },
//                     { data: "type" },
//                     { data: "date_added" },
//                     { data: "status" },
//                     {
//                         data: null,
//                         render: function (data, type, row) {
//                             return (
//                                 '<button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBilling(' +
//                                 row["PD_ID"] +
//                                 ')">Billing</button><br>' +
//                                 '<button data-toggle="modal" data-target="#exampleModalProjectPayment" onclick="addProjectIDPayment(' +
//                                 row["PD_ID"] +
//                                 ')">Payment</button><br>' +
//                                 '<button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
//                                 row["lead_id"] +
//                                 ')" data-whatever="' +
//                                 row["lead_id"] +
//                                 '">Status</button>'
//                             );
//                         },
//                     },
//                 ],
//             });
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

function showImage(name) {
    $("#exampleModalViewImage").modal("toggle"); // Toggles the modal
    var link = "https://teamka.in/crm1/APIs/support_complaint_document/" + name;
    $("#show-img").html('<img src="' + link + '" width="100%">');
    console.log(link);
}

// function getTHStats() {
//     var startDate = document.getElementById("sDate").value;
//     var endDate = document.getElementById("eDate").value;

//     var content =
//         '<table id="statsTable" class="table table-bordered table-striped"> <thead> <tr> <th>Name</th><th>Total Tasks</th><th>Total Delayed Tasks</th><th>Total Completed on Time</th><th>Total Completed Before Time</th><th>Total Open Tasks</th><th>Total Delayed Not Completed</th> </tr> </thead> <tbody></tbody> </table>';

//     content += '<div id="plotContainer" class="plotContainer mt-3" style="width: 100%; height: 400px;"></div>';
//     document.getElementById("displayContent").innerHTML = content;

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "008-3", startDate: startDate, endDate: endDate },
//         success: function (data) {
//             data = JSON.parse(data);
//             console.log(data);

//             $("#statsTable").DataTable({
//                 data: data.data,
//                 order: [[1, "desc"]],
//                 columns: [
//                     { data: "Name" },
//                     { data: "total_tasks" },
//                     { data: "total_delayed_tasks" },
//                     { data: "total_completed_on_time" },
//                     { data: "total_completed_before_time" },
//                     { data: "total_open_tasks" },
//                     { data: "total_delayed_not_completed" },
//                 ],
//             });
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

// function getSupportStats() {
//     function formatDate(date) {
//         const year = date.getFullYear();
//         const month = (date.getMonth() + 1).toString().padStart(2, "0");
//         const day = date.getDate().toString().padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     }

//     const currentDate = new Date();
//     const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//     const endDate = currentDate;

//     // Format the dates as YYYY-MM-DD
//     const formattedStartDate = formatDate(startDate);
//     const formattedEndDate = formatDate(endDate);
//     console.log(formattedStartDate, formattedEndDate);

//     var id = localStorage.getItem("userID");

//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: {
//             operation: "008-2",
//             startDate: formattedStartDate,
//             endDate: formattedEndDate,
//             id: id,
//         },
//         success: function (data) {
//             data = JSON.parse(data);
//             data = data[0];
//             console.log(data);
//             $("#total-task").text(data.total_tasks);
//             $("#delayed-task").text(data.total_delayed_tasks);
//             $("#delayed-not-completed").text(data.total_delayed_not_completed);
//             $("#completed-before-time").text(data.total_completed_on_time + "/" + data.total_completed_before_time);
//             $("#fake-task").text(data.total_fake_completion_tasks + "/" + data.total_incomplete_task_tasks);
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

// function getSupport() {
//     // Replace 'your_api_endpoint' with the actual API endpoint to fetch data from the server
//     $.ajax({
//         url: api_url,
//         method: "POST",
//         data: { operation: "008-1" },
//         success: function (data) {
//             data = JSON.parse(data);
//             // Assuming the response is an array of objects with 'id' and 'text' properties
//             var selectElement = document.getElementById("support-agent");

//             // Clear existing options
//             selectElement.innerHTML = "";

//             // Populate options based on the fetched data
//             data.forEach((item) => {
//                 var option = document.createElement("option");
//                 option.value = item.ADMIN_ID;
//                 option.textContent = item.Name; // Adjust the property names based on your data structure
//                 selectElement.appendChild(option);
//             });
//         },
//         error: function (error) {
//             console.error("Error fetching data:", error);
//         },
//     });
// }

function breakFun(x) {
    let btnValue = x.value;
    console.log(btnValue);
    StartAgentBreak();
}

function checkBreakOnLoad() {
    var userID = localStorage.getItem("userID");

    $(".loader").show();

    $.ajax({
        url: api_url,
        method: "POST",
        data: { operation: "085-1", userID: userID },
        success: function (res) {
            $(".loader").hide();
            res = res.split("-as-");
            let brid = res[0].trim();
            let stat_time = res[1].split("\r");
            stat_time = stat_time[0].trim();
            let curr_time = new Date().toLocaleTimeString();
            // console.log(brid , stat_time , curr_time);
            let timediff = 0;

            let x = new Date("January 1, 2023 " + stat_time);
            let y = new Date("January 1, 2023 " + curr_time);

            // Calculate the time difference in seconds
            timediff = Math.floor((y - x) / 1000);

            //console.log('Time difference in seconds:', timediff);

            if (brid != "") {
                // alert("You Are Already On Break");
                localStorage.setItem("Break_ID", brid);
                localStorage.setItem("xTime", timediff);
                clearInterval(tid);
                startTimer();
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function checkForAgentBreak() {
    var Break_ID = localStorage.getItem("Break_ID");
    if (Break_ID != null) {
        // alert("You are on break");
        clearInterval(tid);
        startTimer(1);
    }
}

let x = 1;
let tid;

function startTimer(sts = 0) {
    if (sts == 1) {
        x = localStorage.getItem("xTime");
    }

    tid = setInterval(() => {
        ++x;
        localStorage.setItem("xTime", x);
        console.log(secondsToHms(x));
        $(".loader").show();
        $(".load").html(`
                    <div class="ash1">
                        <p>Break Time : ${secondsToHms(x)} </p>
                        <button class="btn btn-primary" onclick="EndAgentBreak()">End Break</button>
                    </div>
                `);
    }, 1000);
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);
    return ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
}

function StartAgentBreak() {
    var userID = localStorage.getItem("userID");
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${year}/${month}/${day}`;
    var curr_date = currentDate;
    var curr_time = new Date().toLocaleTimeString();

    $(".loader").show();

    $.ajax({
        url: api_url,
        method: "POST",
        data: {
            operation: "085",
            userID: userID,
            curr_date: curr_date,
            curr_time: curr_time,
        },
        success: function (res) {
            //alert(res);
            res = res.split("-as-");
            let brid = res[1];
            res = res[0];

            //Expected Response: Break ID
            console.log(res);
            if (res == -12) {
                //alert(1);
                // alert(res);
                alert("Some Error Occured Try Again");
            } else if (res == -11) {
                // alert("You Are Already On Break");
                localStorage.setItem("Break_ID", brid);
                localStorage.setItem("xTime", 10);
                checkForAgentBreak();
            } else {
                localStorage.setItem("Break_ID", res);
                alert("Break Started");
                //Display Break Duration Break_Duration

                startTimer();

                //Display End Option
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function EndAgentBreak() {
    var Break_ID = localStorage.getItem("Break_ID");
    if (Break_ID === null) {
        alert("You are not on break");
    } else {
        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let currentDate = `${year}/${month}/${day}`;
        var curr_date = currentDate;
        var curr_time = new Date().toLocaleTimeString();
        $(".loader").show();
        $.ajax({
            url: api_url,
            method: "POST",
            data: { operation: "086", Break_ID: Break_ID, curr_time: curr_time },
            success: function (res) {
                $(".loader").hide();
                //Expected Response: Break_ID
                // alert(res);
                if (res == -12) {
                    // alert(0);
                    alert("Some Error Occured Try Again");
                } else {
                    alert("Break Ended");
                    localStorage.removeItem("Break_ID");
                    localStorage.removeItem("xTime");
                    location.reload();
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

var isrecord = 0;
function displayerror(jqXHR, exception) {
    var msg = "";
    if (jqXHR.status === 0) {
        msg = "Not connect.\n Verify Network.";
    } else if (jqXHR.status == 404) {
        msg = "Requested page not found. [404]";
    } else if (jqXHR.status == 500) {
        msg = "Internal Server Error [500].";
    } else if (exception === "parsererror") {
        msg = "Requested JSON parse failed.";
    } else if (exception === "timeout") {
        msg = "Time out error.";
    } else if (exception === "abort") {
        msg = "Ajax request aborted.";
    } else {
        msg = "Uncaught Error.\n" + jqXHR.responseText;
    }
    $(".loader").hide();
    return msg;
}

// function login() {
//     $(".loader").show();
//     var mobileNo = document.getElementById("mobileNo").value;
//     var password = document.getElementById("password").value;

//     $.ajax({
//         url: api_url,
//         data: {
//             operation: "001",
//             mobileNo: mobileNo,
//             password: password,
//         },
//         success: function (response) {
//             $(".loader").hide();
//             data = response.split("<-->"); 
//             console.log("data", data); 
//             id = parseInt(data[3]);
//             checkAbsent(id);
//               checkLate(id);
//             // Common actions for successful responses
//             function handleSuccess(userType, dashboardURL) {
//                 warn_mobileNo = document.getElementById("warn_mobileNo");
//                 warn_password = document.getElementById("warn_password");
//                 localStorage.setItem("MobileNo", mobileNo);
//                 localStorage.setItem("userID", parseInt(data[3]));
//                 localStorage.setItem("userName", data[2]);
//                 localStorage.setItem("userType", userType);
//                 warn_mobileNo.innerHTML = "";
//                 warn_password.innerHTML = "";
//                 window.location.href = dashboardURL;
//                 console.log("data  handel success", dashboardURL);
//             }

//             if (data[0] == " 1" || data[0] == "1") {
//                 handleSuccess(data[1], "./dashboardNEW.html");
//             } else if (data[0] == " 2" || data[0] == "2") {
//                 handleSuccess(data[1], "./callerDashboardNEW.html");
//             } else if (data[0] == " 3" || data[0] == "3") {
//                 handleSuccess(data[1], "./developerDashboardNEW.html");
//             } else if (data[0] == " 4" || data[0] == "4") {
//                 warn_password.innerHTML = "<b>Password doesn't match</b>";
//             } else if (data[0] == " 5" || data[0] == "5") {
//                 warn_mobileNo.innerHTML = "<b>Mobile number not found</b>";
//             } else if (data[0] == " 6" || data[0] == "6") {
//                 handleSuccess(data[1], "./supportExecutiveNEW.html");
//             } else if (data[0] == " 7" || data[0] == "7") {
//                 handleSuccess(data[1], "./dashboardTL.html");
//             } else if (data[0] == " 8" || data[0] == "8") {
//                 handleSuccess(data[1], "./TechHead.html");
//             }
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

// // Logout
// function Logout() {
//     var user_id = localStorage.getItem("userID");
//     $.ajax({
//         url: api_url,
//         data: {
//             operation: "001-1",
//             user_id: user_id,
//         },
//         success: function (response) {
//             //localStorage.clear();
//             // localStorage.removeItem("MobileNo");
//             localStorage.removeItem("userID");
//             localStorage.removeItem("userName");
//             localStorage.removeItem("userType");
//             localStorage.removeItem("lead_id");
//             window.location.href = "./index.html";
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

function getDevices() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "079" },
        success: function (res) {
            $(".loader").hide();
            var the_table =
                '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>Actions</th><th>#ID</th><th>Device</th><th>Belongs</th><th>Admin ID</th><th></th></tr></thead><tbody>';

            var partialArranged = res.split("/END/");
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var data = element.split("<-->");
                the_table =
                    the_table +
                    '<tr><td><button data-toggle="modal" data-target="#exampleModalDevice" onclick="selectDevice(' +
                    data[0] +
                    ')">Edit</button></td><td>' +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td>" +
                    data[2] +
                    "</td><td>" +
                    data[3] +
                    '</td><td><button onclick="disableDevice(' +
                    data[0] +
                    ')">Disable</button></td></tr>';
            }
            the_table = the_table + "</tbody></table>";
            //var addDevice = '<button data-toggle="modal" data-target="#exampleModalDevice" onclick="addDevice()">Add Device</button>'
            document.getElementById("displayContent").innerHTML =
                "<h1>Allowed Devices</h1><div class='container mt-5' style='overflow-x:scroll;'>" + addDevice + the_table + "</tbody></div>";
            $("#table1").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function updateDevice() {
    var namedevice = document.getElementById("namedevice").value;
    var belongdevice = document.getElementById("belongdevice").value;
    var adminid = document.getElementById("adminid").value;
    var deviceid = document.getElementById("deviceid").value;
    if (namedevice == "" || belongdevice == "" || adminid == "") {
        document.getElementById("errorDetailsDeviceForm").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsDeviceForm").innerHTML = "";
        if (deviceid !== "") {
            $(".loader").show();
            $.ajax({
                url: api_url,
                data: {
                    operation: "080",
                    deviceid: deviceid,
                    namedevice: namedevice,
                    belongdevice: belongdevice,
                    adminid: adminid,
                },
                success: function (response) {
                    $(".loader").hide();
                    if (response == 1) {
                        document.getElementById("namedevice").value = "";
                        document.getElementById("belongdevice").value = "";
                        document.getElementById("adminid").value = "";
                        // document.getElementById("type").value = "Admin";
                        alert("Device Updated");
                        $(".close").click();
                        getDevices();
                    }
                },
                error: function (jqXHR, exception) {
                    var msg = displayerror(jqXHR, exception);
                    alert(msg);
                },
            });
        } else {
            $.ajax({
                url: api_url,
                data: {
                    operation: "082",
                    namedevice: namedevice,
                    belongdevice: belongdevice,
                    adminid: adminid,
                },
                success: function (response) {
                    $(".loader").hide();
                    if (response == 1) {
                        document.getElementById("namedevice").value = "";
                        document.getElementById("belongdevice").value = "";
                        document.getElementById("adminid").value = "";
                        // document.getElementById("type").value = "Admin";
                        alert("Device Added");
                        $(".close").click();
                        getDevices();
                    }
                },
                error: function (jqXHR, exception) {
                    var msg = displayerror(jqXHR, exception);
                    alert(msg);
                },
            });
        }
    }
}
function selectDevice(deviceid) {
    document.getElementById("errorDetailsDeviceForm").innerHTML = "";
    var deviceid = deviceid;
    document.getElementById("exampleModalDeviceLabel").innerHTML = "Update Device";
    document.getElementById("exampleModalDevicebutton").innerHTML = "Update Device";
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "081", deviceid: deviceid },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            document.getElementById("deviceid").value = data[0];
            document.getElementById("namedevice").value = data[1];
            document.getElementById("belongdevice").value = data[2];
            document.getElementById("adminid").value = data[3];
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function disableDevice(deviceid) {
    var ab = confirm("Are you sure you want to Delete the device?");
    if (ab) {
        var upt = prompt("Type YES to confirm", "");
        if (upt == "YES") {
            $(".loader").show();
            $.ajax({
                url: api_url,
                data: { operation: "083", deviceid: deviceid },
                success: function (response) {
                    $(".loader").hide();
                    if (response == 1) {
                        alert("Device Disabled");
                        // $('.close').click();
                        getDevices();
                    }
                },
                error: function (jqXHR, exception) {
                    var msg = displayerror(jqXHR, exception);
                    alert(msg);
                },
            });
        }
    }
}
function addDevice() {
    document.getElementById("errorDetailsDeviceForm").innerHTML = "";
    document.getElementById("namedevice").value = "";
    document.getElementById("belongdevice").value = "";
    document.getElementById("adminid").value = "";
    document.getElementById("deviceid").value = "";
    document.getElementById("exampleModalDeviceLabel").innerHTML = "Add Device";
    document.getElementById("exampleModalDevicebutton").innerHTML = "Add Device";
}

// Add Members
function addCaller() {
    var name = document.getElementById("nameCaller").value;
    var mobile = document.getElementById("mobileCaller").value;
    var password = document.getElementById("passwordCaller").value;
    var type = document.getElementById("type").value;
    if (name == "" || mobile == "" || password == "") {
        document.getElementById("errorDetailsCallerForm").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsCallerForm").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "002",
                name: name,
                mobile: mobile,
                password: password,
                type: type,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    document.getElementById("nameCaller").value = "";
                    document.getElementById("mobileCaller").value = "";
                    document.getElementById("passwordCaller").value = "";
                    document.getElementById("type").value = "Admin";
                    alert("Member Entered");
                    $(".close").click();
                    allCaller();
                } else if (response == 2) {
                    document.getElementById("errorDetailsCallerForm").innerHTML = "Account Already Exist";
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function editCaller() {
    var id = document.getElementById("edit_CallerID").value;
    var name = document.getElementById("edit_nameCaller").value;
    var mobile = document.getElementById("edit_mobileCaller").value;
    var password = document.getElementById("edit_passwordCaller").value;
    var type = document.getElementById("edit_type").value;
    if (name == "" || mobile == "" || password == "") {
        document.getElementById("errorDetailsCallerFormEdit").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsCallerFormEdit").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "002-2",
                id: id,
                name: name,
                mobile: mobile,
                password: password,
                type: type,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    document.getElementById("edit_CallerID").value = "";
                    document.getElementById("edit_nameCaller").value = "";
                    document.getElementById("edit_mobileCaller").value = "";
                    document.getElementById("edit_passwordCaller").value = "";
                    document.getElementById("edit_type").value = "Admin";
                    alert("Member Updated");
                    $(".close").click();
                    allCaller();
                } else if (response == 2) {
                    document.getElementById("errorDetailsCallerForm").innerHTML = "Account Already Exist";
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function getConusers() {
    document.getElementById("displayContent").innerHTML =
        '<div><h3>Active Users</h3><button onclick="requestActiveUsers()">Check Active Users</button><div id="activeUsers"></div></div>';
}

// Add Leads
function addLead() {
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

    if (name == "" || mobile == "") {
        document.getElementById("errorDetails").innerHTML = "Fill the Form Correctly";
    } else if (!/^\d{1,10}$/.test(mobile)) {
        document.getElementById("errorDetails").innerHTML = "Mobile should be 10 digits whithout +91 or 0";
    } else if (alternate_mobile !== "" && !/^\d{1,10}$/.test(alternate_mobile)) {
        document.getElementById("errorDetails").innerHTML = "Alternate Mobile should be 10 digits whithout +91 or 0";
    } else if (whatsapp !== "" && !/^\d{1,10}$/.test(whatsapp)) {
        document.getElementById("errorDetails").innerHTML = "WhatsApp should be 10 digits whithout +91 or 0";
    } else if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("errorDetails").innerHTML = "Invalid email format";
    } else {
        document.getElementById("errorDetails").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "003",
                name: name,
                mobile: mobile,
                alternate_mobile: alternate_mobile,
                whatsapp: whatsapp,
                email: email,
                interested_in: interested_in,
                source: source,
                status: status,
                caller: caller,
                state: state,
                city: city,
                caller_id: caller_id,
            },
            success: function (response) {
                console.log(response);
                $(".loader").hide();
                if (response == 1) {
                    // window.location.href="./dashboardNEW.html";
                    alert("Lead Entered");
                    $(".close").click();
                    if (localStorage.getItem("userType") == "Admin") {
                        allLeads();
                    } else if (localStorage.getItem("userType") == "Caller") {
                        myLeads();
                    } else if (localStorage.getItem("userType") == "TL") {
                        allLeadsTL();
                    }
                } else if (response == 2) {
                    document.getElementById("errorDetails").innerHTML = "Lead already exist";
                } else if (response == 3) {
                    document.getElementById("errorDetails").innerHTML = "You can not add more lead";
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function AddExpense() {
    var Expense_For = document.getElementById("Expense_For").value;
    var Remark = document.getElementById("Remark").value;
    var PD_ID = document.getElementById("PD_ID").value;
    var Proff = document.getElementById("Proff").value;
    var Date_Of_Expense = document.getElementById("Date_Of_Expense").value;
    var From_Account = document.getElementById("From_Account").value;
    var EXP_Amount = document.getElementById("EXP_Amount").value;
    var Expense_Purpose = document.getElementById("Expense_Purpose").value;
    var EXP_For = document.getElementById("EXP_For").value;

    var userID = localStorage.getItem("userID");
    var submitButton = document.getElementById("addexpense");

    if (Expense_For === "" || Remark === "" || PD_ID === "" || Proff === "" || Date_Of_Expense === "" || From_Account === "" || EXP_Amount === "") {
        document.getElementById("errorDetailsEXP").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsEXP").innerHTML = "";
        $(".loader").show();
        submitButton.disabled = true; // Disable the submit button

        $.ajax({
            url: api_url,
            type: "POST",
            data: {
                operation: "084",
                Expense_For: Expense_For,
                Remark: Remark,
                PD_ID: PD_ID,
                Proff: Proff,
                Date_Of_Expense: Date_Of_Expense,
                From_Account: From_Account,
                userID: userID,
                EXP_Amount: EXP_Amount,
                Expense_Purpose: Expense_Purpose,
                EXP_For: EXP_For,
            },
            success: function (response) {
                console.log(response);
                $(".loader").hide();
                alert(response);

                // Clear form fields on success
                document.getElementById("Expense_For").value = "";
                document.getElementById("Remark").value = "";
                document.getElementById("PD_ID").value = "";
                document.getElementById("Proff").value = "";
                document.getElementById("Date_Of_Expense").value = "";
                document.getElementById("From_Account").value = "";
                document.getElementById("EXP_Amount").value = "";
                document.getElementById("Expense_Purpose").value = "";
                document.getElementById("EXP_For").value = "";

                submitButton.disabled = false; // Enable the submit button again
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
                $(".loader").hide();
                submitButton.disabled = false; // Enable the submit button on failure
            },
        });
    }
}

function updateExpense() {
    var ET_ID = $("#edit_ET_ID").val();
    var Expense_For = $("#edit_Expense_For").val();
    var Remark = $("#edit_Remark").val();
    var PD_ID = $("#edit_PD_ID").val();
    var Proff = $("#edit_Proff").val();
    var Date_Of_Expense = $("#edit_Date_Of_Expense").val();
    var From_Account = $("#edit_From_Account").val();
    var EXP_Amount = $("#edit_EXP_Amount").val();
    var Expense_Purpose = $("#edit_Expense_Purpose").val();
    var EXP_For = $("#edit_EXP_For").val();

    var userID = localStorage.getItem("userID");

    if (Expense_For == "" || Remark == "" || PD_ID == "" || Proff == "" || Date_Of_Expense == "" || From_Account == "" || EXP_Amount == "") {
        document.getElementById("errorDetailsEXP").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsEXP").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "084-2",
                ET_ID: ET_ID,
                Expense_For: Expense_For,
                Remark: Remark,
                PD_ID: PD_ID,
                Proff: Proff,
                Date_Of_Expense: Date_Of_Expense,
                From_Account: From_Account,
                userID: userID,
                EXP_Amount: EXP_Amount,
                Expense_Purpose: Expense_Purpose,
                EXP_For: EXP_For,
            },
            success: function (response) {
                console.log(response);
                $(".loader").hide();
                alert(response);
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

// Show All Leads

function CheckDateWaiseStatus() {
    //  $('.loader').show();
    var chkforDate = document.getElementById("chkforDate").value;
    console.log(chkforDate);

    $.ajax({
        url: api_url,
        data: { operation: "071", chkforDate: chkforDate },
        success: function (res) {
            $(".loader").hide();
            //console.log(res);

            var data = jQuery.parseJSON(res);
            //console.log(data);
            var the_table =
                '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
            $.each(data, function (i, item) {
                the_table =
                    the_table +
                    "<tr><td>" +
                    data[i][1] +
                    "</td><td>" +
                    data[i][8] +
                    "<br>" +
                    data[i][9] +
                    "<br>" +
                    data[i][10] +
                    "</td><td>" +
                    data[i][4] +
                    "<br>" +
                    data[i][5] +
                    ' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever=' +
                    data[i][1] +
                    ' onclick="getAllStatus(' +
                    data[i][1] +
                    ')">Previous Status</button></td><td>' +
                    data[i][14] +
                    "</td><td>" +
                    data[i][13] +
                    "</td><td>" +
                    data[i][11] +
                    "</td><td>" +
                    data[i][12] +
                    "</td><td>" +
                    data[i][7] +
                    " </td></tr>";
            });
            the_table = the_table + "</tbody></table>";
            //	$("#dbData").html(the_table);
            //	$("#table1").DataTable();

            document.getElementById("displayContent").innerHTML =
                "<h1>" + chkforDate + " Call</h1><div class='container mt-5' style='overflow-x:scroll;'>" + the_table + "</tbody></div>";
            $("#table1").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function openAudioNewTab(data) {
    var url = data;
    var target = "_blank";
    console.log("url", url);
    if ("cordova" in window) {
        cordova.InAppBrowser.open(url, target, "");
    } else {
        window.open(url, target);
    }
}
function getAudioLink(condition) {
    if (condition != "") {
        return "<a href='javascript:void(0)' onClick=openAudioNewTab('" + condition + "')>Open recording</a>";
    } else {
        return "Not Recorded";
    }
}
function CheckCallWaiseStatus(startDate, endDate) {
    $.ajax({
        url: api_url,
        data: { operation: "077", startDate: startDate, endDate: endDate },
        success: function (res) {
            $(".loader").hide();
            //console.log(res);

            var data = jQuery.parseJSON(res);
            //console.log(data);
            var the_table =
                '<a href="https://teamka.in/crm1/APIs/export.php?startDate=' +
                startDate +
                "&endDate=" +
                endDate +
                '">Export</a><table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name</th><th>Last Status</th><th>Summary Note</th><th>Recording</th><th>Call Duration</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
            $.each(data, function (i, item) {
                //the_table=the_table+'<tr><td>'+data[i][1]+'</td><td>'+data[i][8]+'<br>'+data[i][9]+'<br>'+data[i][10]+'</td><td>'+data[i][4]+'<br>'+data[i][5]+' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever='+data[i][1]+' onclick="getAllStatus('+data[i][1]+')">Previous Status</button></td><td>'+data[i][14]+'</td><td>'+data[i][13]+'</td><td>'+data[i][11]+'</td><td>'+data[i][12]+'</td><td>'+data[i][7]+' </td></tr>';

                the_table =
                    the_table +
                    "<tr><td>" +
                    data[i][0] +
                    "</td><td>" +
                    data[i][1] +
                    "</td><td>" +
                    data[i][2] +
                    "</td><td>" +
                    data[i][3] +
                    "</td><td>" +
                    getAudioLink(data[i][4]) +
                    "</td><td>" +
                    data[i][9] +
                    "</td><td>" +
                    data[i][5] +
                    "</td><td>" +
                    data[i][6] +
                    "</td><td>" +
                    data[i][7] +
                    "</td><td>" +
                    data[i][8] +
                    "</td></tr>";
            });
            the_table = the_table + "</tbody></table>";
            //	$("#dbData").html(the_table);
            //	$("#table1").DataTable();

            document.getElementById("statsDisplay3").innerHTML = "<div class='container mt-5' style='overflow-x:scroll;'>" + the_table + "</tbody></div>";
            $("#table1").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function CheckCallWaiseStatusExport() {
    //  $('.loader').show();
    var chkforDate = document.getElementById("chkforDate").value;
    console.log(chkforDate);

    $.ajax({
        url: api_url,
        data: { operation: "078", chkforDate: chkforDate },
        success: function (res) {
            $(".loader").hide();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function testLoadOrphanLeadsADMIN() {
    // var AllUSERDROPDWN = localStorage.getItem("AllUSERDROPDWN");
    var the_table =
        '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th><input type="checkbox" onclick="checkUncheck()" id="th-main"></th><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
    the_table = the_table + "</tbody></table>";

    document.getElementById("displayContent").innerHTML =
        "<div class='d-flex'>" +
        // "<select class='m-2' id='transferTOuserID'>" + AllUSERDROPDWN + "</select> " +
        "<button class='m-2' onclick='TransferAllLeads()'>Transfer Lead </button> " +
        "<select class='m-2' id='filter_interested_in' class='form-control'>" +
        "<option value='' selected=''>Select intrested In </option>" +
        "<option>Grocery App</option>" +
        "<option>Service App</option>" +
        "<option>Website</option>" +
        "<option>MY Galla</option>" +
        "<option>Promotion</option>" +
        "<option>Job</option>" +
        "<option>WDC</option>" +
        "<option>DM Course</option>" +
        "<option>DM Online</option>" +
        "<option>PDP</option>" +
        "<option>UPSC SC</option>" +
        "<option>Others</option>" +
        "</select> " +
        "<select class='m-2' id='filter_status' class='form-control'>" +
        "<option value='' selected=''>Select Status</option>" +
        "<option>New</option>" +
        "<option>Demo Done</option>" +
        "<option>Proposail Mailed</option>" +
        "<option>Pending</option>" +
        "<option>Followup</option>" +
        "<option>DEAD</option>" +
        "</select> " +
        "</div>" +
        "<div class='container mt-5' style='overflow-x:scroll;'>" +
        the_table +
        "</div>";

    var statusf = $("#filter_status").val();
    var typef = $("#filter_interested_in").val();

    reloadDataTable();

    $("#filter_interested_in").change(function () {
        typef = $(this).val();
        reloadDataTable();
    });

    $("#filter_status").change(function () {
        statusf = $(this).val();
        reloadDataTable();
    });

    function reloadDataTable() {
        if ($.fn.DataTable.isDataTable("#table1")) {
            // If DataTable is already initialized, destroy it
            $("#table1").DataTable().destroy();
        }
        var table = $("#table1").DataTable({
            order: [],
            processing: false,
            paging: true,
            pagingType: "full_numbers",
            serverSide: true,
            ajax: {
                url: api_url,
                method: "POST",
                data: { operation: "072-new", status: statusf, type: typef },
                beforeSend: function () {
                    $(".loader").show();
                },
                complete: function () {
                    $(".loader").hide();
                },
            },
            columnDefs: [
                {
                    targets: 1,
                    render: function (data, type, row, meta) {
                        return row[1];
                    },
                },
                {
                    targets: 2,
                    render: function (data, type, row, meta) {
                        var index = meta.row;

                        data = `
                               ${row[8]}
                               <k id="hideShow${row[1]}">
                                   <button onclick="testShowprsnlDetails('${row[8]}','${row[1]}','${row[2]}',\`${row[9]}\`,\`${row[10]}\`,\`${row[16]}\`,${index},\`${row[15]}\`)">***See Contact Details*** </button></k>`;
                        return data;
                    },
                },
                {
                    targets: 3,
                    render: function (data, type, row, meta) {
                        data =
                            row[4] +
                            "<br>" +
                            row[5] +
                            ' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever=' +
                            row[1] +
                            ' onclick="getAllStatus(' +
                            row[1] +
                            ')">Previous Status</button>';
                        return data;
                    },
                },
                {
                    targets: 4,
                    render: function (data, type, row, meta) {
                        return row[14];
                    },
                },
                {
                    targets: 5,
                    render: function (data, type, row, meta) {
                        return row[13];
                    },
                },
                {
                    targets: 6,
                    render: function (data, type, row, meta) {
                        return row[11];
                    },
                },
                {
                    targets: 7,
                    render: function (data, type, row, meta) {
                        return row[12];
                    },
                },
                {
                    targets: 8,
                    render: function (data, type, row, meta) {
                        return row[7];
                    },
                },
            ],
        });
        console.log(statusf, typef);
    }
}
function LoadOrphanLeadsADMIN() {
    $(".loader").show();
    // var chkforDate = document.getElementById("chkforDate").value;
    //console.log(chkforDate);

    var AllUSERDROPDWN = localStorage.getItem("AllUSERDROPDWN");
    $.ajax({
        url: api_url,
        data: { operation: "072" },
        success: function (res) {
            $(".loader").hide();
            //console.log(res);

            var data = jQuery.parseJSON(res);
            //console.log(data);
            var the_table =
                '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th><input type="checkbox" onclick="checkUncheck()" id="th-main"></th><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
            $.each(data, function (i, item) {
                the_table =
                    the_table +
                    '<tr><td><input type="checkbox" class="sel" name="selected[]" value=' +
                    data[i][1] +
                    ' class="cb-element"></td><td>' +
                    data[i][1] +
                    "</td><td>" +
                    data[i][8] +
                    '<br><k id="hideShow' +
                    data[i][1] +
                    '"><button onclick="ShowprsnlDetails(' +
                    data[i][1] +
                    ",`" +
                    data[i][9] +
                    "`,`" +
                    data[i][10] +
                    "`," +
                    data[i][2] +
                    ')">***See Contact Details***</button></k></td><td>' +
                    data[i][4] +
                    "<br>" +
                    data[i][5] +
                    ' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever=' +
                    data[i][1] +
                    ' onclick="getAllStatus(' +
                    data[i][1] +
                    ')">Previous Status</button></td><td>' +
                    data[i][14] +
                    "</td><td>" +
                    data[i][13] +
                    "</td><td>" +
                    data[i][11] +
                    "</td><td>" +
                    data[i][12] +
                    "</td><td>" +
                    data[i][7] +
                    " </td></tr>";
            });
            the_table = the_table + "</tbody></table>";
            //	$("#dbData").html(the_table);
            //	$("#table1").DataTable();

            document.getElementById("displayContent").innerHTML =
                " <select id='transferTOuserID'>" +
                AllUSERDROPDWN +
                "</select> <button onclick='TransferAllLeads()'>Transfer Lead </button> <div class='container mt-5' style='overflow-x:scroll;'>" +
                the_table +
                "</tbody></div>";
            $("#table1").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function TransferAllLeads() {
    var favorite = new Array();
    var transferTOuserID = $("#transferTOuserID").val();
    var chk = 0;
    var mno;
    $.each($("input[name='selected[]']:checked"), function () {
        mno = $(this).val(); // favorite.push($(this).val());
        if (mno.length == 0 || mno === "undefined" || typeof mno === "undefined" || mno == "") {
            chk = 1;
        } else if (mno.length > 0) {
            chk = 2;
            favorite.push(mno);
        }
    });
    if (chk == 0) {
        alert("No Row Selected");
    } else {
        var ab = confirm("Are you sure you want to transfer?");
        if (ab) {
            var upt = prompt("Type YES to confirm", "");
            if (upt == "YES") {
                //  $("#hideShow"+Lid).html(+mobile+'<br>'+email);
                //    var userID = localStorage.getItem("userID");
                $(".loader").show();

                $.ajax({
                    url: api_url,
                    data: {
                        operation: "074",
                        NewuserID: transferTOuserID,
                        Lids: favorite,
                    },
                    success: function (response) {
                        $(".loader").hide();
                        console.log(response);
                        alert(response);
                    },
                    error: function (jqXHR, exception) {
                        var msg = displayerror(jqXHR, exception);
                        alert(msg);
                    },
                });
            }
        }
    }
}
function checkUncheck() {
    var rows = $("#table1").dataTable().fnGetNodes();
    const main_checked = $("#th-main").prop("checked");
    for (var i = 0; i < rows.length; ++i) {
        $(rows[i]).find(".sel").prop("checked", main_checked);
    }
}
function testLoadOrphanLeads() {
    var the_table =
        '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
    the_table = the_table + "</tbody></table>";
    document.getElementById("displayContent").innerHTML = " <div class='container mt-5' style='overflow-x:scroll;'>" + the_table + "</tbody></div>";

    var table = $("#table1").DataTable({
        order: [[0, "asc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "072-new" },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columnDefs: [
            {
                targets: 0,
                render: function (data, type, row, meta) {
                    return row[1];
                },
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return (data =
                        row[8] +
                        ' <k id="hideShow' +
                        row[1] +
                        '"><button onclick="testShowprsnlDetails(' +
                        row[8] +
                        "," +
                        row[1] +
                        "," +
                        row[2] +
                        ",`" +
                        row[9] +
                        "`,`" +
                        row[10] +
                        "`,`" +
                        row[16] +
                        "`," +
                        index +
                        ",`" +
                        row[15] +
                        '`)">***See Contact Details***</button></k>');
                },
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    data =
                        row[4] +
                        "<br>" +
                        row[5] +
                        ' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever=' +
                        row[1] +
                        ' onclick="getAllStatus(' +
                        row[1] +
                        ')">Previous Status</button>;';
                    return data;
                },
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return row[14];
                },
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return row[13];
                },
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    return row[11];
                },
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return row[12];
                },
            },
            {
                targets: 7,
                render: function (data, type, row, meta) {
                    return row[7];
                },
            },
        ],
    });
}
function LoadOrphanLeads() {
    $(".loader").show();
    // var chkforDate = document.getElementById("chkforDate").value;
    //console.log(chkforDate);

    $.ajax({
        url: api_url,
        data: { operation: "072" },
        success: function (res) {
            $(".loader").hide();
            //console.log(res);

            var data = jQuery.parseJSON(res);
            //console.log(data);
            var the_table =
                '<table id="table1" class="class="display" cellspacing="0" width="100%" border=1><thead><tr><th>#ID</th><th>Name<br>Mobile<br>Email</th><th>Recent Status <br> Next Call Date<br>Check Previous </th><th>City</th><th>DOR</th><th>Intrested IN</th><th>Status</th><th>Caller</th></tr></thead><tbody>';
            $.each(data, function (i, item) {
                the_table =
                    the_table +
                    "<tr><td>" +
                    data[i][1] +
                    "</td><td>" +
                    data[i][8] +
                    '<br><k id="hideShow' +
                    data[i][1] +
                    '"><button onclick="ShowprsnlDetails(' +
                    data[i][1] +
                    ",`" +
                    data[i][9] +
                    "`,`" +
                    data[i][10] +
                    "`," +
                    data[i][2] +
                    ')">***See Contact Details***</button></k></td><td>' +
                    data[i][4] +
                    "<br>" +
                    data[i][5] +
                    ' <br><button data-toggle="modal" data-target="#exampleModal4" data-whatever=' +
                    data[i][1] +
                    ' onclick="getAllStatus(' +
                    data[i][1] +
                    ')">Previous Status</button></td><td>' +
                    data[i][14] +
                    "</td><td>" +
                    data[i][13] +
                    "</td><td>" +
                    data[i][11] +
                    "</td><td>" +
                    data[i][12] +
                    "</td><td>" +
                    data[i][7] +
                    " </td></tr>";
            });
            the_table = the_table + "</tbody></table>";
            //	$("#dbData").html(the_table);
            //	$("#table1").DataTable();

            document.getElementById("displayContent").innerHTML = "<h1> </h1><div class='container mt-5' style='overflow-x:scroll;'>" + the_table + "</tbody></div>";
            $("#table1").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function NewShowprsnlDetails(name, Lid, mobile, email, whatsapp, index, alternative_no) {
    $("#hideShow" + Lid).html(
        `<a href="javascript:void(0)" onclick="makeCall('${name}', '${Lid}', '${mobile}', '${index}')">${mobile}</a><br>
            <a href="javascript:void(0)" onclick="makeCall('${name}', '${Lid}', '${alternative_no}', '${index}')">${alternative_no}</a><br>
            <a href="https://api.whatsapp.com/send?phone=91${whatsapp}">${whatsapp}</a><br>
            ${email}<br>
            <button style="display:none" data-toggle="modal" data-target="#exampleModal4" data-whatever="${Lid}" id="save-id-${index}" onclick="stopRecord('${Lid}', '${index}')">End Call</button>`
    );
}
function testShowprsnlDetails(name, Lid, userID, mobile, email, whatsapp, index, alternative_no) {
    var ab = confirm("You need to add this lead to your account to see details");
    if (ab) {
        $("#hideShow" + Lid).html(
            `<a href="javascript:void(0)" onclick="makeCall('${name}', '${Lid}', '${mobile}', '${index}')">${mobile}</a><br>
            <a href="javascript:void(0)" onclick="makeCall('${name}', '${Lid}', '${alternative_no}', '${index}')">${alternative_no}</a><br>
            <a href="https://api.whatsapp.com/send?phone=91${whatsapp}">${whatsapp}</a><br>
            ${email}<br>
            <button style="display:none" data-toggle="modal" data-target="#exampleModal4" data-whatever="${Lid}" id="save-id-${index}" onclick="stopRecord('${Lid}', '${index}')">End Call</button>`
        );
        var userID = localStorage.getItem("userID");
        $(".loader").show();

        $.ajax({
            url: api_url,
            data: { operation: "073", NewuserID: userID, Lid: Lid },
            success: function (response) {
                $(".loader").hide();
                alert(response);
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}
function ShowprsnlDetails(Lid, mobile, email, userID) {
    var ab = confirm("You need to add this lead to your account to see details");
    if (ab) {
        $("#hideShow" + Lid).html(+mobile + "<br>" + email);
        var userID = localStorage.getItem("userID");
        $(".loader").show();

        $.ajax({
            url: api_url,
            data: { operation: "073", NewuserID: userID, Lid: Lid },
            success: function (response) {
                $(".loader").hide();
                alert(response);
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function recordAudio(callDetails) {
    const uniqueFilename = `recording_${callDetails.phone}_${Date.now()}.mp3`;

    //        cordova.plugins.backgroundMode.enable();

    myMedia = new Media(
        cordova.file.externalRootDirectory + uniqueFilename,
        function () {
            console.log("Recording File Created .");
        },
        onError // Use error callback for Media API errors
    );

    myMedia.startRecord();
    console.log("recording Started");
    console.log("Recording Name " + uniqueFilename);
    // Retrieve existing recordings from local storage
    let recordings = JSON.parse(localStorage.getItem("recordings")) || [];

    // Add the new recording to the array
    recordings.push({ filename: uniqueFilename, callDetails: callDetails });

    // Save the updated recordings array to local storage
    localStorage.setItem("recordings", JSON.stringify(recordings));
}

function stopRecordIncomingCall() {
    console.log("Attempt to Stop Recording");
    //        cordova.plugins.backgroundMode.disable();
    try {
        // Stop the recording
        myMedia.stopRecord();
        console.log("Recording stopped successfully.");
    } catch (e) {
        // Handle exceptions
        onError(e);
    }
}
function stopRecordMulti(lead_id, index, tableId) {
    isCalledByMakeCall = false;
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];
    if (recordings.length === 0) {
        console.error("No recordings to process");
        return;
    }
    console.log("Recording For lead id ", lead_id);
    //console.log(localStorage.getItem('recordings'))
    // Get the recording details from local storage
    const recordingInfo = recordings.find((recording) => recording.callDetails.leadId === lead_id);

    if (recordingInfo) {
        // Display the recording details in the modal
        document.getElementById("modalFilename").value = recordingInfo.filename;
    } else {
        console.error("No recording found for leadId:", lead_id);
        document.getElementById("modalFilename").value = " ";
    }

    getAllStatus(lead_id);

    document.getElementById("save-id-" + tableId + "-" + index).style.display = "none";
}
function stopRecord(lead_id, index) {
    isCalledByMakeCall = false;
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];
    if (recordings.length === 0) {
        console.error("No recordings to process");
        return;
    }
    console.log("Recording For lead id ", lead_id);
    //console.log(localStorage.getItem('recordings'))
    // Get the recording details from local storage
    const recordingInfo = recordings.find((recording) => recording.callDetails.leadId === lead_id);

    if (recordingInfo) {
        // Display the recording details in the modal
        document.getElementById("modalFilename").value = recordingInfo.filename;
    } else {
        console.error("No recording found for leadId:", lead_id);
        document.getElementById("modalFilename").value = " ";
    }

    getAllStatus(lead_id);

    document.getElementById("save-id-" + index).style.display = "none";
}
function uploadSave() {
    const filename = document.getElementById("modalFilename").value;
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];

    if (recordings.length === 0) {
        console.error("No recordings to upload");
        addNewStatus();
        return;
    }

    // Find the recording that matches the given filename
    const recordingInfo = recordings.find((recording) => recording.filename === filename);
    console.log("Uploading ", filename);
    if (recordingInfo) {
        uploadPhoto(cordova.file.externalRootDirectory + recordingInfo.filename, recordingInfo.callDetails, function (success) {
            if (success) {
                // Remove the uploaded recording from the array
                const updatedRecordings = recordings.filter((recording) => recording.filename !== filename);
                localStorage.setItem("recordings", JSON.stringify(updatedRecordings));
                console.log("Updated recordings:", updatedRecordings);
                populateModalTable(); // Refresh the table after uploading
            } else {
                console.error("Failed to upload recording", recordingInfo);
            }
        });
    } else {
        console.error("No recording found for filename:", filename);
        addNewStatus();
    }
}

function sanitizeInput(input) {
    return input
        .replace(/\\/g, "\\\\") // Escape backslashes
        .replace(/'/g, "\\'") // Escape single quotes
        .replace(/"/g, '\\"') // Escape double quotes
        .trim(); // Trim any extra whitespace
}

function uploadPhoto(imageURI, callDetails, callback) {
    alert(0);
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf("/") + 1);
    // options.mimeType="image/jpeg";

    //
    var leadId = document.getElementById("leadId").value;
    var next_call_date = document.getElementById("next_call_date").value;
    var time = document.getElementById("time").value;
    var summary_note = document.getElementById("summary_note").value;
    var call_status = document.getElementById("call_status").value;
    var userID = localStorage.getItem("userID");

    // Sanitize summary_note before using it
    summary_note = sanitizeInput(summary_note);

    if (next_call_date == "" || summary_note == "") {
        document.getElementById("errorDetailsStatus").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsStatus").innerHTML = "";

        $(".loader").show();
        var params = {};
        params.leadId = leadId;
        params.next_call_date = next_call_date;
        params.time = time;
        params.summary_note = summary_note;
        params.call_status = call_status;
        params.userID = userID;

        options.params = params;
        var ft = new FileTransfer();
        ft.upload(
            imageURI,
            encodeURI("https://teamka.in/crm1/APIs/upload/upload.php"),
            function (r) {
                $(".loader").hide();

                const recordings = JSON.parse(localStorage.getItem("recordings")) || [];
                console.log(recordings.length);
                if (recordings.length == 0) {
                    console.error("No recordings to upload");
                    document.getElementById("overlay").style.display = "none";
                    return;
                }
                myMedia = null;
                var leadId = document.getElementById("leadId").value;

                //document.getElementById("save-id-"+index).style.display="none";

                // document.getElementById("leadId").value = "";
                document.getElementById("next_call_date").value = "";
                document.getElementById("time").value = "";
                document.getElementById("summary_note").value = "";
                alert("Status Uploaded", JSON.stringify(r));
                console.log("Upload sucess");
                saveLogsToFile();
                getAllStatus(leadId);
                // alert("upload success");
                callback(true);
            },
            function (error) {
                $(".loader").hide();
                alert("upload failed");
                console.log("Upload Failed");
                saveLogsToFile();
                callback(false);
            },
            options
        );
        //ft.upload(imageURI, encodeURI("https://test.kalamitcompany.com/testkalam/crm1/APIs/upload/upload.php"), win, fail, options);
        //https://test.kalamitcompany.com/testkalam/crm1/APIs/upload/upload.php;
    }
}
function updateLeadDetails(leadId, leadName) {
    // Update the recording info in localStorage
    const recordingInfo = JSON.parse(localStorage.getItem("currentRecording"));
    if (recordingInfo && recordingInfo.callDetails) {
        recordingInfo.callDetails.leadId = leadId;
        recordingInfo.callDetails.leadName = leadName;
        localStorage.setItem("currentRecording", JSON.stringify(recordingInfo));
    }
}
function populateModalTable() {
    const tableBody = document.getElementById("callDetailsTableBody");
    tableBody.innerHTML = ""; // Clear previous content
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];

    if (recordings.length === 0) {
        console.error("No recording info found");
        document.getElementById("overlay").style.display = "none";
        return;
    }

    recordings.forEach((recording, index) => {
        const audioSrc = cordova.file.externalRootDirectory + recording.filename;
        const leadId = recording.callDetails.leadId;
        const leadName = recording.callDetails.leadName;
        const phoneNumber = recording.callDetails.phone;

        // Determine which button to display
        let buttonHTML;
        if (leadId == "Unknown" || leadId == "Lead Not Added") {
            buttonHTML = `
                    <button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onclick="addmissedlead('${phoneNumber}')">Add New Lead</button>
                    <div class="search-container">
                        <input type="text" id="searchInput" placeholder="Search..." onkeyup="searchLeads(this.value, '${recording.filename}')">
                        <div id="selectButtonContainer" style="display: none;"></div>
                        <div id="searchResults" class="dropdown-content"></div>
                    </div>
                `;
        } else {
            buttonHTML = `
                    <button class="btn btn-primary" data-toggle="modal" data-target="#exampleModal4" onclick="prepareModal('${recording.filename}', '${leadId}')" data-whatever="${leadId}">Upload</button>
                `;
        }

        buttonHTML += `
            <button class="btn btn-danger" onclick="deleteRecording(${index})">Delete</button>
        `;
        
        // Create a new row for the current recording
        const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <audio controls>
                            <source   src="${audioSrc}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </td>
                    <td id="leadIdCell">${leadId ? leadId : ""}</td>
                    <td id="leadInfoCell">${leadName} <br> ${phoneNumber}</td>
                    <td id="buttonCell">
                        ${buttonHTML}
                    </td>

                </tr>
            `;

        tableBody.innerHTML += row;
    });
} 

function deleteRecording(index) {
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];
    if (recordings.length > index) {
        recordings.splice(index, 1); // Remove the recording at the specified index
        localStorage.setItem("recordings", JSON.stringify(recordings)); // Update local storage
        populateModalTable(); // Refresh the table
    } else {
        console.error("Invalid index for deletion");
    }
}

function prepareModal(filename, leadId) {
    document.getElementById("modalFilename").value = filename;
    getAllStatus(leadId); // Assuming this function populates the modal with previous statuses
}

function makeCall(lead_name, lead_id, mobileno, index) {
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];

    if (recordings.length > 0) {
        populateModalTable(); // Populate modal with recording details
        document.getElementById("overlay").style.display = "flex";
        return;
    }

    const callDetails = {
        leadName: lead_name,
        leadId: lead_id,
        phone: mobileno,
    };
    console.log(callDetails);
    isrecord = 2;
    if (mobileno != 0) {
        isCalledByMakeCall = true;
        console.log("Call initiated by CRM");
        recordAudio(callDetails);
        if (document.getElementById("save-id-" + index) != null) {
            document.getElementById("save-id-" + index).style.display = "block";
        }

        cordova.plugins.phonedialer.call(
            mobileno,
            function (success) {
                // alert('Dialing succeeded');
            },
            function (err) {
                if (err == "empty") alert("Unknown phone number");
                else alert("Dialer Error:" + err);
            },
            "",
            ""
        );
    } else {
        alert("Invalid Mobile Number..");
    }
}

function makeCallMulti(lead_name, lead_id, mobileno, index, tableId) {
    //
    const recordings = JSON.parse(localStorage.getItem("recordings")) || [];

    if (recordings.length > 0) {
        populateModalTable(); // Populate modal with recording details
        document.getElementById("overlay").style.display = "flex";
        return;
    }

    const callDetails = {
        leadName: lead_name,
        leadId: lead_id,
        phone: mobileno,
    };

    isrecord = 2;
    if (mobileno != 0) {
        isCalledByMakeCall = true;
        console.log("Call initiated by CRM multi");
        recordAudio(callDetails);
        if (document.getElementById(tableId) != null) {
            var buttonId = "save-id-" + tableId + "-" + index; // Generate unique button ID
            var button = document.getElementById(buttonId);
            if (button != null) {
                button.style.display = "block";
            }
        }

        cordova.plugins.phonedialer.call(
            mobileno,
            function (success) {
                // alert('Dialing succeeded');
            },
            function (err) {
                if (err == "empty") alert("Unknown phone number");
                else alert("Dialer Error:" + err);
            },
            "",
            ""
        );
        //
    } else {
        alert("Invalid Mobile Number..");
    }
}
function getrecount() {
    var count = 0; // Initialize count variable
    var me = localStorage.getItem("userID");
    var type = localStorage.getItem("userType");

    $.ajax({
        url: api_url,
        data: { operation: "getrecount", me: me, type: type },
        success: function (response) {
            count = parseInt(response);
            console.log(count);
            $("#noti1").html(count);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

function getuncount() {
    var count = 0; // Initialize count variable
    var me = localStorage.getItem("userID");
    var type = localStorage.getItem("userType");

    $.ajax({
        url: api_url,
        data: { operation: "getuncount", me: me, type: type },
        success: function (response) {
            count = parseInt(response);
            console.log(count);
            $("#noti2").html(count);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

function gettrcount() {
    var count = 0; // Initialize count variable
    var me = localStorage.getItem("userID");
    var type = localStorage.getItem("userType");

    $.ajax({
        url: api_url,
        data: { operation: "gettrcount", me: me, type: type },
        success: function (response) {
            count = parseInt(response);
            console.log(count);
            $("#noti3").html(count);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

function testallLeads() {
    // alert("test1")
    var content =
        '<div class="d-flex justify-content-center"><div class="btn-item" onclick="loadtable()">All Leads</div><div class="btn-item" id="new">NEW </div><div class="btn-item" id="demo">Demo done </div><div class="btn-item" id="mail">Proposail Mailed </div><div class="btn-item" id="unassigned">Unassigned <span id="noti2">0</span> </div><div class="btn-item" id="converted">Converted </div><div class="btn-item" id="pending">Pending </div><div class="btn-item" id="followup">Followup </div><div class="btn-item" id="dead">DEAD </div><div class="btn-item " id="reregistered">Reregistered <span id="noti1">0</span></div><div class="btn-item" id="transferred">Transferred <span id="noti3">0</span></div><div class="btn-item" id="monster">Marked Monster </div></div><table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Summary DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>" + content;

    $("#table1 button").click(function () {
        // Get the clicked button
        const clickedButton = $(this);

        // Find the closest table row (TR) element
        const clickedRow = clickedButton.closest("tr");

        // Add the "highlited" class to the row
        clickedRow.addClass("table-primary");
    });
    var option = "default";

    getrecount();
    gettrcount();
    getuncount();

    function loadtable() {
        if ($.fn.DataTable.isDataTable("#table1")) {
            // If DataTable is already initialized, destroy it
            $("#table1").DataTable().destroy();
        }
        var table = $("#table1").DataTable({
            order: [],
            processing: false,
            paging: true,
            pagingType: "full_numbers",
            serverSide: true,
            ajax: {
                url: api_url,
                method: "POST",
                data: { operation: "0041", option: option },
                beforeSend: function () {
                    $(".loader").show();
                },
                complete: function () {
                    $(".loader").hide();
                },
            },
            columnDefs: [
                {
                    targets: 0,
                    render: function (data, type, row, meta) {
                        return row[0];
                    },
                },
                {
                    targets: 1,
                    render: function (data, type, row, meta) {
                        return row[1];
                    },
                },
                {
                    targets: 2,
                    render: function (data, type, part, meta) {
                        // console.log(meta)
                        if (type === "display") {
                            var index = meta.row;
                            data = `
                        <a href="javascript:void(0)" onclick="makeCall('${part[1]}', '${part[0]}', '${part[2]}', ${index})">${part[2]}</a><br>
                        <a href="javascript:void(0)" onclick="makeCall('${part[1]}', '${part[0]}','${part[3]}', ${index})">${part[3]}</a><br>
                        <a href="https://api.whatsapp.com/send?phone=91${part[4]}">${part[4]}</a><br>
                        ${part[5]}<br>
                        <button style="display: none;" data-toggle="modal" data-target="#exampleModal4" data-whatever="${part[0]}" id="save-id-${index}" onclick="stopRecord('${part[0]}', ${index})">End Call</button>
                      `;
                        }
                        return data;
                    },
                },

                {
                    targets: 3,
                    render: function (data, type, row, meta) {
                        if (type === "display") {
                            data = row[11] + "<br/>" + row[12];
                        }
                        return data;
                    },
                },
                {
                    targets: 4,
                    render: function (data, type, row, meta) {
                        return row[6];
                    },
                },
                {
                    targets: 5,
                    render: function (data, type, row, meta) {
                        return row[7];
                    },
                },
                {
                    targets: 6,
                    render: function (data, type, row, meta) {
                        return row[8];
                    },
                },
                {
                    targets: 7,
                    render: function (data, type, row, meta) {
                        return row[9];
                    },
                },
                {
                    targets: 8,
                    render: function (data, type, row, meta) {
                        return row[14];
                    },
                },
                {
                    targets: 9,
                    render: function (data, type, part, meta) {
                        if (type === "display") {
                            var index = meta.row;
                            data =
                                '<button data-toggle="modal" class="btn-edit" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                                part[0] +
                                ')">Edit</button><br><button class="btn-status" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                                part[0] +
                                '" onclick="getAllStatus(' +
                                part[0] +
                                ')">Status</button>';
                        }
                        return data;
                    },
                },
                {
                    targets: 10,
                    render: function (data, type, row, meta) {
                        return row[10];
                    },
                },
            ],
            createdRow: function (row, data, index) {
                if (data[8] == "New") {
                    $("td:eq(6)", row).css({ "background-color": "red", color: "white" });
                } else if (data[8] == "Converted") {
                    $("td:eq(6)", row).css({
                        "background-color": "green",
                        color: "white",
                    });
                } else if (data[8] == "Proposail Mailed") {
                    $("td:eq(6)", row).css({
                        "background-color": "yellow",
                        color: "black",
                    });
                } else if (data[8] == "Pending") {
                    $("td:eq(6)", row).css({
                        "background-color": "orange",
                        color: "white",
                    });
                } else {
                    //$('td:eq(6)', row).css({'background-color': 'red','color':'white'});
                }

                const statusButton = $(row).find(".btn-status");
                const editButton = $(row).find(".btn-edit");

                // Function to highlight the clicked row
                function highlightRow(tr) {
                    // Remove "highlighted" class from all table rows (optional)
                    $("table#table1 tr").removeClass("table-primary");

                    // Add "highlighted" class to the clicked row
                    tr.addClass("table-primary");
                }

                // Click event for status button
                statusButton.on("click", function () {
                    // Get the table row (TR) of the clicked button
                    var tr = $(this).closest("tr");
                    highlightRow(tr);
                });

                // Click event for edit button
                editButton.on("click", function () {
                    // Get the table row (TR) of the clicked button
                    var tr = $(this).closest("tr");
                    highlightRow(tr);
                });
            },
        });
    }

    loadtable();

    // Loop through all buttons with class 'btn-item'
    $(".btn-item").each(function () {
        // Attach click event listener
        $(this).on("click", function () {
            // Get the id of the clicked button
            $(".btn-item").removeClass("active");

            // Add 'bhj' class to the clicked button
            $(this).addClass("active");
            var id = $(this).attr("id");

            // Assign option based on the id of the clicked button
            switch (id) {
                case "demo":
                    option = "demo";
                    break;
                case "reregistered":
                    option = "registered";
                    break;
                case "mail":
                    option = "mailed";
                    break;
                case "converted":
                    option = "converted";
                    break;
                case "transferred":
                    option = "transferred";
                    break;
                case "pending":
                    option = "pending";
                    break;
                case "followup":
                    option = "followup";
                    break;
                case "dead":
                    option = "dead";
                    break;
                case "unassigned":
                    option = "unassigned";
                    break;
                case "new":
                    option = "new";
                    break;
                case "monster":
                    option = "monster";
                    break;
                default:
                    // Default option if id doesn't match any specific case
                    option = "default";
                    break;
            }

            // Call loadtable() function with the updated option
            loadtable();
        });
    });
}

function allLeads() {
    testallLeads();
    /*
          $('.loader').show();
        $.ajax({
            url : api_url,
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
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br><a href="https://api.whatsapp.com/send?phone=91'+part[4]+'">'+part[4]+'</a><br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Converted"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Proposail Mailed"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Pending"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else{
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }

                }
                content += '</tbody></table></div>';
                document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>"+content;
                $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });
            }, error: function (jqXHR, exception) { var msg=displayerror(jqXHR, exception); alert(msg); },

        });
        */
}
//<a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'","'+part[0]+'")>'+part[2]+'</a><br><a href="tel:'+part[3]+'">'+part[3]+'</a><br><a href="https://api.whatsapp.com/send?phone=91'+part[4]+'">'+part[4]+'</a><br>'+part[5]+'
function showdataTLLeads(id, encoded) {
    let decoded = decodeURI(encoded);

    $("#showdataTLLeads" + id).html(decoded);
}

function testallLeadsTL() {
    // alert("test1")
    var content =
        '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Summary DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';

    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML =
        "<h1>All Leads</h1><div><a href='https://teamka.in/crm1/APIs/leads_export.php'>Export</a></div><div style='overflow-x:scroll;'>" + content;
    var me = localStorage.getItem("userID");
    var table = $("#table1").DataTable({
        order: [[0, "desc"]],
        processing: true,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "0041" },

            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columnDefs: [
            {
                targets: 0,
                render: function (data, type, row, meta) {
                    return row[0];
                },
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return row[1];
                },
            },
            {
                targets: 2,
                render: function (data, type, part, meta) {
                    // console.log(data, type, part, meta)
                    if (type === "display") {
                        var index = meta.row;
                        var datak =
                            '<a href="javascript:void(0)" onclick="makeCall(part[1], part[0], part[2], index)">part[2]</a><br><a href="javascript:void(0)" onclick="makeCall(part[1], part[0], part[3], index)">part[3]</a><br><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[4] +
                            '">' +
                            part[4] +
                            "</a><br>" +
                            part[5] +
                            '<br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[0] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[0] +
                            '","' +
                            index +
                            '")>End Call</button>';
                        // datak = '<a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'","'+part[0]+'")>'+part[2]+'</a><br><a href="tel:'+part[3]+'">'+part[3]+'</a><br><a href="https://api.whatsapp.com/send?phone=91'+part[4]+'">'+part[4]+'</a><br>'+part[5]+'<button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" id="save-id-'+index+'" onclick=stopRecord("'+index+'")>Stop</button>';
                        let encoded = encodeURI(datak);

                        // data = '<k id="showdataTLLeads'+part[0]+'"><button onclick=showdataTLLeads("'+part[0]+'","'+part[2]+'","'+part[3]+'","'+part[4]+'","'+part[5]+'")>Show Data</button></k>'
                        data = '<k id="showdataTLLeads' + part[0] + '"><button onclick=showdataTLLeads("' + part[0] + '","' + encoded + '")>Show Data</button></k>';
                    }
                    return data;
                },
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    if (type === "display") {
                        data = row[11] + "<br/>" + row[12];
                    }
                    return data;
                },
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return row[6];
                },
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    return row[7];
                },
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return row[8];
                },
            },
            {
                targets: 7,
                render: function (data, type, row, meta) {
                    return row[9];
                },
            },
            {
                targets: 8,
                render: function (data, type, row, meta) {
                    return row[14];
                },
            },
            {
                targets: 9,
                render: function (data, type, part, meta) {
                    if (type === "display") {
                        var index = meta.row;
                        data =
                            '<button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[0] +
                            '" onclick="getAllStatus(' +
                            part[0] +
                            ')">Status</button>';
                    }
                    return data;
                },
            },
            {
                targets: 10,
                render: function (data, type, row, meta) {
                    return row[10];
                },
            },
        ],
        createdRow: function (row, data, index) {
            if (data[8] == "New") {
                $("td:eq(6)", row).css({ "background-color": "red", color: "white" });
            } else if (data[8] == "Converted") {
                $("td:eq(6)", row).css({ "background-color": "green", color: "white" });
            } else if (data[8] == "Proposail Mailed") {
                $("td:eq(6)", row).css({
                    "background-color": "yellow",
                    color: "black",
                });
            } else if (data[8] == "Pending") {
                $("td:eq(6)", row).css({
                    "background-color": "orange",
                    color: "white",
                });
            } else {
                //$('td:eq(6)', row).css({'background-color': 'red','color':'white'});
            }
        },
    });
}

function allLeadsTL() {
    testallLeadsTL();
    /*
          $('.loader').show();
        $.ajax({
            url : api_url,
            data : {operation : "004"},
            success : function (response){
          $('.loader').hide();
                var partialArranged = response.split("<END>");
                var content = '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Summary DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
                var totalUpdates = partialArranged.length - 1;

                for (let index = 1; index <= totalUpdates; index++) {
                    var element = partialArranged[index-1];
                    var part = element.split("<-->");
                    if(part[8]=="New"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td> <k id="showdataTLLeads'+part[0]+'"><button onclick="showdataTLLeads('+part[0]+',`'+part[2]+'`,`'+part[3]+'`,`'+part[4]+'`,`'+part[5]+'`)">Show Data</button></k></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td>'+part[14]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Converted"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><k id="showdataTLLeads'+part[0]+'"> <button onclick="showdataTLLeads('+part[0]+',`'+part[2]+'`,`'+part[3]+'`,`'+part[4]+'`,`'+part[5]+'`)">Show Data</button></k></td><td style="background-color:green;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td>'+part[14]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Proposail Mailed"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><k id="showdataTLLeads'+part[0]+'"> <button onclick="showdataTLLeads('+part[0]+',`'+part[2]+'`,`'+part[3]+'`,`'+part[4]+'`,`'+part[5]+'`)">Show Data</button></k></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black;" >'+part[8]+'</td><td>'+part[9]+'</td><td>'+part[14]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else if(part[8]=="Pending"){
                    content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td> <k id="showdataTLLeads'+part[0]+'"> <button onclick="showdataTLLeads('+part[0]+',`'+part[2]+'`,`'+part[3]+'`,`'+part[4]+'`,`'+part[5]+'`)">Show Data </button> </k></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td>'+part[14]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }else{
                        content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td> <k id="showdataTLLeads'+part[0]+'"> <button onclick="showdataTLLeads('+part[0]+',`'+part[2]+'`,`'+part[3]+'`,`'+part[4]+'`,`'+part[5]+'`)">Show Data </button> </k></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td>'+part[14]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                    }

                }
                content += '</tbody></table></div>';
                document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>"+content;
                $("#table1").DataTable( {   "order": [[ 0, "desc" ]] , stateSave: true  });
            }, error: function (jqXHR, exception) { var msg=displayerror(jqXHR, exception); alert(msg); },

        });
        */
}

/*
    function showlddata(id,mobile,alternate,whatsapp,email){
        alert(0);
        $("#alllddata"+id).html("<a href='tel:"+mobile+"'>"+mobile+"</a><br><a href='tel:"+alternate+"'>"+alternate+"</a><br><a href='https://api.whatsapp.com/send?phone=91"+whatsapp+"'>"+whatsapp+"</a><br>"+email+"");
      //
    }
    */
// Get Projects
function getProjects() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "063" },
        success: function (response) {
            $(".loader").hide();
            var projects = response.split("<-->");
            var content = '<option value="0">General</option>';
            for (let i = 0; i < projects.length - 1; i++) {
                var data = projects[i].split("/AND/");
                content += "<option value=" + parseInt(data[0]) + " >" + data[1] + "</option>";
            }

            document.getElementById("projDetails").innerHTML = content;
            $("#projDetails").selectpicker();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

// Get Cities
function getCities() {
    $.ajax({
        url: api_url,
        data: { operation: "069" },
        success: function (response) {
            var data = response.split("<-->");
            var content = "";
            for (var i = 1; i < data.length - 1; i++) {
                content += "<option value='" + data[i] + "'>" + data[i] + "</option>";
            }
            document.getElementById("statsForCity").innerHTML = content;
            console.log(content);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Get Callers
function getCallers() {
    checkLeadStatus();
    statistics();
    getDevelopers();
    getProjects();
    // getCities();
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "010" },
        success: function (response) {
            $(".loader").hide();
            var callers = response.split("<-->");
            var content = "";
            for (let i = 0; i < callers.length - 1; i++) {
                var data = callers[i].split("/AND/");
                if (data[2] == "Admin") {
                    content += "<option value=" + parseInt(data[0]) + " >" + data[1] + "(Admin)</option>";
                } else {
                    content += "<option value=" + parseInt(data[0]) + " >" + data[1] + "</option>";
                }
            }
            if (localStorage.getItem("userType") == "Admin" || localStorage.getItem("userType") == "TL") {
                document.getElementById("caller_id").innerHTML = content;
                document.getElementById("edit_caller_id").innerHTML = content;
            }

            document.getElementById("assignedTo").innerHTML = content;
            document.getElementById("edit_callerA").innerHTML = content;

            localStorage.setItem("AllUSERDROPDWN", content);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

// Fill Update Lead Form
function fillUpdateForm(id) {
    localStorage.setItem("lead_id", id);
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "006", id: id },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            //  lol();
            if (localStorage.getItem("userType") == "Caller") {
                $("#edit_mobile").prop("disabled", true);
            }
            //console.log(data[7]);
            document.getElementById("edit_name").value = data[1];
            document.getElementById("edit_mobile").value = data[2];
            document.getElementById("edit_alternate_mobile").value = data[3];
            document.getElementById("edit_whatsapp").value = data[4];
            document.getElementById("edit_email").value = data[5];
            document.getElementById("edit_interested_in").value = data[6];
            document.getElementById("edit_source").value = data[7];
            document.getElementById("edit_status").value = data[8];
            document.getElementById("edit_state").value = data[10];
            document.getElementById("edit_district").innerHTML = "<option value='" + data[11] + "'>" + data[11] + "</option>";
            document.getElementById("edit_caller_id").value = parseInt(data[12]);
            // $(`#edit_caller_id option[value=${data[12]}]`).selected="true";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Update Lead
function updateLeads() {
    var name = document.getElementById("edit_name").value;
    var mobile = document.getElementById("edit_mobile").value;
    var alternate_mobile = document.getElementById("edit_alternate_mobile").value;
    var whatsapp = document.getElementById("edit_whatsapp").value;
    var email = document.getElementById("edit_email").value;
    var interested_in = document.getElementById("edit_interested_in").value;
    var source = document.getElementById("edit_source").value;
    var status = document.getElementById("edit_status").value;
    var caller_id = document.getElementById("edit_caller_id").value;
    var caller = $(`#edit_caller_id option[value=${caller_id}]`).text();
    var state = document.getElementById("edit_state").value;
    var city = document.getElementById("edit_district").value;
    var id = localStorage.getItem("lead_id");

    if (name == "" || mobile == "") {
        document.getElementById("editErrorDetails").innerHTML = "Fill the Form Correctly";
    } else {
        $(".loader").show();

        $.ajax({
            url: api_url,
            data: {
                operation: "007",
                id: id,
                name: name,
                mobile: mobile,
                alternate_mobile: alternate_mobile,
                whatsapp: whatsapp,
                email: email,
                interested_in: interested_in,
                source: source,
                status: status,
                caller_id: caller_id,
                caller: caller,
                state: state,
                city: city,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    localStorage.removeItem("lead_id");
                    $(".close").click();
                    if (localStorage.getItem("userType") == "Admin") {
                        //  allLeads();
                    } else if (localStorage.getItem("userType") == "Caller") {
                        //  myLeads();
                    }
                } else if (response == 2) {
                    document.getElementById("editErrorDetails").innerHTML = "Lead already exist";
                } else {
                    localStorage.removeItem("lead_id");
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function getempStatuscount() {
   
    $.ajax({
        url: api_url,
        data: { operation: "getempStatuscount" },
        dataType: "json", // Specify the expected response format as JSON
        success: function (response) {
            if (response){
                var data = response.data;
                $("#noti5").html(data['Absconded']);
                $("#noti2").html(data["Active"]);
                $("#noti1").html(data["All"]);
                $("#noti3").html(data['Fired']);
                $("#noti4").html(data["Suspended"]);
                $("#noti6").html(data["Resigned"]);
            }else{
                alert("Failed to get data");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}


// function allCaller() {
//     // Create the table structure
//     var content = `
//         <h1>All Members</h1>
//         <div class='container' style='overflow-x:scroll;'>
//         <div class="d-flex justify-content-center">
//             <div class="btn-item active" id="All">All <span id="noti1">0</span></div>
//             <div class="btn-item" id="Active">Active <span id="noti2">0</span></div>
//             <div class="btn-item" id="Fired">Fired <span id="noti3">0</span></div>
//             <div class="btn-item" id="Suspended">Suspended <span id="noti4">0</span></div>
//             <div class="btn-item" id="Absconded">Absconded <span id="noti5">0</span></div>
//             <div class="btn-item" id="Resigned">Resigned <span id="noti6">0</span></div>
//         </div>
//         <table id="table2" class="table table-bordered table-striped">
//             <thead>
//                 <tr>
//                     <th>ID</th>
//                     <th>Name</th>
//                     <th>Mobile No</th>
//                     <th>Type</th>
//                     <th>DOR</th>
//                     <th>Status</th>
//                     <th>Lead Type</th>
//                     <th>Lead Status</th>
//                     <th>Attendence</th>
//                     <th>Show Attend..</th>
//                 </tr>
//             </thead>
//         </table>
//         </div>`;

//     document.getElementById("displayContent").innerHTML = content;

//     // Function to initialize/reload DataTable
//     function loadtable2(option) {
//         if ($.fn.DataTable.isDataTable("#table2")) {
//             // Destroy existing DataTable
//             $("#table2").DataTable().destroy();
//         }
//         getempStatuscount();
//         $("#table2").DataTable({
            
//             ajax: {
//                 url: api_url,
//                 method: "POST",
//                 data: {
//                     operation: "005",
//                     option: option, // Pass the dynamic option value
//                 },
//                 beforeSend: function () {
//                     $(".loader").show();
//                 },
//                 complete: function () {
//                     $(".loader").hide();
//                 },
//             },
//             columns: [
//                 { data: "Admin_ID" },
//                 { data: "Name" },
//                 { data: "Mobile" },
//                 { data: "Type" },
//                 {
//                     data: "Joining Date",
//                     render: function (data, type, row) {
//                         return row.Joining_Date;
//                     },
//                 },
//                 { data: "Status" },
//                 {
//                     data: "Types",
//                     render: function (data, type, row) {
//                         return row.Types;
//                     },
//                 },
//                 {
//                     data: "leadStatus",
//                     render: function (data, type, row) {
//                         if (data == 1) {
//                             return '<button class="btn btn-danger" onclick="disableLead(' + row.Admin_ID + ')">Disable</button>';
//                         } else {
//                             return '<button class="btn btn-success" onclick="enableLead(' + row.Admin_ID + ')">Enable</button>';
//                         }
//                     },
//                 },
//                 {
//                     data: "metaStatus",
//                     render: function (data, type, row) {
//                         console.log(row);
//                         if (data == 1) {
//                             return (
//                                 '<button class="btn btn-success" data-toggle="modal" data-target="#ModalAttendence" onclick="getAdminMeta(' +
//                                 row.EMP_ID +
//                                 ",'" +
//                                 row.username +
//                                 "')\">Edit</button>"
//                             );
//                         } else {
//                             return (
//                                 '<button class="btn btn-danger" data-toggle="modal" data-target="#ModalAttendence" onclick="getAdminMeta(' +
//                                 row.EMP_ID +
//                                 ",'" +
//                                 row.Name +
//                                 "')\">Add</button>"
//                             );
//                         }
//                     },
//                 },
//                 {
//                     data: "metaStatus",
//                     render: function (data, type, row) {
//                         return '<button class="btn btn-success" onclick="showAttendence(' + row.Admin_ID + ')">Show</button>';
//                     },
//                 },
//             ],
//             createdRow: function (row, data, index) {
//                 if (data["Status"] === "Suspended") {
//                     $("td:eq(5)", row).css({ "background-color": "red", color: "white" });
//                 } else if (data["Status"] === "Active") {
//                     $("td:eq(5)", row).css({ "background-color": "green", color: "white" });
//                 }
//             },
//             stateSave: true,
//         });
//     }

//     // Initial table load with "All"
//     loadtable2("All");

//     // Event listener for buttons
//     $(".btn-item").on("click", function () {
//         // Highlight the active button
//         $(".btn-item").removeClass("active");
//         $(this).addClass("active");

//         // Get the selected option
//         var option = $(this).attr("id");

//         // Reload the table with the selected option
//         loadtable2(option);
//     });
// }


function showExpense() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "showExpense" },
        dataType: "json", // Specify the expected response format
        success: function (response) {
            $(".loader").hide();
            console.log(response);
            if (response.success) {
                var content = `
                         <h1>All Expenses</h1>
                         <div class='container mt-5' style='overflow-x:scroll;'>
                             <table id="expensetable" class="table table-bordered table-striped">
                                 <thead>
                                     <tr>
                                         <th>ID</th>
                                         <th>Amount</th>
                                         <th>Expense For</th>
                                         <th>Remarks</th>
                                         <th>PD_ID</th>
                                         <th>Proff</th>
                                         <th>Date Of Expense</th>
                                         <th>DOR</th>
                                         <th>Expense For</th>
                                         <th>Expense Pourpose</th>
                                         <th>Expense Account</th>
                                         <th>Option</th>
                                     </tr>
                                 </thead>
                             </table>
                         </div>`;

                document.getElementById("displayContent").innerHTML = content;

                // Initialize DataTable with the JSON data
                $("#expensetable").DataTable({
                    data: response.data,
                    order: [[0, "desc"]],

                    columns: [
                        { data: "ET_ID" },
                        { data: "EXP_Amount" },
                        { data: "Expense_For" },
                        { data: "Remark" },
                        { data: "PD_ID" },
                        { data: "Proff" },
                        { data: "Date_Of_Expense" },
                        { data: "DOR" },
                        {
                            data: null,
                            render: function (data, type, row) {
                                if (row["EXP_For"]) {
                                    switch (row["EXP_For"]) {
                                        case "1":
                                            return "Academy";
                                        case "2":
                                            return "Agency";
                                        case "3":
                                            return "My Galla";
                                        default:
                                            return row["EXP_For"];
                                    }
                                }
                                return "";
                            },
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                                console.log(row["Expense_Purpose"] == 1);
                                if (row["Expense_Purpose"]) {
                                    switch (row["Expense_Purpose"]) {
                                        case "1":
                                            return "Marketing";
                                        case "2":
                                            return "Salary";
                                        case "3":
                                            return "Rent";
                                        case "4":
                                            return "Other";
                                        default:
                                            return row["Expense_Purpose"];
                                    }
                                }
                                return "";
                            },
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                                if (row["From_Account"]) {
                                    switch (row["From_Account"]) {
                                        case "1":
                                            return "GreenTech India";
                                        case "2":
                                            return "Axis (Vikash)";
                                        case "3":
                                            return "Kotak (Vikash)";
                                        case "4":
                                            return "Other";
                                        case "5":
                                            return "Cash";
                                        case "6":
                                            return "My Galla HDFC";
                                        case "7":
                                            return "Kalam Foundation Axis Bank";
                                        default:
                                            return row["From_Account"];
                                    }
                                }
                                return "";
                            },
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                                return (
                                    '<button class="btn btn-primary" data-toggle="modal" data-target="#exampleModalExpenseEdit" onclick="editExpense(' +
                                    row["ET_ID"] +
                                    ')">Edit</button>'
                                );
                            },
                        },
                    ],
                });
            } else {
                alert("Failed to fetch data");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function editExpense(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "showExpense", id: id },
        success: function (response) {
            response = JSON.parse(response);
            data = response.data[0];
            console.log(data);
            $("#edit_ET_ID").val(id);
            $("#edit_Expense_For").val(data.Expense_For);
            $("#edit_Remark").val(data.Remark);
            $("#edit_PD_ID").val(data.PD_ID);
            $("#edit_Proff").val(data.Proff);
            $("#edit_Date_Of_Expense").val(data.Date_Of_Expense);
            $("#edit_From_Account").val(data.From_Account);
            $("#edit_EXP_Amount").val(data.EXP_Amount);
            $("#edit_Expense_Purpose").val(data.Expense_Purpose);
            $("#edit_EXP_For").val(data.EXP_For);

            $(".loader").hide();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function showAttendence(id) {
    localStorage.setItem("selectedUser", id);
    window.open("./CalenderDataUser.html", "_blank");
}

// function getAdminMeta(id,emp_id) {
//     $("#admin_name").val("");
//     $("#joined_date").val("");
//     $("#reporting_time").val("");
//     $("#attendence_status").val("");
//     $("#basic_salary").val("");
//     $("#allowed_week_off").val("");
//     $("#due_week_off").val("");
//     $("#allowed_late").val("");
//     $("#due_late").val("");
//     $("#number_of_nodes").val("");
//     $("#nodes_incentive").val("");
//     $("#number_of_demos").val("");
//     $("#demos_incentive").val("");

//     // Clear new fields
//     $("#user_phone_number").val("");
//     $("#user_email").val("");
//     $("#address_present").val("");
//     $("#address_permanent").val("");
//     $("#alt_contact_person_1").val("");
//     $("#alt_number_1").val("");
//     $("#alt_contact_person_2").val("");
//     $("#alt_number_2").val("");
//     $("#alt_contact_person_3").val("");
//     $("#alt_number_3").val("");
//     $("#fileurl").val("");
//     $("#user_ac").val("");
//     $("#user_ifsc").val("");
//     $("#user_upi").val("");
//     clearFileInput();
//     $("#lt-select option").prop("selected", false);
//     $("#lt-select").selectpicker("refresh");

//     $.ajax({
//         url: api_url,
//         data: { operation: "getAdminMeta", id: id },
//         success: function (response) {
//             response = JSON.parse(response);
//             console.log(response);

//             if (response.success == true) {
              
//                 $("#adminEMP_id").val(emp_id);
//                 $("#admin_id").val(id);
//                 $("#joined_date").val(response.data.Joining_Date);
//                 $("#reporting_time").val(response.data.Reporting_Time);
//                 $("#attendence_status").val(response.data.Status);
//                 $("#basic_salary").val(response.meta.basicSalary);
//                 $("#allowed_week_off").val(response.meta.allowedWeekOff);
//                 $("#due_week_off").val(response.meta.dueWeekOff);
//                 $("#allowed_late").val(response.meta.allowedLate);
//                 $("#due_late").val(response.meta.dueLate);
//                 $("#number_of_nodes").val(response.meta.numberOfNodes);
//                 $("#nodes_incentive").val(response.meta.nodesIncentive);
//                 $("#number_of_demos").val(response.meta.numberOfDemos);
//                 $("#demos_incentive").val(response.meta.demosIncentive);

//                 // Populate new fields

//                 $("#user_ac").val(response.meta.userac);
//                 $("#user_ifsc").val(response.meta.userifsc);
//                 $("#user_upi").val(response.meta.userupi);
//                 $("#user_phone_number").val(response.meta.userPhoneNumber);
//                 $("#user_email").val(response.meta.userEmail);
//                 $("#address_present").val(response.meta.addressPresent);
//                 $("#address_permanent").val(response.meta.addressPermanent);
//                 $("#alt_contact_person_1").val(response.meta.altContactPerson1);
//                 $("#alt_number_1").val(response.meta.altNumber1);
//                 $("#alt_contact_person_2").val(response.meta.altContactPerson2);
//                 $("#alt_number_2").val(response.meta.altNumber2);
//                 $("#alt_contact_person_3").val(response.meta.altContactPerson3);
//                 $("#alt_number_3").val(response.meta.altNumber3);
//                 $("#fileurl").val(response.meta.fileurl);

//                 if (response.meta.leadType) {
//                     response.meta.leadType.forEach(function (selectedOption) {
//                         // Iterate over each option in the select dropdown
//                         $("#lt-select option").each(function () {
//                             // Check if the current option matches the selected option
//                             if ($(this).val() === selectedOption.trim()) {
//                                 $(this).prop("selected", true); // Mark as selected
//                             }
//                         });
//                     });
//                 }

//                 $("#lt-select").selectpicker("refresh");

//                 var urls = response.meta.fileurl.split(",");

//                 // Generate image previews
//                 generateImagePreviews(urls);

//                 function generateImagePreviews(urls) {
//                     $("#image-preview-container").empty(); // Clear existing previews
//                     if (urls.length === 0) {
//                         // Show "No images" message if array is empty
//                         $("#image-preview-container").html("<p>No images</p>");
//                     } else {
//                         urls.forEach(function (url, index) {
//                             // Create the image preview container
//                             var imagePreview = `
//                               <div class="image-preview" style="display:inline-block; position:relative; margin:5px;">
//                                   <img src="${url}" alt="Image" style="width: 100px; height: 100px; object-fit: cover;">
//                                   <button class="remove-image" type="button" style="position: absolute; top: 0; right: 0; background: red; color: white; border: none; cursor: pointer;" data-index="${index}"              >&times;</button>
//                               </div>
//                           `;

//                             // Append the preview to the container
//                             $("#image-preview-container").append(imagePreview);
//                         });
//                     }
//                 }

//                 // Delegate the event to handle dynamically generated remove buttons
//                 $(document).on("click", ".remove-image", function (event) {
//                     event.preventDefault(); // Prevent the default action

//                     var indexToRemove = $(this).data("index");

//                     // Remove the corresponding URL from the array
//                     urls.splice(indexToRemove, 1);

//                     // Update the textarea value
//                     $("#fileurl").val(urls.join(","));

//                     // Regenerate the image previews
//                     generateImagePreviews(urls);
//                 });
//             } else {
//                 $("#admin_id").val(id);
//                 $("#admin_name").val(name);
//             }
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

function clearFileInput() {
    // Clear the file input
    var fileInput = document.getElementById("newImageInputhr");
    fileInput.value = "";

    // Hide the image preview and buttons
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("removeImageBtn").style.display = "none";
    document.getElementById("confirmUploadBtn").style.display = "none";
}

// function getAdminDetails(id) {
//     $("#edit_CallerID").val("");
//     $("#edit_nameCaller").val("");
//     $("#edit_mobileCaller").val("");
//     $("#edit_passwordCaller").val("");
//     $("#edit_type").val("");

//     $.ajax({
//         url: api_url,
//         data: { operation: "getAdminDetails", id: id },
//         success: function (response) {
//             response = JSON.parse(response);
//             console.log(response);

//             if (response.success == true) {
//                 $("#edit_CallerID").val(id);
//                 $("#edit_nameCaller").val(response.data.Name);
//                 $("#edit_mobileCaller").val(response.data.Mobile);
//                 $("#edit_passwordCaller").val(response.data.Password);
//                 $("#edit_type").val(response.data.Type);
//             }
//         },
//         error: function (jqXHR, exception) {
//             var msg = displayerror(jqXHR, exception);
//             alert(msg);
//         },
//     });
// }

function disableLead(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "061", id: id },
        success: function (response) {
            $(".loader").hide();
            if (response == 1) {
                alert("Disabled");
            } else {
                alert("Error Occured");
            }
            allCaller();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function enableLead(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "062", id: id },
        success: function (response) {
            $(".loader").hide();
            if (response == 1) {
                alert("Enabled");
            } else {
                alert("Error Occured");
            }
            allCaller();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function addNewStatus() {
    let callerID;
    // Check user type
    if (localStorage.getItem("userType") === "Support") {
        callerID = document.getElementById("support-agent").value;
    } else {
        callerID = localStorage.getItem("userID");
    }
    // var callerID = localStorage.getItem("userID");

    var leadId = document.getElementById("leadId").value;
    var next_call_date = document.getElementById("next_call_date").value;
    var time = document.getElementById("time").value;
    var summary_note = document.getElementById("summary_note").value;
    var call_status = document.getElementById("call_status").value;
    if (next_call_date == "" || summary_note == "") {
        document.getElementById("errorDetailsStatus").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsStatus").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "008",
                leadId: leadId,
                next_call_date: next_call_date,
                time: time,
                summary_note: summary_note,
                call_status: call_status,
                callerID: callerID,
            },
            success: function (response) {
                console.log("response");
                $(".loader").hide();
                if (response == 1) {
                    handleDemoCallScenario(call_status, leadId, callerID);

                    document.getElementById("leadId").value = "";
                    document.getElementById("next_call_date").value = "";
                    document.getElementById("time").value = "";
                    document.getElementById("summary_note").value = "";
                    alert("Status Uploaded");

                    getAllStatus(leadId);
                } else {
                    alert(response);
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function handleDemoCallScenario(callStatus, id, callerID) {
    callStatus = callStatus.trim();
    switch (callStatus) {
        case "Demo Done":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Call Busy":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Call Drop":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Switched Off":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Not Received":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Incoming Off":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Connected(Not Available)":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Not Interested":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Positive / Interested":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Fund Issue":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Pricing Issue":
            checkDemomail(callStatus, id, callerID);
            break;

        case "Inprocess (Interested)":
            checkDemomail(callStatus, id, callerID);
            break;

        default:
            console.log("Unknown Scenario: No action available for this scenario.", callStatus);
            break;
    }
}

function getMailTemplate(adminName, mobile, leadName, email, call_status, demoStatus) {
    $.ajax({
        url: api_url,
        data: { operation: "getMailTemplate", adminName: adminName, mobile: mobile, leadName: leadName, email: email, call_status: call_status, demoStatus: demoStatus },
        success: function (response) {
            response = JSON.parse(response);
            console.log(response);

            if (response.success == true) {
                sendMailNew(response.content);
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function checkDemomail(call_status, id, callerID) {
    console.log(call_status, id);
    $.ajax({
        url: api_url,
        data: { operation: "checkDemomail", leadId: id, callerID: callerID },
        success: function (response) {
            response = JSON.parse(response);
            console.log(response);
            const demoStatus = response.demoDone ? "Yes" : "No";
            const adminName = response.data.AdminName;
            const mobile = response.data.Mobile;
            const leadName = response.data.LeadName;
            const email = response.data.Email;
            if (response.demoDone == true) {
                getMailTemplate(adminName, mobile, leadName, email, call_status, demoStatus);
            } else if (response.demoDone == false) {
                getMailTemplate(adminName, mobile, leadName, email, call_status, demoStatus);
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

document.addEventListener(
    "play",
    function (e) {
        var audios = document.getElementsByTagName("audio");
        for (var i = 0, len = audios.length; i < len; i++) {
            if (audios[i] != e.target) {
                audios[i].pause();
            }
        }
    },
    true
);
//Get All Status
function getAudio(condition) {
    if (condition != "") {
        return "<audio controls><source src='" + condition + "' type='audio/mpeg'>Your browser does not support the html audio tag.</audio>";
    } else {
        return "";
    }
}
function getAllStatus(id) {
    id = parseInt(id);
    console.log("Getting Status For Lead ID " + id);
    $(this).closest("tr").toggleClass("table-primary");
    console.log($(this).closest("tr"));

    if ($.fn.DataTable.isDataTable("#statustable")) {
        // DataTable already initialized, destroy it first
        $("#statustable").DataTable().destroy();
    }

    $("#statustable").DataTable({
        order: [[1, "asc"]],
        processing: false,
        serverSide: false,
        paging: false, // Disable pagination
        searching: false, // Disable search
        ajax: {
            url: api_url, // Your server-side script to fetch data
            type: "POST",
            data: { operation: "009-new", id: id },
        },
        columns: [
            { data: "Name" },
            { data: "DOR" },
            { data: "Summary_Note" },
            { data: "Next_Call_Date" },
            {
                data: "Call_Recording",
                render: function (data, type, row) {
                    var duration = row.Duration_Of_Call;
                    if (!duration || duration == 0) {
                        // Return an error message if duration is 0 or empty
                        return "<div class='alert alert-danger' role='alert'>Audio not available </div>";
                    }

                    // Render a button to load the audio with duration as a custom attribute
                    return '<button class="load-audio-btn" data-audio-url="' + data + '" data-duration="' + duration + '">Load Audio</button>';
                },
            },
        ],
    });
    showMailOption(id);

    // Event handler for clicking the load audio button
    $("#statustable").on("click", ".load-audio-btn", function () {
        var audioUrl = $(this).data("audio-url");

        // Replace the button with the audio player
        var audioPlayer = '<audio controls autoplay><source src="' + audioUrl + '" type="audio/mpeg">Your browser does not support the audio element.</audio>';
        $(this).parent().html(audioPlayer);
    });
}

function showMailOption(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "024", id: id },
        success: function (response) {
            $(".loader").hide();
            if (response == 1) {
                document.getElementById("mailOption").innerHTML =
                    "<button class='btn btn-success' onclick='sendMail(" + id + ")'>Send Mail</button><p id='errorMail' style='text-align: right;color: crimson;'></p>";
            } else {
                document.getElementById("mailOption").innerHTML = "";
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

//Get Name And Type of User
function getUserDetails() {
    var mobile = localStorage.getItem("MobileNo");
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "011", mobile: mobile },
        success: function (response) {
            $(".loader").hide();
            data = response.split("<-->");
            localStorage.setItem("userID", data[0]);
            localStorage.setItem("userName", data[1]);
            localStorage.setItem("userType", data[2]);
            document.getElementById("mainUser").innerHTML = data[1];
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

//Leads to be contacted today
function allLeadsOnDate(date) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "014", date: date },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("<END>");
            var content =
                '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                if (part[8] == "New") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        '</td><td><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[2] +
                        "', " +
                        index +
                        ')">' +
                        part[2] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[3] +
                        "', " +
                        index +
                        ')">' +
                        part[3] +
                        "</a><br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        '<br><button style="display:none" id="save-id-' +
                        index +
                        '" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick=stopRecord("' +
                        part[0] +
                        '","' +
                        index +
                        '")>End Call</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:red;color:white">' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        part[0] +
                        ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatus(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else if (part[8] == "Converted") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        '</td><td><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[2] +
                        "', " +
                        index +
                        ')">' +
                        part[2] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[3] +
                        "', " +
                        index +
                        ')">' +
                        part[3] +
                        "</a><br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        '<br><button style="display:none" id="save-id-' +
                        index +
                        '" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick=stopRecord("' +
                        part[0] +
                        '","' +
                        index +
                        '")>End Call</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:green;color:white">' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        part[0] +
                        ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatus(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else if (part[8] == "Proposail Mailed") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        '</td><td><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[2] +
                        "', " +
                        index +
                        ')">' +
                        part[2] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[3] +
                        "', " +
                        index +
                        ')">' +
                        part[3] +
                        "</a><br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        '<br><button style="display:none" id="save-id-' +
                        index +
                        '" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick=stopRecord("' +
                        part[0] +
                        '","' +
                        index +
                        '")>End Call</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:yellow;color:black">' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        part[0] +
                        ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatus(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else if (part[8] == "Pending") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        '</td><td><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[2] +
                        "', " +
                        index +
                        ')">' +
                        part[2] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[3] +
                        "', " +
                        index +
                        ')">' +
                        part[3] +
                        "</a><br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        '<br><button style="display:none" id="save-id-' +
                        index +
                        '" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick=stopRecord("' +
                        part[0] +
                        '","' +
                        index +
                        '")>End Call</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:orange;color:white">' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        part[0] +
                        ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatus(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        '</td><td><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[2] +
                        "', " +
                        index +
                        ')">' +
                        part[2] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        part[1] +
                        "', '" +
                        part[0] +
                        "', '" +
                        part[3] +
                        "', " +
                        index +
                        ')">' +
                        part[3] +
                        "</a><br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        '<br><button style="display:none" id="save-id-' +
                        index +
                        '" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick=stopRecord("' +
                        part[0] +
                        '","' +
                        index +
                        '")>End Call</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        "</td><td>" +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        part[0] +
                        ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatus(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table></div>";
            document.getElementById("displayContent").innerHTML = "<h1>&#x2706; To be Contacted </h1><div style='overflow-x:scroll;'>" + content;
            $("#table1").DataTable({ order: [[0, "desc"]], stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

//Leads to be contacted today
function allLeadsOnDate1(fromdate, todate) {
    var content =
        '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Call Status</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML =
        "<h1>&#x2706; To be Contacted.... </h1><a href='https://teamka.in/crm1/APIs/export_daily_leads.php?startDate=" +
        fromdate +
        "&endDate=" +
        todate +
        "'>Export</a><div style='overflow-x:scroll;'>" +
        content;

    var table = $("#table1").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "014-new", fromdate: fromdate, todate: todate },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            { data: "1" },
            {
                data: null,
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return `
                              <a href="javascript:void(0)" onclick="makeCall('${row[1]}', '${row[0]}', '${row[2]}', '${index}')">${row[2]}</a><br>
                              <a href="javascript:void(0)" onclick="makeCall('${row[1]}', '${row[0]}', '${row[3]}', '${index}')">${row[3]}</a><br>
                              <a href="https://api.whatsapp.com/send?phone=91${row[4]}">${row[4]}</a><br>
                              ${row[5]}<br>
                              <button style="display:none" id="save-id-${index}" data-toggle="modal" data-target="#exampleModal4" data-whatever="${row[0]}" onclick="stopRecord('${row[0]}', '${index}')">End Call</button>
                                `;
                },
            },
            { data: "6" },
            { data: "7" },
            { data: "8" },
            { data: "9" },
            { data: "12" },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        row[0] +
                        ')">Edit</button><br><button data-toggle="modal" class="btn-status" data-target="#exampleModal4" data-whatever="' +
                        row[0] +
                        '" onclick="getAllStatus(' +
                        row[0] +
                        ')">Status</button>'
                    );
                },
            },
            { data: "10" },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(7)"); // Target the 6th TD within the row
            var $td2 = $(row).find("td:eq(5)");

            if (data[12] == "Done") {
                console.log("green");
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[12] == "Pending") {
                $td.css({ "background-color": "yellow", color: "black" });
            } else if (data[12] == "Missed") {
                $td.css({ "background-color": "red", color: "white" });
            }
            console.log(data[8]);
            if (data[8] == "New") {
                $td2.css({ "background-color": "red", color: "white" });
            } else if (data[8] == "Converted") {
                $td2.css({ "background-color": "green", color: "white" });
            } else if (data[8] == "Proposail Mailed") {
                $td2.css({ "background-color": "yellow", color: "black" });
            } else if (data[8] == "Pending") {
                $td2.css({ "background-color": "orange", color: "white" });
            }

            const statusButton = $(row).find(".btn-status");
            statusButton.on("click", function () {
                // Remove "highlighted" class from all table rows (optional)
                $("table#table1 tr").removeClass("table-primary");

                // Get the table row (TR) of the clicked button
                var tr = $(this).closest("tr");

                // Add "highlighted" class to the clicked row
                tr.addClass("table-primary");
            });
        },
    });
}

function allLeadsOnDateTL(fromdate, todate) {
    var content =
        '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Call Status</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML =
        "<h1>&#x2706; To be Contacted.... </h1><a href='https://teamka.in/crm1/APIs/export_daily_leads.php?startDate=" +
        fromdate +
        "&endDate=" +
        todate +
        "'>Export</a><div style='overflow-x:scroll;'>" +
        content;

    var table = $("#table1").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: {
                operation: "014-tl",
                fromdate: fromdate,
                todate: todate,
                caller_id: localStorage.getItem("userID"),
            },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            { data: "1" },
            {
                data: null,
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return `
                              <a href="javascript:void(0)" onclick="makeCall('${row[1]}', '${row[0]}', '${row[2]}', '${index}')">${row[2]}</a><br>
                              <a href="javascript:void(0)" onclick="makeCall('${row[1]}', '${row[0]}', '${row[3]}', '${index}')">${row[3]}</a><br>
                              <a href="https://api.whatsapp.com/send?phone=91${row[4]}">${row[4]}</a><br>
                              ${row[5]}<br>
                              <button style="display:none" id="save-id-${index}" data-toggle="modal" data-target="#exampleModal4" data-whatever="${row[0]}" onclick="stopRecord('${row[0]}', '${index}')">End Call</button>
                                `;
                },
            },
            { data: "6" },
            { data: "7" },
            { data: "8" },
            { data: "9" },
            { data: "12" },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        row[0] +
                        ')">Edit</button><br><button data-toggle="modal" class="btn-status" data-target="#exampleModal4" data-whatever="' +
                        row[0] +
                        '" onclick="getAllStatus(' +
                        row[0] +
                        ')">Status</button>'
                    );
                },
            },
            { data: "10" },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(7)"); // Target the 6th TD within the row
            var $td2 = $(row).find("td:eq(5)");

            if (data[12] == "Done") {
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[12] == "Pending") {
                $td.css({ "background-color": "yellow", color: "black" });
            } else if (data[12] == "Missed") {
                $td.css({ "background-color": "red", color: "white" });
            }

            if (data[8] == "New") {
                $td2.css({ "background-color": "red", color: "white" });
            } else if (data[8] == "Converted") {
                $td2.css({ "background-color": "green", color: "white" });
            } else if (data[8] == "Proposail Mailed") {
                $td2.css({ "background-color": "yellow", color: "black" });
            } else if (data[8] == "Pending") {
                $td2.css({ "background-color": "orange", color: "white" });
            }

            const statusButton = $(row).find(".btn-status");
            statusButton.on("click", function () {
                // Remove "highlighted" class from all table rows (optional)
                $("table#table1 tr").removeClass("table-primary");

                // Get the table row (TR) of the clicked button
                var tr = $(this).closest("tr");

                // Add "highlighted" class to the clicked row
                tr.addClass("table-primary");
            });
        },
    });
}

function allLeadsOnDate2(fromdate, todate) {
    var content =
        '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Call Status</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML =
        "<h1>&#x2706; To be Contacted.... </h1><a href='https://teamka.in/crm1/APIs/export_daily_leads.php?startDate=" +
        fromdate +
        "&endDate=" +
        todate +
        "'>Export</a><div style='overflow-x:scroll;'>" +
        content;

    var table = $("#table1").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: {
                operation: "014-caller",
                fromdate: fromdate,
                todate: todate,
                caller_id: localStorage.getItem("userID"),
            },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            { data: "1" },
            {
                data: null,
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return `
                              <a href="javascript:void(0)" onclick="makeCall('${row[1]}', '${row[0]}', '${row[2]}', '${index}')">${row[2]}</a><br>
                              <a href="javascript:void(0)" onclick="makeCall('${row[1]}', '${row[0]}', '${row[3]}', '${index}')">${row[3]}</a><br>
                              <a href="https://api.whatsapp.com/send?phone=91${row[4]}">${row[4]}</a><br>
                              ${row[5]}<br>
                              <button style="display:none" id="save-id-${index}" data-toggle="modal" data-target="#exampleModal4" data-whatever="${row[0]}" onclick="stopRecord('${row[0]}', '${index}')">End Call</button>
                                `;
                },
            },
            { data: "6" },
            { data: "7" },
            { data: "8" },
            { data: "9" },
            { data: "12" },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        row[0] +
                        ')">Edit</button><br><button data-toggle="modal" class="btn-status" data-target="#exampleModal4" data-whatever="' +
                        row[0] +
                        '" onclick="getAllStatus(' +
                        row[0] +
                        ')">Status</button>'
                    );
                },
            },
            { data: "10" },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(7)"); // Target the 6th TD within the row
            var $td2 = $(row).find("td:eq(5)");

            if (data[12] == "Done") {
                console.log("green");
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[12] == "Pending") {
                $td.css({ "background-color": "yellow", color: "black" });
            } else if (data[12] == "Missed") {
                $td.css({ "background-color": "red", color: "white" });
            }
            console.log(data[8]);
            if (data[8] == "New") {
                $td2.css({ "background-color": "red", color: "white" });
            } else if (data[8] == "Converted") {
                $td2.css({ "background-color": "green", color: "white" });
            } else if (data[8] == "Proposail Mailed") {
                $td2.css({ "background-color": "yellow", color: "black" });
            } else if (data[8] == "Pending") {
                $td2.css({ "background-color": "orange", color: "white" });
            }

            const statusButton = $(row).find(".btn-status");
            statusButton.on("click", function () {
                // Remove "highlighted" class from all table rows (optional)
                $("table#table1 tr").removeClass("table-primary");

                // Get the table row (TR) of the clicked button
                var tr = $(this).closest("tr");

                // Add "highlighted" class to the clicked row
                tr.addClass("table-primary");
            });
        },
    });
}

// Statistics
function statistics() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "015" },
        success: function (response) {
            $(".loader").hide();
            // alert(response);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Get Date
function getDate() {
    var date = document.getElementById("contactDate").value;
    if (date == "") {
        document.getElementById("errorDetailsDate").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsDate").innerHTML = "";
        document.getElementById("contactDate").value = "";
        $(".close").click();
        allLeadsOnDate(date);
    }
}
function dateChange() {
    console.log("dateChange");
    var fromdate = document.getElementById("contactDate1").value;
    var todate = document.getElementById("contactDate2").value;
    if (fromdate != "") {
        //document.getElementById("contactDate2").minDate(date);
        document.getElementById("contactDate2").setAttribute("min", fromdate);
        if (todate != "") {
            fromdateFormatArray = fromdate.split("/");
            todateFormatArray = todate.split("/");
            console.log(fromdateFormatArray);
            console.log(todateFormatArray);
            var x = new Date(fromdateFormatArray[2] + "-" + fromdateFormatArray[1] + "-" + fromdateFormatArray[0]);
            var y = new Date(todateFormatArray[2] + "-" + todateFormatArray[1] + "-" + todateFormatArray[0]);
            console.log(x > y);
            if (x > y) {
                document.getElementById("contactDate2").value = "";
            }
        }
    } else {
        document.getElementById("contactDate2").removeAttribute("min");
    }
}
// Get Date
function getDate1() {
    // alert("test")
    var fromdate = document.getElementById("contactDate1").value;
    var todate = document.getElementById("contactDate2").value;
    if (fromdate == "" || todate == "") {
        document.getElementById("errorDetailsDate1").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsDate1").innerHTML = "";
        document.getElementById("contactDate1").value = "";
        document.getElementById("contactDate2").value = "";
        $(".close").click();
        allLeadsOnDate1(fromdate, todate);
    }
}

function getDateTL() {
    // alert("test")
    var fromdate = document.getElementById("contactDate1").value;
    var todate = document.getElementById("contactDate2").value;
    if (fromdate == "" || todate == "") {
        document.getElementById("errorDetailsDate1").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsDate1").innerHTML = "";
        document.getElementById("contactDate1").value = "";
        document.getElementById("contactDate2").value = "";
        $(".close").click();
        allLeadsOnDateTL(fromdate, todate);
    }
}

// Get Date
function getDate2() {
    // alert("test")
    var fromdate = document.getElementById("contactDate1").value;
    var todate = document.getElementById("contactDate2").value;
    if (fromdate == "" || todate == "") {
        document.getElementById("errorDetailsDate1").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsDate1").innerHTML = "";
        document.getElementById("contactDate1").value = "";
        document.getElementById("contactDate2").value = "";
        $(".close").click();
        allLeadsOnDate2(fromdate, todate);
    }
}

//////Functions for the Caller Page

function testmyLeads() {
    var content =
        '<div class="d-flex justify-content-center"><div class="btn-item" onclick="loadtable()">All Leads</div><div class="btn-item" id="new">NEW </div><div class="btn-item" id="demo">Demo done </div><div class="btn-item" id="mail">Proposail Mailed </div><div class="btn-item" id="converted">Converted </div><div class="btn-item" id="pending">Pending </div><div class="btn-item" id="followup">Followup </div><div class="btn-item" id="dead">DEAD </div><div class="btn-item " id="reregistered">Reregistered <span id="noti1">0</span></div><div class="btn-item" id="transferred">Transferred <span id="noti3">0</span></div><div class="btn-item " id="assigned">Assigned</div><div class="btn-item" id="monster">Marked Monster </div></div><table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Summary DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>" + content;

    var option = "default";

    getrecount();
    getuncount();
    gettrcount();

    var me = localStorage.getItem("userID");

    function loadtabletl() {
        if ($.fn.DataTable.isDataTable("#table1")) {
            // If DataTable is already initialized, destroy it
            $("#table1").DataTable().destroy();
        }

        var table = $("#table1").DataTable({
            order: [],
            processing: false,
            paging: true,
            pagingType: "full_numbers",
            serverSide: true,
            ajax: {
                url: api_url,
                method: "POST",
                data: { operation: "0042", me: me, option: option },
                beforeSend: function () {
                    $(".loader").show();
                },
                complete: function () {
                    $(".loader").hide();
                },
            },
            columnDefs: [
                {
                    targets: 0,
                    render: function (data, type, row, meta) {
                        return row[0];
                    },
                },
                {
                    targets: 1,
                    render: function (data, type, row, meta) {
                        return row[1];
                    },
                },
                {
                    targets: 2,
                    render: function (data, type, part, meta) {
                        // console.log(meta)
                        if (type === "display") {
                            var index = meta.row;
                            data = `
                        <a href="javascript:void(0)" onclick="makeCall('${part[1]}', '${part[0]}', '${part[2]}', ${index})">${part[2]}</a><br>
                        <a href="javascript:void(0)" onclick="makeCall('${part[1]}', '${part[0]}','${part[3]}', ${index})">${part[3]}</a><br>
                        <a href="https://api.whatsapp.com/send?phone=91${part[4]}">${part[4]}</a><br>
                        ${part[5]}<br>
                        <button style="display: none;" data-toggle="modal" data-target="#exampleModal4" data-whatever="${part[0]}" id="save-id-${index}" onclick="stopRecord('${part[0]}', ${index})">End Call</button>
                      `;
                        }
                        return data;
                    },
                },
                {
                    targets: 3,
                    render: function (data, type, row, meta) {
                        if (type === "display") {
                            data = row[11] + "<br/>" + row[12];
                        }
                        return data;
                    },
                },
                {
                    targets: 4,
                    render: function (data, type, row, meta) {
                        return row[6];
                    },
                },
                {
                    targets: 5,
                    render: function (data, type, row, meta) {
                        return row[7];
                    },
                },
                {
                    targets: 6,
                    render: function (data, type, row, meta) {
                        return row[8];
                    },
                },
                {
                    targets: 7,
                    render: function (data, type, row, meta) {
                        return row[9];
                    },
                },
                {
                    targets: 8,
                    render: function (data, type, row, meta) {
                        return row[14];
                    },
                },
                {
                    targets: 9,
                    render: function (data, type, part, meta) {
                        if (type === "display") {
                            var index = meta.row;
                            data =
                                '<button data-toggle="modal" class="btn-edit" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                                part[0] +
                                ')">Edit</button><br><button class="btn-status" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                                part[0] +
                                '" onclick="getAllStatus(' +
                                part[0] +
                                ')">Status</button>';
                        }
                        return data;
                    },
                },
                {
                    targets: 10,
                    render: function (data, type, row, meta) {
                        return row[10];
                    },
                },
            ],
            createdRow: function (row, data, index) {
                if (data[8] == "New") {
                    $("td:eq(6)", row).css({ "background-color": "red", color: "white" });
                } else if (data[8] == "Converted") {
                    $("td:eq(6)", row).css({
                        "background-color": "green",
                        color: "white",
                    });
                } else if (data[8] == "Proposail Mailed") {
                    $("td:eq(6)", row).css({
                        "background-color": "yellow",
                        color: "black",
                    });
                } else if (data[8] == "Pending") {
                    $("td:eq(6)", row).css({
                        "background-color": "orange",
                        color: "white",
                    });
                } else {
                    //$('td:eq(6)', row).css({'background-color': 'red','color':'white'});
                }

                const statusButton = $(row).find(".btn-status");
                const editButton = $(row).find(".btn-edit");

                // Function to highlight the clicked row
                function highlightRow(tr) {
                    // Remove "highlighted" class from all table rows (optional)
                    $("table#table1 tr").removeClass("table-primary");

                    // Add "highlighted" class to the clicked row
                    tr.addClass("table-primary");
                }

                // Click event for status button
                statusButton.on("click", function () {
                    // Get the table row (TR) of the clicked button
                    var tr = $(this).closest("tr");
                    highlightRow(tr);
                });

                // Click event for edit button
                editButton.on("click", function () {
                    // Get the table row (TR) of the clicked button
                    var tr = $(this).closest("tr");
                    highlightRow(tr);
                });
            },
        });
    }

    loadtabletl();

    $(".btn-item").each(function () {
        // Attach click event listener
        $(this).on("click", function () {
            // Get the id of the clicked button
            $(".btn-item").removeClass("active");

            // Add 'bhj' class to the clicked button
            $(this).addClass("active");
            var id = $(this).attr("id");

            // Assign option based on the id of the clicked button
            switch (id) {
                case "demo":
                    option = "demo";
                    break;
                case "reregistered":
                    option = "registered";
                    break;
                case "mail":
                    option = "mailed";
                    break;
                case "converted":
                    option = "converted";
                    break;
                case "assigned":
                    option = "assigned";
                    break;
                case "pending":
                    option = "pending";
                    break;
                case "followup":
                    option = "followup";
                    break;
                case "dead":
                    option = "dead";
                    break;
                case "transferred":
                    option = "transferred";
                    break;
                case "unassigned":
                    option = "unassigned";
                    break;
                case "new":
                    option = "new";
                    break;
                case "monster":
                    option = "monster";
                    break;
                default:
                    // Default option if id doesn't match any specific case
                    option = "";
                    break;
            }

            // Call loadtable() function with the updated option
            loadtabletl();
        });
    });
}

function leadsTL() {
    var content =
        '<div class="d-flex justify-content-center"><div class="btn-item" onclick="loadtable()">All Leads</div><div class="btn-item" id="new">NEW </div><div class="btn-item" id="demo">Demo done </div><div class="btn-item" id="mail">Proposail Mailed </div><div class="btn-item" id="unassigned">Unassigned <span id="noti2">0</span> </div><div class="btn-item" id="converted">Converted </div><div class="btn-item" id="pending">Pending </div><div class="btn-item" id="followup">Followup </div><div class="btn-item" id="dead">DEAD </div><div class="btn-item " id="reregistered">Reregistered <span id="noti1">0</span></div><div class="btn-item" id="transferred">Transferred <span id="noti3">0</span></div><div class="btn-item" id="monster">Marked Monster </div></div><table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Summary DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>" + content;

    var option = "default";

    getrecount();
    getuncount();
    gettrcount();

    var me = localStorage.getItem("userID");

    function loadtabletl() {
        if ($.fn.DataTable.isDataTable("#table1")) {
            // If DataTable is already initialized, destroy it
            $("#table1").DataTable().destroy();
        }

        var table = $("#table1").DataTable({
            order: [],
            processing: false,
            paging: true,
            pagingType: "full_numbers",
            serverSide: true,
            ajax: {
                url: api_url,
                method: "POST",
                data: { operation: "0042-2", me: me, option: option },
                beforeSend: function () {
                    $(".loader").show();
                },
                complete: function () {
                    $(".loader").hide();
                },
            },
            columnDefs: [
                {
                    targets: 0,
                    render: function (data, type, row, meta) {
                        return row[0];
                    },
                },
                {
                    targets: 1,
                    render: function (data, type, row, meta) {
                        return row[1];
                    },
                },
                {
                    targets: 2,
                    render: function (data, type, part, meta) {
                        if (type === "display") {
                            var index = meta.row;

                            // Correct syntax using template literals
                            data = `<div id="hideShow${part[0]}">
                                        <button onclick="NewShowprsnlDetails('${part[1]}', '${part[0]}', '${part[2]}', '${part[5]}', '${part[4]}', ${index}, '${part[3]}')">
                                            ***See Contact Details***
                                        </button>
                                    </div>`;
                        }
                        return data;
                    },
                },

                {
                    targets: 3,
                    render: function (data, type, row, meta) {
                        if (type === "display") {
                            data = row[11] + "<br/>" + row[12];
                        }
                        return data;
                    },
                },
                {
                    targets: 4,
                    render: function (data, type, row, meta) {
                        return row[6];
                    },
                },
                {
                    targets: 5,
                    render: function (data, type, row, meta) {
                        return row[7];
                    },
                },
                {
                    targets: 6,
                    render: function (data, type, row, meta) {
                        return row[8];
                    },
                },
                {
                    targets: 7,
                    render: function (data, type, row, meta) {
                        return row[9];
                    },
                },
                {
                    targets: 8,
                    render: function (data, type, row, meta) {
                        return row[14];
                    },
                },
                {
                    targets: 9,
                    render: function (data, type, part, meta) {
                        if (type === "display") {
                            var index = meta.row;
                            data =
                                '<button data-toggle="modal" class="btn-edit" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                                part[0] +
                                ')">Edit</button><br><button class="btn-status" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                                part[0] +
                                '" onclick="getAllStatus(' +
                                part[0] +
                                ')">Status</button>';
                        }
                        return data;
                    },
                },
                {
                    targets: 10,
                    render: function (data, type, row, meta) {
                        return row[10];
                    },
                },
            ],
            createdRow: function (row, data, index) {
                if (data[8] == "New") {
                    $("td:eq(6)", row).css({ "background-color": "red", color: "white" });
                } else if (data[8] == "Converted") {
                    $("td:eq(6)", row).css({
                        "background-color": "green",
                        color: "white",
                    });
                } else if (data[8] == "Proposail Mailed") {
                    $("td:eq(6)", row).css({
                        "background-color": "yellow",
                        color: "black",
                    });
                } else if (data[8] == "Pending") {
                    $("td:eq(6)", row).css({
                        "background-color": "orange",
                        color: "white",
                    });
                } else {
                    //$('td:eq(6)', row).css({'background-color': 'red','color':'white'});
                }

                const statusButton = $(row).find(".btn-status");
                const editButton = $(row).find(".btn-edit");

                // Function to highlight the clicked row
                function highlightRow(tr) {
                    // Remove "highlighted" class from all table rows (optional)
                    $("table#table1 tr").removeClass("table-primary");

                    // Add "highlighted" class to the clicked row
                    tr.addClass("table-primary");
                }

                // Click event for status button
                statusButton.on("click", function () {
                    // Get the table row (TR) of the clicked button
                    var tr = $(this).closest("tr");
                    highlightRow(tr);
                });

                // Click event for edit button
                editButton.on("click", function () {
                    // Get the table row (TR) of the clicked button
                    var tr = $(this).closest("tr");
                    highlightRow(tr);
                });
            },
        });
    }

    loadtabletl();

    $(".btn-item").each(function () {
        // Attach click event listener
        $(this).on("click", function () {
            // Get the id of the clicked button
            $(".btn-item").removeClass("active");

            // Add 'bhj' class to the clicked button
            $(this).addClass("active");
            var id = $(this).attr("id");

            // Assign option based on the id of the clicked button
            switch (id) {
                case "demo":
                    option = "demo";
                    break;
                case "reregistered":
                    option = "registered";
                    break;
                case "mail":
                    option = "mailed";
                    break;
                case "converted":
                    option = "converted";
                    break;
                case "pending":
                    option = "pending";
                    break;
                case "followup":
                    option = "followup";
                    break;
                case "dead":
                    option = "dead";
                    break;
                case "unassigned":
                    option = "unassigned";
                    break;
                case "transferred":
                    option = "transferred";
                    break;
                case "new":
                    option = "new";
                    break;
                case "monster":
                    option = "monster";
                    break;
                default:
                    // Default option if id doesn't match any specific case
                    option = "";
                    break;
            }

            // Call loadtable() function with the updated option
            loadtabletl();
        });
    });
}

// Show My Leads
function myLeads() {
    testmyLeads();
    /*
          $('.loader').show();

        $.ajax({
            url : api_url,
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
                         content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br><a href="https://api.whatsapp.com/send?phone=91'+part[4]+'">'+part[4]+'</a><br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;" >'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                        }else if(part[8]=="Converted"){
                         content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:green;color:white;">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                        }else if(part[8]=="Proposail Mailed"){
                         content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:yellow;color:black;">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                        }else if(part[8]=="Pending"){
                         content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:orange;color:white;">'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                        }else{
                         content+= '<tr><th scope="row">'+part[0]+'</th><td>'+part[1]+'</td><td><a href="javascript:void(0)" onclick=makeCall("'+part[2]+'","'+index+'")>'+part[2]+'</a><br><a href="javascript:void(0)" onclick=makeCall("'+part[3]+'","'+index+'")>'+part[3]+'</a><br>'+part[4]+'<br>'+part[5]+'<br><button style="display:none" id="save-id-'+index+'" data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick=stopRecord("'+part[0]+'","'+index+'")>End Call</button></td><td>'+part[11]+'<br>'+part[12]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+part[9]+'</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm('+part[0]+')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="'+part[0]+'" onclick="getAllStatus('+part[0]+')">Status</button></td><td>'+part[10]+'</td></tr>';
                        }
                    }
                }
                content += '</tbody></table></div>';
                document.getElementById("displayContent").innerHTML = "<h1>My Leads</h1><div style='overflow-x:scroll;'>"+content;
                $("#table1").DataTable( {   "order": [[ 0, "desc" ]] ,stateSave: true  });
            }, error: function (jqXHR, exception) { var msg=displayerror(jqXHR, exception); alert(msg); },

        });
        */
}

// Add Leads as Caller
function addLeadAsCaller() {
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

    if (name == "" || mobile == "") {
        document.getElementById("errorDetails").innerHTML = "Fill the Form Correctly";
    } else if (!/^\d{1,10}$/.test(mobile)) {
        document.getElementById("errorDetails").innerHTML = "Mobile should be 10 digits whithout +91 or 0";
    } else if (alternate_mobile !== "" && !/^\d{1,10}$/.test(alternate_mobile)) {
        document.getElementById("errorDetails").innerHTML = "Alternate Mobile should be 10 digits whithout +91 or 0";
    } else if (whatsapp !== "" && !/^\d{1,10}$/.test(whatsapp)) {
        document.getElementById("errorDetails").innerHTML = "WhatsApp should be 10 digits whithout +91 or 0";
    } else if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("errorDetails").innerHTML = "Invalid email format";
    } else {
        document.getElementById("errorDetails").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "003",
                name: name,
                mobile: mobile,
                alternate_mobile: alternate_mobile,
                whatsapp: whatsapp,
                email: email,
                interested_in: interested_in,
                source: source,
                status: status,
                caller_id: caller_id,
                caller: caller,
                state: state,
                city: city,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Lead Entered");
                    if (localStorage.getItem("userType") == "Caller") {
                        window.location.href = "./callerDashboardNEW.html";
                    } else if (localStorage.getItem("userType") == "Developer") {
                        window.location.href = "./developerDashboardNEW.html";
                    }
                    $(".close").click();
                } else if (response == 2) {
                    document.getElementById("errorDetails").innerHTML = "Lead already exist";
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

// Update Lead
function updateLeadsAsCaller() {
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

    if (name == "" || mobile == "") {
        document.getElementById("errorDetails").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetails").innerHTML = "";
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "007",
                id: id,
                name: name,
                mobile: mobile,
                alternate_mobile: alternate_mobile,
                whatsapp: whatsapp,
                email: email,
                interested_in: interested_in,
                source: source,
                status: status,
                caller_id: caller_id,
                caller: caller,
                state: state,
                city: city,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    localStorage.removeItem("lead_id");
                    $(".close").click();
                    if (localStorage.getItem("userType") == "Admin") {
                        // testallLeads();
                    } else if (localStorage.getItem("userType") == "Caller") {
                        // testmyLeads();
                    } else if (localStorage.getItem("userType") == "Developer") {
                        // testmyLeads();
                    }
                } else if (response == 2) {
                    document.getElementById("editErrorDetails").innerHTML = "Lead already exist";
                } else {
                    localStorage.removeItem("lead_id");
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

// Show All Leads for Callers
/*
    function allLeadsCallers(){
          $('.loader').show();
        $.ajax({
            url : api_url,
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
            }, error: function (jqXHR, exception) { var msg=displayerror(jqXHR, exception); alert(msg); },

        });
    }
    */
// Show My Leads
function allLeadsOnDateCaller(date) {
    $(".loader").show();

    $.ajax({
        url: api_url,
        data: { operation: "014", date: date },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("<END>");
            var content =
                '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                if (parseInt(localStorage.getItem("userID")) == parseInt(part[11])) {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        '</td><td><a href="javascript:void(0)" onclick=makeCall("' +
                        part[1] +
                        '","' +
                        part[0] +
                        '","' +
                        part[2] +
                        '","' +
                        index +
                        '")>' +
                        part[2] +
                        '</a><br><a href="javascript:void(0)" onclick=makeCall("' +
                        part[1] +
                        '","' +
                        part[0] +
                        '","' +
                        part[3] +
                        '","' +
                        index +
                        '")>' +
                        part[3] +
                        "</a><br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        '<br><button style="display:none" id="save-id-' +
                        index +
                        '" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick=stopRecord("' +
                        part[0] +
                        '","' +
                        index +
                        '")>End Call</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        "</td><td>" +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' +
                        part[0] +
                        ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatus(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table></div>";
            document.getElementById("displayContent").innerHTML = "<h1>&#x2706; To be Contacted </h1><div style='overflow-x:scroll;'>" + content;
            $("#table1").DataTable({ order: [[0, "desc"]], stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Get Date for Caller
function getDateCaller() {
    var date = document.getElementById("contactDate").value;
    if (date == "") {
        document.getElementById("errorDetailsDate").innerHTML = "Fill the Form Correctly";
    } else {
        document.getElementById("errorDetailsDate").innerHTML = "";
        document.getElementById("contactDate").value = "";
        $(".close").click();
        allLeadsOnDateCaller(date);
    }
}

// New Part

function fillProjectDetailsForm() {
    $(".loader").show();

    $.ajax({
        url: api_url,
        data: { operation: "016" },
        success: function (response) {
            $(".loader").hide();

            var partialData = response.split("/END/");
            var content = "<option></option>";
            for (let i = 0; i < partialData.length - 1; i++) {
                var element = partialData[i];
                var data = element.split("<-->");
                content += "<option value='" + parseInt(data[0]) + "' id='option" + parseInt(data[0]) + "'>" + data[1] + "</option>";
            }
            if (localStorage.getItem("userType") == "Admin") {
                document.getElementById("leadsA").innerHTML = content;
            }
            document.getElementById("leadsA").innerHTML = content;
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function fillProjectDetailsFormCaller() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "016" },
        success: function (response) {
            // alert(response);
            $(".loader").hide();

            var partialData = response.split("/END/");
            var content = "<option></option>";
            for (let i = 0; i < partialData.length - 1; i++) {
                var element = partialData[i];
                var data = element.split("<-->");
                if (parseInt(data[2]) == localStorage.getItem("userID")) {
                    content += "<option value='" + parseInt(data[0]) + "' id='option" + parseInt(data[0]) + "'>" + data[1] + "</option>";
                }
            }
            //console.log(content);
            document.getElementById("leadsA").innerHTML = content;
            document.getElementById("edit_leadsA").innerHTML = content;
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getDevelopers() {
    if (localStorage.getItem("userType") == "Admin") {
        document.getElementById("developerA").innerHTML = "";
    }
    if (localStorage.getItem("userType") != "Developer") {
        document.getElementById("edit_developerA").innerHTML = "";
    }
    var content = "";
    $(".loader").show();

    $.ajax({
        url: api_url,
        data: { operation: "018" },
        success: function (response) {
            $(".loader").hide();
            var partialData = response.split("/END/");
            for (let i = 0; i < partialData.length - 1; i++) {
                var element = partialData[i];
                var data = element.split("<-->");
                content += "<option value='" + parseInt(data[0]) + "'>" + data[1] + "</option>";
            }
            // console.log(content);

            document.getElementById("developerA").innerHTML = content;
            if (localStorage.getItem("userType") != "Developer") {
                document.getElementById("edit_developerA").innerHTML = content;
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Set Details To Add Project Details Form
function setDetails() {
    var id = document.getElementById("leadsA").value;
    if (id == "") {
        id = document.getElementById("edit_leadsA").value;
    }
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "017", id: id },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            document.getElementById("callerA").innerHTML = "<option value='" + parseInt(data[3]) + "' selected>" + data[0] + "</option>";
            document.getElementById("edit_callerA").innerHTML = "<option value='" + parseInt(data[3]) + "' selected>" + data[0] + "</option>";
            document.getElementById("projectTypeA").value = data[1];
            document.getElementById("edit_projectTypeA").value = data[1];
            document.getElementById("cityA").value = data[2];
            document.getElementById("edit_cityA").value = data[2];
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Add Project Details
function addProjectDetails() {
    var lead = document.getElementById("leadsA").value;
    var caller = document.getElementById("callerA").value;
    var developer = document.getElementById("developerA").value;
    var projectName = document.getElementById("projectNameA").value;
    var projectType = document.getElementById("projectTypeA").value;
    var city = document.getElementById("cityA").value;
    var address = document.getElementById("addressA").value;
    var pincode = document.getElementById("PINCODE").value;
    var remarks = document.getElementById("remarksA").value;

    if (lead == "" || caller == "" || developer == "" || projectName == "" || projectType == "" || address == "" || pincode == "") {
        document.getElementById("errorDetailsAddProject").innerHTML = "Fill the Form Correctly";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "019",
                lead: lead,
                caller: caller,
                developer: developer,
                projectName: projectName,
                projectType: projectType,
                address: address,
                pincode: pincode,
                city: city,
                remarks: remarks,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    addNewProjMail(lead);
                    alert("Project Details Entered");
                    if (localStorage.getItem("userType") == "Admin") window.location.href = "./dashboardNEW.html";
                    else if (localStorage.getItem("userType") == "Caller") window.location.href = "./callerDashboardNEW.html";
                    else if (localStorage.getItem("userType") == "Developer") window.location.href = "./developerDashboardNEW.html";
                } else if (response == 3) {
                    document.getElementById("errorDetailsAddProject").innerHTML = "Project Details Already Filled";
                } else {
                    alert(response);
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function countNotRenewed(name) {
    var count = 0; // Initialize count variable

    $.ajax({
        url: api_url,
        data: { operation: "countNotRenewed", type: name },
        success: function (response) {
            count = parseInt(response);
            console.log(name);
            $("#noti2").html(count);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

function countNotLive(name) {
    var count = 0; // Initialize count variable

    $.ajax({
        url: api_url,
        data: { operation: "countNotLive", type: name },
        success: function (response) {
            count = parseInt(response);
            console.log(name);
            $("#noti1").html(count);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
}

function fetchCustomerIds(selectedValue) {
    // Make an AJAX call to your order API
    $.ajax({
        url: "https://pos.kalamitcompany.com/api/pos_stat_api.php",
        data: { type: 1 }, // Adjust data as needed for your API
        method: "GET",
        success: function (response) {
            var customerIds = filterCustomerIds(response, selectedValue);

            sendCustomerIdsToServer(customerIds);
        },
        error: function (err) {
            console.error("Failed to fetch order data:", err);
        },
    });
}

function filterCustomerIds(orderData, selectedValue) {
    var filteredCustomerIds = orderData
        .filter(function (order) {
            // Filter orders where order_count is less than or equal to selectedValue
            return order.order_count <= selectedValue;
        })
        .map(function (order) {
            // Parse customer_id as integer, if valid
            var customerId = parseInt(order.customer_id, 10);
            return !isNaN(customerId) ? customerId : null; // Return null for non-integer values
        })
        .filter(function (customerId) {
            // Filter out null values (non-integer customer IDs)
            return customerId !== null;
        });

    var customerIdsString = filteredCustomerIds.join(",");
    console.log(customerIdsString);
    return customerIdsString;
}

function sendCustomerIdsToServer(customerIds) {
    if ($.fn.DataTable.isDataTable("#tableProjects")) {
        // If DataTable is already initialized, destroy it
        $("#tableProjects").DataTable().destroy();
    }
    var orderData = [];

    $.ajax({
        url: "https://pos.kalamitcompany.com/api/pos_stat_api.php", // Replace with your actual API URL
        data: { type: 1 },
        method: "GET",
        success: function (response) {
            orderData = response; // Assuming response is already parsed to JSON
            console.log(orderData);
        },
        error: function (err) {
            console.error("Failed to fetch order data:", err);
        },
    });

    var table = $("#tableProjects").DataTable({
        order: [[1, "desc"]], // Default sorting by the first column in descending order
        paging: true,
        pagingType: "full_numbers",
        processing: true, // Show processing indicator during data load
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "020-order", id: customerIds },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            {
                data: null,
                defaultContent: "0", // Initial value set to '0'
                render: function (data, type, row) {
                    var customerId = row[0]; // Assuming data[0] is the customer ID
                    var matchingOrder = orderData.find(function (order) {
                        return order.customer_id === customerId;
                    });
                    var orderCount = matchingOrder ? matchingOrder.order_count : 0;

                    return orderCount;
                },
            },
            {
                data: "1",
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return (
                        row[1] +
                        "<br>" +
                        row[16] +
                        '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[0] +
                        "', '" +
                        row[15] +
                        "', " +
                        index +
                        ')">' +
                        row[15] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[0] +
                        "', '" +
                        row[18] +
                        "', " +
                        index +
                        ')">' +
                        row[18] +
                        '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                        row[19] +
                        '">' +
                        row[19] +
                        '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        row[0] +
                        '" id="save-id-' +
                        index +
                        '" onclick=stopRecord("' +
                        row[0] +
                        '","' +
                        index +
                        '")>End Call</button>'
                    );
                },
            },
            { data: "2" },
            { data: "4" },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        row[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjForTask(' +
                        row[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(' +
                        row[0] +
                        ')">View Task</button>'
                    );
                },
            },
            {
                data: "6", // Project_Type
                render: function (data, type, row) {
                    return row[6];
                },
            },
            {
                data: "14",
            },
            { data: "10" },
            {
                data: "13",
                render: function (data, type, row) {
                    return (
                        row[13] + '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' + row[0] + ')">Full Status</button>'
                    );
                },
            },
            {
                data: "20",
            },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                        row[0] +
                        ')">Edit</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBillingSupport(' +
                        row[0] +
                        ')">Billing</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        row[0] +
                        ')">Details</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                        row[17] +
                        ')" data-whatever="' +
                        row[17] +
                        '">Status</button>'
                    );
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(7)"); // Target the 6th TD within the row
            if (data[14] == "No dues") {
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[14] == "No payment details") {
                $td.css({ "background-color": "red", color: "white" });
            }

            const statusButton = $(row).find("button");
            statusButton.on("click", function () {
                // Remove "highlighted" class from all table rows (optional)
                $("table#tableProjects tr").removeClass("table-primary");

                // Get the table row (TR) of the clicked button
                var tr = $(this).closest("tr");

                // Add "highlighted" class to the clicked row
                tr.addClass("table-primary");
            });
        },
    });
}
function getProjectDetailsSupportNew() {
    var content = `
          <div class="d-flex justify-content-center">


              <div class="btn-item" id="notlive">Not Live <span id="noti1">0</span></div>
              <div class="btn-item" id="final">Finalised By Client</div>
              <div class="btn-item" id="in">In Development</div>
              <div class="btn-item" id="send">Send For Testing</div>
              <div class="btn-item" id="upload">Uploaded To Playstore</div>
              <div class="btn-item" id="live">Live on Playstore</div>
              <div class="btn-item" id="suspended">Suspended</div>
              <div class="btn-item" id="not">Not Renewed <span id="noti2">0</span></div>
          </div>
          <table id="tableProjects" class="table table-bordered table-striped">
              <thead>
                  <tr>
                      <th>Project ID</th>
                      <th>Orders</th>
                      <th>Lead Name</th>
                      <th>Caller</th>
                      <th>Developer</th>
                      <th>Project Name</th>
                      <th>Project Type</th>
                      <th>Dues</th>
                      <th>DOR</th>
                      <th>Status</th>
                      <th>Time To Live</th>
                      <th>OPTION</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>
      `;

    document.getElementById("displayContent").innerHTML = `<h1>Project Details</h1> <div class="d-flex column-gap-3 justify-content-center" > <select id="projectTypeFilter">
                      <option value="">Select Project Type</option>
                      <option value="Grocery App">Grocery App</option>
                      <option value="Website">Website</option>
                      <option value="Service App">Service App</option>
                      <option value="DM Course">DM Course</option>
                      <option value="Promotion">Promotion</option>
                      <option value="WDC">WDC</option>
                      <option value="PDP">PDP</option>
                      <option value="POS">POS</option>
                      <option value="DM Online">DM Online</option>
                   </select></div><div style="overflow-x:scroll;">${content}</div>`;
    $("#tableProjects button").click(function () {
        // Get the clicked button
        const clickedButton = $(this);

        // Find the closest table row (TR) element
        const clickedRow = clickedButton.closest("tr");

        // Add the "highlited" class to the row
        clickedRow.addClass("table-primary");
    });
    var option = "default";
    var type = "default";

    function loadtable() {
        if ($.fn.DataTable.isDataTable("#tableProjects")) {
            // If DataTable is already initialized, destroy it
            $("#tableProjects").DataTable().destroy();
        }
        if (type == "default") {
            countNotLive("All Project");
            countNotRenewed("All Project");
        } else {
            countNotLive(type);
            countNotRenewed(type);
        }

        // Fetch the main data
        $.ajax({
            url: api_url,
            method: "POST",
            data: { operation: "020-new", option: option, type: type },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
            success: function (response) {
                const mainData = JSON.parse(response);
                $.ajax({
                    url: "https://pos.kalamitcompany.com/api/pos_stat_api.php",
                    method: "POST",
                    data: { type: 1 },
                    success: function (orderData) {
                        const orderDataMap = {};

                        // Map the order data for easy lookup
                        orderData.forEach((order) => {
                            orderDataMap[order.customer_id] = order.order_count;
                        });

                        // Process and merge the main data with the order count
                        const tableData = mainData.data.map((row) => {
                            // Add the orderCount field to each row
                            const orderCount = orderDataMap[row[0]] || 0; // Assuming customer_id is in the first column
                            row[21] = orderCount; // Assuming 21 is the index for the order count column
                            return row;
                        });

                        // Initialize the DataTable
                        $("#tableProjects").DataTable({
                            order: [[0, "desc"]],
                            processing: false,
                            paging: true,
                            pagingType: "full_numbers",
                            serverSide: false,
                            data: tableData,
                            columns: [
                                { data: "0" },
                                { data: "21" },
                                {
                                    data: "1",
                                    render: function (data, type, row, meta) {
                                        var index = meta.row;
                                        return (
                                            row[1] +
                                            "<br>" +
                                            row[16] +
                                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                                            row[1] +
                                            "', '" +
                                            row[17] +
                                            "', '" +
                                            row[15] +
                                            "', " +
                                            index +
                                            ')">' +
                                            row[15] +
                                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                                            row[1] +
                                            "', '" +
                                            row[17] +
                                            "', '" +
                                            row[18] +
                                            "', " +
                                            index +
                                            ')">' +
                                            row[18] +
                                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                                            row[19] +
                                            '">' +
                                            row[19] +
                                            '</a><br><button style="display:none" data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                                            row[0] +
                                            '" id="save-id-' +
                                            index +
                                            '" onclick=stopRecord("' +
                                            row[0] +
                                            '","' +
                                            index +
                                            '")>End Call</button>'
                                        );
                                    },
                                },
                                { data: "2" },
                                { data: "4" },
                                {
                                    data: "5",
                                    render: function (data, type, row) {
                                        return (
                                            row[5] +
                                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjForTask(' +
                                            row[0] +
                                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(' +
                                            row[0] +
                                            ')">View Task</button>'
                                        );
                                    },
                                },
                                {
                                    data: "6",
                                    render: function (data, type, row) {
                                        return row[6];
                                    },
                                },
                                { data: "14" },
                                { data: "10" },
                                {
                                    data: "13",
                                    render: function (data, type, row) {
                                        return (
                                            row[13] +
                                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                                            row[0] +
                                            ')">Full Status</button>'
                                        );
                                    },
                                },
                                { data: "20" },
                                {
                                    data: null,
                                    render: function (data, type, row) {
                                        return (
                                            '<button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                                            row[0] +
                                            ')">Edit</button><br>' +
                                            '<button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBillingSupport(' +
                                            row[0] +
                                            ')">Billing</button><br>' +
                                            '<button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                                            row[0] +
                                            ')">Details</button><br>' +
                                            '<button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                                            row[17] +
                                            ')" data-whatever="' +
                                            row[17] +
                                            '">Status</button>'
                                        );
                                    },
                                },
                            ],
                            createdRow: function (row, data, dataIndex) {
                                var $td = $(row).find("td:eq(7)");
                                if (data[14] == "No dues") {
                                    $td.css({ "background-color": "green", color: "white" });
                                } else if (data[14] == "No payment details") {
                                    $td.css({ "background-color": "red", color: "white" });
                                }

                                const statusButton = $(row).find("button");
                                statusButton.on("click", function () {
                                    $("table#tableProjects tr").removeClass("table-primary");
                                    var tr = $(this).closest("tr");
                                    tr.addClass("table-primary");
                                });
                            },
                        });
                    },
                    error: function (error) {
                        console.error("Order count fetch error:", error);
                    },
                });
            },
            error: function (error) {
                console.error("Main data fetch error:", error);
            },
        });
    }
    loadtable();

    $(".btn-item").each(function () {
        // Attach click event listener
        $(this).on("click", function () {
            // Get the id of the clicked button
            $(".btn-item").removeClass("active");

            // Add 'bhj' class to the clicked button
            $(this).addClass("active");
            var id = $(this).attr("id");

            // Assign option based on the id of the clicked button
            switch (id) {
                case "notlive":
                    option = "notlive";
                    break;
                case "final":
                    option = "final";
                    break;
                case "in":
                    option = "in";
                    break;
                case "send":
                    option = "send";
                    break;
                case "upload":
                    option = "upload";
                    break;
                case "live":
                    option = "live";
                    break;
                case "suspended":
                    option = "suspended";
                    break;
                case "not":
                    option = "not";
                    break;
                default:
                    option = "default";
                    break;
            }

            // Call loadtable() function with the updated option
            loadtable();
        });
    });

    $("#projectTypeFilter").on("change", function () {
        type = $(this).val();

        loadtable();
    });
}

// Get Project Details
function getProjectDetails() {
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>" + content;

    var table = $("#tableProjects").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "020" },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            {
                data: "1",
                render: function (data, type, row, meta) {
                    var index = meta.row;

                    return (
                        row[1] +
                        "<br>" +
                        row[16] +
                        '<br> <a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[17] +
                        "', '" +
                        row[15] +
                        "', " +
                        index +
                        ')">' +
                        row[15] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[17] +
                        "', '" +
                        row[18] +
                        "', " +
                        index +
                        ')">' +
                        row[18] +
                        '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                        row[19] +
                        '">' +
                        row[19] +
                        '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        row[17] +
                        '" id="save-id-' +
                        index +
                        '" onclick=stopRecord("' +
                        row[17] +
                        '","' +
                        index +
                        '")>End Call</button>'
                    );
                },
            },
            { data: "2" },
            { data: "4" },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        row[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjForTask(' +
                        row[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(' +
                        row[0] +
                        ')">View Task</button>'
                    );
                },
            },
            {
                data: "6", // Project_Type
                render: function (data, type, row) {
                    return row[6];
                },
            },
            {
                data: "14",
            },
            { data: "10" },
            {
                data: "13",
                render: function (data, type, row) {
                    return (
                        row[13] + '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' + row[0] + ')">Full Status</button>'
                    );
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                        row[0] +
                        ')">Edit</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBilling(' +
                        row[0] +
                        ')">Billing</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        row[0] +
                        ')">Details</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectPayment" onclick="addProjectIDPayment(' +
                        row[0] +
                        ')">Payment</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                        row[17] +
                        ')" data-whatever="' +
                        row[17] +
                        '">Status</button>'
                    );
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(6)"); // Target the 6th TD within the row
            if (data[14] == "No dues") {
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[14] == "No payment details") {
                $td.css({ "background-color": "red", color: "white" });
            }
        },
    });
}

function fullDetails(id) {
    $(".loader").show();

    $.ajax({
        url: api_url,
        data: { operation: "026", id: id },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("/END/");
            var content =
                '<table id="tableProjectsFullDetails" class="table table-bordered table-striped"><thead><th>Full Address:</th><th>State:</th><th>PinCode:</th><th>Remarks:</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                content += "<tr><td>" + part[0] + "</td><td>" + part[1] + "</td><td>" + part[2] + "</td><td>" + part[3] + "</td></tr>";
            }
            document.getElementById("fullProjectDetails").innerHTML = "<div style='overflow-x:scroll;'>" + content + "</tbody></table>";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function fillUpdateProjectStatus(id) {
    addStatusTitle(id);
    getProjectStatus(id);
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "027", id, id },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            document.getElementById("projectLead").value = parseInt(data[0]);
            document.getElementById("projectStatusID").value = id;
            document.getElementById("projectCaller").value = parseInt(data[1]);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function addStatusTitle(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "045", id: id },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            document.getElementById("statusTitle").innerHTML = "STATUS " + data[0] + "(" + data[1] + ")";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function addNewProjectStatus() {
    var leadID = document.getElementById("projectLead").value;
    var projectID = document.getElementById("projectStatusID").value;
    var callerID = document.getElementById("projectCaller").value;
    var summary = document.getElementById("projectSummaryNote").value;
    var remark = document.getElementById("projectStatusRemark").value;
    var updateBy = localStorage.getItem("userID");
    if (summary == "" || remark == "") {
        document.getElementById("errorProjectDetailsStatus").innerHTML = "Fill the Form Correctly";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "028",
                leadID: leadID,
                projectID: projectID,
                callerID: callerID,
                summary: summary,
                remark: remark,
                updateBy: updateBy,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    projStatusChange(leadID, summary);

                    alert("Status Uploaded");
                    getProjectStatus(projectID);
                    document.getElementById("projectSummaryNote").value = "";
                    document.getElementById("projectStatusRemark").value = "";
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function getProjectStatus(id) {
    var content = '<table id="tableProjectStatus" class="table table-bordered table-striped"><thead><th>Summary</th><th>Remarks</th><th>Updated By</th><th>DOR</th></thead><tbody>';
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "029", id: id },
        success: function (response) {
            $(".loader").hide();
            partialElement = response.split("/END/");
            total = partialElement.length - 1;
            for (let i = 0; i < total; i++) {
                var data = partialElement[i].split("<-->");
                content += "<tr><td>" + data[0] + "</td><td>" + data[1] + "</td><td>" + data[2] + "</td><td>" + data[3] + "</td></tr>";
            }
            document.getElementById("allProjectStatus").innerHTML = content;
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function fillUpdateProjectForm(id) {
    fillProjectDetailsForm();
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "021", id: id },
        success: function (response) {
            $(".loader").hide();
            var part = response.split("<-->");
            document.getElementById("projectID").value = part[10];
            document.getElementById("leadID").value = part[9];
            document.getElementById("edit_leadsA").value = part[0];
            if (localStorage.getItem("userType") == "Developer") {
                getCallers();
            }
            document.getElementById("edit_callerA").value = parseInt(part[11]);
            if (localStorage.getItem("userType") != "Developer") {
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
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function updateProjectDetails() {
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

    if (lead == "" || caller == "" || developer == "" || projectName == "" || projectType == "" || address == "" || pincode == "") {
        document.getElementById("editErrorProjectDetails").innerHTML = "Fill Form Correctly";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "022",
                id: id,
                lead: lead,
                caller: caller,
                developer: developer,
                projectName: projectName,
                projectType: projectType,
                address: address,
                pincode: pincode,
                city: city,
                remarks: remarks,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Project Details Updated");
                    $(".close").click();
                } else {
                    alert(response);
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

// Get Details for Developer
function getProjectDetailsDeveloper() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "020" },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("/END/");
            var content =
                '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status:</th><th>OPTIONS</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                if (localStorage.getItem("userID") == parseInt(part[3]) || localStorage.getItem("userID") == parseInt(part[12])) {
                    if (part[14] == "No payment details") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td><td>' +
                            part[6] +
                            '</td><td style="background-color:red;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    } else if (part[14] == "No dues") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td><td>' +
                            part[6] +
                            '</td><td style="background-color:green;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    } else {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td><td>' +
                            part[6] +
                            "</td><td>" +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button></td></tr>';
                    }
                }
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
            $("#tableProjects").DataTable({ order: [[0, "desc"]], stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Get Details for Caller
function getProjectDetailsCaller() {
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>" + content;
    let callerID = localStorage.getItem("userID");
    var table = $("#tableProjects").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "020-1", callerID: callerID },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            {
                data: "1",
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return (
                        row[1] +
                        "<br>" +
                        row[16] +
                        '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[17] +
                        "', '" +
                        row[15] +
                        "', " +
                        index +
                        ')">' +
                        row[15] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[17] +
                        "', '" +
                        row[18] +
                        "', " +
                        index +
                        ')">' +
                        row[18] +
                        '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                        row[19] +
                        '">' +
                        row[19] +
                        '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        row[17] +
                        '" id="save-id-' +
                        index +
                        '" onclick=stopRecord("' +
                        row[17] +
                        '","' +
                        index +
                        '")>End Call</button>'
                    );
                },
            },
            { data: "2" },
            { data: "4" },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        row[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjForTask(' +
                        row[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(' +
                        row[0] +
                        ')">View Task</button>'
                    );
                },
            },
            {
                data: "6", // Project_Type
                render: function (data, type, row) {
                    return row[6];
                },
            },
            {
                data: "14",
            },
            { data: "10" },
            {
                data: "13",
                render: function (data, type, row) {
                    return (
                        row[13] + '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' + row[0] + ')">Full Status</button>'
                    );
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                        row[0] +
                        ')">Edit</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBilling(' +
                        row[0] +
                        ')">Billing</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        row[0] +
                        ')">Details</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectPayment" onclick="addProjectIDPayment(' +
                        row[0] +
                        ')">Payment</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                        row[17] +
                        ')" data-whatever="' +
                        row[17] +
                        '">Status</button>'
                    );
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(6)"); // Target the 6th TD within the row
            if (data[14] == "No dues") {
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[14] == "No payment details") {
                $td.css({ "background-color": "red", color: "white" });
            }
        },
    });
}

function getProjectDetailsTL() {
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
    content += "</tbody></table></div>";
    document.getElementById("displayContent").innerHTML = "<h1>Team Project Details</h1><div style='overflow-x:scroll;'>" + content;
    let callerID = localStorage.getItem("userID");
    var table = $("#tableProjects").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "020-2", callerID: callerID },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "0" },
            {
                data: "1",
                render: function (data, type, row, meta) {
                    var index = meta.row;
                    return (
                        row[1] +
                        "<br>" +
                        row[16] +
                        '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[17] +
                        "', '" +
                        row[15] +
                        "', " +
                        index +
                        ')">' +
                        row[15] +
                        '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                        row[1] +
                        "', '" +
                        row[17] +
                        "', '" +
                        row[18] +
                        "', " +
                        index +
                        ')">' +
                        row[18] +
                        '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                        row[19] +
                        '">' +
                        row[19] +
                        '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        row[17] +
                        '" id="save-id-' +
                        index +
                        '" onclick=stopRecord("' +
                        row[17] +
                        '","' +
                        index +
                        '")>End Call</button>'
                    );
                },
            },
            { data: "2" },
            { data: "4" },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        row[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj" onclick="addProjForTask(' +
                        row[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask" onclick="viewProjectTask(' +
                        row[0] +
                        ')">View Task</button>'
                    );
                },
            },
            {
                data: "6", // Project_Type
                render: function (data, type, row) {
                    return row[6];
                },
            },
            {
                data: "14",
            },
            { data: "10" },
            {
                data: "13",
                render: function (data, type, row) {
                    return (
                        row[13] + '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' + row[0] + ')">Full Status</button>'
                    );
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return (
                        '<button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                        row[0] +
                        ')">Edit</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectBilling" onclick="getProjectBilling(' +
                        row[0] +
                        ')">Billing</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        row[0] +
                        ')">Details</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModalProjectPayment" onclick="addProjectIDPaymentTL(' +
                        row[0] +
                        ')">Payment</button><br>' +
                        '<button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                        row[17] +
                        ')" data-whatever="' +
                        row[17] +
                        '">Status</button>'
                    );
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var $td = $(row).find("td:eq(6)"); // Target the 6th TD within the row
            if (data[14] == "No dues") {
                $td.css({ "background-color": "green", color: "white" });
            } else if (data[14] == "No payment details") {
                $td.css({ "background-color": "red", color: "white" });
            }
        },
    });
}

// Update project Details by Developer
function updateProjectDetailsDeveloper() {
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

    if (lead == "" || caller == "" || developer == "" || projectName == "" || projectType == "" || address == "" || pincode == "") {
        document.getElementById("editErrorProjectDetails").innerHTML = "Fill Form Correctly";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "022",
                id: id,
                lead: lead,
                caller: caller,
                developer: developer,
                projectName: projectName,
                projectType: projectType,
                address: address,
                pincode: pincode,
                city: city,
                remarks: remarks,
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Project Details Updated");
                    $(".close").click();
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}
function sendMail(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "023", id: id },
        success: function (response) {
            $(".loader").hide();
            if (response == 0) {
                alert("Email Not Provided");
            } else if (response == 2) {
                alert("Server Error");
            } else {
                afterMail(id);
                var data = response.split("<-->");
                if (parseInt(data[4]) == parseInt(2)) {
                    serviceAppMail(data[0], data[1]);
                } else {
                    mailSend(data[0], data[1], data[2], data[3]); //replace 2nd parameter by data[1]
                }
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function serviceAppMail(client, to) {
    var subject = "Service App Proposal From Kalam Academy";
    var message =
        "Hi " +
        client +
        "," +
        "<p><br></p><p>We are pleased to inform you that after helping 400+ small scale businessmen to take there Grocery Business Online.</p><p>As discussed over the phone now we have launched our Service Application to bring servicemen and customer under one roof.</p><p>After running Grocery Application across India, Saudi Arabia, Dubai, Pakistan &amp; Australia. With the experience of 4+ years, we are ready to help you again with our Service Application.</p><p>I have attached the Updated PDF of our quotation &amp; services. Please go through this.</p><p>Here is the list of things that are included in the package -</p><p><br></p><ul><li> Service Mobile Application Package Rs &nbsp;18000/-</li><li>Application designing as in the Kalam Service app.</li><li>Application development as in the Kalam Service app.</li><li>Google Play Store publishing($25 paid to google).</li><li>Hosting and server for one year.</li><li>Maintenance for one year.</li><li>Multiple catalog upload.</li><li>Cash on the delivery payment method (COD).</li><li>Multiple banners to advertise.</li><li>Customer application.</li><li>Advance admin panel.</li><li>Automatic billing system.</li><li>Catalog image free.</li><li>Now you can change the password of your admin panel.</li></ul><p><br></p><p>One Time Payment Offer</p><p>1. 5% discount&nbsp;</p><p>2. Payment gateway free worth Rs 2000/-</p><p><br></p><p>CUSTOMISATION OR ADD-ON FEATURE WILL BE BILLED SEPARATELY</p><p>This is very unique low investment high return business opportunity. You can fill the form below and process the payment if you are interested.</p><p><br></p><p>Form Link</p><p><a href='https://docs.google.com/forms/d/e/1FAIpQLScKXVYz0FzwLBAFZGwxgjFHc_MlrHDpWz7x1bgVRkcijnF2rg/viewform'>https://docs.google.com/forms/d/e/1FAIpQLScKXVYz0FzwLBAFZGwxgjFHc_MlrHDpWz7x1bgVRkcijnF2rg/viewform</a></p><p><br></p><p>This is the bank account of our company. You may make payment here.</p><p>GreenTech India</p><p>481520110000299</p><p>BKID0004815</p><p>Bank of India</p><p><br></p><p>This is our google pay &amp; phonepe number (8092805068) , &nbsp;you may also make payment through it.&nbsp;</p><p><br></p><p><p>Feel free to reach us for any help at 8235529341</p><p><br></p><p>Firdaush</p><p>Marketing Head at Kalam Academy</p><p>Kalam Academy</p><br><br>Download Proposal Here :<a href=`https://drive.google.com/file/d/1iNHUtT0XcRxYEM6xxBr9A2IndGLfKnw1/view?usp=sharing`>Download here</a><br><br>Regards<br><font color='red'><b>We never ask you to pay in any individual account Only pay in <i><u>GreenTech India</u></i> account (A/C: 481520110000299 | IFSC: BKID0004815 GooglePay & Phone/Pay Number: 8092805068) </b></font>";
    // console.log(message);
    $(".loader").show();
    $.ajax({
        type: "post",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00100", to: to, subject: subject, message: message },
        success: function (response) {
            $(".loader").hide();
            //console.log(response)
            if (response > 0) {
                alert("Mail Sent");
            } else {
                alert("Error In Sending Mail");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function afterMail(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "025", id: id },
        success: function (response) {
            $(".loader").hide();

            if (response == 1) {
                getAllStatus(id);
                if (localStorage.getItem("userType") == "Admin") {
                    allLeads();
                } else if (localStorage.getItem("userType") != "Admin") {
                    myLeads();
                }
                document.getElementById("summary_note").value = "Mail has been sent";
            } else {
                alert("Unexpected Error");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function mailSend(client, to, caller, mobile) {
    var subject = "Grocery Business Proposal From Kalam Academy";
    var message =
        "Hi " +
        client +
        ",<br><br>As discussed over phone we are helping people to start their Grocery business from Last 4 years.<br>Our app is running in more than 300 cities+  in India, Austalia, Bangladesh, Dubai, Pakistan and many more places.<br>I have attached the Updated PDF of our quotation & services. Please go through this.<br>We are providing complete business solutions in just Rs 14000/- even that you can pay in 2 Installments.<br><br><b>First Installment: 7K Must Paid in Advance</b><br><b>Second Installment: 7k Must be paid within 24 hrs of app/admin panel delivery</b><br><br><br>We offer a large verity of customization options on our current app at very affordable price.<br>Our terms of payment are in 2 installments of the total bill.<br>(In case if you buy an application with extra features Then You will have to pay in 40%(Advance) 30%(2nd Installment) 30% (3rd Installment) of total amount.)<br><br>This is very unique low investment high return business opportunity. You can fill the form below and process the payment if you are interested.<br>Form Link: <a href = 'https://docs.google.com/forms/d/e/1FAIpQLScKXVYz0FzwLBAFZGwxgjFHc_MlrHDpWz7x1bgVRkcijnF2rg/viewform'>Click here</a><br><br>This is the bank account of our company. You may make payment here.<br><br>GreenTech India<br>481520110000299<br>BKID0004815<br>Bank of India<br> <p>This is our google pay &amp; phonepe number (8092805068) , &nbsp;you may also make payment through it.&nbsp;</p>   <br>Our prices may increase soon so this is the best time to Start Your Grocery Business. Don't miss the opportunity and start your business from today.<br>Feel Free to Reach me out on Whatsapp or call on  " +
        mobile +
        "<br><br>Download Proposal Here :<a href=`https://drive.google.com/file/d/1Comt2CpMGoEQKls0wfF0IrOmfP1QozDs/view`>Download here</a><br><br>Regards<br>" +
        caller +
        "<br>" +
        mobile +
        "<br><b>Kalam Academy</b><br><font color='red'><b>We never ask you to pay in any individual account Only pay in <i><u>GreenTech India</u></i> account (A/C: 481520110000299 | IFSC: BKID0004815 GooglePay & Phone/Pay Number: 8092805068) </b></font>";

    $(".loader").show();
    //console.log(message);
    $.ajax({
        type: "post",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00100", to: to, subject: subject, message: message },
        success: function (response) {
            $(".loader").hide();
            console.log(response);
            if (response > 0) {
                alert("Mail Sent");
            } else {
                alert("Error In Sending Mail");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function addBillingTitle(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "045", id: id },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            document.getElementById("billingTitle").innerHTML = "BILLING " + data[0] + "(" + data[1] + ")";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function addPaymentTitle(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "045", id: id },
        success: function (response) {
            $(".loader").hide();
            var data = response.split("<-->");
            document.getElementById("paymentTitle").innerHTML = "PAYMENT " + data[0] + "(" + data[1] + ")";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getProjectBilling(id) {
    localStorage.setItem("Billing_PD_ID", id);
    addBillingTitle(id);
    checkDiscountPayment(id);
    document.getElementById("projectIDBilling").value = id;
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>PID</th><th>Addon Name</th><th>Addon Price</th><th>DOR:</th><th>DELETE</th></thead><tbody>';
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "031", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var amount = partial[totalElement];
            for (let index = 0; index < totalElement; index++) {
                var data = partial[index].split("<-->");
                var addon = getAddonName(data[0]);
                content +=
                    "<tr><td>" +
                    data[3] +
                    "</td><td>" +
                    addon +
                    "</td><td>" +
                    data[1] +
                    "</td><td>" +
                    data[2] +
                    "</td><td><button onclick='deleteProjectBilling(" +
                    data[3] +
                    "," +
                    data[4] +
                    ")'>REMOVE</button></td></tr>";
            }
            document.getElementById("allProjectBilling").innerHTML =
                content +
                "</tbody></table><div class='container'><b>Total : Rs </b>" +
                amount +
                "</div><br><button onclick='billingMail(" +
                id +
                ")' >SEND BILL</button>&nbsp<button type='button' onclick='manualMail(" +
                id +
                ")'>MANUAL MAIL</button>";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getAddonName(code) {
    if (parseInt(code) == parseInt("000")) {
        return "Grocery App";
    } else if (parseInt(code) == parseInt("001")) {
        return "Product Image FREE";
    } else if (parseInt(code) == parseInt("002")) {
        return "Payment Gateway(Razorpay) Rs 2000/- ";
    } else if (parseInt(code) == parseInt("003")) {
        return "Logo (Advance) Rs 1000/-";
    } else if (parseInt(code) == parseInt("004")) {
        return "Logo (Normal) FREE";
    } else if (parseInt(code) == parseInt("005")) {
        return "SMS Notification** FREE integration";
    } else if (parseInt(code) == parseInt("006")) {
        return "Simple Location Tracking as Rs 3000/-";
    } else if (parseInt(code) == parseInt("007")) {
        return "Delivery Boy Admin Panel (NORMAL) FREE";
    } else if (parseInt(code) == parseInt("008")) {
        return "Delivery Boy Admin Panel Rs 4000/-";
    } else if (parseInt(code) == parseInt("009")) {
        return "Play store publishing on our Google account FREE";
    } else if (parseInt(code) == parseInt("010")) {
        return "Play store publishing on personal Google account $25+$15";
    } else if (parseInt(code) == parseInt("011")) {
        return "Automatic bill generation FREE";
    } else if (parseInt(code) == parseInt("012")) {
        return "wallet Rs 5000/-";
    } else if (parseInt(code) == parseInt("013")) {
        return "Coupon code Rs 3000/-";
    } else if (parseInt(code) == parseInt("014")) {
        return "Ios publishing $100/year + $50";
    } else if (parseInt(code) == parseInt("015")) {
        return "GPS tracking Rs 20000 + google fee";
    } else if (parseInt(code) == parseInt("016")) {
        return "Interface Rs 13000/- ";
    } else if (parseInt(code) == parseInt("017")) {
        return "OTP Rs 3000/- ";
    } else if (parseInt(code) == parseInt("018")) {
        return "Export to Excel 1500/- ";
    } else if (parseInt(code) == parseInt("019")) {
        return "Share my app 1000/- ";
    } else if (parseInt(code) == parseInt("020")) {
        return "One page Website 5000/- ";
    } else if (parseInt(code) == parseInt("021")) {
        return "Sub Category 3000/-  ";
    } else if (parseInt(code) == parseInt("022")) {
        return "Push Notification 3000/- ";
    } else if (parseInt(code) == parseInt("023")) {
        return "Analytical Graph 3000/- ";
    } else if (parseInt(code) == parseInt("024")) {
        return "Application upgrade 6000/- ";
    } else if (parseInt(code) == parseInt("025")) {
        return "Refer and earn 8000/- ";
    } else if (parseInt(code) == parseInt("026")) {
        return "Renewal 8000/- ";
    } else if (parseInt(code) == parseInt("027")) {
        return "Service App";
    } else {
        return code;
    }
}

function deleteProjectBilling(id, projectId) {
    if (confirm("Remove Addon?")) {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: { operation: "032", id: id },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Addon Removed");
                    getProjectBilling(projectId);
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function addProjectBilling() {
    var projectIDBilling = document.getElementById("projectIDBilling").value;
    var Billing_PD_ID = localStorage.getItem("Billing_PD_ID");
    if (projectIDBilling == Billing_PD_ID) {
        var addon = document.getElementById("projectBillingAddon").value;
        var cost = 0;
        switch (addon) {
            case "000":
                cost = 14000;
                break;
            case "001":
                cost = 0;
                break;
            case "002":
                cost = 2000;
                break;
            case "003":
                cost = 1000;
                break;
            case "004":
                cost = 0;
                break;
            case "005":
                cost = 0;
                break;
            case "006":
                cost = 3000;
                break;
            case "007":
                cost = 0;
                break;
            case "008":
                cost = 4000;
                break;
            case "009":
                cost = 0;
                break;
            case "010":
                cost = 3050;
                break;
            case "011":
                cost = 0;
                break;
            case "012":
                cost = 5000;
                break;
            case "013":
                cost = 3000;
                break;
            case "014":
                cost = 11410;
                break;
            case "015":
                cost = 20000;
                break;
            case "016":
                cost = 13000;
                break;
            case "017":
                cost = 3000;
                break;
            case "018":
                cost = 1500;
                break;
            case "019":
                cost = 1000;
                break;
            case "020":
                cost = 5000;
                break;
            case "021":
                cost = 3000;
                break;
            case "022":
                cost = 3000;
                break;
            case "023":
                cost = 3000;
                break;
            case "024":
                cost = 6000;
                break;
            case "025":
                cost = 8000;
                break;
            case "026":
                cost = 8000;
                break;
            case "027":
                cost = 14000;
                break;
            default:
                cost = 0;
                break;
        }
        addonCustomName = document.getElementById("AddonName").value;
        addonCustomCost = document.getElementById("AddonAmount").value;
        if (addonCustomName != "" && addonCustomCost != "") {
            addon = addonCustomName;
            cost = addonCustomCost;
            $(".loader").show();
            console.log(addon);
            $.ajax({
                url: api_url,
                data: {
                    operation: "030",
                    id: projectIDBilling,
                    addon: addon,
                    cost: cost,
                },
                success: function (response) {
                    console.log(response);
                    $(".loader").hide();
                    if (parseInt(response) == 1) {
                        document.getElementById("AddonName").value = "";
                        document.getElementById("AddonAmount").value = "";
                        document.getElementById("errorProjectBilling").innerHTML = "";
                        alert("Billing Details Uploaded");
                        getProjectBilling(projectIDBilling);
                    } else if (parseInt(response) == 2) {
                        document.getElementById("errorProjectBilling").innerHTML = "Similar details uploaded";
                    } else {
                        document.getElementById("errorProjectBilling").innerHTML = "";
                        console.log(response);
                        alert(response);
                        alert("Error Occured");
                    }
                },
                error: function (jqXHR, exception) {
                    var msg = displayerror(jqXHR, exception);
                    alert(msg);
                },
                async: false,
            });
        } else if (addonCustomName != "" && addonCustomCost == "") {
            document.getElementById("errorProjectBilling").innerHTML = "Fill Form Correctly";
        } else if (addonCustomName == "" && addonCustomCost != "") {
            document.getElementById("errorProjectBilling").innerHTML = "Fill Form Correctly";
        } else {
            console.log(addon);
            $(".loader").show();
            $.ajax({
                url: api_url,
                data: {
                    operation: "030",
                    id: projectIDBilling,
                    addon: addon,
                    cost: cost,
                },
                success: function (response) {
                    console.log(response);
                    $(".loader").hide();
                    if (parseInt(response) == 1) {
                        document.getElementById("errorProjectBilling").innerHTML = "";
                        alert("Billing Details Uploaded");
                        getProjectBilling(projectIDBilling);
                    } else if (parseInt(response) == 2) {
                        document.getElementById("errorProjectBilling").innerHTML = "Similar details uploaded";
                    } else {
                        document.getElementById("errorProjectBilling").innerHTML = "";
                        console.log(response);
                        alert(response);
                        alert("Error Occured");
                    }
                },
                error: function (jqXHR, exception) {
                    var msg = displayerror(jqXHR, exception);
                    alert(msg);
                },
                async: false,
            });
        }
    } else {
        alert("Gitch");
    }
}

function checkDiscountPayment(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "037", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var amount = partial[totalElement];
            if (response == 0) {
                document.getElementById("dicountDiv").style.display = "block";
                document.getElementById("ifDiscountAdded").innerHTML = "none";
            } else {
                document.getElementById("dicountDiv").style.display = "block";

                //   Changes
                var content =
                    '<h3>Discounts Added</h3><table id="tableProjects" class="table table-bordered table-striped"><thead><th>Remark</th><th>Amount</th><th>DOR:</th></thead><tbody>';

                for (let index = 0; index < totalElement; index++) {
                    var data = partial[index].split("<-->");
                    var addon = getAddonName(data[0]);
                    content += "<tr><td>" + addon + "</td><td>" + data[1] + "</td><td>" + data[2] + "</td></tr>";
                }

                document.getElementById("ifDiscountAdded").innerHTML = content + "</tbody></table>";
                // Changes End
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function removeDiscount(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "038", id: id },
        success: function (response) {
            $(".loader").hide();
            if (response == 1) {
                alert("Discount Removed");
                document.getElementById("ifDiscountAdded").innerHTML = "";
                document.getElementById("dicountDiv").style.display = "block";
                getProjectBilling(id);
                getProjectDetails();
            } else {
                alert("Server Error");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function addProjectDiscount() {
    var id = document.getElementById("projectIDBilling").value;
    var discount = document.getElementById("discountAmount").value;
    var remark = document.getElementById("discountRemark").value;

    if (discount == "") {
        document.getElementById("errorProjectDiscount").innerHTML = "Enter Amount to Add";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: { operation: "036", id: id, discount: discount, remark: remark },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Discount Added");
                    document.getElementById("discountAmount").value = "";
                    getProjectBilling(id);
                    getProjectDetails();
                } else if (response == 0) {
                    alert("Server Error");
                } else {
                    alert("Unxepected Error check console");
                    console.log(response);
                    alert(response);
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function manualMail(id) {
    $(".close").click();
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "040", id: id },
        success: function (response) {
            $(".loader").hide();
            var today = new Date();
            var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
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

            var content =
                "Hi " +
                name +
                "<br>Thanks to be part of <b>Kalam Academy</b>. We respect your time and money. You are our valuable customer. <br>Here is the final bill of services you availed.<br><br>";
            content +=
                '<table style=" border: 1px solid black;padding:10px;border-spacing: 0px;" ><thead><tr><th colspan="4"><center><h1>Kalam Academy</h1></center></th></tr><tr><th colspan="2" style=" border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;">Date : ' +
                date +
                "<br>Customer ID: " +
                userId +
                "<br>Product: " +
                projectName +
                "(" +
                id +
                ")<br>" +
                name +
                "<br>" +
                userCall +
                " | " +
                email +
                '</th><th colspan="2" style=" border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;">Kalam Academy <br>Rospa Tower<br>4th Floor<br>Main Road<br>Ranchi-834001</th></tr><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">S/N</th><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">Addon Name</th><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">Addon Price</th><th style=" border: 1px solid black;padding:10px;border-spacing: 0px;">Total</th></thead><tbody>';
            if (email == "") {
                alert("Mail Not Provided");
            } else {
                var noDisc = 0;
                for (let index = 0; index < totalElement; index++) {
                    var data = partial[index].split("<-->");
                    var addon = getAddonName(data[0]);
                    noDisc = noDisc + parseInt(data[1]);
                    content +=
                        "<tr><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        (index + 1) +
                        "</td><td style='text-align:left;border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        addon +
                        "</td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        data[1] +
                        "</td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        data[1] +
                        "</td></tr>";
                }
                content +=
                    "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Total : " +
                    noDisc +
                    "</td></tr>";
                content +=
                    "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Discount : " +
                    discount +
                    "</td></tr>";
                content +=
                    "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Net : " +
                    amount +
                    "</td></tr>";
                content +=
                    "<tr><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Paid : " +
                    paid +
                    "</td></tr>";
                content +=
                    "<tr><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Dues : " +
                    dues +
                    "</td></tr>";

                content =
                    content +
                    "<tr><th style=' border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3><a href='https://www.kalamacademy.org/terms-of-service/' target='_blank'>Terms & Condition</a> / <a href='https://www.kalamacademy.org/privacy-policy/' target='_blank'>Privacy Policy</a></h3></center></th></tr>";
                content =
                    content + "<tr><th style=' border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3>Thanks For Your Bill</h3></center></th></tr>";
                content = content + "</tbody></table><br><br>Feel free to reach us out for any help.<br><br>Regards<br>" + caller + "<br>" + contact + "<br><b>Kalam Academy</b>";
                var printContents = content;
                var originalContents = document.body.innerHTML;
                document.body.innerHTML = printContents;
                document.title = projectName + "_Billing";
                window.print();
                window.location.reload();
                document.getElementById("mailCode").innerHTML = content;
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function billingMail(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "040", id: id },
        success: function (response) {
            $(".loader").hide();
            var today = new Date();
            var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
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

            var content =
                "Hi " +
                name +
                "<br>Thanks to be part of <b>Kalam Academy</b>. We respect your time and money. You are our valuable customer. <br>Here is the final bill of services you availed.<br><br>";
            content +=
                "<table style='border: 1px solid black;padding:10px;border-spacing: 0px;'><thead><tr><th colspan='4'><center><h1>Kalam Academy</h1></center></th></tr><tr><th colspan='2' style='border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;'>Date : " +
                date +
                "<br>Customer ID: " +
                userId +
                "<br>Product: " +
                projectName +
                "(" +
                id +
                ")<br>" +
                name +
                "<br>" +
                userCall +
                " | " +
                email +
                "</th><th colspan='2' style='border: 1px solid black;padding:10px;border-spacing: 0px;text-align:left;'>Kalam Academy <br>Rospa Tower<br>4th Floor<br>Main Road<br>Ranchi-834001</th></tr><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>S/N</th><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Addon Name</th><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Addon Price</th><th style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Total</th></thead><tbody>";
            if (email == "") {
                alert("Mail Not Provided");
            } else {
                var noDisc = 0;
                for (let index = 0; index < totalElement; index++) {
                    var data = partial[index].split("<-->");
                    var addon = getAddonName(data[0]);
                    noDisc = noDisc + parseInt(data[1]);
                    content +=
                        "<tr><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        (index + 1) +
                        "</td><td style='text-align:left;border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        addon +
                        "</td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        data[1] +
                        "</td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>" +
                        data[1] +
                        "</td></tr>";
                }
                content +=
                    "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border: 1px solid black;padding:10px;border-spacing: 0px;'>Total : " +
                    noDisc +
                    "</td></tr>";
                content +=
                    "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Discount : " +
                    discount +
                    "</td></tr>";
                content +=
                    "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Net : " +
                    amount +
                    "</td></tr>";
                content +=
                    "<tr><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border-left: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Paid : " +
                    paid +
                    "</td></tr>";
                content +=
                    "<tr><td style='border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style=' border-left: 1px solid black;border-bottom: 1px solid black;border-right: 1px solid black;padding:10px;border-spacing: 0px;'></td><td style='border: 1px solid black;padding:10px;border-spacing: 0px;'>Dues : " +
                    dues +
                    "</td></tr>";

                content =
                    content +
                    "<tr><th style='border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3><a href='https://www.kalamacademy.org/terms-of-service/' target='_blank'>Terms & Condition</a> / <a href='https://www.kalamacademy.org/privacy-policy/' target='_blank'>Privacy Policy</a></h3></center></th></tr>";
                content = content + "<tr><th style='border: 1px solid black;padding:4px;border-spacing: 0px;' colspan='4'><center><h3>Thanks For Your Bill</h3></center></th></tr>";
                content = content + "</tbody></table><br><br>Feel free to reach us out for any help.<br><br>Regards<br>" + caller + "<br>" + contact + "<br><b>Kalam Academy</b>";
                // console.log(content);
                sendBillMail(content, email, projectName);
                // document.getElementById("displayContent").innerHTML = content;
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// testing start
function sendBillMail(content, email, projectName) {
    var subject = projectName + "Invoice From Kalam Academy";
    $(".loader").show();
    $.ajax({
        type: "post",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00100", subject: subject, to: email, message: content },
        success: function (response) {
            $(".loader").hide();
            alert("Mail Sent");
        },
        error: function () {
            $(".loader").hide();
            alert("Server Error. Get the PDF of the bill in Manual Bill");
        },
    });
}
// testing end

// Payment Part
function addProjectIDPayment(id) {
    getAllProjectPayment(id);
    document.getElementById("projectIDPayment").value = id;
}

function addProjectIDPaymentTL(id) {
    getAllProjectPaymentTL(id);
    document.getElementById("projectIDPayment").value = id;
}

function addProjectPayment() {
    var id = document.getElementById("projectIDPayment").value;
    var amount = document.getElementById("paymentAmount").value;
    var remarks = document.getElementById("paymentRemark").value;
    var status = document.getElementById("paymentStatus").value;
    var updateBy = parseInt(localStorage.getItem("userID"));
    alert(updateBy);

    var file_data = $(".fileToUpload").prop("files")[0]; //Fetch the file
    var form_data = new FormData();

    form_data.append("operation", "033");
    form_data.append("id", id);
    form_data.append("file", file_data);
    form_data.append("amount", amount);
    form_data.append("remarks", remarks);
    form_data.append("status", status);
    form_data.append("updateBy", updateBy);
    //Ajax to send file to upload
    if (amount == "" || status == "") {
        document.getElementById("errorProjectPayment").innerHTML = "Fill Form Correctly";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url, //Server api to receive the file
            type: "POST",
            //  dataType: 'script',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,

            success: function (response) {
                $(".loader").hide();

                document.getElementById("errorProjectPayment").innerHTML = "";
                if (response == 1) {
                    alert("Payment Uploaded");
                    getAllProjectPayment(id);
                    getProjectStatus(projectID);
                    document.getElementById("paymentAmount").value = "";
                    document.getElementById("paymentRemark").value = "";
                    document.getElementById("paymentStatus").value = "0";
                    document.getElementById("paymentProof").value = "";
                } else if (response == 2) {
                    alert("Server Error");
                } else if (response == 3) {
                    document.getElementById("errorProjectPayment").innerHTML = "File Error";
                } else {
                    alert("Unexpected Error");
                    console.log(response);
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function addProjectPayment1() {
    var id = document.getElementById("projectIDPayment").value;
    var amount = document.getElementById("paymentAmount").value;
    var remarks = document.getElementById("paymentRemark").value;
    var status = document.getElementById("paymentStatus").value;
    var updateBy = parseInt(localStorage.getItem("userID"));
    alert(updateBy);

    var file_data = $(".fileToUpload").prop("files")[0]; //Fetch the file
    //
    var form_data = new FormData();

    form_data.append("operation", "33-upload");
    form_data.append("id", id);
    form_data.append("file", file_data);
    form_data.append("amount", amount);
    form_data.append("remarks", remarks);
    form_data.append("status", status);
    form_data.append("updateBy", updateBy);
    //

    params = {};
    params.operation = "33-upload";
    params.id = id;
    params.file = file_data;
    params.amount = amount;
    params.remarks = remarks;
    params.status = status;
    params.updateBy = updateBy;

    //Ajax to send file to upload
    if (amount == "" || status == "") {
        document.getElementById("errorProjectPayment").innerHTML = "Fill Form Correctly";
    } else {
        $(".loader").show();
        /*var options = new FileUploadOptions();
            options.fileKey="file";
            var fileURL = document.getElementById("paymentProof").value;

            options.fileName=fileURL.substr(fileURL.lastIndexOf('/')+1);
            alert(fileURL)
            options.params = params;
            var ft = new FileTransfer();
            var imageURI = cordova.file.externalRootDirectory+"myrecording.mp3";
            ft.upload(fileURL, encodeURI(api_url), function(response){
                $('.loader').hide();
                alert(JSON.stringify(response));
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
            }, function(error){
                $('.loader').hide();
                alert("upload failed "+JSON.stringify(error))
            }, options);*/

        //
        $.ajax({
            url: api_url, //Server api to receive the file
            type: "POST",
            //  dataType: 'script',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,

            success: function (response) {
                $(".loader").hide();

                document.getElementById("errorProjectPayment").innerHTML = "";
                if (response == 1) {
                    alert("Payment Uploaded");
                    getAllProjectPayment(id);
                    getProjectStatus(projectID);
                    document.getElementById("paymentAmount").value = "";
                    document.getElementById("paymentRemark").value = "";
                    document.getElementById("paymentStatus").value = "0";
                    document.getElementById("paymentProof").value = "";
                } else if (response == 2) {
                    alert("Server Error");
                } else if (response == 3) {
                    document.getElementById("errorProjectPayment").innerHTML = "File Error";
                } else {
                    alert("Unexpected Error");
                    console.log(response);
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
        //
    }
}

function getAllProjectPaymentTL(id) {
    addPaymentTitle(id);
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "034", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var amount = partial[len];
            var content = "<table class='table table-striped table-bordered'><thead><th>ID</th><th>Amount</th><th>Proof</th><th>DOR</th><th>Remarks</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (parseInt(data[4]) == 1) {
                    var status = "Verified";
                } else {
                    if (localStorage.getItem("userType") == "Admin")
                        var status = "Unverified<br><button onclick='verifyPayment(" + parseInt(data[5]) + "," + id + ")'>VERIFY</button>";
                    else {
                        var status = "Unverified";
                    }
                }
                // <a href='"+data[1]+"' target='_blank'>Check Proof</a>
                content +=
                    "<tr>" +
                    "<td>" +
                    data[5] +
                    "</td>" +
                    "<td>Rs. " +
                    data[0] +
                    "</td>" +
                    "<td><button class='btn btn-primary' onClick=\"openNewTab('" +
                    data[1] +
                    "')\">Check Proof</button></td>" +
                    "<td>" +
                    data[3] +
                    "</td>" +
                    "<td><b>Updated By: </b>" +
                    data[6] +
                    "<br>" +
                    data[2] +
                    "</td>" +
                    "</tr>";
            }
            document.getElementById("allProjectPayment").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>" + amount + "</div>";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getAllProjectPayment(id) {
    addPaymentTitle(id);
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "034", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var amount = partial[len];
            var content =
                "<table class='table table-striped table-bordered'><thead><th>ID</th><th>Amount</th><th>Proof</th><th>DOR</th><th>Remarks</th><th>Status</th><th>DELETE</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (parseInt(data[4]) == 1) {
                    var status = "Verified";
                } else {
                    if (localStorage.getItem("userType") == "Admin")
                        var status = "Unverified<br><button onclick='verifyPayment(" + parseInt(data[5]) + "," + id + ")'>VERIFY</button>";
                    else {
                        var status = "Unverified";
                    }
                }
                // <a href='"+data[1]+"' target='_blank'>Check Proof</a>
                content +=
                    "<tr><td>" +
                    data[5] +
                    "</td><td>Rs." +
                    data[0] +
                    "</td><td><button class='btn btn-primary' onClick=\"openNewTab('" +
                    data[1] +
                    "')\">Check Proof</button></td>" +
                    "<td>" +
                    data[3] +
                    "</td><td><b>Updated By: </b>" +
                    data[6] +
                    "<hr>" +
                    data[2] +
                    "</td><td>" +
                    status +
                    "</td><td><button onclick='deletePayment(" +
                    parseInt(data[5]) +
                    "," +
                    id +
                    ")'>DELETE</button></td></tr>";
            }
            document.getElementById("allProjectPayment").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>" + amount + "</div>";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function openNewTab(data) {
    var url = "https://teamka.in/crm/" + data;
    var target = "_blank";
    console.log("url", url);
    if (window.cordova) {
        cordova.InAppBrowser.open(url, target, "");
    } else {
        window.open(url, target);
    }
}

function verifyPayment(id, pd_id) {
    if (confirm("Verify Payment")) {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: { operation: "035", id: id },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    paymentVerifyMail(pd_id, id);
                    alert("Payment Verified");
                    getAllProjectPayment(pd_id);
                } else {
                    alert("Server Error");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function deletePayment(id, pd_id) {
    alert("Cannot Delete a Payment Info");
    /*
    if(confirm("Delete Payment")){

          $('.loader').show();
        $.ajax({
            url:api_url,
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

function rawDataCheck() {
    var content =
        "<div class='container'><center><h1>Raw Data Grocery Checked</h1></center><table id='rawDataTableChecked' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th><th>Status</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
        data: { type: "0007" },
        success: function (response) {
            $(".loader").hide();
            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"

                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable'>" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[2] +
                    ")'>Copy</button></td><td>" +
                    data[5] +
                    "</td><td>" +
                    data[6] +
                    "</td><td>" +
                    data[7] +
                    "</td><td id='" +
                    data[0] +
                    "'>" +
                    getGroceryStatus(data[2], data[0]) +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTableChecked").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function rawDataServiceCheck() {
    var content =
        "<div class='container'><center><h1>Raw Data Service</h1><button class='btn btn-secondary' onclick='rawDataServiceCheck()'>Check contact history</button></center><table id='rawDataTableChecked' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th><th>Status</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://softwarezsolution.com/app/KalamServices/admin/api/api.php",
        data: { type: "0006" },
        success: function (response) {
            $(".loader").hide();
            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td><td id='"+data[0]+"'>"+getGroceryStatus(data[2],data[0])+"</td></tr>"

                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class=''>" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[2] +
                    ")'>Copy</button></td><td>" +
                    data[5] +
                    "</td><td>" +
                    data[6] +
                    "</td><td>" +
                    data[7] +
                    "</td><td id='" +
                    data[0] +
                    "'>" +
                    getGroceryStatus(data[2], data[0]) +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTableChecked").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getGroceryStatus(num, id) {
    $(".loader").show();
    num.trim();
    var value = $.ajax({
        url: api_url,
        data: { operation: "0058", num: num },
        async: false,
    }).responseText;
    console.log(value);
    $(".loader").hide();
    if (value > 0) {
        return "<b style='color:green'>Lead</b>";
    } else {
        return "<b style='color:red;'>Not Leads</b>";
    }
}

function rawData() {
    var content =
        "<div class='container'><center><h1>Raw Data Grocery</h1><button class='btn btn-secondary' onclick='rawDataCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
        data: { type: "0006" },
        success: function (response) {
            $(".loader").hide();
            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[2] +
                    ")'>Copy</button></td><td>" +
                    data[5] +
                    "</td><td>" +
                    data[6] +
                    "</td><td>" +
                    data[7] +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function maildataGrocery() {
    var content =
        "<div class='container'><center><h1>Mail Data Grocery</h1><button class='btn btn-secondary' onclick='maildataGroceryCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00102", forq: "Grocery" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>n/a</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function maildataGroceryCheck() {
    var content =
        "<div class='container'><center><h1>Mail Data Grocery</h1><button class='btn btn-secondary' onclick='maildataGroceryCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th><th>Lead Status</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00103", forq: "Grocery" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>n/a</td><td>" +
                    getGroceryStatus(data[3], data[0]) +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function maildataDMCourse() {
    var content =
        "<div class='container'><center><h1>Mail Data DM Course</h1><button class='btn btn-secondary' onclick='MailDataCheckDMCourse()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00102", forq: "DMCourse" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>n/a</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function MailDataCheckDMCourse() {
    var content =
        "<div class='container'><center><h1>Mail Data DM Course</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th><th>Status</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00102", forq: "DMCourse" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>n/a</td><td>" +
                    getGroceryStatus(data[3], data[0]) +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function maildataService() {
    var content =
        "<div class='container'><center><h1>Mail Data Service</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00102", forq: "Service" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>n/a</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function MailDataCheckService() {
    var content =
        "<div class='container'><center><h1>Mail Data Service</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th><th>Status</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00102", forq: "Service" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>n/a</td><td>" +
                    getGroceryStatus(data[3], data[0]) +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function maildataGroceryCaller() {
    var content =
        "<div class='container'><center><h1>Mail Data Grocery</h1><button class='btn btn-secondary' onclick='maildataGroceryCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00103", forq: "Grocery" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>" +
                    data[4] +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function maildataServiceCaller() {
    //alert("Contact Admin");
    var content =
        "<div class='container'><center><h1>Mail Data Service</h1><button class='btn btn-secondary' onclick='MailDataCheckService()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Date</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00103", forq: "Service" },
        success: function (response) {
            $(".loader").hide();

            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"
                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable' >" +
                    data[3] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[3] +
                    ")'>Copy</button></td><td class='unselectable' >" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(`" +
                    data[2] +
                    "`)'>Copy</button></td><td>" +
                    data[4] +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function rawDataService() {
    var content =
        "<div class='container'><center><h1>Raw Data Service</h1><button class='btn btn-secondary' onclick='rawDataServiceCheck()'>Check contact history</button></center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://softwarezsolution.com/app/KalamServices/admin/api/api.php",
        data: { type: "0006" },
        success: function (response) {
            $(".loader").hide();
            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                // content += "<tr><td>"+data[0]+"</td><td>"+data[1]+"</td><td onclick='shownumber(`"+data[2]+"`,`"+data[0]+"`)' id=shwnum"+data[0]+">Show Number</td><td>"+data[5]+"</td><td>"+data[6]+"</td><td>"+data[7]+"</td></tr>"

                content +=
                    "<tr><td>" +
                    data[0] +
                    "</td><td>" +
                    data[1] +
                    "</td><td class='unselectable'>" +
                    data[2] +
                    "<button class='ml-3' onclick='copyNo(" +
                    data[2] +
                    ")'>Copy</button></td><td>" +
                    data[5] +
                    "</td><td>" +
                    data[6] +
                    "</td><td>" +
                    data[7] +
                    "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function copyNo(no) {
    // alert("Copy from here: " + no);
    const el = document.createElement("textarea");
    el.value = no;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Copied to clipboard");
}

function shownumber(num, id) {
    $("#shwnum" + id).html(num);
}
function rawDataforCaller() {
    // rawData();
    var content =
        "<div class='container'><center><h1>Raw Data</h1> <button class='btn btn-secondary' onclick='rawDataCheck()'>Check contact history</button> </center><table id='rawDataTable' class='table table-striped table-bordered'><thead><th>ID</th><th>Name</th><th>Mobile</th><th>DOR</th><th>Uses</th><th>Last Used</th></thead><tbody>";
    $(".loader").show();
    $.ajax({
        type: "POST",
        url: "https://softwarezsolution.com/app/SampleEComApp/admin/api/forcrm.php",
        data: { type: "0007" },
        success: function (response) {
            $(".loader").hide();
            var element = JSON.parse(response);
            for (let i = 0; i < element.length; i++) {
                var data = element[i];
                content +=
                    "<tr><td>" + data[0] + "</td><td>" + data[1] + "</td><td>" + data[2] + "</td><td>" + data[5] + "</td><td>" + data[6] + "</td><td>" + data[7] + "</td></tr>";
            }

            document.getElementById("displayContent").innerHTML = content + "</tbody></table></div>";
            $("#rawDataTable").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function rawDataforCallerService() {
    //alert("Contact Admin");
    rawDataService();
}

function getUnverifiedPayment() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "04100" },
        success: function (response) {
            $(".loader").hide();
            console.log(response);
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<table id='tableVerifyPayment' class='mt-5 table table-striped table-bordered'><thead><th>Project Name</th><th>Lead Name</th><th>Amount</th><th>Proof</th><th>Remark</th><th>DOR</th><th>VERIFY</th><th>DELETE</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var element = partial[i].split("<-->");
                var test = element[9];
                if (parseInt(element[8]) == 0) {
                    content +=
                        "<tr><td>" +
                        element[2] +
                        "</td><td>" +
                        element[3] +
                        "</td><td>" +
                        element[4] +
                        "</td><td><a href='" +
                        element[5] +
                        "' target='_blank'><b>Cilck here</b></a></td><td><b>Updated By: </b>" +
                        test +
                        "<hr>" +
                        element[6] +
                        "</td><td>" +
                        element[7] +
                        "</td><td><button onclick='unverifiedVerify(" +
                        element[0] +
                        ")'>VERIFY</button></td><td><button onclick='unverifiedDelete(" +
                        element[0] +
                        ")'>DELETE</button></td></tr>";
                } else if (parseInt(element[8]) == 1) {
                    content +=
                        "<tr><td>" +
                        element[2] +
                        "</td><td>" +
                        element[3] +
                        "</td><td>" +
                        element[4] +
                        "</td><td><a href='" +
                        element[5] +
                        "' target='_blank'><b>Cilck here</b></a></td><td><b>Updated By: </b>" +
                        test +
                        "<hr>" +
                        element[6] +
                        "</td><td>" +
                        element[7] +
                        "</td><td>Verified</td><td><button onclick='unverifiedDelete(" +
                        element[0] +
                        ")'>DELETE</button></td></tr>";
                }
            }
            document.getElementById("displayContent").innerHTML = "<h1>Payments</h1><div class='container' style='overflow-x:scroll;'>" + content + "</tbody></table></div>";
            $("#tableVerifyPayment").DataTable({ stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function unverifiedVerify(id) {
    if (confirm("Verify Payment ?")) {
        $(".loader").show();
        id = parseInt(id);
        $.ajax({
            url: api_url,
            data: { operation: "042", id: id },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Payment Verified");
                    getUnverifiedPayment();
                } else {
                    alert("Server Error");
                    console.log(response);
                    getUnverifiedPayment();
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function unverifiedDelete(id) {
    alert("Button Disabled");
}

function getSearchedLead() {
    var displayContent = document.getElementById("displayContent");
    if (!displayContent) {
        console.error("Element with ID 'displayContent' not found.");
        return;
    }
    displayContent.innerHTML = "";

    var credential = document.getElementById("searchLeadBy").value;
    if (credential.length < 3) {
        alert("Enter Atleast 3 digit or email or mobile to search");
    } else {
        //$('.loader').show();
        var content;
        var x = 0;
        var y = 0;
        // srch_sts;
        //$('#srch_sts').html("Searching..");
        var edtbtn = "";

        $.ajax({
            url: api_url,
            data: { operation: "044", credential: credential },
            success: function (response) {
                // $('.loader').hide();
                // console.log(response);
                var partialArranged = response.split("<END>");
                content =
                    '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
                var totalUpdates = partialArranged.length - 1;
                var tableId = "table1";

                for (let index = 1; index <= totalUpdates; index++) {
                    var element = partialArranged[index - 1];
                    var part = element.split("<-->");
                    if (localStorage.getItem("userType") == "TL") {
                        // for tl show edit button in leads
                        edtbtn = '<button data-toggle="modal" data-target="#exampleModal3" onclick="fillUpdateForm(' + part[0] + ')">Edit</button>';
                    }
                    x = 1;
                    content += `
                                 <tr>
                                     <th scope="row">${part[0]}</th>
                                     <td>${part[1]}</td>
                                     <td>
                                         <a href="javascript:void(0)" onclick="makeCallMulti('${part[1]}','${part[0]}','${part[2]}', '${index}', '${tableId}')">${part[2]}</a><br>
                                         <a href="javascript:void(0)" onclick="makeCallMulti('${part[1]}','${part[0]}','${part[3]}', '${index}', '${tableId}')">${part[3]}</a><br>
                                         <a href="https://api.whatsapp.com/send?phone=91${part[4]}">${part[4]}</a><br>
                                         ${part[5]}<br>
                                         <button style="display:none" id="save-id-${tableId}-${index}" data-toggle="modal" data-target="#exampleModal4" data-whatever="${part[0]}" onclick="stopRecordMulti('${part[0]}', '${index}', '${tableId}')">End Call</button>
                                   </td>
                                   <td>${part[11]}<br>${part[12]}</td>
                                   <td>${part[6]}</td>
                                   <td>${part[7]}</td>
                                   <td>${part[8]}</td>
                                   <td>${part[9]}</td>
                                   <td>
                                       <button data-toggle="modal" data-target="#exampleModal4" data-whatever="${part[0]}" onclick="getAllStatus(${part[0]})">Status</button>
                                   </td>
                                   <td>${part[10]}</td>
                               </tr>
                           `;

                    // }
                }
                content += "</tbody></table></div><br>";
                document.getElementById("displayContent").insertAdjacentHTML("beforeend", "<h1 class='mt-5'>Lead Search Results</h1><div style='overflow-x:scroll;'>" + content);
                $("#table1").DataTable({ order: [[0, "desc"]], stateSave: true });
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });

        $.ajax({
            url: api_url,
            data: { operation: "076", SearchText: credential },
            success: function (response) {
                //console.log(response);
                var partialArranged = response.split("/END/");
                var content1 =
                    '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
                var totalUpdates = partialArranged.length - 1;

                for (let index = 1; index <= totalUpdates; index++) {
                    var element = partialArranged[index - 1];
                    var part = element.split("<-->");
                    if (part[14] == "No dues") {
                        content1 +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[16] +
                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[15] +
                            "', " +
                            index +
                            ')">' +
                            part[15] +
                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[18] +
                            "', " +
                            index +
                            ')">' +
                            part[18] +
                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[19] +
                            '">' +
                            part[19] +
                            '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[17] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[17] +
                            '","' +
                            index +
                            '")>End Call</button></td><td>' +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td><td>' +
                            part[6] +
                            '</td><td style="background-color:green;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                            part[17] +
                            ')" data-whatever="' +
                            part[17] +
                            '">Status</button></td></td></tr>';
                    } else if (part[14] == "No payment details") {
                        content1 +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[16] +
                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[15] +
                            "', " +
                            index +
                            ')">' +
                            part[15] +
                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[18] +
                            "', " +
                            index +
                            ')">' +
                            part[18] +
                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[19] +
                            '">' +
                            part[19] +
                            '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[17] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[17] +
                            '","' +
                            index +
                            '")>End Call</button></td><td>' +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td></td><td>' +
                            part[6] +
                            '</td><td style="background-color:red;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                            part[17] +
                            ')" data-whatever="' +
                            part[17] +
                            '">Status</button></td></td></tr>';
                    } else {
                        content1 +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[16] +
                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[15] +
                            "', " +
                            index +
                            ')">' +
                            part[15] +
                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[18] +
                            "', " +
                            index +
                            ')">' +
                            part[18] +
                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[19] +
                            '">' +
                            part[19] +
                            '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[17] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[17] +
                            '","' +
                            index +
                            '")>End Call</button></td><td>' +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td></td><td>' +
                            part[6] +
                            "</td><td>" +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                            part[17] +
                            ')" data-whatever="' +
                            part[17] +
                            '">Status</button></td></td></tr>';
                    }
                }

                document
                    .getElementById("displayContent")
                    .insertAdjacentHTML("beforeend", "<h1 class='mt-5'>Project Details</h1><div style='overflow-x:scroll;'>" + content1 + "</tbody></table>");
                $("#tableProjects").DataTable({
                    order: [[7, "desc"]],
                    stateSave: true,
                });
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
            async: false,
        });
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

function projectRenewals() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "056" },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("/END/");
            var content =
                '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                var dor = part[10];
                var monthReal = parseInt(dor.split("-")[1]);
                var yearReal = parseInt(dor.split("-")[0]);
                if ((parseInt(year) == yearReal + 1 && monthReal <= parseInt(month)) || yearReal + 1 < parseInt(year)) {
                    if (part[14] == "No dues") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button onclick="renewalMail(' +
                            part[0] +
                            ')">REQUEST RENEWAL</button></td><td>' +
                            part[6] +
                            '</td><td style="background-color:green;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    } else if (part[14] == "No payment details") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button onclick="renewalMail(' +
                            part[0] +
                            ')">REQUEST RENEWAL</button></td><td>' +
                            part[6] +
                            '</td><td style="background-color:red;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    } else {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button onclick="renewalMail(' +
                            part[0] +
                            ')">REQUEST RENEWAL</button></td><td>' +
                            part[6] +
                            "</td><td>" +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    }
                }
            }
            document.getElementById("displayContent").innerHTML =
                "<h1>Renewal Required</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table><div class='container mt-5' id='renewedList'></div>";
            $("#tableProjects").DataTable({ order: [[7, "desc"]], stateSave: true });
            renewedList();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function renewalMail(id) {
    var today = new Date();
    var yyyy = today.getFullYear();
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "057", id: id },
        success: function (response) {
            $(".loader").hide();
            if (response == 0) {
                alert("Email Not Provided");
            } else if (response == 2) {
                alert("Server Error");
            } else {
                var data = response.split("<-->");
                var expiry = data[5].split(",")[0];
                expiry += ", " + yyyy;

                var message =
                    "Hi " +
                    data[1] +
                    ",<br><b>Customer ID: " +
                    data[3] +
                    "</b><br><br>Your Project <b>" +
                    data[2] +
                    "</b> with Project ID: " +
                    data[4] +
                    " Dated: " +
                    data[5] +
                    " is up for Renewal. Please pay the remaining dues on or before the expiry date to continue uninterrupted service.<br><b>Expiry Date :" +
                    expiry +
                    "</b><br><br>Regards<br>" +
                    data[6] +
                    "<br>" +
                    data[7] +
                    "<br><b>Kalam Academy</b><br><font color='red'><b>We never ask you to pay in any individual account Only pay in <i><u>GreenTech India</u></i> account (A/C: 481520110000299 | IFSC: BKID0004815 GooglePay & Phone/Pay Number: 8092805068) </b></font>";
                sendRenewalMail(data[0], message);
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function sendRenewalMail(to, message) {
    var subject = "Project Renewal Reminder";

    $(".loader").show();
    $.ajax({
        type: "post",
        url: "https://kalamacademy.org/test/test.php",
        data: { operation: "00100", to: to, subject: subject, message: message },
        success: function (response) {
            $(".loader").hide();
            alert("Mail Sent");
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function renewedList() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "055" },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("/END/");
            var content =
                '<table id="renewalList" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                var dor = part[10];
                var monthReal = parseInt(dor.split("-")[1]);
                var yearReal = parseInt(dor.split("-")[0]);
                if ((parseInt(year) == yearReal + 1 && monthReal <= parseInt(month)) || parseInt(year) > yearReal + 1) {
                    if (part[14] == "No dues") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            "</td><td>" +
                            part[6] +
                            '</td><td style="background-color:green;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    } else if (part[14] == "No payment details") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            "</td><td>" +
                            part[6] +
                            '</td><td style="background-color:red;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    } else {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[15] +
                            "<br>" +
                            part[16] +
                            "</td><td>" +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            "</td><td>" +
                            part[6] +
                            "</td><td>" +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalEditProject" onclick="fillUpdateProjectForm(' +
                            part[0] +
                            ')">Edit</button><br><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBilling(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPayment(' +
                            part[0] +
                            ')">Payment</button></td></td></tr>';
                    }
                }
            }
            document.getElementById("renewedList").innerHTML = "<h1>Renewal Added</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table></div>";
            $("#renewalList").DataTable();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getStats() {
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;
    var statsFor = document.getElementById("statsFor").value;

    $(".loader").show();
    $.ajax({
        url: api_url,
        data: {
            operation: "046",
            startDate: startDate,
            endDate: endDate,
            statsFor: statsFor,
        },
        success: function (response) {
            $(".close").click();
            $(".loader").hide();
            if (response == "dateError") {
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            } else {
                var element = response.split("<-->");
                var billing = parseInt(element[0]);
                var payment = parseInt(element[1]);

                document.getElementById("displayContent").innerHTML =
                    "<h1>STATISTICS</h1><div class='row'><div class='col-6'><h4>Start Date: " +
                    startDate +
                    "</h4></div><div class='col-6'><h4>End Date: " +
                    endDate +
                    "</h4></div></div><hr><div class='row'><div class='col-4'><h3 style='color:red;' >Billing Amount : " +
                    billing +
                    "</h3></div><div class='col-4'><h3 style='color:green;'>Payment Recieved : " +
                    payment +
                    "</h3></div><div class='col-4'><h3 style='color:red;'>Dues : " +
                    (billing - payment) +
                    "</h3></div></div><hr><div class='mt-5 row'><div class='col-lg-12'><div id='statsDisplayGraph1'></div><div id='statsDisplay1'></div></div><div class='col-lg-12'><h1>TEAM STATISTICS</h1><div id='statsDisplayGraph2'></div><div id='statsDisplay2' class='mt-5'></div></div></div> <div class='col-lg-12'><h1>CALL STATISTICS</h1><div id='statsDisplay3' class='mt-5'></div></div>";
                getBusinessStats(startDate, endDate, statsFor);
                getConvertedStats(startDate, endDate, statsFor);
                CheckCallWaiseStatus(startDate, endDate);
                document.getElementById("errorDetailsStats").innerHTML = "";
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getStatsTL() {
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;
    var statsFor = document.getElementById("statsFor").value;

    $(".loader").show();
    $.ajax({
        url: api_url,
        data: {
            operation: "046",
            startDate: startDate,
            endDate: endDate,
            statsFor: statsFor,
        },
        success: function (response) {
            $(".close").click();
            $(".loader").hide();
            if (response == "dateError") {
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            } else {
                var element = response.split("<-->");
                var billing = parseInt(element[0]);
                var payment = parseInt(element[1]);

                document.getElementById("displayContent").innerHTML =
                    "<h1>STATISTICS</h1><div class='row'><div class='col-6'><h4>Start Date: " +
                    startDate +
                    "</h4></div><div class='col-6'><h4>End Date: " +
                    endDate +
                    "</h4></div></div><hr><div class='row'><div class='col-4'><!--<h3 style='color:red;' >Billing Amount : " +
                    billing +
                    "</h3></div><div class='col-4'><h3 style='color:green;'>Payment Recieved : " +
                    payment +
                    "</h3></div>--><div class='col-4'><h3 style='color:red;'>Dues : " +
                    (billing - payment) +
                    "</h3></div></div><hr><div class='mt-5 row'><div class='col-lg-12'><div id='statsDisplayGraph1'></div><div id='statsDisplay1'></div></div><div class='col-lg-12'><h1>TEAM STATISTICS</h1><div id='statsDisplayGraph2'></div><div id='statsDisplay2' class='mt-5'></div></div></div> <div class='col-lg-12'><h1>CALL STATISTICS</h1><div id='statsDisplay3' class='mt-5'></div></div>";
                getBusinessStats(startDate, endDate, statsFor);
                getConvertedStats(startDate, endDate, statsFor);
                CheckCallWaiseStatus(startDate, endDate);
                document.getElementById("errorDetailsStats").innerHTML = "";
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getBusinessStats(startDate, endDate, statsFor) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: {
            operation: "047",
            startDate: startDate,
            endDate: endDate,
            statsFor: statsFor,
        },
        success: function (response) {
            $(".loader").hide();
            if (response == "dateError") {
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            } else {
                var content =
                    "<h1>BUSINESS STATISTICS</h1><table id='statsTable1' class='table table-striped table-bordered'><thead><th>Project ID</th><th>User's Name</th><th>Billing</th><th>Payment</th><th>Dues</th><th>Caller Name</th><th>DOR</th><th>Project Type</th></thead><tbody>";
                var element = response.split("/END/");
                var length = element.length - 1;
                var s1, s2, ticks;
                for (let i = 0; i < length; i++) {
                    var data = element[i].split("<-->");

                    content +=
                        "<tr><td>" +
                        data[1] +
                        "</td><td>" +
                        data[0] +
                        "</td><td>" +
                        data[2] +
                        "</td><td>" +
                        data[3] +
                        "</td><td>" +
                        data[4] +
                        "</td><td>" +
                        data[5] +
                        "</td><td>" +
                        data[6] +
                        "</td><td>" +
                        data[7] +
                        "</td></tr>";
                }
                document.getElementById("errorDetailsStats").innerHTML = "";
                document.getElementById("statsDisplay1").innerHTML = content + "</tbody></table>";
                $("#statsTable1").DataTable();
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getConvertedStats(startDate, endDate, statsFor) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: {
            operation: "048",
            startDate: startDate,
            endDate: endDate,
            statsFor: statsFor,
        },
        success: function (response) {
            $(".loader").hide();
            if (response == "dateError") {
                document.getElementById("errorDetailsStats").innerHTML = "End Date Should be After Start Date";
            } else {
                var content =
                    "<table id='statsTable2' class='table table-striped table-bordered'><thead><th>Name</th><th>Converted</th><th>Calls Made</th><th>Not Connected Calls</th><th>Connected Calls</th><th>Calls Duration</th><th>Billing</th><th>Dues</th><th>Break Time</th></thead><tbody>";
                var element = response.split("/END/");
                var length = element.length - 1;
                var s1 = [],
                    s2 = [],
                    ticks = [];
                for (let i = 0; i < length; i++) {
                    var data = element[i].split("<-->");
                    s1[i] = parseInt(data[2]);
                    s2[i] = parseInt(data[3]);
                    ticks[i] = data[1];
                    content +=
                        "<tr><td>" +
                        data[1] +
                        "</td><td>" +
                        data[2] +
                        "</td><td>" +
                        data[3] +
                        "</td><td>" +
                        data[4] +
                        "</td><td>" +
                        data[5] +
                        "</td><td>" +
                        data[6] +
                        "</td><td>" +
                        data[7] +
                        "</td><td>" +
                        data[8] +
                        "</td><td>" +
                        data[9] +
                        "</td></tr>";
                }
                console.log(s1);
                console.log(s2);
                console.log(ticks);
                plot2 = $.jqplot("statsDisplayGraph2", [s1, s2], {
                    animate: !$.jqplot.use_excanvas,
                    seriesDefaults: {
                        renderer: $.jqplot.BarRenderer,
                        pointLabels: { show: true },
                    },
                    legend: {
                        show: true,
                        location: "ne",
                        labels: ["Converted", "Calls"],
                        placement: "inside",
                    },
                    axes: {
                        xaxis: {
                            renderer: $.jqplot.CategoryAxisRenderer,
                            ticks: ticks,
                        },
                    },
                });

                $("#statsDisplayGraph2").bind("jqplotDataHighlight", function (ev, seriesIndex, pointIndex, data) {
                    $("#info2").html("series: " + seriesIndex + ", point: " + pointIndex + ", data: " + data);
                });

                $("#statsDisplayGraph2").bind("jqplotDataUnhighlight", function (ev) {
                    $("#info2").html("Nothing");
                });

                document.getElementById("errorDetailsStats").innerHTML = "";
                document.getElementById("statsDisplay2").innerHTML = content + "</tbody></table>";
                $("#statsTable2").DataTable();
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Notification

function notificationAdmin() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "049" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<div class='container'><h1>CALLER NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='noBillPaymentNotify'></div><div class='col-xl-6 mt-5' id='withDuesNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                content +=
                    "<tr><td>(" +
                    data[0] +
                    ") " +
                    data[1] +
                    "<br>(" +
                    data[2] +
                    ")</td><td>" +
                    data[3] +
                    "<br>" +
                    data[4] +
                    "</td><td>" +
                    data[7] +
                    "<br>" +
                    data[8] +
                    "<br>" +
                    data[9] +
                    "</td></tr>";
            }
            content += "</tbody></table></div></div></div>";
            document.getElementById("displayContent").innerHTML = content;
            $("#callerNotification1").DataTable();
            noBillingNotification();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function noBillingNotification() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "050" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >No Billing and Payment</h1></center><table class='table table-striped table-bordered' id='callerNotification2'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                content +=
                    "<tr><td>(" + data[0] + ")" + data[1] + "<br>(" + data[2] + ")</td><td>" + data[3] + "<br>" + data[4] + "</td><td>" + data[6] + "<br>" + data[7] + "</td></tr>";
            }
            content += "</tbody></table>";
            document.getElementById("noBillPaymentNotify").innerHTML = content;
            $("#callerNotification2").DataTable();
            noDuesNotification();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function noDuesNotification() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "051" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >Pending Dues</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                content +=
                    "<tr><td>(" +
                    data[0] +
                    ")" +
                    data[1] +
                    "<br>(" +
                    data[2] +
                    ")<br>Dues: " +
                    data[8] +
                    "</td><td>" +
                    data[3] +
                    "<br>" +
                    data[4] +
                    "</td><td>" +
                    data[6] +
                    "<br>" +
                    data[7] +
                    "</td></tr>";
            }
            content += "</tbody></table>";
            document.getElementById("withDuesNotify").innerHTML = content;
            $("#callerNotification3").DataTable();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Notification as Caller

function notificationCaller() {
    var caller_id = parseInt(localStorage.getItem("userID"));
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "049" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<div class='container'><h1> NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='noBillPaymentNotify'></div><div class='col-xl-6 mt-5' id='withDuesNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (caller_id == parseInt(data[5]) || caller_id == parseInt(data[6])) {
                    content +=
                        "<tr><td>(" +
                        data[0] +
                        ") " +
                        data[1] +
                        "<br>(" +
                        data[2] +
                        ")</td><td>" +
                        data[3] +
                        "<br>" +
                        data[4] +
                        "</td><td>" +
                        data[7] +
                        "<br>" +
                        data[8] +
                        "<br>" +
                        data[9] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table></div></div></div>";
            document.getElementById("displayContent").innerHTML = content;
            $("#callerNotification1").DataTable();
            noBillingNotificationCaller();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function noBillingNotificationCaller() {
    var caller_id = parseInt(localStorage.getItem("userID"));
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "050" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >No Billing and Payment</h1></center><table class='table table-striped table-bordered' id='callerNotification2'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (caller_id == parseInt(data[5])) {
                    content +=
                        "<tr><td>(" +
                        data[0] +
                        ")" +
                        data[1] +
                        "<br>(" +
                        data[2] +
                        ")</td><td>" +
                        data[3] +
                        "<br>" +
                        data[4] +
                        "</td><td>" +
                        data[6] +
                        "<br>" +
                        data[7] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table>";
            document.getElementById("noBillPaymentNotify").innerHTML = content;
            $("#callerNotification2").DataTable();
            noDuesNotificationCaller();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function noDuesNotificationCaller() {
    var caller_id = parseInt(localStorage.getItem("userID"));
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "051" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >Pending Dues</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (caller_id == parseInt(data[5])) {
                    content +=
                        "<tr><td>(" +
                        data[0] +
                        ")" +
                        data[1] +
                        "<br>(" +
                        data[2] +
                        ")<br>Dues : " +
                        data[8] +
                        "</td><td>" +
                        data[3] +
                        "<br>" +
                        data[4] +
                        "</td><td>" +
                        data[6] +
                        "<br>" +
                        data[7] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table>";
            document.getElementById("withDuesNotify").innerHTML = content;
            $("#callerNotification3").DataTable();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Developer Notification

function notifyDeveloperAdmin() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "052" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<div class='container'><h1>DEVELOPER NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='UploadPlaystoreNotify'></div><div class='col-xl-6 mt-5' id='newProjNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                content +=
                    "<tr><td>(" +
                    data[0] +
                    ") " +
                    data[1] +
                    "<br>(" +
                    data[2] +
                    ")</td><td>" +
                    data[3] +
                    "<br>" +
                    data[4] +
                    "</td><td>" +
                    data[7] +
                    "<br>" +
                    data[8] +
                    "<br>" +
                    data[9] +
                    "</td></tr>";
            }
            content += "</tbody></table></div></div></div>";
            document.getElementById("displayContent").innerHTML = content;
            $("#callerNotification1").DataTable();
            uploadPlaystore();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function uploadPlaystore() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "053" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >Uploaded to Playstore</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                content +=
                    "<tr><td>(" +
                    data[0] +
                    ") " +
                    data[1] +
                    "<br>(" +
                    data[2] +
                    ")</td><td>" +
                    data[3] +
                    "<br>" +
                    data[4] +
                    "</td><td>" +
                    data[7] +
                    "<br>" +
                    data[8] +
                    "<br>" +
                    data[9] +
                    "</td></tr>";
            }
            content += "</tbody></table>";
            document.getElementById("UploadPlaystoreNotify").innerHTML = content;
            $("#callerNotification1").DataTable();
            newProjectNotification();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function newProjectNotification() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "054" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >New Projects</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                content +=
                    "<tr><td>(" + data[0] + ")" + data[1] + "<br>(" + data[2] + ")</td><td>" + data[3] + "<br>" + data[4] + "</td><td>" + data[6] + "<br>" + data[7] + "</td></tr>";
            }
            content += "</tbody></table>";
            document.getElementById("newProjNotify").innerHTML = content;
            $("#callerNotification3").DataTable();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function notifyDeveloper() {
    var dev_id = parseInt(localStorage.getItem("userID"));
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "052" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<div class='container'><h1>DEVELOPER NOTIFICATION</h1><div class='row'><div class='col-xl-6 mt-5' id='UploadPlaystoreNotify'></div><div class='col-xl-6 mt-5' id='newProjNotify'></div><div class='col-xl-12 mt-5'><center><h1 style='color:red;' >Send For Testing</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (dev_id == data[5]) {
                    content +=
                        "<tr><td>(" +
                        data[0] +
                        ") " +
                        data[1] +
                        "<br>(" +
                        data[2] +
                        ")</td><td>" +
                        data[3] +
                        "<br>" +
                        data[4] +
                        "</td><td>" +
                        data[7] +
                        "<br>" +
                        data[8] +
                        "<br>" +
                        data[9] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table></div></div></div>";
            document.getElementById("displayContent").innerHTML = content;
            $("#callerNotification1").DataTable();
            uploadPlaystoreDeveloper();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function uploadPlaystoreDeveloper() {
    var dev_id = parseInt(localStorage.getItem("userID"));
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "053" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >Uploaded to Playstore</h1></center><table class='table table-striped table-bordered' id='callerNotification1'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>UpdatedBy/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (dev_id == data[5]) {
                    content +=
                        "<tr><td>(" +
                        data[0] +
                        ") " +
                        data[1] +
                        "<br>(" +
                        data[2] +
                        ")</td><td>" +
                        data[3] +
                        "<br>" +
                        data[4] +
                        "</td><td>" +
                        data[7] +
                        "<br>" +
                        data[8] +
                        "<br>" +
                        data[9] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table>";
            document.getElementById("UploadPlaystoreNotify").innerHTML = content;
            $("#callerNotification1").DataTable();
            newProjectNotificationDeveloper();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function newProjectNotificationDeveloper() {
    var dev_id = parseInt(localStorage.getItem("userID"));
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "054" },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var content =
                "<center><h1 style='color:red;' >New Projects</h1></center><table class='table table-striped table-bordered' id='callerNotification3'><thead><th>Project ID/<br>Project Name/<br>Lead Name</th><th>Contact</th><th>Caller/<br>Developer</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (dev_id == data[5]) {
                    content +=
                        "<tr><td>(" +
                        data[0] +
                        ")" +
                        data[1] +
                        "<br>(" +
                        data[2] +
                        ")</td><td>" +
                        data[3] +
                        "<br>" +
                        data[4] +
                        "</td><td>" +
                        data[6] +
                        "<br>" +
                        data[7] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table>";
            document.getElementById("newProjNotify").innerHTML = content;
            $("#callerNotification3").DataTable();
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function supportTicket() {
    var id = parseInt(localStorage.getItem("userID"));
    localStorage.setItem("Admin_ID", id);
    window.location.href = "./support/admin.html";
}

// Support Executive

// Show All Leads
function allLeadsSupport() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "004" },
        success: function (response) {
            $(".loader").hide();
            var partialArranged = response.split("<END>");
            var content =
                '<table id="table1" class="table table-bordered table-striped"><thead><tr><th scope="col">Lead ID</th><th scope="col">Name</th><th scope="col">Mobile/<br>Alternate/<br>Whatsapp/<br>Email</th><th scope="col">State/<br>City</th><th scope="col">Interested In</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">DOR</th><th scope="col">Option</th><th scope="col">Caller</th></tr></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                if (part[8] == "New") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        "</td><td>" +
                        part[2] +
                        "<br>" +
                        part[3] +
                        "<br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        "</td><td>" +
                        part[11] +
                        "<br>" +
                        part[12] +
                        "</td><td>" +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:red;color:white;" >' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatusSupport(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else if (part[8] == "Converted") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        "</td><td>" +
                        part[2] +
                        "<br>" +
                        part[3] +
                        "<br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        "</td><td>" +
                        part[11] +
                        "<br>" +
                        part[12] +
                        "</td><td>" +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:green;color:white;" >' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatusSupport(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else if (part[8] == "Proposail Mailed") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        "</td><td>" +
                        part[2] +
                        "<br>" +
                        part[3] +
                        "<br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        "</td><td>" +
                        part[11] +
                        "<br>" +
                        part[12] +
                        "</td><td>" +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:yellow;color:black;" >' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatusSupport(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else if (part[8] == "Pending") {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        "</td><td>" +
                        part[2] +
                        "<br>" +
                        part[3] +
                        "<br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        "</td><td>" +
                        part[11] +
                        "<br>" +
                        part[12] +
                        "</td><td>" +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:orange;color:white;" >' +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatusSupport(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                } else {
                    content +=
                        '<tr><th scope="row">' +
                        part[0] +
                        "</th><td>" +
                        part[1] +
                        "</td><td>" +
                        part[2] +
                        "<br>" +
                        part[3] +
                        "<br>" +
                        part[4] +
                        "<br>" +
                        part[5] +
                        "</td><td>" +
                        part[11] +
                        "<br>" +
                        part[12] +
                        "</td><td>" +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        "</td><td>" +
                        part[8] +
                        "</td><td>" +
                        part[9] +
                        '</td><td><button data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                        part[0] +
                        '" onclick="getAllStatusSupport(' +
                        part[0] +
                        ')">Status</button></td><td>' +
                        part[10] +
                        "</td></tr>";
                }
            }
            content += "</tbody></table></div>";
            document.getElementById("displayContent").innerHTML = "<h1>All Leads</h1><div style='overflow-x:scroll;'>" + content;
            $("#table1").DataTable({ order: [[0, "desc"]], stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

//Get All Status
function getAllStatusSupport(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "009", id: id },
        success: function (response) {
            $(".loader").hide();
            var info = response.split("/END/");
            var content = "<table class='table table-bordered table-striped'><thead><th>Called By</th><th>On</th><th>Summary</th><th>Next Call</th></thead><tbody>";
            for (let i = 0; i < info.length - 1; i++) {
                var element = info[i];
                var part = element.split("<-->");
                content +=
                    "<tr><td>" + part[0] + "</td><td>" + part[1].split(" ")[0] + "<br>" + part[1].split(" ")[1] + "</td><td>" + part[2] + "</td><td>" + part[3] + "</td></tr>";
            }
            if (localStorage.getItem("userType") == "Admin") {
                document.getElementById("allStatus").innerHTML = content + "</tbody></table><div class='container' id='mailOption'></div>";
            } else if (localStorage.getItem("userType") == "Caller") {
                document.getElementById("allStatus").innerHTML = content + "</tbody></table><div class='container' id='mailOption'></div>";
                document.getElementById("allStatusCallers").innerHTML = content + "</tbody></table>";
            } else if (localStorage.getItem("userType") == "Developer") {
                document.getElementById("allStatus").innerHTML = content + "</tbody></table><div class='container' id='mailOption'></div>";
                document.getElementById("allStatusCallers").innerHTML = content + "</tbody></table>";
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

//Get All Project Status
function getAllProjectStatusSupport(id) {
    $(".loader").show();

    $.ajax({
        url: api_url,
        data: { operation: "009", id: id },
        success: function (response) {
            $(".loader").hide();
            var info = response.split("/END/");
            var content = "<table class='table table-bordered table-striped'><thead><th>Called By</th><th>On</th><th>Summary</th><th>Next Call</th></thead><tbody>";
            for (let i = 0; i < info.length - 1; i++) {
                var element = info[i];
                var part = element.split("<-->");
                content +=
                    "<tr><td>" + part[0] + "</td><td>" + part[1].split(" ")[0] + "<br>" + part[1].split(" ")[1] + "</td><td>" + part[2] + "</td><td>" + part[3] + "</td></tr>";
            }
            if (localStorage.getItem("userType") == "Admin") {
                document.getElementById("allMyStatus").innerHTML = content + "</tbody></table><div class='container' id='mailOption'></div>";
            } else if (localStorage.getItem("userType") == "Caller") {
                document.getElementById("allMyStatus").innerHTML = content + "</tbody></table><div class='container' id='mailOption'></div>";
                document.getElementById("allStatusCallers").innerHTML = content + "</tbody></table>";
            } else if (localStorage.getItem("userType") == "Developer") {
                document.getElementById("allMyStatus").innerHTML = content + "</tbody></table><div class='container' id='mailOption'></div>";
                document.getElementById("allStatusCallers").innerHTML = content + "</tbody></table>";
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function viewProjectTask(pid) {
    $(".loader").show();
    //localStorage.getItem("userType") == "Admin" //Support

    $.ajax({
        url: api_url,
        data: { operation: "087", pid: pid },
        success: function (response) {
            console.log(response);

            var partialArranged = response.split("/END/");
            var content =
                '<table id="tableProjectsTASK" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By :</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                var d1 = new Date();
                var d2 = new Date(part[8]);
                var d3 = new Date(part[9]);
                var condition = d1.getTime() <= d2.getTime();
                var status = "Not Completed Yet";
                var special = part[9];
                var completed = false;
                if (part[9] != "") {
                    completed = true;
                    if (d3.getTime() < d2.getTime()) status = "Completed Before Time";
                    if (d3.getTime() == d2.getTime()) status = "Completed On Time";
                    if (d3.getTime() > d2.getTime()) status = "Delayed Completed";
                } else {
                    if (!condition) status = "Delayed Not Completed";
                    // special = "<button onclick='markCompletion1("+part[13]+")'>Mark Complete</button>";
                    special = " <button onclick='markCompletion2(" + part[13] + "); setTaskIdOnFeedback(" + part[13] + ")'>Mark Complete</button>";
                    if (localStorage.getItem("userType") == "Admin") {
                        alert(0);
                    } else {
                        if (localStorage.getItem("userID") == part[12]) {
                            //support agent is and project belongs to developer is same //userID
                            //do nothing
                        } else {
                            special = ""; //hide complete button
                        }
                    }
                }
                if (condition || completed) {
                    //part 3,4
                    //<a href="#" onclick=showfulltsk(`tskwrk`,`'+part[13]+'`,`'+part[5]+'`)>....</a>
                    content +=
                        "<tr><td>" +
                        part[13] +
                        "</td><td>" +
                        part[0] +
                        "<br>(" +
                        part[1] +
                        ")</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[3] +
                        "<br>" +
                        part[15] +
                        "</td><td id=tskwrk" +
                        part[13] +
                        ">" +
                        part[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        part[13] +
                        ",`" +
                        part[4] +
                        '`)">....</a> </td><td id=tskrmrk' +
                        part[13] +
                        ">" +
                        part[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmrk`,' +
                        part[13] +
                        ",`" +
                        part[5] +
                        '`)">....</a></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        "</td><td>" +
                        part[8] +
                        "</td><td>" +
                        special +
                        "</td><td>" +
                        status +
                        "</td><td id=tskrtng" +
                        part[13] +
                        ">" +
                        part[11].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrtng`,' +
                        part[13] +
                        ",`" +
                        part[11] +
                        '`)">....</a></td></tr>';
                } else {
                    content +=
                        "<tr><td>" +
                        part[13] +
                        "</td><td>" +
                        part[0] +
                        "<br>(" +
                        part[1] +
                        ")</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[3] +
                        "<br>" +
                        part[15] +
                        "</td><td id=tskwrk" +
                        part[13] +
                        ">" +
                        part[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        part[13] +
                        ",`" +
                        part[4] +
                        '`)">....</a></td><td id=tskrmrk' +
                        part[13] +
                        ">" +
                        part[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmrk`,' +
                        part[13] +
                        ",`" +
                        part[5] +
                        '`)">....</a></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:red;color:white;">' +
                        part[8] +
                        "</td><td>" +
                        special +
                        "</td><td>" +
                        status +
                        "</td><td id=tskrtng" +
                        part[13] +
                        ">" +
                        part[11].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrtng`,' +
                        part[13] +
                        ",`" +
                        part[11] +
                        '`)">....</a></td></tr>';
                }
            }
            document.getElementById("viewProjectTaskForSupport").innerHTML = "<h1>Project Task Assigned</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
            $("#tableProjectsTASK").DataTable({
                order: [[7, "desc"]],
                stateSave: true,
            });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
    $(".loader").hide();
}
function getSearchedProject() {
    var SearchText = $("#searchProjectBy").val();

    if (SearchText.length < 3) {
        alert("Enter alteat 3 Charcter");
    } else {
        $(".loader").show(); //searchProjectBy

        $.ajax({
            url: api_url,
            data: { operation: "076", SearchText: SearchText },
            success: function (response) {
                var partialArranged = response.split("/END/");
                var content =
                    '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
                var totalUpdates = partialArranged.length - 1;

                for (let index = 1; index <= totalUpdates; index++) {
                    var element = partialArranged[index - 1];
                    var part = element.split("<-->");
                    if (part[14] == "No dues") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[16] +
                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[15] +
                            "', " +
                            index +
                            ')">' +
                            part[15] +
                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[18] +
                            "', " +
                            index +
                            ')">' +
                            part[18] +
                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[19] +
                            '">' +
                            part[19] +
                            '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[17] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[17] +
                            '","' +
                            index +
                            '")>End Call</button></td><td>' +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td><td>' +
                            part[6] +
                            '</td><td style="background-color:green;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                            part[17] +
                            ')" data-whatever="' +
                            part[17] +
                            '">Status</button></td></td></tr>';
                    } else if (part[14] == "No payment details") {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[16] +
                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[15] +
                            "', " +
                            index +
                            ')">' +
                            part[15] +
                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[18] +
                            "', " +
                            index +
                            ')">' +
                            part[18] +
                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[19] +
                            '">' +
                            part[19] +
                            '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[17] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[17] +
                            '","' +
                            index +
                            '")>End Call</button></td><td>' +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td></td><td>' +
                            part[6] +
                            '</td><td style="background-color:red;color:white;" >' +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                            part[17] +
                            ')" data-whatever="' +
                            part[17] +
                            '">Status</button></td></td></tr>';
                    } else {
                        content +=
                            "<tr><td>" +
                            part[0] +
                            "</td><td>" +
                            part[1] +
                            "<br>" +
                            part[16] +
                            '<br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[15] +
                            "', " +
                            index +
                            ')">' +
                            part[15] +
                            '</a><br><a href="javascript:void(0)" onclick="makeCall(\'' +
                            part[1] +
                            "', '" +
                            part[17] +
                            "', '" +
                            part[18] +
                            "', " +
                            index +
                            ')">' +
                            part[18] +
                            '</a><br><a href="https://api.whatsapp.com/send?phone=91' +
                            part[19] +
                            '">' +
                            part[19] +
                            '</a><br><button style="display:none"  data-toggle="modal" data-target="#exampleModal4" data-whatever="' +
                            part[17] +
                            '" id="save-id-' +
                            index +
                            '" onclick=stopRecord("' +
                            part[17] +
                            '","' +
                            index +
                            '")>End Call</button></td><td>' +
                            part[2] +
                            "</td><td>" +
                            part[4] +
                            "</td><td>" +
                            part[5] +
                            '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                            part[0] +
                            ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                            part[0] +
                            ')">View Task</button></td></td><td>' +
                            part[6] +
                            "</td><td>" +
                            part[14] +
                            "</td><td>" +
                            part[10] +
                            "</td><td>" +
                            part[13] +
                            '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                            part[0] +
                            ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                            part[0] +
                            ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                            part[0] +
                            ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                            part[0] +
                            ')">Payment</button><br><button data-toggle="modal" data-target="#exampleModal4" onclick="getAllStatus(' +
                            part[17] +
                            ')" data-whatever="' +
                            part[17] +
                            '">Status</button></td></td></tr>';
                    }
                }
                document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
                $("#tableProjects").DataTable({
                    order: [[7, "desc"]],
                    stateSave: true,
                });
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
            async: false,
        });
        $(".loader").hide();
    }
}

// Get Project Details
function getProjectDetailsSupport() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "020" },
        success: function (response) {
            var partialArranged = response.split("/END/");
            var content =
                '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Project ID:</th><th>Lead Name:</th><th>Caller:</th><th>Developer:</th><th>Project Name:</th><th>Project Type:</th><th>Dues:</th><th>DOR:</th><th>Status :</th><th>OPTION</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                if (part[14] == "No dues") {
                    content +=
                        "<tr><td>" +
                        part[0] +
                        "</td><td>" +
                        part[1] +
                        "<br>" +
                        part[15] +
                        "<br>" +
                        part[16] +
                        "</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[4] +
                        "</td><td>" +
                        part[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                        part[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                        part[0] +
                        ')">View Task</button></td><td>' +
                        part[6] +
                        '</td><td style="background-color:green;color:white;" >' +
                        part[14] +
                        "</td><td>" +
                        part[10] +
                        "</td><td>" +
                        part[13] +
                        '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                        part[0] +
                        ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                        part[0] +
                        ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        part[0] +
                        ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                        part[0] +
                        ')">Payment</button></td></td></tr>';
                } else if (part[14] == "No payment details") {
                    content +=
                        "<tr><td>" +
                        part[0] +
                        "</td><td>" +
                        part[1] +
                        "<br>" +
                        part[15] +
                        "<br>" +
                        part[16] +
                        "</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[4] +
                        "</td><td>" +
                        part[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                        part[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                        part[0] +
                        ')">View Task</button></td><td>' +
                        part[6] +
                        '</td><td style="background-color:red;color:white;" >' +
                        part[14] +
                        "</td><td>" +
                        part[10] +
                        "</td><td>" +
                        part[13] +
                        '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                        part[0] +
                        ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                        part[0] +
                        ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        part[0] +
                        ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                        part[0] +
                        ')">Payment</button></td></td></tr>';
                } else {
                    content +=
                        "<tr><td>" +
                        part[0] +
                        "</td><td>" +
                        part[1] +
                        "<br>" +
                        part[15] +
                        "<br>" +
                        part[16] +
                        "</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[4] +
                        "</td><td>" +
                        part[5] +
                        '<br><button data-toggle="modal" data-target="#exampleModalAssignProj"  onclick="addProjForTask(' +
                        part[0] +
                        ')">Assign Task</button><br><button data-toggle="modal" data-target="#exampleModalviewProjecttask"  onclick="viewProjectTask(' +
                        part[0] +
                        ')">View Task</button></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[14] +
                        "</td><td>" +
                        part[10] +
                        "</td><td>" +
                        part[13] +
                        '<br><button data-toggle="modal" data-target="#exampleModalProjectStatus" onclick="fillUpdateProjectStatus(' +
                        part[0] +
                        ')">Full Status</button></td><td><button data-toggle="modal" data-target="#exampleModalProjectBilling")" onclick="getProjectBillingSupport(' +
                        part[0] +
                        ')">Billing</button><br><button data-toggle="modal" data-target="#exampleModalMoreDetails" onclick="fullDetails(' +
                        part[0] +
                        ')">Details</button><br><button data-toggle="modal" data-target="#exampleModalProjectPayment")" onclick="addProjectIDPaymentSupport(' +
                        part[0] +
                        ')">Payment</button></td></td></tr>';
                }
            }
            document.getElementById("displayContent").innerHTML = "<h1>Project Details</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
            $("#tableProjects").DataTable({ order: [[7, "desc"]], stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
    $(".loader").hide();
}

// Payment Part
function addProjectIDPaymentSupport(id) {
    // getAllProjectPaymentSupport(id);
    document.getElementById("projectIDPayment").value = id;
}

function getAllProjectPaymentSupport(id) {
    addPaymentTitle(id);
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "034", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var len = partial.length - 1;
            var amount = partial[len];
            var content = "<table class='table table-striped table-bordered'><thead><th>Amount</th><th>Proof</th><th>DOR</th><th>Remarks</th><th>Status</th></thead><tbody>";
            for (let i = 0; i < len; i++) {
                var data = partial[i].split("<-->");
                if (parseInt(data[4]) == 1) {
                    var status = "Verified";
                } else {
                    if (localStorage.getItem("userType") == "Admin") var status = "Unverified";
                    else {
                        var status = "Unverified";
                    }
                }
                content +=
                    "<tr><td>Rs." +
                    data[0] +
                    "</td><td><button class='btn btn-primary' onClick=\"openNewTab('" +
                    data[1] +
                    "')\">Check Proof</button></td> +"
                    "<td>" +
                    data[3] +
                    "</td><td><b>Updated By: </b>" +
                    data[6] +
                    "<hr>" +
                    data[2] +
                    "</td><td>" +
                    status +
                    "</td></tr>";
            }
            document.getElementById("allProjectPayment").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>" + amount + "</div>";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function getProjectBillingSupport(id) {
    localStorage.setItem("Billing_PD_ID", id);
    addBillingTitle(id);
    checkDiscountPaymentSupport(id);
    document.getElementById("projectIDBilling").value = id;
    var content = '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>Addon Name</th><!--<th>Addon Price</th>--><th>DOR:</th></thead><tbody>';
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "031", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var amount = partial[totalElement];
            for (let index = 0; index < totalElement; index++) {
                var data = partial[index].split("<-->");
                var addon = getAddonName(data[0]);
                content += "<tr><td>" + addon + "</td><!--<td>" + data[1] + "</td>--><td>" + data[2] + "</td></tr>";
            }
            //document.getElementById("allProjectBilling").innerHTML = content + "</tbody></table><div class='container'><b>Total : Rs </b>"+amount+"</div>";
            document.getElementById("allProjectBilling").innerHTML =
                content +
                "</tbody></table><div class='container'><!--<b>Total : Rs </b>" +
                amount +
                "--></div><br><button onclick='billingMail(" +
                id +
                ")' >SEND BILL</button>&nbsp<button type='button' onclick='manualMail(" +
                id +
                ")'>MANUAL MAIL</button>";
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function checkDiscountPaymentSupport(id) {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "037", id: id },
        success: function (response) {
            $(".loader").hide();
            var partial = response.split("/END/");
            var totalElement = partial.length - 1;
            var amount = partial[totalElement];
            if (response == 0) {
                document.getElementById("dicountDiv").style.display = "block";
                document.getElementById("ifDiscountAdded").innerHTML = "none";
            } else {
                document.getElementById("dicountDiv").style.display = "block";

                //   Changes
                var content =
                    '<h3>Discounts Added</h3><table id="tableProjects" class="table table-bordered table-striped"><thead><th>Remark</th><th>Amount</th><th>DOR:</th></thead><tbody>';

                for (let index = 0; index < totalElement; index++) {
                    var data = partial[index].split("<-->");
                    var addon = getAddonName(data[0]);
                    content += "<tr><td>" + addon + "</td><td>" + data[1] + "</td><td>" + data[2] + "</td></tr>";
                }

                document.getElementById("ifDiscountAdded").innerHTML = content + "</tbody></table>";
                // Changes End
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
function syncmail() {
    $(".loader").show();
    $.ajax({
        url: "https://teamka.in/crm1/APIs/mail/index.php",
        success: function (response) {
            $(".loader").hide();
            alert(response + "Email Updated");
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function checkLeadStatus() {
    var id = localStorage.getItem("userID");
    id = parseInt(id);
    $.ajax({
        url: api_url,
        data: { operation: "060", id: id },
        success: function (response) {
            if (response == 1) {
                localStorage.setItem("leadStatus", 1);
            } else {
                localStorage.setItem("leadStatus", 0);
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function assignProjectTask() {
    var pd_id = document.getElementById("projDetails").value;
    var assignedWork = document.getElementById("assignedWork").value;
    var remarksProjAssign = document.getElementById("remarksProjAssign").value;
    var deadline = document.getElementById("deadline").value;

    if (pd_id === "" || assignedWork === "" || remarksProjAssign === "" || deadline === "") {
        document.getElementById("errorDetailsAssignTask").innerHTML = "Fill the Form Correctly";
    } else {
        $.ajax({
            url: api_url,
            data: { operation: "067", pd_id: pd_id },
            success: function (response) {
                if (response == 0) {
                    addTask();
                } else {
                    var con = confirm("Task :" + response.trimEnd() + " already added to this project. Continue ?");
                    if (con) {
                        addTask();
                    } else {
                        alert("Cancelled");
                    }
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function addTask() {
    var id = localStorage.getItem("userID");
    var pd_id = document.getElementById("projDetails").value;
    var assignedTo = document.getElementById("assignedTo").value;
    var assignedWork = document.getElementById("assignedWork").value;
    var remarksProjAssign = document.getElementById("remarksProjAssign").value;
    var deadline = document.getElementById("deadline").value;
    var taskPriority = document.getElementById("taskPriority").value;

    if (pd_id == "" || assignedTo == "" || assignedWork == "" || deadline == "" || taskPriority == "") {
        document.getElementById("errorDetailsAssignTask").innerHTML = "Fill the Form Correctly";
    } else {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "064",
                pd_id: pd_id,
                assignedTo: assignedTo,
                assignedBy: id,
                assignedWork: assignedWork,
                deadline: deadline,
                remarksProjAssign: remarksProjAssign,
                taskPriority: taskPriority,
            },
            success: function (response) {
                $(".loader").hide();
                console.log(response);
                //   redirect to assigned works
                if (response == 1) {
                    taskAssignMail(pd_id, assignedWork);
                    alert("Task Assigned");
                    // assignedByMe();
                    // location.reload()
                } else {
                    alert("Error Occured");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}
function getAssignedTask() {
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By :</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
    document.getElementById("displayContent").innerHTML =
        "<h1>Project Task Assigned</h1><button class='btn btn-link' onclick='assignedByMe()'>Assigned By Me</button><div style='overflow-x:scroll;'>" +
        content +
        "</tbody></table>";

    var table = $("#tableProjects").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "065" },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "14" },
            {
                data: "0",
                render: function (data, type, row) {
                    return row[0] + "<br>(" + row[1] + ")";
                },
            },
            { data: "2" },
            {
                data: "3",
                render: function (data, type, row) {
                    return row[3] + "<br>" + row[16] + "";
                    //console.log(row);
                },
            },
            {
                data: "4",
                render: function (data, type, row) {
                    return (
                        '<div id="tskwrk' +
                        row[14] +
                        '">' +
                        row[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        row[14] +
                        ",`" +
                        row[4] +
                        '`)">....</a></div>'
                    );
                },
            },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        '<div id="tskrmk' +
                        row[14] +
                        '">' +
                        row[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmk`,' +
                        row[14] +
                        ",`" +
                        row[5] +
                        '`)">....</a></div>'
                    );
                },
            },
            { data: "6" },
            { data: "7" },
            { data: "8" },
            {
                data: null,
                render: function (data, type, row) {
                    // console.log(row[9]);
                    if (!row[9]) {
                        special = " <button onclick='markCompletion2(" + row[14] + "); setTaskIdOnFeedback(" + row[14] + ")'>Mark Complete</button>";
                        return special;
                    } else {
                        special1 =
                            row[9] +
                            " <button class='btn btn-danger mb-1' onclick='markfakeCompletion(" +
                            row[14] +
                            ", \"Incomplete Task\");'>Mark Incomplete</button><button class='btn btn-danger' onclick='markfakeCompletion(" +
                            row[14] +
                            ', "Fake Completion");\'>Mark Fake Complete</button>';

                        return special1;
                    }
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return row[10];
                },
            },
            {
                data: "11",
                render: function (data, type, row) {
                    if (row[11]) {
                        return (
                            '<div id="tskrat' +
                            row[14] +
                            '">' +
                            row[11].substring(0, 20) +
                            ' <a href="#/" onclick="showfulltsk(`tskrat`,' +
                            row[14] +
                            ",`" +
                            row[11] +
                            "<br>" +
                            row[5] +
                            '`)">....</a></div>'
                        );
                    } else {
                        return "";
                    }
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var d1 = new Date();
            var d2 = new Date(data[8]);
            var d3 = new Date(data[9]);
            var condition = d1.getTime() <= d2.getTime();

            var $td = $(row).find("td:eq(8)"); // Target the 6th TD within the row

            if (data[9] == null && !condition) {
                $td.css({ "background-color": "red", color: "white" });
            }
        },
    });
}

function showfulltsk(tpe, id, dta) {
    $("#" + tpe + "" + id + "").html(dta);
}
// Task Assigned by self
function assignedByMe() {
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By :</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
    document.getElementById("displayContent").innerHTML =
        "<h1>Tasks Assigned by me</h1><button class='btn btn-link' onclick='assignedByMe()'>Assigned By Me</button><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
    var id = localStorage.getItem("userID");
    var table = $("#tableProjects").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "065-2", id: id },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "14" },
            {
                data: "0",
                render: function (data, type, row) {
                    return row[0] + "<br>(" + row[1] + ")";
                },
            },
            { data: "2" },
            {
                data: "3",
                render: function (data, type, row) {
                    return row[3] + "<br>" + row[16] + "";
                    //console.log(row);
                },
            },
            {
                data: "4",
                render: function (data, type, row) {
                    return (
                        '<div id="tskwrk' +
                        row[14] +
                        '">' +
                        row[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        row[14] +
                        ",`" +
                        row[4] +
                        '`)">....</a></div>'
                    );
                },
            },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        '<div id="tskrmk' +
                        row[14] +
                        '">' +
                        row[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmk`,' +
                        row[14] +
                        ",`" +
                        row[5] +
                        '`)">....</a></div>'
                    );
                },
            },
            { data: "6" },
            { data: "7" },
            { data: "8" },
            {
                data: null,
                render: function (data, type, row) {
                    // console.log(row[9]);
                    if (!row[9]) {
                        special = " <button onclick='markCompletion2(" + row[14] + "); setTaskIdOnFeedback(" + row[14] + ")'>Mark Complete</button>";
                        return special;
                    } else {
                        return row[9];
                    }
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return row[10];
                },
            },
            {
                data: "11",
                render: function (data, type, row) {
                    if (row[11]) {
                        return (
                            '<div id="tskrat' +
                            row[14] +
                            '">' +
                            row[11].substring(0, 20) +
                            ' <a href="#/" onclick="showfulltsk(`tskrat`,' +
                            row[14] +
                            ",`" +
                            row[11] +
                            "<br>" +
                            row[5] +
                            '`)">....</a></div>'
                        );
                    } else {
                        return "";
                    }
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var d1 = new Date();
            var d2 = new Date(data[8]);
            var d3 = new Date(data[9]);
            var condition = d1.getTime() <= d2.getTime();

            var $td = $(row).find("td:eq(8)"); // Target the 6th TD within the row

            if (data[9] == null && !condition) {
                $td.css({ "background-color": "red", color: "white" });
            }
        },
    });
}

function assignedToMe() {
    var content =
        '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By :</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
    document.getElementById("displayContent").innerHTML = "<h1>My Tasks</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
    var id = localStorage.getItem("userID");
    var table = $("#tableProjects").DataTable({
        order: [[0, "desc"]],
        processing: false,
        paging: true,
        pagingType: "full_numbers",
        serverSide: true,
        ajax: {
            url: api_url,
            method: "POST",
            data: { operation: "065-3", id: id },
            beforeSend: function () {
                $(".loader").show();
            },
            complete: function () {
                $(".loader").hide();
            },
        },
        columns: [
            { data: "14" },
            {
                data: "0",
                render: function (data, type, row) {
                    return row[0] + "<br>(" + row[1] + ")";
                },
            },
            { data: "2" },
            {
                data: "3",
                render: function (data, type, row) {
                    return row[3] + "<br>" + row[16] + "";
                    //console.log(row);
                },
            },
            {
                data: "4",
                render: function (data, type, row) {
                    return (
                        '<div id="tskwrk' +
                        row[14] +
                        '">' +
                        row[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        row[14] +
                        ",`" +
                        row[4] +
                        '`)">....</a></div>'
                    );
                },
            },
            {
                data: "5",
                render: function (data, type, row) {
                    return (
                        '<div id="tskrmk' +
                        row[14] +
                        '">' +
                        row[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmk`,' +
                        row[14] +
                        ",`" +
                        row[5] +
                        '`)">....</a></div>'
                    );
                },
            },
            { data: "6" },
            { data: "7" },
            { data: "8" },
            {
                data: null,
                render: function (data, type, row) {
                    // console.log(row[9]);
                    if (!row[9]) {
                        special = " <button onclick='markCompletion2(" + row[14] + "); setTaskIdOnFeedback(" + row[14] + ")'>Mark Complete</button>";
                        return special;
                    } else {
                        return row[9];
                    }
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return row[10];
                },
            },
            {
                data: "11",
                render: function (data, type, row) {
                    if (row[11]) {
                        return (
                            '<div id="tskrat' +
                            row[14] +
                            '">' +
                            row[11].substring(0, 20) +
                            ' <a href="#/" onclick="showfulltsk(`tskrat`,' +
                            row[14] +
                            ",`" +
                            row[11] +
                            "<br>" +
                            row[5] +
                            '`)">....</a></div>'
                        );
                    } else {
                        return "";
                    }
                },
            },
        ],
        createdRow: function (row, data, dataIndex) {
            var d1 = new Date();
            var d2 = new Date(data[8]);
            var d3 = new Date(data[9]);
            var condition = d1.getTime() <= d2.getTime();

            var $td = $(row).find("td:eq(8)"); // Target the 6th TD within the row

            if (data[9] == null && !condition) {
                $td.css({ "background-color": "red", color: "white" });
            }
        },
    });
}

function setTaskIdOnFeedback(id) {
    document.getElementById("taskID").value = id;
}

function submitTaskFeedback() {
    var id = document.getElementById("taskID").value;
    var rating = document.getElementById("ratingTask").value;
    var feedback = document.getElementById("feedbackTask").value;

    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "068", id: id, rating: rating, feedback: feedback },
        success: function (response) {
            $(".loader").hide();

            if (response == 1) {
                alert("Added");

                // assignedByMe();
            } else {
                alert("Error Occured");
            }
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

// Get Project Details Individually
function myAssignedTask() {
    var id = localStorage.getItem("userID");
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "070", uid: id },
        success: function (response) {
            //      console.log(response);
            //tableProjects
            var partialArranged = response.split("/END/"); //
            var content =
                '<table id="tableProjects" class="table table-bordered table-striped"><thead><th>TaskID</th><th>Project :</th><th>Assigned By :</th><th>Assigned To<Br>Completed By:</th><th>Work :</th><th>Remark :</th><th>Assigned On :</th><th>Priority :</th><th>Deadline :</th><th>Completion Date :</th><th>Status :</th><th>Rating :</th></thead><tbody>';
            var totalUpdates = partialArranged.length - 1;

            for (let index = 1; index <= totalUpdates; index++) {
                var element = partialArranged[index - 1];
                var part = element.split("<-->");
                var d1 = new Date();
                var d2 = new Date(part[8]);
                var d3 = new Date(part[9]);
                var condition = d1.getTime() <= d2.getTime();
                var status = "Not Completed Yet";
                var special = part[9];
                var completed = false;
                if (part[9] != "") {
                    completed = true;
                    if (d3.getTime() < d2.getTime()) status = "Completed Before Time";
                    if (d3.getTime() == d2.getTime()) status = "Completed On Time";
                    if (d3.getTime() > d2.getTime()) status = "Delayed Completed";
                } else {
                    if (!condition) status = "Delayed Not Completed";
                    // special = "<button onclick='markCompletion("+part[13]+")'>Mark Complete</button>";
                    special = " <button onclick='markCompletion2(" + part[13] + "); setTaskIdOnFeedback(" + part[13] + ")'>Mark Complete</button>";
                }
                if (condition || completed) {
                    //part 3,4
                    //<a href="#" onclick=showfulltsk(`tskwrk`,`'+part[13]+'`,`'+part[5]+'`)>....</a>
                    content +=
                        "<tr><td>" +
                        part[13] +
                        "</td><td>" +
                        part[0] +
                        "<br>(" +
                        part[1] +
                        ")</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[3] +
                        "<br>" +
                        part[15] +
                        "</td><td id=tskwrk" +
                        part[13] +
                        ">" +
                        part[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        part[13] +
                        ",`" +
                        part[4] +
                        '`)">....</a> </td><td id=tskrmrk' +
                        part[13] +
                        ">" +
                        part[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmrk`,' +
                        part[13] +
                        ",`" +
                        part[5] +
                        '`)">....</a></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        "</td><td>" +
                        part[8] +
                        "</td><td>" +
                        special +
                        "</td><td>" +
                        status +
                        "</td><td id=tskrtng" +
                        part[13] +
                        ">" +
                        part[11].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrtng`,' +
                        part[13] +
                        ",`" +
                        part[11] +
                        '`)">....</a></td></tr>';
                } else {
                    content +=
                        "<tr><td>" +
                        part[13] +
                        "</td><td>" +
                        part[0] +
                        "<br>(" +
                        part[1] +
                        ")</td><td>" +
                        part[2] +
                        "</td><td>" +
                        part[3] +
                        "<br>" +
                        part[15] +
                        "</td><td id=tskwrk" +
                        part[13] +
                        ">" +
                        part[4].substring(0, 10) +
                        ' <a href="#/" onclick="showfulltsk(`tskwrk`,' +
                        part[13] +
                        ",`" +
                        part[4] +
                        '`)">....</a></td><td id=tskrmrk' +
                        part[13] +
                        ">" +
                        part[5].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrmrk`,' +
                        part[13] +
                        ",`" +
                        part[5] +
                        '`)">....</a></td><td>' +
                        part[6] +
                        "</td><td>" +
                        part[7] +
                        '</td><td style="background-color:red;color:white;">' +
                        part[8] +
                        "</td><td>" +
                        special +
                        "</td><td>" +
                        status +
                        "</td><td id=tskrtng" +
                        part[13] +
                        ">" +
                        part[11].substring(0, 20) +
                        ' <a href="#/" onclick="showfulltsk(`tskrtng`,' +
                        part[13] +
                        ",`" +
                        part[11] +
                        '`)">....</a></td></tr>';
                }
                /* if(parseInt(id) == parseInt(part[12])){
                        if(condition || completed){
                         content += '<tr><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td>'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td>'+part[11]+'</td></tr>';

                        }else{
                             content += '<tr><td>'+part[0]+'<br>('+part[1]+')</td><td>'+part[2]+'</td><td>'+part[4]+'</td><td>'+part[5]+'</td><td>'+part[6]+'</td><td>'+part[7]+'</td><td style="background-color:red;color:white;">'+part[8]+'</td><td>'+special+'</td><td>'+status+'</td><td>'+part[11]+'</td></tr>';

                        }
                    }*/
            }
            document.getElementById("displayContent").innerHTML = "<h1>My Tasks</h1><div style='overflow-x:scroll;'>" + content + "</tbody></table>";
            $("#tableProjects").DataTable({ order: [[5, "desc"]], stateSave: true });
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
        async: false,
    });
    $(".loader").hide();
}

function markCompletion(id) {
    var cnf = confirm("Confirm Complete?");
    if (cnf) {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: { operation: "066", id: id },
            success: function (response) {
                if (response == 1) {
                    myAssignedTask();
                } else {
                    alert("Error Occured");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function markCompletion1(id) {
    var cnf = confirm("Confirm Complete?");
    if (cnf) {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: { operation: "066", id: id },
            success: function (response) {
                if (response == 1) {
                    getAssignedTask();
                } else {
                    alert("Error Occured");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function markCompletion2(id) {
    var cnf = confirm("Confirm Complete?");
    var caller_id = localStorage.getItem("userID");

    if (cnf) {
        $(".loader").show();
        $("#exampleModalFeedbackTask").modal("show");
        $.ajax({
            url: api_url,
            data: { operation: "066", id: id, caller_id: caller_id },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    //   assignedByMe();
                    taskCompleteMail(id);
                    alert("Please add rating and feedback");
                } else {
                    alert("Error Occured");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function markfakeCompletion(id, status) {
    var cnf = confirm("Confirm Mark " + (status === "Fake" ? "Fake" : "Incomplete") + "?");

    if (cnf) {
        $(".loader").show();
        $.ajax({
            url: api_url,
            data: {
                operation: "066-1",
                id: id,
                status: status, // Send the status ('Fake' or 'Incomplete')
            },
            success: function (response) {
                $(".loader").hide();
                if (response == 1) {
                    alert("Mark Done..");
                } else {
                    alert("Error Occurred");
                }
            },
            error: function (jqXHR, exception) {
                var msg = displayerror(jqXHR, exception);
                alert(msg);
            },
        });
    }
}

function addProjForTask(id) {
    //console.log(id);
    $("#projDetails").selectpicker("val", id);
}

function addProjDetails(id, description, issue, img) {
    var link = "https://teamka.in/crm1/APIs/support_complaint_document/" + img;
    $("#projDetails").selectpicker("val", id);
    $("#remarksProjAssign").val(description + "\n" + link);
    $("#assignedWork").val(issue);
}

function loadcallerdemoleads() {
    var id = parseInt(localStorage.getItem("userID"));
    $.ajax({
        url: api_url,
        data: { operation: "getleads-caller", id: id },
        success: function (responseOut) {
            //console.log(responseOut);
            response = JSON.parse(responseOut);

            var demo_leads_today = parseInt(response.demo_leads_today);
            var leads_today = parseInt(response.total_leads_today);

            var total_leads = parseInt(response.total_leads);
            var demo_leads = parseInt(response.demo_leads);

            $("#ratio .today").html("Today: " + leads_today);
            $("#ratio .month").html("30 Days: " + total_leads);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

function loadcallerstats() {
    var id = parseInt(localStorage.getItem("userID"));
    $.ajax({
        url: api_url,
        data: { operation: "075", id: id },
        success: function (responseOut) {
            response = JSON.parse(responseOut);
            $("#Call_Today_Count").html(response.call_today);
            $("#countConnected").html(response.countConnected);
            $("#countNotConnected").html(response.countNotConnected);
            $("#durationDisplay").html(response.durationDisplay);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}
//userID

function loadBestCaller() {
    var id = parseInt(localStorage.getItem("userID"));
    $.ajax({
        url: api_url,
        data: { operation: "075-2", id: id },
        success: function (responseOut) {
            //console.log(responseOut)

            response = JSON.parse(responseOut);
            $("#Call_Total_Best").html(response.call_today);
            $("#bestPerformer").html(response.caller_name);
            // $("#countNotConnected").html(response.countNotConnected);
            $("#Call_Today_Best").html(response.durationDisplay);
        },
        error: function (jqXHR, exception) {
            var msg = displayerror(jqXHR, exception);
            alert(msg);
        },
    });
}

document.addEventListener(
    "deviceready",
    function () {
        deviceLoad();
        startPingCheck();
        checkCrmState(); // Set up resume event listener
    },
    false
);
function error() {
    console.warn("Camera or Accounts permission is not turned on");
}

function startPingCheck() {
    // Set up the interval to check ping every minute
    console.log("Starting ping Check");
    checkPingInterval();
    setInterval(checkPingInterval, 60 * 1000); // 60 seconds
}

function fetchLeadId(phoneNumber, callback) {
    console.log("Fetching Lead For " + phoneNumber);

    $.ajax({
        url: api_url, // Replace with your server endpoint
        method: "POST",
        data: {
            operation: "getLeadinfo",
            mobile: phoneNumber,
        },
        success: function (response) {
            try {
                const result = JSON.parse(response);
                if (result.status === 1) {
                    const callDetails = {
                        leadName: phoneNumber && phoneNumber.length > 0 ? result.lead_name : "Unknown",
                        leadId: phoneNumber && phoneNumber.length > 0 ? result.lead_id : "Unknown",
                        phone: phoneNumber,
                    };
                    console.log("Fetch Lead Success For " + phoneNumber + " Lead Name  " + result.lead_name + " Lead ID " + result.lead_id);

                    callback(callDetails);
                } else {
                    console.warn("Failed to get lead details For " + phoneNumber);
                    const callDetails = {
                        leadName: "Unknown",
                        leadId: "Unknown",
                        phone: phoneNumber,
                    };
                    callback(callDetails);
                }
            } catch (error) {
                console.error("Error parsing response:", error);
                alert("An error occurred while fetching lead details");
                const callDetails = {
                    leadName: "Unknown",
                    leadId: "Unknown",
                    phone: phoneNumber,
                };
                callback(callDetails);
            }
        },
        error: function (error) {
            console.error("Error fetching lead details:", error);
            alert("An error occurred while fetching lead details");
            const callDetails = {
                leadName: "Unknown",
                leadId: "Unknown",
                phone: phoneNumber,
            };
            callback(callDetails);
        },
    });
}

function checkRecordings() {
    if (localStorage.getItem("userID")) {
        if (!isCalledByMakeCall) {
            // Only check recordings if not called by makeCall
            const recordings = JSON.parse(localStorage.getItem("recordings")) || [];

            if (recordings.length > 0) {
                populateModalTable(); // Populate modal with recording details
                document.getElementById("overlay").style.display = "flex";
            }
        }
    }

    // Reset the flag after check
}

function checkCrmState() {
    document.addEventListener(
        "resume",
        function () {
            checkRecordings(); // Check recordings when app is resumed
        },
        false
    );
}

function sendPing() {
    phoneNumber = localStorage.getItem("MobileNo");
    if (phoneNumber) {
        const state = localStorage.getItem("userID") ? "Logged In" : "Not Logged In";
        const pad = (num) => String(num).padStart(2, "0");

        const customTime = new Date();
        const formattedTime = `${customTime.getFullYear()}-${pad(customTime.getMonth() + 1)}-${pad(customTime.getDate())} ${pad(customTime.getHours())}:${pad(
            customTime.getMinutes()
        )}:${pad(customTime.getSeconds())}`;

        $.ajax({
            url: api_url,
            type: "POST",
            data: {
                operation: "userActivity",
                mobile: phoneNumber,
                state: state,
                time: formattedTime,
            },
            success: function (response) {
                console.log(response);
                localStorage.setItem("lastPingTime", new Date().getTime());
                try {
                    const jsonResponse = JSON.parse(response); // Parse the JSON response
                    if (jsonResponse.success) {
                        // If success is true, show success message
                        console.log(jsonResponse.message);
                    } else {
                        // If success is false, show error message
                        console.log("Error: " + jsonResponse.message);
                    }
                } catch (e) {
                    console.error("Invalid JSON response:", response); // Handle JSON parse error
                }
            },
            error: function (xhr, status, error) {
                console.error("Error sending ping:", error);
            },
        });
    }
}

function checkPingInterval() {
    const lastPingTime = localStorage.getItem("lastPingTime");
    const currentTime = new Date().getTime();

    // If lastPingTime is not set, initialize it with the current time and send the first ping
    if (!lastPingTime) {
        sendPing();
        return;
    }

    // Calculate the difference in milliseconds (10 minutes = 600,000 milliseconds)
    const timeDiff = currentTime - lastPingTime;

    if (timeDiff >= 600000) {
        // 10 minutes have passed
        sendPing();
    }
}

function deviceLoad() {
    onDeviceReady();
    isCalledByMakeCall = false;
    checkRecordings();
}

let logMessages = [];

// Override console methods
["log", "warn", "error"].forEach(function (method) {
    const original = console[method];
    console[method] = function (...args) {
        // Store logs with a timestamp
        logMessages.push(`[${method.toUpperCase()}] ${new Date().toISOString()}: ${args.join(" ")}`);
        original.apply(console, args);
    };
});

function onError(error) {
    const errorMessage = `Error code: ${error.code}, Message: ${error.message}`;
    console.error("Recording Error:", errorMessage);
}

function saveLogsToFile() {
    const logContent = logMessages.join("\n");

    // Access the file system on the SD card
    window.resolveLocalFileSystemURL(
        cordova.file.externalRootDirectory,
        function (directoryEntry) {
            // Create or open the logs directory
            directoryEntry.getDirectory(
                "logs",
                { create: true, exclusive: false },
                function (logDir) {
                    // Create or open the log file within the logs directory
                    logDir.getFile(
                        "appLogs.txt",
                        { create: true, exclusive: false },
                        function (fileEntry) {
                            // Create a FileWriter object for the file
                            fileEntry.createWriter(function (fileWriter) {
                                fileWriter.onwriteend = function () {
                                    console.log("Log file successfully appended to SD card.");
                                };

                                fileWriter.onerror = function (e) {
                                    console.error("Failed to append to log file: " + e.toString());
                                };

                                // Move the write position to the end of the file
                                fileWriter.seek(fileWriter.length);

                                // Write the log content to the file
                                fileWriter.write(logContent);
                            });
                        },
                        function (error) {
                            console.error("Error accessing log file: " + error.toString());
                        }
                    );
                },
                function (error) {
                    console.error("Error creating log directory: " + error.toString());
                }
            );
        },
        function (error) {
            console.error("Error accessing SD card: " + error.toString());
        }
    );
}

function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.overrideBackButton();

    PhoneCallTrap.onCall(function (state) {
        // Parse the state and incoming number from the result
        var callState = state[0]; // The call state: "RINGING", "OFFHOOK", or "IDLE"
        var incomingNumber = state[1]; // The incoming phone number

        console.log("STATE Changed: " + callState);
        if (incomingNumber) {
            incomingNumber = incomingNumber.slice(-10);
        }

        switch (callState) {
            case "RINGING":
                console.log("Phone is ringing");
                console.log("Incoming number: " + incomingNumber);
                break;

            case "OFFHOOK":
                console.log("Phone is off-hook for : " + incomingNumber);
                if (isrecord == 0) {
                    isrecord = 1;

                    fetchLeadId(incomingNumber, function (callDetails) {
                        recordAudio(callDetails);
                    });
                } else {
                    console.log("Already recording another call");
                }

                break;
            case "IDLE":
                console.log("Phone is idle Call Disconnected");
                if (isrecord == 1) {
                    isrecord = 0;

                    stopRecordIncomingCall();
                }
                if (isrecord == 2) {
                    isrecord = 0;

                    //                        cordova.plugins.backgroundMode.disable();
                    try {
                        myMedia.stopRecord();
                        console.log("Recording stopped successfully.");
                    } catch (e) {
                        // Handle exceptions
                        onError(e);
                    }
                }
                break;
        }
    });

    //        cordova.plugins.backgroundMode.on('EVENT', backgroundEvent);

    var permissions = cordova.plugins.permissions;
    var list = [
        permissions.RECORD_AUDIO,
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_PHONE_STATE,
        permissions.MODIFY_AUDIO_SETTINGS,
        // permissions.CAPTURE_AUDIO_OUTPUT,
        // permissions.READ_CONTACTS
    ];

    permissions.checkPermission(
        list,
        function (status) {
            if (!status.hasPermission) {
                var permissions = cordova.plugins.permissions;
                permissions.requestPermissions(
                    list,
                    function (status) {
                        if (!status.hasPermission) error();
                    },
                    error
                );
            }
        },
        null
    );
    // alert("device ready end")
}

function getDeviceUserAgent() {
    $(".loader").show();
    $.ajax({
        url: api_url,
        data: { operation: "getuserAgent" },
        success: function (response) {
            $(".loader").hide();
            $("#getuserAgent").html(response);
        },
    });
}
