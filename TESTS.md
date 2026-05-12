# TESTS.md

## 1. Testing overview

The most important business logic lives in the deterministic audit engine under `lib/audit-engine/`, so the first test coverage focuses on `calculateAudit()` and the savings logic it produces.

## 2. How to run tests

```bash
npm test
```

## 3. Test file location

- `tests/audit-engine.test.ts`

## 4. What the tests cover

- High API spend triggers high-savings lead qualification logic
- Low spend does not manufacture large savings
- Extra paid seats create a savings recommendation
- Overlapping tools create a review recommendation
- Annual savings are calculated from monthly savings

## 5. Why these tests matter

- Audit math should be deterministic
- Savings estimates should not be random
- Low-spend users should get honest results
- API spend recommendations should be consistent
- Annual savings must match monthly savings × 12

## 6. Manual testing checklist

- Submit form
- Check public report URL
- Refresh public report
- Open report in incognito
- Submit lead form
- Confirm lead saved
- Confirm email sent
- Verify fallback summary by disabling Groq key

## 7. CI

GitHub Actions runs:

- `npm run lint`
- `npm test`
- `npm run build`
