Here is a comprehensive and professional `README.md` tailored for this crochet store interface. It highlights the current setup, features, and addresses your concerns regarding data integrity and wrong entries in Google Sheets.

---

# HADMADE 🧶 – Crochet Shop Interface

A lightweight, visually charming, and responsive web-based storefront built for a boutique crochet business (**HADMADE / Loopy & Co.**). The application showcases handmade plushies, accessories, and keychains, features an interactive shopping cart, and includes a direct custom order request pipeline integrated with **Google Sheets**.

---

## 🚀 Features

* **Cozy, Aesthetic UI:** A clean, pastel-themed layout optimized with scannable grid layouts, product tags (e.g., *Bestseller*, *New*), and hover animations.
* **Interactive Cart System:** Seamless client-side basket functionality allowing users to add items and view real-time totals before checkout.
* **Custom Order Pipeline:** A dedicated custom order form enabling users to submit personalized requests, specific design parameters, and budget expectations.
* **Google Sheets Backend Integration:** Order form data is transmitted via asynchronous API calls (`fetch`/`axios`) to a Google App Script Web App, storing order logs directly into a secure Google Excel sheet in real time.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+)
* **Database/Backend:** Google Sheets API via **Google Apps Script (Web App)**
* **Deployment:** Static hosting (GitHub Pages, Vercel, or local server)

---

## 📊 Database Architecture (Google Sheets)

When a customer submits a "Custom Order", the data is mapped to the following columns in the linked spreadsheet:

| Timestamp | Customer Name | Contact Info (Phone/Insta) | Request Details | Budget (₹) | Status |
| --- | --- | --- | --- | --- | --- |
| `DD/MM/YYYY HH:MM` | Priya Sharma | `@priya_stitches` | Pink bunny plushie, 20cm | 450 | *Pending* |

---

## ⚠️ Mitigating False or Wrong Entries (Future Enhancements)

Because data is being piped directly into a public Google Sheet, dealing with **spam, incomplete submissions, or malicious/false data** is highly critical. Below are the roadmap implementations to address these concerns:

### 1. Robust Frontend Validation (Immediate Next Step)

* **Strict Input Constraints:** Prevent form submission if inputs are empty or fail specific patterns.
* **Regex Checks:** Force the *Phone/Instagram* field to validate phone numbers strictly or ensure Instagram handles start with an `@`.
* **Budget Range Enforcement:** Turn the budget input into a dropdown or a slider to prevent users from typing unfeasible numbers (e.g., negative amounts or letters).

### 2. Backend Security & Anti-Spam

* **Google reCAPTCHA Integration:** Add a "I'm not a robot" checkbox to stop automated spam bots from flooding the Google Sheet.
* **Rate Limiting:** Throttle requests by tracking IP addresses so a single user cannot hit "Send Request" repeatedly within a short timeframe.

### 3. Data Sanitization in Google Apps Script

* Before writing rows to the spreadsheet, updating the Google Apps Script to parse, clean, and validate data server-side:
```javascript
// Example logical check inside Apps Script
if (budget < 50 || budget > 10000) {
    return ContentService.createTextOutput("Error: Invalid Budget");
}

```



### 4. Admin Dashboard / Approval Workflow

* **The "Buffer" Sheet System:** Instead of sending orders directly to your main fulfillment sheet, push incoming entries to a **"Raw Submissions"** tab. The business owner can then manually review and change a status dropdown to "Approved" to push it to the active production queue, shielding your main workspace from wrong entries.

---

## 💻 Getting Started

### Prerequisites

To test or edit the site locally:

1. Clone this repository.
2. Open `index.html` via a local server extension (like *Live Server* in VS Code).

### Setting up the Google Sheet Connection

1. Create a new Google Sheet.
2. Go to **Extensions > Apps Script** and paste your deployment script handling the `doPost(e)` method.
3. Deploy it as a **Web App** with access set to *"Anyone"*.
4. Copy the generated Web App URL and replace the placeholder API endpoint inside your JavaScript file.
