# Number Munchers 3D - Installation Guide

## WSL Permission Issue Solution

The npm install is failing due to WSL mounting Windows drives without proper permissions. Here are the solutions:

### Solution 1: Copy project to WSL filesystem (Recommended)
```bash
# Copy the project to your WSL home directory
cp -r /mnt/c/Projects/Mmmunchers ~/Mmmunchers
cd ~/Mmmunchers
npm install
npm run dev
```

### Solution 2: Clone directly in WSL
```bash
cd ~
git clone <your-repo-url> Mmmunchers
cd Mmmunchers
npm install
npm run dev
```

### Solution 3: Use npm with --no-bin-links
```bash
# In the current directory
npm install --no-bin-links
npm run dev
```

### Solution 4: Enable WSL metadata (requires WSL restart)
Create `/etc/wsl.conf` with:
```
[automount]
options = "metadata"
```
Then restart WSL:
```bash
# In Windows PowerShell/CMD:
wsl --shutdown
# Then restart your WSL terminal
```

## Security Fixes Applied

✅ **Fixed server binding** - Now binds to 127.0.0.1 by default
✅ **Added security headers** - X-Frame-Options, X-Content-Type-Options, etc.
✅ **Added CORS configuration** - Configurable via ALLOWED_ORIGIN env var
✅ **Removed password storage** - Replaced with game progress tracking
✅ **Removed credentials from fetch** - No authentication needed

## Running the Game

1. Install dependencies (use one of the solutions above)
2. Set up environment:
   ```bash
   # Optional: Only if using database features
   echo "DATABASE_URL=postgresql://..." > .env
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5000 in your browser

## Production Deployment

For production hosting:
1. Set `NODE_ENV=production`
2. Set `HOST=0.0.0.0` to allow external connections
3. Set `ALLOWED_ORIGIN=https://yourdomain.com` for CORS
4. Build and start:
   ```bash
   npm run build
   npm run start
   ```

The game is now secure for public hosting!