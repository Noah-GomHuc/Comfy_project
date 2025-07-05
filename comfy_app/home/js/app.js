const serverAddress = '127.0.0.1:8188';
const clientId = uuidv4();
let promptId = null;

document.getElementById('promptForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const promptText = document.getElementById('promptInput').value;
  const modifiedOutput = document.getElementById('modified-output');
  const downloadLink = document.getElementById('download-link');
  const downloadContainer = document.getElementById('download-container');
  const loader = document.getElementById('loader');

  modifiedOutput.innerHTML = '';
  loader.style.display = 'block';

  try {
    const promptWorkflow = await readWorkflowAPI();

    promptWorkflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 18446744073709551614) + 1;
    promptWorkflow["6"]["inputs"]["text"] = promptText;

    promptId = await queuePrompt(promptWorkflow);

    const socket = new WebSocket(`ws://${serverAddress}/ws?clientId=${clientId}`);

    socket.onmessage = async function (event) {
      const message = JSON.parse(event.data);

      if (message.type === 'executed' && message.data.prompt_id === promptId) {
        const images = message.data.output.images;

        for (const image of images) {
          const imageUrl = `http://${serverAddress}/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder)}&type=${encodeURIComponent(image.type)}`;
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          const img = document.createElement('img');
          img.src = url;
          modifiedOutput.appendChild(img);

          downloadLink.href = url;
          downloadLink.download = image.filename;
          downloadLink.style.display = 'inline-block';
          downloadContainer.style.display = 'block';
          loader.style.display = 'none';
        }
      }
    };
  } catch (error) {
    console.error('Error:', error);
    loader.style.display = 'none';
  }
});

async function readWorkflowAPI() {
  const response = await fetch('/home/js/workflow_api.json');
  if (!response.ok) {
    throw new Error('Error al leer el archivo workflow_api.json');
  }
  return response.json();
}

async function queuePrompt(promptWorkflow) {
  const postData = JSON.stringify({ prompt: promptWorkflow, client_id: clientId });
  const response = await fetch(`http://${serverAddress}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: postData
  });

  if (!response.ok) {
    throw new Error('Error al encolar el prompt');
  }

  const result = await response.json();
  return result.prompt_id;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
