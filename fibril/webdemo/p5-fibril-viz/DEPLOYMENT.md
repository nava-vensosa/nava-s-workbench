# Deployment Guide - Digital Ocean Droplet

This guide will walk you through deploying the Fibril Algorithm Visualization app to a Digital Ocean droplet.

## Prerequisites

- A Digital Ocean account
- A registered domain name (optional, but recommended)
- SSH client installed on your local machine

## Step 1: Create a Digital Ocean Droplet

1. Log into your Digital Ocean account
2. Click "Create" → "Droplets"
3. Choose an image:
   - **Recommended**: Ubuntu 22.04 LTS x64
4. Choose a plan:
   - **Recommended**: Basic plan, $6/month (1 GB RAM, 1 CPU)
5. Choose a datacenter region (closest to your users)
6. Authentication:
   - **Recommended**: SSH keys (more secure)
   - Alternative: Password
7. Finalize and create
8. Note your droplet's IP address

## Step 2: Initial Server Setup

### Connect to your droplet via SSH

```bash
ssh root@YOUR_DROPLET_IP
```

### Update system packages

```bash
apt update && apt upgrade -y
```

### Create a non-root user (recommended)

```bash
adduser fibril
usermod -aG sudo fibril
```

### Switch to the new user

```bash
su - fibril
```

## Step 3: Install Node.js

### Install Node.js using NodeSource repository

```bash
# Install curl if not already installed
sudo apt install -y curl

# Add Node.js 18.x repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 4: Install PM2 (Process Manager)

PM2 keeps your Node.js app running and restarts it if it crashes.

```bash
sudo npm install -g pm2
```

## Step 5: Deploy Your Application

### Clone or upload your code

**Option A: Using Git (recommended)**

```bash
# Install git if needed
sudo apt install -y git

# Clone your repository
cd ~
git clone YOUR_REPOSITORY_URL
cd p5-fibril-viz
```

**Option B: Upload files via SCP**

From your local machine:

```bash
scp -r /path/to/p5-fibril-viz fibril@YOUR_DROPLET_IP:~/
```

### Install dependencies

```bash
cd ~/p5-fibril-viz
npm install
```

### Configure environment variables

```bash
nano .env
```

Update the `.env` file:

```
PORT=3000
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

### Create saved-runs directory

```bash
mkdir -p saved-runs
```

## Step 6: Start the Application with PM2

```bash
# Start the app with PM2
pm2 start server.js --name fibril-viz

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup systemd
# Follow the instructions PM2 provides (copy and run the command)

# Check status
pm2 status
pm2 logs fibril-viz
```

### PM2 Useful Commands

```bash
pm2 list              # List all processes
pm2 logs fibril-viz   # View logs
pm2 restart fibril-viz # Restart app
pm2 stop fibril-viz   # Stop app
pm2 delete fibril-viz # Remove from PM2
```

## Step 7: Install and Configure Nginx (Reverse Proxy)

Nginx will serve as a reverse proxy, forwarding requests to your Node.js app.

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/fibril-viz
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Replace `YOUR_DOMAIN_OR_IP` with your actual domain or droplet IP.

### Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/fibril-viz /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Configure firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 8: Set Up SSL with Let's Encrypt (Optional but Recommended)

SSL is required for HTTPS and is highly recommended.

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL certificate

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

Follow the prompts. Certbot will automatically configure Nginx for HTTPS.

### Auto-renewal

Certbot automatically sets up a renewal cronjob. Test it:

```bash
sudo certbot renew --dry-run
```

## Step 9: Configure Domain Name (Optional)

If you have a domain:

1. Go to your domain registrar's DNS settings
2. Add an A record pointing to your droplet's IP:
   - **Type**: A
   - **Name**: @ (or subdomain like `fibril`)
   - **Value**: YOUR_DROPLET_IP
   - **TTL**: 3600

DNS propagation can take up to 48 hours but usually happens within minutes.

## Step 10: Test Your Deployment

Visit your site:
- **HTTP**: `http://YOUR_DROPLET_IP` or `http://YOUR_DOMAIN`
- **HTTPS**: `https://YOUR_DOMAIN` (if SSL is configured)

Test the API:
```bash
curl http://YOUR_DROPLET_IP/api/health
```

## Updating Your Application

When you make changes to your code:

```bash
# Pull latest changes (if using Git)
cd ~/p5-fibril-viz
git pull

# Install any new dependencies
npm install

# Restart the app
pm2 restart fibril-viz

# Check logs
pm2 logs fibril-viz
```

## Monitoring and Maintenance

### View application logs

```bash
pm2 logs fibril-viz
pm2 logs fibril-viz --lines 100  # View last 100 lines
```

### Monitor resource usage

```bash
pm2 monit
```

### View saved runs

```bash
ls -lh ~/p5-fibril-viz/saved-runs/
```

### Backup saved runs

```bash
# From your local machine
scp -r fibril@YOUR_DROPLET_IP:~/p5-fibril-viz/saved-runs ./backup-$(date +%Y%m%d)
```

### Clear old saved runs

```bash
cd ~/p5-fibril-viz/saved-runs
# Delete runs older than 30 days
find . -name "*.json" -mtime +30 -delete
```

## Troubleshooting

### App not accessible

1. Check if Node.js is running:
   ```bash
   pm2 status
   ```

2. Check app logs:
   ```bash
   pm2 logs fibril-viz
   ```

3. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

4. Check Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

5. Check firewall:
   ```bash
   sudo ufw status
   ```

### Port already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 PID
```

### Out of memory

If your droplet runs out of memory, consider:
1. Upgrading to a larger droplet
2. Adding swap space:
   ```bash
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

## Security Best Practices

1. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys instead of passwords**
3. **Disable root SSH login**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart sshd
   ```

4. **Set up automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

5. **Monitor failed login attempts**:
   ```bash
   sudo tail /var/log/auth.log
   ```

## Cost Optimization

- **Basic droplet**: $6/month is sufficient for moderate traffic
- **Resize as needed**: Digital Ocean allows easy resizing
- **Use snapshots**: Create backups before major changes

## Additional Resources

- [Digital Ocean Documentation](https://docs.digitalocean.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
