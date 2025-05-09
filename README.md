﻿# unlock-to-thrive-backend


This is the backend for the Unlock-to-Thrive platform, a mentorship and career development resource. It provides APIs for user authentication, career management, student profiles, mentor applications.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for creating APIs.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM library for MongoDB.
- **JWT (jsonwebtoken)**: For user authentication and authorization.
- **Bcrypt**: For password hashing.
- **Cloudinary**: For file storage and image management.
- **Multer**: Middleware for handling file uploads.
- **Nodemailer**: For sending emails (e.g., password reset).
- **dotenv**: For managing environment variables.
- **Cors**: For enabling cross-origin requests.

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm (Node Package Manager)

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd unlock-to-thrive-backend

2.  Install dependencies:
    * npm install

3. Configure environment variables:

Create a .env file in the root directory.
Add the required variables (e.g., database connection string, API keys, etc.). Refer to the .env.example file for guidance.

4. Start the development server:
    * npm run dev

The server will run on http://localhost:5000 by default.

5. To build and run the project in production:
   * npm start

API Documentation
The backend provides RESTful APIs for various functionalities, including user authentication, profile management, and career resources. Refer to the API documentation or codebase for detailed endpoint information.

License
This project is licensed under the MIT License.
