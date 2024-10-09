const assistantId = 'asst_sDdUZb3BL7k2PiqdkKVwrLT4';
const apiKey = '請修改這裡';
let threadId;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createThread() { // create thread
    try {
        let response = await fetch('https://api.openai.com/v1/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify({})
        });
        data = await response.json();
        threadId = data.id;
    } catch (error) {
        console.error('Error:', error);
    }
}
createThread();

async function chatResponse(){
    const userInput = document.getElementById('user-input').value;
    let messageId, runId, runStatus, stepId, outputId;
    let chatOutput = document.getElementById("chat-output");
    if (!userInput.trim()) {
        return;
    }
    chatOutput.innerHTML += "<div class='user-message'>使用者：<br>" + userInput + "</div>";
    document.getElementById("user-input").value = "";
    try {
        // create message
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify({
                "role": "user",
                "content": userInput
            })
        });
        data = await response.json();
        messageId = data.id;
        console.log(messageId);

        // create runs
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify({
                "assistant_id": assistantId
            })
        });
        data = await response.json();
        runId = data.id;
        console.log(runId);

        //runs retrieve
        while (runStatus !== 'completed') {
            response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'OpenAI-Beta': 'assistants=v1'
                }
            });
            data = await response.json();
            runStatus = data.status;
            console.log(runStatus);
            await sleep(2500);
        }

        // get stepId
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1'
            }
        });
        data = await response.json();
        stepId = data.data[0].id;
        console.log(stepId);

        //get new message
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps/${stepId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1',
                'Content-Type': 'application/json'
            }
        });
        data = await response.json();
        outputId = data.step_details.message_creation.message_id;
        console.log(outputId);

        //output message
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1',
                'Content-Type': 'application/json'
            }
        });
        data = await response.json();
        outputResponse = data.data[0].content[0].text.value;
        chatOutput.innerHTML += "<div class='chatbot-message'>客服機器人：<br>" + outputResponse + "</div>";

    } catch (error) {
        console.error('Error:', error);
    }
}
document.getElementById('send-button').addEventListener('click',chatResponse);

document.getElementById("user-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        chatResponse();
        event.preventDefault();  // 防止觸發預設的Enter事件行為
    }
});

