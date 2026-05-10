# PRICING_DATA.md

Pricing verified on: 2026-05-10  
Currency: USD  
Notes: Prices can vary by country, annual vs monthly billing, taxes, enterprise contracts, and usage limits. For API-direct tools, the audit uses user-provided monthly spend and cites official token pricing as reference.

## Cursor

Source: https://cursor.com/pricing  
Verified: 2026-05-10

- Hobby: $0/month
- Pro: $20/month
- Pro+: $60/month
- Ultra: $200/month
- Teams: $40/user/month
- Enterprise: Custom pricing

Implementation note: The assignment mentions Cursor Business. Cursor’s official page lists “Teams” at $40/user/month, so this app treats Cursor Teams as the Business/team plan equivalent.

## GitHub Copilot

Source: https://github.com/features/copilot/plans  
Additional source: https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/  
Verified: 2026-05-10

- Free: $0/month
- Pro: $10/month
- Pro+: $39/month
- Business: $19/user/month
- Enterprise: $39/user/month

## Claude

Source: https://claude.com/pricing  
Verified: 2026-05-10

- Free: $0/month
- Pro: $20/month when billed monthly
- Max: From $100/month
- Team Standard: $25/user/month when billed monthly; $20/user/month when billed annually
- Team Premium: $125/user/month when billed monthly; $100/user/month when billed annually
- Enterprise: Custom / seat price + usage at API rates
- API direct: Usage-based

Reference Claude API prices from the same pricing page:

- Claude Haiku 4.5: $1/MTok input, $5/MTok output
- Claude Sonnet 4.5: $3/MTok input, $15/MTok output
- Claude Opus 4.5 / 4.6: $5/MTok input, $25/MTok output

## ChatGPT

Source: https://chatgpt.com/pricing/  
Plus source: https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus  
Pro source: https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers  
Business source: https://help.openai.com/en/articles/8792828-what-is-chatgpt-business  
Verified: 2026-05-10

- Free: $0/month
- Plus: $20/month
- Pro 5x: $100/month
- Pro 20x: $200/month
- Business: $25/user/month when billed monthly; $20/user/month when billed annually; minimum 2 users
- Enterprise: Custom pricing
- API direct: Usage-based and billed separately from ChatGPT subscriptions

## OpenAI API direct

Source: https://openai.com/api/pricing/  
Model-specific source: https://developers.openai.com/api/docs/models/gpt-5.1  
Verified: 2026-05-10

The app uses user-provided monthly spend for OpenAI API because real usage depends on token volume and model choice.

Reference model:

- GPT-5.1: $1.25/1M input tokens, $0.125/1M cached input tokens, $10/1M output tokens

## Anthropic API direct

Source: https://claude.com/pricing  
Detailed API source: https://platform.claude.com/docs/en/about-claude/pricing  
Verified: 2026-05-10

The app uses user-provided monthly spend for Anthropic API because real usage depends on token volume and model choice.

Reference model examples:

- Claude Haiku 4.5: $1/MTok input, $5/MTok output
- Claude Sonnet 4.5: $3/MTok input, $15/MTok output
- Claude Opus 4.5 / 4.6: $5/MTok input, $25/MTok output

## Gemini API

Source: https://ai.google.dev/gemini-api/docs/pricing  
Verified: 2026-05-10

The app uses user-provided monthly spend for Gemini API because real usage depends on model choice, token volume, and whether the workload uses standard, batch, or priority pricing.

Reference pricing shown on Google’s pricing page includes paid-tier token pricing such as:

- Input: $0.50/1M tokens for one listed standard tier
- Output: $3/1M tokens for one listed standard tier

## v0

Source: https://v0.app/docs/pricing  
Verified: 2026-05-10

- Free: $0/month
- Team: $30/user/month
- Business: $100/user/month
- Enterprise: Custom pricing