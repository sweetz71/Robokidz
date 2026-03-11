# Employee Management Mini Application

A simple full-stack Employee Management app built with Node.js, Express, and Local JSON storage.

## Features

- Employee registration form with fields:
  - Employee Name
  - Email
  - Mobile Number
  - Department
  - Salary
- Frontend validations:
  - All fields mandatory
  - Valid email format
  - Mobile number must be exactly 10 digits
- Employee table listing after submission
- Backend APIs:
  - `POST /api/employees` (save employee)
  - `GET /api/employees` (fetch list)
  - `DELETE /api/employees/:id` (delete employee)
  - `PUT /api/employees/:id` (bonus: update employee)
- Local JSON database in `data/employees.json`

## Project Structure

- `server.js` - Express API server and static file hosting
- `public/index.html` - UI markup
- `public/styles.css` - UI styles
- `public/script.js` - client-side logic and validations
- `data/employees.json` - local JSON datastore

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the application:
   ```bash
   npm start
   ```
3. Open in browser:
   - `http://localhost:3000`

## Validation Notes

Both frontend and backend validate:

- Required fields
- Email format
- 10-digit mobile number
- Positive numeric salary

## Submission

- Push source code to your GitHub repository.
- Share the repository link before deadline.
