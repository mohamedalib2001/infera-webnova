#!/bin/bash
set -e

APP_NAME="infera-webnova"
APP_DIR="/var/www/infera-webnova"
LOG_FILE="/var/log/infera-deploy.log"
BACKUP_DIR="/var/backups/infera"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

rollback() {
    log "ERROR: Deployment failed! Rolling back..."
    cd "$APP_DIR"
    git reset --hard HEAD~1
    npm ci
    npm run build
    npm prune --production
    pm2 restart "$APP_NAME" || true
    log "Rollback completed. Please verify the application."
    exit 1
}

trap rollback ERR

log "========================================="
log "Starting INFERA WebNova Deployment"
log "========================================="

cd "$APP_DIR" || { log "ERROR: App directory not found"; exit 1; }

log "Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME" 2>/dev/null || true

log "Pulling latest changes from GitHub..."
git fetch origin main
git reset --hard origin/main

log "Installing dependencies (including dev for build)..."
npm ci

log "Building application..."
npm run build

log "Pruning dev dependencies for production..."
npm prune --production

log "Running database migrations..."
npm run db:push

log "Restarting application with PM2..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 restart "$APP_NAME"
else
    pm2 start npm --name "$APP_NAME" -- run start
fi

pm2 save

log "Waiting for application to start..."
sleep 5

log "Running health check..."
if curl -sf http://localhost:5000/api/health > /dev/null; then
    log "Health check PASSED"
else
    log "ERROR: Health check failed!"
    rollback
fi

log "Cleaning old backups (keeping last 5)..."
ls -t "$BACKUP_DIR" | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}" 2>/dev/null || true

log "========================================="
log "Deployment completed successfully!"
log "========================================="
