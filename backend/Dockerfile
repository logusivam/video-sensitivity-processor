# Use an official Node runtime as a parent image
FROM node:18-bullseye

# 📌 Install FFmpeg in the Linux container
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Create the uploads/temp directory so Multer doesn't crash
RUN mkdir -p uploads/temp

# Expose the port your app runs on
EXPOSE 5000

# Command to run your app
CMD ["npm", "start"]