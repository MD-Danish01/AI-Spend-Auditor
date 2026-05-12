# PRICING_DATA.md

## 1. Notes

Verified on: 2026-05-10

All pricing is listed in USD. Prices may vary by country, billing cycle, taxes, enterprise contracts, and discounts. Savings shown by AI Spend Auditor are estimates, not guarantees. Pricing should be reverified before production use.

## 2. Pricing assumptions

- Subscription tools use public list pricing as a reference.
- API-direct tools use user-entered monthly spend, not token-level calculation.
- The audit engine uses these prices as context for recommendations, not as a source of billing truth.

## 3. Tool pricing

### Cursor

Source: https://cursor.com/pricing

- Hobby: $0/month
- Pro: $20/month
- Pro+: $60/month
- Ultra: $200/month
- Teams: $40/user/month
- Enterprise: custom pricing

### GitHub Copilot

Source: https://github.com/features/copilot/plans

- Free: $0/month
- Pro: $10/month
- Pro+: $39/month
- Business: $19/user/month
- Enterprise: $39/user/month

### Claude

Source: https://claude.com/pricing

- Free: $0/month
- Pro Monthly: $20/month
- Pro Annual: $17/month
- Max: from $100/month
- Team Standard: $25/user/month monthly, $20/user/month annually
- Team Premium: $125/user/month monthly, $100/user/month annually
- Enterprise: custom/API-rate based
- API direct: usage-based

### ChatGPT

Sources:
- https://chatgpt.com/pricing/
- https://help.openai.com/

- Free: $0/month
- Plus: $20/month
- Pro 5x: $100/month
- Pro 20x: $200/month
- Business: $25/user/month monthly, $20/user/month annually
- Enterprise: custom
- API direct: usage-based

### Gemini

Source: https://gemini.google/subscriptions/

- Pro: $20/month
- Ultra: $250/month
- API direct: usage-based

### v0

Source: https://v0.app/pricing

- Free: $0/month
- Team: $30/user/month
- Business: $100/user/month
- Enterprise: custom

### OpenAI API direct

Source: https://openai.com/api/pricing/

The app uses user-provided monthly spend instead of token-level calculation.

### Anthropic API direct

Sources:
- https://claude.com/pricing
- https://platform.claude.com/docs/en/about-claude/pricing

The app uses user-provided monthly spend instead of token-level calculation.

### Gemini API direct

Source: https://ai.google.dev/gemini-api/docs/pricing

The app uses user-provided monthly spend instead of token-level calculation.

## 4. API spend handling

For API-direct tools, the app does not attempt token-level pricing math. Users provide their actual monthly API spend because costs vary by model choice, token volume, caching, batch usage, and workload profile.

## 5. Why user-entered monthly spend is used

- It reflects the real invoice founders see
- It avoids false precision from token assumptions
- It works across mixed models and routing strategies
- It keeps recommendations grounded in actual spend

## 6. Limitations

- Public list pricing changes frequently
- Enterprise contracts and volume discounts are not reflected
- Regional pricing and taxes can materially change totals
- API pricing varies by model and usage patterns