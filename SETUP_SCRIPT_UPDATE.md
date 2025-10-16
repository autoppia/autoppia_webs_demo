# Setup Script Update - Dynamic HTML Support

## ✅ Changes Made to `scripts/setup.sh`

Successfully added `ENABLE_DYNAMIC_HTML` environment variable support to the main deployment script.

---

## 📝 What Was Changed

### 1. Added Header Documentation
**Lines 4-18:** Added comprehensive usage documentation at the top of the script with:
- Usage syntax
- All available options
- Example commands

### 2. Added Default Value
**Line 40:** Added default configuration:
```bash
ENABLE_DYNAMIC_HTML_DEFAULT="false"
```

### 3. Added Argument Parsing
**Line 50:** Added argument parser:
```bash
--enable_dynamic_html=*) ENABLE_DYNAMIC_HTML="${ARG#*=}" ;;
```

### 4. Added Variable Assignment
**Line 60:** Set default if not provided:
```bash
ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-$ENABLE_DYNAMIC_HTML_DEFAULT}"
```

### 5. Added Configuration Display
**Line 68:** Show value in startup output:
```bash
echo "    Enable Dynamic HTML:    →  $ENABLE_DYNAMIC_HTML"
```

### 6. Updated Deploy Function
**Line 105:** Pass variable to Docker Compose:
```bash
WEB_PORT="$webp" POSTGRES_PORT="$pgp" ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML" \
  docker compose -p "$proj" up -d --build
```

---

## 🚀 Usage Examples

### Deploy with Dynamic HTML Enabled

```bash
# Deploy AutoMail with dynamic HTML
./scripts/setup.sh --demo=automail --enable_dynamic_html=true

# Deploy AutoConnect with dynamic HTML
./scripts/setup.sh --demo=autoconnect --enable_dynamic_html=true

# Deploy all demos with dynamic HTML
./scripts/setup.sh --demo=all --enable_dynamic_html=true
```

### Deploy with Dynamic HTML Disabled (Default)

```bash
# Dynamic HTML is disabled by default
./scripts/setup.sh --demo=automail

# Or explicitly disable
./scripts/setup.sh --demo=automail --enable_dynamic_html=false
```

### Combined Options

```bash
# Custom ports with dynamic HTML
./scripts/setup.sh \
  --demo=automail \
  --web_port=8005 \
  --webs_port=8090 \
  --enable_dynamic_html=true

# Deploy all with custom base port and dynamic HTML
./scripts/setup.sh \
  --demo=all \
  --web_port=9000 \
  --enable_dynamic_html=true
```

---

## 📊 Available Options Table

| Option | Description | Default | Values |
|--------|-------------|---------|--------|
| `--demo=NAME` | Select demo to deploy | `all` | movies, books, autozone, autodining, autocrm, automail, autoconnect, all |
| `--web_port=PORT` | Base web server port | `8000` | Any available port |
| `--postgres_port=PORT` | Base PostgreSQL port | `5434` | Any available port |
| `--webs_port=PORT` | webs_server API port | `8090` | Any available port |
| `--webs_postgres=PORT` | webs_server DB port | `5437` | Any available port |
| `--enable_dynamic_html=BOOL` | **Enable dynamic HTML** | `false` | `true` or `false` |
| `-y, --yes` | Skip confirmation prompts | - | Flag only |

---

## 🔍 How It Works

### 1. Variable Flow

```
CLI Argument (--enable_dynamic_html=true)
    ↓
Parsed by setup.sh
    ↓
Set as environment variable
    ↓
Passed to docker-compose
    ↓
Used by Dockerfile ARG
    ↓
Set as ENV in container
    ↓
Read by Next.js app
```

### 2. Integration with Docker

The variable flows through the Docker build process:

**docker-compose.yml:**
```yaml
build:
  args:
    ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML:-false}
environment:
  - ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}
  - NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML:-false}
```

**Dockerfile:**
```dockerfile
ARG ENABLE_DYNAMIC_HTML=false
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
```

**next.config.js:**
```javascript
env: {
  ENABLE_DYNAMIC_HTML: process.env.ENABLE_DYNAMIC_HTML,
  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML,
}
```

---

## 📚 Updated Documentation

### 1. scripts/setup.sh
- ✅ Added header documentation with all options
- ✅ Added usage examples
- ✅ Added ENABLE_DYNAMIC_HTML parameter

### 2. readme.md (Root README)
- ✅ Added "Available Setup Options" table
- ✅ Added "Enable Dynamic HTML" section
- ✅ Added examples with dynamic HTML
- ✅ Explained what dynamic HTML does
- ✅ Added testing examples

---

## 🧪 Testing

### Verify It's Working

1. **Check script help:**
   ```bash
   head -n 20 scripts/setup.sh
   ```

2. **Deploy with dynamic HTML:**
   ```bash
   ./scripts/setup.sh --demo=automail --enable_dynamic_html=true
   ```

3. **Check container environment:**
   ```bash
   docker compose -p automail_8005 exec web env | grep DYNAMIC
   ```

4. **Test in browser:**
   ```
   http://localhost:8005/?seed=1
   http://localhost:8005/?seed=180
   http://localhost:8005/?seed=200
   ```

5. **Verify dynamic attributes:**
   - Open DevTools
   - Inspect any button
   - Should see `data-seed`, `data-variant`, etc.

---

## ✨ Benefits

### For Deployment
- ✅ Single command to enable dynamic HTML
- ✅ Works with all deployment modes (single demo or all)
- ✅ Consistent across all supported projects
- ✅ No need to modify individual project configs

### For Development
- ✅ Easy to toggle for testing
- ✅ Clear documentation in script header
- ✅ Integrates with existing port configuration
- ✅ No code changes needed

### For Production
- ✅ Disabled by default (safe)
- ✅ Explicit opt-in required
- ✅ Works with Docker builds
- ✅ Proper environment variable propagation

---

## 📝 Summary

**Changes Made:**
- Modified 1 file: `scripts/setup.sh`
- Updated 1 file: `readme.md`
- Added ~20 lines of code
- Added documentation header
- Updated configuration display

**Affected Projects:**
- ✅ web_6_automail (has dynamic HTML)
- ✅ web_9_autoconnect (has dynamic HTML)
- ⚪ Other projects (parameter ignored if not implemented)

**Backward Compatibility:**
- ✅ All existing commands still work
- ✅ Default behavior unchanged (disabled)
- ✅ No breaking changes
- ✅ Optional parameter

---

## 🎉 Result

The `scripts/setup.sh` now fully supports the `--enable_dynamic_html` parameter, allowing easy deployment of AutoMail and AutoConnect with dynamic HTML anti-scraping features enabled through a single command-line flag!

**Quick Start:**
```bash
# Deploy AutoMail with dynamic HTML protection
./scripts/setup.sh --demo=automail --enable_dynamic_html=true

# Deploy all demos with dynamic HTML protection
./scripts/setup.sh --demo=all --enable_dynamic_html=true
```

The variable is properly propagated through:
1. ✅ Bash script
2. ✅ Docker Compose
3. ✅ Dockerfile
4. ✅ Next.js config
5. ✅ React components

Everything is ready for deployment! 🚀

