# Use node 22
FROM node:22

# The directory to start from
WORKDIR /

#  Copies package files
COPY package*.json ./

# install dependencies
RUN npm install

# Copies the rest of the app
COPY . .

#Set port
ENV PORT=8080

# Expose the port
EXPOSE 8088

# Start server
CMD ["npm", "start"]
