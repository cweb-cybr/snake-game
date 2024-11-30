FROM mhart/alpine-node
# Update apk-tools to the fixed version and ensure all packages are updated
RUN apk update && apk upgrade --no-cache
COPY . /app
WORKDIR /app
EXPOSE 3000
CMD ["node", "app.js"]
