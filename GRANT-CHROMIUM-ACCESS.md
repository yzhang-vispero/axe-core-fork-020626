# How to Grant Network Access to Bundled Chromium

If you want to use Puppeteer's bundled Chromium instead of system Chrome, you need to grant it network access through your firewall/security policies.

## Overview

**Problem:** Your network/firewall blocks Chromium executables downloaded by npm packages (like Puppeteer) from making outbound connections.

**Solution:** Add firewall rules or security exceptions to allow Chromium network access.

---

## Option 1: Windows Firewall (Recommended)

### Step 1: Locate Chromium Executable

Puppeteer's Chromium is typically located at:
```
C:\Users\<username>\AppData\Local\npm-cache\_npx\<hash>\node_modules\puppeteer\.local-chromium\win64-<revision>\chrome-win\chrome.exe
```

Or in your node_modules:
```
<project>\node_modules\puppeteer\.local-chromium\win64-<revision>\chrome-win\chrome.exe
```

To find it, run:
```bash
node -e "console.log(require('puppeteer').executablePath())"
```

### Step 2: Open Windows Firewall with Advanced Security

1. Press `Win + R`
2. Type: `wf.msc`
3. Press Enter

### Step 3: Create Outbound Rule

1. Click **"Outbound Rules"** in left panel
2. Click **"New Rule..."** in right panel (Actions)
3. Select **"Program"** → Next
4. Select **"This program path:"** → Browse to Chromium executable
5. Select **"Allow the connection"** → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name it: "Puppeteer Chromium - Outbound"
8. Click Finish

### Step 4: Create Inbound Rule (if needed)

Repeat steps above but:
- Select **"Inbound Rules"** in step 1
- Name it: "Puppeteer Chromium - Inbound"

---

## Option 2: Windows Defender Firewall (Simple)

### Via Command Line (Run as Administrator):

```powershell
# Find Chromium path first
$chromiumPath = node -e "console.log(require('puppeteer').executablePath())"

# Add firewall rule
netsh advfirewall firewall add rule name="Puppeteer Chromium" dir=out action=allow program="$chromiumPath" enable=yes

# Verify
netsh advfirewall firewall show rule name="Puppeteer Chromium"
```

### Via Control Panel:

1. Open **Control Panel** → **System and Security** → **Windows Defender Firewall**
2. Click **"Allow an app or feature through Windows Defender Firewall"**
3. Click **"Change settings"** (requires admin)
4. Click **"Allow another app..."**
5. Browse to Chromium executable
6. Check both **Private** and **Public** networks
7. Click **Add**

---

## Option 3: Corporate/Endpoint Security

If you're using corporate endpoint security (CrowdStrike, Carbon Black, etc.):

### Step 1: Check Your Security Software

Look for running services:
```powershell
Get-Service | Where-Object {$_.DisplayName -match "CrowdStrike|Carbon|Symantec|McAfee"}
```

### Step 2: Request Exception from IT

Contact your IT department with this information:

**Subject:** Request Application Network Access Exception

**Details:**
- Application: Chromium (Puppeteer browser automation)
- Executable Path: `<path from step 1 above>`
- Purpose: Automated web accessibility testing
- Required Access: HTTPS outbound (ports 443, 80)
- Business Justification: Required for accessibility compliance testing

---

## Option 4: Tailscale ACL (If Using Tailscale)

Your system uses Tailscale VPN. Check Tailscale policies:

### Step 1: Check Tailscale Admin Console

1. Go to: https://login.tailscale.com/admin/acls
2. Look for exit node policies or application restrictions

### Step 2: Modify ACL (if you have admin access)

Add to your ACL:
```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["autogroup:members"],
      "dst": ["autogroup:internet:*"]
    }
  ]
}
```

### Step 3: Or Request from Tailscale Admin

Ask your Tailscale network admin to allow browser automation traffic.

---

## Option 5: Proxy Configuration (Alternative)

If direct access isn't allowed, configure Puppeteer to use your corporate proxy:

```javascript
const browser = await puppeteer.launch({
  args: [
    '--proxy-server=http://your-proxy:port',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
});
```

To find your proxy:
```bash
netsh winhttp show proxy
```

---

## Verification

After granting access, test with this script:

```javascript
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    console.log('✅ SUCCESS:', await page.title());
    await browser.close();
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
})();
```

Save as `test-chromium.js` and run:
```bash
node test-chromium.js
```

---

## Important Security Note

**Why IT might block bundled Chromium:**
- Prevents unauthorized browser automation
- Stops malware using headless browsers
- Enforces security boundaries
- Prevents data exfiltration

**When requesting access:**
- Explain legitimate business need
- Propose limiting to specific development machines
- Offer to use system Chrome instead (already approved)
- Consider using the `live-scan.js` approach (uses allowed Chrome.exe)

---

## Recommended Approach

**Don't fight the security policy.** Instead:

✅ **Use `live-scan.js`** which uses system Chrome (already allowed)

This is:
- Easier (no IT approval needed)
- Faster (no firewall config)
- More secure (uses approved browser)
- More reliable (system Chrome stays updated)

The bundled Chromium approach is only needed if:
- You need a specific Chromium version
- You need portable/containerized setup
- System Chrome isn't available

---

## Summary

**Quick Win:** Use system Chrome (`live-scan.js`) ← Do this

**If you really need bundled Chromium:**
1. Find Chromium path: `node -e "console.log(require('puppeteer').executablePath())"`
2. Add to Windows Firewall: `wf.msc` → Outbound Rules → New Rule
3. Or contact IT for security exception

**For corporate networks:**
- Talk to your IT security team
- Provide business justification
- Consider using approved alternatives
