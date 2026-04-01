# Video Sensitivity Processor

## Overview
The Video Sensitivity Processor is a full-stack application designed to process and manage video content with sensitivity analysis. It includes a backend built with Node.js and Express, and a frontend developed using React and Vite. The application leverages MongoDB for data storage and integrates with third-party services like Supabase and Fluent-FFmpeg for additional functionality.

### Features
- User authentication and session management
- Video upload and processing
- Sensitivity analysis for video content
- Real-time updates using Socket.IO
- RESTful API for backend services
- Responsive and modern frontend design

### Technologies Used
#### Backend
- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for data storage.
- **Supabase**: Integration for additional backend services.
- **Fluent-FFmpeg**: Video processing library.
- **Socket.IO**: Real-time communication.

#### Frontend
- **React**: JavaScript library for building user interfaces.
- **Vite**: Build tool for modern web applications.
- **Tailwind CSS**: Utility-first CSS framework.

## Project Structure
### Backend
- **src/**: Contains the main application logic.
  - **api/v1/controllers/**: Controllers for handling API requests.
  - **api/v1/middlewares/**: Middleware for request validation and rate limiting.
  - **api/v1/routes/**: API route definitions.
  - **config/**: Configuration files for database, keys, and services.
  - **models/**: Mongoose models for database schemas.
  - **services/**: Service layer for business logic.
  - **utils/**: Utility functions.
- **uploads/**: Directory for uploaded files.
- **temp/**: Temporary storage for processing files.

### Frontend
- **src/**: Contains the main application logic.
  - **components/**: Reusable UI components.
  - **pages/**: Page-level components for routing.
  - **services/**: API client and service functions.
  - **utils/**: Utility functions.
  - **assets/**: Static assets like CSS and images.

## Documentation Package

### Installation and Setup Guide
#### Prerequisites
- **Node.js**: Ensure Node.js is installed on your system.
- **MongoDB**: Install and configure MongoDB for data storage.
- **FFmpeg**: Install FFmpeg globally for video processing.

#### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the backend folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Navigate to the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Install FFmpeg globally:
   - On Windows:
     1. Download FFmpeg from the [official website](https://ffmpeg.org/download.html).
     2. Extract the files and add the `bin` folder to your system's PATH.
   - On macOS:
     ```bash
     brew install ffmpeg
     ```
   - On Linux:
     ```bash
     sudo apt update
     sudo apt install ffmpeg
     ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
6. Start the frontend development server:
   ```bash
   npm run dev
   ```

### API Documentation
#### Authentication
- **POST /api/v1/auth/login**: User login.
- **POST /api/v1/auth/register**: User registration.
- **POST /api/v1/auth/forgot-password**: Request password reset.
- **POST /api/v1/auth/reset-password**: Reset password.

#### Video Processing
- **POST /api/v1/videos/upload**: Upload a video for processing.
- **GET /api/v1/videos/:id**: Get video details.
- **DELETE /api/v1/videos/:id**: Delete a video.

#### Utilities
- **GET /api/v1/utils/status**: Check server status.

### User Manual
#### Overview
The Video Sensitivity Processor allows users to upload videos, analyze their sensitivity, and manage video content efficiently. The application provides a user-friendly interface and robust backend services.

#### Features
- **Authentication**: Secure login and registration.
- **Video Upload**: Upload videos for sensitivity analysis.
- **Real-Time Updates**: Get real-time updates on video processing status.
- **Video Management**: View, delete, and manage uploaded videos.

#### How to Use
1. **Login/Register**: Create an account or log in to access the application.
2. **Upload Video**: Navigate to the upload section and select a video file.
3. **View Results**: Once processed, view the sensitivity analysis results.
4. **Manage Videos**: Use the dashboard to manage your uploaded videos.

### Architecture Overview
#### Backend
- **Node.js**: Handles server-side logic and API endpoints.
- **Express**: Framework for building RESTful APIs.
- **MongoDB**: Stores user data, video metadata, and processing results.
- **FFmpeg**: Processes video files for sensitivity analysis.
- **Socket.IO**: Enables real-time communication between the server and clients.

#### Frontend
- **React**: Provides a dynamic and responsive user interface.
- **Vite**: Ensures fast builds and hot module replacement.
- **Tailwind CSS**: Simplifies styling with utility-first CSS classes.

### Assumptions and Design Decisions
1. **Video Processing**: Assumes FFmpeg is installed globally and accessible via the system PATH.
2. **Database**: MongoDB is used for its flexibility and scalability.
3. **Authentication**: JWT-based authentication is implemented for security.
4. **Real-Time Updates**: Socket.IO is used to provide real-time feedback to users.
5. **Frontend Framework**: React was chosen for its component-based architecture and developer-friendly ecosystem.

## Installation
### Prerequisites
- Node.js
- MongoDB

### Steps
1. Clone the repository.
2. Navigate to the backend folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Navigate to the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
5. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.