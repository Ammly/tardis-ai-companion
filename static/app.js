document.addEventListener('DOMContentLoaded', () => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const textInput = document.getElementById('text-input');
    const sendButton = document.getElementById('send-button');
    const characterImage = document.getElementById('character-image');
    const voiceSelect = document.getElementById('voice-select');
    const status = document.getElementById('status');

    const openMouthImg = `/static/images/char-mouth-open.png?v=${sessionId}`;
    const closedMouthImg = `/static/images/char-mouth-closed.png?v=${sessionId}`;

    // Apply cache-busted source immediately and preload images
    characterImage.src = closedMouthImg;
    const preloadOpen = new Image();
    preloadOpen.src = openMouthImg;
    const preloadClosed = new Image();
    preloadClosed.src = closedMouthImg;

    let voices = [];
    let lipSyncInterval;
    let isSpeaking = false;
    let isTyping = false;

    function startLipSync() {
        if (lipSyncInterval) return;
        characterImage.classList.add('speaking');
        let mouthOpen = true;
        lipSyncInterval = setInterval(() => {
            characterImage.src = mouthOpen ? openMouthImg : closedMouthImg;
            mouthOpen = !mouthOpen;
        }, 150);
    }

    function stopLipSync() {
        if (isSpeaking || isTyping) return;
        clearInterval(lipSyncInterval);
        lipSyncInterval = null;
        characterImage.classList.remove('speaking');
        characterImage.src = closedMouthImg;
    }

    function populateVoiceList() {
        const allVoices = speechSynthesis.getVoices();
        voices = allVoices.filter(voice => voice.name.includes('Google'));
        if (voices.length === 0) {
            voices = allVoices;
        }
        voiceSelect.innerHTML = '';

        let usVoiceIndex = -1;

        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);

            if (voice.lang === 'en-US') {
                if (usVoiceIndex === -1) { // Find the first US voice
                    usVoiceIndex = i;
                }
            }
        });

        if (usVoiceIndex !== -1) {
            voiceSelect.selectedIndex = usVoiceIndex;
        }
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    const typewriter = (text, element, speed = 50, callback = null) => {
        element.classList.remove('empty');
        
        // Helper to parse markdown safely
        const parseMarkdown = (rawText) => {
            if (window.marked && typeof marked.parse === 'function') {
                return marked.parse(rawText);
            }
            return rawText.replace(/\n/g, '<br>');
        };

        // Use Intl.Segmenter to handle grapheme clusters correctly
        if (window.Intl && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
            const segments = Array.from(segmenter.segment(text)).map(s => s.segment);
            
            let i = 0;
            let currentText = "";
            element.innerHTML = "";

            function type() {
                if (i < segments.length) {
                    currentText += segments[i];
                    element.innerHTML = parseMarkdown(currentText);
                    i++;
                    setTimeout(type, speed);
                } else if (callback) {
                    callback();
                }
            }
            type();
        } else {
            // Fallback for older browsers
            let i = 0;
            let currentText = "";
            element.innerHTML = "";
            function type() {
                if (i < text.length) {
                    currentText += text.charAt(i);
                    element.innerHTML = parseMarkdown(currentText);
                    i++;
                    setTimeout(type, speed);
                } else if (callback) {
                    callback();
                }
            }
            type();
        }
    };

    const speak = (text) => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Guard against voiceSelect being empty
        const selectedOptionElement = voiceSelect.selectedOptions ? voiceSelect.selectedOptions[0] : null;
        const selectedOption = selectedOptionElement ? selectedOptionElement.getAttribute('data-name') : null;
        const selectedVoice = selectedOption ? voices.find(voice => voice.name === selectedOption) : null;
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            isSpeaking = true;
            startLipSync();
        };

        utterance.onend = () => {
            isSpeaking = false;
            stopLipSync();
        };

        utterance.onerror = () => {
            isSpeaking = false;
            stopLipSync();
        };

        speechSynthesis.speak(utterance);
    };

    const handleSendMessage = async () => {
        const message = textInput.value.trim();
        if (!message) return;

        textInput.value = '';
        textInput.style.height = '50px';
        status.classList.add('empty');
        status.textContent = "Thinking...";

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message, session_id: sessionId }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            isTyping = true;
            startLipSync();
            typewriter(data.response, status, 50, () => {
                isTyping = false;
                stopLipSync();
            });
            speak(data.response);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = 'Sorry, something went wrong. Please try again.';
            isTyping = true;
            startLipSync();
            typewriter(errorMessage, status, 50, () => {
                isTyping = false;
                stopLipSync();
            });
            speak(errorMessage);
        }
    };

    sendButton.addEventListener('click', handleSendMessage);

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    textInput.addEventListener('input', () => {
        textInput.style.height = 'auto';
        textInput.style.height = `${textInput.scrollHeight}px`;
    });
});
