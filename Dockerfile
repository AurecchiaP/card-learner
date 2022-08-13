# start from base
FROM node:16

# make the directory on the Alpine Linux machine
RUN mkdir -p /usr/src/app

# set working directory
WORKDIR /usr/src/app

# copy the application code to the working directory
COPY . .

# fetch app specific dependencies
RUN npm install

# expose port
EXPOSE 4200

# start run with this command
CMD ["npm", "start"]