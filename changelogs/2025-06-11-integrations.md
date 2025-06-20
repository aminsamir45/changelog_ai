---
date: 2025-06-11
commits: 4
repository: changelog_ai
versionType: minor
versionConfidence: 80
generated: 2025-06-11T15:30:00.000Z
title: "New Integrations: Slack, Teams & Webhooks"
whatsNew: "Connect your changelog workflow with popular collaboration tools. New integrations with Slack, Microsoft Teams, and custom webhooks let you automatically share updates with your team."
impact: "Teams stay informed automatically without checking the changelog manually. Custom webhooks enable integration with any tool in your workflow, from project management to customer support systems."
upgrade: "Integrations are available in your account settings. Slack and Teams apps can be installed with one click."
related: "More integrations coming soon including Discord, Linear, and Notion. Vote for your preferred integrations in our feedback portal."
---

# New Integrations: Slack, Teams & Webhooks

## What's new

Connect your changelog workflow with popular collaboration tools. New integrations with Slack, Microsoft Teams, and custom webhooks let you automatically share updates with your team.

## Impact

Teams stay informed automatically without checking the changelog manually. Custom webhooks enable integration with any tool in your workflow, from project management to customer support systems.

## Changes

### ✨ Features

- **Slack Integration**: Rich changelog notifications with one-click installation
- **Microsoft Teams Integration**: Adaptive cards with interactive changelog summaries  
- **Custom Webhooks**: Flexible webhook system with custom payloads and retry logic
- **Smart Filtering**: Choose which types of changes trigger notifications
- **Template Customization**: Customize notification format and content for each channel

### 🚀 Improvements

- **Instant Notifications**: Near real-time delivery within 30 seconds of publication
- **Rich Formatting**: Beautiful formatted messages with proper changelog sections
- **Thread Support**: Follow-up notifications appear as replies in Slack/Teams threads
- **Batch Notifications**: Optionally group multiple changes into digest notifications

## Upgrade

Integrations are available in your account settings. Slack and Teams apps can be installed with one click.

**Setup steps:**
1. Go to Settings → Integrations
2. Click "Connect" for your preferred platform
3. Authorize the app and choose notification preferences
4. Test the integration with a sample notification

## Related changes

More integrations coming soon including Discord, Linear, and Notion. Vote for your preferred integrations in our feedback portal.

---

## Commit Details

- **int123a**: feat: Add Slack integration with rich notifications and threading
- **int456b**: feat: Implement Microsoft Teams integration with adaptive cards
- **int789c**: feat: Build flexible webhook system with custom payloads
- **int012d**: feat: Add smart filtering and notification customization 