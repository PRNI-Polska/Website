# 🔐 PRNI Security Checklist

Use this checklist before and after deployment to ensure maximum security.

---

## ✅ Pre-Deployment Checklist

### Environment Variables
- [ ] `NEXTAUTH_SECRET` is a strong random string (64+ characters)
- [ ] `ADMIN_PASSWORD` is strong (20+ chars, mixed case, numbers, symbols)
- [ ] `DATABASE_URL` uses secure connection (SSL in production)
- [ ] No secrets committed to git (check `.gitignore`)
- [ ] `.env` file has restrictive permissions (600)

### Code Security
- [x] Rate limiting enabled on all API routes
- [x] Security headers configured (CSP, HSTS, etc.)
- [x] Input validation on all forms (Zod schemas)
- [x] XSS prevention via rehype-sanitize for Markdown
- [x] CSRF protection (SameSite cookies)
- [x] SQL injection prevented (Prisma ORM)
- [x] Session timeout reduced to 1 hour

### Authentication
- [x] Brute force protection (5 attempts/minute lockout)
- [x] Secure password hashing (bcrypt with salt rounds = 12)
- [x] JWT tokens expire after 1 hour
- [ ] Consider enabling 2FA (future enhancement)

---

## 🌐 Cloudflare Setup (CRITICAL for DDoS Protection)

### Basic Setup (Free)
1. [ ] Create Cloudflare account
2. [ ] Add your domain
3. [ ] Update nameservers at your registrar
4. [ ] Enable "Always Use HTTPS"
5. [ ] Set SSL mode to "Full (strict)"
6. [ ] Enable "Auto Minify" for performance

### Security Settings
1. [ ] Security Level: "High" or "Under Attack" if needed
2. [ ] Enable Bot Fight Mode
3. [ ] Enable Browser Integrity Check
4. [ ] Enable Email Address Obfuscation
5. [ ] Block known bad countries (if applicable)

### Firewall Rules (Free - 5 rules)
```
Rule 1: Block known bad ASNs
Rule 2: Challenge requests without User-Agent
Rule 3: Rate limit login page (beyond app-level)
Rule 4: Block requests with suspicious headers
Rule 5: Allow only your country (if applicable)
```

### WAF Rules (Pro plan - $20/mo)
- [ ] Enable OWASP Core Ruleset
- [ ] Enable Cloudflare Specials
- [ ] Custom rules for political site threats

---

## 🚀 Vercel Deployment Security

### Project Settings
- [ ] Enable "Secure Headers" in project settings
- [ ] Set environment variables (never in code)
- [ ] Enable "Deployment Protection" for previews
- [ ] Restrict deployment to specific branches

### Domain Settings
- [ ] Use custom domain with Cloudflare proxy
- [ ] Verify SSL certificate is valid
- [ ] Enable HSTS preload

---

## 📊 Monitoring Setup

### Vercel Analytics
- [ ] Enable Web Analytics (free)
- [ ] Set up Slack/email alerts for errors

### Sentry (Error Tracking)
- [ ] Create Sentry project
- [ ] Add `SENTRY_DSN` to environment
- [ ] Configure alert rules

### Uptime Monitoring
- [ ] Set up UptimeRobot or Pingdom
- [ ] Monitor: homepage, admin login, contact API
- [ ] Alert on 5+ minute downtime

---

## 🔴 Emergency Procedures

### Under Active Attack
1. [ ] Enable Cloudflare "Under Attack Mode"
2. [ ] Check logs for attack patterns
3. [ ] Block attacking IPs/regions
4. [ ] Contact Cloudflare support if Pro+

### Suspected Breach
1. [ ] Rotate `NEXTAUTH_SECRET` immediately
2. [ ] Change admin password
3. [ ] Regenerate database credentials
4. [ ] Review audit logs
5. [ ] Check for unauthorized content changes

### Recovery
1. [ ] Restore from Vercel/database backups
2. [ ] Conduct post-incident review
3. [ ] Update security measures

---

## 🔄 Regular Security Tasks

### Weekly
- [ ] Review access logs for suspicious activity
- [ ] Check for failed login attempts
- [ ] Verify backups are working

### Monthly
- [ ] Update npm dependencies (`npm audit fix`)
- [ ] Review and rotate secrets
- [ ] Test disaster recovery procedure

### Quarterly
- [ ] Security audit of new code
- [ ] Penetration testing (if budget allows)
- [ ] Review Cloudflare analytics

---

## 📞 Security Contacts

### Cloudflare Support
- Free: Community forums
- Pro+: support@cloudflare.com

### Vercel Support
- support@vercel.com

### Security Researcher
- Consider hiring for periodic audits

---

## 🛡️ Additional Recommendations

### For High-Profile Political Sites

1. **DDoS Protection**: Minimum Cloudflare Pro ($20/mo)
2. **Legal Team**: For incident response
3. **Security Consultant**: Quarterly audits
4. **Backup Hosting**: Have a static fallback site ready
5. **Social Media Monitoring**: Detect coordinated attacks early

### Budget Recommendations
| Threat Level | Monthly Budget | Services |
|-------------|----------------|----------|
| Low | $0 | Cloudflare Free |
| Medium | $20 | Cloudflare Pro |
| High | $200+ | Cloudflare Business + Sentry + Security Audit |
| Critical | $1000+ | Enterprise DDoS + 24/7 SOC |

---

**Remember: Security is not a one-time task. Regular monitoring and updates are essential.**
