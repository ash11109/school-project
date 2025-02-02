const OPENAI_API = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4";
const key =
  "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";

let CRM_AI_API = "https://teamka.in/z_ash_test/ash_ai_api.php";

const likeDislikeButtons = document.querySelectorAll('.like, .dislike');

likeDislikeButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();

    // Remove 'active' class from all buttons
    likeDislikeButtons.forEach(btn => btn.classList.remove('active'));

    // Add 'active' class to the clicked button
    button.classList.add('active');
  });
});



// Handle feedback submission
function handleFeedback(detailsId) {
  const detailsContainer = document.getElementById(detailsId);

  // Get feedback value (like/dislike)
  const activeFeedback = detailsContainer.querySelector(".rating .active");
  const feedbackValue = activeFeedback ? activeFeedback.dataset.feedback : null;

  // Get feedback text
  const feedbackText = detailsContainer.querySelector(".feedback-text").value.trim();

  // Validate inputs
  if (!feedbackValue) {
      alert(`Please select feedback for ${detailsId}`);
      return;
  }

  // Submit feedback
  submitFeedback(detailsId, feedbackValue, feedbackText);
}

function submitFeedback(detailsId, feedbackValue, feedbackText) {
  console.log(`Submitting Feedback for ${detailsId}`);
  console.log(`Feedback Value: ${feedbackValue}`);
  console.log(`Feedback Text: ${feedbackText}`);

  // Call API twice for value and text
  updateQAdb(`Feedback Value`, feedbackValue);
  updateQAdb(`Feedback Text`, feedbackText);
}

function loadQA(){
  link = localStorage.getItem("AI_QA_link");
  type = localStorage.getItem("AI_QA_Intrested_IN");
  cs_id = localStorage.getItem("AI_QA_CS_ID");
  id = localStorage.getItem("userID");
  console.log(link, type,id,cs_id);
  startQA(link, type,id,cs_id);
  document.getElementById("loader").style.display = "block";
}

async function startQA(audio_url, interested_in,c_id,cs_id) {
  
  let mp3_url = await genrateMp3Url(audio_url, c_id, cs_id);
  console.log(mp3_url);
  let transcription =  await getTranscription();
  if ( transcription == null ) {
    await startTranscription(mp3_url);
    transcription = await fetchTranscription();
  }
  let res = await fetchQA(transcription, interested_in);
  localStorage.setItem("AI_QA_report", res);
  printQA(res);
}

async function updateQAdb(clm_name, clm_data) {
  const fd = new FormData();
  fd.append("type", 3);
  fd.append("file_url", localStorage.getItem("AI_QA_convertedFileUrl"));
  fd.append("clm_name", clm_name);
  fd.append("clm_data", clm_data);
  let req = await fetch(CRM_AI_API, { method: "POST", body: fd });
  let res = await req.json();
  if (res.status == 1) {
    console.log("done");
  } else {
    console.log("error");
  }
}

async function genrateMp3Url(audio_url, c_id, cs_id) {
  const fd = new FormData();
  fd.append("type", 5);
  fd.append("file_url", audio_url);
  fd.append("c_id", c_id);
  fd.append("cs_id", cs_id);
  let req = await fetch(CRM_AI_API, { method: "POST", body: fd });
  let res = await req.json();
  if (res.status == 1) {
    localStorage.setItem("AI_QA_convertedFileUrl", res.url);
    return res.url;
  } else {
    console.error("aws upload");
    return null;
  }
}

async function startTranscription(audio_url) {
  const formdata = new FormData();
  formdata.append("type", "1");
  formdata.append("file_url", audio_url);
  let req = await fetch(CRM_AI_API, { method: "POST", body: formdata });
  let res = await req.json();
  return res.status;
}

async function getTranscription() {
  const formdata = new FormData();
  formdata.append("type", "2");
  formdata.append("file_url", localStorage.getItem("AI_QA_convertedFileUrl"));
  let req = await fetch(CRM_AI_API, { method: "POST", body: formdata });
  let res = await req.json();
  if (res.transcription == null) {
    return 0;
  } else {
    return res.transcription.Transcription;
  }
}

async function fetchTranscription() {
  let transcription = "";
  while (transcription === "") {
    
    console.log(transcription);
    if (transcription !== "") {getTranscription
      localStorage.setItem("AI_QA_transcription", transcription);
      return transcription;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
  }
}

async function fetchQA(transcription, interested_in) {
  
  if ( localStorage.getItem("AI_QA_report") != undefined || localStorage.getItem("AI_QA_report") != null ) {
    return localStorage.getItem("AI_QA_report");
  }
    
  let report = await get_QA_from_DB();

  if ( report != null ) {
    return report ;
  }

  let txt = "";
  if (interested_in == "WDC") {
    txt = `
      I want to check if the agent handles this call properly? He is pitching for a Web Development Offline course. We encourage students to register for offline workshops. Check his performance on standard parameters of call quality and share a report card out of 100 points.
    `;
  } else if (interested_in == "DM") {
    txt = `
      I want to check if the agent handles this call properly? He is pitching for a Digital Marketing Offline course. We encourage students to register for offline workshops. Check his performance on standard parameters of call quality and share a report card out of 100 points.
    `;
  } else {
    txt = `
      I want to check if the agent handles this call properly? He is calling on half of My Galla which is a billing app specially designed for grocery store. Check his performance on standard parameters of call quality and share a report card out of 100 points.
    `;
  }

  try {
    const response = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: `
                ${txt}
                The call transcription is below:
                ${transcription.slice(10, 8000)}
                Please evaluate the agent's performance using the following criteria and give feedback for each:
                1. **Call Opening (10 Points)**: How well the agent opened the call and set the tone.
                2. **Speech Clarity (20 Points)**: Was the agent's speech clear and easy to understand?
                3. **Product Knowledge (20 Points)**: How well did the agent demonstrate knowledge of the Web Development course and its benefits?
                4. **Communication Skill (20 Points)**: Was the agent able to communicate effectively and maintain a friendly tone throughout the call?
                5. **Call Control (20 Points)**: How well did the agent control the conversation and keep the call on track?
                6. **Closing Skill (10 Points)**: How effectively did the agent handle the closing of the call and encourage further action, such as registering for the workshop?
                Please provide feedback for each of the above points and assign scores (out of 20) based on the agent's performance in each category. Additionally, highlight any areas where the agent's performance is lacking or needs improvement.
                The final report should be in the following format (with scores out of 100):
                
                [
                    {"name": "Call Opening", "received_score": X, "total_score": 10, "details": "Feedback about how well the agent opened the call and set the tone..."},
                    {"name": "Speech Clarity", "received_score": X, "total_score": 20, "details": "Feedback about clarity..."},
                    {"name": "Product Knowledge", "received_score": X, "total_score": 20, "details": "Feedback about product knowledge..."},
                    {"name": "Communication Skill", "received_score": X, "total_score": 20, "details": "Feedback about communication skills..."},
                    {"name": "Call Control", "received_score": X, "total_score": 20, "details": "Feedback about call control..."},
                    {"name": "Closing Skill", "received_score": X, "total_score": 10, "details": "Feedback about closing skills..."}
                ]
                Please provide the scores and feedback in the format above so that I can directly display the report in my application.
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      return;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    await updateQAdb("Quality Report", data.choices[0].message.content);
    return content;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function get_QA_from_DB() {

  const fd = new FormData();
  fd.append("type", 4);
  fd.append("file_url", localStorage.getItem("AI_QA_convertedFileUrl"));

  let req = await fetch(CRM_AI_API, { method: "POST", body: fd });
  let res = await req.json();

  return res.data;

}


function printQA(res) {
  for (i = 0; i < res.length; i++) {
    if (res[i] == "[" && i != 0) {
      res = res.slice(i - 1, res.length - 1);
      break;
    }
  }

  for (i = res.length - 1; i >= 0; i--) {
    if (res[i] == "]") {
      res = res.slice(0, i + 1);
      break;
    }
  }

  res = res.trim();
  res = JSON.parse(res);

  console.log(res);
  

  document.getElementById("result").innerHTML = "";

  res.map((item) => {
    document.getElementById("result").innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.received_score}</td>
        <td>${item.total_score}</td>
        <td>${item.details}</td>
        <td>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#qaCheckFuther" onclick="check_further('${item.name}')">
              check further
          </button>
        </td>
      </tr>
    `;
  });

  let recived_score = res.reduce(
    (s, i) => (s += parseInt(i.received_score)),
    0
  );
  let total_score = res.reduce((s, i) => (s += parseInt(i.total_score)), 0);

  document.getElementById(
    "recived_score"
  ).innerHTML = `Recived score : ${recived_score}`;
  document.getElementById(
    "total_score"
  ).innerHTML = `Total score : ${total_score}`;

  document.getElementById("loader").style.display = "none";
}

async function view_more(more_type) {

  console.log(more_type);
  
  let transcription = localStorage.getItem("AI_QA_transcription");
  let report = localStorage.getItem("AI_QA_report");
  
  if ( transcription == null ) {
    let x = await getTranscription();
    console.log(x);
    localStorage.setItem("AI_QA_transcription" , x);
    transcription = localStorage.getItem("AI_QA_transcription");
  }

  try {
    const response = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: `
              I am analyzing an interaction where I have a transcription and a performance report for an agent's call.
              The transcription (partial excerpt shown below) is: 
              ${transcription.slice(10, 8000)} 
              Here is the report summarizing the agent's performance: 
              ${report}
              Could you please evaluate the ${more_type} of the agent's responses? Specifically, I am looking for an analysis of where ${more_type} is missing. 
              For each case where ${more_type} is lacking, provide the following:
              - **Original**: A portion of the transcription where the issue is present.
              - **Issue**: A technical explanation of what is unclear or lacking ${more_type}.
              - **Suggestion**: How the agent could improve the clarity of their response. The suggestion should be given **in normal, conversational Hindi**. It should be simple, clear, and direct so the agent can easily understand how to improve their communication.

              **Please format your response in HTML** with the following structure:
              - For each issue, create a <div> with a class "issue" that contains:
                - A <h3> for the title ("${more_type} Issue").
                - A <p> for the "Original" (quote or example).
                - A <p> for the "Issue" (technical explanation).
                - A <p> for the "Suggestion" (${more_type} improvement).
              Make sure each issue is well-separated in its own <div>, and use simple HTML tags for easy readability. Optionally, you can also style the output using inline styles or CSS classes.
              Here is the structure you should follow for each issue:
              <div class="issue">
                <h3>${more_type} Issue #1</h3>
                <p><strong>Original:</strong> [Original text from transcription]</p>
                <p><strong>Issue:</strong> [Technical explanation of the issue]</p>
                <p><strong>Suggestion:</strong> [Suggested improvement for ${more_type} in simple, conversational Hindi]</p>
              </div>
              Ensure the HTML is well-structured and easy to read, so it can be directly embedded in a webpage.
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      return;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    print_view_more(content);
    await updateQAdb(more_type, content)
    return content;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function check_further(more_type) {
  document.getElementById("loader").style.display = "block";
  let res = await check_further_from_db(more_type);

  console.log(res);

  if ( res != null  ) {
    print_view_more(res);
    return null ;
  } else {
    view_more(more_type);
  }
  
}

async function check_further_from_db(more_type) {

  const fd = new FormData();
  fd.append("type", 6);
  fd.append("more_type", more_type);
  fd.append("file_url", localStorage.getItem("AI_QA_convertedFileUrl"));

  let req = await fetch(CRM_AI_API, { method: "POST", body: fd });
  let res = await req.json();
  return res.data ;

}

function print_view_more(content) {
  document.getElementById("loader").style.display = "none";
  document.getElementById("more_detailed_result").innerHTML = content;
}