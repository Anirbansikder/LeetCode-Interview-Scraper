# LeetCode Interview Scraper

A Node.js tool to scrape **LeetCode Discuss interview experiences** based on custom keywords and generate a curated list of relevant posts.

---

## Installation

npm install

---

## Usage

### Step 1: Authenticate with LeetCode

Run the following command:

node login.js

- This will open the LeetCode login page in your browser  
- Enter your email and password  
- Do NOT use OAuth (Google/GitHub login), as it won’t work. I am not stealing it 😛

After logging in:
- Return to the CLI  
- Press Enter  

This will store your session tokens locally in:

leetcode-auth.json

Tokens are stored only on your machine.

---

### Step 2: Configure Keywords

- Open exports.js  
- Add or remove keywords based on what you want to scrape  

Example:

module.exports = ["google", "amazon", "frontend", "react"];

---

### Step 3: Run the Scraper

node scrape-interviews.js

- The script will:
  - Scrape interview discussions matching your keywords  
  - Generate a file containing relevant post links  
  - Example: Google interview experiences  

---

## 📄 Output

- A generated file containing:
  - Filtered LeetCode discussion links  
  - Organized based on your keywords  

---

## 🧠 Future Improvements

- AI-based filtering to:
  - Remove low-quality discussions  
  - Keep only posts with actual interview questions  

- Integrate LeetCode compensation section  