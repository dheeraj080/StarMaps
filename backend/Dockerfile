FROM python:3.12-slim

WORKDIR /app

# System deps (optional but handy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app ./app

# Default (compose overrides per-service)
CMD ["python", "-c", "print('Use docker-compose to run api/worker')"]
