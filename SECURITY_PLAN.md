# 🔒 PRNI Security Hardening Plan

**Priority: CRITICAL** - This site will face targeted cyberattacks.

---

## 📋 Executive Summary

This document outlines a comprehensive security hardening plan for the PRNI website. Given the politically sensitive nature of the site, we must assume sophisticated adversaries including:
- State-sponsored hackers
- Hacktivists
- DDoS botnets
- Automated vulnerability scanners

---

## 🚨 Phase 1: Rate Limiting (CRITICAL)

### Why
Protects against:
- Brute force login attacks
- API abuse
- Contact form spam
- DDoS at application layer

### Implementation
- Install `@upstash/ratelimit` for serverless rate limiting
- Apply limits to: `/api/auth/*`, `/api/contact`, `/api/admin/*`
- Limits: 5 login attempts/min, 10 contact submissions/hour, 100 API calls/min

---

## 🛡️ Phase 2: CSRF Protection

### Why
Prevents attackers from tricking admin into performing actions via malicious links.

### Implementation
- Generate CSRF tokens server-side
- Validate on all state-changing operations
- Double-submit cookie pattern

---

## 🔐 Phase 3: Security Headers (CRITICAL)

### Headers to Implement
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 🧹 Phase 4: Input Sanitization

### Areas
- All form inputs (contact, admin forms)
- URL parameters
- Markdown content (prevent XSS)
- Search queries

### Implementation
- Strengthen Zod schemas with stricter patterns
- Sanitize HTML in markdown (already using rehype-sanitize)
- Escape all user-generated content in templates

---

## 👮 Phase 5: Admin Hardening (CRITICAL)

### 5.1 Two-Factor Authentication (2FA)
- TOTP-based (Google Authenticator, Authy)
- Required for all admin logins
- Backup codes for recovery

### 5.2 IP Allowlisting
- Restrict admin panel to specific IPs
- Configurable via environment variable

### 5.3 Session Security
- Short session lifetime (1 hour)
- Secure, HttpOnly, SameSite cookies
- Session invalidation on password change
- Single session per account

### 5.4 Audit Logging
- Log all admin actions with timestamp, IP, action
- Store in database
- Alert on suspicious patterns

---

## 🗄️ Phase 6: Database Security

### 6.1 Prisma Protection
- Prisma already prevents SQL injection via parameterized queries ✅
- Never use raw SQL with user input

### 6.2 Data Encryption
- Encrypt sensitive fields at rest
- Use bcrypt for password hashing (already implemented) ✅

### 6.3 Database Access
- Use connection pooling
- Rotate credentials regularly
- Restrict database network access

---

## 🌐 Phase 7: DDoS Protection (CRITICAL)

### Recommended: Cloudflare
1. **Free Tier** provides:
   - Basic DDoS mitigation
   - SSL/TLS
   - CDN caching

2. **Pro Tier ($20/mo)** adds:
   - WAF (Web Application Firewall)
   - Under Attack Mode
   - Advanced DDoS protection

3. **Business Tier** for:
   - 100% uptime SLA
   - Custom WAF rules
   - Priority support

### Alternative: Vercel Edge
- Edge Functions for rate limiting
- Geographic blocking if needed

### Setup Steps
1. Move DNS to Cloudflare
2. Enable "Under Attack Mode" during attacks
3. Configure WAF rules for common attacks
4. Set up Page Rules for caching

---

## 📊 Phase 8: Monitoring & Alerting

### Logging
- All authentication attempts
- Admin actions (CRUD operations)
- Error rates
- Response times

### Alerting
- Failed login threshold (5 in 1 minute)
- High error rate
- Unusual traffic patterns
- Database query anomalies

### Tools
- Vercel Analytics (free)
- Sentry for error tracking
- Custom audit log dashboard

---

## 🚀 Implementation Priority

### Week 1 (CRITICAL)
1. ✅ Rate limiting on all API routes
2. ✅ Security headers
3. ✅ Cloudflare setup

### Week 2 (HIGH)
4. ⏳ CSRF protection
5. ⏳ Enhanced input validation
6. ⏳ Admin audit logging

### Week 3 (HIGH)
7. ⏳ 2FA for admin
8. ⏳ IP allowlisting option
9. ⏳ Session hardening

### Week 4 (MEDIUM)
10. ⏳ Monitoring dashboard
11. ⏳ Alerting setup
12. ⏳ Penetration testing

---

## 🔧 Environment Variables (Security)

```env
# Auth (use strong values!)
NEXTAUTH_SECRET=         # 64+ character random string
ADMIN_EMAIL=             # Admin email
ADMIN_PASSWORD=          # 20+ character password with symbols

# Security
RATE_LIMIT_ENABLED=true
ALLOWED_ADMIN_IPS=       # Comma-separated IPs (optional)
CSRF_SECRET=             # 32+ character random string

# 2FA
TOTP_ISSUER=PRNI
TOTP_SECRET_ENCRYPTION_KEY=  # For encrypting TOTP secrets

# Monitoring
SENTRY_DSN=              # Error tracking
AUDIT_LOG_ENABLED=true
```

---

## ⚠️ Emergency Procedures

### Under Active Attack
1. Enable Cloudflare "Under Attack Mode"
2. Check Vercel/server logs for attack vector
3. Block attacking IPs/regions if needed
4. Enable maintenance mode if necessary

### Suspected Breach
1. Rotate all secrets immediately
2. Invalidate all sessions
3. Review audit logs
4. Check for unauthorized changes
5. Notify stakeholders

---

## 📞 Security Contacts

Set up relationships with:
- Cloudflare support
- Vercel support
- Security researcher for periodic audits
- Legal counsel for incident response

---

**Remember: Security is a continuous process, not a one-time setup.**
