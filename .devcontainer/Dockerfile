# Creative Muse AI Development Container
FROM mcr.microsoft.com/devcontainers/python:1-3.11-bullseye

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install additional system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        curl \
        wget \
        unzip \
        sqlite3 \
        build-essential \
        python3-dev \
        python3-pip \
        python3-venv \
        lsof \
        htop \
        tree \
        jq \
        vim \
        nano \
    && apt-get autoremove -y && apt-get clean -y

# Install global npm packages for development
RUN npm install -g \
    create-vite \
    typescript \
    eslint \
    prettier \
    serve \
    concurrently

# Create workspace directory
WORKDIR /workspace

# Set up Python environment
ENV PYTHONPATH=/workspace
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set up Node.js environment
ENV NODE_ENV=development
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

# Create logs directory
RUN mkdir -p /workspace/logs

# Set proper permissions for vscode user
RUN chown -R vscode:vscode /workspace

# Switch to vscode user
USER vscode

# Install Python development tools and security tools
RUN pip install --user --upgrade pip setuptools wheel pip-audit

# Set up shell environment
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
RUN echo 'export PYTHONPATH="/workspace:$PYTHONPATH"' >> ~/.bashrc

# Default command
CMD ["sleep", "infinity"]