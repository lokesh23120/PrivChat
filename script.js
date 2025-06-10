let isPiiDetailsVisible = false;
let currentChatSpace = 1;

// Store per-chat space input and analysis results
let chatSpacesData = {
  1: { input: '', entities: '', llmResponse: '', highlightedExample: '' },
  2: { input: '', entities: '', llmResponse: '', highlightedExample: '' }
};

function togglePiiDetails() {
  const emptySpace = document.getElementById('emptySpace');
  const piiDetails = document.getElementById('piiDetails');

  isPiiDetailsVisible = !isPiiDetailsVisible;

  if (isPiiDetailsVisible) {
    emptySpace.style.display = 'none';
    piiDetails.classList.add('active');
  } else {
    emptySpace.style.display = 'flex';
    piiDetails.classList.remove('active');
  }
}

function selectChatSpace(element, spaceNumber) {
  const promptInput = document.getElementById('promptInput');
  const entitiesOutput = document.getElementById('entitiesOutput');
  const llmResponseOutput = document.getElementById('llmResponseOutput');
  const chatExample = document.getElementById('chatExample');
  const piiCount = document.getElementById('piiCount');
  const piiItemsList = document.getElementById('piiItemsList');

  // Save current space data
  chatSpacesData[currentChatSpace].input = promptInput.value;
  chatSpacesData[currentChatSpace].entities = entitiesOutput.textContent;
  chatSpacesData[currentChatSpace].llmResponse = llmResponseOutput.textContent;
  chatSpacesData[currentChatSpace].highlightedExample = chatExample.innerHTML;

  // Update chat space button UI
  const allButtons = document.querySelectorAll('.chat-space-btn');
  allButtons.forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');

  currentChatSpace = spaceNumber;

  // Restore saved data
  promptInput.value = chatSpacesData[spaceNumber].input;
  entitiesOutput.textContent = chatSpacesData[spaceNumber].entities;
  llmResponseOutput.textContent = chatSpacesData[spaceNumber].llmResponse;

  if (chatSpacesData[spaceNumber].highlightedExample) {
    chatExample.innerHTML = chatSpacesData[spaceNumber].highlightedExample;
  } else {
    // Default to blank content for new chat space
    chatExample.innerHTML = '';
    piiCount.textContent = '0 items';
    piiItemsList.innerHTML = '';
  }

  const chatWindow = document.querySelector('.chat-window');
  chatWindow.style.transform = 'scale(0.98)';
  chatWindow.style.opacity = '0.8';

  setTimeout(() => {
    chatWindow.style.transform = 'scale(1)';
    chatWindow.style.opacity = '1';
  }, 150);
}

function highlightPII(text, entities) {
  entities.sort((a, b) => b.text.length - a.text.length);

  let highlightedText = text;

  entities.forEach(entity => {
    const escapedValue = entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let colorClass = 'pii-highlight-blue';
    if (entity.label.toLowerCase().includes('person')) colorClass = 'pii-highlight-orange';
    else if (entity.label.toLowerCase().includes('email')) colorClass = 'pii-highlight-orange';
    else if (entity.label.toLowerCase().includes('location')) colorClass = 'pii-highlight-blue';
    else if (entity.label.toLowerCase().includes('phone')) colorClass = 'pii-highlight-blue';

    const regex = new RegExp(escapedValue, 'g');
    highlightedText = highlightedText.replace(regex, `<span class="${colorClass}">${entity.text}</span>`);
  });

  return highlightedText;
}

async function sendPrompt() {
  const inputText = document.getElementById('promptInput').value.trim();
  if (!inputText) {
    alert('Please enter some text to analyze.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: inputText })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    const chatExample = document.getElementById('chatExample');
    const piiCount = document.getElementById('piiCount');
    const piiItemsList = document.getElementById('piiItemsList');

    if (data.entities && data.entities.length > 0) {
      chatExample.innerHTML = highlightPII(inputText, data.entities);
      piiCount.textContent = `${data.entities.length} item${data.entities.length > 1 ? 's' : ''}`;
      piiItemsList.innerHTML = data.entities.map(e => `
        <div class="pii-item ${e.label.toLowerCase().includes('person') || e.label.toLowerCase().includes('email') ? 'orange' : 'blue'}">
          <div class="pii-info">
            <div class="pii-type ${e.label.toLowerCase().includes('person') || e.label.toLowerCase().includes('email') ? 'orange' : 'blue'}">${e.label}</div>
            <div class="pii-value">${e.text}</div>
          </div>
          <div class="pii-confidence ${e.label.toLowerCase().includes('person') || e.label.toLowerCase().includes('email') ? 'orange' : 'blue'}">--%</div>
        </div>
      `).join('');
    } else {
      chatExample.textContent = inputText;
      piiCount.textContent = '0 items';
      piiItemsList.innerHTML = '';
    }

    if (data.entities && data.entities.length > 0) {
      const entityLines = data.entities.map(e => `- ${e.text} (${e.label})`).join('\n');
      document.getElementById('entitiesOutput').textContent = `Detected Entities:\n${entityLines}`;
    } else {
      document.getElementById('entitiesOutput').textContent = 'No entities detected.';
    }

    document.getElementById('llmResponseOutput').textContent = `${data.llm_response || 'No response from LLM.'}`;

    // Save this state
    chatSpacesData[currentChatSpace].input = inputText;
    chatSpacesData[currentChatSpace].entities = document.getElementById('entitiesOutput').textContent;
    chatSpacesData[currentChatSpace].llmResponse = document.getElementById('llmResponseOutput').textContent;
    chatSpacesData[currentChatSpace].highlightedExample = chatExample.innerHTML;

  } catch (error) {
    document.getElementById('llmResponseOutput').textContent = `Error: ${error.message}`;
  }
}
