FROM node:20-alpine

# Use an unprivileged user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directory and chown to appuser
WORKDIR /usr/src/app
RUN chown appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Install dependencies first for better caching
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --only=production

# Copy app source code
COPY --chown=appuser:appgroup . .

# Expose port (will be mapped in docker-compose)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "src/app.js"]
