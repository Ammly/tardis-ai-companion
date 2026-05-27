# Tardis AI Companion 🌌

A sentient, slightly temperamental Type 40 time machine (TARDIS) AI companion built using **Flask** and the **Google Gen AI SDK**.

This project implements a conversational agent styled as the TARDIS from Doctor Who—prone to complaining about parking brakes, explaining the time vortex, and always taking you where you *need* to go rather than where you want to go.

---

## 🚀 Features

- **TARDIS Personality**: Custom-defined persona utilizing the `gemini-2.5-flash` model.
- **Google Search Integration**: Equipped with search tools to find information in real time.
- **Dynamic Web Interface**: Interactive chatting UI with subtle custom micro-animations (vworp!).

---

## 🛠️ Setup & Installation

### 1. Prerequisites
Make sure you have Python 3.10+ installed.

### 2. Configure Environment
Run the configuration scripts to save your API keys and project settings securely:
```bash
# Set your Google Cloud Project ID
./init.sh

# Set your Gemini API Key
./setupAPIkey.sh
```

### 3. Install Dependencies
Create a virtual environment and install the required Python libraries:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Run the Application
Source the environment variables and run the Flask web server:
```bash
# Source environment configurations
source ./set_env.sh

# Run the Flask app
python app.py
```
The server will start on **`http://127.0.0.1:5000`**.

---

## 📁 Project Structure

- `app.py`: Main Flask application handling sessions and routing.
- `character.py`: Defines the TARDIS LLM Agent and its persona instructions.
- `templates/` & `static/`: Contains HTML structure, styling, and JavaScript logic for the web application UI.
