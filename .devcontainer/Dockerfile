# Use the official Microsoft DevContainer Python image
FROM mcr.microsoft.com/devcontainers/python:1-3.11-bullseye

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    sqlite3 \
    libsqlite3-dev \
    pkg-config \
    libssl-dev \
    libffi-dev \
    python3-dev \
    nodejs \
    npm \
    vim \
    nano \
    htop \
    tree \
    jq \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js LTS (if not already installed by base image)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install global npm packages for development
RUN npm install -g \
    live-server \
    http-server \
    prettier \
    eslint

# Create workspace directory
WORKDIR /workspace

# Copy requirements first for better Docker layer caching
COPY ../ai_core/requirements.txt /tmp/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# Install additional development tools
RUN pip install --no-cache-dir \
    black \
    flake8 \
    pylint \
    mypy \
    pytest \
    pytest-cov \
    ipython \
    jupyter \
    pre-commit \
    bandit \
    safety

# Create directories for logs and data
RUN mkdir -p /workspace/logs /workspace/data /workspace/temp

# Set up git safe directory (for when workspace is mounted)
RUN git config --global --add safe.directory /workspace

# Create a non-root user (vscode user is already created by base image)
USER vscode

# Set the default shell
SHELL ["/bin/bash", "-c"]

# Expose ports
EXPOSE 8000 3000 5000

# Default command
CMD ["sleep", "infinity"]