# Record Maintenance Web Application

This is a full-stack web application designed for maintaining employee records efficiently and securely. The frontend is built with React and TypeScript, using Shadcn UI for a modern look and feel. The backend is powered by Node.js and Express, with a SQLite database for data persistence.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Workflow](#project-workflow)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)

## Features

-   **User Authentication**: Secure user registration and login with password hashing (bcrypt) and JWT for session management.
-   **Password Management**: Forgot and Reset Password functionality.
-   **Employee Management (CRUD)**:
    -   **C**reate: Add new employee records with master and detail information.
    -   **R**ead: View all employee records on a paginated and searchable table.
    -   **U**pdate: Edit existing employee information.
    -   **D**elete: Remove employee records with a confirmation step.
-   **Dashboard**: An overview page displaying key statistics like total employees, number of departments, etc.
-   **Advanced Search**: Robust search functionality to filter employees by ID, name, designation, or department.
-   **Secure by Design**: Implements essential web security headers to protect against common vulnerabilities.
-   **Responsive UI**: A modern and responsive user interface built with Shadcn UI and Tailwind CSS.

## Technology Stack

| Area      | Technology                                    |
| :-------- | :-------------------------------------------- |
| **Frontend**  | React, TypeScript, React Router, Tailwind CSS, Shadcn UI, Zod, React Hook Form |
| **Backend**   | Node.js, Express.js                           |
| **Database**  | SQLite                                        |
| **Security**  | JWT, bcrypt, Helmet                           |
| **Dev Tools** | Vite, Nodemon, ESLint                         |

## Project Workflow

The application follows a standard client-server architecture:

1.  **User Interaction**: The user interacts with the React frontend running in their browser.
2.  **API Requests**: The frontend sends API requests to the Node.js/Express backend for data or to perform actions.
3.  **Authentication**: Routes requiring authentication are protected by a JWT middleware. The frontend includes the JWT in the `Authorization` header of its requests.
4.  **Backend Logic**: The Express server processes these requests, interacts with the SQLite database, and enforces business logic.
5.  **Database Operations**: The backend uses the `sqlite3` driver to perform CRUD operations on the database.
6.  **API Response**: The backend sends a JSON response back to the frontend.
7.  **UI Update**: The frontend receives the response and updates the UI accordingly, providing feedback to the user via toasts and component state changes.

## Screenshots

<details>
  <summary><strong>Login and Registration Pages</strong></summary>

  *Login Page*
  ![Login Page](https://via.placeholder.com/600x400.png?text=Login+Page+UI)

  *Register Page*
  ![Register Page](https://via.placeholder.com/600x400.png?text=Register+Page+UI)
</details>

<details>
  <summary><strong>Dashboard and Employee List</strong></summary>

  *Dashboard*
  ![Dashboard](https://via.placeholder.com/600x400.png?text=Dashboard+UI)

  *Employee List Page*
  ![Employee List](https://via.placeholder.com/600x400.png?text=Employee+List+UI)
</details>

<details>
  <summary><strong>Add and Edit Employee Forms</strong></summary>
  
  *Add Employee Form*
  ![Add Employee Form](https://via.placeholder.com/600x400.png?text=Add+Employee+Form+UI)

  *Edit Employee Form*
  ![Edit Employee Form](https://via.placeholder.com/600x400.png?text=Edit+Employee+Form+UI)
</details>


## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

Follow these steps to set up the project locally.

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Set up the Backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Set up the Frontend:**
    ```bash
    cd ../frontend # or your frontend directory name
    npm install
    ```

## Running the Application

You need to run both the frontend and backend servers concurrently in separate terminal windows.

1.  **Start the Backend Server:**
    -   Navigate to the `backend` directory.
    -   This command will start the server, create the `record_maintenance.db` file if it doesn't exist, and watch for file changes.
    ```bash
    npm start
    # Or using nodemon directly
    # nodemon index.js
    ```
    -   The backend will be running on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    -   Navigate to the `frontend` directory.
    -   This command will start the Vite development server.
    ```bash
    npm run dev
    ```
    -   The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

Now, open your browser and navigate to `http://localhost:5173` to use the application.

## Database Schema

The application uses a SQLite database with three main tables.

<details>
  <summary><strong>TblUserMaster</strong></summary>
  
  Stores user credentials and basic information.

| Column       | Type    | Constraints                             | Description                            |
| :----------- | :------ | :-------------------------------------- | :------------------------------------- |
| `userID`     | INTEGER | PRIMARY KEY, AUTOINCREMENT              | Unique identifier for the user.        |
| `userName`   | TEXT    | NOT NULL, UNIQUE                        | User's unique username for login.      |
| `mobileNumber` | TEXT  | NOT NULL                                | User's mobile number.                  |
| `password`   | TEXT    | NOT NULL                                | Hashed password for the user.          |

</details>

<details>
  <summary><strong>TblEmployeeMaster</strong></summary>
  
  Stores the primary information for each employee.

| Column      | Type    | Constraints                          | Description                               |
| :---------- | :------ | :----------------------------------- | :---------------------------------------- |
| `mastCode`  | INTEGER | PRIMARY KEY, AUTOINCREMENT           | Unique identifier for the employee record.|
| `userID`    | INTEGER | FOREIGN KEY (TblUserMaster)          | The user who created this record.         |
| `empID`     | TEXT    | NOT NULL, UNIQUE                     | The employee's unique company ID.         |
| `empName`   | TEXT    | NOT NULL                             | The full name of the employee.            |
| `designation`| TEXT   |                                      | The employee's job title.                 |
| `department`| TEXT    |                                      | The department the employee works in.     |
| `joinedDate`| TEXT    |                                      | The date the employee joined.             |
| `salary`    | REAL    |                                      | The employee's salary.                    |

</details>

<details>
  <summary><strong>TblEmployeeDetail</strong></summary>

  Stores detailed address information for each employee, linked to `TblEmployeeMaster`.

| Column      | Type    | Constraints                          | Description                               |
| :---------- | :------ | :----------------------------------- | :---------------------------------------- |
| `empDetailID`| INTEGER| PRIMARY KEY, AUTOINCREMENT           | Unique ID for the detail record.          |
| `mastCode`  | INTEGER | UNIQUE, FOREIGN KEY (TblEmployeeMaster)| Links to the corresponding employee master record. |
| `addressLine1`| TEXT   |                                      | The first line of the employee's address. |
| `addressLine2`| TEXT   |                                      | The second line of the employee's address.|
| `city`      | TEXT    |                                      | The city of the employee's address.       |
| `state`     | TEXT    |                                      | The state or province.                    |
| `country`   | TEXT    |                                      | The country of the employee's address.    |

</details>

## API Endpoints

All endpoints are prefixed with `/api`. Authenticated routes require a `Bearer <token>` in the `Authorization` header.

| Method | Endpoint                    | Description                                  | Auth Required |
| :----- | :-------------------------- | :------------------------------------------- | :------------ |
| `POST` | `/register`                 | Creates a new user.                          | No            |
| `POST` | `/login`                    | Authenticates a user and returns a JWT.      | No            |
| `POST` | `/forgot-password`          | Simulates sending a password reset link.     | No            |
| `POST` | `/reset-password`           | Updates a user's password.                   | No            |
| `GET`  | `/employees`                | Gets a list of all employees (searchable).   | Yes           |
| `GET`  | `/employees/:mastCode`      | Gets a single employee by their `mastCode`.  | Yes           |
| `POST` | `/employees`                | Adds a new employee record.                  | Yes           |
| `PUT`  | `/employees/:mastCode`      | Updates an existing employee record.         | Yes           |
| `DELETE`| `/employees/:mastCode`      | Deletes an employee record.                  | Yes           |

## Security Features

Security is a core aspect of this application. The following measures have been implemented on the backend:

-   **Password Hashing**: Passwords are never stored in plaintext. They are hashed using `bcrypt` before being saved to the database.
-   **JWT for Authentication**: User sessions are managed using JSON Web Tokens, which are stateless and secure.
-   **HTTP Security Headers**: The `helmet` middleware is used to set crucial HTTP headers that help protect against common web vulnerabilities:
    -   `Strict-Transport-Security`: Enforces the use of HTTPS.
    -   `X-Content-Type-Options`: Prevents MIME-type sniffing.
    -   `X-Frame-Options`: Protects against clickjacking attacks.
    -   `X-XSS-Protection`: Provides a layer of protection against Cross-Site Scripting (XSS).
-   **CORS**: The `cors` middleware is configured to only allow requests from the frontend application's origin in a production environment.
-   **Foreign Key Constraints**: The database enforces foreign key constraints to maintain data integrity, preventing orphaned records.
-   **Input Validation**: The frontend uses `zod` for schema-based validation to ensure data integrity before it's even sent to the backend.