# Rebuild Instructions for Dynamic HTML

## Important: Your Command Had a Typo

### ❌ Wrong (missing 'l'):
```bash
bash scripts/setup.sh --demo=automail --web_port=8002 --enable_dynamic_htm=true
```

### ✅ Correct:
```bash
bash scripts/setup.sh --demo=automail --web_port=8002 --enable_dynamic_html=true
```

---

## Why Layouts Weren't Changing

1. **Environment variables are set at BUILD time** in Next.js
2. The Dockerfile needed to receive the `ENABLE_DYNAMIC_HTML` build argument
3. I've updated the Dockerfile to accept the build argument

---

## Fixed Dockerfile Changes

**Added these lines:**
```dockerfile
# Accept build argument
ARG ENABLE_DYNAMIC_HTML=false

# Set environment variables for build
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
```

This ensures the environment variable is available during `npm run build`.

---

## Rebuild and Test

### Step 1: Stop and remove the old container
```bash
docker compose -p automail_8002 down --volumes
```

### Step 2: Deploy with dynamic HTML enabled (use correct spelling)
```bash
bash scripts/setup.sh --demo=automail --web_port=8002 --enable_dynamic_html=true
```

### Step 3: Verify environment variables
```bash
docker exec automail_8002-web-1 printenv NEXT_PUBLIC_ENABLE_DYNAMIC_HTML
```

Expected output: `true`

### Step 4: Check the build logs
```bash
docker logs automail_8002-web-1 2>&1 | Select-String "ENABLE_DYNAMIC_HTML"
```

Expected to see:
```
ENABLE_DYNAMIC_HTML: true
NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: true
```

### Step 5: Test different seed values
```
http://localhost:8002/?seed=1   # Layout 1
http://localhost:8002/?seed=5   # Layout 2
http://localhost:8002/?seed=180 # Layout 11
http://localhost:8002/?seed=200 # Layout 20
```

### Step 6: Verify dynamic attributes
Open browser DevTools → Elements tab, and inspect any button element. You should see:
```html
<button 
  id="VIEW_EMAIL-180-0"
  data-element-type="VIEW_EMAIL"
  data-seed="180"
  data-variant="0"
  data-xpath="//button[@data-seed='180']"
  class="dynamic-button-seed-180"
>
```

---

## Common Issues

### Issue 1: Typo in command
**Problem:** `--enable_dynamic_htm=true` (missing 'l')
**Solution:** Use `--enable_dynamic_html=true`

### Issue 2: Old build cached
**Problem:** Docker is using old build without environment variables
**Solution:** Rebuild with `--build` flag or remove containers first

### Issue 3: Browser cache
**Problem:** Browser cached old JavaScript
**Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

---

## Quick Troubleshooting

```bash
# 1. Remove old containers
docker compose -p automail_8002 down --volumes

# 2. Clean Docker system
docker system prune -f

# 3. Deploy with correct command (note the spelling!)
bash scripts/setup.sh --demo=automail --web_port=8002 --enable_dynamic_html=true

# 4. Wait for build to complete, then test
# Visit: http://localhost:8002/?seed=180

# 5. Check if dynamic attributes are present
# Open browser DevTools and inspect elements
```

---

## Expected Behavior

### When ENABLE_DYNAMIC_HTML=true
- ✅ Different seeds show different layouts
- ✅ Elements have `data-seed` attributes
- ✅ Elements have `data-xpath` attributes
- ✅ CSS classes include `seed-X`
- ✅ Layout changes from seed to seed

### When ENABLE_DYNAMIC_HTML=false
- ❌ All seeds show the same layout
- ❌ No `data-seed` attributes
- ❌ No `data-xpath` attributes
- ❌ No `seed-X` CSS classes
- ❌ Layout stays the same

---

## Action Required

Run this command with the **correct spelling**:

```bash
bash scripts/setup.sh --demo=automail --web_port=8002 --enable_dynamic_html=true
```

Then test: `http://localhost:8002/?seed=180`
