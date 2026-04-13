FROM nginx:alpine

# Copy the static files to the nginx default serve directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
